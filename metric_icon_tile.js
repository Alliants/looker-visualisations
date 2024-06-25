looker.plugins.visualizations.add({
  id: 'dynamic_metric_display_v3',
  label: 'Dynamic Metric Display v3',
  options: {
    master_color: {
      type: 'string',
      label: 'Master Color',
      display: 'color',
      default: '#000000',
      order: 1,
    },
  },

  create: function (element, config) {
    element.innerHTML = '<div class="viz-container"></div>';
    element.style.fontFamily = 'Lato, sans-serif';
  },

  updateDynamicOptions: function (queryResponse) {
    const fields = queryResponse.fields.dimension_like.concat(queryResponse.fields.measure_like);

    // Remove previous dynamic options
    Object.keys(this.options).forEach((key) => {
      if (key.startsWith('metric_color_') || key.startsWith('icon_url_') || key.startsWith('metric_label_')) {
        delete this.options[key];
      }
    });

    // Add new dynamic options for each metric
    fields.forEach((field, index) => {
      const fieldName = field.name.replace(/\./g, '_');
      this.options[`metric_color_${fieldName}`] = {
        type: 'string',
        label: `Metric ${index + 1} Color`,
        display: 'color',
        // Providing a string default directly to avoid [object Object] issues
        default: String(this.options.master_color || '#000000'),
        order: 2 + index * 2,
      };
      this.options[`icon_url_${fieldName}`] = {
        type: 'string',
        label: `Icon URL for Metric ${index + 1}`,
        display: 'text',
        default: '',
        order: 3 + index * 2,
      };
      this.options[`metric_label_${fieldName}`] = {
        type: 'string',
        label: `Label for Metric ${index + 1}`,
        display: 'text',
        default: field.label_short || field.label,
        order: 4 + index * 2,
      };
    });

    // Register the updated options with Looker
    this.trigger('registerOptions', this.options);
  },

  hexToRgb: function(hex) {
    // Safety checks for valid hex strings
    if (typeof hex !== 'string' || !/^#[0-9A-Fa-f]{6}$/i.test(hex)) {
      console.error('Invalid hex color:', hex);
      return '0,0,0'; // Default to black if the input is invalid
    }
    hex = hex.replace('#', '');
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = (bigint) & 255;
    return `${r},${g},${b}`;
  },

  updateAsync: function (data, element, config, queryResponse, details, done) {
    const container = element.querySelector('.viz-container');
    container.innerHTML = '';

    // Ensure dynamic options are updated
    this.updateDynamicOptions(queryResponse);

    const fields = queryResponse.fields.dimension_like.concat(queryResponse.fields.measure_like);
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
        const fieldName = field.name.replace(/\./g, '_');
        // Ensure metric colors default to master color if unspecified
        const metricColor = config[`metric_color_${fieldName}`] || config.master_color || '#000000';

        const fieldLabel = config[`metric_label_${fieldName}`] || field.label_short || field.label;
        const fieldValue = data[0][field.name].rendered || data[0][field.name].value || '∅';
        const iconURL = config[`icon_url_${fieldName}`] || '';
        const iconColor = this.hexToRgb(metricColor);

        const metricContainer = document.createElement('div');
        metricContainer.className = 'metric-container';
        metricContainer.style = 'flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;';

        const valueElement = document.createElement('div');
        valueElement.className = 'metric-value';
        valueElement.innerText = fieldValue;
        valueElement.style.color = metricColor;
        valueElement.style.fontSize = `2rem`;
        metricContainer.appendChild(valueElement);

        if (iconURL) {
          const iconElement = document.createElement('img');
          iconElement.src = `${iconURL}&color=${iconColor},1`;
          iconElement.style.width = `${containerWidth / 10}px`;
          iconElement.style.height = `${containerHeight / 10}px`;
          metricContainer.appendChild(iconElement);
        }

        const labelElement = document.createElement('div');
        labelElement.className = 'metric-label';
        labelElement.innerText = fieldLabel;
        labelElement.style.color = metricColor;
        labelElement.style.fontSize = `1rem`;
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
