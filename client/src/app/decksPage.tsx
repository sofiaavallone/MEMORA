import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { DeckCard } from "../components/deckCard";
import { SideBar } from "../components/sideBar";
import { LoginModal } from "../components/loginModal";
import { RegisterModal } from "../components/registerModal";

type Flashcard = {
  question: string;
  answer: string;
};

type Deck = {
  title: string;
  cardsCount: number;
  masteredPercentage: number;
  flashcards: Flashcard[];
};

export function DecksPage() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const decks: Deck[] = [
    {
      title: "Herança",
      cardsCount: 50,
      masteredPercentage: 35,
      flashcards: [
        {
          question: "O que é herança em orientação a objetos?",
          answer: "É o mecanismo que permite que uma classe herde atributos e métodos de outra.",
        },
        {
          question: "Qual palavra-chave representa herança em Java?",
          answer: "A palavra-chave é extends.",
        },
        {
          question: "Uma subclasse pode sobrescrever métodos da superclasse?",
          answer: "Sim, por meio de overriding.",
        },
      ],
    },
    {
      title: "Ponteiros",
      cardsCount: 10,
      masteredPercentage: 92,
      flashcards: [
        {
          question: "O que é um ponteiro?",
          answer: "É uma variável que armazena o endereço de memória de outra variável.",
        },
        {
          question: "Qual operador obtém o endereço de uma variável em C?",
          answer: "O operador &.",
        },
        {
          question: "Qual operador acessa o valor apontado por um ponteiro?",
          answer: "O operador *.",
        },
      ],
    },
    {
      title: "Memória Cache",
      cardsCount: 30,
      masteredPercentage: 68,
      flashcards: [
        {
          question: "Qual a função da memória cache?",
          answer: "Armazenar temporariamente dados de acesso frequente para acelerar o processamento.",
        },
        {
          question: "A cache é mais rápida que a RAM?",
          answer: "Sim, a memória cache é mais rápida que a RAM.",
        },
        {
          question: "Onde a memória cache fica em relação ao processador?",
          answer: "Ela fica muito próxima ou integrada ao processador.",
        },
      ],
    },
    {
      title: "Classes Abstratas",
      cardsCount: 30,
      masteredPercentage: 45,
      flashcards: [
        {
          question: "O que é uma classe abstrata?",
          answer: "É uma classe que não pode ser instanciada diretamente e serve como base para outras classes.",
        },
        {
          question: "Para que servem métodos abstratos?",
          answer: "Eles definem um comportamento que deve ser implementado pelas subclasses.",
        },
        {
          question: "Uma classe abstrata pode ter métodos concretos?",
          answer: "Sim, ela pode ter tanto métodos abstratos quanto métodos com implementação.",
        },
      ]
    },
    {
      title: "Hazards",
      cardsCount: 50,
      masteredPercentage: 22,
      flashcards: [
        {
          question: "O que são hazards em pipeline?",
          answer: "São situações que impedem a execução correta ou eficiente das instruções em pipeline.",
        },
        {
          question: "Quais são os tipos de hazards?",
          answer: "Hazards estruturais, de dados e de controle.",
        },
        {
          question: "O que é um data hazard?",
          answer: "Ocorre quando uma instrução depende do resultado de outra que ainda não foi finalizada.",
        },
      ]
    },
    {
      title: "Limites Laterais",
      cardsCount: 10,
      masteredPercentage: 90,
      flashcards: [
        {
          question: "O que é um limite lateral?",
          answer: "É o valor que uma função se aproxima quando x tende a um ponto pela esquerda ou pela direita.",
        },
        {
          question: "Qual a diferença entre limite pela esquerda e pela direita?",
          answer: "O limite pela esquerda considera valores menores que o ponto, e pela direita valores maiores.",
        },
        {
          question: "Quando um limite existe em um ponto?",
          answer: "Quando os limites laterais à esquerda e à direita são iguais.",
        },
      ]
    },
  ];

  const filteredDecks = useMemo(() => {
    return decks.filter((deck) =>
      deck.title.toLowerCase().includes(search.toLowerCase().trim())
    );
  }, [search]);

  const totalDecks = filteredDecks.length;

  const totalCards = filteredDecks.reduce((acc, deck) => {
    return acc + deck.cardsCount;
  }, 0);

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      <div className="flex">
        <SideBar
          reviewCardsCount={12}
          reviewProgressPercentage={35}
          activeItem="decks"
          onLoginClick={() => setIsLoginModalOpen(true)}
        />

        <main className="flex-1 px-10 py-8">
          <section className="mx-auto w-full max-w-[950px]">
            <div className="flex items-start justify-between">
                <div>
                  <h1 className="font-heading text-[24px] font-semibold text-[#24172b]">
                    Meus Decks
                  </h1>

                  <p className="mt-1 text-[14px] text-[#6b7a99]">
                    {totalDecks} decks · {totalCards} cards 
                  </p>
                </div>

              <button 
                type="button"
                onClick={() => navigate("/")}
                className="flex items-center gap-2 mt-4 rounded-[12px] bg-[#9b4ca0] px-5 py-2.5 text-[14px] font-medium text-white transition-colors duration-200 hover:bg-[#b15bb4]"
              >
                <Plus size={16} />
                Novo Deck
              </button>
            </div>

            <div className="relative mt-6">
              <Search 
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7c89a3]"
              />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar decks..."
                className="h-[42px] w-full rounded-[12px] border border-[#d9dde7] bg-white pl-11 pr-4 text-[14px] text-[#24172b] outline-none placeholder:text-[#7c89a3] focus:ring-2 focus:ring-[#9b4ca0]/20 focus:ring-offset-0.5"
              />
            </div>

            <div className="mt-6 grid grid-cols-3 gap-5">
              {filteredDecks.map((deck) => (
                <DeckCard 
                  key={deck.title}
                  title={deck.title}
                  cardsCount={deck.cardsCount}
                  masteredPercentage={deck.masteredPercentage}
                  onClick={() => navigate("/flashcards", {
                    state: { 
                      deckTitle: deck.title,
                      flashcards: deck.flashcards, 
                    },
                    })
                  }
                />
              ))}
            </div>
          </section>
        </main>
      </div>

      <LoginModal 
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onCreateAccountClick={() => {
          setIsLoginModalOpen(false);
          setIsRegisterModalOpen(true);
        }}
      />

      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onLoginClick={() => {
          setIsRegisterModalOpen(false);
          setIsLoginModalOpen(true);
        }}
      />
    </div>
  );
}