import { Box, Button, Heading, HStack, Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'

export const ActivitiesListPage = () => {
  const navigate = useNavigate()

  return (
    <Box>
      <HStack justify="space-between" mb={4}>
        <Heading size="md">Activities</Heading>
        <Button colorScheme="blue">+ Create Activity</Button>
      </HStack>

      <Box bg="white" p={4} rounded="lg" shadow="sm">
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
            <Tr>
              <Td>Example Activity</Td>
              <Td>2025-11-20</Td>
              <Td>HQ</Td>
              <Td isNumeric>
                <Button size="xs" variant="outline" onClick={() => navigate('/activities/1')}>
                  View
                </Button>
              </Td>
            </Tr>
          </Tbody>
        </Table>
      </Box>
    </Box>
  )
}
