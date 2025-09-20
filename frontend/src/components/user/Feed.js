import React, { useState, useEffect } from "react";
import { FaHeart } from "react-icons/fa";
import {
  Box,
  Heading,
  Text,
  Divider,
  Flex,
  Spinner,
  useColorModeValue,
  SimpleGrid,
  IconButton,
  Image,
  useToast,
  InputGroup,
  InputLeftElement,
  Input,
} from "@chakra-ui/react";
import UserNavbar from "./UserNav";
import axios from "axios";
import { redirect, useNavigate } from "react-router-dom";
import { hover } from "framer-motion";
import { SearchIcon } from "@chakra-ui/icons";
import NotificationBox from "../FriendRequests";
import FriendRequests from "../FriendRequests";

const Feed = () => {
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();

  const toast = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          searchTerm
            ? `http://localhost:5000/api/search-posts?q=${searchTerm}`
            : "http://localhost:5000/api/feeds",
          {
            headers: { Authorization: localStorage.getItem("token") },
          }
        );
        setFeeds(res.data);
        setLoading(false);
      } catch (err) {
        console.log(err.response.data.msg);
      }
    };
    fetchData();
  }, [searchTerm]);

  // console.log('http:/localhost:5000/Post_image/'+feeds[0].image_url)

  const handleLike = async (id) => {
    try {
      await axios.post(
        `http://localhost:5000/api/like/${id}`,
        {},
        {
          headers: { Authorization: localStorage.getItem("token") },
        }
      );
    } catch (err) {
      console.log(err.response.data.msg);
    }
  };
  console.log(feeds.length);
  const cardBg = useColorModeValue("gray.50", "gray.700");

  return (
    <>
      <UserNavbar />
      <Box maxW="6xl" mx="auto" mt={8} px={4}>
        <Heading mb={6} textAlign="center">
          Posts
        </Heading>
        <InputGroup mb={6}>
          <InputLeftElement>
            <SearchIcon color="gray.500" />
          </InputLeftElement>
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            variant="filled"
            focusBorderColor="blue.500"
            borderRadius="3xl"
          />
        </InputGroup>
        {loading ? (
          <Flex justify="center" align="center" minH="200px">
            <Spinner size="xl" color="blue.500" />
          </Flex>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            {feeds.length > 0 ? (
              feeds.map((feed) => (
                <Box
                  key={feed.id}
                  borderWidth="1px"
                  borderRadius="2xl"
                  overflow="hidden"
                  bg={cardBg}
                  boxShadow="lg"
                  transition="all 0.3s"
                  _hover={{ boxShadow: "xl", cursor: "pointer" }}
                  onClick={() => navigate(`/post/${feed.id}`)}
                  maxW="md"
                  mx="auto"
                  mb={6}
                >
                  {feed.image_url && (
                    <Image
                      src={`http://localhost:5000/Post_images/${feed.image_url}`}
                      alt="Post image"
                      maxH="300px"
                      w="100%"
                      objectFit="cover"
                    />
                  )}

                  <Box p={5}>
                    <Heading fontSize="xl" mb={2} color="blue.600">
                      {feed.title}
                    </Heading>
                    <Text mb={4} color="gray.700" noOfLines={3}>
                      {feed.content}
                    </Text>

                    <Divider mb={4} />

                    <Flex justify="space-between" align="center" mb={2}>
                      <Text fontSize="sm" color="gray.500">
                        by {feed.username}
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        {new Date(feed.created_at).toLocaleString()}
                      </Text>
                    </Flex>

                    <Flex align="center" gap={2}>
                      <IconButton
                        icon={<FaHeart />}
                        colorScheme="red"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLike(feed.id);
                        }}
                      />
                      <Text fontSize="sm" fontWeight="semibold">
                        Likes {feed.like_count}
                      </Text>
                    </Flex>
                  </Box>
                </Box>
              ))
            ) : (
              <Flex justify="center" align="center" minH="200px" w="100%">
                <Text fontSize="lg" color="gray.500">
                  No data available
                </Text>
              </Flex>
            )}
          </SimpleGrid>
        )}
      </Box>
    </>
  );
};

export default Feed;
