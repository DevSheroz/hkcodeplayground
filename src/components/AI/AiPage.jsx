import React, { useState, useEffect } from "react";
import {
    Stack,
    Text,
    VStack,
    Button,
    HStack
} from "@chakra-ui/react";
import axios from "axios"; // Ensure axios is imported

import ChatAI from "./ChatAI";

const AIPage = () => {
    const [selectedDataset, setSelectedDataset] = useState('');
    const [sessionId, setSessionId] = useState('');

    useEffect(() => {
        // Generate or retrieve sessionId
        const savedSessionId = localStorage.getItem('session_id');
        if (savedSessionId) {
            setSessionId(savedSessionId);
        } else {
            const newSessionId = `session_${Date.now()}`;
            localStorage.setItem('session_id', newSessionId);
            setSessionId(newSessionId);
        }
    }, []);

    const loadData = async (datasetName) => {
        try {
            const response = await axios.post(`http://localhost:8001/load_dataset`, null, {
                params: {
                    dataset: datasetName,
                    session_id: sessionId,
                },
            });
            console.log(response.data.message);
            // Update selectedDataset state after successful data load
            setSelectedDataset(datasetName);
            // Optionally, reset ChatAI's chat history here if needed
        } catch (error) {
            console.error('Error loading dataset:', error);
        }
    };

    return (
        <VStack
            width="95%"
            margin="10px auto"
            paddingX="25px"
            paddingY="20px"
            borderRadius="4px"
            spacing="12px"
            overflow="hidden"
            borderColor="#E0E0E0"
            borderWidth="1px"
            boxShadow="0px 0px 5px rgba(0, 0, 0, 0.1)"
        >
            <Stack width="100%">
                <Text fontFamily="Verdana" fontWeight="bold" fontSize="18px" color="#000000" width="100%">
                    EDA Profiling
                </Text>
                <svg width="100%" height="1">
                    <line x1="0" y1="0" x2="100%" y2="0" style={{ stroke: '#A0AEC0', strokeWidth: 1 }} />
                </svg>
            </Stack>

            <Stack 
                width="100%"
                margin="0 auto"
            >
                <Text>Choose the dataset</Text>
                <HStack>
                    <Button width="10%" onClick={() => loadData('Financial')}>Financial Data</Button>
                    <Button width="10%" onClick={() => loadData('EP')}>EP Data</Button>
                    <Button width="10%" onClick={() => loadData('Driving')}>Time Series</Button>
                </HStack>
            </Stack>

            <ChatAI selectedDataset={selectedDataset} sessionId={sessionId} />    
        </VStack>
    )
}

export default AIPage;
