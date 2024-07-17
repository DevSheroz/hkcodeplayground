import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, Input, InputGroup, InputRightElement, Text, Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/react';
import SendIcon from '@mui/icons-material/Send';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import axios from 'axios';
import { motion } from 'framer-motion';
import styled, { keyframes } from 'styled-components';

// Keyframes for appearing and disappearing dots
const fade = keyframes`
    0%, 100% {
        opacity: 1;
    }
    50% {
        opacity: 0;
    }
`;

const GeneratingDots = styled.div`
    display: flex;
    align-items: flex-end;
    justify-content: center;
    height: 100%;

    span {
        display: inline-block;
        width: 3px;
        height: 3px;
        margin-bottom: 17px;
        margin-right: 5px;
        background-color: #728096;
        border-radius: 50%;
        animation: ${fade} 1.2s infinite;
    }

    span:nth-child(2) {
        animation-delay: 0.4s;
    }

    span:nth-child(3) {
        animation-delay: 0.8s;
    }
`;

const ChatPrompt = ({ cacheKey }) => {
    const [message, setMessage] = useState('');
    const [chatResponse, setChatResponse] = useState(null);  // Store the response
    const [isLoading, setIsLoading] = useState(false);
    const controllerRef = useRef(null); // Reference to store the AbortController
    const responseRef = useRef(null); // Reference to the response Box

    useEffect(() => {
        // Clean up on component unmount
        return () => {
            if (controllerRef.current) {
                controllerRef.current.abort();
            }
        };
    }, []);

    useEffect(() => {
        if (chatResponse && responseRef.current) {
            responseRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    }, [chatResponse]);

    const handleSend = async () => {
        if (message.trim() !== '' || isLoading) {
            if (isLoading) {
                setIsLoading(false);
                if (controllerRef.current) {
                    controllerRef.current.abort(); // Abort the request
                }
                return;
            }

            console.log(message, cacheKey);
            setIsLoading(true);

            controllerRef.current = new AbortController(); // Create a new AbortController

            try {
                const res = await axios.post('http://localhost:8001/chat', null, {
                    params: {
                        query: message,
                        cache_key: cacheKey
                    },
                    signal: controllerRef.current.signal // Pass the signal to the request
                });

                if (res.status === 200) {
                    console.log(res.data);
                    setChatResponse(res.data); 
                }
            } catch (error) {
                if (axios.isCancel(error)) {
                    console.log('Request canceled', error.message);
                } else {
                    console.error('Error:', error);
                }
            } finally {
                setIsLoading(false);
            }

            setMessage('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    const renderDataFrame = (dataFrame) => {
        const { columns, index, data } = dataFrame;
    
        return (
            <Box overflowX="auto" maxWidth="100%">
                <Table variant="simple">
                    <Thead>
                        <Tr>
                            <Th>Index</Th>
                            {columns.map((col) => (
                                <Th key={col}>{col}</Th>
                            ))}
                        </Tr>
                    </Thead>
                    <Tbody>
                        {data.map((row, rowIndex) => (
                            <Tr key={rowIndex}>
                                <Td>{index[rowIndex]}</Td>
                                {row.map((cell, cellIndex) => (
                                    <Td key={cellIndex}>{cell}</Td>
                                ))}
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </Box>
        );
    };

    return (
        <Box 
            display="flex" 
            flexDirection="column" 
            alignItems="center" 
            p={2} 
            bg="gray.50" 
            borderRadius="10px" 
            boxShadow="0 0 10px rgba(0, 0, 0, 0.1)"
            width={{ base: '100%', md: '60%' }} 
            mx="auto"
            style={{ scrollBehavior: 'smooth' }} // Enable smooth scrolling
        >
            <InputGroup size="md" position="relative">
                {isLoading ? (
                    <Box
                        display="flex"
                        alignItems="center"
                        pl="20px"
                        width="100%"
                        minHeight="50px"
                        border="1px solid"
                        borderColor="gray.300"
                        borderRadius="30px"
                        _hover={{ borderColor: 'gray.500' }}
                        _focus={{ borderColor: 'gray.600'}}
                    >
                        <Text mr={2} fontStyle="italic" color="gray.500">Generating</Text>
                        <GeneratingDots>
                            <span></span>
                            <span></span>
                            <span></span>
                        </GeneratingDots>
                    </Box>
                ) : (
                    <Input
                        minHeight="50px"
                        pl="20px"
                        type="text"
                        placeholder="Ask a question..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyPress}
                        variant="unstyled"
                        border="1px solid"
                        borderColor="gray.300" 
                        borderRadius="30px"
                        _hover={{ borderColor: 'gray.500' }} 
                        _focus={{ borderColor: 'gray.600', boxShadow: '0 0 0 1px gray.500' }} 
                        disabled={isLoading}
                    />
                )}
                <InputRightElement 
                    position="absolute"
                    top="50%"
                    transform="translateY(-50%)"
                    right="10px"
                >
                    <motion.div 
                        whileTap={{ scale: 0.8 }} 
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <Button 
                            onClick={handleSend} 
                            bg="blackAlpha.800" 
                            color="white" 
                            borderRadius="50%"
                            _hover={{ bg: 'gray.700' }} 
                            _active={{ bg: 'gray.800' }}
                            display="flex" 
                            alignItems="center" 
                            justifyContent="center"
                            width="40px"
                            height="40px"
                            minWidth="40px"
                            minHeight="40px"
                            padding="0"
                        >
                            {isLoading ? <StopCircleIcon /> : <SendIcon />}
                        </Button>
                    </motion.div>
                </InputRightElement>
            </InputGroup>
                {!isLoading && chatResponse && (chatResponse.type === 'string' || chatResponse.type === 'number' || chatResponse.type === 'error') && (
                    <Box ref={responseRef} mt={4} p={2} bg="gray.50" borderRadius="10px" width="100%">
                        <Text>
                            Response: {chatResponse.value}
                        </Text>
                    </Box>
                )}
                {!isLoading && chatResponse && chatResponse.type === 'plot' && (
                    <Box ref={responseRef} mt={4} p={2} bg="gray.50" borderRadius="10px" width="100%" height="100%" display="flex" justifyContent="center">
                        <img src={chatResponse.value} alt="Plot" />
                    </Box>
                )}
                {!isLoading && chatResponse && chatResponse.type === 'dataframe' && (
                    <Box ref={responseRef} mt={4} p={2} bg="gray.50" borderRadius="10px" width="100%" overflowX="auto">
                        {renderDataFrame(JSON.parse(chatResponse.value))}
                    </Box>
                )}
            </Box>
    );
};

export default ChatPrompt;
