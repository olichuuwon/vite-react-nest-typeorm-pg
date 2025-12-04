import { Outlet, NavLink } from 'react-router-dom'
import {
  Box,
  Flex,
  Heading,
  Image,
  Link,
  VStack,
  HStack,
  Spacer,
  Text,
  Button,
} from '@chakra-ui/react'
import { useAuth } from '../../context/AuthContext'

export const AppLayout = () => {
  const { user, logout } = useAuth()
  const isAdmin = user?.role === 'admin'

  return (
    <Flex minH="100vh" bg="gray.50">
      {/* Sidebar */}
      <Box w="240px" bg="white" borderRight="1px solid" borderColor="gray.200" p={4}>
        <HStack spacing={3} mb={6} align="center">
          <Image src="/cat.svg" boxSize="36px" alt="cat logo" />
          <Heading size="md">Stalkr</Heading>
        </HStack>

        <VStack align="stretch" spacing={2}>
          <NavItem to="/activities" label="Activities" />
          {isAdmin && <NavItem to="/users" label="Users" />}
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
          {user && (
            <HStack spacing={2}>
              <Text fontSize="sm" color="gray.600">
                Logged in as
              </Text>

              <HStack
                spacing={1.5}
                px={3}
                py={1}
                bg="gray.100"
                borderRadius="full"
                color="gray.800"
                fontSize="sm"
                fontWeight="medium"
              >
                <Text>{user.name}</Text>
                <Text fontSize="sm"> 🐾</Text>
              </HStack>
            </HStack>
          )}

          <Spacer />
          <Button size="sm" variant="outline" onClick={logout}>
            Logout
          </Button>
        </Flex>
        <Box
          flex="1"
          p={6}
          bgImage="url('/cat_bg.jpg')"
          bgRepeat="repeat"
          bgSize="auto"
          bgPos="top left"
        >
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
