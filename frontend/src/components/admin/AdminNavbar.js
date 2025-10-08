import { HamburgerIcon } from "@chakra-ui/icons";
import { Box, IconButton, useDisclosure, Drawer, DrawerOverlay, DrawerContent, DrawerCloseButton, DrawerBody, Text, VStack, Button, Link as ChakraLink, Flex, Icon, Heading, Divider, Badge } from "@chakra-ui/react";
import DarkMode from "../DarkMode";
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FiMenu, FiShield, FiUsers, FiFileText, FiLogOut, FiSettings } from "react-icons/fi";

const AdminNavbar = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  const isActive = (path) => location.pathname === path;

  const DrawerLink = ({ to, icon, children }) => {
    const active = isActive(to);
    return (
      <ChakraLink
        as={Link}
        to={to}
        onClick={onClose}
        display="flex"
        alignItems="center"
        gap={3}
        px={4}
        py={3}
        borderRadius="lg"
        fontWeight="500"
        fontSize="md"
        transition="all 0.2s"
        bg={active ? "blue.50" : "transparent"}
        color={active ? "blue.600" : "gray.700"}
        _hover={{
          bg: "blue.50",
          color: "blue.600",
          transform: "translateX(8px)",
        }}
        w="100%"
      >
        <Icon as={icon} boxSize={5} />
        <Text>{children}</Text>
      </ChakraLink>
    );
  };

  return (
    <>
      <Box
        p={4}
        bg="gradient-to-r from-blue-600 to-purple-600"
        bgGradient="linear(to-r, blue.600, purple.600)"
        color="white"
        shadow="lg"
        position="sticky"
        top={0}
        zIndex={1000}
      >
        <Flex align="center" gap={4}>
          <IconButton
            icon={<FiMenu />}
            onClick={onOpen}
            variant="ghost"
            aria-label="Open Menu"
            color="white"
            _hover={{ bg: "whiteAlpha.300" }}
            size="lg"
          />
          <Flex align="center" gap={3}>
            <Box
              bg="white"
              p={2}
              borderRadius="lg"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Icon as={FiShield} boxSize={6} color="blue.600" />
            </Box>
            <Heading fontSize="2xl" fontWeight="bold" letterSpacing="tight">
              SocialApp
            </Heading>
            <Badge
              colorScheme="yellow"
              fontSize="xs"
              px={2}
              py={1}
              borderRadius="md"
            >
              Admin
            </Badge>
          </Flex>
        </Flex>
      </Box>

      <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="sm">
        <DrawerOverlay backdropFilter="blur(4px)" />
        <DrawerContent>
          <Box
            bg="gradient-to-b from-blue-600 to-purple-600"
            bgGradient="linear(to-b, blue.600, purple.600)"
            p={6}
            color="white"
          >
            <DrawerCloseButton
              color="white"
              _hover={{ bg: "whiteAlpha.300" }}
            />
            <Flex align="center" gap={3} mt={2}>
              <Box
                bg="whiteAlpha.300"
                p={3}
                borderRadius="lg"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Icon as={FiShield} boxSize={8} />
              </Box>
              <Box>
                <Heading fontSize="xl">Admin Panel</Heading>
                <Text fontSize="sm" opacity={0.9}>
                  Manage your platform
                </Text>
              </Box>
            </Flex>
          </Box>

          <DrawerBody p={4}>
            <Flex flexDirection="column" h="100%" justify="space-between">
              <VStack spacing={2} align="stretch">
                <Text
                  fontSize="xs"
                  fontWeight="bold"
                  color="gray.500"
                  px={4}
                  mt={2}
                  mb={1}
                >
                  NAVIGATION
                </Text>
                <DrawerLink to="/admin" icon={FiShield}>
                  Dashboard
                </DrawerLink>
                <DrawerLink to="/admin/all-users" icon={FiUsers}>
                  All Users
                </DrawerLink>
                <DrawerLink to="/admin/manage-posts" icon={FiFileText}>
                  Manage Posts
                </DrawerLink>

                <Divider my={4} />

                <Text
                  fontSize="xs"
                  fontWeight="bold"
                  color="gray.500"
                  px={4}
                  mb={1}
                >
                  SETTINGS
                </Text>
                <Box px={4} py={2}>
                  <DarkMode />
                </Box>
              </VStack>

              <Box pb={4}>
                <Button
                  leftIcon={<FiLogOut />}
                  colorScheme="red"
                  variant="solid"
                  size="lg"
                  w="100%"
                  onClick={handleLogout}
                  _hover={{
                    transform: "translateY(-2px)",
                    shadow: "lg",
                  }}
                  transition="all 0.2s"
                >
                  Logout
                </Button>
              </Box>
            </Flex>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default AdminNavbar;
