import React, { useState, useEffect } from "react";
import axios from "axios";
import UserNavbar from "./UserNav";
import {
  Box,
  Heading,
  Text,
  Button,
  SimpleGrid,
  Flex,
  useToast,
  Image
} from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import { Link } from "react-router-dom";

const Profile = () => {
  const [userDetail, setUserDetail] = useState({});
  const [userPosts, setUserPosts] = useState([]);

  const navigate = useNavigate();

  const { id } = useParams();

  const toast = useToast();

  useEffect(() => {
    const fetchData = async () => {
      await axios
        .get(`http://localhost:5000/api/user-profile/${id}`, {
          headers: { Authorization: localStorage.getItem("token") },
        })
        .then((res) => {
          setUserDetail(res.data.user_detail);
          setUserPosts(res.data.user_posts);
        })
        .catch((err) => console.log(err.response.data.msg));
    };
    fetchData();
  }, [userPosts, userDetail]);

  const deletePost = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/delete-post/${id}`);
      toast({
        title: "Post deleted",
        description: "your post has been successfully deleted",
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
      <UserNavbar />
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
      <Box maxW="6xl" mx="auto" mt={4}>
        <Heading color="blue.600" align="center">
          Profile
        </Heading>
        <Box mt={4} bg="gray.100" p={8} boxShadow="md" borderRadius="lg">
          <Text mb={4}>Name: {userDetail.username}</Text>
          <Text mb={4}>Email: {userDetail.email}</Text>
          <Text mb={4}>
            Created: {new Date(userDetail.created_at).toLocaleDateString()}
          </Text>
          <Button bg="blue.500" color="white">
            Update Profile
          </Button>
        </Box>
        <Heading ml={7} mt={4} fontSize="2xl">
          Posts
        </Heading>
        <SimpleGrid
          mt={2}
          columns={{ base: 1, md: 3 }}
          spacing={6}
          bg="gray.50"
          p={4}
        >
          {userPosts.length > 0 ? (
            userPosts.map((post) => (
              <Box
                key={post.id}
                borderWidth="1px"
                borderRadius="2xl"
                overflow="hidden"
                boxShadow="lg"
                transition="all 0.3s"
                _hover={{ boxShadow: "xl", cursor: "pointer" }}
                onClick={() => navigate(`/post/${post.id}`)}
                maxW="md"
                mx="auto"
                mb={6}
                display="flex"
                flexDirection="column"
              >
                <Image
                src={`http://localhost:5000/Post_images/${post.image_url}`}
                alt="post image"
                maxH="300px"
                w="100%"/>
                <Box
                p={5}
                mt="auto"
                bottom="0"
                >
                  <Heading mb={2} fontSize="lg">
                    {post.title}
                  </Heading>
                  <Text mb={4}>{post.content}</Text>
                  <Flex justify={"space-between"}>
                    <Text color="gray.500">
                      {new Date(post.created_at).toLocaleDateString()}
                    </Text>
                    <Link
                      onClick={(e) => {
                        e.stopPropagation();
                        deletePost(post.id);
                      }}
                      style={{ color: "red" }}
                    >
                      Delete
                    </Link>
                  </Flex>
                </Box>
              </Box>
            ))
          ) : (
            <Text>No post yet</Text>
          )}
        </SimpleGrid>
      </Box>
    </>
  );
};

export default Profile;
