import React, { useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Text,
  VStack,
  Heading,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { Form } from "react-router-dom";
import { getUserRole } from "../../utils/auth";

const LoginRegister = ({ onAuthSuccess }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "user",
  });
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? "login" : "register";

    try {
      const res = await axios.post(
        `http://localhost:5000/api/${endpoint}`,
        formData
      );
      if (isLogin) {
        localStorage.setItem("token", res.data.token);
        onAuthSuccess();
        const role = getUserRole();
        if(role=="admin"){
          navigate("/admin")
        }else if(role=="user"){
          navigate("/feed")
        }
        
      }
      setMessage(res.data.msg || "Success!");
    } catch (err) {
      setMessage(err.response?.data?.msg || "Something went wrong");
    }
  };

  return (
    <Box
      maxW="md"
      mx="auto"
      mt={10}
      p={6}
      borderWidth={1}
      borderRadius="1g"
      boxShadow="lg"
    >
      <Heading align="center" afontSize="2xl" mb={4}>{isLogin ? "Login" : "Register"}</Heading>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          {!isLogin && (
            <FormControl isRequired>
              <FormLabel>Username</FormLabel>
              <Input
                name="username"
                placeholder="Username"
                onChange={handleChange}
              />
            </FormControl>
          )}
          <FormControl isRequired>
            <FormLabel>Email</FormLabel>
            <Input
              name="email"
              type="email"
              placeholder="email"
              onChange={handleChange}
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Password</FormLabel>
            <Input
              name="password"
              type="password"
              placeholder="password"
              onChange={handleChange}
            />
          </FormControl>
          {!isLogin && (
            <FormControl isRequired>
              <Select name="role" defaultValue="user" onChange={handleChange}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </Select>
            </FormControl>
          )}
          <Button colorScheme="blue" type="submit" width='full'>{isLogin?'Login':'Regster'}
          </Button>
        </VStack>
        <Button mt={4} variant='link' onClick={()=> setIsLogin(!isLogin)}>{isLogin?'Switch to Register':'Switch to Login'}</Button>
        {message&&<Text mt={4} color="red.500">{message}</Text>}
      </form>
    </Box>
  );
};

export default LoginRegister;
