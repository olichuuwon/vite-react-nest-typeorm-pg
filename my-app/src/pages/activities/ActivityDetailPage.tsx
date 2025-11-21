import { Box, Heading, Text } from '@chakra-ui/react'
import { useParams } from 'react-router-dom'

export const ActivityDetailPage = () => {
  const { activityId } = useParams()

  return (
    <Box>
      <Heading size="md" mb={4}>
        Activity Detail — {activityId}
      </Heading>

      <Box bg="white" p={4} shadow="sm" rounded="lg">
        <Text>This is where activity detail + attendance will go.</Text>
      </Box>
    </Box>
  )
}
