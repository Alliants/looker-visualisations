looker.plugins.visualizations.add({
  id: 'circle_packing_chart_customvis',
  label: 'Circle Packing Chart',
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

  create: function (element, config) {
    element.innerHTML = '<div class="viz-container"></div>';
    element.style.fontFamily = 'Lato, sans-serif';

    const styleTag = document.createElement('style');
    styleTag.textContent = `
      .meta-container {
        display: flex;
        align-items: center;
        height: 100%;
        width: 100%;
        box-sizing: border-box;
        padding: 10px;
        justify-content: center;
      }
      .big-circle-container {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      }
      .big-circle {
        border-radius: 50%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        color: ${config.big_circle_font_color};
        background-color: ${config.big_circle_color};
        padding: 10px;
        box-sizing: border-box;
        text-align: center;
        overflow: hidden;
      }
      .big-circle-icon {
        max-width: 20%;
        max-height: 20%;
        padding-bottom: 0.5vw;
      }
      .small-circle {
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        color: ${config.small_circle_font_color};
        background-color: ${config.small_circle_color};
      }
      .metrics-container {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        flex-wrap: wrap;
        padding-left: 20px;
        box-sizing: border-box;
      }
      .metric-block {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2.5vw;
      }
      .metric-callout {
        display: flex;
        align-items: center;
        margin-left: 10px;
      }
      .metric-name {
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .small-circle-icon {
        max-width: 20%;
        max-height: 20%;
        padding-right: 0.5vw;
      }
    `;
    document.head.appendChild(styleTag);
  },

  updateAsync: function (data, element, config, queryResponse, details, done) {
    const container = element.querySelector('.viz-container');
    container.innerHTML = '';
    container.className = 'meta-container';

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const containerArea = containerWidth * containerHeight;

    const total = data.reduce((acc, row) => acc + row[queryResponse.fields.measure_like[0].name].value, 0);

    // Big Circle Calculations
    const bigCircleArea = containerArea * 0.5; // Let's allocate 50% of the container area for the big circle
    const bigCircleDiameter = Math.sqrt(bigCircleArea);
    const bigCircleRadius = bigCircleDiameter / 2;

    const bigCircleContainer = document.createElement('div');
    bigCircleContainer.className = 'big-circle-container';
    bigCircleContainer.style.width = `${bigCircleDiameter}px`;
    bigCircleContainer.style.height = `${bigCircleDiameter}px`;

    const bigCircle = document.createElement('div');
    bigCircle.className = 'big-circle';
    bigCircle.style.width = `${bigCircleDiameter}px`;
    bigCircle.style.height = `${bigCircleDiameter}px`;

    const bigCircleIcon = document.createElement('img');
    if (data[0].icon) {
      bigCircleIcon.src = `${data[0].icon}&color=${config.big_circle_font_color},1`;
      bigCircleIcon.className = 'big-circle-icon';
    }

    const bigCircleText = document.createElement('div');
    bigCircleText.innerText = total.toFixed(config.decimal_places);

    bigCircle.appendChild(bigCircleIcon);
    bigCircle.appendChild(bigCircleText);
    bigCircleContainer.appendChild(bigCircle);

    // Metrics Container for Small Circles
    const metricsContainer = document.createElement('div');
    metricsContainer.className = 'metrics-container';
    metricsContainer.style.width = `${containerWidth - bigCircleDiameter}px`;
    metricsContainer.style.height = `${bigCircleDiameter}px`;

    // Small Circle Calculations and Rendering
    data.forEach((row, index) => {
      if (index === 0) return; // Skip the first row as it's considered as the big circle.

      const measure = queryResponse.fields.measure_like[0];
      const value = row[measure.name].value;
      const percentage = value / total;
      const smallCircleArea = bigCircleArea * percentage;
      const smallCircleDiameter = Math.sqrt(smallCircleArea);
      const smallCircleRadius = smallCircleDiameter / 2;

      const metricBlock = document.createElement('div');
      metricBlock.className = 'metric-block';

      const smallCircle = document.createElement('div');
      smallCircle.className = 'small-circle';
      smallCircle.style.width = `${smallCircleDiameter}px`;
      smallCircle.style.height = `${smallCircleDiameter}px`;
      smallCircle.innerText = value;

      const metricCallout = document.createElement('div');
      metricCallout.className = 'metric-callout';

      const metricName = document.createElement('div');
      metricName.className = 'metric-name';
      metricName.innerText = `${((value / total) * 100).toFixed(config.decimal_places)}%`;

      const smallCircleIcon = document.createElement('img');
      if (row.icon) {
        smallCircleIcon.className = 'small-circle-icon';
        smallCircleIcon.src = `${row.icon}&color=${config.small_circle_font_color},1`;
      }

      metricCallout.appendChild(smallCircleIcon);
      metricCallout.appendChild(metricName);
      metricBlock.appendChild(smallCircle);
      metricBlock.appendChild(metricCallout);

      metricsContainer.appendChild(metricBlock);
    });

    container.appendChild(bigCircleContainer);
    container.appendChild(metricsContainer);
    done();
  }
});
