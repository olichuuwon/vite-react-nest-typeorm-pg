import {
  Box,
  Button,
  Heading,
  HStack,
  Text,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
} from '@chakra-ui/react'
import { useMemo, useState } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { useActivities } from '../../hooks/useActivities'
import { DataTable } from '../../components/DataTable'

type Activity = {
  id: string
  title: string
  date?: string | null
  location?: string | null
}

export const ActivitiesListPage = () => {
  const { activities, isLoading, error } = useActivities()

  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)

  const { isOpen: isCreateOpen, onOpen: onOpenCreate, onClose: onCloseCreate } = useDisclosure()

  const { isOpen: isViewOpen, onOpen: onOpenView, onClose: onCloseView } = useDisclosure()

  const { isOpen: isCheckInOpen, onOpen: onOpenCheckIn, onClose: onCloseCheckIn } = useDisclosure()

  const handleOpenView = (activity: Activity) => {
    setSelectedActivity(activity)
    onOpenView()
  }

  const handleOpenCheckIn = (activity: Activity) => {
    setSelectedActivity(activity)
    onOpenCheckIn()
  }

  const columns = useMemo<ColumnDef<Activity>[]>(
    () => [
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

          return (
            <HStack spacing={2} justify="flex-end">
              <Text
                as="button"
                fontSize="xs"
                px={3}
                py={1}
                borderWidth="1px"
                borderRadius="md"
                onClick={() => handleOpenCheckIn(activity)}
              >
                Check in
              </Text>
              <Text
                as="button"
                fontSize="xs"
                px={3}
                py={1}
                borderWidth="1px"
                borderRadius="md"
                onClick={() => handleOpenView(activity)}
              >
                View details
              </Text>
            </HStack>
          )
        },
      },
    ],
    [handleOpenCheckIn, handleOpenView],
  )

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

          <Button size="sm" colorScheme="blue" onClick={onOpenCreate}>
            Create activity
          </Button>
        </HStack>

        <DataTable<Activity>
          columns={columns}
          data={(activities ?? []) as Activity[]}
          isLoading={isLoading}
          error={error ?? null}
          emptyText="No activities found."
          getRowId={(row) => row.id}
          tableSize="sm"
        />
      </Box>

      {/* Create Activity modal */}
      <Modal isOpen={isCreateOpen} onClose={onCloseCreate} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create activity</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontSize="sm" color="gray.600">
              TODO: activity creation form.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onCloseCreate}>
              Cancel
            </Button>
            <Button colorScheme="blue" isDisabled>
              Comfirm
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {/* View Activity modal */}
      <Modal isOpen={isViewOpen} onClose={onCloseView} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Activity details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedActivity ? (
              <>
                <Heading size="sm" mb={1}>
                  {selectedActivity.title}
                </Heading>

                <Text fontSize="sm" color="gray.600">
                  {selectedActivity.date
                    ? new Date(selectedActivity.date).toLocaleDateString('en-SG', {
                        dateStyle: 'medium',
                      })
                    : 'No date set'}
                </Text>

                <Text fontSize="sm" color="gray.600">
                  {selectedActivity.location || 'No location set'}
                </Text>
              </>
            ) : (
              <Text fontSize="sm" color="gray.500">
                No activity selected.
              </Text>
            )}
          </ModalBody>

          <ModalFooter gap={3}>
            <Button variant="ghost" onClick={onCloseView}>
              Close
            </Button>

            {selectedActivity && (
              <Button
                colorScheme="blue"
                onClick={() => {
                  onCloseView()
                  onOpenCheckIn()
                }}
              >
                Proceed to check in
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Check-in modal */}
      <Modal isOpen={isCheckInOpen} onClose={onCloseCheckIn}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Check in</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedActivity ? (
              <Text fontSize="sm">TODO: check-in for {selectedActivity.title}.</Text>
            ) : (
              <Text fontSize="sm" color="gray.500">
                No activity selected.
              </Text>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onCloseCheckIn}>
              Cancel
            </Button>
            <Button colorScheme="blue" isDisabled>
              Confirm
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}
