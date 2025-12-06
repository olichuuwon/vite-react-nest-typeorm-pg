import { Box, Button, Heading, HStack, useDisclosure } from '@chakra-ui/react'
import { useMemo, useState } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { useNavigate } from 'react-router-dom'

import { useActivities } from '../../hooks/useActivities'
import { useUserAttendance } from '../../hooks/useUserAttendance'
import { useAuth } from '../../context/AuthContext'
import { DataTable } from '../../components/DataTable'
import type { AttendanceRecordDto } from '../../../../shared/dto/attendance.dto'
import type { ActivityDto } from '../../../../shared/dto/activity.dto'

import { CreateActivityModal } from './CreateActivityModal'
import { ViewActivityModal } from './ViewActivityModal'
import { MarkAttendanceModal } from './MarkAttendanceModal'

type Activity = ActivityDto

const getErrorMessage = (err: unknown): string | null => {
  if (!err) return null
  if (typeof err === 'string') return err
  if (err instanceof Error) return err.message
  return 'Something went wrong'
}

export const ActivitiesListPage = () => {
  const navigate = useNavigate()
  const { user: me, isAuthenticated } = useAuth()

  const { activities, isLoading: isActivitiesLoading, error: activitiesError } = useActivities()

  const {
    records: attendanceRecords,
    isLoading: isAttendanceLoading,
    error: attendanceError,
  } = useUserAttendance(me?.id)

  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)

  const { isOpen: isCreateOpen, onOpen: onOpenCreate, onClose: onCloseCreate } = useDisclosure()

  const { isOpen: isViewOpen, onOpen: onOpenView, onClose: onCloseView } = useDisclosure()

  const { isOpen: isMarkOpen, onOpen: onOpenMark, onClose: onCloseMark } = useDisclosure()

  // Map of activityId -> attendance record for current user
  const attendanceByActivityId = useMemo(() => {
    const map = new Map<string, AttendanceRecordDto>()
    for (const record of attendanceRecords ?? []) {
      map.set(record.activityId, record)
    }
    return map
  }, [attendanceRecords])

  const hasAttendanceForActivity = (activityId: string) => attendanceByActivityId.has(activityId)

  const columns: ColumnDef<Activity>[] = [
    {
      accessorKey: 'title',
      header: 'Title',
      cell: (info) => info.getValue() as string,
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: (info) => {
        const value = info.getValue() as string | null | undefined
        if (!value) return '-'

        return new Date(value).toLocaleDateString('en-SG', {
          dateStyle: 'medium',
        })
      },
    },
    {
      accessorKey: 'location',
      header: 'Location',
      cell: (info) => (info.getValue() as string | null | undefined) ?? '-',
    },
    {
      id: 'actions',
      header: '',
      enableSorting: false,
      cell: ({ row }) => {
        const activity = row.original
        const hasMarked = hasAttendanceForActivity(activity.id)

        const canViewAdminAttendance = me?.role === 'admin'

        return (
          <HStack spacing={2} justify="flex-end">
            <Button
              variant="outline"
              size="xs"
              onClick={() => {
                setSelectedActivity(activity)
                onOpenView()
              }}
            >
              View details
            </Button>

            <Button
              variant="outline"
              size="xs"
              onClick={() => {
                if (!hasMarked && isAuthenticated) {
                  setSelectedActivity(activity)
                  onOpenMark()
                }
              }}
              isDisabled={hasMarked || !isAuthenticated}
            >
              {hasMarked ? 'Attendance marked' : 'Mark attendance'}
            </Button>

            {canViewAdminAttendance && (
              <Button
                variant="outline"
                size="xs"
                onClick={() => {
                  navigate(`/admin/activities/${activity.id}/attendance`)
                }}
              >
                Manage attendance
              </Button>
            )}
          </HStack>
        )
      },
    },
  ]

  const combinedError: string | null =
    getErrorMessage(activitiesError) || getErrorMessage(attendanceError)

  const isAnyLoading = isActivitiesLoading || isAttendanceLoading

  const selectedAttendance = selectedActivity && attendanceByActivityId.get(selectedActivity.id)

  const canMarkSelected =
    !!selectedActivity && !!me && !attendanceByActivityId.has(selectedActivity.id)

  return (
    <Box>
      <Box
        bg="white"
        p={6}
        rounded="lg"
        shadow="sm"
        borderWidth="1px"
        borderColor="gray.200"
        w="100%"
      >
        <HStack justify="space-between" mb={4}>
          <Heading size="md">Activities</Heading>

          <Button size="sm" colorScheme="blue" onClick={onOpenCreate} isDisabled={!isAuthenticated}>
            Create activity
          </Button>
        </HStack>

        <DataTable<Activity>
          columns={columns}
          data={(activities ?? []) as Activity[]}
          isLoading={isAnyLoading}
          error={combinedError}
          emptyText="No activities found."
          getRowId={(row) => row.id}
          tableSize="sm"
        />
      </Box>

      <CreateActivityModal isOpen={isCreateOpen} onClose={onCloseCreate} />

      <ViewActivityModal
        isOpen={isViewOpen}
        onClose={onCloseView}
        activity={selectedActivity}
        attendance={selectedAttendance ?? null}
      />

      <MarkAttendanceModal
        isOpen={isMarkOpen}
        onClose={onCloseMark}
        activity={selectedActivity}
        currentUserId={me?.id ?? null}
        canMark={canMarkSelected}
      />
    </Box>
  )
}
