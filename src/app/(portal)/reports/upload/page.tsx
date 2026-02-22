'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Box, Flex, HStack, Text } from '@chakra-ui/react'
import { useUploadUrl, useCreateReport, useS3Upload } from '@/hooks/reports'
import { UploadStepFile } from '@/components/reports/upload-step-file'
import { UploadStepMetadata, type ReportMetadata } from '@/components/reports/upload-step-metadata'
import { UploadStepProgress, type UploadStatus } from '@/components/reports/upload-step-progress'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

type Step = 1 | 2 | 3

const STEP_LABELS = ['Select File', 'Details', 'Upload']

function removeExtension(fileName: string): string {
  const lastDot = fileName.lastIndexOf('.')
  return lastDot > 0 ? fileName.slice(0, lastDot) : fileName
}

export default function ReportUploadPage() {
  const router = useRouter()
  const getUploadUrl = useUploadUrl()
  const createReport = useCreateReport()
  const s3Upload = useS3Upload()

  const [step, setStep] = useState<Step>(1)
  const [file, setFile] = useState<File | null>(null)
  const [metadata, setMetadata] = useState<ReportMetadata | null>(null)
  const [createdReportId, setCreatedReportId] = useState<string | null>(null)
  const [showCancelDialog, setShowCancelDialog] = useState(false)

  // Unsaved changes warning
  useEffect(() => {
    if (!file) return

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [file])

  const uploadStatus: UploadStatus = useMemo(() => {
    if (createdReportId) return 'success'
    if (getUploadUrl.isError || s3Upload.status === 'error' || createReport.isError) return 'error'
    if (createReport.isPending) return 'creating'
    return 'uploading'
  }, [createdReportId, getUploadUrl.isError, s3Upload.status, createReport.isError, createReport.isPending])

  const errorMessage = useMemo(() => {
    if (getUploadUrl.isError) return 'Failed to get upload URL. Please try again.'
    if (s3Upload.error) return s3Upload.error
    if (createReport.isError) return 'Failed to save report. Please try again.'
    return null
  }, [getUploadUrl.isError, s3Upload.error, createReport.isError])

  const runUploadFlow = useCallback(
    async (uploadFile: File, meta: ReportMetadata) => {
      try {
        const { uploadUrl, fileKey } = await getUploadUrl.mutateAsync({
          fileName: uploadFile.name,
          contentType: uploadFile.type,
        })

        await s3Upload.upload(uploadUrl, uploadFile)

        const report = await createReport.mutateAsync({
          title: meta.title,
          reportType: meta.reportType,
          reportDate: meta.reportDate,
          fileKey,
          notes: meta.notes || undefined,
        })

        setCreatedReportId(report.id)
      } catch {
        // Errors are tracked in mutation/hook state
      }
    },
    [getUploadUrl, s3Upload, createReport],
  )

  const handleFileSelect = useCallback((f: File) => setFile(f), [])
  const handleFileRemove = useCallback(() => setFile(null), [])

  const handleNext = useCallback(() => setStep(2), [])

  const handleMetadataBack = useCallback(() => setStep(1), [])

  const handleMetadataSubmit = useCallback(
    (data: ReportMetadata) => {
      setMetadata(data)
      setStep(3)
      if (file) {
        runUploadFlow(file, data)
      }
    },
    [file, runUploadFlow],
  )

  const handleRetry = useCallback(() => {
    s3Upload.reset()
    getUploadUrl.reset()
    createReport.reset()
    setCreatedReportId(null)
    if (file && metadata) {
      runUploadFlow(file, metadata)
    }
  }, [s3Upload, getUploadUrl, createReport, file, metadata, runUploadFlow])

  const handleCancelAttempt = useCallback(() => {
    if (file) {
      setShowCancelDialog(true)
    } else {
      router.push('/reports')
    }
  }, [file, router])

  const handleCancelConfirm = useCallback(() => {
    setShowCancelDialog(false)
    s3Upload.abort()
    router.push('/reports')
  }, [s3Upload, router])

  const handleViewReport = useCallback(() => {
    if (createdReportId) {
      router.push(`/reports/${createdReportId}`)
    }
  }, [createdReportId, router])

  return (
    <Box maxW="1200px" mx="auto" px={{ base: '4', md: '6' }} py="6">
      <Text
        as="h1"
        fontFamily="heading"
        fontSize={{ base: '2xl', md: '3xl' }}
        color="text.primary"
        mb="6"
      >
        Upload Report
      </Text>

      {/* Step indicator */}
      <HStack justify="center" mb="8" gap="0">
        {STEP_LABELS.map((label, index) => {
          const stepNum = (index + 1) as Step
          const isActive = step === stepNum
          const isCompleted = step > stepNum

          return (
            <Flex key={label} align="center">
              {index > 0 && (
                <Box
                  w="12"
                  h="2px"
                  bg={isCompleted || isActive ? 'action.primary' : 'border.default'}
                  transition="background 0.2s"
                />
              )}
              <Flex direction="column" align="center" gap="1">
                <Flex
                  w="8"
                  h="8"
                  borderRadius="full"
                  align="center"
                  justify="center"
                  bg={isActive || isCompleted ? 'action.primary' : 'bg.overlay'}
                  color={isActive || isCompleted ? 'action.primary.text' : 'text.muted'}
                  fontSize="sm"
                  fontWeight="bold"
                  transition="all 0.2s"
                >
                  {isCompleted ? '\u2713' : stepNum}
                </Flex>
                <Text
                  fontSize="xs"
                  color={isActive ? 'text.primary' : 'text.muted'}
                  fontWeight={isActive ? 'medium' : 'normal'}
                  whiteSpace="nowrap"
                >
                  {label}
                </Text>
              </Flex>
            </Flex>
          )
        })}
      </HStack>

      {/* Step content */}
      <Box
        maxW="600px"
        mx="auto"
        bg="bg.glass"
        backdropFilter="blur(12px)"
        border="1px solid"
        borderColor="border.subtle"
        borderRadius="xl"
        p={{ base: '4', md: '6' }}
      >
        {step === 1 && (
          <UploadStepFile
            file={file}
            onFileSelect={handleFileSelect}
            onFileRemove={handleFileRemove}
            onNext={handleNext}
            onCancel={handleCancelAttempt}
          />
        )}

        {step === 2 && file && (
          <UploadStepMetadata
            defaultTitle={removeExtension(file.name)}
            onSubmit={handleMetadataSubmit}
            onBack={handleMetadataBack}
          />
        )}

        {step === 3 && file && (
          <UploadStepProgress
            fileName={file.name}
            status={uploadStatus}
            progress={s3Upload.progress}
            errorMessage={errorMessage}
            onRetry={handleRetry}
            onCancel={handleCancelAttempt}
            onViewReport={handleViewReport}
          />
        )}
      </Box>

      <ConfirmDialog
        open={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onConfirm={handleCancelConfirm}
        title="Discard upload?"
        message="Your selected file and entered details will be lost."
        confirmLabel="Discard"
        cancelLabel="Continue editing"
        destructive
      />
    </Box>
  )
}
