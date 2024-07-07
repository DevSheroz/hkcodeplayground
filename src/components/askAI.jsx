import React, { useState } from 'react';
import { Box, Button, Input, InputGroup, InputRightElement, Text } from '@chakra-ui/react';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
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
    const [isLoading, setIsLoading] = useState(false);

    const handleSend = async () => {
        if (message.trim() !== '' || isLoading) {
            if (isLoading) {
                setIsLoading(false);
                return;
            }

            console.log(message, cacheKey);
            setIsLoading(true);

            try {
                const response = await axios.post('http://localhost:8001/chat', null, {
                    params: {
                        query: message,
                        cache_key: cacheKey
                    }
                });

                if (response.status === 200) {
                    console.log(response.data);
                } else {
                    console.error('Error:', response.status, response.statusText);
                }
            } catch (error) {
                console.error('Error:', error);
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

    return (
        <Box 
            display="flex" 
            alignItems="center" 
            p={2} 
            bg="gray.50" 
            borderRadius="10px" 
            boxShadow="sm" 
            width={{ base: '100%', md: '50%' }} 
            mx="auto"
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
                        _focus={{ borderColor: 'gray.600', boxShadow: '0 0 0 1px gray.500' }}
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
                            {isLoading ? <StopCircleIcon /> : <ArrowUpwardIcon />}
                        </Button>
                    </motion.div>
                </InputRightElement>
            </InputGroup>
        </Box>
    );
};

export default ChatPrompt;
