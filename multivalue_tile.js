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
          gap: 10px;
        }

        .responsive-table div {
          text-align: center;
          font-family: 'Lato Light', sans-serif;
        }

        .metric-value {
          font-size: 1.5rem;
        }

        .metric-label {
          font-size: 1rem;
          color: #555555;
        }

        @media (max-width: 1024px) {
          .metric-value {
            font-size: 1.2rem;
          }

          .metric-label {
            font-size: 0.9rem;
          }
        }

        @media (max-width: 768px) {
          .metric-value {
            font-size: 1rem;
          }

          .metric-label {
            font-size: 0.8rem;
          }
        }

        @media (max-width: 480px) {
          .metric-value {
            font-size: 0.8rem;
          }

          .metric-label {
            font-size: 0.7rem;
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

    // Adjust the grid style for responsiveness
    const numMetrics = queryResponse.fields.dimension_like.length + queryResponse.fields.measure_like.length;
    if (numMetrics > 3) {
      metricsGrid.style.gridTemplateColumns = 'repeat(3, 1fr)';
    } else {
      metricsGrid.style.gridTemplateColumns = `repeat(${numMetrics}, 1fr)`;
    }
    
    // Call done to indicate rendering is complete
    done();
  }
});
