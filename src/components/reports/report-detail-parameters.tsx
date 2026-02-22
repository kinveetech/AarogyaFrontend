'use client'

import { Box } from '@chakra-ui/react'
import { DataTable, type DataTableColumn } from '@/components/ui/data-table'
import { StatusBadge } from '@/components/ui/status-badge'
import {
  PARAMETER_STATUS_LABELS,
  PARAMETER_STATUS_VARIANT_MAP,
} from './report-constants'
import type { ReportParameter } from '@/types/reports'

export interface ReportDetailParametersProps {
  parameters: ReportParameter[]
}

function isAbnormal(status: ReportParameter['status']): boolean {
  return status === 'high' || status === 'low'
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
    key: 'value',
    header: 'Value',
    render: (row) => (
      <Box
        as="span"
        fontFamily="mono"
        fontSize="sm"
        color={isAbnormal(row.status) ? 'coral.400' : 'text.primary'}
        css={isAbnormal(row.status) ? { _dark: { color: 'coral.300' } } : undefined}
        fontWeight={isAbnormal(row.status) ? 'semibold' : 'normal'}
      >
        {row.value}
      </Box>
    ),
  },
  {
    key: 'unit',
    header: 'Unit',
    render: (row) => (
      <Box as="span" fontFamily="mono" fontSize="sm" color="text.secondary">
        {row.unit}
      </Box>
    ),
  },
  {
    key: 'referenceRange',
    header: 'Ref Range',
    render: (row) => (
      <Box as="span" fontFamily="mono" fontSize="sm" color="text.secondary">
        {row.referenceRange}
      </Box>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    render: (row) => (
      <StatusBadge variant={PARAMETER_STATUS_VARIANT_MAP[row.status]}>
        {PARAMETER_STATUS_LABELS[row.status]}
      </StatusBadge>
    ),
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
