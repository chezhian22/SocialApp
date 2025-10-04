import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Input,
  Button,
  VStack,
  HStack,
  Text,
  Heading,
} from "@chakra-ui/react";
import { socket } from "./Socket";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../../config/api";

const Chat = () => {
  const params = useParams();
  const sender_id = parseInt(params.sender_id);
  const receiver_id = parseInt(params.receiver_id);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const bottomRef = useRef();
  const navigate = useNavigate();
  useEffect(() => {
    socket.emit("join", sender_id);

    axios
      .get(`${API_BASE_URL}/messages/${sender_id}/${receiver_id}`)
      .then((res) => {
        setChat(res.data);
      })
      .catch((err) => console.error("Fetch Error:", err));
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

    const msg = { sender_id, receiver_id, message };

    socket.emit("sendMessage", msg);
    axios.post(`${API_BASE_URL}/messages`, msg);

    setChat((prev) => [...prev, msg]);
    setMessage("");
  };

  return (
    <>
      <Button
        leftIcon={<span>⬅</span>}
        colorScheme="teal"
        variant="outline"
        size="xl"
        borderRadius="full"
        px={5}
        py={2}
        mt={5}
        ml={5}
        onClick={() => navigate(-1)}
      >
        Back
      </Button>
      <Box p={4} maxW="600px" mx="auto">
        {/* Chat Messages */}
        <Heading></Heading>
        <VStack spacing={2} align="stretch" maxH="75vh" overflowY="auto" mb={4}>
          {chat.map((msg, idx) => {
            const isSender = msg.sender_id == sender_id; // ✅ Use ==
            return (
              <HStack
                key={idx}
                justifyContent={isSender ? "flex-end" : "flex-start"}
                w="100%"
              >
                <Box
                  bg={isSender ? "blue.400" : "gray.300"}
                  color={isSender ? "white" : "black"}
                  p={3}
                  borderRadius="md"
                  maxW="70%"
                >
                  <Text>{msg.message}</Text>
                </Box>
              </HStack>
            );
          })}
          <div ref={bottomRef} />
        </VStack>

        {/* Input Section */}
        <HStack>
          <Input
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <Button colorScheme="blue" onClick={sendMessage}>
            Send
          </Button>
        </HStack>
      </Box>
    </>
  );
};

export default Chat;
