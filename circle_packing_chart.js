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
    }
  },

  create: function(element, config) {
    element.style.fontFamily = `"Lato", sans-serif`;
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
        order: 6 + i * 2
      };
      this.options[`metric_icon_${i}`] = {
        type: "string",
        label: `Icon URL for Metric ${i + 1}`,
        default: "",
        order: 7 + i * 2
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

    const fields = [...queryResponse.fields.dimension_like, ...queryResponse.fields.measure_like];
    const that = this; // To avoid scope issues inside map function

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

    if (metrics.length === 0) {
      element.innerHTML += 'No valid data is available';
      done();
      return;
    }

    const total = metrics.reduce((sum, metric) => sum + metric.value, 0);
    const maxMetricValue = metrics[0].value;

    const container = document.createElement('div');
    container.classList.add('meta-container');

    // Create the big circle for the largest metric
    const bigCircleIconColor = this.hexToRgb(config.big_circle_font_color);
    const bigCircle = document.createElement('div');
    bigCircle.classList.add('big-circle');
    bigCircle.style.backgroundColor = config.big_circle_color;
    bigCircle.style.weight = '30vw';
    bigCircle.style.height = '30vh';
    bigCircle.style.borderRadius = '50%';
    bigCircle.style.display = 'flex';
    bigCircle.style.flexDirection = 'column';
    bigCircle.style.justifyContent = 'space-evenly';
    bigCircle.style.alignItems = 'center';
    bigCircle.style.fontSize = '3vw';
    bigCircle.style.padding = '2vw';
    
    bigCircle.innerHTML = `
        <div style="width: 5vw; height: 5vh;">${metrics[0].icon ? `<img class="big-circle-icon" src="${metrics[0].icon}&color=${bigCircleIconColor},1">` : ''}</div>
        <div><strong>${metrics[0].value} ${metrics[0].label}</strong></div>
        <div style="font-size: 2.5vw;">${((metrics[0].value / total) * 100).toFixed(config.decimal_places)}%</div>
    `;

    const bigCircleContainer = document.createElement('div');
    bigCircleContainer.classList.add('big-circle-container');
    bigCircleContainer.style.display = 'flex';
    bigCircleContainer.style.flexDirection = 'column';
    bigCircleContainer.style.justifyContent = 'center';
    bigCircleContainer.style.alignItems = 'center';
    bigCircleContainer.appendChild(bigCircle);
    container.appendChild(bigCircleContainer);

    const metricsContainer = document.createElement('div');
    metricsContainer.classList.add('metrics-container');
    metricsContainer.style.display = 'flex';
    metricsContainer.style.flexDirection = 'column';
    metricsContainer.style.justifyContent = 'space-evenly';
    metricsContainer.style.height = '30vw'; // Match height with big circle
    metricsContainer.style.marginLeft = '20px';

    for (let i = 1; i < metrics.length; i++) {
      const sizePercentage = (metrics[i].value / maxMetricValue) * 30; // Relative to 30vw of the big circle
      const fontSizePercentage = sizePercentage * 0.3;
      const smallCircleIconColor = this.hexToRgb(config.small_circle_font_color);

      // Create small circles for the rest of the metrics
      const smallCircle = document.createElement('div');
      smallCircle.classList.add('small-circle');
      smallCircle.style.width = `${sizePercentage}vw`;
      smallCircle.style.height = `${sizePercentage}vw`;
      smallCircle.style.fontSize = `${fontSizePercentage}vw`;
      smallCircle.style.backgroundColor = config.small_circle_color;
      smallCircle.style.color = config.small_circle_font_color;
      smallCircle.style.display = 'flex';
      smallCircle.style.justifyContent = 'center';
      smallCircle.style.alignItems = 'center';
      smallCircle.style.borderRadius = '50%';
      smallCircle.textContent = metrics[i].value;

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
      label.textContent = `${metrics[i].label} ${((metrics[i].value / total) * 100).toFixed(config.decimal_places)}%`;

      metricName.appendChild(label);
      metricCallout.appendChild(metricName);
      smallCircle.appendChild(metricCallout);
      metricsContainer.appendChild(smallCircle);
    }

    container.appendChild(metricsContainer);
    element.appendChild(container);
    done();
  }
});
