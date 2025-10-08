import React, { useState } from 'react';
import UserNav from './UserNav';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Textarea,
  VStack,
  useToast,
  Container,
  Icon,
  Text,
  Image,
  HStack,
  Flex,
  IconButton,
} from '@chakra-ui/react';
import { API_BASE_URL } from '../../config/api';
import { FiArrowLeft, FiEdit3, FiImage, FiX } from 'react-icons/fi';

const CreatePost = () => {
  const navigate = useNavigate();
  const [createPost, setCreatePost] = useState({ title: '', content: '', image: null });
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', createPost.title);
      formData.append('content', createPost.content);
      formData.append('image', createPost.image);
      await axios.post(`${API_BASE_URL}/api/create-post`, formData, {
        headers: { Authorization: localStorage.getItem('token') },
      });

      toast({
        title: 'Post Created',
        description: 'Your post has been successfully published',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
      navigate('/feed');
    } catch (err) {
      console.log(err.response.data.msg);
      toast({
        title: 'Error',
        description: 'Something went wrong',
        status: 'error',
        duration: 4000,
        isClosable: true,
        position: 'top-right',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setCreatePost({ ...createPost, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCreatePost({ ...createPost, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setCreatePost({ ...createPost, image: null });
    setImagePreview(null);
  };

  return (
    <Box minH="100vh" bg="gray.50">
      <UserNav />

      <Container maxW="4xl" py={8}>
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

        <Box bg="white" borderRadius="2xl" shadow="xl" overflow="hidden">
          {/* Header */}
          <Flex
            bg="gradient-to-r from-blue-500 to-purple-600"
            bgGradient="linear(to-r, blue.500, purple.600)"
            p={8}
            color="white"
            align="center"
            gap={3}
          >
            <Icon as={FiEdit3} boxSize={8} />
            <Box>
              <Heading fontSize="3xl" fontWeight="bold">
                Create New Post
              </Heading>
              <Text fontSize="sm" opacity={0.9} mt={1}>
                Share your thoughts with the community
              </Text>
            </Box>
          </Flex>

          {/* Form */}
          <Box p={8}>
            <form onSubmit={handleSubmit}>
              <VStack spacing={6} align="stretch">
                <FormControl isRequired>
                  <FormLabel
                    fontWeight="600"
                    fontSize="lg"
                    color="gray.700"
                    mb={3}
                  >
                    Post Title
                  </FormLabel>
                  <Input
                    name="title"
                    type="text"
                    placeholder="Enter a catchy title..."
                    onChange={handleChange}
                    size="lg"
                    focusBorderColor="blue.500"
                    _hover={{ borderColor: 'blue.300' }}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel
                    fontWeight="600"
                    fontSize="lg"
                    color="gray.700"
                    mb={3}
                  >
                    Content
                  </FormLabel>
                  <Textarea
                    name="content"
                    placeholder="What's on your mind?"
                    onChange={handleChange}
                    size="lg"
                    minH="200px"
                    focusBorderColor="blue.500"
                    _hover={{ borderColor: 'blue.300' }}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel
                    fontWeight="600"
                    fontSize="lg"
                    color="gray.700"
                    mb={3}
                  >
                    <HStack>
                      <Icon as={FiImage} />
                      <Text>Add Image (Optional)</Text>
                    </HStack>
                  </FormLabel>

                  {!imagePreview ? (
                    <Box
                      borderWidth={2}
                      borderStyle="dashed"
                      borderColor="gray.300"
                      borderRadius="xl"
                      p={8}
                      textAlign="center"
                      cursor="pointer"
                      transition="all 0.2s"
                      _hover={{
                        borderColor: 'blue.500',
                        bg: 'blue.50',
                      }}
                      position="relative"
                    >
                      <Input
                        type="file"
                        accept="image/*"
                        name="image"
                        onChange={handleFileChange}
                        position="absolute"
                        top={0}
                        left={0}
                        width="100%"
                        height="100%"
                        opacity={0}
                        cursor="pointer"
                      />
                      <VStack spacing={3}>
                        <Icon
                          as={FiImage}
                          boxSize={12}
                          color="gray.400"
                        />
                        <Text fontSize="lg" fontWeight="500" color="gray.600">
                          Click to upload an image
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                          PNG, JPG, GIF up to 10MB
                        </Text>
                      </VStack>
                    </Box>
                  ) : (
                    <Box position="relative" borderRadius="xl" overflow="hidden">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        borderRadius="xl"
                        maxH="400px"
                        w="100%"
                        objectFit="cover"
                      />
                      <IconButton
                        icon={<FiX />}
                        position="absolute"
                        top={4}
                        right={4}
                        colorScheme="red"
                        borderRadius="full"
                        onClick={removeImage}
                        aria-label="Remove image"
                        size="lg"
                      />
                    </Box>
                  )}
                </FormControl>

                <HStack spacing={4} pt={4}>
                  <Button
                    type="submit"
                    colorScheme="blue"
                    size="lg"
                    fontSize="lg"
                    leftIcon={<FiEdit3 />}
                    isLoading={isSubmitting}
                    loadingText="Publishing..."
                    flex={1}
                    _hover={{
                      transform: 'translateY(-2px)',
                      shadow: 'lg',
                    }}
                    transition="all 0.2s"
                  >
                    Publish Post
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    fontSize="lg"
                    onClick={() => navigate(-1)}
                    _hover={{
                      bg: 'gray.100',
                    }}
                  >
                    Cancel
                  </Button>
                </HStack>
              </VStack>
            </form>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default CreatePost;
