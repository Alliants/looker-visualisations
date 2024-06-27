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
      }
      .big-circle-container {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        min-width: 30vw;
        min-height: 30vw;
      }
      .big-circle {
        width: 30vw;
        height: 30vw;
        border-radius: 50%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        color: ${config.big_circle_font_color};
        flex-shrink: 0;
        font-size: 4vw;
        padding: 2vw;
        box-sizing: border-box;
        text-align: center;
        background-color: ${config.big_circle_color};
      }
      .big-circle-icon {
        max-width: 12vw; 
        max-height: 12vh; 
        padding-bottom: 0.5vw;
      }
      .small-circle {
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-shrink: 0;
        color: ${config.small_circle_font_color};
        background-color: ${config.small_circle_color};
      }
      .metrics-container {
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;
        height: 30vw;
        margin-left: 20px;
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
      .metric-name, .metric-percentage {
        margin-left: 5px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .small-circle-icon {
        max-width: 8vw;
        max-height: 8vh;
        padding-right: 0.5vw;
        align-self: center;
        vertical-align: middle;
      }
    `;
    document.head.appendChild(styleTag);
  },

  updateAsync: function (data, element, config, queryResponse, details, done) {
    const container = element.querySelector('.viz-container');
    if (!container) return;

    container.innerHTML = '';
    container.className = 'meta-container';

    const bigCircleContainer = document.createElement('div');
    bigCircleContainer.className = 'big-circle-container';

    const bigCircle = document.createElement('div');
    bigCircle.className = 'big-circle';

    const measure = queryResponse.fields.measure_like.length ? queryResponse.fields.measure_like[0] : null;
    const dimension = queryResponse.fields.dimension_like.length ? queryResponse.fields.dimension_like[0] : null;

    if (!measure && !dimension) {
      container.innerHTML = 'This chart requires at least one measure or dimension.';
      done();
      return;
    }

    const total = data.reduce((acc, row) => acc + (measure ? row[measure.name].value : 1), 0);

    const bigCircleText = document.createElement('div');
    bigCircleText.innerText = total.toFixed(config.decimal_places);

    const bigCircleIcon = document.createElement('img');
    if (bigCircle.icon) {
      bigCircleIcon.src = `${bigCircle.icon}&color=${config.big_circle_font_color},1`;
      bigCircleIcon.className = 'big-circle-icon';
    }

    bigCircle.appendChild(bigCircleIcon);
    bigCircle.appendChild(bigCircleText);
    bigCircleContainer.appendChild(bigCircle);

    const metricsContainer = document.createElement('div');
    metricsContainer.className = 'metrics-container';

    data.forEach(row => {
      const value = measure ? row[measure.name].value : 1;
      const label = dimension ? row[dimension.name].value : `Item ${data.indexOf(row) + 1}`;

      const metricBlock = document.createElement('div');
      metricBlock.className = 'metric-block';

      const smallCircle = document.createElement('div');
      smallCircle.className = 'small-circle';
      smallCircle.style.width = `${value / total * 30}vw`;
      smallCircle.style.height = `${value / total * 30}vw`;
      smallCircle.style.fontSize = `${value / total * 10}vw`;
      smallCircle.innerText = value;

      const metricCallout = document.createElement('div');
      metricCallout.className = 'metric-callout';

      const metricName = document.createElement('div');
      metricName.className = 'metric-name';
      metricName.innerText = `${label} ${((value / total) * 100).toFixed(config.decimal_places)}%`;

      const smallCircleIcon = document.createElement('img');
      if (smallCircle.icon) {
        smallCircleIcon.className = 'small-circle-icon';
        smallCircleIcon.src = `${smallCircle.icon}&color=${config.small_circle_font_color},1`;
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
