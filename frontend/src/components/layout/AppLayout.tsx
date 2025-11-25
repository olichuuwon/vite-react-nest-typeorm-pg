import { Outlet, NavLink } from 'react-router-dom'
import { Box, Flex, Heading, Link, VStack, HStack, Spacer, Text, Button } from '@chakra-ui/react'
import { useAuth } from '../../context/AuthContext'

export const AppLayout = () => {
  const { user, logout } = useAuth()

  return (
    <Flex minH="100vh" bg="gray.50">
      {/* Sidebar */}
      <Box w="240px" bg="white" borderRight="1px solid" borderColor="gray.200" p={4}>
        <Heading size="md" mb={6}>
          Stalkr
        </Heading>

        <VStack align="stretch" spacing={2}>
          <NavItem to="/activities" label="Activities" />
          <NavItem to="/users" label="Users" />
          <NavItem to="/calendar" label="Calendar" />
        </VStack>
      </Box>

      {/* Main */}
      <Flex direction="column" flex="1">
        <Flex
          as="header"
          h="60px"
          align="center"
          px={6}
          borderBottom="1px solid"
          borderColor="gray.200"
          bg="white"
        >
          <Heading size="md">Stalkr</Heading>
          <Spacer />
          <HStack spacing={3}>
            {user && <Text fontSize="sm">Logged in as {user.name}</Text>}
            <Button size="sm" variant="outline" onClick={logout}>
              Logout
            </Button>
          </HStack>
        </Flex>

        <Box flex="1" p={6}>
          <Outlet />
        </Box>
      </Flex>
    </Flex>
  )
}

const NavItem = ({ to, label }: { to: string; label: string }) => (
  <Link
    as={NavLink}
    to={to}
    px={3}
    py={2}
    rounded="md"
    fontSize="sm"
    _hover={{ bg: 'gray.100' }}
    _activeLink={{ bg: 'blue.50', color: 'blue.600', fontWeight: 'semibold' }}
  >
    {label}
  </Link>
)
