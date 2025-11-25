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
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useMemo, useState } from 'react'

type Activity = {
  id: string
  title: string
  date?: string | null
  location?: string | null
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

export const ActivitiesListPage = () => {
  const navigate = useNavigate()
  const { activities, isLoading, error } = useActivities()

  const [sorting, setSorting] = useState<SortingState>([])

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
        cell: (info) => (info.getValue() as string | null | undefined) ?? '-',
      },
      {
        accessorKey: 'location',
        header: 'Location',
        cell: (info) => (info.getValue() as string | null | undefined) ?? '-',
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <Button
            size="xs"
            variant="outline"
            onClick={() => navigate(`/activities/${row.original.id}`)}
          >
            View
          </Button>
        ),
      },
    ],
    [navigate],
  )

  const table = useReactTable<Activity>({
    data: (activities ?? []) as Activity[],
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

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

              {(!activities || activities.length === 0) && (
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
