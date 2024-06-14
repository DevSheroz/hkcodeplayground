'use client'

import React, { useState, useEffect, useRef } from "react";
import { Stack, VStack, Text, HStack, Button, Progress } from "@chakra-ui/react";
import { BiUpload } from 'react-icons/bi';
import { RangeDatepicker } from "chakra-dayzed-datepicker";

import Select from "./ClientSelectData"

const DataInput = () => {
    const [selectedDates, setSelectedDates] = useState([new Date(), new Date()]);
    const [selectedReqNo, setSelectedReqNo] = useState(null);
    const [selectedItemNo, setSelectedItemNo] = useState(null); 
    const [itemNoOptions, setItemNoOptions] = useState([]);
    const menuPortalTargetRef = useRef(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            menuPortalTargetRef.current = document.body;
        }
    }, []);

    const handleReqNoChange = (selectedOption) => {
        setSelectedReqNo(selectedOption);
        setSelectedItemNo(null);

        if (selectedOption) {
            setItemNoOptions(reqToItemMap[selectedOption.value] || []);
        } else {
            setItemNoOptions([]);
        }
    };

    const handleItemNoChange = (selectedOption) => {
        setSelectedItemNo(selectedOption);
    };

    const reqNoOptions = [
        { value: 'req1', label: 'REQ 1' },
        { value: 'req2', label: 'REQ 2' },
        { value: 'req3', label: 'REQ 3' },
        { value: 'req4', label: 'REQ 4' },
        { value: 'req5', label: 'REQ 5' },
        { value: 'req6', label: 'REQ 6' },
    ];

    const reqToItemMap = {
        req1: [
            { value: 'item1', label: 'ITEM 1-1' },
            { value: 'item2', label: 'ITEM 1-2' },
        ],
        req2: [
            { value: 'item3', label: 'ITEM 2-1' },
            { value: 'item4', label: 'ITEM 2-2' },
        ],
        req3: [
            { value: 'item5', label: 'ITEM 3-1' },
            { value: 'item6', label: 'ITEM 3-2' },
        ],
    };

    return (
        <VStack
            width="95%"
            margin="10px auto"
            paddingX="25px"
            paddingY="20px"
            borderRadius="4px"
            justifyContent="space-between"
            align="center"
            spacing="12px"
            overflow="hidden"
            borderColor="#E0E0E0"
            borderWidth="1px"
        >
            <Stack width="100%">
                <Text fontFamily="Inter" fontWeight="bold" fontSize="20px" color="#000000" width="100%">
                    Driving data
                </Text>
                <svg width="100%" height="1">
                    <line x1="0" y1="0" x2="100%" y2="0" style={{ stroke: '#A0AEC0', strokeWidth: 1 }} />
                </svg>
            </Stack>
            <Stack className="classDataInput" width="100%" height="auto" direction="row">
                <Stack
                    flex="20%"
                    margin="5px"
                >
                    <Text mb="8px" fontFamily="Inter" fontWeight="semibold">
                        REQ No:
                    </Text>
                    <Select
                        value={selectedReqNo}
                        onChange={handleReqNoChange}
                        options={reqNoOptions}
                        placeholder="시험 의뢰번호를 입력해주세요."
                        menuPortalTarget={menuPortalTargetRef.current} // render drop down to body ("선택 독립성")
                        menuPosition="fixed"
                        styles={{ 
                            menuPortal: base => ({ ...base, zIndex: 9999 }) // above other elements
                        }}
                    />
                </Stack>
                <Stack
                    flex="20%"
                    margin="5px"
                >
                    <Text mb="8px" fontFamily="Inter" fontWeight="semibold">
                        ITEM No:
                    </Text>
                    <Select
                        value={selectedItemNo}
                        onChange={handleItemNoChange}
                        options={itemNoOptions}
                        placeholder="시험 항목을 선택하세요"
                        isDisabled={!selectedReqNo}
                        menuPortalTarget={menuPortalTargetRef.current} // drop down 독립 랜더링
                        menuPosition="fixed"
                        styles={{ 
                            menuPortal: base => ({ ...base, zIndex: 9999 })
                        }}
                    />
                </Stack>
                <Stack
                    flex="20%"
                    width="100%"
                    className="datePicker"
                    margin="5px"
                >
                    <Text mb="8px" fontFamily="Inter" fontWeight="semibold">
                        Date Range:
                    </Text>
                    <RangeDatepicker
                        triggerVariant="input"
                        selectedDates={selectedDates}
                        onDateChange={setSelectedDates}
                        configs={{
                            dateFormat: 'yyyy-MM-dd',
                        }}
                        propsConfigs={{
                            dayOfMonthBtnProps: {
                                defaultBtnProps: {
                                    fontWeight: "regular",
                                    _hover: {
                                        background: 'blue.400',
                                    },
                                },
                                isInRangeBtnProps: {
                                    background: "#E4E4E4",
                                    color: "black",
                                },
                                selectedBtnProps: {
                                    background: "blue.200",
                                },
                                todayBtnProps: {
                                    fontWeight: "bold",
                                },
                            },
                            dateHeadingProps: {
                                fontWeight: 'semibold',
                            },
                            inputProps: {
                                fontWeight: "regular",
                                width:"100%",
                            }
                        }}
                    />
                </Stack>
                <HStack
                    flex="40%"
                    flexDirection="row"
                    spacing={5}
                    alignItems="flex-start"
                >
                    <Button
                        rightIcon={<BiUpload />}
                        size="sm"
                        variant="solid"
                        colorScheme="blue"
                        width="100px"
                        height="30px"
                        marginTop="50px"
                    >
                        Load
                    </Button>
                    <Progress 
                        hasStripe 
                        value={64} 
                        width="60%" 
                        marginTop="60px"
                    />
                </HStack>
            </Stack>
        </VStack>
    );
};

export default DataInput;
