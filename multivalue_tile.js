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

    // Check if container already exists
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

    const container = document.getElementById('metricsGrid');
    if (!container) {
      console.error('Container element not found!');
      return;
    }

    // Ensure it is empty before rendering new content
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

    if (queryResponse.fields.measure_like.length > 0) {
      const metrics = queryResponse.fields.measure_like.map(field => ({
        label: field.label_short,
        value: data[0][field.name].value
      }));

      const gridLayout = calculateGridLayout(metrics.length);
      console.log('Calculated grid layout:', gridLayout);
      renderMetrics(metrics, gridLayout);

      // Handle resizing
      window.addEventListener('resize', () => renderMetrics(metrics, gridLayout));
    } else {
      console.error('No measure_like fields found in query response.');
    }

    done();
    console.log('Visualization update complete.');
  }
});
