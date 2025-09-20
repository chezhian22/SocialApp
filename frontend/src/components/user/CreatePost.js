import React,{useState} from 'react'
import UserNav from './UserNav';
import axios from 'axios';
import { Form, useNavigate } from 'react-router-dom';
import { Box, Button, FormControl, FormLabel, Heading, Input, Textarea, VStack ,useToast} from '@chakra-ui/react';

const CreatePost = () => {
  const navigate = useNavigate();
  const [createPost,setCreatePost] = useState({title:'',content:'',image:null});
 
  const toast = useToast();

   const handleSubmit = async e =>{
      e.preventDefault();
      try{
        const formData = new FormData();
        formData.append("title",createPost.title);
        formData.append("content",createPost.content);
        formData.append("image",createPost.image)
        await axios.post('http://localhost:5000/api/create-post',formData,
          {headers:{Authorization:localStorage.getItem('token')}});
         
          toast({
            title: "Post Created",
            description:"your post hasbeen successfully published",
            status:'success',
            duration:3000,
            isClosable:true,
            position:'top-right'
          })
          navigate('/feed');
      }catch(err){
        console.log(err.response.data.msg);
        toast({
          title:'Error',
          description:'something went wrong',
          status:'error',
          duration:4000,
          isClosable:true,
          position:'top-right'
        })
      }
   }
   
   const handleChange = e =>{
     setCreatePost({...createPost,[e.target.name]:e.target.value});
   }

   const handleFileChange =(e)=>{
    setCreatePost({...createPost,image:e.target.files[0]})
   }

  return (
    <>
    <UserNav/>
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
    <Box mt={4} maxW="3xl" justify="center" align="center" mx="auto" borderWidth={4} px={10} py={5}>
         <Heading align="center" fontSize="2xl" color="blue.600">Create Your's</Heading>
         <form onSubmit={handleSubmit}>
         <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Enter title</FormLabel>
              <Input name="title" type='text' placeholder='title' onChange={handleChange} ></Input>
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Enter title</FormLabel>
              <Textarea name="content" type='text' placeholder='content' onChange={handleChange} ></Textarea>
            </FormControl>
            <FormControl>
              <FormLabel>Upload Image</FormLabel>
              <Input type ="file" accept="image/*" name="image" onChange={handleFileChange}/>
            </FormControl>
            <Button type='submit' bg="blue.500" color="white">Make now</Button>
          </VStack>
         </form>
          
         
    </Box>
    </>
  )
}

export default CreatePost
