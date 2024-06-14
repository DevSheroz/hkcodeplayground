import React from 'react';
import { Stack, Avatar, AvatarBadge, Text } from '@chakra-ui/react';

const TopBar = () => (
    <Stack
        width="95%"
        margin="10px auto"
        paddingX="25px"
        paddingY="20px"
        borderRadius="4px"
        direction="row"
        justifyContent="space-between"
        align="center"
        spacing="12px"
        overflow="hidden"
        borderColor="#E0E0E0"
        borderWidth="1px"
        
    >
        <Stack direction="row" justify="flex-start" align="flex-start" spacing="12px">
            <Avatar name="S" src="" size="xs" width="39px" height="39px" background="#A0AEC0">
                <AvatarBadge boxSize="1.25em" background="green.500" />
            </Avatar>
            <Stack justify="flex-start" align="flex-start" spacing="0px" overflow="hidden" height="39px">
                <Text fontFamily="Inter" fontWeight="semibold" fontSize="15px" color="#000000" width="87px" height="21px">
                    홍일동
                </Text>
                <Text
                    fontFamily="Inter"
                    fontWeight="medium"
                    fontSize="15px"
                    textDecoration="underline"
                    color="#718096"
                    width="100%"
                    height="100%"
                >
                    hong@hankookn.com
                </Text>
            </Stack>
        </Stack>
        <Stack justify="flex-end" alignItems="center">
            <img
                src="/img/logo.png"
                alt="Logo description"
                width="130px"
                height="55px"
            />
        </Stack>
    </Stack>
);

export default TopBar;
