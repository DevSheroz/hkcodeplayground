import React, { useState, useEffect, useRef } from "react";
import {
    Stack,
    Avatar,
    AvatarBadge,
    Text,
    VStack,
    Button,
    Progress,
    Alert,
    AlertIcon,
} from "@chakra-ui/react";
import { BiUpload } from 'react-icons/bi';
import { RangeDatepicker } from "chakra-dayzed-datepicker";
import Select from "./ClientSelectData";
import axios from "axios";
import TableViewer from "./TableViewer"; 
import AnimatedBars from "./animatedBars";


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
        boxShadow={"0px 0px 5px rgba(0, 0, 0, 0.1)"}
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

const DataInput = ({ menuPortalTargetRef }) => {
    const [selectedDates, setSelectedDates] = useState([new Date(), new Date()]);
    const [minDate, setMinDate] = useState(null);
    const [maxDate, setMaxDate] = useState(null);
    const [selectedReqNo, setSelectedReqNo] = useState(null);
    const [selectedItemNo, setSelectedItemNo] = useState(null);
    const [reqNoOptions, setReqNoOptions] = useState([]);
    const [itemNoOptions, setItemNoOptions] = useState([]);
    const [loadingData, setLoadingData] = useState(false);
    const [isIndeterminate, setIsIndeterminate] = useState(false);
    const [limitedData, setLimitedData] = useState(null);
    const [cacheKey, setCacheKey] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            menuPortalTargetRef.current = document.body;
        }
        fetchReqNoOptions();
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
            setError("Failed to fetch REQ_NO options. Please check your network connection.");
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

    useEffect(() => {
        if (selectedReqNo && selectedItemNo) {
            initDateRange(selectedReqNo, selectedItemNo);
        }
    }, [selectedReqNo, selectedItemNo]);

    // 대한민국 timeZone offset 적용
    const toKSTISOString = (date) => {
        const kstOffset = 9 * 60 * 60 * 1000; // South Korea is UTC+9
        const kstDate = new Date(date.getTime() + kstOffset);
        const kstISOString = kstDate.toISOString().replace('Z', '+09:00');
        return kstISOString;
    };

    // get start and end timestamp for selected Test No (aka vehicle)
    const initDateRange = async (selectedReqNo, selectedItemNo) => {
        if (selectedItemNo && selectedItemNo) {
            try {
                const dateRange = await axios.get(`http://localhost:8001/first_last_time?req_no=${selectedReqNo.value}&veh_no=${selectedItemNo.value}`);
                
                if (dateRange.status === 200) {
                    
                    // timestamp retrieve, convert to ISO string, then split to get date only
                    const firstDate = toKSTISOString(new Date(dateRange.data.start_timestamp)).split('T')[0];
                    const lastDate = toKSTISOString(new Date(dateRange.data.end_timestamp)).split('T')[0];

                    // Update selectedDates, minDate, and maxDate state
                    const startDate = new Date(firstDate);
                    const endDate = new Date(lastDate);

                    // Subtract one day from startDate to make it clickable
                    const minDate = new Date(startDate);
                    minDate.setDate(startDate.getDate() - 1);

                    setSelectedDates([startDate, endDate]);
                    setMinDate(minDate);
                    setMaxDate(endDate);
                    setError(null); // error message reset
                    setLimitedData(null); // reset table rendering
                    setCacheKey(null); // reset previous
                    
                } else {
                    console.error("Failed to fetch date range:", dateRange.statusText);
                    setError("Driving data either does not exist or failed to retrieve.");
                }
            } catch (error) {
                console.error('Error fetching date range:', error);
                setError("Error fetching date range.");
            }
        }
    };

    const handleLoadData = async () => {
        setLoadingData(true);
        setIsIndeterminate(true);
        setError(null);
        setLimitedData(null);

        const startDate = toKSTISOString(selectedDates[0]);
        const endDate = toKSTISOString(selectedDates[1]);

        try {
            const limitedResponse = await axios.post("http://localhost:8001/load_data", null, {
                params: {
                    req_no: selectedReqNo.value,
                    item_no: selectedItemNo.value,
                    start_date: startDate,
                    end_date: endDate,
                },
                withCredentials: true,
            });

            if (limitedResponse.status === 200 && limitedResponse.data.limited_data.length > 0) {
                setLimitedData(limitedResponse.data.limited_data);
            } else {
                setError('Error: Data not found for selected dates or this request number.');
                setLoadingData(false);
                setIsIndeterminate(false);
                return;
            }


            if (limitedResponse.status === 200 && limitedResponse.data.limited_data.length > 0) {
                setLimitedData(limitedResponse.data.limited_data);
            } else {
                setError('Error: Data not found for selected dates or this request number.');
                setLoadingData(false);
                setIsIndeterminate(false);
                return;
            }

            const fullData = await axios.post(
                "http://localhost:8001/full_data",
                {
                    req_no: selectedReqNo.value,
                    item_no: selectedItemNo.value,
                    start_date: startDate,
                    end_date: endDate,
                },
                {
                    withCredentials: true,
                }
            );

            if (fullData.status === 200) {
                setCacheKey(fullData.data.cachekey);
            }
        } catch (error) {
            setError("Please check Request or Item number and try again");
            setIsIndeterminate(false);
        } finally {
            setLoadingData(false);
            setIsIndeterminate(false);
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
            boxShadow="0px 0px 5px rgba(0, 0, 0, 0.1)"
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
                        Request No:
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
                        minDate={minDate}
                        maxDate={maxDate}
                        configs={{
                            dateFormat: 'yyyy.MM.dd',
                        }}
                        propsConfigs={{
                            dayOfMonthBtnProps: {
                                defaultBtnProps: {
                                    fontWeight: "regular",
                                    _hover: {
                                        background: "blue.400",
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
                                    background: "teal.400",
                                },
                            },
                        }}
                    />
                </Stack>
                <Stack flex="20%" justify="flex-end" marginBottom="5px">
                    <Button
                        leftIcon={<BiUpload />}
                        isLoading={loadingData}
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
                {loadingData && (
                    <Progress isIndeterminate={isIndeterminate} size="sm" colorScheme="blue" mt="4" />
                )}
                {!loadingData && cacheKey && !error && (
                    <Text mt="4" fontWeight="bold" color="black" align="center" ml="5px">
                        전체 데이터 조회 완료!
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
                <TableViewer limitedData={limitedData} cacheKey={cacheKey} />
            )}
        </VStack>
    );
};

const App = () => {
    const [renderPage, setRenderPage] = useState(false);
    const menuPortalTargetRef = useRef(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            menuPortalTargetRef.current = document.body;
            setRenderPage(true);
        }
    }, []);

    if (!renderPage) {
        return (
            <VStack
                width="95%"
                height="100vh"
                margin="10px auto"
                align="center"
                justify="center"
            >
                <AnimatedBars />
                {/* <Spinner size="xl" color="blue.500" /> */}
            </VStack>
        );
    }

    return (
        <div>
            <TopBar />
            <DataInput menuPortalTargetRef={menuPortalTargetRef} />
        </div>
    );
};

export default App;
