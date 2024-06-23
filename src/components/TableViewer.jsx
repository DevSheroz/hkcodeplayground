import React, { useState, useEffect } from "react";
import { VStack, Text, Button, Icon, Stack } from "@chakra-ui/react";
import { IoFilter } from "react-icons/io5";
import TableFilter from "./TableFilter";
import AddAlgorithmButton from "./addAlgo"; // Assuming correct import
import "../app/styles/tablestyles.css";

const TableViewer = ({ limitedData }) => {
    const [data, setData] = useState([]);
    const [headers, setHeaders] = useState([]);
    const [selectedHeaders, setSelectedHeaders] = useState({});
    const [scrollBarSize, setScrollBarSize] = useState(0);
    const [showFilter, setShowFilter] = useState(false);
    const [filterPosition, setFilterPosition] = useState({ top: 0, left: 0 });
    const [showFilterHeader, setShowFilterHeader] = useState(null);

    useEffect(() => {
        if (limitedData) {
            const headers = Object.keys(limitedData);
            setHeaders(headers);

            const dataArray = [];
            for (let i = 0; i < 5; i++) {
                const row = {};
                headers.forEach(header => {
                    row[header] = limitedData[header][i] !== undefined ? limitedData[header][i] : ''; // Handle undefined values
                });
                dataArray.push(row);
            }

            setData(dataArray);

            const initialSelectedHeaders = {};
            headers.forEach(header => {
                initialSelectedHeaders[header] = false;
            });
            setSelectedHeaders(initialSelectedHeaders);

            const width = scrollbarWidth();
            setScrollBarSize(width);
        }
    }, [limitedData]);

    const scrollbarWidth = () => {
        const scrollDiv = document.createElement("div");
        scrollDiv.setAttribute(
            "style",
            "width: 100px; height: 100px; overflow: scroll; position:absolute; top:-9999px;"
        );
        document.body.appendChild(scrollDiv);
        const scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
        document.body.removeChild(scrollDiv);
        return scrollbarWidth;
    };

    const toggleHeaderSelection = (header) => {
        setSelectedHeaders(prevSelectedHeaders => ({
            ...prevSelectedHeaders,
            [header]: !prevSelectedHeaders[header],
        }));
        console.log(header)
    };

    const toggleFilter = (header, e) => {
        e.stopPropagation();
        const rect = e.target.getBoundingClientRect();
        setFilterPosition({ top: rect.bottom, left: rect.left });
        setShowFilter(true);
        setShowFilterHeader(header);
    };

    return (
        <VStack
            width="100%"
            margin="0px auto"
            paddingX="25px"
            paddingY="20px"
            borderRadius="4px"
            justifyContent="space-between"
            align="center"
            spacing="12px"
            overflow="hidden"
        >
            <Stack width="100%" align="center">
                <Text fontFamily="Inter" fontWeight="bold" fontSize="20px" color="#000000" width="100%">
                    Visualize
                </Text>
                <svg width="100%" height="1">
                    <line x1="0" y1="0" x2="100%" y2="0" style={{ stroke: '#A0AEC0', strokeWidth: 1 }} />
                </svg>
            </Stack>
            <div className="styles" data-scrollbar-width={scrollBarSize}>
                <AddAlgorithmButton onClick={(e) => {
                    e.preventDefault();
                    console.log("Add Algorithm");
                }} />
                <div className="tableContainer">
                    <div className="tableWrap">
                        <table>
                            <thead>
                                <tr>
                                    {headers.map((header, index) => (
                                        <th
                                            key={index}
                                            onClick={() => toggleHeaderSelection(header)}
                                            className={selectedHeaders[header] ? "selectedHeader" : ""}
                                        >
                                            <span>{header}</span>
                                            <Button
                                                size="sm"
                                                variant="unstyled"
                                                ml="15px"
                                                onClick={(e) => toggleFilter(header, e)}
                                            >
                                                <Icon
                                                    as={IoFilter}
                                                    boxSize={6}
                                                    color="gray.500"
                                                    _hover={{ color: "gray.600" }}
                                                    _active={{ color: "gray.900" }}
                                                />
                                            </Button>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((item, index) => (
                                    <tr key={index} className={index % 2 === 0 ? "even" : "odd"}>
                                        {headers.map((header) => (
                                            <td key={header}>{item[header]}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="vizButtonsContainer">
                    <Button
                        size="sm"
                        variant="solid"
                        bg="blue.500"
                        color="white"
                        _hover={{ bg: "blue.600" }}
                        _active={{ bg: "blue.700" }}
                        width="100px"
                        marginLeft="10px"
                    >
                        Trend
                    </Button>
                    <Button
                        size="sm"
                        variant="solid"
                        bg="red.400"
                        color="white"
                        _hover={{ bg: "red.500" }}
                        _active={{ bg: "red.600" }}
                        width="100px"
                        marginLeft="10px"
                    >
                        Bar
                    </Button>
                </div>
                <TableFilter
                    isVisible={showFilter}
                    position={filterPosition}
                    onClose={() => setShowFilter(false)}
                    header={showFilterHeader}
                />
            </div>
        </VStack>
    );
};

export default TableViewer;
