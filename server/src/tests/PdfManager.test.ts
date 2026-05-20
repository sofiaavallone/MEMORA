import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

const { mockReadFile } = vi.hoisted(() => ({ mockReadFile: vi.fn() }))

vi.mock('fs', async () => {
  const actual = await vi.importActual<typeof import('fs')>('fs')
  return {
    ...actual,
    promises: {
      ...actual.promises,
      readFile: mockReadFile,
    },
  }
})

const { PdfManager } = await import('../utils/PdfManager.js')

const MINIMAL_PDF = Buffer.from('%PDF-1.4\n1 0 obj<<>>endobj\n%%EOF', 'utf-8')

function pdfResponse(body: Buffer, contentType = 'application/pdf'): Response {
  const arrayBuffer = body.buffer.slice(body.byteOffset, body.byteOffset + body.byteLength) as ArrayBuffer
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    headers: new Headers({ 'content-type': contentType }),
    arrayBuffer: () => Promise.resolve(arrayBuffer),
  } as unknown as Response
}

describe('PdfManager', () => {
  let manager: InstanceType<typeof PdfManager>
  let fetchMock: ReturnType<typeof vi.fn>
  let warnSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    manager = new PdfManager()
    fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    vi.spyOn(console, 'log').mockImplementation(() => undefined)
    mockReadFile.mockReset()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  describe('loadPdf from Buffer', () => {
    it('wraps buffer into a pdf blob and reports byte size', async () => {
      const result = await manager.loadPdf(MINIMAL_PDF)

      expect(result.source).toBe('buffer')
      expect(result.sizeInBytes).toBe(MINIMAL_PDF.byteLength)
      expect(result.blob.type).toBe('application/pdf')
    })

    it('does not call fetch or fs when input is a buffer', async () => {
      await manager.loadPdf(MINIMAL_PDF)

      expect(fetchMock).not.toHaveBeenCalled()
      expect(mockReadFile).not.toHaveBeenCalled()
    })
  })

  describe('loadPdf from URL', () => {
    it('downloads and returns a pdf blob when content-type is application/pdf', async () => {
      fetchMock.mockResolvedValue(pdfResponse(MINIMAL_PDF))

      const result = await manager.loadPdf('https://example.com/file.pdf')

      expect(fetchMock).toHaveBeenCalledOnce()
      expect(result.source).toBe('url')
      expect(result.sizeInBytes).toBe(MINIMAL_PDF.byteLength)
      expect(result.blob.type).toBe('application/pdf')
    })

    it('rejects with a clear error message when the server responds with 404', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        headers: new Headers(),
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
      } as unknown as Response)

      await expect(manager.loadPdf('https://example.com/missing.pdf'))
        .rejects.toThrow(/404/)
    })

    it('emits a warning but still resolves when content-type is not pdf', async () => {
      fetchMock.mockResolvedValue(pdfResponse(MINIMAL_PDF, 'text/html'))

      const result = await manager.loadPdf('https://example.com/page.html')

      expect(warnSpy).toHaveBeenCalled()
      const warnMessage = String(warnSpy.mock.calls[0]?.[0] ?? '')
      expect(warnMessage).toMatch(/content-type/i)
      expect(warnMessage).toContain('text/html')
      expect(result.source).toBe('url')
    })

    it('propagates AbortError when the download exceeds the timeout', async () => {
      const abortError = new DOMException('The operation was aborted.', 'AbortError')
      fetchMock.mockRejectedValue(abortError)

      await expect(manager.loadPdf('https://example.com/slow.pdf'))
        .rejects.toThrow(/abort/i)
    })
  })

  describe('loadPdf from local file', () => {
    it('reads bytes from disk and returns a pdf blob', async () => {
      mockReadFile.mockResolvedValue(MINIMAL_PDF)

      const result = await manager.loadPdf('./fixtures/sample.pdf')

      expect(mockReadFile).toHaveBeenCalledWith('./fixtures/sample.pdf')
      expect(result.source).toBe('local-file')
      expect(result.sizeInBytes).toBe(MINIMAL_PDF.byteLength)
      expect(result.blob.type).toBe('application/pdf')
    })

    it('rejects with a message that includes the file path when the file is missing', async () => {
      const enoent = Object.assign(new Error('ENOENT: no such file or directory'), { code: 'ENOENT' })
      mockReadFile.mockRejectedValue(enoent)

      await expect(manager.loadPdf('./does-not-exist.pdf'))
        .rejects.toThrow(/does-not-exist\.pdf/)
    })
  })
})
