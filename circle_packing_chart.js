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
    big_circle_label: {
      type: "string",
      label: "Big Circle Label",
      default: "",
      order: 4
    },
    big_circle_icon: {
      type: "string",
      label: "Big Circle Icon URL",
      default: "",
      order: 5
    },
    small_circle_color: {
      type: "string",
      label: "Small Circle Color",
      default: "#EAEAEA",
      display: "color",
      order: 6
    },
    small_circle_font_color: {
      type: "string",
      label: "Small Circle Font Color",
      default: "#000000",
      display: "color",
      order: 7
    }
  },

  create: function (element, config) {
    element.innerHTML = '<div class="viz-container"></div>';
    element.style.fontFamily = 'Lato, sans-serif';

    const styleTag = document.createElement('style');
    styleTag.textContent = `
      .viz-container {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        height: 100%;
        width: 100%;
        position: relative;
      }
      .big-circle-container {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        width: 40%;
        height: 100%;
      }
      .big-circle {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        color: ${config.big_circle_font_color};
        font-size: 2rem;
        padding: 2vw;
        box-sizing: border-box;
        text-align: center;
        background-color: ${config.big_circle_color};
      }
      .big-circle-label {
        font-size: 1.5rem;
        margin-top: 0.5rem;
      }
      .big-circle-icon {
        width: 50px;
        height: 50px;
        margin-bottom: 0.5rem;
      }
      .small-circles-container {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-wrap: wrap;
        width: 60%;
        height: 100%;
      }
      .small-circle {
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
        text-align: center;
      }
      .callout-line {
        position: absolute;
        border: 1px solid ${config.small_circle_font_color};
      }
      .callout-label {
        position: absolute;
        background: white;
        padding: 2px 5px;
        border-radius: 3px;
        font-size: 0.75rem;
      }
    `;
    document.head.appendChild(styleTag);
  },

  updateAsync: function (data, element, config, queryResponse, details, done) {
    const container = element.querySelector('.viz-container');
    if (!container) return;

    container.innerHTML = '';

    const measure = queryResponse.fields.measure_like[0];
    const dimension = queryResponse.fields.dimension_like[0];

    if (!measure && !dimension) {
      container.innerHTML = 'This chart requires at least one measure or dimension.';
      done();
      return;
    }

    // Sort data by measure value to identify the largest and the rest
    data = data.sort((a, b) => {
      const aValue = measure ? a[measure.name].value : 1;
      const bValue = measure ? b[measure.name].value : 1;
      return bValue - aValue;
    });

    const largest = data[0];
    const rest = data.slice(1);

    // Calculate total for reference
    const total = data.reduce((acc, row) => acc + (measure ? row[measure.name].value : 1), 0);
    const largestValue = measure ? largest[measure.name].value : 1;

    const bigCircleContainer = document.createElement('div');
    bigCircleContainer.className = 'big-circle-container';

    const bigCircle = document.createElement('div');
    bigCircle.className = 'big-circle';

    const bigCircleIcon = document.createElement('img');
    if (config.big_circle_icon) {
      bigCircleIcon.className = 'big-circle-icon';
      bigCircleIcon.src = config.big_circle_icon;
      bigCircle.appendChild(bigCircleIcon);
    }

    const bigCircleLabel = document.createElement('div');
    bigCircleLabel.className = 'big-circle-label';
    bigCircleLabel.innerText = config.big_circle_label || (dimension ? largest[dimension.name].value : 'Total');
    bigCircle.appendChild(bigCircleLabel);

    const bigCircleValue = document.createElement('div');
    bigCircleValue.innerText = largestValue.toFixed(config.decimal_places);
    bigCircle.appendChild(bigCircleValue);

    bigCircleContainer.appendChild(bigCircle);
    container.appendChild(bigCircleContainer);

    const smallCirclesContainer = document.createElement('div');
    smallCirclesContainer.className = 'small-circles-container';

    rest.forEach(row => {
      const value = measure ? row[measure.name].value : 1;
      const label = dimension ? row[dimension.name].value : `Item ${data.indexOf(row) + 1}`;
      const percentage = value / largestValue;
      const smallCircleDiameter = percentage * 40; // Diameter as a percentage of the big circle (40vw)

      const smallCircle = document.createElement('div');
      smallCircle.className = 'small-circle';
      smallCircle.style.width = `${smallCircleDiameter}vw`;
      smallCircle.style.height = `${smallCircleDiameter}vw`;
      smallCircle.style.color = config.small_circle_font_color;
      smallCircle.style.backgroundColor = config.small_circle_color;

      const smallCircleValue = document.createElement('div');
      smallCircleValue.innerText = value.toFixed(config.decimal_places);

      const smallCircleCalloutLabel = document.createElement('div');
      smallCircleCalloutLabel.className = 'callout-label';
      smallCircleCalloutLabel.innerText = label;

      const smallCircleIcon = document.createElement('img');
      smallCircleIcon.className = 'small-circle-icon';
      smallCircleIcon.src = row.icon || '';

      smallCircle.appendChild(smallCircleIcon);
      smallCircle.appendChild(smallCircleValue);
      smallCircle.appendChild(smallCircleCalloutLabel);
      smallCirclesContainer.appendChild(smallCircle);

      const calloutLine = document.createElement('div');
      calloutLine.className = 'callout-line';
      calloutLine.style.top = '50%';
      calloutLine.style.left = `${50 + (percentage * 20)}%`;
      calloutLine.style.width = '2px';
      calloutLine.style.height = '20px';
      smallCircle.appendChild(calloutLine);
    });

    container.appendChild(smallCirclesContainer);

    done();
  }
});
