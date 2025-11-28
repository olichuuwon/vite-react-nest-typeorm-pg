import { Box, Heading, Text } from '@chakra-ui/react'
import { useParams } from 'react-router-dom'

export const UserDetailPage = () => {
  const { userId } = useParams()

  return (
    <Box>
      <Heading size="md" mb={4}>
        User Detail — {userId}
      </Heading>

      <Box bg="white" p={4} rounded="lg" shadow="sm">
        <Text>User information will go here.</Text>
      </Box>
    </Box>
  )
}
