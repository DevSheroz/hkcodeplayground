import React from "react";
import { Stack, Menu, MenuButton, MenuList, MenuItem, Button, Icon, chakra } from "@chakra-ui/react";
import { BsPlusCircle } from "react-icons/bs";

const BoldMenuItem = chakra(MenuItem, {
    baseStyle: {
        fontWeight: "semibold",
    },
});

const AddAlgorithmButton = ({ onClick }) => {
    
    // Operational code goes here. Run Algorithm
    // const handleMenuItemClick = function(algorithm) {
    //     console.log(algorithm);
    //     if (onClick) {
    //         onClick(algorithm);
    //     }
    // };

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
                    Add Algorithm
                </MenuButton>
                <MenuList>
                    <BoldMenuItem onClick={() => console.log("DSN")}>DSN</BoldMenuItem>
                    <BoldMenuItem onClick={() => console.log("ERR")}>ERR</BoldMenuItem>
                    <BoldMenuItem onClick={() => console.log("FUEL")}>FUEL</BoldMenuItem>
                </MenuList>
            </Menu>
        </Stack>
    );
};

export default AddAlgorithmButton;
