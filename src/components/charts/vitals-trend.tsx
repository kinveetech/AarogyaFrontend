'use client'

import { Box, Text, HStack } from '@chakra-ui/react'
import { useTheme } from 'next-themes'
import { motion } from 'framer-motion'
import {
  ResponsiveContainer,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Line,
  ReferenceArea,
  Tooltip,
  type TooltipProps,
} from 'recharts'
import { EmptyStateView } from '@/components/ui/empty-state'
import { ChartSkeleton } from './chart-skeleton'
import { getChartColors } from './chart-colors'
import type { VitalSeries, VitalType } from '@/types/charts'

export interface VitalsTrendProps {
  series: VitalSeries[]
  height?: number
  isLoading?: boolean
}

/** Merge all series into a flat array of { date, [type]: value } for Recharts */
function mergeSeriesData(series: VitalSeries[]) {
  const dateMap = new Map<string, Record<string, number | string>>()

  for (const s of series) {
    for (const point of s.data) {
      const existing = dateMap.get(point.date) ?? { date: point.date }
      existing[s.type] = point.value
      dateMap.set(point.date, existing)
    }
  }

  return Array.from(dateMap.values()).sort(
    (a, b) => new Date(a.date as string).getTime() - new Date(b.date as string).getTime(),
  )
}

function formatXAxisDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

interface VitalsTooltipPayloadEntry {
  dataKey: string
  value: number
  color: string
}

/** @internal Exported for testing */
export function VitalsTooltip({
  active,
  payload,
  label,
  series,
  isDark,
}: TooltipProps<number, string> & { series: VitalSeries[]; isDark: boolean }) {
  const colors = getChartColors(isDark)

  if (!active || !payload?.length) return null

  const seriesMap = new Map(series.map((s) => [s.type, s]))

  return (
    <Box
      bg={isDark ? 'bg.card' : 'bg.card'}
      borderWidth="1px"
      borderColor="border.subtle"
      borderRadius="md"
      px="3"
      py="2"
      boxShadow="md"
      data-testid="vitals-tooltip"
    >
      <Text fontSize="xs" color="text.muted" mb="1">
        {formatXAxisDate(label as string)}
      </Text>
      {(payload as VitalsTooltipPayloadEntry[]).map((entry) => {
        const meta = seriesMap.get(entry.dataKey as VitalType)
        return (
          <HStack key={entry.dataKey} gap="2" fontSize="xs">
            <Box
              w="8px"
              h="8px"
              borderRadius="full"
              bg={entry.color}
              flexShrink={0}
            />
            <Text color="text.primary" fontWeight="medium">
              {meta?.label ?? entry.dataKey}:
            </Text>
            <Text color="text.secondary" fontFamily="mono">
              {entry.value} {meta?.unit ?? ''}
            </Text>
            {meta && (
              <Text color="text.muted" fontSize="2xs">
                ({meta.referenceRange.min}–{meta.referenceRange.max})
              </Text>
            )}
          </HStack>
        )
      })}
    </Box>
  )
}

function ChartEmptyIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path
        d="M6 36l10-14 8 6 10-16 8 10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="22" r="2" fill="currentColor" />
      <circle cx="24" cy="28" r="2" fill="currentColor" />
      <circle cx="34" cy="12" r="2" fill="currentColor" />
    </svg>
  )
}

export function VitalsTrend({ series, height = 300, isLoading }: VitalsTrendProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const colors = getChartColors(isDark)

  if (isLoading) return <ChartSkeleton variant="line" />

  if (!series.length || series.every((s) => !s.data.length)) {
    return (
      <EmptyStateView
        icon={<ChartEmptyIcon />}
        title="No vitals data"
        description="Vitals trends will appear here once data is available."
      />
    )
  }

  const mergedData = mergeSeriesData(series)

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
        data-testid="vitals-trend-chart"
      >
        <Text fontSize="sm" fontWeight="semibold" color="text.primary" mb="4">
          Vitals Trend
        </Text>

        <ResponsiveContainer width="100%" height={height}>
          <ComposedChart data={mergedData} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.gridLine} />
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
              content={<VitalsTooltip series={series} isDark={isDark} />}
              cursor={{ stroke: colors.gridLine }}
            />
            {series.map((s) => (
              <ReferenceArea
                key={`ref-${s.type}`}
                y1={s.referenceRange.min}
                y2={s.referenceRange.max}
                fill={colors.referenceArea}
                fillOpacity={1}
              />
            ))}
            {series.map((s) => (
              <Line
                key={s.type}
                type="monotone"
                dataKey={s.type}
                stroke={colors.vitals[s.type]}
                strokeWidth={2}
                dot={{ r: 3, fill: colors.vitals[s.type] }}
                activeDot={{ r: 5 }}
                name={s.label}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>

        <HStack gap="4" mt="3" justify="center" flexWrap="wrap">
          {series.map((s) => (
            <HStack key={s.type} gap="1.5" fontSize="xs">
              <Box
                w="8px"
                h="8px"
                borderRadius="full"
                bg={colors.vitals[s.type]}
              />
              <Text color="text.secondary">{s.label}</Text>
            </HStack>
          ))}
        </HStack>
      </Box>
    </motion.div>
  )
}
