looker.plugins.visualizations.add({
  id: "custom-responsive-grid",
  label: "Responsive Grid",
  options: {},

  create: function(element, config) {
    // Create an empty container element for the visualization
    element.innerHTML = `
      <style>
        .custom-visualization {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px;
          box-sizing: border-box;
          width: 100%;
          height: 100%;
        }

        .responsive-table {
          display: grid;
          width: 100%;
          height: 100%;
          gap: 10px;
        }

        .responsive-table div {
          text-align: center;
          font-family: 'Lato Light', sans-serif;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .metric-value {
          font-size: 2vw;
          margin: 0;
        }

        .metric-label {
          font-size: 1vw;
          color: #555555;
          margin: 0;
        }

        @media (max-width: 1024px) {
          .metric-value {
            font-size: 1.8vw;
          }

          .metric-label {
            font-size: 0.9vw;
          }
        }

        @media (max-width: 768px) {
          .metric-value {
            font-size: 1.6vw;
          }

          .metric-label {
            font-size: 0.8vw;
          }
        }

        @media (max-width: 480px) {
          .metric-value {
            font-size: 1.4vw;
          }

          .metric-label {
            font-size: 0.7vw;
          }

          .responsive-table {
            grid-template-columns: 1fr;
          }
        }
      </style>
      <div class="custom-visualization">
        <div class="responsive-table" id="metrics-grid"></div>
      </div>
    `;
  },

  updateAsync: function(data, element, config, queryResponse, details, done) {
    // Clear any errors from previous updates
    this.clearErrors();

    // Reset the metrics grid
    const metricsGrid = document.getElementById("metrics-grid");
    metricsGrid.innerHTML = '';

    // Function to create and append metric elements
    const createMetricElement = (label, value) => {
      const metricElement = document.createElement("div");
      metricElement.innerHTML = `
        <div class="metric-value">${value}</div>
        <p class="metric-label">${label}</p>
      `;
      metricsGrid.appendChild(metricElement);
    };

    // Process dimensions and create metric elements
    queryResponse.fields.dimension_like.forEach((field, index) => {
      const value = data[0][field.name].rendered || data[0][field.name].value;
      createMetricElement(config[`label_${index}`] || field.label_short, value);
    });

    // Process measures and create metric elements
    queryResponse.fields.measure_like.forEach((field, index) => {
      const value = data[0][field.name].rendered || data[0][field.name].value;
      createMetricElement(config[`label_${index}`] || field.label_short, value);
    });

    // Determine grid layout based on the number of metrics and container size
    const numMetrics = metricsGrid.children.length;
    const containerWidth = metricsGrid.offsetWidth;
    const containerHeight = metricsGrid.offsetHeight;
    const isLandscape = containerWidth > containerHeight;
    
    let numColumns;
    let numRows;
    
    if (isLandscape) {
      numColumns = Math.ceil(Math.sqrt(numMetrics * (containerWidth / containerHeight)));
      numRows = Math.ceil(numMetrics / numColumns);
    } else {
      numRows = Math.ceil(Math.sqrt(numMetrics * (containerHeight / containerWidth)));
      numColumns = Math.ceil(numMetrics / numRows);
    }
    
    // Adjust the grid style for responsiveness
    metricsGrid.style.gridTemplateColumns = `repeat(${numColumns}, 1fr)`;
    metricsGrid.style.gridTemplateRows = `repeat(${numRows}, 1fr)`;

    // Calculate font size based on container size and number of metrics
    const baseFontSize = Math.min(containerWidth / numColumns, containerHeight / numRows) * 0.2; 
    const metricValueSize = baseFontSize * 1.2;
    const metricLabelSize = baseFontSize * 0.6;

    // Apply font sizes dynamically
    const metricValues = document.querySelectorAll('.metric-value');
    const metricLabels = document.querySelectorAll('.metric-label');
    metricValues.forEach(mv => mv.style.fontSize = `${metricValueSize}px`);
    metricLabels.forEach(ml => ml.style.fontSize = `${metricLabelSize}px`);

    // Call done to indicate rendering is complete
    done();
  }
});
