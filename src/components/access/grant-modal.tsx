'use client'

import { useState, useCallback, useMemo } from 'react'
import {
  Box,
  Button,
  DialogRoot,
  DialogBackdrop,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogPositioner,
  Flex,
  Input,
  Skeleton,
  Switch,
  Text,
  Textarea,
} from '@chakra-ui/react'
import { useSearchDoctors } from '@/hooks/access'
import { useReports } from '@/hooks/reports'
import { DURATION_OPTIONS, getInitials } from './access-constants'
import type { Doctor } from '@/types/access'

export interface GrantModalSubmitData {
  doctorId: string
  doctorName: string
  allReports: boolean
  reportIds: string[]
  purpose: string
  expiresAt: string
}

export interface GrantModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: GrantModalSubmitData) => void
  loading?: boolean
}

type Step = 'search' | 'reports' | 'duration'

export function GrantModal({ open, onClose, onSubmit, loading = false }: GrantModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [allReports, setAllReports] = useState(false)
  const [selectedReportIds, setSelectedReportIds] = useState<Set<string>>(new Set())
  const [selectedDuration, setSelectedDuration] = useState<number | null>(30)
  const [customDays, setCustomDays] = useState('')
  const [purpose, setPurpose] = useState('')

  const doctorSearch = useSearchDoctors(searchQuery)
  const { data: reportsData, isLoading: reportsLoading } = useReports({ pageSize: 100 })

  const hasReportSelection = allReports || selectedReportIds.size > 0
  const currentStep: Step = !selectedDoctor
    ? 'search'
    : !hasReportSelection
      ? 'reports'
      : 'duration'

  const effectiveDays = selectedDuration ?? (customDays ? parseInt(customDays, 10) : 0)
  const canSubmit =
    selectedDoctor !== null &&
    hasReportSelection &&
    effectiveDays > 0 &&
    purpose.trim().length > 0 &&
    !loading

  const handleSelectDoctor = useCallback((doctor: Doctor) => {
    setSelectedDoctor(doctor)
  }, [])

  const toggleReport = useCallback((reportId: string) => {
    setSelectedReportIds((prev) => {
      const next = new Set(prev)
      if (next.has(reportId)) {
        next.delete(reportId)
      } else {
        next.add(reportId)
      }
      return next
    })
  }, [])

  const handleAllReportsToggle = useCallback(() => {
    setAllReports((prev) => {
      if (!prev) {
        setSelectedReportIds(new Set())
      }
      return !prev
    })
  }, [])

  const handleDurationSelect = useCallback((days: number) => {
    setSelectedDuration(days)
    setCustomDays('')
  }, [])

  const handleCustomDaysChange = useCallback((value: string) => {
    setCustomDays(value)
    setSelectedDuration(null)
  }, [])

  const handleSubmit = useCallback(() => {
    if (!selectedDoctor || !canSubmit) return
    const expiresAt = new Date(
      Date.now() + effectiveDays * 24 * 60 * 60 * 1000,
    ).toISOString()
    onSubmit({
      doctorId: selectedDoctor.id,
      doctorName: selectedDoctor.name,
      allReports,
      reportIds: allReports ? [] : Array.from(selectedReportIds),
      purpose: purpose.trim(),
      expiresAt,
    })
  }, [selectedDoctor, selectedReportIds, allReports, purpose, effectiveDays, canSubmit, onSubmit])

  const handleClose = useCallback(() => {
    setSearchQuery('')
    setSelectedDoctor(null)
    setAllReports(false)
    setSelectedReportIds(new Set())
    setSelectedDuration(30)
    setCustomDays('')
    setPurpose('')
    onClose()
  }, [onClose])

  const reports = useMemo(() => reportsData?.items ?? [], [reportsData])

  return (
    <DialogRoot
      open={open}
      onOpenChange={(details) => !details.open && handleClose()}
    >
      <DialogBackdrop />
      <DialogPositioner>
        <DialogContent
          bg="bg.glass"
          backdropFilter="blur(24px)"
          borderColor="border.subtle"
          borderWidth="1px"
          boxShadow="glass"
          borderRadius="2xl"
          maxW="520px"
          w="full"
          mx="4"
          aria-describedby="grant-modal-desc"
        >
          <DialogHeader>
            <DialogTitle fontFamily="heading" fontSize="1.3rem" color="text.primary">
              Grant Doctor Access
            </DialogTitle>
            <Text id="grant-modal-desc" fontSize="0.88rem" color="text.muted" mt="1">
              Search for a doctor and choose which reports to share.
            </Text>
          </DialogHeader>
          <DialogBody pb="6">
            {/* Step 1: Search Doctor */}
            <Box role="group" aria-label="Step 1: Search Doctor">
            <StepLabel
              step={1}
              label="Search Doctor"
              active={currentStep === 'search'}
            />
            {!selectedDoctor ? (
              <DoctorSearch
                query={searchQuery}
                onQueryChange={setSearchQuery}
                results={doctorSearch.data?.items ?? []}
                isLoading={doctorSearch.isLoading}
                onSelect={handleSelectDoctor}
              />
            ) : (
              <SelectedDoctorBadge
                doctor={selectedDoctor}
                onClear={() => setSelectedDoctor(null)}
              />
            )}
            </Box>

            {/* Step 2: Select Reports */}
            {selectedDoctor && (
              <Box role="group" aria-label="Step 2: Select Reports">
                <StepLabel
                  step={2}
                  label="Select Reports"
                  active={currentStep === 'reports'}
                />

                {/* All Reports Toggle */}
                <Flex
                  align="center"
                  justify="space-between"
                  px="3"
                  py="2.5"
                  mb="3"
                  borderWidth="1px"
                  borderColor={allReports ? 'action.primary' : 'border.subtle'}
                  borderRadius="lg"
                  bg="bg.overlay"
                >
                  <Box>
                    <Text fontSize="0.88rem" color="text.primary" fontWeight="medium">
                      Grant access to all reports
                    </Text>
                    <Text fontSize="0.78rem" color="text.muted">
                      Includes current and future reports
                    </Text>
                  </Box>
                  <Switch.Root
                    checked={allReports}
                    onCheckedChange={handleAllReportsToggle}
                    aria-label="Grant access to all reports"
                  >
                    <Switch.HiddenInput />
                    <Switch.Control>
                      <Switch.Thumb />
                    </Switch.Control>
                  </Switch.Root>
                </Flex>

                {!allReports && (
                  <ReportSelector
                    reports={reports}
                    selectedIds={selectedReportIds}
                    onToggle={toggleReport}
                    loading={reportsLoading}
                  />
                )}
              </Box>
            )}

            {/* Step 3: Purpose & Duration */}
            {selectedDoctor && hasReportSelection && (
              <Box role="group" aria-label="Step 3: Set Duration">
                <StepLabel
                  step={3}
                  label="Purpose & Duration"
                  active={currentStep === 'duration'}
                />

                {/* Purpose field */}
                <Box mb="4">
                  <Text fontSize="0.82rem" color="text.secondary" mb="1.5" fontWeight="medium">
                    Purpose of access
                  </Text>
                  <Textarea
                    placeholder="e.g., Follow-up consultation for blood work review"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    bg="bg.glass"
                    borderColor="border.default"
                    borderRadius="lg"
                    fontSize="0.88rem"
                    rows={2}
                    maxLength={500}
                    aria-label="Purpose of access"
                  />
                  <Text fontSize="0.72rem" color="text.muted" mt="1" textAlign="right">
                    {purpose.length}/500
                  </Text>
                </Box>

                <DurationPicker
                  selected={selectedDuration}
                  customDays={customDays}
                  onSelect={handleDurationSelect}
                  onCustomChange={handleCustomDaysChange}
                />
              </Box>
            )}

            {/* Submit */}
            {selectedDoctor && hasReportSelection && (
              <Button
                w="full"
                borderRadius="full"
                bg="action.primary"
                color="action.primary.text"
                mt="5"
                _hover={{
                  bg: 'action.primary.hover',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(14, 107, 102, 0.25)',
                }}
                onClick={handleSubmit}
                loading={loading}
                disabled={!canSubmit}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Grant Access
              </Button>
            )}
          </DialogBody>
        </DialogContent>
      </DialogPositioner>
    </DialogRoot>
  )
}

