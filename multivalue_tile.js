looker.plugins.visualizations.add({
  id: "responsive-tile-visualization",
  label: "Responsive Tile Visualization",
  options: {
    title: {
      type: "string",
      label: "Title",
      default: "Metrics Dashboard"
    },
    font_color: {
      type: "string",
      label: "Font Color",
      default: "#666666"
    },
    background_color: {
      type: "string",
      label: "Background Color",
      default: "#FFFFFF"
    }
  },
  create: function(element, config) {
    element.innerHTML = `
      <style>
        .grid-container {
          display: grid;
          gap: 10px;
          padding: 10px;
          background-color: ${config.background_color};
          box-sizing: border-box;
        }
        .grid-item {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 20px;
          border: 1px solid #ccc;
          border-radius: 4px;
          background-color: #f9f9f9;
        }
        .title {
          font-weight: bold;
          margin-bottom: 10px;
          color: ${config.font_color};
        }
        .value {
          font-size: 24px;
          color: ${config.font_color};
        }
      </style>
      <div id="metricsGrid" class="grid-container"></div>
    `;
  },
  updateAsync: function(data, element, config, queryResponse, details, done) {
    const calculateGridLayout = function(metricsCount) {
      const rows = Math.ceil(Math.sqrt(metricsCount));
      const cols = Math.ceil(metricsCount / rows);
      return { rows, cols };
    };

    const renderMetrics = function(metrics, { rows, cols }) {
      const container = document.getElementById('metricsGrid');
      container.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
      container.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

      container.innerHTML = '';
      metrics.forEach(metric => {
        const item = document.createElement('div');
        item.className = 'grid-item';
        item.innerHTML = `
          <div class="title">${metric.label}</div>
          <div class="value">${metric.value}</div>
        `;
        container.appendChild(item);
      });
    };

    if (queryResponse.fields.measure_like.length) {
      const metrics = queryResponse.fields.measure_like.map(field => ({
        label: field.label_short,
        value: data[0][field.name].value
      }));

      const gridLayout = calculateGridLayout(metrics.length);
      renderMetrics(metrics, gridLayout);

      // Handle resizing
      window.addEventListener('resize', () => renderMetrics(metrics, gridLayout));
    }

    done();
  }
});
