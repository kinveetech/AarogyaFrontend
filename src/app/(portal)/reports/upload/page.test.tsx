import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, userEvent, waitFor } from '@/test/render'
import ReportUploadPage from './page'

// Mock next/navigation
const pushMock = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}))

// Mock fetch
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

// Mock XMLHttpRequest for S3 upload
type EventHandler = ((event: Partial<ProgressEvent>) => void) | null

class MockXMLHttpRequest {
  static instances: MockXMLHttpRequest[] = []
  static autoComplete = true

  status = 0
  upload = {
    onprogress: null as EventHandler,
  }
  onload: (() => void) | null = null
  onerror: (() => void) | null = null
  onabort: (() => void) | null = null

  headers: Record<string, string> = {}
  sentBody: unknown = null
  aborted = false

  constructor() {
    MockXMLHttpRequest.instances.push(this)
  }

  open() {}

  setRequestHeader(key: string, value: string) {
    this.headers[key] = value
  }

  send(body: unknown) {
    this.sentBody = body
    if (MockXMLHttpRequest.autoComplete) {
      setTimeout(() => {
        this.upload.onprogress?.({ lengthComputable: true, loaded: 50, total: 100 })
        this.status = 200
        this.onload?.()
      }, 0)
    }
  }

  abort() {
    this.aborted = true
    this.onabort?.()
  }
}

vi.stubGlobal('XMLHttpRequest', MockXMLHttpRequest)

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function createFile(name = 'blood-report.pdf', type = 'application/pdf') {
  const content = new Uint8Array(64)
  const file = new File([content], name, { type })
  Object.defineProperty(file, 'size', { value: 1024 })
  return file
}

beforeEach(() => {
  mockFetch.mockReset()
  pushMock.mockReset()
  MockXMLHttpRequest.instances = []
  MockXMLHttpRequest.autoComplete = true
})

async function uploadFileToDropzone(container: HTMLElement) {
  const file = createFile()
  const input = container.querySelector<HTMLInputElement>('input[type="file"]')!
  await userEvent.upload(input, file)
  return file
}

