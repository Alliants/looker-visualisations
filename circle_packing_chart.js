looker.plugins.visualizations.add({
  options: {
    decimal_places: {
      type: 'number',
      label: 'Decimal Places for Percentages',
      default: 2,
      order: 1
    },
    big_circle_color: {
      type: 'string',
      label: 'Big Circle Color',
      default: '#4D6EBF',
      display: 'color',
      order: 2
    },
    big_circle_font_color: {
      type: 'string',
      label: 'Big Circle Font Color',
      default: '#FFFFFF',
      display: 'color',
      order: 3
    },
    small_circle_color: {
      type: 'string',
      label: 'Small Circle Color',
      default: '#EAEAEA',
      display: 'color',
      order: 4
    },
    small_circle_font_color: {
      type: 'string',
      label: 'Small Circle Font Color',
      default: '#000000',
      display: 'color',
      order: 5
    }
  },

  create: function (element, config) {
    element.style.fontFamily = 'Lato, sans-serif';
  },

  updateDynamicOptions: function (queryResponse) {
    const numFields = queryResponse.fields.dimension_like.length + queryResponse.fields.measure_like.length;
    Object.keys(this.options).forEach((key) => {
      if (key.startsWith('metric_label_') || key.startsWith('metric_icon_')) {
        delete this.options[key];
      }
    });
    for (let i = 0; i < numFields; i++) {
      this.options[`metric_label_${i}`] = {
        type: 'string',
        label: `Label for Metric ${i + 1}`,
        default: '',
        order: 6 + i * 2
      };
      this.options[`metric_icon_${i}`] = {
        type: 'string',
        label: `Icon URL for Metric ${i + 1}`,
        default: '',
        order: 7 + i * 2
      };
    }
    this.trigger('registerOptions', this.options);
  },

  hexToRgb: function (hex) {
    hex = hex.replace('#', '');
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `${r},${g},${b}`;
  },

  updateAsync: function (data, element, config, queryResponse, details, done) {
    this.updateDynamicOptions(queryResponse);

    element.innerHTML = '';

    const fields = [...queryResponse.fields.dimension_like, ...queryResponse.fields.measure_like];
    const that = this;

    const metrics = fields.map((field, index) => {
      const value = data[0][field.name]?.value;
      const label = config[`metric_label_${index}`] || field.label_short || field.label;
      const icon = config[`metric_icon_${index}`] || '';
      return {
        label: label,
        value: isNaN(value) ? 0 : Number(value),
        icon: icon
      };
    }).filter((metric) => metric.value !== 0);

    metrics.sort((a, b) => b.value - a.value);

    if (metrics.length === 0) {
      element.innerHTML += 'No valid data is available';
      done();
      return;
    }

    const maxMetricValue = metrics[0].value;
    const bigCircleDiameter = 30; // Fixed size of 30vw

    const container = document.createElement('div');
    container.classList.add('meta-container');
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.height = '100%';
    container.style.width = '100%';

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
    container.appendChild(bigCircleContainer);

    const metricsContainer = document.createElement('div');
    metricsContainer.classList.add('metrics-container');
    metricsContainer.style.display = 'flex';
    metricsContainer.style.flexDirection = 'column';
    metricsContainer.style.justifyContent = 'space-evenly';
    metricsContainer.style.height = `${bigCircleDiameter}vw`;
    metricsContainer.style.marginLeft = '20px';

    for (let i = 1; i < metrics.length; i++) {
      const sizePercentage = (metrics[i].value / maxMetricValue) * bigCircleDiameter;
      const smallCircleIconColor = this.hexToRgb(config.small_circle_font_color);

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
      smallCircle.style.maxWidth = '25vw';
      smallCircle.style.maxHeight = '25vw';

      metricsContainer.appendChild(smallCircle);

      // Ensure the small circle element exists in the DOM
      console.log("Small circle element:", smallCircle);

      // Get computed styles
      const computedStyle = getComputedStyle(smallCircle);
      console.log("Computed style:", computedStyle);

      // Get the width in pixels directly from the computedStyle
      const widthInPx = parseFloat(computedStyle.width);
      console.log("Width in px:", widthInPx);

      // Calculate radius in pixels
      const radiusInPx = widthInPx / 2;
      console.log("Radius in px:", radiusInPx);

      // Use the radius to determine the line width
      const lineWidth = widthInPx * 1.05;
      console.log("Line width:", lineWidth);

      const lineContainer = document.createElement('div');
      lineContainer.classList.add('line-container');
      lineContainer.style.display = 'flex';
      lineContainer.style.alignItems = 'center';
      lineContainer.style.marginLeft = `-${radiusInPx}px`;

      const line = document.createElement('div');
      line.classList.add('line');
      line.style.height = '1px';
      line.style.width = `${lineWidth}px`;
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

      metricBlock.appendChild(lineContainer);
      metricBlock.appendChild(metricCallout);
      metricsContainer.appendChild(metricBlock);
    }

    container.appendChild(metricsContainer);
    element.appendChild(container);
    done();
  }
});
