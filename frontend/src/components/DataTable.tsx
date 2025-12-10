import { Box, HStack, Spinner, Table, Tbody, Td, Text, Th, Thead, Tr } from '@chakra-ui/react'
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useMemo, useState } from 'react'

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

export type DataTableProps<TData extends object> = {
  columns: ColumnDef<TData, any>[]
  data: TData[]
  isLoading?: boolean
  error?: string | Error | null
  emptyText?: string
  getRowId?: (row: TData, index: number) => string
  tableSize?: 'sm' | 'md' | 'lg'
}

export function DataTable<TData extends object>({
  columns,
  data,
  isLoading,
  error,
  emptyText = 'No records found.',
  getRowId,
  tableSize = 'sm',
}: Readonly<DataTableProps<TData>>) {
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable<TData>({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId,
  })

  const visibleColumnCount = useMemo(() => table.getVisibleLeafColumns().length || 1, [table])

  const errorMessage =
    typeof error === 'string' ? error : error instanceof Error ? error.message : null

  return (
    <Box bg="white" p={4} rounded="lg" shadow="sm">
      {isLoading ? (
        <HStack>
          <Spinner size="sm" />
          <Text fontSize="sm">Loading…</Text>
        </HStack>
      ) : errorMessage ? (
        <Text fontSize="sm" color="red.500">
          {errorMessage}
        </Text>
      ) : (
        <Table size={tableSize}>
          <Thead bg="gray.50">
            {table.getHeaderGroups().map((headerGroup) => (
              <Tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort()
                  return (
                    <Th
                      key={header.id}
                      cursor={canSort ? 'pointer' : 'default'}
                      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                      fontSize="sm"
                      fontWeight="semibold"
                      color="gray.700"
                      textTransform="none"
                      whiteSpace="nowrap"
                      letterSpacing="wide"
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {canSort && (
                        <Text as="span" ml={1}>
                          {getSortIcon(header.column.getIsSorted() as string | undefined)}
                        </Text>
                      )}
                    </Th>
                  )
                })}
              </Tr>
            ))}
          </Thead>
          <Tbody>
            {table.getRowModel().rows.map((row) => (
              <Tr key={row.id} _hover={{ bg: 'gray.50' }}>
                {row.getVisibleCells().map((cell) => (
                  <Td key={cell.id} fontSize="sm">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Td>
                ))}
              </Tr>
            ))}

            {table.getRowModel().rows.length === 0 && (
              <Tr>
                <Td colSpan={visibleColumnCount}>
                  <Text fontSize="sm" color="gray.500">
                    {emptyText}
                  </Text>
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      )}
    </Box>
  )
}
