'use client'

import { Box, Button, Flex, HStack, Text } from '@chakra-ui/react'
import { progressGradient } from '@/theme/tokens'

export type UploadStatus = 'uploading' | 'creating' | 'success' | 'error'

export interface UploadStepProgressProps {
  fileName: string
  status: UploadStatus
  progress: number
  errorMessage?: string | null
  onRetry: () => void
  onCancel: () => void
  onViewReport: () => void
}

const STATUS_TEXT: Record<UploadStatus, string> = {
  uploading: 'Uploading...',
  creating: 'Saving report...',
  success: 'Report uploaded!',
  error: 'Upload failed',
}

export function UploadStepProgress({
  fileName,
  status,
  progress,
  errorMessage,
  onRetry,
  onCancel,
  onViewReport,
}: UploadStepProgressProps) {
  return (
    <Box>
      <Flex direction="column" align="center" gap="4" py="4">
        {status === 'success' && <SuccessIcon />}
        {status === 'error' && <ErrorIcon />}

        <Text color="text.primary" fontWeight="medium" fontSize="lg">
          {STATUS_TEXT[status]}
        </Text>

        <Text color="text.muted" fontSize="sm">
          {fileName}
        </Text>

        {(status === 'uploading' || status === 'creating') && (
          <Box w="100%" maxW="400px">
            <Box
              h="6px"
              w="100%"
              borderRadius="full"
              bg="bg.overlay"
              overflow="hidden"
              role="progressbar"
              aria-valuenow={status === 'creating' ? 100 : progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Upload progress"
            >
              <Box
                h="100%"
                w={`${status === 'creating' ? 100 : progress}%`}
                borderRadius="full"
                bgImage={progressGradient}
                transition="width 0.3s ease"
              />
            </Box>
            <Text color="text.muted" fontSize="xs" mt="2" textAlign="center">
              {status === 'creating' ? '100%' : `${progress}%`}
            </Text>
          </Box>
        )}

        {status === 'error' && errorMessage && (
          <Text color="status.error" fontSize="sm" textAlign="center" role="alert">
            {errorMessage}
          </Text>
        )}
      </Flex>

      <HStack justify="center" mt="6" gap="3">
        {status === 'success' && (
          <Button
            borderRadius="full"
            bg="action.primary"
            color="action.primary.text"
            onClick={onViewReport}
          >
            View Report
          </Button>
        )}

        {status === 'error' && (
          <>
            <Button variant="ghost" borderRadius="full" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              borderRadius="full"
              bg="action.primary"
              color="action.primary.text"
              onClick={onRetry}
            >
              Retry
            </Button>
          </>
        )}
      </HStack>
    </Box>
  )
}

function SuccessIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="24" cy="24" r="22" stroke="#7FB285" strokeWidth="2" fill="none" />
      <path
        d="M14 24l7 7 13-13"
        stroke="#7FB285"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ErrorIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="24" cy="24" r="22" stroke="#FF6B6B" strokeWidth="2" fill="none" />
      <path
        d="M16 16l16 16M32 16L16 32"
        stroke="#FF6B6B"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}
