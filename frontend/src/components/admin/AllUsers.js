import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminNavbar from "./AdminNavbar";
import { API_BASE_URL } from '../../config/api';
import {
  Box,
  Divider,
  Flex,
  Heading,
  Input,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  Spinner,
  Text,
  useToast,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Search2Icon, SearchIcon } from "@chakra-ui/icons";

const AllUsers = () => {
  const [users, SetUsers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();

  const toast = useToast();

  useEffect(() => {
    const fetchData = async () => {
      await axios
        .get(
          searchTerm
            ? `${API_BASE_URL}/api/search-users/${searchTerm}`
            : `${API_BASE_URL}/api/users`,
          {
            headers: { Authorization: localStorage.getItem("token") },
          }
        )
        .then((res) => {
          SetUsers(res.data);
          setIsLoading(false);
        })
        .catch((err) => console.log(err.response.data.msg));
    };
    fetchData();
  }, [users, searchTerm]);

  const deleteUser = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/delete-user/${id}`);
      toast({
        title: "User deleted",
        description: "user has been deleted successfulyy",
        status: "success",
        duration: 4000,
        isClosable: true,
        position: "top-right",
      });
    } catch (err) {
      console.log(err.response.data.msg);
      toast({
        title: "Error",
        description: "something went wron.",
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top-right",
      });
    }
  };
  console.log(searchTerm);

  return (
    <>
      <AdminNavbar />
      <Box maxW="6xl" mx="auto" mt={10}>
        <Heading mt={10} align="center">
          All Users
        </Heading>
        <InputGroup mt={6}>
          <InputLeftElement>
            <SearchIcon color="gray.600" />
          </InputLeftElement>
          <Input
            focusBorderColor="blue.500"
            variant="filled"
            onChange={(e) => setSearchTerm(e.target.value)}
            borderRadius="3xl"
          />
        </InputGroup>
        {isLoading ? (
          <Flex justify="center" align="center" minH="200px">
            <Spinner size="lg" color="blue.500" />
          </Flex>
        ) : (
          <SimpleGrid mt={8} columns={{ base: 1, md: 3 }} spacing={6}>
            {users.length > 0 ? (
              users.map((user) => (
                <Box
                  key={user.id}
                  p={4}
                  borderWidth="1px"
                  borderRadius="lg"
                  boxShadow="md"
                  bg="gray.50"
                >
                  <Heading mb={2} fontSize="xl">
                    {user.username}
                  </Heading>
                  <Text mb={4}>{user.email}</Text>
                  <Text>{user.role}</Text>
                  <Divider />
                  <Flex mt={4} justifyContent="space-between">
                    <Link
                      style={{ color: "green" }}
                      to={`/admin/profile/${user.id}`}
                    >
                      View
                    </Link>
                    <Link
                      style={{ color: "red" }}
                      onClick={() => deleteUser(user.id)}
                    >
                      Delete
                    </Link>
                  </Flex>
                </Box>
              ))
            ) : (
              <Flex justify="center" align="center" minH="200px" w="100%">
                <Text>No Data Available</Text>
              </Flex>
            )}
          </SimpleGrid>
        )}
      </Box>
    </>
  );
};

export default AllUsers;
