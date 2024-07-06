import React, { useState, useEffect } from "react";
import { VStack, Text, Stack, Button, Icon, Alert, AlertIcon } from "@chakra-ui/react";
import { IoFilter } from "react-icons/io5";
import { motion } from 'framer-motion';

import TableFilter from "./TableFilter";
import AddAlgorithmButton from "./addAlgo";
import PlotViewer from "./plotDynamic";
import ChatPrompt from "./askAI";
import "../app/styles/tablestyles.css";

const TableViewer = ({ limitedData, cacheKey }) => {
    const [data, setData] = useState([]);
    const [headers, setHeaders] = useState([]);
    const [selectedHeaders, setSelectedHeaders] = useState({});
    const [scrollBarSize, setScrollBarSize] = useState(0);
    const [showFilter, setShowFilter] = useState(false);
    const [filterPosition, setFilterPosition] = useState({ top: 0, left: 0 });
    const [showFilterHeader, setShowFilterHeader] = useState(null);
    const [filteredData, setFilteredData] = useState(limitedData);
    const [selectedColumns, setSelectedColumns] = useState([]);
    const [showAlert, setShowAlert] = useState(false);
    const [clearPlot, setClearPlot] = useState(false);
    const [aiAsked, setAiAsked] = useState(false);

    useEffect(() => {
        if (filteredData.length > 0) {
            const headers = Object.keys(filteredData[0]);
            setHeaders(headers);
            setData(filteredData);

            const initialSelectedHeaders = {};
            headers.forEach(header => {
                initialSelectedHeaders[header] = false;
            });
            setSelectedHeaders(initialSelectedHeaders);
            setScrollBarSize(scrollbarWidth());
        }
    }, [filteredData]);

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
        setSelectedHeaders(prevSelectedHeaders => {
            const updatedHeaders = {
                ...prevSelectedHeaders,
                [header]: !prevSelectedHeaders[header],
            };
            const selectedColumns = Object.keys(updatedHeaders).filter(key => updatedHeaders[key]);
            setSelectedColumns(selectedColumns);
            return updatedHeaders;
        });
    };

    const toggleFilter = (header, e) => {
        e.stopPropagation();
        const rect = e.target.getBoundingClientRect();
        setFilterPosition({ top: rect.bottom, left: rect.left });
        setShowFilter(true);
        setShowFilterHeader(header);
    };

    const handleAddAlgorithmResponse = (response) => {
        const newHeaders = [...headers];
        const newData = [...data];

        Object.keys(response).forEach(key => {
            if (!newHeaders.includes(key)) {
                newHeaders.push(key);
                newData.forEach((row, index) => {
                    row[key] = index === 0 ? response[key] : '';
                });
            }
        });

        setHeaders(newHeaders);
        setData(newData);
    };

    const updateFilteredData = (newData) => {
        setFilteredData(newData);
        setSelectedColumns([]);
    };

    const handlePlotClear = (clear) => {
        setClearPlot(clear);
    };

    const handlePlotsCleared = () => {
        setClearPlot(false);
    };

    // styling for animation
    const visible = { opacity: 1, y: 0, transition: { duration: 0.5 } };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible,
    };

    return (
        <VStack
            width="100%"
            margin="0px auto"
            borderRadius="4px"
            justifyContent="space-between"
            align="center"
            spacing="12px"
            overflow="hidden"
            position="relative"
        >
            <Stack width="100%" align="center">
                <Text fontFamily="Inter" fontWeight="bold" fontSize="20px" color="#000000" width="100%">
                    Visualize
                </Text>
                <svg width="100%" height="1">
                    <line x1="0" y1="0" x2="100%" y2="0" style={{ stroke: '#A0AEC0', strokeWidth: 1 }} />
                </svg>
            </Stack>
            {showAlert && (
                <Alert status="warning" mb={4}>
                    <AlertIcon />
                    Please select at least one column first.
                </Alert>
            )}
            <div className="styles" data-scrollbar-width={scrollBarSize}>
                <AddAlgorithmButton
                    onClick={handleAddAlgorithmResponse}
                    cacheKey={cacheKey}
                />
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
                                                ml="10px"
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
                <TableFilter
                    isVisible={showFilter}
                    position={filterPosition}
                    onClose={() => setShowFilter(false)}
                    header={showFilterHeader}
                    cacheKey={cacheKey}
                    onFilterApply={updateFilteredData}
                    plotClear={handlePlotClear}
                />
                <PlotViewer 
                    cacheKey={cacheKey} 
                    selectedColumns={selectedColumns} 
                    clearPlot={clearPlot} 
                    onPlotsCleared={handlePlotsCleared}
                    onAskAI={(value) => {
                        setAiAsked(value);
                        setClearPlot(value); // Clear the plots when AI is asked
                    }}
                />
                {aiAsked && (
                    <motion.div
                        key={`askAI-${aiAsked}`}
                        initial="hidden"
                        animate="visible"
                        variants={itemVariants}
                    >
                        <ChatPrompt />
                    </motion.div>
                )}
            </div>
        </VStack>
    );
};

export default TableViewer;
