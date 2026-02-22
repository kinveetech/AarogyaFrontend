'use client'

import { Box, Button, Flex, HStack, Text } from '@chakra-ui/react'
import { FileDropzone } from '@/components/ui/file-dropzone'
import type { FileUploadFileAcceptDetails } from '@chakra-ui/react'

export interface UploadStepFileProps {
  file: File | null
  onFileSelect: (file: File) => void
  onFileRemove: () => void
  onNext: () => void
  onCancel: () => void
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function UploadStepFile({
  file,
  onFileSelect,
  onFileRemove,
  onNext,
  onCancel,
}: UploadStepFileProps) {
  const handleFileAccept = (details: FileUploadFileAcceptDetails) => {
    if (details.files.length > 0) {
      onFileSelect(details.files[0])
    }
  }

  return (
    <Box>
      {file ? (
        <Box
          bg="bg.glass"
          backdropFilter="blur(12px)"
          border="1px solid"
          borderColor="border.subtle"
          borderRadius="xl"
          p="6"
        >
          <Flex align="center" justify="space-between">
            <Box>
              <Text color="text.primary" fontWeight="medium" fontSize="sm">
                {file.name}
              </Text>
              <Text color="text.muted" fontSize="xs" mt="1">
                {formatFileSize(file.size)}
              </Text>
            </Box>
            <Button
              size="sm"
              variant="ghost"
              borderRadius="full"
              color="status.error"
              onClick={onFileRemove}
              aria-label="Remove file"
            >
              Remove
            </Button>
          </Flex>
        </Box>
      ) : (
        <FileDropzone onFileAccept={handleFileAccept} aria-label="Upload report file" />
      )}

      <HStack justify="flex-end" mt="6" gap="3">
        <Button variant="ghost" borderRadius="full" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          borderRadius="full"
          bg="action.primary"
          color="action.primary.text"
          onClick={onNext}
          disabled={!file}
        >
          Next
        </Button>
      </HStack>
    </Box>
  )
}
