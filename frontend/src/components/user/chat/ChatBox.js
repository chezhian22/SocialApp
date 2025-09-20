import { Box, VStack, Text, Heading, Spinner, useToast } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import UserNavbar from "../UserNav";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@chakra-ui/react";

const ChatBox = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const token = localStorage.getItem("token");
  const user_id = jwtDecode(token).user_id;

  const navigate = useNavigate()

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/connections/${user_id}`, {
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
    <>
      <UserNavbar />
      <Button
        leftIcon={<span>⬅</span>}
        colorScheme="teal"
        variant="outline"
        size="xl"
        borderRadius="full"
        px={5}
        py={2}
        mt={5}//sem
        ml={5}
        onClick={() => navigate(-1)}
      >
        Back
      </Button>
      <Box p={4} maxW="600px" mx="auto" >
        <Heading size="xl" mb={4} mx="180px">
        Messages
        </Heading>
        {loading ? (
          <Spinner size="lg" />
        ) : (
          <VStack spacing={4} align="stretch" mt={8}>
            {users.length > 0 ? (
              users.map((user) => (
                <Box
                  key={user.id}
                  p={3}
                  borderWidth="1px"
                  borderRadius="lg"
                  shadow="sm"
                  cursor="pointer"
                  _hover={{ bg: "gray.100" }}
                  onClick={() => handleClick(user.id)}
                >
                  <Text fontWeight="bold" fontSize="xl">{user.username}</Text>
                  <Text fontSize="sm" color="gray.600">
                    Tap to chat
                  </Text>
                </Box>
              ))
            ) : (
              <Text>No other users found.</Text>
            )}
          </VStack>
        )}
      </Box>
    </>
  );
};

export default ChatBox;
