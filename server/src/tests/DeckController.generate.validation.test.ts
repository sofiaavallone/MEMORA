import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { Request, Response } from 'express'

vi.mock('../lib/prisma.js', () => ({
  prisma: {
    deck: {
      create: vi.fn().mockResolvedValue({
        id: 'deck-1',
        title: 'tema valido',
        topic: 'tema valido',
        color: 'purple',
        sourceName: null,
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
        flashcards: [],
        _count: { flashcards: 0, sessions: 0 },
      }),
    },
  },
}))

const { DeckController } = await import('../controllers/DeckController.js')
const { FlashcardService } = await import('../services/FlashcardService.js')

function makeReqRes(body: unknown) {
  const json = vi.fn()
  const send = vi.fn()
  const status = vi.fn(() => ({ json, send }))
  const req = { body, userId: 'u1', params: {} } as unknown as Request
  const res = { status } as unknown as Response
  return { req, res, status, json }
}

function buildController() {
  const service = { generate: vi.fn().mockResolvedValue([]) }
  const controller = new DeckController(service as unknown as InstanceType<typeof FlashcardService>)
  return { controller, service }
}

describe('DeckController.generate input validation', () => {
  let controller: ReturnType<typeof buildController>['controller']
  let service: ReturnType<typeof buildController>['service']

  beforeEach(() => {
    vi.clearAllMocks()
    ;({ controller, service } = buildController())
  })

  it('rejects an empty body', async () => {
    const { req, res, status, json } = makeReqRes({})
    await controller.generate(req, res)
    expect(status).toHaveBeenCalledWith(400)
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.any(String) }))
    expect(service.generate).not.toHaveBeenCalled()
  })

  it('rejects when topic is missing', async () => {
    const { req, res, status } = makeReqRes({ quantity: 10 })
    await controller.generate(req, res)
    expect(status).toHaveBeenCalledWith(400)
  })

  it('rejects an empty topic string', async () => {
    const { req, res, status } = makeReqRes({ topic: '', quantity: 10 })
    await controller.generate(req, res)
    expect(status).toHaveBeenCalledWith(400)
  })

  it('rejects a topic that is only whitespace', async () => {
    const { req, res, status } = makeReqRes({ topic: '     ', quantity: 10 })
    await controller.generate(req, res)
    expect(status).toHaveBeenCalledWith(400)
  })

  it('rejects topics shorter than the minimum length', async () => {
    const { req, res, status, json } = makeReqRes({ topic: 'AI', quantity: 10 })
    await controller.generate(req, res)
    expect(status).toHaveBeenCalledWith(400)
    const body = json.mock.lastCall?.[0] as { error: string }
    expect(body.error).toMatch(/3 caracteres/i)
  })

  it('rejects when quantity is missing', async () => {
    const { req, res, status } = makeReqRes({ topic: 'React Hooks' })
    await controller.generate(req, res)
    expect(status).toHaveBeenCalledWith(400)
  })

  it('rejects quantity zero', async () => {
    const { req, res, status } = makeReqRes({ topic: 'React Hooks', quantity: 0 })
    await controller.generate(req, res)
    expect(status).toHaveBeenCalledWith(400)
  })

  it('rejects negative quantity', async () => {
    const { req, res, status } = makeReqRes({ topic: 'React Hooks', quantity: -5 })
    await controller.generate(req, res)
    expect(status).toHaveBeenCalledWith(400)
  })

  it('rejects quantity below the minimum (4)', async () => {
    const { req, res, status } = makeReqRes({ topic: 'React Hooks', quantity: 4 })
    await controller.generate(req, res)
    expect(status).toHaveBeenCalledWith(400)
  })

  it('rejects quantity above the maximum (51)', async () => {
    const { req, res, status } = makeReqRes({ topic: 'React Hooks', quantity: 51 })
    await controller.generate(req, res)
    expect(status).toHaveBeenCalledWith(400)
  })

  it('rejects non-integer quantity', async () => {
    const { req, res, status } = makeReqRes({ topic: 'React Hooks', quantity: 3.5 })
    await controller.generate(req, res)
    expect(status).toHaveBeenCalledWith(400)
  })

  it('rejects a malformed pdfUrl', async () => {
    const { req, res, status, json } = makeReqRes({
      topic: 'React Hooks',
      quantity: 10,
      pdfUrl: 'not-a-real-url',
    })
    await controller.generate(req, res)
    expect(status).toHaveBeenCalledWith(400)
    const body = json.mock.lastCall?.[0] as { error: string }
    expect(body.error).toMatch(/url/i)
  })

  it('accepts a valid body without pdfUrl', async () => {
    const { req, res, status } = makeReqRes({ topic: 'React Hooks', quantity: 10 })
    await controller.generate(req, res)
    expect(status).toHaveBeenCalledWith(201)
    expect(service.generate).toHaveBeenCalledWith({ topic: 'React Hooks', quantity: 10 })
  })

  it('accepts a valid body with pdfUrl', async () => {
    const { req, res, status } = makeReqRes({
      topic: 'React Hooks',
      quantity: 10,
      pdfUrl: 'https://example.com/material.pdf',
    })
    await controller.generate(req, res)
    expect(status).toHaveBeenCalledWith(201)
    expect(service.generate).toHaveBeenCalledWith({
      topic: 'React Hooks',
      quantity: 10,
      pdfUrl: 'https://example.com/material.pdf',
    })
  })
})
