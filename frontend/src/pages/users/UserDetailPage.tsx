import {
  Badge,
  Box,
  Button,
  Heading,
  HStack,
  Spinner,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Text,
} from '@chakra-ui/react'
import { useNavigate, useParams } from 'react-router-dom'
import { useUser } from '../../hooks/useUser'
import { useUserAttendance } from '../../hooks/useUserAttendance'
import { useUserCreatedActivities } from '../../hooks/useUserCreatedActivities'

export const UserDetailPage = () => {
  const { userId } = useParams()
  const navigate = useNavigate()

  const { user, isLoading, error } = useUser(userId)
  const {
    records,
    isLoading: isLoadingAttendance,
    error: attendanceError,
  } = useUserAttendance(userId)
  const {
    activities,
    isLoading: isLoadingCreated,
    error: createdError,
  } = useUserCreatedActivities(userId)

  return (
    <Box>
      <HStack justify="space-between" mb={4}>
        <Heading size="md">User details</Heading>
        <Button size="sm" variant="outline" onClick={() => navigate('/users')}>
          Back to users
        </Button>
      </HStack>

      <Box bg="white" p={4} rounded="lg" shadow="sm" mb={6}>
        {isLoading ? (
          <HStack>
            <Spinner size="sm" />
            <Text fontSize="sm">Loading user…</Text>
          </HStack>
        ) : error ? (
          <Text fontSize="sm" color="red.500">
            {error}
          </Text>
        ) : !user ? (
          <Text fontSize="sm" color="gray.500">
            User not found.
          </Text>
        ) : (
          <Stack spacing={3}>
            <HStack justify="space-between" align="flex-start">
              <Box>
                <Heading size="md">{user.name}</Heading>
                <Text fontSize="sm" color="gray.600">
                  {user.identifier}
                </Text>
                {user.email && (
                  <Text fontSize="sm" color="gray.600">
                    {user.email}
                  </Text>
                )}
              </Box>
              <Badge colorScheme={user.role === 'admin' ? 'red' : 'blue'}>{user.role}</Badge>
            </HStack>

            <HStack spacing={6} pt={2}>
              <Box>
                <Text fontSize="xs" color="gray.500" textTransform="uppercase">
                  Created at
                </Text>
                <Text fontSize="sm">
                  {new Date(user.createdAt).toLocaleString('en-SG', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </Text>
              </Box>
              <Box>
                <Text fontSize="xs" color="gray.500" textTransform="uppercase">
                  Updated at
                </Text>
                <Text fontSize="sm">
                  {new Date(user.updatedAt).toLocaleString('en-SG', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </Text>
              </Box>
            </HStack>
          </Stack>
        )}
      </Box>

      <Tabs variant="enclosed">
        <TabList>
          <Tab>Attendance records</Tab>
          <Tab>Created activities</Tab>
        </TabList>
        <TabPanels>
          {/* Attendance tab */}
          <TabPanel>
            {isLoadingAttendance ? (
              <HStack>
                <Spinner size="sm" />
                <Text fontSize="sm">Loading attendance records…</Text>
              </HStack>
            ) : attendanceError ? (
              <Text fontSize="sm" color="red.500">
                {attendanceError}
              </Text>
            ) : records.length === 0 ? (
              <Text fontSize="sm" color="gray.500">
                No attendance records.
              </Text>
            ) : (
              <Table size="sm">
                <Thead bg="gray.50">
                  <Tr>
                    <Th>Activity</Th>
                    <Th>Status</Th>
                    <Th>Checked in at</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {records.map((rec) => (
                    <Tr key={rec.id}>
                      <Td>{rec.activity?.title ?? '-'}</Td>
                      <Td>{rec.status}</Td>
                      <Td>
                        {rec.checkedInAt
                          ? new Date(rec.checkedInAt).toLocaleString('en-SG', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })
                          : '-'}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            )}
          </TabPanel>

          {/* Created activities tab */}
          <TabPanel>
            {isLoadingCreated ? (
              <HStack>
                <Spinner size="sm" />
                <Text fontSize="sm">Loading created activities…</Text>
              </HStack>
            ) : createdError ? (
              <Text fontSize="sm" color="red.500">
                {createdError}
              </Text>
            ) : activities.length === 0 ? (
              <Text fontSize="sm" color="gray.500">
                No activities created by this user.
              </Text>
            ) : (
              <Table size="sm">
                <Thead bg="gray.50">
                  <Tr>
                    <Th>Title</Th>
                    <Th>Date</Th>
                    <Th>Location</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {activities.map((act) => (
                    <Tr key={act.id}>
                      <Td>{act.title}</Td>
                      <Td>
                        {act.date
                          ? new Date(act.date).toLocaleDateString('en-SG', {
                              dateStyle: 'medium',
                            })
                          : '-'}
                      </Td>
                      <Td>{act.location ?? '-'}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  )
}
