import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Heading,
  Text,
  Spinner,
  Flex,
  Divider,
  useColorModeValue,
  Textarea,
  Button,
  VStack,
  Image,
  useToast
} from "@chakra-ui/react";
import UserNavbar from "./UserNav";
import { jwtDecode } from "jwt-decode";
import { API_BASE_URL } from '../../config/api';

const PostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState({content:""});
  const cardBg = useColorModeValue("gray.50", "gray.700");

  const toast = useToast();

  const navigate = useNavigate()

  const user_id = jwtDecode(localStorage.getItem('token')).user_id;
  // console.log("uuuser"+user_id)

  useEffect(() => {
    // Fetch post details
    axios
      .get(`${API_BASE_URL}/api/feed/${id}`, {
        headers: { Authorization: localStorage.getItem("token") },
      })
      .then((res) => {
        setPost(res.data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err.response.data.msg);
        setIsLoading(false);
      });
    axios
      .get(`${API_BASE_URL}/api/comments/${id}`, {
        headers: { Authorization: localStorage.getItem("token") },
      })
      .then((res) => setComments(res.data))
      .catch((err) => console.error(err.response.data.msg));
  }, [id]);
  // console.log(comments)

  const handleComment =e=>{
    setNewComment({...newComment,[e.target.name]:e.target.value})
  }

  const submitComment =async(id)=>{
      await axios.post(`${API_BASE_URL}/api/post-comment/${id}`,newComment,{
        headers:{Authorization:localStorage.getItem('token')}
      }).then(res=>{
        console.log(res.data.msg)
        toast({
          title:'Comment added',
          description:'your comment has been added successfully',
          status:'success',
          duration:4000,
          isClosable:true,
          position:'top-right'
        })
        window.location.reload();
  }).catch((err)=>{
    console.log(err.response.data.msg)
    toast({
      title:'Error',
      description:'something went wrong.',
      status:'error',
      duration:4000,
      isClosable:true,
      position:'top-right'
    })
  });
  }
  const handleConnection =async()=>{
    const receiver_id = post.user_id;
     await axios.post(`${API_BASE_URL}/api/initiate-connection/${receiver_id}/${user_id}`,{},{
      headers:{Authorization:localStorage.getItem('token')}
     }).then(res=>console.log(res)).catch(err=>console.log("errrrrrrrrrrrrr"+err));
  }
//  console.log(post)
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
      <Heading mt={4}align="center" color="blue.600">
        Post
      </Heading>
      <Box maxW="3xl" mx="auto" p={0} mt={8}>
        {isLoading ? (
          <Flex justify="center" align="center" minH="200px">
            <Spinner size="xl" color="blue.500"></Spinner>
          </Flex>
        ) : post ? (
          <>
            <Box boxShadow="md" borderRadius="lg" p={6} bg={cardBg}>
              <Flex mb={4} justify="space-between">
              <Box>
              <Heading mb={4} fontSize="2xl">
                {post.title}
              </Heading>
              <Text mb={4}>{post.content}</Text>
              </Box>
              <Image
              objectFit="cover"
              src={`${API_BASE_URL}/Post_images/${post.image_url}`} alt="post image"
              maxH="300px"
              maxW="300px"
              borderRadius="lg"
              boxShadow="md"
              />
              </Flex>
              <Divider />
              <Flex mt={4} justify="space-between">
                <Text>{post.username} {new Date(post.created_at).toLocaleDateString()}</Text>
                <Button bg="blue.500" color="white" w="130px" onClick={handleConnection}>Connect</Button>
              </Flex>
              <Text mt={4}>{post.like_count} {post.like_count>1?'Likes':'Like'}</Text>
            </Box>
            <Box mt={4}>
              <Heading fontSize="xl" color="gray.600" mb={2}>
                💬 Comments
              </Heading>
              <Textarea placeholder="write a comment..." resize="none" name="content" onChange={handleComment} />
              <Button
                bg="blue.500"
                color="white"
                onClick={()=>submitComment(id)}
              >
                Post a comment
              </Button>
            </Box>
            <Text ml={4} mt={4}>Count: {comments.length}</Text>
            <Box mt={2} p={4} borderWidth={4}>
              {comments.length>0?(
                <VStack spacing={4} align="strech">
                  {comments.map((comment) => (
                    
                    <Box mb={2} key={comment.id}px={2}>
                      <Text mb={4}>{comment.content}</Text>
                      <Flex justify="space-between" fontSize="sm" color="gray.500">
                      <Text>
                        {new Date(comment.created_at).toLocaleString()}
                      </Text>
                      <Text>by {comment.username}</Text>
                      </Flex>
                     
                      <Divider/>
                    </Box>)
                  )}
                </VStack>
              ) : 
                <Text align="center" justify="center">
                  No comments yet.Be the first
                </Text>
              }
            </Box>
          </>
        ) : (
          <Text>No Post Found</Text>
        )}
      </Box>
    </>
  );
};

export default PostDetail;
