'use client'

import { Box, Button, Field, HStack, NativeSelect } from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod/v4'
import { REPORT_TYPE_LABELS } from '@/components/reports/report-constants'
import type { ReportType } from '@/types/reports'

const metadataSchema = z.object({
  reportType: z.enum(['blood_test', 'urine_test', 'radiology', 'cardiology', 'other']),
})

export type ReportMetadata = z.infer<typeof metadataSchema>

export interface UploadStepMetadataProps {
  onSubmit: (data: ReportMetadata) => void
  onBack: () => void
  submitting?: boolean
}

export function UploadStepMetadata({
  onSubmit,
  onBack,
  submitting = false,
}: UploadStepMetadataProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReportMetadata>({
    resolver: zodResolver(metadataSchema),
    defaultValues: {
      reportType: 'blood_test',
    },
  })

  return (
    <Box as="form" onSubmit={handleSubmit(onSubmit)}>
      <Box display="flex" flexDirection="column" gap="5">
        <Field.Root invalid={!!errors.reportType}>
          <Field.Label color="text.primary" fontSize="sm">
            Report Type
          </Field.Label>
          <NativeSelect.Root>
            <NativeSelect.Field
              {...register('reportType')}
              bg="bg.glass"
              borderColor="border.default"
              borderRadius="lg"
              color="text.primary"
            >
              {(Object.entries(REPORT_TYPE_LABELS) as [ReportType, string][]).map(
                ([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ),
              )}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
          {errors.reportType && (
            <Field.ErrorText>{errors.reportType.message}</Field.ErrorText>
          )}
        </Field.Root>
      </Box>

      <HStack justify="flex-end" mt="6" gap="3">
        <Button
          variant="ghost"
          borderRadius="full"
          onClick={onBack}
          disabled={submitting}
        >
          Back
        </Button>
        <Button
          type="submit"
          borderRadius="full"
          bg="action.primary"
          color="action.primary.text"
          loading={submitting}
          disabled={submitting}
        >
          Upload
        </Button>
      </HStack>
    </Box>
  )
}
