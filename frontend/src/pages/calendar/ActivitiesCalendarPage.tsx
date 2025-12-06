import {
  Box,
  Heading,
  HStack,
  IconButton,
  Text,
  useBreakpointValue,
  VStack,
} from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons'

import { useActivities } from '../../hooks/useActivities'
import { useUserAttendance } from '../../hooks/useUserAttendance'
import { useAuth } from '../../context/AuthContext'
import {
  type CalendarEvent,
  MonthCalendar,
  type CalendarEventStatus,
} from '../../components/MonthCalendar'

import type { ActivityDto } from '../../../../shared/dto/activity.dto'

type Activity = ActivityDto

const parseYearMonthFromActivities = (activities: Activity[]): Date => {
  const firstWithDate = activities.find((a) => a.date)
  if (!firstWithDate?.date) return new Date()
  return new Date(firstWithDate.date + 'T00:00:00')
}

const toYearMonthLabel = (d: Date) =>
  d.toLocaleDateString('en-SG', { month: 'long', year: 'numeric' })

const addMonths = (d: Date, delta: number) => {
  const copy = new Date(d)
  copy.setMonth(copy.getMonth() + delta)
  return copy
}

const getErrorMessage = (err: unknown): string | null => {
  if (!err) return null
  if (typeof err === 'string') return err
  if (err instanceof Error) return err.message
  return 'Something went wrong'
}

const LegendItem = ({
  label,
  color,
  outlined,
}: {
  label: string
  color: string
  outlined?: boolean
}) => (
  <HStack spacing={1.5}>
    <Box
      w="10px"
      h="10px"
      borderRadius="full"
      bg={outlined ? 'transparent' : color}
      borderWidth="1px"
      borderColor={outlined ? color : 'transparent'}
    />
    <Text fontSize="xs" color="gray.600">
      {label}
    </Text>
  </HStack>
)

export const ActivitiesCalendarPage = () => {
  const { activities, isLoading: isActivitiesLoading, error: activitiesError } = useActivities()
  const { user: me } = useAuth() as { user?: { id: string } | null }

  const {
    records: attendanceRecords,
    isLoading: isAttendanceLoading,
    error: attendanceError,
  } = useUserAttendance(me?.id)

  const [month, setMonth] = useState<Date | null>(null)

  useEffect(() => {
    if (!month && activities && activities.length > 0) {
      setMonth(parseYearMonthFromActivities(activities as Activity[]))
    }
  }, [activities, month])

  const effectiveMonth = month ?? new Date()
  const isMobile = useBreakpointValue({ base: true, md: false })

  // Map user attendance into {activityId -> status}
  const statusByActivityId = useMemo(() => {
    const map: Record<string, CalendarEventStatus> = {}
    for (const record of attendanceRecords ?? []) {
      map[record.activityId] = record.status as CalendarEventStatus
    }
    return map
  }, [attendanceRecords])

  // Map into {date -> CalendarEvent[]}
  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {}

    if (!activities) return map

    for (const activity of activities as Activity[]) {
      if (!activity.date) continue

      const status: CalendarEventStatus = statusByActivityId[activity.id] ?? 'none'

      const evt: CalendarEvent = {
        id: activity.id,
        date: activity.date,
        label: activity.title,
        status,
      }

      if (!map[activity.date]) {
        map[activity.date] = []
      }
      map[activity.date].push(evt)
    }

    // Sort labels alphabetically inside each date
    for (const events of Object.values(map)) {
      events.sort((a, b) => a.label.localeCompare(b.label))
    }

    return map
  }, [activities, statusByActivityId])

  const handlePrevMonth = () => setMonth((prev) => addMonths(prev ?? new Date(), -1))
  const handleNextMonth = () => setMonth((prev) => addMonths(prev ?? new Date(), 1))

  const isLoading = isActivitiesLoading || isAttendanceLoading
  const combinedError = getErrorMessage(activitiesError) || getErrorMessage(attendanceError)

  return (
    <Box>
      <Box bg="white" p={6} rounded="lg" shadow="sm" borderWidth="1px" borderColor="gray.200">
        <Heading size="md" mb={4}>
          Calendar
        </Heading>
        <VStack align="stretch" spacing={4}>
          {/* Header */}
          <HStack justify="space-between" align="center">
            {/* Month navigation */}
            <HStack spacing={2}>
              <IconButton
                aria-label="Previous month"
                icon={<ChevronLeftIcon />}
                size={isMobile ? 'sm' : 'md'}
                variant="ghost"
                onClick={handlePrevMonth}
              />
              <IconButton
                aria-label="Next month"
                icon={<ChevronRightIcon />}
                size={isMobile ? 'sm' : 'md'}
                variant="ghost"
                onClick={handleNextMonth}
              />

              <Text fontWeight="semibold" fontSize={isMobile ? 'sm' : 'md'}>
                {toYearMonthLabel(effectiveMonth)}
              </Text>
            </HStack>

            {/* Legend */}
            <HStack
              spacing={3}
              px={3}
              py={2}
              bg="gray.50"
              borderRadius="full"
              borderWidth="1px"
              borderColor="gray.200"
            >
              <LegendItem label="Present" color="green.400" />
              <LegendItem label="Late" color="yellow.400" />
              <LegendItem label="Absent" color="red.400" />
              <LegendItem label="Excused" color="blue.400" />
              <LegendItem label="Not marked" color="gray.400" outlined />
            </HStack>
          </HStack>

          {/* Error */}
          {combinedError && (
            <Text fontSize="sm" color="red.500">
              {combinedError}
            </Text>
          )}

          {/* Calendar */}
          <MonthCalendar month={effectiveMonth} eventsByDate={eventsByDate} isLoading={isLoading} />
        </VStack>
      </Box>
    </Box>
  )
}
