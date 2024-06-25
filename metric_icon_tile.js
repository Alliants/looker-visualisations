looker.plugins.visualizations.add({
  id: 'dynamic_metric_display',
  label: 'Dynamic Metric Display',
  options: {
    font_family: {
      type: 'string',
      label: 'Font Family',
      display: 'select',
      values: ['Lato', 'Arial', 'Georgia', 'Courier New', 'Roboto', 'Open Sans', 'Montserrat', 'Oswald', 'Raleway'],
      default: 'Lato',
    },
    master_color: {
      type: 'string',
      label: 'Master Color',
      display: 'color',
      default: '#000000',
    },
  },
  create: function (element, config) {
    element.innerHTML = '<div class="viz-container"></div>';
    element.style.fontFamily = config.font_family;
  },
  updateAsync: function (data, element, config, queryResponse, details, done) {
    const container = element.querySelector('.viz-container');
    container.innerHTML = '';

    const containerWidth = element.clientWidth;
    const containerHeight = element.clientHeight;
    const fields = queryResponse.fields.dimension_like.concat(queryResponse.fields.measure_like);

    fields.forEach((field, index) => {
      const fieldName = field.name;
      const fieldLabel = field.label_short || field.label;
      const fieldValue = data[0][fieldName].rendered || data[0][fieldName].value || '∅';
      const iconURL = config[`icon_url_${index + 1}`] || '';

      const metricContainer = document.createElement('div');
      metricContainer.className = 'metric-container';
      metricContainer.style = 'display: flex; flex-direction: column; align-items: center; justify-content: center;';

      if (iconURL) {
        const iconElement = document.createElement('img');
        iconElement.src = iconURL;
        iconElement.style.width = `${containerWidth / 10}px`;
        iconElement.style.height = `${containerHeight / 10}px`;
        metricContainer.appendChild(iconElement);
      }

      const valueElement = document.createElement('div');
      valueElement.className = 'metric-value';
      valueElement.innerText = fieldValue;
      valueElement.style.color = config.master_color;
      valueElement.style.fontSize = `${containerWidth / 20}px`;
      metricContainer.appendChild(valueElement);

      const labelElement = document.createElement('div');
      labelElement.className = 'metric-label';
      labelElement.innerText = fieldLabel;
      labelElement.style.color = config.master_color;
      labelElement.style.fontSize = `${containerWidth / 30}px`;
      metricContainer.appendChild(labelElement);

      container.appendChild(metricContainer);
    });

    // Adjust layout based on the aspect ratio and number of fields
    const aspectRatio = containerWidth / containerHeight;
    const itemsPerRow = Math.round(Math.sqrt(fields.length * aspectRatio));
    container.style.display = 'grid';
    container.style.gridTemplateColumns = `repeat(${itemsPerRow}, 1fr)`;
    container.style.gridGap = '10px';

    done();
  }
});
