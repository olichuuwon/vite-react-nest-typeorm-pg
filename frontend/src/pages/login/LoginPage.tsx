import { Box, Button, Heading, Input, Image, Stack, Text, VStack } from '@chakra-ui/react'
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
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="gray.50"
      px={4}
    >
      <Box bg="white" p={8} rounded="lg" shadow="md" w="sm" textAlign="center">
        <VStack spacing={1} mb={6}>
          <Image src="/cat.svg" boxSize="96px" alt="cat logo" />
          <Heading size="lg">Stalkr</Heading>
          <Text fontSize="sm" color="gray.500">
            Simple training & attendance tracker
          </Text>
        </VStack>

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
    </Box>
  )
}
