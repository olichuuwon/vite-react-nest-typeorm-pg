import {
  Box,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  Heading,
} from '@chakra-ui/react'
import type { ActivityDto } from '../../../../shared/dto/activity.dto'
import type { AttendanceRecordDto } from '../../../../shared/dto/attendance.dto'

type ViewActivityModalProps = {
  isOpen: boolean
  onClose: () => void
  activity: ActivityDto | null
  attendance: AttendanceRecordDto | null
}

export const ViewActivityModal = ({
  isOpen,
  onClose,
  activity,
  attendance,
}: ViewActivityModalProps) => {
  const formattedDate =
    activity?.date &&
    new Date(activity.date).toLocaleDateString('en-SG', {
      dateStyle: 'medium',
    })

  const createdByLabel =
    activity?.createdByName ??
    (activity?.createdByUserId ? `User ID: ${activity.createdByUserId}` : null)

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Activity details</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {activity ? (
            <>
              <Heading size="sm" mb={1}>
                {activity.title}
              </Heading>

              <Text fontSize="sm" color="gray.600">
                {formattedDate || 'No date set'}
              </Text>

              <Text fontSize="sm" color="gray.600" mb={2}>
                {activity.location || 'No location set'}
              </Text>

              {createdByLabel && (
                <Text fontSize="xs" color="gray.500" mb={2}>
                  Created by: <strong>{createdByLabel}</strong>
                </Text>
              )}

              {attendance && (
                <Box
                  mt={4}
                  mb={2}
                  p={3}
                  borderWidth="1px"
                  borderRadius="md"
                  borderColor="gray.200"
                  bg="gray.50"
                >
                  <Text fontSize="xs" color="gray.600" mb={1}>
                    Your attendance
                  </Text>
                  <Text fontSize="sm">
                    Status: <strong>{attendance.status}</strong>
                  </Text>
                </Box>
              )}
            </>
          ) : (
            <Text fontSize="sm" color="gray.500">
              No activity selected.
            </Text>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
