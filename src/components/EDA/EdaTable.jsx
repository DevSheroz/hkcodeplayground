import React from "react";
import {
    Stack,
    Text,
    VStack,
    Button
} from "@chakra-ui/react";

const EdaTable = () => {
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
                <Text>Table</Text>
                <Button width="10%">Test</Button>
            </Stack>
        </VStack>
    )
}

export default EdaTable;
