import React, { useState, useEffect } from "react";
import { FaHeart } from "react-icons/fa";
import {
  Box,
  Heading,
  Text,
  Divider,
  Flex,
  Spinner,
  SimpleGrid,
  IconButton,
  Image,
  useToast,
  InputGroup,
  InputLeftElement,
  Input,
  Container,
  Avatar,
  HStack,
  VStack,
  Icon,
  Button,
} from "@chakra-ui/react";
import UserNavbar from "./UserNav";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiMessageCircle,
  FiClock,
  FiTrendingUp,
} from "react-icons/fi";
import { API_BASE_URL } from "../../config/api";

const Feed = () => {
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [likedPosts, setLikedPosts] = useState(new Set());

  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          searchTerm
            ? `${API_BASE_URL}/api/search-posts?q=${searchTerm}`
            : `${API_BASE_URL}/api/feeds`,
          {
            headers: { Authorization: localStorage.getItem("token") },
          }
        );
        setFeeds(res.data);
        setLoading(false);
      } catch (err) {
        console.log(err.response?.data?.msg);
      }
    };
    fetchData();
  }, [searchTerm]);

  const handleLike = async (id, e) => {
    e.stopPropagation();
    try {
      await axios.post(
        `${API_BASE_URL}/api/like/${id}`,
        {},
        {
          headers: { Authorization: localStorage.getItem("token") },
        }
      );

      setLikedPosts((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(id)) {
          newSet.delete(id);
        } else {
          newSet.add(id);
        }
        return newSet;
      });

      setFeeds((prevFeeds) =>
        prevFeeds.map((feed) =>
          feed.id === id
            ? {
                ...feed,
                like_count: likedPosts.has(id)
                  ? feed.like_count - 1
                  : feed.like_count + 1,
              }
            : feed
        )
      );
    } catch (err) {
      console.log(err.response?.data?.msg);
    }
  };

  const formatDate = (date) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffMs = now - postDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return postDate.toLocaleDateString();
  };

  return (
    <Box minH="100vh" bg="gray.50">
      <UserNavbar />

      <Container maxW="7xl" py={8}>
        {/* Header Section */}
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align={{ base: "stretch", md: "center" }}
          mb={8}
          gap={4}
        >
          <VStack align={{ base: "center", md: "flex-start" }} spacing={1}>
            <Heading
              fontSize={{ base: "3xl", md: "4xl" }}
              bgGradient="linear(to-r, blue.600, purple.600)"
              bgClip="text"
            >
              Discover Posts
            </Heading>
            <HStack spacing={2} color="gray.600">
              <Icon as={FiTrendingUp} />
              <Text fontSize="sm">
                {feeds.length} {feeds.length === 1 ? "post" : "posts"} available
              </Text>
            </HStack>
          </VStack>

          <InputGroup maxW={{ base: "100%", md: "400px" }} size="lg">
            <InputLeftElement>
              <Icon as={FiSearch} color="gray.400" />
            </InputLeftElement>
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search posts..."
              bg="white"
              focusBorderColor="blue.500"
              borderRadius="xl"
              shadow="sm"
              _hover={{ shadow: "md" }}
            />
          </InputGroup>
        </Flex>

        {/* Loading State */}
        {loading ? (
          <Flex justify="center" align="center" minH="400px">
            <VStack spacing={4}>
              <Spinner size="xl" color="blue.500" thickness="4px" />
              <Text color="gray.500" fontSize="lg">
                Loading posts...
              </Text>
            </VStack>
          </Flex>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8}>
            {feeds.length > 0 ? (
              feeds.map((feed) => (
                <Box
                  key={feed.id}
                  bg="white"
                  borderRadius="2xl"
                  overflow="hidden"
                  shadow="md"
                  transition="all 0.3s"
                  _hover={{
                    shadow: "2xl",
                    transform: "translateY(-8px)",
                    cursor: "pointer",
                  }}
                  onClick={() => navigate(`/post/${feed.id}`)}
                >
                  {/* ✅ Fixed Post Image Section */}
                  {feed.image_url && (
                    <Box
                      bg="gray.100"
                      borderBottom="1px solid"
                      borderColor="gray.100"
                      overflow="hidden"
                      // aspectRatio={4 / 4} // maintain consistent ratio
                    >
                      <Image
                        src={`${API_BASE_URL}/Post_images/${feed.image_url}`}
                        alt="Post image"
                        w="100%"
                        h="100%"
                        margin-top="200px"
                        // objectFit="cover"
                        // objectPosition="center"
                        transition="transform 0.3s ease"
                        _hover={{ transform: "scale(1.05)" }}
                      />
                    </Box>
                  )}

                  {/* Post Content */}
                  <Box p={5}>
                    <Heading fontSize="xl" mb={3} noOfLines={2} color="gray.800">
                      {feed.title}
                    </Heading>

                    <Text mb={4} color="gray.600" noOfLines={3} fontSize="sm">
                      {feed.content}
                    </Text>

                    <Divider mb={4} />

                    {/* Author & Date */}
                    <Flex justify="space-between" align="center" mb={4}>
                      <HStack spacing={2}>
                        <Avatar name={feed.username} size="sm" bg="blue.400" />
                        <VStack align="start" spacing={0}>
                          <Text fontSize="sm" fontWeight="600" color="gray.700">
                            {feed.username}
                          </Text>
                          <HStack spacing={1} fontSize="xs" color="gray.500">
                            <Icon as={FiClock} boxSize={3} />
                            <Text>{formatDate(feed.created_at)}</Text>
                          </HStack>
                        </VStack>
                      </HStack>
                    </Flex>

                    {/* Engagement Section */}
                    <Flex justify="space-between" align="center">
                      <HStack spacing={2}>
                        <IconButton
                          icon={<FaHeart />}
                          colorScheme={likedPosts.has(feed.id) ? "red" : "gray"}
                          variant={likedPosts.has(feed.id) ? "solid" : "ghost"}
                          size="sm"
                          onClick={(e) => handleLike(feed.id, e)}
                          aria-label="Like post"
                        />
                        <Text fontSize="sm" fontWeight="600" color="gray.700">
                          {feed.like_count}
                        </Text>
                      </HStack>

                      <Button
                        size="sm"
                        variant="ghost"
                        leftIcon={<FiMessageCircle />}
                        colorScheme="blue"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/post/${feed.id}`);
                        }}
                      >
                        View Post
                      </Button>
                    </Flex>
                  </Box>
                </Box>
              ))
            ) : (
              <Box
                gridColumn="1 / -1"
                bg="white"
                borderRadius="2xl"
                p={16}
                textAlign="center"
                shadow="md"
              >
                <Icon as={FiSearch} boxSize={16} color="gray.300" mb={4} />
                <Heading fontSize="xl" color="gray.600" mb={2}>
                  {searchTerm ? "No posts found" : "No posts available"}
                </Heading>
                <Text color="gray.500" mb={6}>
                  {searchTerm
                    ? `No results for "${searchTerm}". Try a different search.`
                    : "Be the first to share something!"}
                </Text>
                {!searchTerm && (
                  <Button
                    colorScheme="blue"
                    size="lg"
                    onClick={() => navigate("/create-post")}
                  >
                    Create First Post
                  </Button>
                )}
              </Box>
            )}
          </SimpleGrid>
        )}
      </Container>
    </Box>
  );
};

export default Feed;
