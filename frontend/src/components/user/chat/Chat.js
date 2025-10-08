import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Input,
  Button,
  VStack,
  HStack,
  Text,
  Flex,
  Avatar,
  Icon,
  InputGroup,
  InputRightElement,
  IconButton,
} from "@chakra-ui/react";
import { socket } from "./Socket";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../../config/api";
import { FiArrowLeft, FiSend } from 'react-icons/fi';

const Chat = () => {
  const params = useParams();
  const sender_id = parseInt(params.sender_id);
  const receiver_id = parseInt(params.receiver_id);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [receiverName, setReceiverName] = useState("");
  const bottomRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Joining room for user:", sender_id);
    socket.emit("join", sender_id);

    axios
      .get(`${API_BASE_URL}/messages/${sender_id}/${receiver_id}`)
      .then((res) => {
        console.log("Fetched messages:", res.data);
        setChat(res.data);
      })
      .catch((err) => console.error("Fetch Error:", err));

    // Fetch receiver details
    const token = localStorage.getItem("token");
    axios
      .get(`${API_BASE_URL}/api/user-profile/${receiver_id}`, {
        headers: { Authorization: token },
      })
      .then((res) => {
        setReceiverName(res.data.user_detail.username);
      })
      .catch((err) => console.error("Error fetching user:", err));
  }, [sender_id, receiver_id]);

  useEffect(() => {
    const handleReceiveMessage = (data) => {
      console.log("Received message:", data);
      const dataSenderId = parseInt(data.sender_id);
      const dataReceiverId = parseInt(data.receiver_id);

      if (
        (dataSenderId === receiver_id && dataReceiverId === sender_id) ||
        (dataSenderId === sender_id && dataReceiverId === receiver_id)
      ) {
        setChat((prev) => [...prev, data]);
      }
    };

    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [sender_id, receiver_id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const sendMessage = () => {
    if (!message.trim()) return;

    const msg = {
      sender_id,
      receiver_id,
      message,
      timestamp: new Date().toISOString()
    };

    socket.emit("sendMessage", msg);
    axios.post(`${API_BASE_URL}/messages`, msg)
      .then(() => {
        console.log("Message saved to database");
      })
      .catch((err) => {
        console.error("Error saving message:", err);
      });

    setChat((prev) => [...prev, msg]);
    setMessage("");
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Box minH="100vh" bg="gray.50">
      <Flex
        direction="column"
        maxW="900px"
        mx="auto"
        h="100vh"
        bg="white"
        shadow="xl"
      >
        {/* Header */}
        <Flex
          bg="gradient-to-r from-blue-500 to-purple-600"
          bgGradient="linear(to-r, blue.500, purple.500)"
          color="white"
          p={4}
          align="center"
          gap={3}
          shadow="md"
        >
          <IconButton
            icon={<FiArrowLeft />}
            variant="ghost"
            color="white"
            _hover={{ bg: "whiteAlpha.200" }}
            onClick={() => navigate(-1)}
            aria-label="Go back"
          />
          <Avatar
            name={receiverName || "User"}
            size="md"
            bg="whiteAlpha.300"
          />
          <VStack align="start" spacing={0} flex={1}>
            <Text fontWeight="600" fontSize="lg">
              {receiverName || "Loading..."}
            </Text>
            <Text fontSize="xs" opacity={0.8}>
              Active now
            </Text>
          </VStack>
        </Flex>

        {/* Chat Messages */}
        <VStack
          spacing={3}
          align="stretch"
          flex={1}
          overflowY="auto"
          p={4}
          bg="gray.50"
          css={{
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#cbd5e0',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: '#a0aec0',
            },
          }}
        >
          {chat.length === 0 ? (
            <Flex
              direction="column"
              align="center"
              justify="center"
              h="100%"
              color="gray.400"
            >
              <Text fontSize="lg">No messages yet</Text>
              <Text fontSize="sm">Start the conversation!</Text>
            </Flex>
          ) : (
            chat.map((msg, idx) => {
              const isSender = msg.sender_id == sender_id;
              return (
                <Flex
                  key={idx}
                  justifyContent={isSender ? "flex-end" : "flex-start"}
                  w="100%"
                >
                  <Box
                    bg={isSender ? "blue.500" : "white"}
                    color={isSender ? "white" : "gray.800"}
                    p={3}
                    borderRadius="2xl"
                    maxW="70%"
                    shadow={isSender ? "md" : "sm"}
                    border={isSender ? "none" : "1px"}
                    borderColor="gray.200"
                    position="relative"
                    _before={
                      isSender
                        ? {
                            content: '""',
                            position: "absolute",
                            right: "-8px",
                            top: "10px",
                            width: 0,
                            height: 0,
                            borderLeft: "8px solid",
                            borderLeftColor: "blue.500",
                            borderTop: "8px solid transparent",
                            borderBottom: "8px solid transparent",
                          }
                        : {
                            content: '""',
                            position: "absolute",
                            left: "-8px",
                            top: "10px",
                            width: 0,
                            height: 0,
                            borderRight: "8px solid",
                            borderRightColor: "white",
                            borderTop: "8px solid transparent",
                            borderBottom: "8px solid transparent",
                          }
                    }
                  >
                    <Text fontSize="md" wordBreak="break-word">
                      {msg.message}
                    </Text>
                    <Text
                      fontSize="xs"
                      mt={1}
                      opacity={0.7}
                      textAlign="right"
                    >
                      {formatTime(msg.timestamp)}
                    </Text>
                  </Box>
                </Flex>
              );
            })
          )}
          <div ref={bottomRef} />
        </VStack>

        {/* Input Section */}
        <Box
          p={4}
          bg="white"
          borderTop="1px"
          borderColor="gray.200"
          shadow="md"
        >
          <HStack spacing={2}>
            <InputGroup size="lg">
              <Input
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                borderRadius="full"
                bg="gray.100"
                border="none"
                _focus={{
                  bg: "gray.100",
                  boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.6)",
                }}
                pr="3rem"
              />
              <InputRightElement width="3rem">
                <IconButton
                  icon={<Icon as={FiSend} />}
                  colorScheme="blue"
                  borderRadius="full"
                  size="sm"
                  onClick={sendMessage}
                  isDisabled={!message.trim()}
                  aria-label="Send message"
                />
              </InputRightElement>
            </InputGroup>
          </HStack>
        </Box>
      </Flex>
    </Box>
  );
};

export default Chat;
