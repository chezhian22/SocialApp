import React from 'react';
import {
  Box,
  Flex,
  Button,
  HStack,
  Link as ChakraLink,
  Text,
  Heading,
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import FriendRequests from '../FriendRequests';

const UserNavbar = () => {
  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  const id = jwtDecode(localStorage.getItem('token'));

  return (
    <Box bg="blue.500" color="white" px="40px" py="20px" shadow="md">
      <Flex justify="space-between" align="center">
        <Heading fontSize="3xl" fontWeight="bold">
          SocialApp
        </Heading>

        <HStack spacing={6} fontSize="22px">
          <ChakraLink as={Link} to="/feed">
            Home
          </ChakraLink>
          <ChakraLink as={Link} to="/create-post">
            Create Post
          </ChakraLink>
          <ChakraLink as={Link} to={`/profile/${id.user_id}`}>
            Profile
          </ChakraLink>
          <ChakraLink as={Link} to="/chatbox">
           Friends
          </ChakraLink>
          
          <FriendRequests />

          <Button colorScheme="red" size="sm" onClick={handleLogout}px={5}>
            Logout
          </Button>
        </HStack>
      </Flex>
    </Box>
  );
};

export default UserNavbar;
