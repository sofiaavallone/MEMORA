import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GeminiServiceError, JsonParsingError } from '../errors/index.js'

// vi.hoisted garante que as fns existem antes do vi.mock ser içado
const { mockGenerateContent, mockFilesUpload, mockFilesGet, mockFilesDelete } = vi.hoisted(() => ({
  mockGenerateContent: vi.fn(),
  mockFilesUpload: vi.fn(),
  mockFilesGet: vi.fn(),
  mockFilesDelete: vi.fn(),
}))

vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn(function (this: Record<string, unknown>) {
    this.models = { generateContent: mockGenerateContent }
    this.files = {
      upload: mockFilesUpload,
      get: mockFilesGet,
      delete: mockFilesDelete,
    }
  }),
  createPartFromUri: vi.fn(function () { return {} }),
  createUserContent: vi.fn(function (parts: unknown) { return parts }),
}))

// Importar após os mocks para garantir que o módulo use a versão mockada
const { GeminiService } = await import('../services/GeminiService.js')

describe('GeminiService', () => {
  let service: InstanceType<typeof GeminiService>

  beforeEach(() => {
    process.env.GEMINI_API_KEY = 'test-api-key'
    vi.clearAllMocks()
    service = new GeminiService()
  })

  // generateFlashcardsFromPrompt

  describe('generateFlashcardsFromPrompt', () => {
    describe('retorno válido', () => {
      it('parseia array JSON direto em Flashcard[]', async () => {
        const payload = [
          { pergunta: 'O que é React?', resposta: 'Uma biblioteca JavaScript para UIs.' },
          { pergunta: 'O que é TypeScript?', resposta: 'JavaScript com tipagem estática.' },
        ]
        mockGenerateContent.mockResolvedValue({ text: JSON.stringify(payload) })

        const result = await service.generateFlashcardsFromPrompt('React e TypeScript')

        expect(result).toEqual(payload)
      })

      it('parseia JSON envolto em bloco markdown ```json```', async () => {
        const payload = [{ pergunta: 'Pergunta', resposta: 'Resposta' }]
        const wrapped = `\`\`\`json\n${JSON.stringify(payload)}\n\`\`\``
        mockGenerateContent.mockResolvedValue({ text: wrapped })

        const result = await service.generateFlashcardsFromPrompt('tema')

        expect(result).toEqual(payload)
      })

      it('retorna apenas os campos pergunta e resposta (descarta extras)', async () => {
        const payload = [{ pergunta: 'Q', resposta: 'A', campo_extra: 'ignorado' }]
        mockGenerateContent.mockResolvedValue({ text: JSON.stringify(payload) })

        const result = await service.generateFlashcardsFromPrompt('tema')

        expect(result[0]).toEqual({ pergunta: 'Q', resposta: 'A' })
      })

      it('remove espaços em branco das bordas de pergunta e resposta', async () => {
        const payload = [{ pergunta: '  Pergunta  ', resposta: '  Resposta  ' }]
        mockGenerateContent.mockResolvedValue({ text: JSON.stringify(payload) })

        const result = await service.generateFlashcardsFromPrompt('tema')

        expect(result[0]).toEqual({ pergunta: 'Pergunta', resposta: 'Resposta' })
      })
    })

    describe('resposta malformada da IA', () => {
      it('lança JsonParsingError quando a resposta não é JSON válido', async () => {
        mockGenerateContent.mockResolvedValue({ text: 'Aqui estão seus flashcards sobre React...' })

        await expect(service.generateFlashcardsFromPrompt('React')).rejects.toThrow(JsonParsingError)
      })

      it('lança JsonParsingError quando a resposta é JSON mas não é array', async () => {
        mockGenerateContent.mockResolvedValue({
          text: JSON.stringify({ pergunta: 'Q', resposta: 'A' }),
        })

        await expect(service.generateFlashcardsFromPrompt('tema')).rejects.toThrow(JsonParsingError)
      })

      it('lança JsonParsingError quando um item do array não tem os campos obrigatórios', async () => {
        const payload = [{ question: 'Q', answer: 'A' }]
        mockGenerateContent.mockResolvedValue({ text: JSON.stringify(payload) })

        await expect(service.generateFlashcardsFromPrompt('tema')).rejects.toThrow(JsonParsingError)
      })

      it('lança JsonParsingError quando pergunta está vazia após trim', async () => {
        const payload = [{ pergunta: '   ', resposta: 'Resposta válida' }]
        mockGenerateContent.mockResolvedValue({ text: JSON.stringify(payload) })

        await expect(service.generateFlashcardsFromPrompt('tema')).rejects.toThrow(JsonParsingError)
      })

      it('lança JsonParsingError quando resposta está vazia após trim', async () => {
        const payload = [{ pergunta: 'Pergunta válida', resposta: '' }]
        mockGenerateContent.mockResolvedValue({ text: JSON.stringify(payload) })

        await expect(service.generateFlashcardsFromPrompt('tema')).rejects.toThrow(JsonParsingError)
      })

      it('lança GeminiServiceError quando a IA retorna resposta vazia', async () => {
        mockGenerateContent.mockResolvedValue({ text: '' })

        await expect(service.generateFlashcardsFromPrompt('tema')).rejects.toThrow(GeminiServiceError)
      })

      it('não derruba o servidor — o erro é instância de GeminiServiceError (classe base)', async () => {
        mockGenerateContent.mockResolvedValue({ text: 'texto livre sem JSON' })

        const error = await service.generateFlashcardsFromPrompt('tema').catch((e) => e)

        expect(error).toBeInstanceOf(GeminiServiceError)
      })
    })

    describe('falha na API do Gemini', () => {
      it('lança GeminiServiceError quando a API lança erro de rede', async () => {
        mockGenerateContent.mockRejectedValue(new Error('fetch failed: ECONNREFUSED'))

        await expect(service.generateFlashcardsFromPrompt('tema')).rejects.toThrow(GeminiServiceError)
      })

      it('preserva o erro original como cause', async () => {
        const cause = new Error('Network failure')
        mockGenerateContent.mockRejectedValue(cause)

        const error = await service.generateFlashcardsFromPrompt('tema').catch((e) => e)

        expect(error).toBeInstanceOf(GeminiServiceError)
        expect(error.cause).toBe(cause)
      })

      it('não relança o erro original diretamente (sempre envolve em GeminiServiceError)', async () => {
        mockGenerateContent.mockRejectedValue(new TypeError('Cannot read property'))

        const error = await service.generateFlashcardsFromPrompt('tema').catch((e) => e)

        expect(error).toBeInstanceOf(GeminiServiceError)
        expect(error).not.toBeInstanceOf(TypeError)
      })
    })
  })
})
