import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import AdminNavbar from "./AdminNavbar";
import {
  Heading,
  Box,
  Flex,
  Spinner,
  SimpleGrid,
  Text,
  Divider,
  Button,
  Image,
  useToast,
  InputLeftElement,
  InputGroup,
  Input,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { SearchIcon } from "@chakra-ui/icons";

const ManagePost = () => {
  const [feeds, setFeeds] = useState({});
  const [isLoad, setIsLoad] = useState(true);
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
        setIsLoad(false);
      } catch (err) {
        console.log(err.response.data.msg);
      }
    };
    fetchData();
  }, [searchTerm]);
  console.log(searchTerm);
  const deletePost = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/delete-post/${id}`);
      toast({
        title: "Post deleted",
        description: "your post has been deleted successfully",
        status: "success",
        duration: 4000,
        isClosable: true,
        position: "top-right",
      });
    } catch (err) {
      console.log(err.response.data.msg);
      toast({
        title: "Error",
        description: "something went wrong.",
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top-right",
      });
    }
    // window.location.reload();
  };

  return (
    <>
      <AdminNavbar />
      <Box maxW="6xl" mx="auto" mt={8} px={4}>
        <Heading align="center" mb={6}>
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
        {isLoad ? (
          <Flex justify="center" align="center" minH="200px">
            <Spinner size="xl" color="blue.600" />
          </Flex>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            {feeds.length > 0 ? (
              feeds.map((feed) => {
                return (
                  <Box
                    key={feed.id}
                    borderWidth="1px"
                    borderRadius="2xl"
                    bg="cardBg"
                    boxShadow="md"
                    mx="auto"
                    overflow="hidden"
                    maxW="md"
                    transition="all 3.0s"
                    _hover={{ boxShadow: "lg", cursor: "pointer" }}
                    display="flex"
                    flexDirection="column"
                    onClick={() => navigate(`/post/${feed.id}`)}
                  >
                    <Image
                      src={`http://localhost:5000/Post_images/${feed.image_url}`}
                      alt="post-image"
                      objectFit="cover"
                      maxH="300px"
                      w="100%"
                    />
                    <Box p={5} mt="auto" bottom="0">
                      <Heading fontSize="xl" mb={2}>
                        {feed.title}
                      </Heading>
                      <Text mb={4}>{feed.content}</Text>
                      <Divider mb={4} />
                      <Flex justify="space-between" align="center">
                        <Text fontSize="sm" color="gray.500">
                          {feed.username}
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                          {new Date(feed.created_at).toLocaleDateString()}
                        </Text>
                      </Flex>
                      <Flex
                        mt={3}
                        justifyContent="space-between"
                        align="center"
                      >
                        <Text fontWeight="bold">Likes: {feed.like_count}</Text>
                        <Button
                          bg="red.500"
                          color="white"
                          onClick={() => deletePost(feed.id)}
                        >
                          Delete
                        </Button>
                      </Flex>
                    </Box>
                  </Box>
                );
              })
            ) : (
              <Text>No data available</Text>
            )}
          </SimpleGrid>
        )}
      </Box>
    </>
  );
};

export default ManagePost;
