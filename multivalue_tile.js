looker.plugins.visualizations.add({
  id: "custom-responsive-grid",
  label: "Responsive Grid",
  options: {},

  create: function(element, config) {
    element.innerHTML = `
      <style>
        .custom-visualization {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0; /* Remove extra padding */
          box-sizing: border-box;
          width: 100%;
          height: 100%;
        }

        .responsive-table {
          display: grid;
          width: calc(100% - 20px);
          height: calc(100% - 20px); /* Apply calc to reduce white space */
          gap: 10px;
          grid-template-columns: repeat(3, 1fr);
          grid-auto-rows: 1fr;
        }

        .responsive-table div {
          text-align: center;
          font-family: 'Lato Light', sans-serif;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          overflow: hidden;
        }

        .metric-value {
          font-size: 1.2rem;
          margin: 5px 0;
          height: calc(50% - 10px); /* Adjust height to fill the grid cell */
        }

        .metric-label {
          font-size: 0.8rem;
          color: #555555;
          margin: 5px 0;
          height: calc(50% - 10px); /* Adjust height to fill the grid cell */
        }

        @media (max-width: 1024px) {
          .metric-value {
            font-size: 1rem;
          }

          .metric-label {
            font-size: 0.7rem;
          }
        }

        @media (max-width: 768px) {
          .metric-value {
            font-size: 0.9rem;
          }

          .metric-label {
            font-size: 0.6rem;
          }
        }

        @media (max-width: 480px) {
          .metric-value {
            font-size: 0.8rem;
          }

          .metric-label {
            font-size: 0.5rem;
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
    this.clearErrors();

    const metricsGrid = document.getElementById("metrics-grid");
    metricsGrid.innerHTML = '';

    const createMetricElement = (label, value) => {
      const metricElement = document.createElement("div");
      metricElement.innerHTML = `
        <div class="metric-value">${value}</div>
        <p class="metric-label">${label}</p>
      `;
      metricsGrid.appendChild(metricElement);
    };

    queryResponse.fields.dimension_like.forEach((field, index) => {
      const value = data[0][field.name].rendered || data[0][field.name].value;
      createMetricElement(config[`label_${index}`] || field.label_short, value);
    });

    queryResponse.fields.measure_like.forEach((field, index) => {
      const value = data[0][field.name].rendered || data[0][field.name].value;
      createMetricElement(config[`label_${index}`] || field.label_short, value);
    });

    const numMetrics = metricsGrid.children.length;
    const numRows = Math.ceil(numMetrics / 3);
    metricsGrid.style.gridTemplateRows = `repeat(${numRows}, 1fr)`;
    
    // Calculate font size based on available space
    const containerHeight = element.offsetHeight;
    const maxRowHeight = containerHeight / numRows;
    const containerWidth = element.offsetWidth / 3;
    const baseFontSize = Math.min(maxRowHeight, containerWidth) * 0.3;

    const metricValueSize = baseFontSize;
    const metricLabelSize = baseFontSize * 0.6;

    const metricValues = document.querySelectorAll('.metric-value');
    const metricLabels = document.querySelectorAll('.metric-label');
    metricValues.forEach(mv => mv.style.fontSize = `${metricValueSize}px`);
    metricLabels.forEach(ml => ml.style.fontSize = `${metricLabelSize}px`);

    done();
  }
});
