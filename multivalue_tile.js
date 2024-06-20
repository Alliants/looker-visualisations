looker.plugins.visualizations.add({
  id: "custom-responsiveness",
  label: "Responsive Table",
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
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          font-family: 'Lato Light', sans-serif;
          background: #F4F4F4;
          border-radius: 8px;
          padding: 10px;
        }

        .metric-value {
          font-size: 2em;
          margin: 0;
        }

        .metric-label {
          font-size: 1em;
          color: #555555;
          margin: 0;
        }

        @media (max-width: 1024px) {
          .metric-value {
            font-size: 1.8em;
          }

          .metric-label {
            font-size: 0.9em;
          }
        }

        @media (max-width: 768px) {
          .metric-value {
            font-size: 1.5em;
          }

          .metric-label {
            font-size: 0.8em;
          }
        }

        @media (max-width: 480px) {
          .metric-value {
            font-size: 1.2em;
          }

          .metric-label {
            font-size: 0.7em;
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

    // Determine the ideal number of columns based on container width
    const containerWidth = metricsGrid.offsetWidth;
    const metricsCount = metricsGrid.children.length;
    const estimatedColumnWidth = 200; // estimate each metric's ideal width

    let numColumns = Math.floor(containerWidth / estimatedColumnWidth);
    if (numColumns > metricsCount) numColumns = metricsCount;

    // Adjust the grid style for responsiveness
    metricsGrid.style.gridTemplateColumns = `repeat(${numColumns}, 1fr)`;

    // Call done to indicate rendering is complete
    done();
  }
});