/* -- Sub-components -- */

function StepLabel({ step, label, active }: { step: number; label: string; active: boolean }) {
  return (
    <Text
      fontFamily="mono"
      fontSize="0.72rem"
      fontWeight="medium"
      letterSpacing="0.1em"
      textTransform="uppercase"
      color={active ? 'text.secondary' : 'text.muted'}
      mt={step === 1 ? '0' : '6'}
      mb="2.5"
      aria-live="polite"
    >
      Step {step} &mdash; {label}
    </Text>
  )
}

function DoctorSearch({
  query,
  onQueryChange,
  results,
  isLoading,
  onSelect,
}: {
  query: string
  onQueryChange: (q: string) => void
  results: Doctor[]
  isLoading: boolean
  onSelect: (doctor: Doctor) => void
}) {
  return (
    <Box>
      <Box position="relative" mb="3">
        <Box
          position="absolute"
          left="14px"
          top="50%"
          transform="translateY(-50%)"
          color="text.muted"
          zIndex="1"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </Box>
        <Input
          pl="42px"
          bg="bg.glass"
          backdropFilter="blur(12px)"
          borderColor="border.default"
          borderRadius="xl"
          fontSize="0.9rem"
          placeholder="Search by name or ID..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          aria-label="Search doctors"
        />
      </Box>
      {isLoading && query.length >= 2 && (
        <Box display="flex" flexDirection="column" gap="2">
          {[1, 2].map((i) => (
            <Skeleton key={i} height="60px" borderRadius="xl" />
          ))}
        </Box>
      )}
      {!isLoading &&
        results.map((doctor) => (
          <Flex
            key={doctor.id}
            align="center"
            gap="3"
            p="3"
            borderWidth="1px"
            borderColor="border.subtle"
            borderRadius="xl"
            mb="2"
            bg="bg.overlay"
            _hover={{ bg: 'border.subtle' }}
            transition="background 0.2s"
            data-testid="doctor-search-result"
          >
            <Flex
              align="center"
              justify="center"
              boxSize="40px"
              borderRadius="full"
              bg="action.primary"
              color="action.primary.text"
              fontFamily="mono"
              fontSize="0.78rem"
              fontWeight="medium"
              flexShrink={0}
            >
              {getInitials(doctor.name)}
            </Flex>
            <Box flex="1" minW="0">
              <Text fontFamily="heading" fontSize="0.95rem" color="text.primary">
                {doctor.name}
              </Text>
              <Text fontSize="0.8rem" color="text.muted">
                {doctor.specialisation}
              </Text>
            </Box>
            <Button
              size="sm"
              borderRadius="full"
              bg="action.primary"
              color="action.primary.text"
              onClick={() => onSelect(doctor)}
            >
              Select
            </Button>
          </Flex>
        ))}
    </Box>
  )
}

