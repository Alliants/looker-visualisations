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
          grid-template-columns: repeat(3, 1fr);
        }

        .responsive-table div {
          text-align: center;
          font-family: 'Lato Light', sans-serif;
          display: flex;
          flex-direction: column;
          justify-content: center;
          overflow: hidden;
        }

        .metric-value, .metric-label {
          margin: 0;
          padding: 0;
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

    const containerHeight = element.offsetHeight;
    const maxRowHeight = containerHeight / numRows;

    const baseFontSize = maxRowHeight * 0.3;
    const metricValueSize = baseFontSize * 1.25;
    const metricLabelSize = baseFontSize * 0.7;

    const metricValues = document.querySelectorAll('.metric-value');
    const metricLabels = document.querySelectorAll('.metric-label');
    metricValues.forEach(mv => mv.style.fontSize = `${metricValueSize}px`);
    metricLabels.forEach(ml => ml.style.fontSize = `${metricLabelSize}px`);

    done();
  }
});
