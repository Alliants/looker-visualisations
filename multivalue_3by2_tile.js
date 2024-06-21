// Import necessary libraries 
import React from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';

// Define styled components
const Container = styled.div`
    display: flex;
    flex-direction: ${props => props.orientation};
`;

const DataGroup = styled.div`
    margin: 10px;
`;

const DataPoint = styled.div`
    font-size: ${props => props.fontSize}px;
`;

const PercentageChange = styled(DataPoint)`
    color: green;
`;

// Define configuration options
const options = {
    font_size: {
        label: "Font Size",
        type: "number",
        default: 12
    },
    orientation: {
        label: "Orientation",
        type: "string",
        display: "radio",
        values: [
            { "Horizontal": "horizontal" },
            { "Vertical": "vertical" }
        ]
    },
    show_titles: {
        label: "Show Titles",
        type: "boolean",
        default: true
    },
    compare_data_points: {
        label: "Compare Data Points",
        type: "boolean",
        default: false
    },
    show_percentage_changes: {
        label: "Show Percentage Changes",
        type: "boolean",
        default: false
    },
};

// Process incoming data
function processData(data, config) {
    return data.map(row => ({
        baseValue: row['base_measure'].value,
        compareValue: config.compare_data_points ? row['compare_measure'].value : null,
        percentageChange: config.show_percentage_changes ? calculatePercentageChange(row['base_measure'].value, row['compare_measure'].value) : null
    }));
}

function calculatePercentageChange(base, compare) {
    if (!compare) return null;
    return ((compare - base) / base * 100).toFixed(2);
}

// Render the visualization
function renderVisualization(data, config, element) {
    element.innerHTML = '';

    const component = (
        <Container orientation={config.orientation === 'vertical' ? 'column' : 'row'}>
            {data.map((item, index) => (
                <DataGroup key={index}>
                    <DataPoint fontSize={config.font_size}>{item.baseValue}</DataPoint>
                    {config.compare_data_points && item.compareValue !== null 
                        && <DataPoint fontSize={config.font_size}>{item.compareValue}</DataPoint>}
                    {config.show_percentage_changes && item.percentageChange !== null 
                        && <PercentageChange fontSize={config.font_size}>{item.percentageChange}%</PercentageChange>}
                </DataGroup>
            ))}
        </Container>
    );

    ReactDOM.render(component, element);
}

// Main Looker Visualization class
class CustomVisualization {
    constructor() {
        this.options = options;
    }

    create(element, config) {
        element.innerHTML = "<div id='root'></div>";
    }

    updateAsync(data, element, config, queryResponse, details, done) {
        const processedData = processData(data, config);
        renderVisualization(processedData, config, document.getElementById("root"));
        done();
    }
}

looker.plugins.visualizations.add(new CustomVisualization());
