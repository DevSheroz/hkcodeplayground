import React, { useState, useEffect, useRef } from "react";
import {
    VStack,
    Text,
    Stack,
    Button,
    Progress,
    Spinner,
    Alert,
    AlertIcon,
} from "@chakra-ui/react";
import { BiUpload } from 'react-icons/bi';
import { RangeDatepicker } from "chakra-dayzed-datepicker";
import Select from "./ClientSelectData";
import axios from "axios";
import TableViewer from "./TableViewer"; // Import TableViewer component

const DataInput = () => {
    const [selectedDates, setSelectedDates] = useState([new Date(), new Date()]);
    const [selectedReqNo, setSelectedReqNo] = useState(null);
    const [selectedItemNo, setSelectedItemNo] = useState(null);
    const [reqNoOptions, setReqNoOptions] = useState([]);
    const [itemNoOptions, setItemNoOptions] = useState([]);
    const menuPortalTargetRef = useRef(null);
    const [loadingData, setLoadingData] = useState(false);
    const [progress, setProgress] = useState(0);

    const [limitedData, setLimitedData] = useState(null);  
    const [fullData, setFullData] = useState(null);
    const [loadingFullData, setLoadingFullData] = useState(false); // State for loading full data
    
    const [renderPage, setRenderPage] = useState(false);
    const [error, setError] = useState(null); // State for error handling

    const websocketRef = useRef(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            menuPortalTargetRef.current = document.body;
        }
        fetchReqNoOptions();

        // Initialize WebSocket
        websocketRef.current = new WebSocket("ws://localhost:8001/ws");

        websocketRef.current.onopen = () => {
            console.log("WebSocket connected");
        };

        websocketRef.current.onclose = () => {
            console.log("WebSocket closed");
        };

        websocketRef.current.onerror = (error) => {
            console.error("WebSocket error:", error);
            setError("WebSocket connection error. Please try again later.");
        };

        websocketRef.current.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.full_data) {
                setFullData(message.full_data);
                setLoadingFullData(false);
                setProgress(100);
            }
        };

        return () => {
            if (websocketRef.current.readyState === WebSocket.OPEN) {
                websocketRef.current.close();
            }
        };
    }, []);

    const fetchReqNoOptions = async () => {
        try {
            const response = await axios.get("http://localhost:8000/req_no");
            if (response.status === 200) {
                const options = response.data.req_numbers.map(reqNo => ({
                    value: reqNo,
                    label: reqNo,
                }));
                setReqNoOptions(options);
            } else {
                console.error("Failed to fetch REQ_NO options:", response.statusText);
            }
        } catch (error) {
            console.error("Error fetching REQ_NO options:", error);
            setError("Failed to fetch REQ_NO options. Please check selected dates.");
        } finally {
            setRenderPage(true); // Mark rendering as ready after fetching
        }
    };

    const handleReqNoChange = async (selectedOption) => {
        setSelectedReqNo(selectedOption);
        setSelectedItemNo(null);

        if (selectedOption) {
            try {
                const response = await axios.get(`http://localhost:8000/test_no?req_no=${selectedOption.value}`);

                if (response.status === 200) {
                    const data = response.data;

                    if (data && data.test_numbers && Array.isArray(data.test_numbers)) {
                        let vNumber = 1;
                        const options = data.test_numbers.map((testNo, index) => {
                            const valueWithV = `${testNo} V${vNumber}`;
                            if ((index + 1) % 4 === 0) {
                                vNumber++;
                            }
                            return {
                                value: valueWithV,
                                label: valueWithV,
                            };
                        });
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
                setError("Failed to fetch ITEM_NO options. Please try again later.");
            }
        } else {
            setItemNoOptions([]);
        }
    };

    const handleLoadData = async () => {
        setLoadingData(true);
        setProgress(20);  
        setError(null) // setError message to null if data is loading

        try {
            const startDate = selectedDates[0].toISOString().split("T")[0];
            const endDate = selectedDates[1].toISOString().split("T")[0];
            
            const response = await axios.post("http://localhost:8001/load_data", null, {
                params: {
                    item_no: selectedItemNo.value,
                    start_date: startDate,
                    end_date: endDate,
                },
                withCredentials: true,
            });

            if (response.status === 200) {
                setLoadingFullData(true);

                setProgress(50);
                setLimitedData(response.data.limited_data);
                // console.log(response.data);

                // Check WebSocket state before sending a message
                if (websocketRef.current.readyState === WebSocket.OPEN) {
                    websocketRef.current.send(JSON.stringify({
                        item_no: selectedItemNo.value,
                        start_date: startDate,
                        end_date: endDate,
                    }));
                } else {
                    console.error("WebSocket is not open. Ready state:", websocketRef.current.readyState);
                    setError("WebSocket connection is not open. Please try again later.");
                }
            } else {
                console.error("Failed to load data:", response.statusText);
                setProgress(0);
                setError("Failed to load data. Please try again later.");
            }
        } catch (error) {
            console.error("Error loading data:", error);
            setProgress(0);
            setError("Error loading data. Please check selected dates.");
        } finally {
            setLoadingData(false);
        }
    };

    if (!renderPage) {
        return (
            <VStack width="95%" margin="10px auto" align="center">
                <Spinner size="xl" color="blue.500" />
            </VStack>
        );
    }

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
                <Stack flex="30%" margin="5px">
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
                <Stack flex="30%" margin="5px">
                    <Text mb="8px" fontFamily="Inter" fontWeight="semibold">
                        Test No:
                    </Text>
                    <Select
                        value={selectedItemNo}
                        onChange={setSelectedItemNo}
                        options={itemNoOptions}
                        placeholder="Select Test No"
                        menuPortalTarget={menuPortalTargetRef.current}
                        menuPosition="fixed"
                        styles={{ 
                            menuPortal: base => ({ ...base, zIndex: 9999 })
                        }}
                    />
                </Stack>
                <Stack flex="20%" margin="5px">
                    <Text mb="8px" fontFamily="Inter" fontWeight="semibold">
                        Date Range:
                    </Text>
                    <RangeDatepicker
                        selectedDates={selectedDates}
                        onDateChange={setSelectedDates}
                        configs={{
                            dateFormat: 'yyyy.MM.dd',
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
                            },
                        }}
                    />
                </Stack>
                <Stack flex="20%" justify="flex-end" marginBottom="5px">
                    <Button
                        leftIcon={<BiUpload />}
                        isLoading={loadingData || loadingFullData}
                        loadingText="Loading..."
                        onClick={handleLoadData}
                        colorScheme="blue"
                        size="md"
                    >
                        Load
                    </Button>
                </Stack>
            </Stack>
            <Stack width="100%">
                {progress < 100 && (
                    <Progress hasStripe value={progress} size="sm" colorScheme="blue" mt="4" />
                )}
                {progress === 100 && (
                    <Text mt="4" fontWeight="semibold" color="green.500" align="center">
                        Full Load Completed!
                    </Text>
                )}
                {error && (
                    <Alert status="error" mt="4">
                        <AlertIcon />
                        {error}
                    </Alert>
                )}
            </Stack>
            {limitedData && (
                <TableViewer limitedData={limitedData} fullData={fullData} />
            )}
        </VStack>
    );
};

export default DataInput;
