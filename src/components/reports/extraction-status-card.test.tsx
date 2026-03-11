import { describe, it, expect, vi } from 'vitest'
import { render, screen, userEvent } from '@/test/render'
import {
  ExtractionStatusCard,
  ExtractionStatusSkeleton,
  type ExtractionStatusCardProps,
} from './extraction-status-card'

const defaultProps: ExtractionStatusCardProps = {
  status: 'completed',
  extractionMethod: 'ocr',
  structuringModel: 'gpt-4o',
  extractedParameterCount: 12,
  overallConfidence: 0.95,
  pageCount: 3,
  extractedAt: '2025-06-15T10:30:00Z',
  errorMessage: null,
  attemptCount: 1,
  onTriggerExtraction: vi.fn(),
  isTriggerPending: false,
}

function renderCard(overrides: Partial<ExtractionStatusCardProps> = {}) {
  const props = { ...defaultProps, ...overrides }
  return render(<ExtractionStatusCard {...props} />)
}

describe('ExtractionStatusCard', () => {
  it('renders the card with title and status badge', () => {
    renderCard()

    expect(screen.getByTestId('extraction-status-card')).toBeInTheDocument()
    expect(screen.getByText('AI Extraction')).toBeInTheDocument()
    expect(screen.getByText('Completed')).toBeInTheDocument()
  })

  it('displays extraction method', () => {
    renderCard()
    expect(screen.getByText('Method')).toBeInTheDocument()
    expect(screen.getByText('OCR')).toBeInTheDocument()
  })

  it('displays structuring model', () => {
    renderCard()
    expect(screen.getByText('Model')).toBeInTheDocument()
    expect(screen.getByText('gpt-4o')).toBeInTheDocument()
  })

  it('displays extracted parameter count', () => {
    renderCard()
    expect(screen.getByText('Parameters')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
  })

  it('displays confidence as percentage', () => {
    renderCard()
    expect(screen.getByText('Confidence')).toBeInTheDocument()
    expect(screen.getByText('95%')).toBeInTheDocument()
  })

  it('displays page count', () => {
    renderCard()
    expect(screen.getByText('Pages')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('displays extracted date', () => {
    renderCard({ extractedAt: '2025-06-15T10:30:00Z' })
    expect(screen.getByText('Extracted')).toBeInTheDocument()
  })

  it('displays attempt count', () => {
    renderCard()
    expect(screen.getByText('Attempts')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('shows Re-extract button for completed status', () => {
    renderCard({ status: 'completed' })
    expect(screen.getByRole('button', { name: /Re-extract/i })).toBeInTheDocument()
  })

  it('shows Re-extract button for failed status', () => {
    renderCard({ status: 'failed', errorMessage: 'Parse error' })
    expect(screen.getByRole('button', { name: /Re-extract/i })).toBeInTheDocument()
  })

  it('does not show Re-extract button for pending status', () => {
    renderCard({ status: 'pending' })
    expect(screen.queryByRole('button', { name: /Re-extract/i })).not.toBeInTheDocument()
  })

  it('does not show Re-extract button for processing status', () => {
    renderCard({ status: 'processing' })
    expect(screen.queryByRole('button', { name: /Re-extract/i })).not.toBeInTheDocument()
  })

  it('calls onTriggerExtraction when Re-extract is clicked', async () => {
    const onTrigger = vi.fn()
    renderCard({ status: 'failed', errorMessage: 'Error', onTriggerExtraction: onTrigger })

    await userEvent.click(screen.getByRole('button', { name: /Re-extract/i }))
    expect(onTrigger).toHaveBeenCalledTimes(1)
  })

  it('shows progress indicator for pending status', () => {
    renderCard({ status: 'pending' })
    expect(screen.getByTestId('extraction-progress')).toBeInTheDocument()
    expect(screen.getByText(/queued/i)).toBeInTheDocument()
  })

  it('shows progress indicator for processing status', () => {
    renderCard({ status: 'processing' })
    expect(screen.getByTestId('extraction-progress')).toBeInTheDocument()
    expect(screen.getByText(/Extracting parameters/i)).toBeInTheDocument()
  })

  it('does not show progress indicator for completed status', () => {
    renderCard({ status: 'completed' })
    expect(screen.queryByTestId('extraction-progress')).not.toBeInTheDocument()
  })

  it('shows error message for failed status', () => {
    renderCard({ status: 'failed', errorMessage: 'Unable to parse document' })
    expect(screen.getByTestId('extraction-error')).toBeInTheDocument()
    expect(screen.getByText('Unable to parse document')).toBeInTheDocument()
  })

  it('does not show error alert when no error message', () => {
    renderCard({ status: 'failed', errorMessage: null })
    expect(screen.queryByTestId('extraction-error')).not.toBeInTheDocument()
  })

  it('hides method when null', () => {
    renderCard({ extractionMethod: null })
    expect(screen.queryByText('Method')).not.toBeInTheDocument()
  })

  it('hides model when null', () => {
    renderCard({ structuringModel: null })
    expect(screen.queryByText('Model')).not.toBeInTheDocument()
  })

  it('hides parameters when count is 0', () => {
    renderCard({ extractedParameterCount: 0 })
    expect(screen.queryByText('Parameters')).not.toBeInTheDocument()
  })

  it('hides confidence when null', () => {
    renderCard({ overallConfidence: null })
    expect(screen.queryByText('Confidence')).not.toBeInTheDocument()
  })

  it('hides page count when null', () => {
    renderCard({ pageCount: null })
    expect(screen.queryByText('Pages')).not.toBeInTheDocument()
  })

  it('hides extracted date when null', () => {
    renderCard({ extractedAt: null })
    expect(screen.queryByText('Extracted')).not.toBeInTheDocument()
  })

  it('hides attempts when count is 0', () => {
    renderCard({ attemptCount: 0 })
    expect(screen.queryByText('Attempts')).not.toBeInTheDocument()
  })

  it('displays native_text method label correctly', () => {
    renderCard({ extractionMethod: 'native_text' })
    expect(screen.getByText('Native Text')).toBeInTheDocument()
  })

  it('displays hybrid method label correctly', () => {
    renderCard({ extractionMethod: 'hybrid' })
    expect(screen.getByText('Hybrid')).toBeInTheDocument()
  })

  it('formats low confidence correctly', () => {
    renderCard({ overallConfidence: 0.42 })
    expect(screen.getByText('42%')).toBeInTheDocument()
  })
})

describe('ExtractionStatusSkeleton', () => {
  it('renders skeleton with test id', () => {
    render(<ExtractionStatusSkeleton />)
    expect(screen.getByTestId('extraction-status-skeleton')).toBeInTheDocument()
  })
})
