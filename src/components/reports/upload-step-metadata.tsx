'use client'

import { Box, Button, Field, HStack, Input, NativeSelect, Textarea } from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod/v4'
import { nonEmptyString } from '@/lib/schemas/validators'
import { REPORT_TYPE_LABELS } from '@/components/reports/report-constants'
import type { ReportType } from '@/types/reports'

const metadataSchema = z.object({
  title: nonEmptyString.max(200, 'Title must be 200 characters or fewer'),
  reportType: z.enum(['lab', 'prescription', 'imaging', 'discharge', 'other']),
  reportDate: nonEmptyString.refine((v) => !isNaN(Date.parse(v)), 'Must be a valid date'),
  notes: z.string().max(500, 'Notes must be 500 characters or fewer').optional(),
})

export type ReportMetadata = z.infer<typeof metadataSchema>

export interface UploadStepMetadataProps {
  defaultTitle: string
  onSubmit: (data: ReportMetadata) => void
  onBack: () => void
  submitting?: boolean
}

function getTodayString(): string {
  return new Date().toISOString().split('T')[0]
}

export function UploadStepMetadata({
  defaultTitle,
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
      title: defaultTitle,
      reportType: 'lab',
      reportDate: getTodayString(),
      notes: '',
    },
  })

  return (
    <Box as="form" onSubmit={handleSubmit(onSubmit)}>
      <Box display="flex" flexDirection="column" gap="5">
        <Field.Root invalid={!!errors.title}>
          <Field.Label color="text.primary" fontSize="sm">
            Title
          </Field.Label>
          <Input
            {...register('title')}
            placeholder="Report title"
            bg="bg.glass"
            borderColor="border.default"
            borderRadius="lg"
            color="text.primary"
          />
          {errors.title && (
            <Field.ErrorText>{errors.title.message}</Field.ErrorText>
          )}
        </Field.Root>

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

        <Field.Root invalid={!!errors.reportDate}>
          <Field.Label color="text.primary" fontSize="sm">
            Report Date
          </Field.Label>
          <Input
            {...register('reportDate')}
            type="date"
            bg="bg.glass"
            borderColor="border.default"
            borderRadius="lg"
            color="text.primary"
          />
          {errors.reportDate && (
            <Field.ErrorText>{errors.reportDate.message}</Field.ErrorText>
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
