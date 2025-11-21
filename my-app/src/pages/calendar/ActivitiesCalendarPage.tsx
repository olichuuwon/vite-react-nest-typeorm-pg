import { Box, Heading, Text } from '@chakra-ui/react'

export const ActivitiesCalendarPage = () => {
  return (
    <Box>
      <Heading size="md" mb={4}>
        Calendar
      </Heading>

      <Box bg="white" p={4} shadow="sm" rounded="lg">
        <Text>This will later show activities grouped by date.</Text>
      </Box>
    </Box>
  )
}
