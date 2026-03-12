'use client'

import { Box } from '@chakra-ui/react'
import { DataTable, type DataTableColumn } from '@/components/ui/data-table'
import { StatusBadge } from '@/components/ui/status-badge'
import {
  PARAMETER_STATUS_LABELS,
  PARAMETER_STATUS_VARIANT_MAP,
} from './report-constants'
import type { ReportParameter } from '@/types/reports'
import { getParameterDisplayValue, getParameterStatus } from '@/types/reports'

export interface ReportDetailParametersProps {
  parameters: ReportParameter[]
}

const columns: DataTableColumn<ReportParameter>[] = [
  {
    key: 'name',
    header: 'Test',
    sortable: true,
    render: (row) => (
      <Box as="span" fontWeight="medium" fontSize="sm">
        {row.name}
      </Box>
    ),
  },
  {
    key: 'numericValue',
    header: 'Value',
    render: (row) => {
      const status = getParameterStatus(row)
      const abnormal = status === 'high' || status === 'low'
      return (
        <Box
          as="span"
          fontFamily="mono"
          fontSize="sm"
          color={abnormal ? 'coral.400' : 'text.primary'}
          css={abnormal ? { _dark: { color: 'coral.300' } } : undefined}
          fontWeight={abnormal ? 'semibold' : 'normal'}
        >
          {getParameterDisplayValue(row)}
        </Box>
      )
    },
  },
  {
    key: 'unit',
    header: 'Unit',
    render: (row) => (
      <Box as="span" fontFamily="mono" fontSize="sm" color="text.secondary">
        {row.unit ?? '-'}
      </Box>
    ),
  },
  {
    key: 'referenceRange',
    header: 'Ref Range',
    render: (row) => (
      <Box as="span" fontFamily="mono" fontSize="sm" color="text.secondary">
        {row.referenceRange ?? '-'}
      </Box>
    ),
  },
  {
    key: 'isAbnormal',
    header: 'Status',
    sortable: true,
    render: (row) => {
      const status = getParameterStatus(row)
      return (
        <StatusBadge variant={PARAMETER_STATUS_VARIANT_MAP[status]}>
          {PARAMETER_STATUS_LABELS[status]}
        </StatusBadge>
      )
    },
  },
]

export function ReportDetailParameters({ parameters }: ReportDetailParametersProps) {
  return (
    <Box
      bg="bg.card"
      border="1px solid"
      borderColor="border.subtle"
      borderRadius="xl"
      boxShadow="glass"
      overflow="hidden"
      p={{ base: '4', md: '6' }}
    >
      <Box
        as="h3"
        fontFamily="heading"
        fontSize="lg"
        color="text.primary"
        mb="4"
        fontWeight="semibold"
      >
        Parameters
      </Box>
      <DataTable
        columns={columns}
        data={parameters}
        rowKey="name"
        aria-label="Report parameters"
      />
    </Box>
  )
}
