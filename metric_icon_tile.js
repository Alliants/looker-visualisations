looker.plugins.visualizations.add({
  id: 'dynamic_metric_display_v3',
  label: 'Dynamic Metric Display v3',
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
        // Ensure this value is a proper string default
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
    if (typeof hex !== 'string') {
      console.error('Invalid hex color:', hex);
      return '0,0,0'; // Default to black if the input is invalid
    }

    // Expand shorthand form (e.g., "#03F") to full form (e.g., "#0033FF")
    if (hex.length === 4) {
      hex = `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
    } else if (!/^#[0-9A-Fa-f]{6}$/i.test(hex)) {
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
    container.style.alignContent = 'flex-end';

    // Ensure dynamic options are updated
    this.updateDynamicOptions(queryResponse);

    const fields = queryResponse.fields.dimension_like.concat(queryResponse.fields.measure_like);
    const containerWidth = element.clientWidth;
    const containerHeight = element.clientHeight;
    
    const numMetrics = fields.length;

    // Calculate the estimated width and height per metric container
    const metricMinWidth = 150; // An estimated min width for each metric
    const metricMinHeight = 150; // An estimated min height for each metric

    // Decide the number of columns (adjusting for minimum width per metric)
    const numColumns = Math.max(1, Math.floor(containerWidth / metricMinWidth));
    const numRows = Math.ceil(numMetrics / numColumns);

    // Calculate width and height for each metric container
    const metricWidth = containerWidth / numColumns;
    const metricHeight = Math.max(metricMinHeight, containerHeight / numRows);

    fields.forEach((field, metricIndex) => {
      const fieldName = field.name.replace(/\./g, '_');
      
      // Ensure metric colors default to master color if unspecified
      const metricColor = config[`metric_color_${fieldName}`] || config.master_color || '#000000';
      const validMetricColor = typeof metricColor === 'string' ? metricColor : '#000000';

      const fieldLabel = config[`metric_label_${fieldName}`] || field.label_short || field.label;
      const fieldValue = data[0][field.name].rendered || data[0][field.name].value || '∅';
      const iconURL = config[`icon_url_${fieldName}`] || '';
      const iconColor = this.hexToRgb(validMetricColor);

      const metricContainer = document.createElement('div');
      metricContainer.className = 'metric-container';
      metricContainer.style = `width: ${metricWidth}px; height: ${metricHeight}px; display: flex; flex-direction: column; align-items: center; justify-content: center;`;

      const valueElement = document.createElement('div');
      valueElement.className = 'metric-value';
      valueElement.innerText = fieldValue;
      valueElement.style.color = validMetricColor;
      valueElement.style.fontSize = 'calc(1.5rem + 1vw)';
      valueElement.style.textAlign = 'center'; // Ensuring value element is centered
      metricContainer.appendChild(valueElement);

      if (iconURL) {
        const iconElement = document.createElement('img');
        iconElement.src = `${iconURL}&color=${iconColor},1`;
        iconElement.style.width = '20%';
        iconElement.style.height = '20%';
        iconElement.style.objectFit = 'contain';
        metricContainer.appendChild(iconElement);
      }

      const labelElement = document.createElement('div');
      labelElement.className = 'metric-label';
      labelElement.innerText = fieldLabel;
      labelElement.style.color = validMetricColor;
      labelElement.style.fontSize = 'calc(0.75rem + 0.5vw)';
      labelElement.style.textAlign = 'center'; // Ensuring text is centered
      metricContainer.appendChild(labelElement);

      container.appendChild(metricContainer);
    });

    container.style.display = 'flex';
    container.style.flexWrap = 'wrap';
    container.style.justifyContent = 'center'; // Ensures even spacing
    container.style.alignItems = 'center';
    container.style.height = '100%';

    done();
  }
});
