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
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUsers } from '../../hooks/useUsers'
import { useAuth } from '../../context/AuthContext'

type User = {
  id: string
  name: string
  identifier: string
  role: 'admin' | 'member'
}

const getSortIcon = (state?: string) => {
  switch (state) {
    case 'desc':
      return ' ↑'
    case 'asc':
      return ' ↓'
    default:
      return ' ⇅'
  }
}

export const UsersListPage = () => {
  const { user: currentUser } = useAuth()
  const isAdmin = currentUser?.role === 'admin'

  const { users, isLoading, error } = useUsers()
  const [sorting, setSorting] = useState<SortingState>([])
  const navigate = useNavigate()

  const handleView = (id: string) => {
    navigate(`/users/${id}`)
  }

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
        cell: ({ row }) => {
          const rowUser = row.original

          return (
            <HStack spacing={2} justify="flex-end">
              <Button size="xs" variant="outline" onClick={() => handleView(rowUser.id)}>
                View
              </Button>
            </HStack>
          )
        },
      },
    ],
    [],
  )

  const table = useReactTable<User>({
    data: (users ?? []) as User[],
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  // if somehow a non-admin reaches here
  if (!isAdmin) {
    return (
      <Box>
        <Heading size="md" mb={4}>
          Users
        </Heading>
        <Box bg="white" p={4} rounded="lg" shadow="sm">
          <Text fontSize="sm" color="gray.600">
            You do not have permission to view this page.
          </Text>
        </Box>
      </Box>
    )
  }

  return (
    <Box>
      <HStack justify="space-between" mb={2}>
        <Heading size="md">Users</Heading>
      </HStack>

      <Box bg="white" p={4} rounded="lg" shadow="sm">
        {isLoading ? (
          <HStack>
            <Spinner size="sm" />
            <Text fontSize="sm">Loading users…</Text>
          </HStack>
        ) : error ? (
          <Text fontSize="sm" color="red.500">
            {error}
          </Text>
        ) : (
          <Table size="sm">
            <Thead bg="gray.50">
              {table.getHeaderGroups().map((headerGroup) => (
                <Tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <Th
                      key={header.id}
                      cursor={header.column.getCanSort() ? 'pointer' : 'default'}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        <Text as="span" ml={1}>
                          {getSortIcon(header.column.getIsSorted() as string | undefined)}
                        </Text>
                      )}
                    </Th>
                  ))}
                </Tr>
              ))}
            </Thead>
            <Tbody>
              {table.getRowModel().rows.map((row) => (
                <Tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <Td key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </Td>
                  ))}
                </Tr>
              ))}

              {(!users || users.length === 0) && (
                <Tr>
                  <Td colSpan={4}>
                    <Text fontSize="sm" color="gray.500">
                      No users found.
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
