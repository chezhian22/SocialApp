import React from 'react';
import {
  Box,
  Flex,
  Button,
  HStack,
  Link as ChakraLink,
  Text,
  Heading,
  Avatar,
  Icon,
  Container,
  useColorModeValue,
} from '@chakra-ui/react';
import { Link, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import FriendRequests from '../FriendRequests';
import { FiHome, FiEdit3, FiUser, FiMessageCircle, FiLogOut } from 'react-icons/fi';

const UserNavbar = () => {
  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  const id = jwtDecode(localStorage.getItem('token'));
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const NavLink = ({ to, icon, children }) => {
    const active = isActive(to);
    return (
      <ChakraLink
        as={Link}
        to={to}
        display="flex"
        alignItems="center"
        gap={2}
        px={4}
        py={2}
        borderRadius="lg"
        fontWeight="500"
        transition="all 0.2s"
        bg={active ? 'whiteAlpha.200' : 'transparent'}
        _hover={{
          bg: 'whiteAlpha.300',
          transform: 'translateY(-2px)',
        }}
        position="relative"
        _after={
          active
            ? {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '60%',
                height: '3px',
                bg: 'white',
                borderRadius: 'full',
              }
            : {}
        }
      >
        <Icon as={icon} boxSize={5} />
        <Text>{children}</Text>
      </ChakraLink>
    );
  };

  return (
    <Box
      bg="gradient-to-r from-blue-600 to-purple-600"
      bgGradient="linear(to-r, blue.600, purple.600)"
      color="white"
      shadow="lg"
      position="sticky"
      top={0}
      zIndex={1000}
    >
      <Container maxW="container.xl">
        <Flex justify="space-between" align="center" py={4}>
          <Flex align="center" gap={3}>
            <Box
              bg="white"
              p={2}
              borderRadius="lg"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Icon as={FiMessageCircle} boxSize={6} color="blue.600" />
            </Box>
            <Heading fontSize="2xl" fontWeight="bold" letterSpacing="tight">
              SocialApp
            </Heading>
          </Flex>

          <HStack spacing={1}>
            <NavLink to="/feed" icon={FiHome}>
              Home
            </NavLink>
            <NavLink to="/create-post" icon={FiEdit3}>
              Create Post
            </NavLink>
            <NavLink to={`/profile/${id.user_id}`} icon={FiUser}>
              Profile
            </NavLink>
            <NavLink to="/chatbox" icon={FiMessageCircle}>
              Friends
            </NavLink>

            <Box px={2}>
              <FriendRequests />
            </Box>

            <Button
              leftIcon={<FiLogOut />}
              colorScheme="red"
              variant="solid"
              size="md"
              onClick={handleLogout}
              ml={2}
              _hover={{
                transform: 'translateY(-2px)',
                shadow: 'lg',
              }}
              transition="all 0.2s"
            >
              Logout
            </Button>
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
};

export default UserNavbar;
