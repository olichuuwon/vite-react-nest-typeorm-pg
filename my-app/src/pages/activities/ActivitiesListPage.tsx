import {
  Box,
  Button,
  Heading,
  HStack,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Spinner,
  Text,
} from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { useActivities } from '../../hooks/useActivities'

export const ActivitiesListPage = () => {
  const navigate = useNavigate()
  const { activities, isLoading, error } = useActivities()

  return (
    <Box>
      <HStack justify="space-between" mb={4}>
        <Heading size="md">Activities</Heading>
        <Button colorScheme="blue">+ Create Activity</Button>
      </HStack>

      <Box bg="white" p={4} rounded="lg" shadow="sm">
        {isLoading ? (
          <HStack>
            <Spinner size="sm" />
            <Text fontSize="sm">Loading activities…</Text>
          </HStack>
        ) : error ? (
          <Text fontSize="sm" color="red.500">
            {error}
          </Text>
        ) : (
          <Table size="sm">
            <Thead bg="gray.50">
              <Tr>
                <Th>Title</Th>
                <Th>Date</Th>
                <Th>Location</Th>
                <Th />
              </Tr>
            </Thead>
            <Tbody>
              {activities.map((activity) => (
                <Tr key={activity.id}>
                  <Td>{activity.title}</Td>
                  <Td>{activity.date ?? '-'}</Td>
                  <Td>{activity.location ?? '-'}</Td>
                  <Td isNumeric>
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => navigate(`/activities/${activity.id}`)}
                    >
                      View
                    </Button>
                  </Td>
                </Tr>
              ))}

              {activities.length === 0 && (
                <Tr>
                  <Td colSpan={4}>
                    <Text fontSize="sm" color="gray.500">
                      No activities found.
                    </Text>
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        )}
      </Box>
    </Box>
  )
}
