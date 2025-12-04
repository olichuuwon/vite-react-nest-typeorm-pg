import {
  Badge,
  Box,
  Button,
  Heading,
  HStack,
  Spinner,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from '@chakra-ui/react'
import { useMemo } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { useNavigate, useParams } from 'react-router-dom'
import { useUser } from '../../hooks/useUser'
import { useUserAttendance } from '../../hooks/useUserAttendance'
import { useUserCreatedActivities } from '../../hooks/useUserCreatedActivities'
import { DataTable } from '../../components/DataTable'

type AttendanceRecordRow = {
  id: string
  status: string
  checkedInAt?: string | null
  activity?: {
    title?: string | null
  } | null
}

type CreatedActivityRow = {
  id: string
  title: string
  date?: string | null
  location?: string | null
}

export const UserDetailPage = () => {
  const { userId } = useParams()
  const navigate = useNavigate()

  const { user, isLoading, error } = useUser(userId)
  const {
    records,
    isLoading: isLoadingAttendance,
    error: attendanceError,
  } = useUserAttendance(userId)
  const {
    activities,
    isLoading: isLoadingCreated,
    error: createdError,
  } = useUserCreatedActivities(userId)

  const attendanceColumns = useMemo<ColumnDef<AttendanceRecordRow>[]>(
    () => [
      {
        id: 'activityTitle',
        header: 'Activity',
        accessorFn: (row) => row.activity?.title ?? '-',
        cell: (info) => info.getValue<string>(),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: (info) => info.getValue<string>(),
      },
      {
        id: 'checkedInAt',
        header: 'Checked in at',
        accessorFn: (row) => row.checkedInAt,
        cell: (info) => {
          const value = info.getValue<string | null | undefined>()
          if (!value) return '-'

          return new Date(value).toLocaleString('en-SG', {
            dateStyle: 'medium',
            timeStyle: 'short',
          })
        },
      },
    ],
    [],
  )

  const createdActivitiesColumns = useMemo<ColumnDef<CreatedActivityRow>[]>(
    () => [
      {
        accessorKey: 'title',
        header: 'Title',
        cell: (info) => info.getValue<string>(),
      },
      {
        id: 'date',
        header: 'Date',
        accessorFn: (row) => row.date,
        cell: (info) => {
          const value = info.getValue<string | null | undefined>()
          if (!value) return '-'

          return new Date(value).toLocaleDateString('en-SG', {
            dateStyle: 'medium',
          })
        },
      },
      {
        accessorKey: 'location',
        header: 'Location',
        cell: (info) => info.getValue<string | null>() ?? '-',
      },
    ],
    [],
  )

  const userErrorMessage =
    typeof error === 'string' ? error : error instanceof Error ? error.message : null

  return (
    <Box>
      <Box bg="white" p={6} rounded="lg" shadow="sm" borderWidth="1px" borderColor="gray.200">
        {/* Header row */}
        <HStack justify="space-between" mb={4}>
          <Heading size="md">User details</Heading>
          <Button size="sm" variant="outline" onClick={() => navigate('/users')}>
            Back to users
          </Button>
        </HStack>

        {/* User summary block */}
        <Box mb={6}>
          {isLoading ? (
            <HStack>
              <Spinner size="sm" />
              <Text fontSize="sm">Loading user…</Text>
            </HStack>
          ) : userErrorMessage ? (
            <Text fontSize="sm" color="red.500">
              {userErrorMessage}
            </Text>
          ) : !user ? (
            <Text fontSize="sm" color="gray.500">
              User not found.
            </Text>
          ) : (
            <Stack spacing={3}>
              <HStack justify="space-between" align="flex-start">
                <Box>
                  <Heading size="md">{user.name}</Heading>
                  <Text fontSize="sm" color="gray.600">
                    {user.identifier}
                  </Text>
                  {user.email && (
                    <Text fontSize="sm" color="gray.600">
                      {user.email}
                    </Text>
                  )}
                </Box>
                <Badge colorScheme={user.role === 'admin' ? 'red' : 'blue'}>{user.role}</Badge>
              </HStack>

              <HStack spacing={6} pt={2}>
                <Box>
                  <Text fontSize="xs" color="gray.500" textTransform="uppercase">
                    Created at
                  </Text>
                  <Text fontSize="sm">
                    {new Date(user.createdAt).toLocaleString('en-SG', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="xs" color="gray.500" textTransform="uppercase">
                    Updated at
                  </Text>
                  <Text fontSize="sm">
                    {new Date(user.updatedAt).toLocaleString('en-SG', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </Text>
                </Box>
              </HStack>
            </Stack>
          )}
        </Box>

        {/* Tabs for attendance + created activities */}
        <Tabs variant="enclosed">
          <TabList>
            <Tab>Attendance records</Tab>
            <Tab>Created activities</Tab>
          </TabList>
          <TabPanels>
            {/* Attendance tab */}
            <TabPanel px={0} pt={4}>
              <DataTable<AttendanceRecordRow>
                columns={attendanceColumns}
                data={(records ?? []) as AttendanceRecordRow[]}
                isLoading={isLoadingAttendance}
                error={attendanceError ?? null}
                emptyText="No attendance records."
                getRowId={(row) => row.id}
                tableSize="sm"
              />
            </TabPanel>

            {/* Created activities tab */}
            <TabPanel px={0} pt={4}>
              <DataTable<CreatedActivityRow>
                columns={createdActivitiesColumns}
                data={(activities ?? []) as CreatedActivityRow[]}
                isLoading={isLoadingCreated}
                error={createdError ?? null}
                emptyText="No activities created by this user."
                getRowId={(row) => row.id}
                tableSize="sm"
              />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Box>
  )
}
