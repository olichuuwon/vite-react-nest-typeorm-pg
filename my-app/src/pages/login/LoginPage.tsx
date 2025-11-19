import { Box, Button, Heading, Input, Stack, Text } from '@chakra-ui/react'
import { useState } from 'react'
import { useAuth } from '../../features/auth/AuthContext'
import { useNavigate } from 'react-router-dom'

export const LoginPage = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [identifier, setIdentifier] = useState('')

  const handleSubmit = async () => {
    await login(identifier)
    navigate('/activities')
  }

  return (
    <Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
      <Box bg="white" p={8} rounded="lg" shadow="md" w="sm">
        <Heading size="md" mb={4}>
          Login
        </Heading>

        <Stack spacing={4}>
          <Input
            placeholder="Identifier"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />

          <Button colorScheme="blue" onClick={handleSubmit}>
            Login
          </Button>
        </Stack>
      </Box>
    </Box>
  )
}
