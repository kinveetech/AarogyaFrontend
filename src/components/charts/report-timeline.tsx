'use client'

import { useState } from 'react'
import { Box, Text, HStack, VStack, Button } from '@chakra-ui/react'
import { useTheme } from 'next-themes'
import { motion } from 'framer-motion'
import { REPORT_TYPE_LABELS } from '@/components/reports/report-constants'
import { EmptyStateView } from '@/components/ui/empty-state'
import { ChartSkeleton } from './chart-skeleton'
import { getChartColors } from './chart-colors'
import type { Report, ReportType } from '@/types/reports'

export interface ReportTimelineProps {
  reports: Report[]
  onReportClick: (id: string) => void
  isLoading?: boolean
  maxVisible?: number
}

const DEFAULT_MAX_VISIBLE = 10

function formatMonthYear(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
}

function formatDay(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

function ReportTypeIcon({ type }: { type: ReportType }) {
  const iconProps = {
    width: 16,
    height: 16,
    viewBox: '0 0 16 16',
    fill: 'none' as const,
    'aria-hidden': true as const,
  }

  switch (type) {
    case 'blood_test':
      return (
        <svg {...iconProps}>
          <path
            d="M6 2v5l-3 5a1 1 0 001 2h8a1 1 0 001-2l-3-5V2M5 2h6"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    case 'urine_test':
      return (
        <svg {...iconProps}>
          <rect x="3" y="2" width="10" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
          <path d="M6 5h4M6 7.5h4M6 10h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      )
    case 'radiology':
      return (
        <svg {...iconProps}>
          <rect x="2" y="3" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.2" />
          <path d="M5 3V2M11 3V2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      )
    case 'cardiology':
      return (
        <svg {...iconProps}>
          <path
            d="M10 2H4.5A1.5 1.5 0 003 3.5v9A1.5 1.5 0 004.5 14h7a1.5 1.5 0 001.5-1.5V5l-3-3z"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M10 2v3h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    default:
      return (
        <svg {...iconProps}>
          <path
            d="M9 2H4.5A1.5 1.5 0 003 3.5v9A1.5 1.5 0 004.5 14h7a1.5 1.5 0 001.5-1.5V6L9 2z"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M9 2v4h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
  }
}

interface MonthGroup {
  label: string
  reports: Report[]
}

function groupByMonth(reports: Report[]): MonthGroup[] {
  const groups = new Map<string, Report[]>()

  for (const report of reports) {
    const key = formatMonthYear(report.reportDate)
    const existing = groups.get(key) ?? []
    existing.push(report)
    groups.set(key, existing)
  }

  return Array.from(groups.entries()).map(([label, reports]) => ({
    label,
    reports,
  }))
}

function TimelineEmptyIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <line x1="12" y1="8" x2="12" y2="40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="14" r="3" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="26" r="3" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="38" r="3" stroke="currentColor" strokeWidth="2" />
      <rect x="20" y="10" width="20" height="8" rx="2" stroke="currentColor" strokeWidth="2" />
      <rect x="20" y="22" width="20" height="8" rx="2" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

export function ReportTimeline({
  reports,
  onReportClick,
  isLoading,
  maxVisible = DEFAULT_MAX_VISIBLE,
}: ReportTimelineProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const colors = getChartColors(isDark)

  const [showAll, setShowAll] = useState(false)

  if (isLoading) return <ChartSkeleton variant="timeline" />

  if (!reports.length) {
    return (
      <EmptyStateView
        icon={<TimelineEmptyIcon />}
        title="No reports yet"
        description="Your report timeline will appear here once reports are uploaded."
      />
    )
  }

  const sorted = [...reports].sort(
    (a, b) => new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime(),
  )
  const visibleReports = showAll ? sorted : sorted.slice(0, maxVisible)
  const groups = groupByMonth(visibleReports)
  const hasMore = sorted.length > maxVisible

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
        data-testid="report-timeline"
      >
        <Text fontSize="sm" fontWeight="semibold" color="text.primary" mb="5">
          Report Timeline
        </Text>

        <VStack align="stretch" gap="6">
          {groups.map((group) => (
            <Box key={group.label}>
              <Text fontSize="xs" fontWeight="medium" color="text.muted" mb="3">
                {group.label}
              </Text>

              <Box position="relative" pl="6">
                {/* Vertical timeline line */}
                <Box
                  position="absolute"
                  left="5px"
                  top="6px"
                  bottom="6px"
                  width="2px"
                  bg={colors.timelineLine}
                  borderRadius="full"
                />

                <VStack align="stretch" gap="3">
                  {group.reports.map((report) => (
                    <Box key={report.id} position="relative">
                      {/* Timeline dot */}
                      <Box
                        position="absolute"
                        left="-21px"
                        top="10px"
                        width="10px"
                        height="10px"
                        borderRadius="full"
                        bg={colors.timelineDot}
                        borderWidth="2px"
                        borderColor={isDark ? 'bg.surface' : 'bg.card'}
                        data-testid="timeline-dot"
                      />

                      <Box
                        bg="bg.overlay"
                        borderRadius="md"
                        p="3"
                        cursor="pointer"
                        transition="all 0.2s"
                        _hover={{ boxShadow: 'sm', transform: 'translateY(-1px)' }}
                        onClick={() => onReportClick(report.id)}
                        data-testid="timeline-entry"
                      >
                        <HStack justify="space-between" mb="1">
                          <HStack gap="1.5" fontSize="xs" color="text.muted">
                            <ReportTypeIcon type={report.reportType} />
                            <Text>{REPORT_TYPE_LABELS[report.reportType]}</Text>
                          </HStack>
                          <Text fontSize="xs" color="text.muted">
                            {formatDay(report.reportDate)}
                          </Text>
                        </HStack>

                        <Text fontSize="sm" fontWeight="medium" color="text.primary" lineClamp={1}>
                          {report.title}
                        </Text>

                        {report.highlightParameter && (
                          <Text
                            fontSize="xs"
                            fontFamily="mono"
                            color="text.secondary"
                            mt="1"
                          >
                            {report.highlightParameter}
                          </Text>
                        )}
                      </Box>
                    </Box>
                  ))}
                </VStack>
              </Box>
            </Box>
          ))}
        </VStack>

        {hasMore && !showAll && (
          <Box textAlign="center" mt="4">
            <Button
              variant="ghost"
              size="sm"
              borderRadius="full"
              color="action.primary"
              onClick={() => setShowAll(true)}
              data-testid="timeline-show-more"
            >
              Show all {sorted.length} reports
            </Button>
          </Box>
        )}
      </Box>
    </motion.div>
  )
}
