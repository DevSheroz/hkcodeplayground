import React, { useState } from "react";
import { Stack, Menu, MenuButton, MenuList, MenuItem, Button, Icon, chakra, Spinner } from "@chakra-ui/react";
import { BsPlusCircle } from "react-icons/bs";
import Axios from "axios";

const BoldMenuItem = chakra(MenuItem, {
    baseStyle: {
        fontWeight: "semibold",
    },
});

const AddAlgorithmButton = ({ onClick, fullData }) => {
    const [isRunning, setIsRunning] = useState(false);

    const handleDSNClick = async () => {
        try {
            setIsRunning(true); 

            const AxValues = fullData.map(item => item.x);
            const AyValues = fullData.map(item => item.z);

            const dataToSend = {
                Ax: AxValues,
                Ay: AyValues,
                sample_rate: 10 
            };


            const response = await Axios.post(
                "https://uk2lx44ubj.execute-api.ap-northeast-2.amazonaws.com/dev/dsn",
                dataToSend
            );

            console.log("API response:", response.data);

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
            console.log(`Selected algorithm: ${algorithm}`);
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
                    leftIcon={<Icon as={BsPlusCircle} boxSize={6} />}
                >
                    {isRunning ? (
                        <>
                            <Spinner size="sm" color="blue.500" marginRight="2" />
                            Running...
                        </>
                    ) : (
                        <>Add Algorithm</>
                    )}
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
