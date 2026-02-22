'use client'

import {
  Box,
  Button,
  FileUploadRoot,
  FileUploadDropzone,
  FileUploadHiddenInput,
  FileUploadTrigger,
  FileUploadItemGroup,
  FileUploadItems,
  Text,
  type FileUploadFileRejectDetails,
  type FileUploadFileAcceptDetails,
} from '@chakra-ui/react'
import { progressGradient } from '@/theme/tokens'

const ACCEPT = {
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
}

const MAX_SIZE_BYTES = 50 * 1024 * 1024

export interface FileDropzoneProps {
  onFileAccept?: (details: FileUploadFileAcceptDetails) => void
  onFileReject?: (details: FileUploadFileRejectDetails) => void
  uploadProgress?: number
  errorMessage?: string
  disabled?: boolean
  'aria-label'?: string
}

export function FileDropzone({
  onFileAccept,
  onFileReject,
  uploadProgress,
  errorMessage,
  disabled,
  'aria-label': ariaLabel,
}: FileDropzoneProps) {
  return (
    <FileUploadRoot
      accept={ACCEPT}
      maxFiles={1}
      maxFileSize={MAX_SIZE_BYTES}
      onFileAccept={onFileAccept}
      onFileReject={onFileReject}
      disabled={disabled}
    >
      <FileUploadHiddenInput aria-label={ariaLabel} />
      <FileUploadDropzone
        bg="bg.glass"
        backdropFilter="blur(12px)"
        border="2px dashed"
        borderColor={errorMessage ? 'coral.400' : 'border.default'}
        borderRadius="xl"
        p="8"
        display="flex"
        flexDirection="column"
        alignItems="center"
        gap="3"
        cursor={disabled ? 'not-allowed' : 'pointer'}
        transition="all 0.2s"
        css={{
          '&[data-dragging]': {
            borderColor: 'action.primary',
            bg: 'bg.overlay',
          },
        }}
      >
        <UploadIcon />
        <Text color="text.secondary" fontSize="sm" textAlign="center">
          Drag & drop your file here
        </Text>
        <Text color="text.muted" fontSize="xs">
          PDF, JPEG, or PNG — up to 50 MB
        </Text>
        <FileUploadTrigger asChild>
          <Button
            size="sm"
            borderRadius="full"
            bg="action.primary"
            color="action.primary.text"
            disabled={disabled}
          >
            Browse files
          </Button>
        </FileUploadTrigger>
      </FileUploadDropzone>

      <FileUploadItemGroup>
        <FileUploadItems showSize clearable />
      </FileUploadItemGroup>

      {uploadProgress !== undefined && (
        <Box
          mt="3"
          h="6px"
          w="100%"
          borderRadius="full"
          bg="bg.overlay"
          overflow="hidden"
          role="progressbar"
          aria-valuenow={uploadProgress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Upload progress"
        >
          <Box
            h="100%"
            w={`${uploadProgress}%`}
            borderRadius="full"
            bgImage={progressGradient}
            transition="width 0.3s ease"
          />
        </Box>
      )}

      {errorMessage && (
        <Text
          role="alert"
          color="status.error"
          fontSize="sm"
          mt="2"
          fontWeight="medium"
        >
          {errorMessage}
        </Text>
      )}
    </FileUploadRoot>
  )
}

function UploadIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M20 6v20M12 14l8-8 8 8M8 28h24"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.5"
      />
    </svg>
  )
}