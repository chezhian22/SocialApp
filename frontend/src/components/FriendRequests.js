import { useEffect, useState } from "react";
import {
  Box,
  Button,
  VStack,
  HStack,
  Avatar,
  Text,
  IconButton,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverBody,
} from "@chakra-ui/react";
import { jwtDecode } from "jwt-decode";
import { BellIcon } from "@chakra-ui/icons";
import axios from 'axios'

export default function FriendRequests() {
  const [friendRequests, setFriendRequests] = useState([]);

  const token = localStorage.getItem("token");
  const user_id = jwtDecode(token).user_id;

  useEffect(()=>{
    const fetchRequests = async () =>{
      try{
        const res = await axios.get(`http://localhost:5000/api/friend-requests/${user_id}`,{
          headers: {Authorization: token },
        });
        setFriendRequests(res.data);
      }catch(err){
        console.log("rrr"+err);
      }
    }
    fetchRequests()
  },[])

 const handleRequest = async (requestId, action) => {
  try {
    await axios.put(
      `http://localhost:5000/api/handle-request/${requestId}`,
      { status: action },
      { headers: { Authorization: token } }
    );
    setFriendRequests((prev) =>
      prev.filter((req) => req.connection_id !== requestId)
    );
  } catch (err) {
    console.error(`Error updating request:`, err);
  }
};


  return (
    <Popover placement="bottom-end">
      <PopoverTrigger>
        <IconButton
          icon={<BellIcon color="white" fontSize="22px"/>}
          variant="ghost"
          aria-label="Notifications"
        />
      </PopoverTrigger>

      <PopoverContent w="300px" boxShadow="lg">
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverBody>
          <Text fontWeight="bold" mb={2} fontSize={16} color="gray.700">
            Friend Requests
          </Text>

          {friendRequests.length>0 ? (
            <VStack spacing={3} align="stretch">
              {friendRequests.map((req) => (
                <HStack key={req.connection_id} justify="space-between">
                  <HStack>
                    <Avatar name={req.name} size="sm" />
                    <Text color="black">{req.username}</Text>
                  </HStack>
                  <Button size="xs" colorScheme="green" px={3} onClick={()=>handleRequest(req.connection_id,"accepted")}>
                    Accept
                  </Button>
                  <Button size="xs" colorScheme="red" px={3} onClick={()=>handleRequest(req.connection_id,"rejected")}>
                    Reject
                  </Button>
                </HStack>
              ))}
            </VStack>
          ) : (
            <Text color="gray.500" fontSize={15}>No new Requests</Text>
          )}
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}
