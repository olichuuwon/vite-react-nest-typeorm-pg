import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Text,
  useToast,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { AttendanceStatus, AttendanceRecordDto } from '../../../../shared/dto/attendance.dto'
import type { ActivityDto } from '../../../../shared/dto/activity.dto'
import { markAttendanceForActivity } from '../../api/attendance'

type MarkAttendanceModalProps = {
  isOpen: boolean
  onClose: () => void
  activity: ActivityDto | null
  currentUserId: string | null
  canMark: boolean
}

type MarkAttendanceVariables = {
  activityId: string
  userId: string
  status: AttendanceStatus
}

const getErrorMessage = (err: unknown): string | null => {
  if (!err) return null
  if (typeof err === 'string') return err
  if (err instanceof Error) return err.message
  return 'Something went wrong'
}

export const MarkAttendanceModal = ({
  isOpen,
  onClose,
  activity,
  currentUserId,
  canMark,
}: MarkAttendanceModalProps) => {
  const toast = useToast()
  const queryClient = useQueryClient()

  const [status, setStatus] = useState<AttendanceStatus>('present')

  // Reset status when modal opens / activity changes
  useEffect(() => {
    if (isOpen) setStatus('present')
  }, [isOpen, activity?.id])

  const { mutate: submit, isPending } = useMutation<
    AttendanceRecordDto,
    unknown,
    MarkAttendanceVariables
  >({
    mutationFn: ({ activityId, userId, status }) =>
      markAttendanceForActivity(activityId, userId, status),

    onSuccess: () => {
      toast({
        title: 'Attendance marked',
        status: 'success',
        duration: 2500,
        isClosable: true,
      })

      if (currentUserId) {
        const key = ['attendance', 'byUser', currentUserId] as const
        queryClient.invalidateQueries({ queryKey: key })
      }

      onClose()
    },

    onError: (err) => {
      toast({
        title: 'Failed to mark attendance',
        description: getErrorMessage(err),
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    },
  })

  const handleConfirm = () => {
    if (!activity || !currentUserId || !canMark) return

    submit({
      activityId: activity.id,
      userId: currentUserId,
      status,
    })
  }

  const isConfirmDisabled = !activity || !currentUserId || !canMark || isPending

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Mark attendance</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {activity ? (
            <>
              <Text fontSize="sm" mb={3}>
                Mark attendance for <strong>{activity.title}</strong>
              </Text>

              <Text fontSize="xs" color="gray.600" mb={1}>
                Attendance status
              </Text>

              <Select
                size="sm"
                value={status}
                onChange={(e) => setStatus(e.target.value as AttendanceStatus)}
              >
                <option value="present">Present</option>
                <option value="late">Late</option>
                <option value="excused">Excused</option>
                <option value="absent">Absent</option>
              </Select>
            </>
          ) : (
            <Text fontSize="sm" color="gray.500">
              No activity selected.
            </Text>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleConfirm}
            isDisabled={isConfirmDisabled}
            isLoading={isPending}
          >
            Confirm
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
