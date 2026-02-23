'use client'

import { Box, Text, HStack } from '@chakra-ui/react'
import { useTheme } from 'next-themes'
import { motion } from 'framer-motion'
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Bar,
  ReferenceLine,
  Tooltip,
  type BarShapeProps,
} from 'recharts'
import { EmptyStateView } from '@/components/ui/empty-state'
import { ChartSkeleton } from './chart-skeleton'
import { getChartColors } from './chart-colors'
import type { ParameterDataPoint, ParameterReferenceRange, ParameterPointStatus } from '@/types/charts'

/** @internal Exported for testing */
export function StatusBar(props: BarShapeProps) {
  return <rect x={props.x} y={props.y} width={props.width} height={props.height} rx={4} ry={4} fill={props.fill} />
}

export interface ParameterHistoryProps {
  parameterName: string
  unit: string
  data: ParameterDataPoint[]
  referenceRange?: ParameterReferenceRange
  height?: number
  isLoading?: boolean
}

const STATUS_LABELS: Record<ParameterPointStatus, string> = {
  normal: 'Normal',
  borderline: 'Borderline',
  abnormal: 'Abnormal',
}

function formatXAxisDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

interface ParameterTooltipProps {
  readonly active?: boolean
  readonly payload?: ReadonlyArray<{ payload: ParameterDataPoint }>
  readonly unit: string
}

/** @internal Exported for testing */
export function ParameterTooltip({
  active,
  payload,
  unit,
}: ParameterTooltipProps) {
  if (!active || !payload?.length) return null

  const entry = payload[0].payload

  return (
    <Box
      bg="bg.card"
      borderWidth="1px"
      borderColor="border.subtle"
      borderRadius="md"
      px="3"
      py="2"
      boxShadow="md"
      data-testid="parameter-tooltip"
    >
      <Text fontSize="xs" color="text.muted" mb="1">
        {formatXAxisDate(entry.date)}
      </Text>
      <Text fontSize="sm" color="text.primary" fontFamily="mono" fontWeight="medium">
        {entry.value} {unit}
      </Text>
      <Text fontSize="xs" color="text.muted">
        {STATUS_LABELS[entry.status]}
      </Text>
    </Box>
  )
}

function BarChartEmptyIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <rect x="6" y="24" width="6" height="18" rx="1" stroke="currentColor" strokeWidth="2" />
      <rect x="16" y="16" width="6" height="26" rx="1" stroke="currentColor" strokeWidth="2" />
      <rect x="26" y="20" width="6" height="22" rx="1" stroke="currentColor" strokeWidth="2" />
      <rect x="36" y="10" width="6" height="32" rx="1" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

export function ParameterHistory({
  parameterName,
  unit,
  data,
  referenceRange,
  height = 280,
  isLoading,
}: ParameterHistoryProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const colors = getChartColors(isDark)

  if (isLoading) return <ChartSkeleton variant="bar" />

  if (!data.length) {
    return (
      <EmptyStateView
        icon={<BarChartEmptyIcon />}
        title="No parameter data"
        description={`History for ${parameterName} will appear here once data is available.`}
      />
    )
  }

  const sortedData = [...data]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((d) => ({ ...d, fill: colors.status[d.status] }))

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <Box
        bg="bg.glass"
        backdropFilter="blur(12px)"
        borderWidth="1px"
        borderColor="border.subtle"
        borderRadius="lg"
        p="5"
        data-testid="parameter-history-chart"
      >
        <Text fontSize="sm" fontWeight="semibold" color="text.primary" mb="1">
          {parameterName}
        </Text>
        <Text fontSize="xs" color="text.muted" mb="4">
          Unit: {unit}
        </Text>

        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={sortedData} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.gridLine} vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={formatXAxisDate}
              tick={{ fontSize: 11, fill: colors.axisText }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: colors.axisText }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              content={<ParameterTooltip unit={unit} />}
              cursor={{ fill: 'rgba(127, 178, 133, 0.06)' }}
            />
            {referenceRange && (
              <>
                <ReferenceLine
                  y={referenceRange.min}
                  stroke={colors.referenceLine}
                  strokeDasharray="4 4"
                  label={{ value: 'Min', position: 'left', fontSize: 10, fill: colors.axisText }}
                />
                <ReferenceLine
                  y={referenceRange.max}
                  stroke={colors.referenceLine}
                  strokeDasharray="4 4"
                  label={{ value: 'Max', position: 'left', fontSize: 10, fill: colors.axisText }}
                />
              </>
            )}
            <Bar
              dataKey="value"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
              shape={StatusBar}
            />
          </BarChart>
        </ResponsiveContainer>

        <HStack gap="4" mt="3" justify="center" flexWrap="wrap">
          {(['normal', 'borderline', 'abnormal'] as const).map((status) => (
            <HStack key={status} gap="1.5" fontSize="xs">
              <Box
                w="8px"
                h="8px"
                borderRadius="full"
                bg={colors.status[status]}
              />
              <Text color="text.secondary">{STATUS_LABELS[status]}</Text>
            </HStack>
          ))}
        </HStack>
      </Box>
    </motion.div>
  )
}
