import { HamburgerIcon } from "@chakra-ui/icons";
import { Box, IconButton, useDisclosure ,Drawer, DrawerOverlay, DrawerContent, DrawerCloseButton, DrawerBody,Text, VStack,Button, Link as ChakraLink,Flex} from "@chakra-ui/react";
import DarkMode from "../DarkMode";
import React from "react";
import { Link } from "react-router-dom";


const AdminNavbar = () => {

  const {isOpen,onOpen,onClose} = useDisclosure();

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <>
    <Box p={4} bg="blue.500" color="white">
        <IconButton 
        icon={<HamburgerIcon/>}
        onClick={onOpen}
        variant="outline"
        aria-label="Oepen Menu"
        color="white"
        borderColor="white"
        />
        <Text ml={4} as="span" fontWeight="bold">SocialApp</Text>
    </Box>
    <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
      <DrawerOverlay/>
      <DrawerContent>
        <DrawerCloseButton/>
        <DrawerBody mt={10}>
          <Flex flexDirection="column">
          <VStack spacing={5} align="start">
            <ChakraLink as={Link} to="/admin" onClick={onClose}>Admin</ChakraLink>
            <ChakraLink as={Link} to="/admin/all-users" onClick={onClose}>All users</ChakraLink>
            <ChakraLink as={Link} to="/admin/manage-posts" onClick={onClose}>Manage Posts</ChakraLink>
            <Button bg="red" onClick={handleLogout}>🔒 Logout</Button>
           </VStack>
           
           <Box mt="440px" ml="sm">
           <DarkMode/>
          </Box>
          </Flex>
          </DrawerBody >
       
      </DrawerContent>
      
    </Drawer>
    </>
  );
};

export default AdminNavbar;
