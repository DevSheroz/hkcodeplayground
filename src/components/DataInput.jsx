import React, { useState, useEffect, useRef } from "react";
import { VStack, Text, Stack, Button, Progress } from "@chakra-ui/react";
import { BiUpload } from 'react-icons/bi';
import { RangeDatepicker } from "chakra-dayzed-datepicker";
import Select from "./ClientSelectData";

const DataInput = () => {
    const [selectedDates, setSelectedDates] = useState([new Date(), new Date()]);
    const [selectedReqNo, setSelectedReqNo] = useState(null);
    const [selectedItemNo, setSelectedItemNo] = useState(null); 
    const [reqNoOptions, setReqNoOptions] = useState([]);
    const [itemNoOptions, setItemNoOptions] = useState([]);
    const menuPortalTargetRef = useRef(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            menuPortalTargetRef.current = document.body;
        }
        fetchReqNoOptions();  // Fetch REQ No options when component mounts
    }, []);

    const fetchReqNoOptions = async () => {
        try {
            const response = await fetch("http://localhost:8000/req_no");
            if (response.ok) {
                const data = await response.json();
                const options = data.req_numbers.map(reqNo => ({
                    value: reqNo,
                    label: reqNo,
                }));
                setReqNoOptions(options);
            } else {
                console.error("Failed to fetch REQ_NO options:", response.statusText);
            }
        } catch (error) {
            console.error("Error fetching REQ_NO options:", error);
        }
    };

    const handleReqNoChange = async (selectedOption) => {
        setSelectedReqNo(selectedOption);
        setSelectedItemNo(null);
    
        if (selectedOption) {
            try {
                const response = await fetch(`http://localhost:8000/test_no?req_no=${selectedOption.value}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data && data.test_numbers && Array.isArray(data.test_numbers)) {
                        const options = data.test_numbers.map(testNo => ({
                            value: testNo,
                            label: testNo,
                        }));
                        setItemNoOptions(options);
                    } else {
                        console.error("Invalid data structure received:", data);
                        setItemNoOptions([]);
                    }
                } else {
                    console.error("Failed to fetch ITEM_NO options:", response.statusText);
                    setItemNoOptions([]);
                }
            } catch (error) {
                console.error("Error fetching ITEM_NO options:", error);
                setItemNoOptions([]);
            }
        } else {
            setItemNoOptions([]);
        }
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
                        placeholder="Select REQ No"
                        menuPortalTarget={menuPortalTargetRef.current}
                        menuPosition="fixed"
                        styles={{ 
                            menuPortal: base => ({ ...base, zIndex: 9999 })
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
                        onChange={(selectedOption) => setSelectedItemNo(selectedOption)}
                        options={itemNoOptions}
                        placeholder="Select ITEM No"
                        isDisabled={!selectedReqNo}
                        menuPortalTarget={menuPortalTargetRef.current}
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
                <Stack
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
                </Stack>
            </Stack>
        </VStack>
    );
};

export default DataInput;
