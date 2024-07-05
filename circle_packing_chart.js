looker.plugins.visualizations.add({
  options: {
    decimal_places: {
      type: "number",
      label: "Decimal Places for Percentages",
      default: 2,
      order: 1
    },
    big_circle_color: {
      type: "string",
      label: "Big Circle Color",
      default: "#4D6EBF",
      display: "color",
      order: 2
    },
    big_circle_font_color: {
      type: "string",
      label: "Big Circle Font Color",
      default: "#FFFFFF",
      display: "color",
      order: 3
    },
    small_circle_color: {
      type: "string",
      label: "Small Circle Color",
      default: "#EAEAEA",
      display: "color",
      order: 4
    },
    small_circle_font_color: {
      type: "string",
      label: "Small Circle Font Color",
      default: "#000000",
      display: "color",
      order: 5
    },
    no_data_message: {
      type: "string",
      label: "Text to Display When Data is Empty",
      default: "",
      order: 6
    }
  },

  create: function(element, config) {
    element.style.fontFamily = 'Lato, sans-serif';
    element.style.display = 'flex';
    element.style.justifyContent = 'center';
    element.style.alignItems = 'center';
  },

  updateDynamicOptions: function(queryResponse) {
    const numFields = queryResponse.fields.dimension_like.length + queryResponse.fields.measure_like.length;
    // Clear existing dynamic options
    Object.keys(this.options).forEach((key) => {
      if (key.startsWith("metric_label_") || key.startsWith("metric_icon_")) {
        delete this.options[key];
      }
    });
    // Add dynamic options for each metric
    for (let i = 0; i < numFields; i++) {
      this.options[`metric_label_${i}`] = {
        type: "string",
        label: `Label for Metric ${i + 1}`,
        default: "",
        order: 7 + i * 2
      };
      this.options[`metric_icon_${i}`] = {
        type: "string",
        label: `Icon URL for Metric ${i + 1}`,
        default: "",
        order: 8 + i * 2
      };
    }
    this.trigger('registerOptions', this.options);
  },

  hexToRgb: function(hex) {
    hex = hex.replace('#', '');
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `${r},${g},${b}`;
  },

  updateAsync: function(data, element, config, queryResponse, details, done) {
    // Update dynamic options
    this.updateDynamicOptions(queryResponse);

    // Remove any existing content
    element.innerHTML = '';

    if (data.length === 0) {
      // No rows returned
      done();
      return;
    }

    const fields = [...queryResponse.fields.dimension_like, ...queryResponse.fields.measure_like];

    // Check if all data is null or empty
    const allDataIsEmpty = data.every(row =>
      fields.every(field => !row[field.name]?.value)
    );

    if (allDataIsEmpty) {
      const text = config.no_data_message;
      if (text) {
        element.innerHTML = `<div>${text}</div>`;
      }
      done();
      return;
    }

    const metrics = fields.map((field, index) => {
      const value = data[0][field.name]?.value;
      const label = config[`metric_label_${index}`] || field.label_short || field.label;
      const icon = config[`metric_icon_${index}`] || "";
      return {
        label: label,
        value: isNaN(value) ? 0 : Number(value),
        icon: icon
      };
    }).filter(metric => metric.value !== 0);

    metrics.sort((a, b) => b.value - a.value);

    const maxMetricValue = metrics[0].value;
    const bigCircleDiameter = 30; // Fixed size of 30vw

    const container = document.createElement('div');
    container.classList.add('meta-container');
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.height = '100%';
    container.style.width = '100%';
    container.style.gap = '10px';

    // Create the big circle for the largest metric
    const bigCircleIconColor = this.hexToRgb(config.big_circle_font_color);
    const bigCircle = document.createElement('div');
    const strongLabel = document.createElement('strong');
    strongLabel.textContent = `${metrics[0].value} ${metrics[0].label}`;
    bigCircle.classList.add('big-circle');
    bigCircle.style.backgroundColor = config.big_circle_color;
    bigCircle.style.width = `${bigCircleDiameter}vw`;
    bigCircle.style.height = `${bigCircleDiameter}vw`;
    bigCircle.style.borderRadius = '50%';
    bigCircle.style.display = 'flex';
    bigCircle.style.flexDirection = 'column';
    bigCircle.style.justifyContent = 'space-evenly';
    bigCircle.style.alignItems = 'center';
    bigCircle.style.textAlign = 'center';
    bigCircle.style.fontSize = '5vw';
    bigCircle.style.padding = '2vw';
    bigCircle.style.color = `${config.big_circle_font_color}`;    
    const bigCircleImg = document.createElement('img');
    bigCircleImg.className = 'icon';
    bigCircleImg.src = `${metrics[0].icon}&color=${bigCircleIconColor},1`;
    bigCircleImg.style.width = '15vw';
    bigCircleImg.style.height = '15vh';
    bigCircle.appendChild(bigCircleImg);
    bigCircle.appendChild(strongLabel);
    
    const bigCircleContainer = document.createElement('div');
    bigCircleContainer.classList.add('big-circle-container');
    bigCircleContainer.style.display = 'flex';
    bigCircleContainer.style.flexDirection = 'column';
    bigCircleContainer.style.justifyContent = 'center';
    bigCircleContainer.style.alignItems = 'center';
    bigCircleContainer.appendChild(bigCircle);

    const metricsContainer = document.createElement('div');
    metricsContainer.classList.add('metrics-container');
    metricsContainer.style.display = 'flex';
    metricsContainer.style.flexDirection = 'column';
    metricsContainer.style.justifyContent = 'space-evenly';
    metricsContainer.style.gap = '10px';
    metricsContainer.style.visibility = 'hidden'; // Initially hidden

    for (let i = 1; i < metrics.length; i++) {
      const sizePercentage = (metrics[i].value / maxMetricValue) * bigCircleDiameter; // Relative to 30vw of the big circle
      const smallCircleIconColor = this.hexToRgb(config.small_circle_font_color);

      // Create small circles for the rest of the metrics
      const smallCircle = document.createElement('div');
      smallCircle.classList.add('small-circle');
      smallCircle.style.width = `${sizePercentage}vw`;
      smallCircle.style.height = `${sizePercentage}vw`;
      smallCircle.style.backgroundColor = config.small_circle_color;
      smallCircle.style.color = config.small_circle_font_color;
      smallCircle.style.display = 'flex';
      smallCircle.style.justifyContent = 'center';
      smallCircle.style.alignItems = 'center';
      smallCircle.style.borderRadius = '50%';
      smallCircle.style.maxWidth = `25vw`;
      smallCircle.style.maxHeight = `25vw`;

      const lineContainer = document.createElement('div');
      const lineOffset = sizePercentage * 0.5;
      lineContainer.classList.add('line-container');
      lineContainer.style.display = 'flex';
      lineContainer.style.alignItems = 'center';
      lineContainer.style.marginLeft = `-${lineOffset}vw`;

      const line = document.createElement('div');
      lineContainer.classList.add('line');
      line.style.height = '1px';
      line.style.width = '10vw';
      line.style.backgroundColor = 'rgb(71, 71, 71)';

      lineContainer.appendChild(line);

      const metricCallout = document.createElement('div');
      metricCallout.classList.add('metric-callout');
      metricCallout.style.display = 'flex';
      metricCallout.style.alignItems = 'center';
      metricCallout.style.marginLeft = '10px';

      const metricName = document.createElement('div');
      metricName.classList.add('metric-name');
      metricName.style.display = 'flex';
      metricName.style.alignItems = 'center';
      metricName.style.justifyContent = 'center';

      if (metrics[i].icon) {
        const icon = document.createElement('img');
        icon.classList.add('small-circle-icon');
        icon.style.maxWidth = '8vw';
        icon.style.maxHeight = '8vh';
        icon.style.paddingRight = '0.5vw';
        icon.style.alignSelf = 'center';
        icon.style.verticalAlign = 'middle';
        icon.src = `${metrics[i].icon}&color=${smallCircleIconColor},1`;
        metricName.appendChild(icon);
      }

      const label = document.createElement('span');
      label.textContent = `${metrics[i].value} ${metrics[i].label}`;

      metricName.appendChild(label);
      metricCallout.appendChild(metricName);
      metricsContainer.appendChild(metricCallout);

      const metricBlock = document.createElement('div');
      metricBlock.classList.add('metric-block');
      metricBlock.style.display = 'flex';
      metricBlock.style.alignItems = 'center';
      metricBlock.style.flexGrow = '0';
      metricBlock.style.flexShrink = '0';
      metricBlock.appendChild(smallCircle);
      metricBlock.appendChild(lineContainer);
      metricBlock.appendChild(metricCallout);
      metricsContainer.appendChild(metricBlock);
    }

    container.appendChild(bigCircleContainer);
    container.appendChild(metricsContainer);
    element.appendChild(container);

    // Measure and scale
    setTimeout(() => {
      const containerHeight = container.offsetHeight;
      const metricsHeight = metricsContainer.offsetHeight;
      const scale = Math.min(1, containerHeight / metricsHeight);

      metricsContainer.style.transform = `scale(${scale})`;
      metricsContainer.style.visibility = 'visible';

      done();
    }, 0);
  }
});
