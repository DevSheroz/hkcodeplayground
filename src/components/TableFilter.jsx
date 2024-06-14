import React, { useState } from 'react';
import { Checkbox, Stack, Button, Icon, Text, Input, Box } from '@chakra-ui/react';
import { MdClear, MdArrowForwardIos } from 'react-icons/md';

const NumberFilter = ({ toggleNumberFilter, setSelectedFilter }) => {
    const boxStyle = {
        width: "150px",
        cursor: "pointer",
        _hover: { bg: "gray.100" },
        _active: { bg: "gray.200" },
        textAlign: "left",
        padding: "5px",
        fontSize: "10px",
        fontWeight: "semibold"
    };

    const handleOptionClick = (filter) => {
        setSelectedFilter(filter);
        toggleNumberFilter();
    };

    const handleApply = () => {
        toggleNumberFilter();
    };

    return (
        <Box
            display="flex"
            flexDirection="column"
            width="auto"
            height="auto"
            background="#FFFFFF"
            boxShadow="0px 0px 10px 0px rgba(0, 0, 0, 0.25)"
            padding="10px"
            marginTop="20px"
        >
            <Box onClick={() => handleOptionClick("=")} sx={boxStyle}>
                <Text>Equal</Text>
            </Box>
            <Box onClick={() => handleOptionClick("!=")} sx={boxStyle} borderBottom="0.5px solid #CBD5E0">
                <Text>Not Equal</Text>
            </Box>
            <Box onClick={() => handleOptionClick(">")} sx={boxStyle}>
                <Text>Greater than</Text>
            </Box>
            <Box onClick={() => handleOptionClick(">=")} sx={boxStyle} borderBottom="0.5px solid #CBD5E0">
                <Text>Greater than or Equal to</Text>
            </Box>
            <Box onClick={() => handleOptionClick("<")} sx={boxStyle}>
                <Text>Less than</Text>
            </Box>
            <Box onClick={() => handleOptionClick("<=")} sx={boxStyle} borderBottom="0.5px solid #CBD5E0">
                <Text>Less than or Equal to</Text>
            </Box>
            <Box onClick={() => handleOptionClick("!= None")} sx={boxStyle}>
                <Text>Not None</Text>
            </Box>
            <Button 
                width="80%"
                height="20px"
                colorScheme="blue" 
                alignSelf="center"
                margin={"10px 0"}
                fontSize="12px"
                borderRadius="3px"
                onClick={handleApply}
            >
                Apply
            </Button>
        </Box>
    );
};

const TableFilter = ({ isVisible, position, onClose, header }) => {
    const [showNumberFilter, setShowNumberFilter] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState(null);
    const [inputValue, setInputValue] = useState("");
    const [checkboxes, setCheckboxes] = useState({
        iqr: false,
        movingAvg: false,
        gaussian: false,
    });

    // number filter handling (toggle to show/hide number filter)
    const toggleNumberFilter = () => {
        setShowNumberFilter(prevState => !prevState);
    };

    // input value handling
    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    // checkbox handling
    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setCheckboxes(prevState => ({
            ...prevState,
            [name]: checked,
        }));
    };

    // clear button handling
    const handleClear = () => {
        setSelectedFilter(null);
        setInputValue("");
        setCheckboxes({
            iqr: false,
            movingAvg: false,
            gaussian: false,
        });
    };

    // apply button handling
    const handleApply = () => {
        const filterValues = {
            selectedFilter,
            inputValue,
            checkboxes,
            header,
        };
        console.log(filterValues);
        onClose();
    };

    return isVisible ? (
        <Stack 
            position="absolute" 
            top={position.top} 
            left={position.left} 
            zIndex="1000" 
            background="white">
            <Stack
                width="150px"
                height="auto"
                background="#FFFFFF"
                boxShadow="0px 0px 10px 0px rgba(0, 0, 0, 0.25)"
                spacing="0"
            >
                <Button
                    leftIcon={<Icon as={MdClear} />}
                    size="md"
                    color="gray.500"
                    borderRadius="0px"
                    variant="ghost"
                    fontSize="12px"
                    height="auto"
                    display="flex"
                    justifyContent="flex-start"
                    alignItems="center"
                    padding="5px 15px"
                    marginTop="10px"
                    onClick={handleClear}
                >
                    Clear
                </Button>
                <Button
                    rightIcon={<Icon as={MdArrowForwardIos} />}
                    size="md"
                    color="gray.800"
                    borderRadius="0px"
                    variant="ghost"
                    fontSize="12px"
                    height="auto"
                    display="flex"
                    justifyContent="flex-end"
                    alignItems="center"
                    padding="5px 15px"
                    margin="0"
                    onClick={toggleNumberFilter}
                >
                    Number filter
                </Button>
                <Stack
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    width="100%"
                    flexDirection="row"
                >
                    {selectedFilter && <Text fontSize="10px" mr="2">{selectedFilter}</Text>}
                    <Input
                        size="md"
                        color="gray.800"
                        borderRadius="0px"
                        variant="ghost"
                        fontSize="12px"
                        height="auto"
                        width="50%"
                        borderBottom="1px solid gray"
                        placeholder='번호'
                        padding="0"
                        type='number'
                        value={inputValue}
                        onChange={handleInputChange}
                    />
                </Stack>
                <Stack
                    width="100%"
                    height="auto"
                    borderColor="gray.300"
                    borderBottomWidth="0.5px"
                    marginTop="10px"
                >
                    <Text fontSize="10px" fontWeight="semibold" color="gray.500" ml="10px">Advanced</Text>
                </Stack>
                <Stack padding="5px 15px" spacing="1">
                    <Checkbox 
                        colorScheme="blue" 
                        name="iqr" 
                        isChecked={checkboxes.iqr} 
                        onChange={handleCheckboxChange}
                    >
                        <Text fontSize="12px">IQR</Text>
                    </Checkbox>
                    <Checkbox 
                        colorScheme="blue" 
                        name="movingAvg" 
                        isChecked={checkboxes.movingAvg} 
                        onChange={handleCheckboxChange}
                    >
                        <Text fontSize="12px">Moving Avg</Text>
                    </Checkbox>
                    <Checkbox 
                        colorScheme="blue" 
                        name="gaussian" 
                        isChecked={checkboxes.gaussian} 
                        onChange={handleCheckboxChange}
                    >
                        <Text fontSize="12px">Gaussian</Text>
                    </Checkbox>
                </Stack>
                <Button 
                    width="80%"
                    height="20px"
                    colorScheme="blue" 
                    alignSelf="center"
                    margin={"10px 0"}
                    fontSize="12px"
                    borderRadius="3px"
                    onClick={handleApply}
                >
                    Apply
                </Button>
            </Stack>
            {showNumberFilter && (
                <Stack
                    position="absolute"
                    left="150px"
                    top="0"
                >
                    <NumberFilter 
                        toggleNumberFilter={toggleNumberFilter} 
                        setSelectedFilter={setSelectedFilter} 
                        onApply={handleApply}
                    />
                </Stack>
            )}
        </Stack>
    ) : null;
};

export default TableFilter;