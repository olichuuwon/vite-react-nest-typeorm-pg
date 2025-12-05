import { Box, Heading, HStack, Text } from '@chakra-ui/react'
import { useMemo } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { useNavigate } from 'react-router-dom'
import { useUsers } from '../../hooks/useUsers'
import { useAuth } from '../../context/AuthContext'
import { DataTable } from '../../components/DataTable'

type User = {
  id: string
  name: string
  identifier: string
  role: 'admin' | 'member'
}

export const UsersListPage = () => {
  const { user: currentUser } = useAuth()
  const isAdmin = currentUser?.role === 'admin'

  const { users, isLoading, error } = useUsers()
  const navigate = useNavigate()

  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: (info) => info.getValue() as string,
      },
      {
        accessorKey: 'identifier',
        header: 'Identifier',
        cell: (info) => info.getValue() as string,
      },
      {
        accessorKey: 'role',
        header: 'Role',
        cell: (info) => info.getValue() as string,
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        cell: ({ row }) => {
          const rowUser = row.original

          return (
            <HStack spacing={2} justify="flex-end">
              <Text
                as="button"
                fontSize="xs"
                px={3}
                py={1}
                borderWidth="1px"
                borderRadius="md"
                onClick={() => navigate(`/users/${rowUser.id}`)}
              >
                View
              </Text>
            </HStack>
          )
        },
      },
    ],
    [navigate],
  )

  // if somehow a non-admin reaches here
  if (!isAdmin) {
    return (
      <Box>
        <Box
          bg="white"
          p={6}
          rounded="lg"
          shadow="sm"
          borderWidth="1px"
          borderColor="gray.200"
          mb={4}
          w="100%"
        >
          <Heading size="md" mb={4} color="gray.800">
            Users
          </Heading>
          <Text fontSize="sm" color="gray.600">
            You do not have permission to view this page.
          </Text>
        </Box>
      </Box>
    )
  }

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
          <Heading size="md" color="gray.800">
            Users
          </Heading>
        </HStack>

        <DataTable<User>
          columns={columns}
          data={(users ?? []) as User[]}
          isLoading={isLoading}
          error={error ?? null}
          emptyText="No users found."
          getRowId={(row) => row.id}
          tableSize="sm"
        />
      </Box>
    </Box>
  )
}
