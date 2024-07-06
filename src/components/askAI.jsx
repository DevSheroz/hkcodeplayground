import React, { useState } from 'react';
import { Box, Button, Input, InputGroup, InputRightElement } from '@chakra-ui/react';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

const ChatPrompt = ({ onSend }) => {
    const [message, setMessage] = useState('');

    const handleSend = () => {
        if (message.trim() !== '') {
            console.log(message);
            setMessage('');
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
                <Input
                    minHeight="50px"
                    pl="10px"
                    type="text"
                    placeholder="Ask a question..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    variant="unstyled"
                    border="1px solid"
                    borderColor="gray.300" 
                    borderRadius="30px"
                    _hover={{ borderColor: 'gray.500' }} 
                    _focus={{ borderColor: 'gray.600', boxShadow: '0 0 0 1px gray.500' }} 
                />
                <InputRightElement 
                    position="absolute"
                    top="50%"
                    transform="translateY(-50%)"
                    right="10px"
                >
                    <Button 
                        size="md" 
                        onClick={handleSend} 
                        bg="blackAlpha.800" 
                        color="white" 
                        borderRadius="50%"
                        _hover={{ bg: 'gray.700' }} 
                        _active={{ bg: 'gray.800' }}
                        display="flex" 
                        alignItems="center" 
                        justifyContent="center"
                    >
                        <ArrowUpwardIcon />
                    </Button>
                </InputRightElement>
            </InputGroup>
        </Box>
    );
};

export default ChatPrompt;
