updateAsync: function (data, element, config, queryResponse, details, done) {
  const container = element.querySelector('.viz-container');
  container.innerHTML = '';
  container.style.alignContent = 'space-evenly';

  // Ensure dynamic options are updated
  this.updateDynamicOptions(queryResponse);

  const fields = queryResponse.fields.dimension_like.concat(queryResponse.fields.measure_like);

  // Check if all field values are either null or empty
  const allNullOrEmpty = fields.every(field => {
    const value = data[0][field.name].value;
    return value === null || value === '';
  });

  if (allNullOrEmpty) {
    done();
    return;
  }

  const containerWidth = element.clientWidth;
  const containerHeight = element.clientHeight;
  const containerArea = containerHeight * containerWidth;

  const numMetrics = fields.length;
  const metricArea = containerArea / numMetrics;

  // Calculate the estimated width and height per metric container
  const metricMinWidth = Math.sqrt(metricArea); // An estimated min width for each metric
  const metricMinHeight = Math.sqrt(metricArea); // An estimated min height for each metric

  // Decide the number of columns (adjusting for minimum width per metric)
  const numColumns = Math.max(1, Math.floor(containerWidth / metricMinWidth));
  const numRows = Math.ceil(numMetrics / numColumns);

  // Calculate width and height for each metric container
  const metricWidth = (containerWidth / numColumns) * 0.9;
  const metricHeight = (containerHeight / numRows) * 0.9;

  fields.forEach((field, metricIndex) => {
    const fieldName = field.name.replace(/\./g, '_');
    
    // Ensure metric colors default to master color if unspecified
    const metricColor = config[`metric_color_${fieldName}`] || config.master_color;

    const fieldLabel = config[`metric_label_${fieldName}`] || field.label_short || field.label;
    const fieldValue = data[0][field.name].rendered || data[0][field.name].value || '∅';
    const iconURL = config[`icon_url_${fieldName}`] || '';
    const iconColor = this.hexToRgb(metricColor);

    const metricContainer = document.createElement('div');
    metricContainer.className = 'metric-container';
    metricContainer.style = `width: ${metricWidth}px; height: ${metricHeight}px; display: flex; flex-direction: column; align-items: center; justify-content: center;`;
    const valueFontSize = 1.5 * (config.value_scale / 100);
    const labelFontSize = 0.75 * (config.label_scale / 100);

    const valueElement = document.createElement('div');
    valueElement.className = 'metric-value';
    valueElement.innerText = fieldValue;
    valueElement.style.color = metricColor;
    valueElement.style.fontSize = `calc(${valueFontSize}rem + 1vw)`;
    valueElement.style.textAlign = 'center'; // Ensuring value element is centered

    const iconElement = document.createElement('img');
    if (iconURL) {
      iconElement.src = `${iconURL}&color=${iconColor},1`;
      iconElement.style.width = '20%';
      iconElement.style.height = '20%';
      iconElement.style.objectFit = 'contain';
    }

    const labelElement = document.createElement('div');
    labelElement.className = 'metric-label';
    labelElement.innerText = fieldLabel;
    labelElement.style.color = metricColor;
    labelElement.style.fontSize = `calc(${labelFontSize}rem + 0.5vw)`;
    labelElement.style.textAlign = 'center'; // Ensuring text is centered

    const order = config.component_order || 'value_icon_label';
    const orderedComponents = {
      value: valueElement,
      icon: iconElement,
      label: config[`metric_show_label_${fieldName}`] ? labelElement : null // Conditionally include label
    };
    order.split('_').forEach(component => {
      if (orderedComponents[component]) {
        metricContainer.appendChild(orderedComponents[component]);
      }
    });

    container.appendChild(metricContainer);
  });

  container.style.display = 'flex';
  container.style.flexWrap = 'wrap';
  container.style.justifyContent = 'center'; // Ensures even spacing
  container.style.alignItems = 'center';
  container.style.height = '100%';

  done();
}
