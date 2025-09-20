import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import { IconButton, useColorMode } from '@chakra-ui/react';
import React from 'react';

const DarkMode = () => {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <IconButton
      icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
      isRound
      size="md"
      onClick={toggleColorMode}
      aria-label="Toggle Dark Mode"
    />
  );
};

export default DarkMode;
