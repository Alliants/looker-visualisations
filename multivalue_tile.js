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
    console.log('Creating visualization...');

    let container = document.getElementById('metricsGrid');
    if (!container) {
      container = document.createElement('div');
      container.id = "metricsGrid";
      container.className = "grid-container";
      container.style.backgroundColor = config.background_color || "#FFFFFF";
      element.appendChild(container);
    }

    const style = document.createElement('style');
    style.innerHTML = `
      .grid-container {
        display: grid;
        gap: 10px;
        padding: 10px;
        background-color: ${config.background_color || '#FFFFFF'};
        box-sizing: border-box;
      }
      .grid-item {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 20px;
        border-radius: 4px;
      }
      .title {
        font-weight: bold;
        margin-bottom: 10px;
        color: ${config.font_color || '#666666'};
        text-align: center;
      }
      .value {
        font-size: 24px;
        color: ${config.font_color || '#666666'};
        text-align: center;
      }
    `;
    document.head.appendChild(style);

    console.log('Visualization created successfully.');
  },
  updateAsync: function(data, element, config, queryResponse, details, done) {
    console.log('Updating visualization with data:', data);

    console.log('Query response:', queryResponse);

    const container = document.getElementById('metricsGrid');
    if (!container) {
      console.error('Container element not found!');
      return;
    }

    container.innerHTML = '';

    const calculateGridLayout = function(metricsCount) {
      const rows = Math.ceil(Math.sqrt(metricsCount));
      const cols = Math.ceil(metricsCount / rows);
      return { rows, cols };
    };

    const renderMetrics = function(metrics, { rows, cols }) {
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

    const fields = queryResponse.fields;
    console.log('Available fields:', fields);

    const metrics = [];
    
    // Process dimensions
    if (fields.dimensions.length > 0) {
      fields.dimensions.forEach(field => {
        if (data[0][field.name] != null) {
          metrics.push({
            label: field.label_short,
            value: data[0][field.name].value
          });
        }
      });
    }

    // Process measures (if available)
    if (fields.measures.length > 0) {
      fields.measures.forEach(field => {
        if (data[0][field.name] != null) {
          metrics.push({
            label: field.label_short,
            value: data[0][field.name].value
          });
        }
      });
    }

    // Process table calculations (if any)
    if (fields.table_calculations.length > 0) {
      fields.table_calculations.forEach(field => {
        if (data[0][field.name] != null) {
          metrics.push({
            label: field.label_short,
            value: data[0][field.name].value
          });
        }
      });
    }

    if (metrics.length > 0) {
      const gridLayout = calculateGridLayout(metrics.length);
      console.log('Calculated grid layout:', gridLayout);
      renderMetrics(metrics, gridLayout);
    } else {
      console.error('No fields found to display.');
    }

    done();
    console.log('Visualization update complete.');
  }
});
