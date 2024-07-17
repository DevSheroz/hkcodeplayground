import React, { useState, useEffect, useRef } from 'react';
import { embed } from '@bokeh/bokehjs';
import { Box, Button, Alert, AlertIcon, Text } from '@chakra-ui/react';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import MapIcon from '@mui/icons-material/Map';
import { LuLineChart } from "react-icons/lu";
import { IoBarChartSharp } from "react-icons/io5";
import axios from 'axios';
import { motion } from 'framer-motion';

const PlotViewer = ({ cacheKey, selectedColumns, clearPlot, onPlotsCleared, onAskAI }) => {
    const [fullPlotData, setFullPlotData] = useState(null);
    const [filteredPlotData, setFilteredPlotData] = useState(null);
    const [showAlert, setShowAlert] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const [isFilteredDataEmpty, setIsFilteredDataEmpty] = useState(false);
    const plotContainerRef = useRef(null);

    const fetchPlotData = async (cacheKey, plotType, columns) => {
        console.log(cacheKey, plotType, columns.toString());
        try {
            const response = await axios.post("http://localhost:8001/plot", null, {
                params: { columns: columns.toString(), cache_key: cacheKey, plot: plotType },
                withCredentials: true,
            });

            console.log(response.data);
            setFullPlotData(response.data.full_data);
            if (response.data.filtered_data == null) {
                setIsFilteredDataEmpty(true);
            } else {
                setFilteredPlotData(response.data.filtered_data);
                setIsFilteredDataEmpty(false); 
            }
        } catch (error) {
            console.error('Error fetching plot data:', error);
        }
    };

    const fetchMapData = async (cacheKey, lat, lon) => {
        console.log(cacheKey, lat, lon);
        try {
            const response = await axios.post("http://localhost:8001/map", null, {
                params: { cache_key: cacheKey, lat, lon },
                withCredentials: true,
            });

            console.log(response.data);
            const mapDiv = document.getElementById("folium-map");
            if (mapDiv) {
                mapDiv.innerHTML = response.data.heatmap;
            }
        } catch (error) {
            console.error('Error fetching map data:', error);
        }
    };

    const handleButtonClick = (plotType) => {
        if (!selectedColumns || selectedColumns.length === 0) {
            setShowAlert(true);
            return;
        }
        setShowAlert(false);
        setShowMap(false); // Ensure map is hidden when fetching plot data
        fetchPlotData(cacheKey, plotType, selectedColumns);
        onAskAI(false); // Reset the aiAsked state when Line or Bar button is clicked
    };

    const handleMapButtonClick = () => {
        setShowAlert(false);
        const lat = 'lat'; 
        const lon = 'long'; 
        fetchMapData(cacheKey, lat, lon);
        setShowMap(true);
        // Clear plots and AI state when Map is clicked
        setFullPlotData(null);
        setFilteredPlotData(null);
        setIsFilteredDataEmpty(false);
        onAskAI(false);
    };

    const handleAskAI = () => {
        console.log("AskAI clicked");
        onAskAI(true); // Update the parent state and clear plots
        setShowAlert(false);
        // Ensure map and plots are hidden when Ask AI is clicked
        setShowMap(false);
        setFullPlotData(null);
        setFilteredPlotData(null);
        setIsFilteredDataEmpty(false);
    };

    useEffect(() => {
        if (fullPlotData && typeof document !== 'undefined') {
            const fullPlotDiv = document.getElementById("bokeh-plot-full");
            if (fullPlotDiv) {
                fullPlotDiv.innerHTML = "";
                embed.embed_item(fullPlotData, "bokeh-plot-full");
            }
        }
        if (filteredPlotData && typeof document !== 'undefined' && !isFilteredDataEmpty) {
            const filteredPlotDiv = document.getElementById("bokeh-plot-filtered");
            if (filteredPlotDiv) {
                filteredPlotDiv.innerHTML = "";
                embed.embed_item(filteredPlotData, "bokeh-plot-filtered");
            }
        }

        if (plotContainerRef.current) {
            plotContainerRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [fullPlotData, filteredPlotData, isFilteredDataEmpty]);

    useEffect(() => {
        if (clearPlot) {
            setFullPlotData(null);
            setFilteredPlotData(null);
            setIsFilteredDataEmpty(false);
            const fullPlotDiv = document.getElementById("bokeh-plot-full");
            if (fullPlotDiv) {
                fullPlotDiv.innerHTML = "";
            }
            const filteredPlotDiv = document.getElementById("bokeh-plot-filtered");
            if (filteredPlotDiv) {
                filteredPlotDiv.innerHTML = "";
            }
            onPlotsCleared(); // Call the onPlotsCleared callback
        }
    }, [clearPlot, onPlotsCleared]);

    const visible = { opacity: 1, y: 0, transition: { duration: 0.5 } };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible,
    };

    return (
        <div style={{ width: '100%' }}>
            <div className="vizButtonsContainer">
                <div className="buttonGroup">
                    <Button
                        size="sm"
                        variant="solid"
                        bg="blue.500"
                        color="white"
                        boxShadow="0px 8px 6px -1px rgba(0, 0, 0, 0.1)"
                        _hover={{ bg: "blue.400" }}
                        _active={{
                            bg: "blue.500",
                            boxShadow: "none"
                        }}
                        width="100px"
                        marginLeft="10px"
                        onClick={() => handleButtonClick('line')}
                        leftIcon={<LuLineChart size="1.5em" color="white" />}
                    >
                        Line
                    </Button>
                    <Button
                        size="sm"
                        variant="solid"
                        bg="blue.500"
                        color="white"
                        boxShadow="0px 8px 6px -1px rgba(0, 0, 0, 0.1)"
                        _hover={{ bg: "blue.400" }}
                        _active={{
                            bg: "blue.500",
                            boxShadow: "none"
                        }}
                        width="100px"
                        marginLeft="10px"
                        onClick={() => handleButtonClick('bar')}
                        leftIcon={<IoBarChartSharp size="1.5em" color="white" />}
                    >
                        Bar
                    </Button>
                    <Button
                        size="sm"
                        variant="solid"
                        bg="orange.500"
                        color="white"
                        boxShadow="0px 8px 6px -1px rgba(0, 0, 0, 0.1)"
                        _hover={{ bg: "orange.400" }}
                        _active={{
                            bg: "orange.500",
                            boxShadow: "none"
                        }}
                        width="100px"
                        marginLeft="10px"
                        onClick={handleMapButtonClick}
                        leftIcon={<MapIcon w={4} h={4} />}
                    >
                        Map
                    </Button>
                </div>
                <Button
                    size="sm"
                    variant="solid"
                    bg="gray.50"
                    color="gray.700"
                    boxShadow="0px 8px 6px -1px rgba(0, 0, 0, 0.1)"
                    rounded="md"
                    borderColor="gray.300"
                    borderWidth="1px"
                    _hover={{ bg: "white" }}
                    _active={{
                        bg: "white",
                        boxShadow: "none"
                    }}
                    leftIcon={<AutoAwesomeIcon sx={{ color: "#ffc107", fontSize: "20px" }} />}
                    onClick={handleAskAI}
                >
                    Ask AI
                </Button>
            </div>
            <div>
                {showAlert && (
                    <Alert status="warning" mb={4}>
                        <AlertIcon />
                        Please select at least one column first.
                    </Alert>
                )}
                {isFilteredDataEmpty && (
                    <Alert status="info" mb={4}>
                        <AlertIcon />
                        Filtered data is empty. Displaying full data plot.
                    </Alert>
                )}
            </div>
            <div className="plotsContainer" ref={plotContainerRef} style={{ width: '100%' }}>
                {fullPlotData && (
                    <motion.div
                        id="bokeh-plot-full"
                        key={`full-${fullPlotData}`}
                        style={{ minHeight: '400px' }}
                        initial="hidden"
                        animate="visible"
                        variants={itemVariants}
                    />
                )}
                {filteredPlotData && !isFilteredDataEmpty && (
                    <motion.div
                        id="bokeh-plot-filtered"
                        key={`filtered-${filteredPlotData}`}
                        style={{ minHeight: '400px' }}
                        initial="hidden"
                        animate="visible"
                        variants={itemVariants}
                    />
                )}
                {showMap && (
                    <Box
                        bg="white"
                        p={4}
                        borderRadius="6px"
                        boxShadow="0 2px 6px rgba(0, 0, 0, 0.1), 0 -2px 6px rgba(0, 0, 0, 0.1)"
                        maxW="85%"
                        margin="0 auto"

                    >
                        <Text fontSize="lg" fontWeight="bold" mb={4}>
                            GPS Heatmap
                        </Text>
                        <motion.div
                            id="folium-map"
                            initial="hidden"
                            animate="visible"
                            variants={itemVariants}
                            style={{
                                height: '400px',
                                width: '100%',
                                overflow: 'hidden',
                                boxShadow: '0px 2px 3px rgba(0, 0, 0, 0.1),  0 -2px 3px rgba(0, 0, 0, 0.1)',
                                borderRadius: '2px',
                                borderWidth: '1px',
                                borderColor: '#A0AEC0',
                                
                            }}
                        />
                    </Box>
                )}
            </div>
        </div>
    );
};

export default PlotViewer;
