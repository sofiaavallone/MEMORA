import "dotenv/config";
import { createPartFromUri, GoogleGenAI } from "@google/genai";

class FlashcardGenerator {
    constructor() {
        this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        this.modelo = "gemini-2.5-flash"; 
    }

    async processPDF(url, filename) {
        try {
            console.log(`[1/3] Downloading ${filename}...`);
            

            const response = await fetch(url, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                }
            });

            
            if (!response.ok) {
                throw new Error(`O site bloqueou o download. Status: ${response.status}`);
            }

            const pdfBuffer = await response.arrayBuffer();
            const fileBlob = new Blob([pdfBuffer], { type: "application/pdf" });

            console.log(`[2/3] Sending to gemini servers...`);
            const file = await this.ai.files.upload({
                file: fileBlob,
                config: { displayName: filename },
            });

            let getFile = await this.ai.files.get({name: file.name });
            while (getFile.state === "PROCESSING") {
                console.log("Waiting for the IA...");
                await new Promise((resolve) => setTimeout(resolve, 5000));
                getFile = await this.ai.files.get({name: file.name });
            }

            if (getFile.state === "FAILED") throw new Error("AI failed to process the document.");
            console.log(`[3/3] Finished!`);
            return getFile;
        } catch (erro) {
            console.error(`Critical error in file: ${erro.message}`);
            throw erro;
        }
    }

    async generate(PDFurl, instruction) {
        try {
            const file = await this.processPDF(PDFurl, "Material de Estudo");
            const pdfContent = createPartFromUri(file.uri, file.mimeType);

            console.log(`Gerando Flashcards em JSON...`);
            const resposta = await this.ai.models.generateContent({
                model: this.modelo, 
                contents: [instruction, pdfContent],
                // A MÁGICA DO JSON ACONTECE AQUI:
                config: {
                    responseMimeType: "application/json",
                }
            });

            return resposta.text;
        } catch (erro) {
            console.error(`Erro ao gerar:`, erro);
            return null;
        }
    }
}

async function testarSistema() {
    const gerador = new FlashcardGenerator();

    // O Prompt à prova de falhas para forçar o JSON exato
    const instrucao = `
    Você é um professor especialista em criar materiais de revisão usando a técnica de Active Recall.
    Analise o documento anexado e gere exatamente 3 flashcards.
    
    A sua resposta DEVE ser estritamente um Array (lista) em formato JSON válido, seguindo exatamente esta estrutura:
    [
      {
        "pergunta": "Escreva a pergunta aqui",
        "resposta": "Escreva a resposta aqui"
      }
    ]
    `;
    
    const linkPDF = "https://www.scielo.br/j/csc/a/qyJNfTzPPzWqZ8GYJm4BjLk/?format=pdf&lang=pt";
    const resultado = await gerador.generate(linkPDF, instrucao);

    console.log("\n=== RESULTADO FINAL ===");
    console.log(resultado);
}

testarSistema();