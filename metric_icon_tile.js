looker.plugins.visualizations.add({
  id: 'dynamic_metric_display_v2',
  label: 'Dynamic Metric Display v2',
  options: {
    master_color: {
      type: 'string',
      label: 'Master Color',
      display: 'color',
      default: '#000000',
    },
  },
  create: function (element, config) {
    element.innerHTML = '<div class="viz-container"></div>';
    element.style.fontFamily = 'Lato, sans-serif';
  },
  updateAsync: function (data, element, config, queryResponse, details, done) {
    const container = element.querySelector('.viz-container');
    container.innerHTML = '';
    
    const fields = queryResponse.fields.dimension_like.concat(queryResponse.fields.measure_like);

    // Remove any existing dynamic options
    const options = this.options;
    Object.keys(options).forEach(key => {
      if (key.startsWith('icon_url_') || key.startsWith('metric_color_')) {
        delete options[key];
      }
    });

    // Add dynamic options based on the number of fields
    fields.forEach((field, index) => {
      options[`icon_url_${index + 1}`] = {
        type: 'string',
        label: `Icon URL ${index + 1}`,
        display: 'text',
        default: ''
      };
      options[`metric_color_${index + 1}`] = {
        type: 'string',
        label: `Metric ${index + 1} Color`,
        display: 'color',
        default: config.master_color
      };
    });

    const containerWidth = element.clientWidth;
    const containerHeight = element.clientHeight;

    const numMetrics = fields.length;
    const numColumns = Math.ceil(Math.sqrt(numMetrics));
    const numRows = Math.ceil(numMetrics / numColumns);
    
    for (let i = 0; i < numRows; i++) {
      const row = document.createElement('div');
      row.className = 'row';
      row.style.display = 'flex';
      row.style.flex = '1';
      container.appendChild(row);
    
      for (let j = 0; j < numColumns; j++) {
        const metricIndex = i * numColumns + j;
        if (metricIndex >= numMetrics) break;
    
        const field = fields[metricIndex];
        const fieldName = field.name;
        const fieldLabel = field.label_short || field.label;
        const fieldValue = data[0][fieldName].rendered || data[0][fieldName].value || '∅';
        const iconURL = config[`icon_url_${metricIndex + 1}`] || '';
        const metricColor = config[`metric_color_${metricIndex + 1}`] || config.master_color;
    
        const metricContainer = document.createElement('div');
        metricContainer.className = 'metric-container';
        metricContainer.style = 'flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;';
    
        if (iconURL) {
          const iconElement = document.createElement('img');
          iconElement.src = `${iconURL}&RGB=${metricColor.replace('#', '')}`;
          iconElement.style.width = `${containerWidth / 10}px`;
          iconElement.style.height = `${containerHeight / 10}px`;
          metricContainer.appendChild(iconElement);
        }
    
        const valueElement = document.createElement('div');
        valueElement.className = 'metric-value';
        valueElement.innerText = fieldValue;
        valueElement.style.color = metricColor;
        valueElement.style.fontSize = `${containerWidth / 20}px`;
        metricContainer.appendChild(valueElement);
    
        const labelElement = document.createElement('div');
        labelElement.className = 'metric-label';
        labelElement.innerText = fieldLabel;
        labelElement.style.color = metricColor;
        labelElement.style.fontSize = `${containerWidth / 30}px`;
        metricContainer.appendChild(labelElement);
    
        row.appendChild(metricContainer);
      }
    }
    
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.justifyContent = 'space-around';
    container.style.alignItems = 'center';
    container.style.flexWrap = 'wrap';
    container.style.height = '100%';
      
    done();
  }
});
