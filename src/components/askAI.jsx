import React, { useState } from 'react';
import { Box, Button, Input, InputGroup, InputRightElement } from '@chakra-ui/react';
import { IoSend } from 'react-icons/io5'; // Import the IoSend icon from react-icons

const ChatPrompt = ({ onSend }) => {
    const [message, setMessage] = useState('');

    const handleSend = () => {
        if (message.trim() !== '') {
            onSend(message);
            setMessage('');
        }
    };

    return (
        <Box 
            display="flex" 
            alignItems="center" 
            p={2} 
            bg="gray.50" 
            borderRadius="md" 
            boxShadow="sm" 
            width={{ base: '100%', md: '50%' }} 
            mx="auto"
        >
            <InputGroup size="md">
                <Input
                    pr="4.5rem"
                    type="text"
                    placeholder="Ask a question..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
                <InputRightElement width="4.5rem">
                    <Button h="1.75rem" size="sm" onClick={handleSend} colorScheme="blue">
                        <IoSend />
                    </Button>
                </InputRightElement>
            </InputGroup>
        </Box>
    );
};

export default ChatPrompt;
