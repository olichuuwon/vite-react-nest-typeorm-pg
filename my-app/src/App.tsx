// // src/App.tsx
// import { Box, Heading, Text, Button } from '@chakra-ui/react'

// export default function App() {
//   return (
//     <Box p={8}>
//       <Heading mb={4}>Hello!</Heading>
//       <Text mb={4}>How are you.</Text>
//       <Button colorScheme="red">SOS</Button>
//     </Box>
//   )
// }

import { useEffect, useState } from 'react'
import { Box, Heading, Text, Button, VStack } from '@chakra-ui/react'
import { api } from './api'

type User = { id: number; name: string; email: string }

export default function App() {
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    api.get<User[]>('/users').then((res) => setUsers(res.data))
  }, [])

  const addDummyUser = async () => {
    await api.post('/users', {
      name: `User ${users.length + 1}`,
      email: `user${users.length + 1}@test.com`,
    })
    const res = await api.get<User[]>('/users')
    setUsers(res.data)
  }

  return (
    <Box p={8}>
      <Heading mb={4}>Hello, how are you</Heading>
      <Button colorScheme="blue" mb={4} onClick={addDummyUser}>
        Add dummy user
      </Button>
      <VStack align="flex-start" spacing={2}>
        {users.length === 0 && <Text>No users yet.</Text>}
        {users.map((u) => (
          <Text key={u.id}>
            {u.id}. {u.name} – {u.email}
          </Text>
        ))}
      </VStack>
    </Box>
  )
}
