import React, { useState, useRef, useEffect } from 'react';
import {
    Box, Button, Input, InputGroup, Text, Table, Thead, Tbody, Tr, Th, Td,
    InputLeftElement, Divider, Menu, MenuButton, MenuList, MenuItem
} from '@chakra-ui/react';
import CloseIcon from '@mui/icons-material/Close';
import { motion } from 'framer-motion';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { FaPlus, FaTrashAlt } from "react-icons/fa";
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

import axios from 'axios';

const ChatAI = ({ selectedDataset, sessionId }) => {
    const [messages, setMessages] = useState(['']);
    const [chatResponses, setChatResponses] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(null);
    const inputRefs = useRef([]);

    useEffect(() => {
        // Reset chat history when a new dataset is selected
        if (selectedDataset) {
            setMessages(['']);
            setChatResponses([]);
        }
    }, [selectedDataset]);

    const handleSend = async (index) => {
        const message = messages[index];
        if (message.trim() !== '' && !isLoading) {
            if (!selectedDataset) {
                console.warn("No dataset selected.");
                return;
            }

            setIsLoading(true);
            
            // run only in the current cell
            const newChatResponses = [...chatResponses];
            newChatResponses[index] = { type: 'loading' };
            setChatResponses(newChatResponses);
    
            try {
                const res = await axios.post('http://localhost:8001/chat', null, {
                    params: {
                        query: message,
                        session_id: sessionId,
                        dataset: selectedDataset,
                    },
                });
    
                if (res.status === 200) {
                    newChatResponses[index] = res.data;
                    setChatResponses(newChatResponses);
                }
            } catch (error) {
                console.error('Error:', error);
                newChatResponses[index] = { type: 'error', value: 'An error occurred while processing your request.' };
                setChatResponses(newChatResponses);
            } finally {
                setIsLoading(false);
            }
        }
    };
    
    

    const handleKeyPress = (e, index) => {
        if (e.key === 'Enter') {
            handleSend(index);
        }
    };

    const handleClear = (index) => {
        const newMessages = [...messages];
        newMessages[index] = '';
        setMessages(newMessages);
    };

    const handleAddInput = async (index) => {
        const newMessages = [...messages];
        newMessages.splice(index + 1, 0, '');
        setMessages(newMessages);
    
        const newChatResponses = [...chatResponses];
        newChatResponses.splice(index + 1, 0, null);
        setChatResponses(newChatResponses);
    
        // Reset the DataAnalysisAgent for the current session
        try {
            const response = await axios.post('http://localhost:8001/reset_agent', null, {
                params: {
                    session_id: sessionId,
                },
            });
            console.log(response.data.message);
        } catch (error) {
            console.error('Error resetting agent:', error);
        }
    };
    

    const handleDeleteInput = (index) => {
        if (messages.length > 1) {
            const newMessages = [...messages];
            newMessages.splice(index, 1);
            setMessages(newMessages);

            const newChatResponses = [...chatResponses];
            newChatResponses.splice(index, 1);
            setChatResponses(newChatResponses);
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
        <>
            {messages.map((message, index) => (
                <React.Fragment key={index}>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        style={{ width: '100%' }}
                    >
                        <Box
                            display="flex"
                            flexDirection="column"
                            alignItems="center"
                            p={2}
                            bg="#F7F7FC"
                            border="1px solid"
                            borderColor="gray.300"
                            borderRadius="5px"
                            boxShadow="0 0 2px rgba(0, 0, 0, 0.1)"
                            width={{ base: '100%', md: '60%' }}
                            mx="auto"
                            mt={index > 0 ? 4 : 0}
                        >
                            <InputGroup size="md" position="relative">
                                <Box
                                    display="flex"
                                    alignItems="center"
                                    position="relative"
                                    width="100%"
                                    border={focusedIndex === index ? "3px solid" : "3px solid transparent"}
                                    borderColor={focusedIndex === index ? "blue.600" : "transparent"}
                                    borderRadius="10px"
                                    p="1.5px"
                                    transition="border-color 0.2s, border-width 0.2s, padding 0.2s"
                                >
                                    <Input
                                        ref={el => inputRefs.current[index] = el}
                                        minHeight="40px"
                                        pl="40px"
                                        type="text"
                                        fontWeight={message ? "bold" : "normal"}
                                        placeholder={`Tell me what to do...`}
                                        value={message}
                                        onChange={(e) => {
                                            const newMessages = [...messages];
                                            newMessages[index] = e.target.value;
                                            setMessages(newMessages);
                                        }}
                                        onKeyDown={(e) => handleKeyPress(e, index)}
                                        onFocus={() => setFocusedIndex(index)}
                                        onBlur={() => setFocusedIndex(null)}
                                        variant="unstyled"
                                        border="1px solid"
                                        borderColor="gray.300"
                                        bg="white"
                                    />
                                    <InputLeftElement
                                        position="absolute"
                                        top="50%"
                                        transform="translateY(-50%)"
                                        pointerEvents="none"
                                    >
                                        {isLoading ? (
                                                <Box width="35px" height="35px" pl="5px">
                                            <DotLottieReact
                                                src="https://lottie.host/cdd98452-0ac8-4f76-813a-d9d3d49606f9/qrSwwO1xyy.json"
                                                loop
                                                autoplay
                                                speed="0.5"
                                            />
                                            </Box>

                                        ) : (
                                            <AutoAwesomeIcon sx={{ color: "#FFC801", width: "30px", height: "30px", pl: "5px" }} />
                                        )}
                                    </InputLeftElement>
                                    {message && (
                                        <Button
                                            onClick={() => handleClear(index)}
                                            bg="transparent"
                                            _hover={{ bg: 'gray.200' }}
                                            size="sm"
                                            position="absolute"
                                            right="10px"
                                            top="50%"
                                            transform="translateY(-50%)"
                                            h="2rem"
                                            w="2rem"
                                            display="flex"
                                            justifyContent="center"
                                            alignItems="center"
                                            opacity="50%"
                                        >
                                            <CloseIcon fontSize="small" />
                                        </Button>
                                    )}
                                </Box>
                            </InputGroup>

                            {!isLoading && chatResponses[index] && chatResponses[index].type === 'loading' && (
                                <Box mt={4} p={2} bg="gray.50" borderRadius="10px" width="100%" display="flex" justifyContent="center" alignItems="center">
                                    <Text>Loading...</Text>
                                </Box>
                            )}

                            {!isLoading && chatResponses[index] && chatResponses[index].type === 'error' && (
                                <Box mt={4} p={2} bg="gray.50" borderRadius="10px" width="100%">
                                    <Text>Error: {chatResponses[index].value}</Text>
                                </Box>
                            )}
                            {!isLoading && chatResponses[index] && chatResponses[index].type === 'plot' && (
                                <Box mt={4} p={2} bg="gray.50" borderRadius="10px" width="100%" height="100%" display="flex" justifyContent="center">
                                    <img src={chatResponses[index].value} alt="Plot" />
                                </Box>
                            )}
                            {!isLoading && chatResponses[index] && chatResponses[index].type === 'dataframe' && (
                                <Box mt={4} p={2} bg="gray.50" borderRadius="10px" width="100%" overflowX="auto">
                                    {renderDataFrame(JSON.parse(chatResponses[index].value))}
                                </Box>
                            )}
                        </Box>

                        <Menu>
                            <MenuButton
                                display="flex"
                                position="relative"
                                width="60%"
                                height="5px"
                                _hover={{ color: 'gray.500' }}
                                _active={{ color: 'gray.700' }}
                                color="gray.400"
                                variant="unstyled"
                                mx="auto"
                                mt={2}
                            >
                                <Box
                                    position="absolute"
                                    left="-20px"
                                    top="-2px"
                                >
                                    <FaPlus size="10px" />
                                </Box>
                                <Divider borderColor="currentColor" />
                            </MenuButton>
                            <MenuList>
                                <MenuItem fontSize="13px" onClick={() => handleAddInput(index)}>
                                    <FaPlus style={{ marginRight: '8px', color:'#718096' }}  />
                                    New Conversation
                                </MenuItem>
                                <MenuItem fontSize="13px" onClick={() => handleDeleteInput(index)}>
                                    <FaTrashAlt style={{ marginRight: '8px', color:'#718096' }} />
                                    Delete Cell
                                </MenuItem>
                            </MenuList>
                        </Menu>
                    </motion.div>
                </React.Fragment>
            ))}
        </>
    );
};

export default ChatAI;