function SelectedDoctorBadge({
  doctor,
  onClear,
}: {
  doctor: Doctor
  onClear: () => void
}) {
  return (
    <Flex
      align="center"
      gap="3"
      p="3"
      borderWidth="1px"
      borderColor="action.primary"
      borderRadius="xl"
      bg="bg.overlay"
    >
      <Flex
        align="center"
        justify="center"
        boxSize="40px"
        borderRadius="full"
        bg="action.primary"
        color="action.primary.text"
        fontFamily="mono"
        fontSize="0.78rem"
        fontWeight="medium"
        flexShrink={0}
      >
        {getInitials(doctor.name)}
      </Flex>
      <Box flex="1" minW="0">
        <Text fontFamily="heading" fontSize="0.95rem" color="text.primary">
          {doctor.name}
        </Text>
        <Text fontSize="0.8rem" color="text.muted">
          {doctor.specialisation}
        </Text>
      </Box>
      <Button
        variant="ghost"
        size="sm"
        borderRadius="full"
        onClick={onClear}
        aria-label="Change doctor"
      >
        Change
      </Button>
    </Flex>
  )
}

function ReportSelector({
  reports,
  selectedIds,
  onToggle,
  loading,
}: {
  reports: { id: string; title: string; reportDate: string }[]
  selectedIds: Set<string>
  onToggle: (id: string) => void
  loading: boolean
}) {
  if (loading) {
    return (
      <Box display="flex" flexDirection="column" gap="2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} height="44px" borderRadius="lg" />
        ))}
      </Box>
    )
  }

  if (reports.length === 0) {
    return (
      <Text fontSize="0.88rem" color="text.muted" textAlign="center" py="4">
        No reports available to share.
      </Text>
    )
  }

  return (
    <Box display="flex" flexDirection="column" gap="2">
      {reports.map((report) => (
        <Box
          as="label"
          key={report.id}
          display="flex"
          alignItems="center"
          gap="2.5"
          px="3"
          py="2.5"
          borderWidth="1px"
          borderColor="border.subtle"
          borderRadius="lg"
          bg="bg.overlay"
          cursor="pointer"
          transition="background 0.2s"
          _hover={{ bg: 'border.subtle' }}
          data-testid="report-checkbox"
        >
          <input
            type="checkbox"
            checked={selectedIds.has(report.id)}
            onChange={() => onToggle(report.id)}
            style={{ width: 18, height: 18, accentColor: 'var(--chakra-colors-brand-500)' }}
          />
          <Text flex="1" fontSize="0.88rem" color="text.primary">
            {report.title}
          </Text>
          <Text fontFamily="mono" fontSize="0.75rem" color="text.muted" flexShrink={0}>
            {new Date(report.reportDate).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </Text>
        </Box>
      ))}
    </Box>
  )
}

function DurationPicker({
  selected,
  customDays,
  onSelect,
  onCustomChange,
}: {
  selected: number | null
  customDays: string
  onSelect: (days: number) => void
  onCustomChange: (value: string) => void
}) {
  return (
    <Box>
      <Flex gap="2" mb="3" flexWrap="wrap">
        {DURATION_OPTIONS.map((opt) => (
          <Button
            key={opt.value}
            borderRadius="full"
            size="sm"
            variant={selected === opt.value ? 'solid' : 'outline'}
            bg={selected === opt.value ? 'action.primary' : 'transparent'}
            color={selected === opt.value ? 'action.primary.text' : 'text.secondary'}
            borderColor="border.default"
            onClick={() => onSelect(opt.value)}
          >
            {opt.label}
          </Button>
        ))}
      </Flex>
      <Flex align="center" gap="2">
        <Input
          type="number"
          placeholder="45"
          value={customDays}
          onChange={(e) => onCustomChange(e.target.value)}
          w="80px"
          bg="bg.glass"
          borderColor="border.default"
          borderRadius="lg"
          fontFamily="mono"
          fontSize="0.85rem"
          textAlign="center"
          aria-label="Custom duration in days"
        />
        <Text fontSize="0.85rem" color="text.muted">
          days
        </Text>
      </Flex>
    </Box>
  )
}
