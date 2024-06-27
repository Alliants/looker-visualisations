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
    const that = this;

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

    const metricsContainer = document.createElement('div');
    metricsContainer.classList.add('metrics-container');
    metricsContainer.style.display = 'flex';
    metricsContainer.style.flexDirection = 'column';
    metricsContainer.style.justifyContent = 'space-evenly';
    metricsContainer.style.height = '30vw';
    metricsContainer.style.marginLeft = '20px';

    metrics.forEach((metric, i) => {
      const sizePercentage = (metric.value / maxMetricValue) * 100; // Example calculation
      const fontSizePercentage = (Math.min(metric.value, maxMetricValue) / maxMetricValue) * 10; // Example calculation

      const metricBlock = document.createElement('div');
      metricBlock.classList.add('metric-block');

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
      smallCircle.textContent = metric.value;

      metricBlock.appendChild(smallCircle);

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

      if (metric.icon) {
        const icon = document.createElement('img');
        icon.classList.add('small-circle-icon');
        icon.style.maxWidth = '8vw';
        icon.style.maxHeight = '8vh';
        icon.style.paddingRight = '0.5vw';
        icon.style.alignSelf = 'center';
        icon.style.verticalAlign = 'middle';
        icon.src = `${metric.icon}&color=${this.hexToRgb(config.small_circle_font_color)},1`;
        metricName.appendChild(icon);
      }

      const label = document.createElement('span');
      label.textContent = `${metric.label} ${((metric.value / total) * 100).toFixed(config.decimal_places)}%`;

      metricName.appendChild(label);
      metricCallout.appendChild(metricName);
      metricBlock.appendChild(metricCallout);
      metricsContainer.appendChild(metricBlock);
    });

    container.appendChild(metricsContainer);
    element.appendChild(container);
    done();
  }
});
