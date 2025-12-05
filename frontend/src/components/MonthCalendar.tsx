import {
  Box,
  Flex,
  HStack,
  SimpleGrid,
  Spinner,
  Text,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react'
import { useMemo } from 'react'

export type CalendarEventStatus = 'present' | 'late' | 'absent' | 'excused' | 'none'

export type CalendarEvent = {
  id: string
  date: string // "YYYY-MM-DD"
  label: string
  status?: CalendarEventStatus
}

export type MonthCalendarProps = {
  month: Date
  eventsByDate: Record<string, CalendarEvent[]>
  isLoading?: boolean
}

/** Monday-first weekday labels */
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// Local (non-UTC) YYYY-MM-DD
const toLocalIsoDate = (d: Date) => {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Build a flat array of ISO dates (for actual days)
 * and nulls (for leading/trailing padding) for a month grid.
 */
const buildMonthCells = (month: Date): (string | null)[] => {
  const year = month.getFullYear()
  const monthIndex = month.getMonth()

  const firstOfMonth = new Date(year, monthIndex, 1)
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()

  // JS: 0 = Sun, 1 = Mon, ... 6 = Sat → shift to Monday-first
  const jsDow = firstOfMonth.getDay()
  const mondayFirstOffset = (jsDow + 6) % 7
  const leadingBlanks = mondayFirstOffset

  const cells: (string | null)[] = []

  for (let i = 0; i < leadingBlanks; i++) {
    cells.push(null)
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, monthIndex, day)
    cells.push(toLocalIsoDate(date))
  }

  while (cells.length % 7 !== 0) {
    cells.push(null)
  }

  return cells
}

const getStatusStyles = (status: CalendarEventStatus | undefined) => {
  switch (status) {
    case 'present':
      return {
        bg: 'green.100',
        borderColor: 'green.400',
        color: 'green.800',
        fontWeight: 'semibold',
      }
    case 'late':
      return {
        bg: 'yellow.100',
        borderColor: 'yellow.400',
        color: 'yellow.800',
        fontWeight: 'semibold',
      }
    case 'absent':
      return {
        bg: 'red.50',
        borderColor: 'red.300',
        color: 'red.700',
        fontWeight: 'semibold',
      }
    case 'excused':
      return {
        bg: 'blue.50',
        borderColor: 'blue.300',
        color: 'blue.700',
        fontWeight: 'semibold',
      }
    case 'none':
    default:
      return {
        bg: 'transparent',
        borderColor: 'gray.200',
        color: 'gray.700',
        fontWeight: 'normal',
      }
  }
}

export const MonthCalendar = ({ month, eventsByDate, isLoading }: MonthCalendarProps) => {
  const todayIso = toLocalIsoDate(new Date())
  const cells = useMemo(() => buildMonthCells(month), [month])

  const dayBg = useColorModeValue('white', 'gray.900')
  const outsideBg = useColorModeValue('gray.50', 'gray.800')
  const dayBorder = useColorModeValue('gray.200', 'gray.700')
  const headerBg = useColorModeValue('gray.100', 'gray.700')

  if (isLoading) {
    return (
      <Flex align="center" justify="center" minH="200px">
        <Spinner />
      </Flex>
    )
  }

  return (
    <Box>
      {/* Weekday headers */}
      <SimpleGrid columns={7} mb={1} spacing={0.5}>
        {WEEKDAYS.map((day) => (
          <Box
            key={day}
            textAlign="center"
            fontSize="xs"
            fontWeight="semibold"
            textTransform="uppercase"
            letterSpacing="wider"
            py={1}
            bg={headerBg}
            borderRadius="md"
          >
            {day}
          </Box>
        ))}
      </SimpleGrid>

      {/* Month grid */}
      <SimpleGrid columns={7} spacing={0.5}>
        {cells.map((isoDate, idx) => {
          if (!isoDate) {
            return <Box key={idx} p={2} borderRadius="md" bg={outsideBg} minH="80px" />
          }

          const events = eventsByDate[isoDate] ?? []
          const dateObj = new Date(isoDate)
          const dayNumber = dateObj.getDate()
          const isToday = isoDate === todayIso

          return (
            <Box
              key={isoDate}
              p={1.5}
              borderWidth="1px"
              borderColor={dayBorder}
              borderRadius="md"
              bg={dayBg}
              minH="90px"
              _hover={{
                borderColor: 'blue.400',
                boxShadow: 'sm',
              }}
            >
              {/* Day number */}
              <HStack justify="space-between" align="center" mb={1}>
                <Text fontSize="xs" color="gray.500">
                  {dateObj.toLocaleDateString('en-SG', { weekday: 'short' })}
                </Text>
                <Box
                  px={1.5}
                  py={0.5}
                  borderRadius="full"
                  fontSize="xs"
                  fontWeight={isToday ? 'bold' : 'semibold'}
                  bg={isToday ? 'blue.500' : 'gray.100'}
                  color={isToday ? 'white' : 'gray.800'}
                >
                  {dayNumber}
                </Box>
              </HStack>

              {/* Events for that day */}
              <Box display="flex" flexDir="column" gap={1}>
                {events.slice(0, 3).map((evt) => {
                  const styles = getStatusStyles(evt.status)
                  const hasStatus = evt.status && evt.status !== 'none'

                  return (
                    <Tooltip key={evt.id} label={evt.label} placement="top" openDelay={300}>
                      <Box
                        as="button"
                        type="button"
                        width="100%"
                        textAlign="left"
                        px={2}
                        py={0.5}
                        borderRadius="md"
                        borderWidth="1px"
                        fontSize="xs"
                        overflow="hidden"
                        textOverflow="ellipsis"
                        whiteSpace="nowrap"
                        bg={styles.bg}
                        borderColor={styles.borderColor}
                        color={styles.color}
                        fontWeight={styles.fontWeight}
                        _hover={{
                          boxShadow: 'sm',
                          transform: 'translateY(-1px)',
                        }}
                      >
                        {hasStatus && (
                          <Box
                            as="span"
                            display="inline-block"
                            w="6px"
                            h="6px"
                            borderRadius="full"
                            mr={1}
                            bg={
                              evt.status === 'present'
                                ? 'green.400'
                                : evt.status === 'late'
                                  ? 'yellow.400'
                                  : evt.status === 'absent'
                                    ? 'red.400'
                                    : 'blue.400'
                            }
                          />
                        )}
                        {evt.label}
                      </Box>
                    </Tooltip>
                  )
                })}

                {events.length > 3 && (
                  <Text fontSize="xs" color="gray.500">
                    +{events.length - 3} more…
                  </Text>
                )}

                {events.length === 0 && (
                  <Text fontSize="xs" color="gray.300" fontStyle="italic">
                    No activities
                  </Text>
                )}
              </Box>
            </Box>
          )
        })}
      </SimpleGrid>
    </Box>
  )
}