describe('ReportUploadPage', () => {
  it('renders the page title and step indicator', () => {
    render(<ReportUploadPage />)
    expect(screen.getByText('Upload Report')).toBeInTheDocument()
    expect(screen.getByText('Select File')).toBeInTheDocument()
    expect(screen.getByText('Details')).toBeInTheDocument()
    // "Upload" appears both as step label and as button text
    expect(screen.getByText('Upload', { selector: 'p' })).toBeInTheDocument()
  })

  it('starts on step 1 with file dropzone', () => {
    render(<ReportUploadPage />)
    expect(screen.getByText('Drag & drop your file here')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
  })

  it('navigates to /reports when Cancel clicked with no file', async () => {
    render(<ReportUploadPage />)
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(pushMock).toHaveBeenCalledWith('/reports')
  })

  it('shows confirm dialog when Cancel clicked with file selected', async () => {
    const { container } = render(<ReportUploadPage />)
    await uploadFileToDropzone(container)

    await waitFor(() => {
      expect(screen.getByText('blood-report.pdf')).toBeInTheDocument()
    })

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    await waitFor(() => {
      expect(screen.getByText('Discard upload?')).toBeInTheDocument()
    })
  })

  it('navigates away after confirming cancel dialog', async () => {
    const { container } = render(<ReportUploadPage />)
    await uploadFileToDropzone(container)

    await waitFor(() => {
      expect(screen.getByText('blood-report.pdf')).toBeInTheDocument()
    })

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    await waitFor(() => {
      expect(screen.getByText('Discard upload?')).toBeInTheDocument()
    })

    await userEvent.click(screen.getByRole('button', { name: 'Discard' }))

    expect(pushMock).toHaveBeenCalledWith('/reports')
  })

  it('advances to step 2 after file selection and Next click', async () => {
    const { container } = render(<ReportUploadPage />)
    await uploadFileToDropzone(container)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Next' })).not.toBeDisabled()
    })

    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    await waitFor(() => {
      expect(screen.getByLabelText('Report Type')).toBeInTheDocument()
    })
  })

  it('goes back to step 1 when Back clicked on step 2', async () => {
    const { container } = render(<ReportUploadPage />)
    await uploadFileToDropzone(container)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Next' })).not.toBeDisabled()
    })

    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    await waitFor(() => {
      expect(screen.getByLabelText('Report Type')).toBeInTheDocument()
    })

    await userEvent.click(screen.getByRole('button', { name: 'Back' }))

    await waitFor(() => {
      expect(screen.getByText('blood-report.pdf')).toBeInTheDocument()
    })
  })

  it('runs full upload flow and shows success', async () => {
    mockFetch
      .mockResolvedValueOnce(
        jsonResponse({
          uploadUrl: 'https://s3.example.com/presigned',
          objectKey: 'uploads/abc123.pdf',
          expiresAt: '2026-12-31T00:00:00Z',
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          id: 'report-1',
          title: 'Report #1',
          reportType: 'blood_test',
          status: 'pending',
          reportDate: '2026-02-22',
          labName: 'City Medical Lab',
          doctorName: null,
          notes: null,
          highlightParameter: null,
          createdAt: '2026-02-22T10:00:00Z',
          updatedAt: '2026-02-22T10:00:00Z',
        }),
      )

    const { container } = render(<ReportUploadPage />)
    await uploadFileToDropzone(container)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Next' })).not.toBeDisabled()
    })

    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    await waitFor(() => {
      expect(screen.getByLabelText('Report Type')).toBeInTheDocument()
    })

    await userEvent.click(screen.getByRole('button', { name: /Upload/i }))

    await waitFor(() => {
      expect(screen.getByText('Report uploaded!')).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: 'View Report' })).toBeInTheDocument()
  })

  it('navigates to report detail on View Report click', async () => {
    mockFetch
      .mockResolvedValueOnce(
        jsonResponse({
          uploadUrl: 'https://s3.example.com/presigned',
          objectKey: 'uploads/abc123.pdf',
          expiresAt: '2026-12-31T00:00:00Z',
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          id: 'report-42',
          title: 'Report #42',
          reportType: 'blood_test',
          status: 'pending',
          reportDate: '2026-02-22',
          labName: 'City Medical Lab',
          doctorName: null,
          notes: null,
          highlightParameter: null,
          createdAt: '2026-02-22T10:00:00Z',
          updatedAt: '2026-02-22T10:00:00Z',
        }),
      )

    const { container } = render(<ReportUploadPage />)
    await uploadFileToDropzone(container)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Next' })).not.toBeDisabled()
    })

    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    await waitFor(() => {
      expect(screen.getByLabelText('Report Type')).toBeInTheDocument()
    })

    await userEvent.click(screen.getByRole('button', { name: /Upload/i }))

    await waitFor(() => {
      expect(screen.getByText('Report uploaded!')).toBeInTheDocument()
    })

    await userEvent.click(screen.getByRole('button', { name: 'View Report' }))
    expect(pushMock).toHaveBeenCalledWith('/reports/report-42')
  })

  it('shows error state when presigned URL fetch fails', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ message: 'Error' }, 500))

    const { container } = render(<ReportUploadPage />)
    await uploadFileToDropzone(container)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Next' })).not.toBeDisabled()
    })

    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    await waitFor(() => {
      expect(screen.getByLabelText('Report Type')).toBeInTheDocument()
    })

    await userEvent.click(screen.getByRole('button', { name: /Upload/i }))

    await waitFor(() => {
      expect(screen.getByText('Upload failed')).toBeInTheDocument()
    })

    expect(screen.getByText('Failed to get upload URL. Please try again.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument()
  })

  it('shows error state when S3 upload fails', async () => {
    MockXMLHttpRequest.autoComplete = false

    mockFetch.mockResolvedValueOnce(
      jsonResponse({
        uploadUrl: 'https://s3.example.com/presigned',
        objectKey: 'uploads/abc123.pdf',
        expiresAt: '2026-12-31T00:00:00Z',
      }),
    )

    const { container } = render(<ReportUploadPage />)
    await uploadFileToDropzone(container)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Next' })).not.toBeDisabled()
    })

    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    await waitFor(() => {
      expect(screen.getByLabelText('Report Type')).toBeInTheDocument()
    })

    await userEvent.click(screen.getByRole('button', { name: /Upload/i }))

    // Wait for XHR to be created then simulate error
    await waitFor(() => {
      expect(MockXMLHttpRequest.instances.length).toBeGreaterThan(0)
    })

    const xhr = MockXMLHttpRequest.instances[MockXMLHttpRequest.instances.length - 1]
    xhr.status = 403
    xhr.onload?.()

    await waitFor(() => {
      expect(screen.getByText('Upload failed')).toBeInTheDocument()
    })
  })

  it('retries upload after error', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ message: 'Error' }, 500))

    const { container } = render(<ReportUploadPage />)
    await uploadFileToDropzone(container)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Next' })).not.toBeDisabled()
    })

    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    await waitFor(() => {
      expect(screen.getByLabelText('Report Type')).toBeInTheDocument()
    })

    await userEvent.click(screen.getByRole('button', { name: /Upload/i }))

    await waitFor(() => {
      expect(screen.getByText('Upload failed')).toBeInTheDocument()
    })

    // Retry: now succeed
    mockFetch
      .mockResolvedValueOnce(
        jsonResponse({
          uploadUrl: 'https://s3.example.com/presigned',
          objectKey: 'uploads/abc123.pdf',
          expiresAt: '2026-12-31T00:00:00Z',
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          id: 'report-1',
          title: 'Report #1',
          reportType: 'blood_test',
          status: 'pending',
          reportDate: '2026-02-22',
          labName: 'City Medical Lab',
          doctorName: null,
          notes: null,
          highlightParameter: null,
          createdAt: '2026-02-22T10:00:00Z',
          updatedAt: '2026-02-22T10:00:00Z',
        }),
      )

    await userEvent.click(screen.getByRole('button', { name: 'Retry' }))

    await waitFor(() => {
      expect(screen.getByText('Report uploaded!')).toBeInTheDocument()
    })
  })
})
