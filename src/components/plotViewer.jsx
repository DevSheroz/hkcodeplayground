import React, { useState, useEffect } from 'react';
import { embed } from '@bokeh/bokehjs';
import { Button } from '@chakra-ui/react';
import axios from 'axios';

const PlotViewer = ({ cacheKey, selectedColumns }) => {
    const [plotData, setPlotData] = useState(null);

    const fetchPlotData = async (cacheKey, plotType, columns) => {
        console.log(cacheKey, plotType, columns.toString());
        try {
            const response = await axios.post("http://localhost:8001/plot", null,
                {
                    params: {columns: columns.toString(), cache_key: cacheKey, plot: plotType },
                    withCredentials: true,
                });

            console.log(response.data);
            // setPlotData(response.data);
        } catch (error) {
            console.error('Error fetching plot data:', error);
        }
    };

    const handleButtonClick = (plotType) => {
        fetchPlotData(cacheKey, plotType, selectedColumns);
    };

    useEffect(() => {
        if (plotData && typeof document !== 'undefined') {
            embed.embed_item(plotData, "bokeh-plot");
        }
    }, [plotData]);

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
            <div id="bokeh-plot"></div>
        </div>
    );
};

export default PlotViewer;
