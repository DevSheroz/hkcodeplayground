import React, { useState, useEffect } from 'react';
import { embed } from '@bokeh/bokehjs';
import { Button, Alert, AlertIcon } from '@chakra-ui/react';
import axios from 'axios';

const PlotViewer = ({ cacheKey, selectedColumns, clearPlot, onPlotsCleared }) => {
    const [fullPlotData, setFullPlotData] = useState(null);
    const [filteredPlotData, setFilteredPlotData] = useState(null);
    const [showAlert, setShowAlert] = useState(false);
    const [isFilteredDataEmpty, setIsFilteredDataEmpty] = useState(false);

    const fetchPlotData = async (cacheKey, plotType, columns) => {
        console.log(cacheKey, plotType, columns.toString());
        try {
            const response = await axios.post("http://localhost:8001/plot", null, {
                params: { columns: columns.toString(), cache_key: cacheKey, plot: plotType },
                withCredentials: true,
            });

            console.log(response.data);
            setFullPlotData(response.data.full_data);
            if (response.data.filtered_data.length === 0) {
                setIsFilteredDataEmpty(true);
            } else {
                setFilteredPlotData(response.data.filtered_data);
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

    return (
        <div>
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
            <div>
                {showAlert && (
                    <Alert status="warning" mb={4}>
                        <AlertIcon />
                        Please select at least one column first.
                    </Alert>
                )}
            </div>
            <div className="plotsContainer">
                {isFilteredDataEmpty && (
                    <Alert status="info" mb={4}>
                        <AlertIcon />
                        Filtered data is empty. Displaying full data plot.
                    </Alert>
                )}
                    <div id="bokeh-plot-full" style={{ minHeight: '400px' }}></div>
                {!isFilteredDataEmpty && (
                        <div id="bokeh-plot-filtered" style={{ minHeight: '400px' }}></div>
                )}
            </div>
        </div>
    );
};

export default PlotViewer;