import React, { useEffect, useState } from 'react';
import AdminNavbar from './AdminNavbar';
import axios from 'axios';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Flex,
  Spinner,
  Image,
  useToast,
  Container,
  Avatar,
  HStack,
  VStack,
  Icon,
  Badge,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Divider,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatGroup,
} from '@chakra-ui/react';
import { API_BASE_URL } from '../../config/api';
import {
  FiUsers,
  FiFileText,
  FiTrash2,
  FiMoreVertical,
  FiClock,
  FiHeart,
  FiMessageCircle,
  FiEye,
  FiShield,
  FiTrendingUp,
} from 'react-icons/fi';

const Admin = () => {
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');

      // Fetch all posts
      const postsRes = await axios.get(`${API_BASE_URL}/api/feeds`, {
        headers: { Authorization: token },
      });
      setPosts(postsRes.data);

      // Fetch all users
      const usersRes = await axios.get(`${API_BASE_URL}/api/users`, {
        headers: { Authorization: token },
      });
      setUsers(usersRes.data);

      setLoading(false);
    } catch (err) {
      console.error(err);
      toast({
        title: 'Error',
        description: 'Failed to fetch data',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
      setLoading(false);
    }
  };

  const deletePost = async (postId) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/delete-post/${postId}`);
      toast({
        title: 'Post deleted',
        description: 'The post has been successfully deleted',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
      setPosts(posts.filter((post) => post.id !== postId));
    } catch (err) {
      console.error(err);
      toast({
        title: 'Error',
        description: 'Failed to delete post',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
    }
  };

  const deleteUser = async (userId) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/delete-user/${userId}`);
      toast({
        title: 'User deleted',
        description: 'The user has been successfully deleted',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
      setUsers(users.filter((user) => user.id !== userId));
    } catch (err) {
      console.error(err);
      toast({
        title: 'Error',
        description: 'Failed to delete user',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
    }
  };

  const formatDate = (date) => {
    const postDate = new Date(date);
    return postDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <Box minH="100vh" bg="gray.50">
        <AdminNavbar />
        <Flex justify="center" align="center" minH="80vh">
          <VStack spacing={4}>
            <Spinner size="xl" color="blue.500" thickness="4px" />
            <Text color="gray.500" fontSize="lg">
              Loading dashboard...
            </Text>
          </VStack>
        </Flex>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="gray.50">
      <AdminNavbar />

      <Container maxW="7xl" py={8}>
        {/* Header */}
        <Flex align="center" gap={3} mb={8}>
          <Icon as={FiShield} boxSize={10} color="blue.600" />
          <Box>
            <Heading
              fontSize="4xl"
              bgGradient="linear(to-r, blue.600, purple.600)"
              bgClip="text"
            >
              Admin Dashboard
            </Heading>
            <Text color="gray.600" fontSize="lg">
              Manage users and content
            </Text>
          </Box>
        </Flex>

        {/* Stats Cards */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
          <Box bg="white" p={6} borderRadius="xl" shadow="md">
            <Stat>
              <Flex justify="space-between" align="center">
                <Box>
                  <StatLabel fontSize="md" color="gray.600">
                    Total Posts
                  </StatLabel>
                  <StatNumber fontSize="4xl" color="blue.600">
                    {posts.length}
                  </StatNumber>
                </Box>
                <Icon as={FiFileText} boxSize={12} color="blue.400" />
              </Flex>
            </Stat>
          </Box>

          <Box bg="white" p={6} borderRadius="xl" shadow="md">
            <Stat>
              <Flex justify="space-between" align="center">
                <Box>
                  <StatLabel fontSize="md" color="gray.600">
                    Total Users
                  </StatLabel>
                  <StatNumber fontSize="4xl" color="purple.600">
                    {users.length}
                  </StatNumber>
                </Box>
                <Icon as={FiUsers} boxSize={12} color="purple.400" />
              </Flex>
            </Stat>
          </Box>

          <Box bg="white" p={6} borderRadius="xl" shadow="md">
            <Stat>
              <Flex justify="space-between" align="center">
                <Box>
                  <StatLabel fontSize="md" color="gray.600">
                    Total Likes
                  </StatLabel>
                  <StatNumber fontSize="4xl" color="red.600">
                    {posts.reduce((acc, post) => acc + post.like_count, 0)}
                  </StatNumber>
                </Box>
                <Icon as={FiHeart} boxSize={12} color="red.400" />
              </Flex>
            </Stat>
          </Box>
        </SimpleGrid>

        {/* All Posts Section */}
        <Box mb={8}>
          <Flex align="center" gap={3} mb={6}>
            <Icon as={FiFileText} boxSize={6} color="blue.600" />
            <Heading fontSize="2xl">All Posts</Heading>
            <Badge colorScheme="blue" fontSize="md" px={3} py={1} borderRadius="full">
              {posts.length}
            </Badge>
          </Flex>

          {posts.length > 0 ? (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {posts.map((post) => (
                <Box
                  key={post.id}
                  bg="white"
                  borderRadius="xl"
                  overflow="hidden"
                  shadow="md"
                  transition="all 0.3s"
                  _hover={{
                    shadow: '2xl',
                    transform: 'translateY(-4px)',
                  }}
                >
                  {post.image_url && (
                    <Image
                      src={`${API_BASE_URL}/Post_images/${post.image_url}`}
                      alt="post image"
                      w="100%"
                      h="200px"
                      objectFit="cover"
                    />
                  )}

                  <Box p={5}>
                    <Flex justify="space-between" align="start" mb={3}>
                      <Heading fontSize="lg" noOfLines={2} flex={1}>
                        {post.title}
                      </Heading>
                      <Menu>
                        <MenuButton
                          as={IconButton}
                          icon={<FiMoreVertical />}
                          variant="ghost"
                          size="sm"
                        />
                        <MenuList>
                          <MenuItem
                            icon={<FiTrash2 />}
                            color="red.500"
                            onClick={() => deletePost(post.id)}
                          >
                            Delete Post
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </Flex>

                    <Text color="gray.600" noOfLines={2} mb={4} fontSize="sm">
                      {post.content}
                    </Text>

                    <Divider mb={3} />

                    <VStack align="stretch" spacing={2}>
                      <HStack spacing={2} fontSize="sm" color="gray.600">
                        <Icon as={FiUsers} />
                        <Text fontWeight="500">By {post.username}</Text>
                      </HStack>
                      <HStack spacing={2} fontSize="sm" color="gray.600">
                        <Icon as={FiClock} />
                        <Text>{formatDate(post.created_at)}</Text>
                      </HStack>
                      <HStack spacing={4}>
                        <HStack spacing={1}>
                          <Icon as={FiHeart} color="red.500" />
                          <Text fontSize="sm" fontWeight="600">
                            {post.like_count}
                          </Text>
                        </HStack>
                      </HStack>
                    </VStack>
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
              <Text color="gray.500">No posts have been created</Text>
            </Box>
          )}
        </Box>

        <Divider my={8} />

        {/* All Users Section */}
        <Box>
          <Flex align="center" gap={3} mb={6}>
            <Icon as={FiUsers} boxSize={6} color="purple.600" />
            <Heading fontSize="2xl">All Users</Heading>
            <Badge colorScheme="purple" fontSize="md" px={3} py={1} borderRadius="full">
              {users.length}
            </Badge>
          </Flex>

          {users.length > 0 ? (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {users.map((user) => (
                <Box
                  key={user.id}
                  bg="white"
                  p={6}
                  borderRadius="xl"
                  shadow="md"
                  transition="all 0.3s"
                  _hover={{
                    shadow: '2xl',
                    transform: 'translateY(-4px)',
                  }}
                >
                  <Flex justify="space-between" align="start" mb={4}>
                    <HStack spacing={3}>
                      <Avatar name={user.username} size="md" bg="purple.400" />
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="600" fontSize="lg">
                          {user.username}
                        </Text>
                        <Badge colorScheme="green" fontSize="xs">
                          {user.role}
                        </Badge>
                      </VStack>
                    </HStack>
                    <Menu>
                      <MenuButton
                        as={IconButton}
                        icon={<FiMoreVertical />}
                        variant="ghost"
                        size="sm"
                      />
                      <MenuList>
                        <MenuItem
                          icon={<FiTrash2 />}
                          color="red.500"
                          onClick={() => deleteUser(user.id)}
                        >
                          Delete User
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </Flex>

                  <Divider mb={3} />

                  <VStack align="stretch" spacing={2}>
                    <Text fontSize="sm" color="gray.600">
                      <strong>Email:</strong> {user.email}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      <strong>Joined:</strong> {formatDate(user.created_at)}
                    </Text>
                  </VStack>
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
              <Icon as={FiUsers} boxSize={16} color="gray.300" mb={4} />
              <Heading fontSize="xl" color="gray.600" mb={2}>
                No users yet
              </Heading>
              <Text color="gray.500">No users have registered</Text>
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default Admin;