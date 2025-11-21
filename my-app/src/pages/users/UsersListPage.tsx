import { Box, Button, Heading, HStack, Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'

export const UsersListPage = () => {
  const navigate = useNavigate()

  return (
    <Box>
      <HStack justify="space-between" mb={4}>
        <Heading size="md">Users</Heading>
        <Button colorScheme="blue">+ Create User</Button>
      </HStack>

      <Box bg="white" p={4} rounded="lg" shadow="sm">
        <Table size="sm">
          <Thead bg="gray.50">
            <Tr>
              <Th>Name</Th>
              <Th>Identifier</Th>
              <Th>Role</Th>
              <Th />
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td>Alice</Td>
              <Td>S123456A</Td>
              <Td>admin</Td>
              <Td isNumeric>
                <Button size="xs" variant="outline" onClick={() => navigate('/users/1')}>
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
