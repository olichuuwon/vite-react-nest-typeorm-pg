import { Box, Button, Heading, Input, Stack } from '@chakra-ui/react'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export const LoginPage = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [identifier, setIdentifier] = useState('')

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    await login(identifier)
    navigate('/activities')
  }

  return (
        <Box as="form" onSubmit={handleSubmit}>
        <Stack spacing={4}>
          <Input
            placeholder="Identifier"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />

            <Button colorScheme="blue" type="submit">
            Login
          </Button>
        </Stack>
      </Box>
    </Box>
  )
}
