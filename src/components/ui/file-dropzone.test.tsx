import { describe, it, expect, vi } from 'vitest'
import { render, screen, userEvent, waitFor } from '@/test/render'
import { FileDropzone } from './file-dropzone'

function createFile(
  name: string,
  size: number,
  type: string,
): File {
  const content = new Uint8Array(Math.min(size, 64))
  const file = new File([content], name, { type })
  Object.defineProperty(file, 'size', { value: size })
  return file
}

describe('FileDropzone', () => {
  it('renders dropzone with instruction text and browse button', () => {
    render(<FileDropzone />)
    expect(screen.getByText('Drag & drop your file here')).toBeInTheDocument()
    expect(
      screen.getByText('PDF, JPEG, or PNG — up to 50 MB'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Browse files' }),
    ).toBeInTheDocument()
  })

  it('renders a hidden file input', () => {
    const { container } = render(<FileDropzone />)
    const input = container.querySelector('input[type="file"]')
    expect(input).toBeInTheDocument()
  })

  it('calls onFileAccept for a valid PDF', async () => {
    const onFileAccept = vi.fn()
    const { container } = render(
      <FileDropzone onFileAccept={onFileAccept} />,
    )
    const input = container.querySelector<HTMLInputElement>('input[type="file"]')!
    const file = createFile('report.pdf', 1024, 'application/pdf')

    await userEvent.upload(input, file)

    await waitFor(() => {
      expect(onFileAccept).toHaveBeenCalledOnce()
    })
  })

  it('calls onFileAccept for a valid JPEG', async () => {
    const onFileAccept = vi.fn()
    const { container } = render(
      <FileDropzone onFileAccept={onFileAccept} />,
    )
    const input = container.querySelector<HTMLInputElement>('input[type="file"]')!
    const file = createFile('scan.jpg', 2048, 'image/jpeg')

    await userEvent.upload(input, file)

    await waitFor(() => {
      expect(onFileAccept).toHaveBeenCalledOnce()
    })
  })

  it('calls onFileAccept for a valid PNG', async () => {
    const onFileAccept = vi.fn()
    const { container } = render(
      <FileDropzone onFileAccept={onFileAccept} />,
    )
    const input = container.querySelector<HTMLInputElement>('input[type="file"]')!
    const file = createFile('xray.png', 4096, 'image/png')

    await userEvent.upload(input, file)

    await waitFor(() => {
      expect(onFileAccept).toHaveBeenCalledOnce()
    })
  })

  it('calls onFileReject for an oversized file', async () => {
    const onFileReject = vi.fn()
    const { container } = render(
      <FileDropzone onFileReject={onFileReject} />,
    )
    const input = container.querySelector<HTMLInputElement>('input[type="file"]')!
    const file = createFile('huge.pdf', 51 * 1024 * 1024, 'application/pdf')

    await userEvent.upload(input, file)

    await waitFor(() => {
      expect(onFileReject).toHaveBeenCalledOnce()
    })
  })

  it('shows progress bar when uploadProgress is provided', () => {
    render(<FileDropzone uploadProgress={42} />)
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toBeInTheDocument()
    expect(progressBar).toHaveAttribute('aria-valuenow', '42')
  })

  it('does not show progress bar when uploadProgress is undefined', () => {
    render(<FileDropzone />)
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })

  it('shows error message with role="alert"', () => {
    render(<FileDropzone errorMessage="Upload failed" />)
    const alert = screen.getByRole('alert')
    expect(alert).toBeInTheDocument()
    expect(alert).toHaveTextContent('Upload failed')
  })

  it('does not show error message when not provided', () => {
    render(<FileDropzone />)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('disables the browse button when disabled', () => {
    render(<FileDropzone disabled />)
    expect(screen.getByRole('button', { name: 'Browse files' })).toBeDisabled()
  })

  it('passes aria-label to the hidden input', () => {
    const { container } = render(
      <FileDropzone aria-label="Upload medical report" />,
    )
    const input = container.querySelector('input[type="file"]')
    expect(input).toHaveAttribute('aria-label', 'Upload medical report')
  })

  it('shows progress bar at 0%', () => {
    render(<FileDropzone uploadProgress={0} />)
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toHaveAttribute('aria-valuenow', '0')
  })

  it('shows progress bar at 100%', () => {
    render(<FileDropzone uploadProgress={100} />)
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toHaveAttribute('aria-valuenow', '100')
  })
})
