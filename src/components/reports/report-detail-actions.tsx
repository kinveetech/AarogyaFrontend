'use client'

import { Button, Flex } from '@chakra-ui/react'

export interface ReportDetailActionsProps {
  onDownload: () => void
  onDelete: () => void
  downloading: boolean
}

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 2v8m0 0l-3-3m3 3l3-3M3 12h10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M5.5 2h5M2.5 4h11M12 4l-.5 8.5a1 1 0 01-1 .5H5.5a1 1 0 01-1-.5L4 4m3 3v4m2-4v4"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ShareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M11 5.5a2 2 0 100-4 2 2 0 000 4zM5 10a2 2 0 100-4 2 2 0 000 4zM11 14.5a2 2 0 100-4 2 2 0 000 4zM6.8 8.9l2.4 1.7M9.2 5.4L6.8 7.1"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function ReportDetailActions({
  onDownload,
  onDelete,
  downloading,
}: ReportDetailActionsProps) {
  return (
    <Flex gap="3" mt="6" flexWrap="wrap">
      <Button
        borderRadius="full"
        bg="action.primary"
        color="action.primary.text"
        onClick={onDownload}
        loading={downloading}
        disabled={downloading}
      >
        <DownloadIcon />
        Download Report
      </Button>
      <Button
        borderRadius="full"
        variant="outline"
        color="coral.400"
        borderColor="coral.400"
        css={{ _dark: { color: 'coral.300', borderColor: 'coral.300' } }}
        onClick={onDelete}
      >
        <TrashIcon />
        Delete Report
      </Button>
      <Button borderRadius="full" variant="ghost" disabled title="Coming Soon">
        <ShareIcon />
        Share
      </Button>
    </Flex>
  )
}
