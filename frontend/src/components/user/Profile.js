import React, { useState, useEffect } from "react";
import axios from "axios";
import UserNavbar from "./UserNav";
import { API_BASE_URL } from '../../config/api';
import {
  Box,
  Heading,
  Text,
  Button,
  SimpleGrid,
  Flex,
  useToast,
  Image,
  Container,
  Avatar,
  HStack,
  VStack,
  Icon,
  Badge,
  Divider,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
} from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiEdit, FiCalendar, FiMail, FiFileText, FiHeart, FiTrash2, FiMoreVertical } from "react-icons/fi";
import { jwtDecode } from 'jwt-decode';

const Profile = () => {
  const [userDetail, setUserDetail] = useState({});
  const [userPosts, setUserPosts] = useState([]);

  const navigate = useNavigate();

  const { id } = useParams();

  const toast = useToast();

  const token = localStorage.getItem("token");
  const currentUserId = jwtDecode(token).user_id;
  const isOwnProfile = parseInt(id) === currentUserId;

  useEffect(() => {
    const fetchData = async () => {
      await axios
        .get(`${API_BASE_URL}/api/user-profile/${id}`, {
          headers: { Authorization: localStorage.getItem("token") },
        })
        .then((res) => {
          setUserDetail(res.data.user_detail);
          setUserPosts(res.data.user_posts);
        })
        .catch((err) => console.log(err.response?.data?.msg));
    };
    fetchData();
  }, [id]);

  const deletePost = async (postId) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/delete-post/${postId}`);
      toast({
        title: "Post deleted",
        description: "Your post has been successfully deleted",
        status: "success",
        duration: 4000,
        isClosable: true,
        position: "top-right",
      });
      setUserPosts(userPosts.filter(post => post.id !== postId));
    } catch (err) {
      console.log(err.response?.data?.msg);
      toast({
        title: "Error",
        description: "Something went wrong.",
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top-right",
      });
    }
  };

  return (
    <Box minH="100vh" bg="gray.50">
      <UserNavbar />

      <Container maxW="7xl" py={8}>
        <Button
          leftIcon={<FiArrowLeft />}
          variant="ghost"
          size="md"
          mb={6}
          _hover={{ bg: 'gray.200' }}
          onClick={() => navigate(-1)}
        >
          Back
        </Button>

        {/* Profile Header */}
        <Box bg="white" borderRadius="2xl" shadow="xl" overflow="hidden" mb={8}>
          <Box
            h="200px"
            bg="gradient-to-r from-blue-500 to-purple-600"
            bgGradient="linear(to-r, blue.500, purple.600)"
            position="relative"
          />
          <Box px={8} pb={8}>
            <Flex
              direction={{ base: "column", md: "row" }}
              align={{ base: "center", md: "flex-end" }}
              mt="-16"
              gap={6}
            >
              <Avatar
                name={userDetail.username}
                size="2xl"
                border="6px solid white"
                shadow="xl"
                bg="blue.400"
                color="white"
              />
              <Flex
                flex={1}
                direction={{ base: "column", md: "row" }}
                align={{ base: "center", md: "flex-start" }}
                justify="space-between"
                w="100%"
              >
                <VStack align={{ base: "center", md: "flex-start" }} spacing={2} mt={4}>
                  <Heading fontSize="3xl">{userDetail.username}</Heading>
                  <HStack spacing={4} color="gray.600">
                    <HStack>
                      <Icon as={FiMail} />
                      <Text fontSize="sm">{userDetail.email}</Text>
                    </HStack>
                    <HStack>
                      <Icon as={FiCalendar} />
                      <Text fontSize="sm">
                        Joined {new Date(userDetail.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </Text>
                    </HStack>
                  </HStack>
                </VStack>
                {isOwnProfile && (
                  <Button
                    leftIcon={<FiEdit />}
                    colorScheme="blue"
                    size="lg"
                    mt={{ base: 4, md: 0 }}
                    _hover={{
                      transform: 'translateY(-2px)',
                      shadow: 'lg',
                    }}
                    transition="all 0.2s"
                  >
                    Edit Profile
                  </Button>
                )}
              </Flex>
            </Flex>

            {/* Stats */}
            <StatGroup mt={8} p={6} bg="gray.50" borderRadius="xl">
              <Stat>
                <StatLabel fontSize="md" color="gray.600">Total Posts</StatLabel>
                <StatNumber fontSize="3xl" color="blue.600">{userPosts.length}</StatNumber>
              </Stat>
              <Stat>
                <StatLabel fontSize="md" color="gray.600">Member Since</StatLabel>
                <StatNumber fontSize="xl" color="purple.600">
                  {new Date(userDetail.created_at).toLocaleDateString()}
                </StatNumber>
              </Stat>
              <Stat>
                <StatLabel fontSize="md" color="gray.600">Role</StatLabel>
                <Badge colorScheme="green" fontSize="lg" px={3} py={1} borderRadius="md">
                  {userDetail.role}
                </Badge>
              </Stat>
            </StatGroup>
          </Box>
        </Box>

        {/* Posts Section */}
        <Box>
          <Flex align="center" gap={3} mb={6}>
            <Icon as={FiFileText} boxSize={6} color="blue.600" />
            <Heading fontSize="2xl">
              {isOwnProfile ? 'My Posts' : `${userDetail.username}'s Posts`}
            </Heading>
            <Badge colorScheme="blue" fontSize="md" px={3} py={1} borderRadius="full">
              {userPosts.length}
            </Badge>
          </Flex>

          {userPosts.length > 0 ? (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
              {userPosts.map((post) => (
                <Box
                  key={post.id}
                  bg="white"
                  borderRadius="xl"
                  overflow="hidden"
                  shadow="md"
                  transition="all 0.3s"
                  _hover={{
                    shadow: "2xl",
                    transform: "translateY(-8px)",
                    cursor: "pointer"
                  }}
                  onClick={() => navigate(`/post/${post.id}`)}
                >
                  {post.image_url && (
                    <Image
                      src={`${API_BASE_URL}/Post_images/${post.image_url}`}
                      alt="post image"
                      h="250px%"
                      w="100%"
                      objectFit="cover"
                    />
                  )}
                  <Box p={5}>
                    <Flex justify="space-between" align="start" mb={3}>
                      <Heading fontSize="xl" noOfLines={2} flex={1}>
                        {post.title}
                      </Heading>
                      {isOwnProfile && (
                        <Menu>
                          <MenuButton
                            as={IconButton}
                            icon={<FiMoreVertical />}
                            variant="ghost"
                            size="sm"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <MenuList>
                            <MenuItem
                              icon={<FiTrash2 />}
                              color="red.500"
                              onClick={(e) => {
                                e.stopPropagation();
                                deletePost(post.id);
                              }}
                            >
                              Delete Post
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      )}
                    </Flex>
                    <Text color="gray.600" noOfLines={3} mb={4}>
                      {post.content}
                    </Text>
                    <Divider mb={3} />
                    <Flex justify="space-between" align="center">
                      <HStack spacing={1} color="gray.500" fontSize="sm">
                        <Icon as={FiCalendar} />
                        <Text>
                          {new Date(post.created_at).toLocaleDateString()}
                        </Text>
                      </HStack>
                    </Flex>
                  </Box>
                </Box>
              ))}
            </SimpleGrid>
          ) : (
            <Box
              bg="white"
              borderRadius="xl"
              p={16}
              textAlign="center"
              shadow="md"
            >
              <Icon as={FiFileText} boxSize={16} color="gray.300" mb={4} />
              <Heading fontSize="xl" color="gray.600" mb={2}>
                No posts yet
              </Heading>
              <Text color="gray.500">
                {isOwnProfile
                  ? "Start sharing your thoughts with the community!"
                  : "This user hasn't posted anything yet."}
              </Text>
              {isOwnProfile && (
                <Button
                  colorScheme="blue"
                  mt={6}
                  leftIcon={<FiEdit />}
                  onClick={() => navigate('/create-post')}
                >
                  Create Your First Post
                </Button>
              )}
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default Profile;
