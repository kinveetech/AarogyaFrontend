'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { Page } from 'react-pdf'
import { Box, Skeleton } from '@chakra-ui/react'

/** Letter-size aspect ratio (8.5 × 11) for placeholder height */
const LETTER_ASPECT = 11 / 8.5

export interface PDFPageRendererProps {
  pageNumber: number
  width: number
}

export function PDFPageRenderer({ pageNumber, width }: PDFPageRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [rendered, setRendered] = useState(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(el)
        }
      },
      { rootMargin: '200px 0px' },
    )

    observer.observe(el)

    return () => {
      observer.disconnect()
    }
  }, [])

  const handleRenderSuccess = useCallback(() => {
    setRendered(true)
  }, [])

  const placeholderHeight = Math.round(width * LETTER_ASPECT)

  return (
    <Box
      ref={containerRef}
      position="relative"
      minH={`${placeholderHeight}px`}
      data-testid={`pdf-page-container-${pageNumber}`}
    >
      {isVisible ? (
        <>
          {!rendered && (
            <Skeleton
              position="absolute"
              inset="0"
              height={`${placeholderHeight}px`}
              borderRadius="md"
              data-testid={`pdf-page-skeleton-${pageNumber}`}
            />
          )}
          <Page
            pageNumber={pageNumber}
            width={width}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            onRenderSuccess={handleRenderSuccess}
          />
        </>
      ) : (
        <Skeleton
          height={`${placeholderHeight}px`}
          borderRadius="md"
          data-testid={`pdf-page-placeholder-${pageNumber}`}
        />
      )}
    </Box>
  )
}
