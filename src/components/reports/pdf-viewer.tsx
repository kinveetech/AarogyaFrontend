'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Document } from 'react-pdf'
import { Box, Flex, Skeleton, Text } from '@chakra-ui/react'
import '@/lib/pdf/setup'
import { usePdfUrl } from '@/hooks/reports/use-pdf-url'
import { PDFPageRenderer } from './pdf-page-renderer'
import { PDFToolbar, type FitMode } from './pdf-toolbar'
import { EmptyStateView } from '@/components/ui/empty-state'

export interface PDFViewerProps {
  reportId: string
  fileType: string
  expanded: boolean
  onToggleExpand: () => void
}

function ErrorIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path d="M24 8L4 42h40L24 8z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M24 20v10M24 34v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function DocumentIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <rect x="10" y="4" width="28" height="40" rx="3" stroke="currentColor" strokeWidth="2" />
      <path d="M18 16h12M18 22h12M18 28h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

/** Default width (px) for zoom=100% */
const BASE_WIDTH = 612

export function PDFViewer({
  reportId,
  fileType,
  expanded,
  onToggleExpand,
}: PDFViewerProps) {
  const isPdf = fileType === 'application/pdf'
  const { url, isLoading: urlLoading, error: urlError, refresh } = usePdfUrl(reportId, isPdf)

  const [numPages, setNumPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [zoom, setZoom] = useState(100)
  const [fitMode, setFitMode] = useState<FitMode>(null)
  const [docError, setDocError] = useState(false)

  const [containerWidth, setContainerWidth] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Track container width for fit-width mode
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const observer = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const handleDocumentLoadSuccess = useCallback(({ numPages: n }: { numPages: number }) => {
    setNumPages(n)
    setDocError(false)
  }, [])

  const handleDocumentLoadError = useCallback(() => {
    setDocError(true)
  }, [])

  // Compute page width from zoom and fit mode
  const pageWidth =
    fitMode === 'width' && containerWidth > 0
      ? containerWidth - 32 // 16px padding each side
      : Math.round(BASE_WIDTH * (zoom / 100))

  // Scroll to page when currentPage changes via toolbar
  const scrollToPage = useCallback((page: number) => {
    const el = containerRef.current?.querySelector(`[data-testid="pdf-page-container-${page}"]`)
    el?.scrollIntoView?.({ behavior: 'smooth', block: 'start' })
  }, [])

  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page)
      scrollToPage(page)
    },
    [scrollToPage],
  )

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }

      switch (e.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault()
          setCurrentPage((p) => {
            const next = Math.max(p - 1, 1)
            scrollToPage(next)
            return next
          })
          break
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault()
          setCurrentPage((p) => {
            const next = Math.min(p + 1, numPages)
            scrollToPage(next)
            return next
          })
          break
        case '+':
        case '=':
          e.preventDefault()
          setFitMode(null)
          setZoom((z) => Math.min(z + 10, 200))
          break
        case '-':
          e.preventDefault()
          setFitMode(null)
          setZoom((z) => Math.max(z - 10, 50))
          break
        case '0':
          e.preventDefault()
          setFitMode(null)
          setZoom(100)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [numPages, scrollToPage])

  // Non-PDF files
  if (!isPdf) {
    return (
      <Flex
        bg="bg.overlay"
        borderRadius="xl"
        border="1px solid"
        borderColor="border.subtle"
        minH="200px"
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
        gap="3"
        p="6"
        data-testid="pdf-viewer-unsupported"
      >
        <Flex color="text.muted" opacity={0.5}>
          <DocumentIcon />
        </Flex>
        <Text fontSize="sm" color="text.muted">
          Preview not available for this file type.
        </Text>
      </Flex>
    )
  }

  // URL loading
  if (urlLoading) {
    return (
      <Box data-testid="pdf-viewer-loading">
        <Skeleton height="40px" borderRadius="full" mb="3" />
        <Skeleton height="400px" borderRadius="xl" />
      </Box>
    )
  }

  // URL error
  if (urlError || !url) {
    return (
      <Box data-testid="pdf-viewer-error">
        <EmptyStateView
          icon={<ErrorIcon />}
          title="Could not load PDF"
          description="The download URL could not be retrieved. Please try again."
          action={{ label: 'Retry', onClick: refresh }}
        />
      </Box>
    )
  }

  // Document error
  if (docError) {
    return (
      <Box data-testid="pdf-viewer-doc-error">
        <EmptyStateView
          icon={<ErrorIcon />}
          title="Could not render PDF"
          description="The PDF file could not be loaded. It may be corrupted or in an unsupported format."
          action={{ label: 'Retry', onClick: refresh }}
        />
      </Box>
    )
  }

  return (
    <Box data-testid="pdf-viewer">
      {/* Toolbar */}
      {numPages > 0 && (
        <Box mb="3" position="sticky" top="0" zIndex="10">
          <PDFToolbar
            currentPage={currentPage}
            numPages={numPages}
            zoom={zoom}
            fitMode={fitMode}
            onPageChange={handlePageChange}
            onZoomChange={setZoom}
            onFitModeChange={setFitMode}
            onToggleExpand={onToggleExpand}
            expanded={expanded}
          />
        </Box>
      )}

      {/* Scrollable page container */}
      <Box
        ref={containerRef}
        overflowY="auto"
        overflowX="auto"
        maxH={expanded ? '80vh' : '500px'}
        borderRadius="xl"
        border="1px solid"
        borderColor="border.subtle"
        bg="bg.overlay"
        p="4"
      >
        <Document
          file={url}
          onLoadSuccess={handleDocumentLoadSuccess}
          onLoadError={handleDocumentLoadError}
          loading={
            <Flex direction="column" gap="3" data-testid="pdf-document-loading">
              <Skeleton height="400px" borderRadius="md" />
            </Flex>
          }
        >
          <Flex direction="column" gap="4" alignItems="center">
            {Array.from({ length: numPages }, (_, i) => (
              <PDFPageRenderer
                key={i + 1}
                pageNumber={i + 1}
                width={pageWidth}
              />
            ))}
          </Flex>
        </Document>
      </Box>
    </Box>
  )
}
