'use client'

import { useCallback } from 'react'
import { Box, Flex, IconButton, Text, Input } from '@chakra-ui/react'

export type FitMode = 'width' | 'page' | null

export interface PDFToolbarProps {
  currentPage: number
  numPages: number
  zoom: number
  fitMode: FitMode
  onPageChange: (page: number) => void
  onZoomChange: (zoom: number) => void
  onFitModeChange: (mode: FitMode) => void
  onToggleExpand: () => void
  expanded: boolean
}

const MIN_ZOOM = 50
const MAX_ZOOM = 200
const ZOOM_STEP = 10

function ChevronLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ZoomOutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 7h4M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function ZoomInIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 7h4M7 5v4M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function FitWidthIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 4h12M2 12h12M1 8h3M12 8h3M4 6.5l-2 1.5 2 1.5M12 6.5l2 1.5-2 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function FitPageIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="3" y="2" width="10" height="12" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <path d="M6 6h4M6 8.5h4M6 11h2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  )
}

function ExpandIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CollapseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M6 2v4H2M10 2v4h4M14 10h-4v4M2 10h4v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function PDFToolbar({
  currentPage,
  numPages,
  zoom,
  fitMode,
  onPageChange,
  onZoomChange,
  onFitModeChange,
  onToggleExpand,
  expanded,
}: PDFToolbarProps) {
  const handlePrev = useCallback(() => {
    if (currentPage > 1) onPageChange(currentPage - 1)
  }, [currentPage, onPageChange])

  const handleNext = useCallback(() => {
    if (currentPage < numPages) onPageChange(currentPage + 1)
  }, [currentPage, numPages, onPageChange])

  const handlePageInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseInt(e.target.value, 10)
      if (!isNaN(val) && val >= 1 && val <= numPages) {
        onPageChange(val)
      }
    },
    [numPages, onPageChange],
  )

  const handleZoomOut = useCallback(() => {
    const next = Math.max(zoom - ZOOM_STEP, MIN_ZOOM)
    onFitModeChange(null)
    onZoomChange(next)
  }, [zoom, onZoomChange, onFitModeChange])

  const handleZoomIn = useCallback(() => {
    const next = Math.min(zoom + ZOOM_STEP, MAX_ZOOM)
    onFitModeChange(null)
    onZoomChange(next)
  }, [zoom, onZoomChange, onFitModeChange])

  const handleFitWidth = useCallback(() => {
    onFitModeChange(fitMode === 'width' ? null : 'width')
  }, [fitMode, onFitModeChange])

  const handleFitPage = useCallback(() => {
    onFitModeChange(fitMode === 'page' ? null : 'page')
  }, [fitMode, onFitModeChange])

  return (
    <Flex
      bg="bg.glass"
      backdropFilter="blur(12px)"
      border="1px solid"
      borderColor="border.subtle"
      borderRadius="full"
      px="3"
      py="1.5"
      gap="1"
      alignItems="center"
      flexWrap="wrap"
      justifyContent="center"
      data-testid="pdf-toolbar"
    >
      {/* Page navigation */}
      <Flex alignItems="center" gap="1">
        <IconButton
          aria-label="Previous page"
          size="xs"
          variant="ghost"
          borderRadius="full"
          onClick={handlePrev}
          disabled={currentPage <= 1}
        >
          <ChevronLeftIcon />
        </IconButton>

        <Box position="relative" display="inline-flex" alignItems="center">
          <Input
            aria-label="Page number"
            type="number"
            value={currentPage}
            onChange={handlePageInput}
            size="xs"
            textAlign="center"
            w="40px"
            min={1}
            max={numPages}
            borderRadius="md"
            fontFamily="mono"
            fontSize="xs"
          />
        </Box>

        <Text fontSize="xs" color="text.muted" fontFamily="mono" whiteSpace="nowrap">
          of {numPages}
        </Text>

        <IconButton
          aria-label="Next page"
          size="xs"
          variant="ghost"
          borderRadius="full"
          onClick={handleNext}
          disabled={currentPage >= numPages}
        >
          <ChevronRightIcon />
        </IconButton>
      </Flex>

      {/* Divider */}
      <Box h="16px" w="1px" bg="border.subtle" mx="1" display={{ base: 'none', sm: 'block' }} />

      {/* Zoom controls */}
      <Flex alignItems="center" gap="1">
        <IconButton
          aria-label="Zoom out"
          size="xs"
          variant="ghost"
          borderRadius="full"
          onClick={handleZoomOut}
          disabled={zoom <= MIN_ZOOM}
        >
          <ZoomOutIcon />
        </IconButton>

        <Text fontSize="xs" color="text.secondary" fontFamily="mono" minW="36px" textAlign="center">
          {zoom}%
        </Text>

        <IconButton
          aria-label="Zoom in"
          size="xs"
          variant="ghost"
          borderRadius="full"
          onClick={handleZoomIn}
          disabled={zoom >= MAX_ZOOM}
        >
          <ZoomInIcon />
        </IconButton>
      </Flex>

      {/* Divider */}
      <Box h="16px" w="1px" bg="border.subtle" mx="1" display={{ base: 'none', sm: 'block' }} />

      {/* Fit modes */}
      <Flex alignItems="center" gap="1">
        <IconButton
          aria-label="Fit width"
          size="xs"
          variant={fitMode === 'width' ? 'solid' : 'ghost'}
          borderRadius="full"
          onClick={handleFitWidth}
          bg={fitMode === 'width' ? 'action.primary' : undefined}
          color={fitMode === 'width' ? 'action.primary.text' : undefined}
        >
          <FitWidthIcon />
        </IconButton>

        <IconButton
          aria-label="Fit page"
          size="xs"
          variant={fitMode === 'page' ? 'solid' : 'ghost'}
          borderRadius="full"
          onClick={handleFitPage}
          bg={fitMode === 'page' ? 'action.primary' : undefined}
          color={fitMode === 'page' ? 'action.primary.text' : undefined}
        >
          <FitPageIcon />
        </IconButton>
      </Flex>

      {/* Divider */}
      <Box h="16px" w="1px" bg="border.subtle" mx="1" display={{ base: 'none', sm: 'block' }} />

      {/* Expand/collapse */}
      <IconButton
        aria-label={expanded ? 'Collapse viewer' : 'Expand viewer'}
        size="xs"
        variant="ghost"
        borderRadius="full"
        onClick={onToggleExpand}
      >
        {expanded ? <CollapseIcon /> : <ExpandIcon />}
      </IconButton>
    </Flex>
  )
}
