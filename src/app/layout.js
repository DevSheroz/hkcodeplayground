"use client";

import { ChakraProvider } from '@chakra-ui/react';
import theme from './styles/theme';

const metadata = {
  title: "HKCodePlayground",
  description: "",
};


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
      </head>
      <body>
        <ChakraProvider theme={theme}>
          {children}
        </ChakraProvider>
      </body>
    </html>
  );
}
