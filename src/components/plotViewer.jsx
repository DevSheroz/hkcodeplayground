import React, { useState, useEffect, useRef } from 'react';
import { embed } from '@bokeh/bokehjs';
import { Button, Alert, AlertIcon } from '@chakra-ui/react';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import axios from 'axios';
import { motion } from 'framer-motion';

const PlotViewer = ({ cacheKey, selectedColumns, clearPlot, onPlotsCleared, onAskAI }) => {
    const [fullPlotData, setFullPlotData] = useState(null);
    const [filteredPlotData, setFilteredPlotData] = useState(null);
    const [showAlert, setShowAlert] = useState(false);
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

    const handleButtonClick = (plotType) => {
        if (!selectedColumns || selectedColumns.length === 0) {
            setShowAlert(true);
            return;
        }
        setShowAlert(false);
        fetchPlotData(cacheKey, plotType, selectedColumns);
        onAskAI(false); // Reset the aiAsked state when Line or Bar button is clicked
    };

    const handleAskAI = () => {
        console.log("AskAI clicked");
        onAskAI(true); // Update the parent state and clear plots
        setShowAlert(false);
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
            // Clear the plot data when clearPlot is true
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
        <div>
            <div className="vizButtonsContainer">
                <div className="buttonGroup">
                    <Button
                        size="sm"
                        variant="solid"
                        bg="blue.500"
                        color="white"
                        _hover={{ bg: "blue.600" }}
                        _active={{ bg: "blue.700" }}
                        width="100px"
                        marginLeft="10px"
                        onClick={() => handleButtonClick('line')}
                    >
                        Line
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
                        onClick={() => handleButtonClick('bar')}
                    >
                        Bar
                    </Button>
                </div>
                <Button
                    size="sm"
                    variant="solid"
                    bg="gray.50"
                    color="gray.700"
                    _hover={{ bg: "gray.200" }}
                    _active={{ bg: "gray.50" }}
                    width="100px"
                    marginLeft="10px"
                    borderColor="gray.500"
                    borderWidth="1px"
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
            <div className="plotsContainer" ref={plotContainerRef}>
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
            </div>
        </div>
    );
};

export default PlotViewer;
