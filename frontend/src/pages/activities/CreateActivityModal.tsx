// frontend/src/pages/activities/CreateActivityModal.tsx
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useToast,
  VStack,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createActivity } from '../../api/activities'

type CreateActivityModalProps = {
  isOpen: boolean
  onClose: () => void
}

const getErrorMessage = (err: unknown): string | null => {
  if (!err) return null
  if (typeof err === 'string') return err
  if (err instanceof Error) return err.message
  return 'Something went wrong'
}

export const CreateActivityModal = ({ isOpen, onClose }: CreateActivityModalProps) => {
  const toast = useToast()
  const queryClient = useQueryClient()

  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [location, setLocation] = useState('')

  // Reset form whenever modal closes
  useEffect(() => {
    if (!isOpen) {
      setTitle('')
      setDate('')
      setLocation('')
    }
  }, [isOpen])

  const { mutate: createActivityMutation, isPending: isCreatePending } = useMutation({
    mutationFn: createActivity,
    onSuccess: () => {
      toast({
        title: 'Activity created',
        status: 'success',
        duration: 2500,
        isClosable: true,
      })
      queryClient.invalidateQueries({ queryKey: ['activities'] })
      onClose()
    },
    onError: (err) => {
      const message = getErrorMessage(err) ?? 'Unable to create activity.'
      toast({
        title: 'Create failed',
        description: message,
        status: 'error',
        duration: 4000,
        isClosable: true,
      })
    },
  })

  const handleConfirm = () => {
    createActivityMutation({
      title: title.trim(),
      date: date || null,
      location: location.trim() || null,
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create activity</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack align="stretch" spacing={3}>
            <FormControl isRequired>
              <FormLabel fontSize="sm">Title</FormLabel>
              <Input
                size="sm"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. IPPT Training"
              />
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm">Date</FormLabel>
              <Input size="sm" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm">Location</FormLabel>
              <Input
                size="sm"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Kranji Camp III"
              />
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            isDisabled={!title.trim() || isCreatePending}
            isLoading={isCreatePending}
            onClick={handleConfirm}
          >
            Confirm
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
