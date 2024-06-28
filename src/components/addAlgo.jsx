import React, { useState } from "react";
import { Stack, Menu, MenuButton, MenuList, MenuItem, Button, Icon, chakra, Spinner } from "@chakra-ui/react";
import { BsPlusCircle } from "react-icons/bs";
import axios from 'axios';

const BoldMenuItem = chakra(MenuItem, {
    baseStyle: {
        fontWeight: "semibold",
    },
});

const AddAlgorithmButton = ({ onClick, cacheKey, algorithmName }) => {
    const [isRunning, setIsRunning] = useState(false);

    const handleDSNClick = async () => {
        try {
            setIsRunning(true); 

            const response = await axios.get("http://localhost:8001/add_algorithm", {
                params: {
                    cache_key: cacheKey,
                    algorithm_name: "DSN",
                },
                withCredentials: true,
            });

            if (onClick) {
                onClick(response.data);
            }
        } catch (error) {
            console.error("Error sending data:", error);
        } finally {
            setIsRunning(false);
        }
    };

    const handleMenuItemClick = (algorithm) => {
        console.log(algorithm);
        if (algorithm === "DSN") {
            handleDSNClick();
        } else {
            console.log(`Not implemented algorithm: ${algorithm}`);
        }
    };

    return (
        <Stack align="flex-end" maxWidth="100%" margin={"0 auto"}>
            <Menu>
                <MenuButton
                    as={Button}
                    size="normal"
                    fontWeight="bold"
                    display="inline-flex"
                    variant="unstyled"
                    textColor="blue.500"
                    _hover={{ color: "blue.600" }}
                    _active={{ color: "blue.700" }}
                    leftIcon={isRunning ? <Spinner size="sm" color="blue.500" marginRight="2" /> : <Icon as={BsPlusCircle} boxSize={6} />}
                >
                    {isRunning ? "Running..." : "Add Algorithm"}
                </MenuButton>
                <MenuList>
                    <BoldMenuItem onClick={() => handleMenuItemClick("DSN")}>DSN</BoldMenuItem>
                    <BoldMenuItem onClick={() => handleMenuItemClick("ERR")}>ERR</BoldMenuItem>
                    <BoldMenuItem onClick={() => handleMenuItemClick("FUEL")}>FUEL</BoldMenuItem>
                </MenuList>
            </Menu>
        </Stack>
    );
};

export default AddAlgorithmButton;