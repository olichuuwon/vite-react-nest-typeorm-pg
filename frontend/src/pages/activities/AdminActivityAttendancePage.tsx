// frontend/src/pages/AdminActivityAttendancePage.tsx
import { Box, Heading, Text, Button, useToast, HStack } from '@chakra-ui/react'
import { useParams, useNavigate } from 'react-router-dom'
import { type ColumnDef } from '@tanstack/react-table'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useAttendanceByActivity } from '../../hooks/useAttendanceByActivity'
import { useRemoveAttendance } from '../../hooks/useRemoveAttendance'
import { DataTable } from '../../components/DataTable'
import type { AttendanceRecordDto } from '../../../../shared/dto/attendance.dto'
import { deleteActivity as deleteActivityApi } from '../../api/activities'

export const AdminActivityAttendancePage = () => {
  const { activityId } = useParams<{ activityId: string }>()
  const toast = useToast()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  if (!activityId) {
    return <Text>No activity selected.</Text>
  }

  const { records, isLoading, error } = useAttendanceByActivity(activityId)

  const { mutate: removeAttendance, isPending: isRemoving } = useRemoveAttendance()

  // Delete activity mutation – only allowed when there are no records
  const { mutate: deleteActivity, isPending: isDeleting } = useMutation<void, unknown, string>({
    mutationFn: (id: string) => deleteActivityApi(id),
    onSuccess: () => {
      toast({
        title: 'Activity deleted',
        status: 'success',
        duration: 2500,
        isClosable: true,
      })
      // Refresh activities list and go back
      queryClient.invalidateQueries({ queryKey: ['activities'] })
      navigate('/activities')
    },
    onError: () => {
      toast({
        title: 'Failed to delete activity',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    },
  })

  const canDeleteActivity = records.length === 0

  const columns: ColumnDef<AttendanceRecordDto>[] = [
    {
      accessorKey: 'userName',
      header: 'User',
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: (info) => String(info.getValue() ?? '').replace(/^\w/, (c) => c.toUpperCase()),
    },
    {
      accessorKey: 'checkedInAt',
      header: 'Marked at',
      cell: (info) => {
        const v = info.getValue() as string | null
        return v
          ? new Date(v).toLocaleString('en-SG', {
              dateStyle: 'medium',
              timeStyle: 'short',
            })
          : '—'
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const record = row.original
        return (
          <HStack justify="flex-end">
            <Button
              size="xs"
              variant="outline"
              colorScheme="red"
              isDisabled={isRemoving}
              onClick={() =>
                removeAttendance(
                  {
                    id: record.id,
                    userId: record.userId,
                    activityId: record.activityId,
                  },
                  {
                    onSuccess: () => {
                      toast({
                        title: 'Attendance removed',
                        status: 'success',
                        duration: 2000,
                      })
                    },
                    onError: () => {
                      toast({
                        title: 'Failed to remove attendance',
                        status: 'error',
                        duration: 3000,
                      })
                    },
                  },
                )
              }
            >
              Remove
            </Button>
          </HStack>
        )
      },
    },
  ]

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
          <Heading size="md">Attendance for activity</Heading>

          <Button
            size="sm"
            colorScheme="red"
            variant="outline"
            isDisabled={!canDeleteActivity || isDeleting}
            isLoading={isDeleting}
            onClick={() => {
              deleteActivity(activityId)
            }}
          >
            Delete activity
          </Button>
        </HStack>

        <DataTable<AttendanceRecordDto>
          columns={columns}
          data={records}
          isLoading={isLoading}
          error={error ? error.message : null}
          emptyText="No attendance records yet."
          getRowId={(row) => row.id}
          tableSize="sm"
        />
      </Box>
    </Box>
  )
}
