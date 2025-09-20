import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { ChakraProvider, ColorModeScript,extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  fonts: {
      heading: `'Baloo 2', cursive`,   // fun, rounded, friendly
    body: `'Nunito', sans-serif`,
  },
  components: {
    Link: {
      baseStyle: {
        color: "white",      // default color
        fontWeight: "medium",   // boldness
        fontFamily: `'Baloo 2', cursive`, // nice font
        _hover: {
          textDecoration: "none", // remove underline on hover
          color: "blue.700",      // darker shade on hover
        },
      },
    },
  },
});
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <ColorModeScript initialColorMode="light"/>
        <App />
    </ChakraProvider>
  </React.StrictMode>
);
