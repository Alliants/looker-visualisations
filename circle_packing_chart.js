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
      .viz-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        width: 100%;
        position: relative;
      }
      .big-circle-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        position: relative;
      }
      .big-circle {
        border-radius: 50%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: ${config.big_circle_font_color};
        background-color: ${config.big_circle_color};
        position: relative;
        text-align: center;
      }
      .big-circle-icon {
        max-width: 20%;
        max-height: 20%;
        padding-bottom: 0.5vw;
      }
      .small-circle {
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: ${config.small_circle_font_color};
        background-color: ${config.small_circle_color};
        position: absolute;
        text-align: center;
      }
      .metric-callout {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1vw;
        padding: 0.5vw;
      }
      .metric-name {
        margin-left: 0.5vw;
      }
      .small-circle-icon {
        max-width: 20%;
        max-height: 20%;
      }
      .metric-container {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        position: relative;
      }
    `;
    document.head.appendChild(styleTag);
  },

  updateAsync: function (data, element, config, queryResponse, details, done) {
    const container = element.querySelector('.viz-container');
    container.innerHTML = '';
    
    const total = data.reduce((acc, row) => acc + row[queryResponse.fields.measure_like[0].name].value, 0);

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const containerArea = containerWidth * containerHeight;

    // Big Circle Configurations
    const bigCircleArea = containerArea * 0.5;
    const bigCircleDiameter = Math.sqrt((bigCircleArea * 4) / Math.PI);
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
    bigCircleIcon.className = 'big-circle-icon';
    
    if (data[0].icon) {
      bigCircleIcon.src = `${data[0].icon}&color=${config.big_circle_font_color},1`;
    }

    const bigCircleText = document.createElement('div');
    bigCircleText.innerText = total.toFixed(config.decimal_places);

    bigCircle.appendChild(bigCircleIcon);
    bigCircle.appendChild(bigCircleText);
    bigCircleContainer.appendChild(bigCircle);
    container.appendChild(bigCircleContainer);

    // Small Circles Configuration
    const metricsContainer = document.createElement('div');
    metricsContainer.className = 'metric-container';
    metricsContainer.style.width = `${containerWidth * 0.8}px`;
    container.appendChild(metricsContainer);

    data.forEach((row, index) => {
      if (index === 0) return;

      const measure = queryResponse.fields.measure_like[0];
      const value = row[measure.name].value;
      const label = row[queryResponse.fields.dimension_like[0].name].value;
      const percentage = value / total;
      const smallCircleArea = bigCircleArea * percentage;
      const smallCircleDiameter = Math.sqrt((smallCircleArea * 4) / Math.PI);

      const smallCircle = document.createElement('div');
      smallCircle.className = 'small-circle';
      smallCircle.style.width = `${smallCircleDiameter}px`;
      smallCircle.style.height = `${smallCircleDiameter}px`;

      const smallCircleIcon = document.createElement('img');
      if (row.icon) {
        smallCircleIcon.className = 'small-circle-icon';
        smallCircleIcon.src = `${row.icon}&color=${config.small_circle_font_color},1`;
      }

      const smallCircleText = document.createElement('div');
      smallCircleText.innerText = value.toFixed(config.decimal_places);

      const metricCallout = document.createElement('div');
      metricCallout.className = 'metric-callout';

      const metricName = document.createElement('div');
      metricName.className = 'metric-name';
      metricName.innerText = `${label} ${((value / total) * 100).toFixed(config.decimal_places)}%`;

      smallCircle.appendChild(smallCircleIcon);
      smallCircle.appendChild(smallCircleText);
      metricCallout.appendChild(metricName);

      smallCircle.appendChild(metricCallout);
      metricsContainer.appendChild(smallCircle);
    });

    done();
  }
});
