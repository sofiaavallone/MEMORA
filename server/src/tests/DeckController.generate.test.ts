import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { Request, Response } from 'express'
import {
  GeminiServiceError,
  FileProcessingTimeoutError,
  PromptValidationError,
} from '../errors/index.js'

// Mock do prisma antes de importar o controller
vi.mock('../lib/prisma.js', () => ({
  prisma: {
    deck: {
      create: vi.fn().mockResolvedValue({
        id: 'deck-abc',
        title: 'React',
        topic: 'React',
        color: 'purple',
        sourceName: null,
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
        flashcards: [
          {
            id: 'card-1',
            question: 'O que é React?',
            answer: 'Biblioteca JS.',
            mastered: false,
            order: 0,
            nextReviewAt: new Date('2026-01-02'),
            interval: 1,
            correctCount: 0,
          },
        ],
        _count: { flashcards: 1, sessions: 0 },
      }),
    },
  },
}))

const { DeckController } = await import('../controllers/DeckController.js')
const { FlashcardService } = await import('../services/FlashcardService.js')

// helpers

function buildReqRes(body: Record<string, unknown>, userId = 'user-test') {
  const jsonFn = vi.fn()
  const sendFn = vi.fn()
  const statusFn = vi.fn(() => ({ json: jsonFn, send: sendFn }))

  const req = { body, userId, params: {} } as unknown as Request
  const res = { status: statusFn } as unknown as Response

  return { req, res, statusFn, jsonFn }
}

const VALID_BODY = { topic: 'React Hooks', quantity: 10 }

// testes

describe('DeckController.generate', () => {
  let mockService: { generate: ReturnType<typeof vi.fn> }
  let controller: InstanceType<typeof DeckController>

  beforeEach(() => {
    vi.clearAllMocks()
    mockService = { generate: vi.fn() }
    controller = new DeckController(mockService as unknown as InstanceType<typeof FlashcardService>)
  })

  describe('corpo da requisição inválido', () => {
    it('retorna 400 quando topic está ausente', async () => {
      const { req, res, statusFn, jsonFn } = buildReqRes({ quantity: 10 })

      await controller.generate(req, res)

      expect(statusFn).toHaveBeenCalledWith(400)
      expect(jsonFn).toHaveBeenCalledWith(expect.objectContaining({ error: expect.any(String) }))
    })

    it('retorna 400 quando topic tem menos de 3 caracteres', async () => {
      const { req, res, statusFn } = buildReqRes({ topic: 'AI', quantity: 10 })

      await controller.generate(req, res)

      expect(statusFn).toHaveBeenCalledWith(400)
    })

    it('retorna 400 quando quantity está fora do intervalo permitido (> 50)', async () => {
      const { req, res, statusFn } = buildReqRes({ topic: 'React', quantity: 99 })

      await controller.generate(req, res)

      expect(statusFn).toHaveBeenCalledWith(400)
    })
  })

  describe('geração bem-sucedida', () => {
    it('retorna 201 com o deck quando flashcards são gerados', async () => {
      mockService.generate.mockResolvedValue([{ pergunta: 'Q', resposta: 'A' }])
      const { req, res, statusFn, jsonFn } = buildReqRes(VALID_BODY)

      await controller.generate(req, res)

      expect(statusFn).toHaveBeenCalledWith(201)
      expect(jsonFn).toHaveBeenCalledWith(expect.objectContaining({ deck: expect.any(Object) }))
    })

    it('o deck retornado contém os campos essenciais', async () => {
      mockService.generate.mockResolvedValue([{ pergunta: 'Q', resposta: 'A' }])
      const { req, res, jsonFn } = buildReqRes(VALID_BODY)

      await controller.generate(req, res)

      const { deck } = jsonFn.mock.lastCall![0] as { deck: Record<string, unknown> }
      expect(deck).toMatchObject({
        id: expect.any(String),
        title: expect.any(String),
        flashcards: expect.any(Array),
      })
    })
  })

  describe('erros da IA — mapeamento para HTTP', () => {
    it('retorna 502 quando GeminiServiceError é lançado (falha na API)', async () => {
      mockService.generate.mockRejectedValue(new GeminiServiceError('API indisponível'))
      const { req, res, statusFn, jsonFn } = buildReqRes(VALID_BODY)

      await controller.generate(req, res)

      expect(statusFn).toHaveBeenCalledWith(502)
      expect(jsonFn).toHaveBeenCalledWith({
        error: 'Falha na comunicação com o serviço de IA.',
      })
    })

    it('retorna 504 quando FileProcessingTimeoutError é lançado (timeout do PDF)', async () => {
      mockService.generate.mockRejectedValue(
        new FileProcessingTimeoutError('Timeout após 20 tentativas')
      )
      const { req, res, statusFn, jsonFn } = buildReqRes(VALID_BODY)

      await controller.generate(req, res)

      expect(statusFn).toHaveBeenCalledWith(504)
      expect(jsonFn).toHaveBeenCalledWith({
        error: 'O processamento do conteúdo excedeu o tempo limite.',
      })
    })

    it('retorna 400 quando PromptValidationError é lançado (prompt inválido)', async () => {
      mockService.generate.mockRejectedValue(new PromptValidationError('Tópico inválido'))
      const { req, res, statusFn, jsonFn } = buildReqRes(VALID_BODY)

      await controller.generate(req, res)

      expect(statusFn).toHaveBeenCalledWith(400)
      expect(jsonFn).toHaveBeenCalledWith({ error: 'Tópico inválido' })
    })

    it('retorna 500 para erros desconhecidos — sem vazar detalhes internos', async () => {
      mockService.generate.mockRejectedValue(new Error('Erro interno inesperado'))
      const { req, res, statusFn, jsonFn } = buildReqRes(VALID_BODY)

      await controller.generate(req, res)

      expect(statusFn).toHaveBeenCalledWith(500)
      // Garante que a mensagem de erro não vaza stack trace ou detalhe interno
      const body = jsonFn.mock.lastCall![0] as { error: string }
      expect(body.error).not.toContain('Erro interno inesperado')
    })

    it('erros da IA nunca chegam como 500 — FileProcessingTimeoutError é sempre 504', async () => {
      mockService.generate.mockRejectedValue(new FileProcessingTimeoutError('timeout'))
      const { req, res, statusFn } = buildReqRes(VALID_BODY)

      await controller.generate(req, res)

      expect(statusFn).not.toHaveBeenCalledWith(500)
      expect(statusFn).toHaveBeenCalledWith(504)
    })
  })
})
