'use client'

import { Box, Button, Field, HStack, Input, NativeSelect, Textarea } from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod/v4'
import { nonEmptyString } from '@/lib/schemas/validators'
import { REPORT_TYPE_LABELS } from '@/components/reports/report-constants'
import type { ReportType } from '@/types/reports'

const metadataSchema = z.object({
  reportType: z.enum(['blood_test', 'urine_test', 'radiology', 'cardiology', 'other']),
  labName: nonEmptyString.max(200, 'Lab name must be 200 characters or fewer'),
  collectedAt: nonEmptyString.refine((v) => !isNaN(Date.parse(v)), 'Must be a valid date'),
  notes: z.string().max(500, 'Notes must be 500 characters or fewer').optional(),
})

export type ReportMetadata = z.infer<typeof metadataSchema>

export interface UploadStepMetadataProps {
  defaultLabName?: string
  onSubmit: (data: ReportMetadata) => void
  onBack: () => void
  submitting?: boolean
}

function getTodayString(): string {
  return new Date().toISOString().split('T')[0]
}

export function UploadStepMetadata({
  defaultLabName = '',
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
      labName: defaultLabName,
      collectedAt: getTodayString(),
      notes: '',
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

        <Field.Root invalid={!!errors.labName}>
          <Field.Label color="text.primary" fontSize="sm">
            Lab Name
          </Field.Label>
          <Input
            {...register('labName')}
            placeholder="Laboratory name"
            bg="bg.glass"
            borderColor="border.default"
            borderRadius="lg"
            color="text.primary"
          />
          {errors.labName && (
            <Field.ErrorText>{errors.labName.message}</Field.ErrorText>
          )}
        </Field.Root>

        <Field.Root invalid={!!errors.collectedAt}>
          <Field.Label color="text.primary" fontSize="sm">
            Collection Date
          </Field.Label>
          <Input
            {...register('collectedAt')}
            type="date"
            bg="bg.glass"
            borderColor="border.default"
            borderRadius="lg"
            color="text.primary"
          />
          {errors.collectedAt && (
            <Field.ErrorText>{errors.collectedAt.message}</Field.ErrorText>
          )}
        </Field.Root>

        <Field.Root invalid={!!errors.notes}>
          <Field.Label color="text.primary" fontSize="sm">
            Notes
          </Field.Label>
          <Textarea
            {...register('notes')}
            placeholder="Optional notes about this report"
            bg="bg.glass"
            borderColor="border.default"
            borderRadius="lg"
            color="text.primary"
            rows={3}
          />
          {errors.notes && (
            <Field.ErrorText>{errors.notes.message}</Field.ErrorText>
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
