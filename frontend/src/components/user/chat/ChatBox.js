import { Box, VStack, Text, Heading, Spinner, useToast, Avatar, HStack, Badge, Icon, Flex } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import UserNavbar from "../UserNav";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@chakra-ui/react";
import { API_BASE_URL } from '../../../config/api';
import { FiMessageCircle, FiArrowLeft } from 'react-icons/fi';

const ChatBox = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const token = localStorage.getItem("token");
  const user_id = jwtDecode(token).user_id;

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/connections/${user_id}`, {
          headers: { Authorization: token },
        });
        setUsers(res.data);

      } catch (err) {
        toast({
          title: "Error fetching users",
          description: err.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [token, user_id, toast]);

  const handleClick = (receiver_id) => {
    navigate(`/chatbox/chat/${user_id}/${receiver_id}`);
  };

  return (
    <Box minH="100vh" bg="gray.50">
      <UserNavbar />

      <Box maxW="800px" mx="auto" px={4} py={6}>
        <Button
          leftIcon={<FiArrowLeft />}
          variant="ghost"
          size="md"
          mb={6}
          _hover={{ bg: "gray.200" }}
          onClick={() => navigate(-1)}
        >
          Back
        </Button>

        <Box
          bg="white"
          borderRadius="xl"
          shadow="lg"
          overflow="hidden"
          minH="75vh"
        >
          <Flex
            bg="gradient-to-r from-blue-500 to-purple-600"
            bgGradient="linear(to-r, blue.500, purple.500)"
            p={6}
            color="white"
            align="center"
            gap={3}
          >
            <Icon as={FiMessageCircle} boxSize={8} />
            <Heading size="lg">Messages</Heading>
            {users.length > 0 && (
              <Badge
                colorScheme="green"
                fontSize="sm"
                borderRadius="full"
                px={3}
                py={1}
              >
                {users.length} {users.length === 1 ? 'Contact' : 'Contacts'}
              </Badge>
            )}
          </Flex>

          <Box p={4}>
            {loading ? (
              <Flex justify="center" align="center" h="400px">
                <VStack spacing={4}>
                  <Spinner size="xl" color="blue.500" thickness="4px" />
                  <Text color="gray.500">Loading your conversations...</Text>
                </VStack>
              </Flex>
            ) : (
              <VStack spacing={2} align="stretch">
                {users.length > 0 ? (
                  users.map((user, index) => (
                    <Box
                      key={user.friend_id}
                      p={4}
                      borderRadius="lg"
                      cursor="pointer"
                      transition="all 0.2s"
                      _hover={{
                        bg: "blue.50",
                        transform: "translateX(8px)",
                        shadow: "md"
                      }}
                      borderBottom={index !== users.length - 1 ? "1px" : "none"}
                      borderColor="gray.100"
                      onClick={() => handleClick(user.friend_id)}
                    >
                      <HStack spacing={4}>
                        <Avatar
                          name={user.username}
                          size="md"
                          bg="gradient-to-r from-blue-400 to-purple-400"
                          bgGradient="linear(to-r, blue.400, purple.400)"
                          color="white"
                        />
                        <VStack align="start" spacing={1} flex={1}>
                          <Text fontWeight="600" fontSize="lg" color="gray.800">
                            {user.username}
                          </Text>
                          <Text fontSize="sm" color="gray.500">
                            Tap to start chatting
                          </Text>
                        </VStack>
                        <Icon as={FiMessageCircle} color="blue.500" boxSize={5} />
                      </HStack>
                    </Box>
                  ))
                ) : (
                  <Flex
                    direction="column"
                    align="center"
                    justify="center"
                    h="400px"
                    color="gray.500"
                  >
                    <Icon as={FiMessageCircle} boxSize={16} mb={4} color="gray.300" />
                    <Text fontSize="lg" fontWeight="500">No conversations yet</Text>
                    <Text fontSize="sm" mt={2}>Connect with friends to start chatting</Text>
                  </Flex>
                )}
              </VStack>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ChatBox;
