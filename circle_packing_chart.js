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
    small_circle_color: {
      type: "string",
      label: "Small Circle Color",
      default: "#EAEAEA",
      display: "color",
      order: 3
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
        order: 4 + i * 2
      };
      this.options[`metric_icon_${i}`] = {
        type: "string",
        label: `Icon URL for Metric ${i + 1}`,
        default: "",
        order: 5 + i * 2
      };
    }
    this.trigger('registerOptions', this.options);
  },

  updateAsync: function(data, element, config, queryResponse, details, done) {
    // Update dynamic options
    this.updateDynamicOptions(queryResponse);

    const styleContent = `
      <style>
        .big-circle {
          display: flex;
          justify-content: center;
          align-items: center;
          border-radius: 50%;
          width: 30vw;
          height: 30vw;
          color: white;
          text-align: center;
        }
        .big-circle-icon {
          max-width: 10vw;
          max-height: 10vw;
          margin-bottom: 10px;
        }
        .metric-block {
          display: flex;
          align-items: center;
          margin-top: 10px;
        }
        .small-circle {
          display: flex;
          justify-content: center;
          align-items: center;
          border-radius: 50%;
          color: white;
          margin-right: 10px;
        }
        .metric-callout {
          display: flex;
          align-items: center;
          margin-left: 10px;
        }
        .metric-name, .metric-percentage {
          margin-left: 5px;
          color: grey;
        }
        .small-circle-icon {
          max-width: 3vw; 
          max-height: 3vh; 
          padding-right: 0.5vw;
        }
      </style>
    `;

    // Clear the content
    element.innerHTML = styleContent;

    const fields = [...queryResponse.fields.dimension_like, ...queryResponse.fields.measure_like];

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

    const bigCircleContent = `
      <div class="big-circle" style="background-color: ${config.big_circle_color};">
        ${metrics[0].icon ? `<img class="big-circle-icon" src="${metrics[0].icon}">` : ''}
        <div><strong>${metrics[0].value} ${metrics[0].label}</strong></div>
        <div style="font-size: 2.5vw;">${((metrics[0].value / total) * 100).toFixed(config.decimal_places)}%</div>
      </div>
    `;

    const bigCircleContainer = document.createElement('div');
    bigCircleContainer.classList.add('big-circle-container');
    bigCircleContainer.innerHTML = bigCircleContent;
    container.appendChild(bigCircleContainer);

    for (let i = 1; i < metrics.length; i++) {
      const sizePercentage = (metrics[i].value / maxMetricValue) * 30; // Relative to 30vw of the big circle
      const fontSizePercentage = sizePercentage * 0.3;

      const calloutContent = `
        <div class="metric-block" style="flex-direction:column; align-items:center;">
          <div class="small-circle" style="width: ${sizePercentage}vw; height: ${sizePercentage}vw; font-size: ${fontSizePercentage}vw; background-color: ${config.small_circle_color};">
            ${metrics[i].value}
          </div>
          <div class="metric-callout" style="margin-left:0; flex-direction:column; align-items:center;">
            ${metrics[i].icon ? `<img class="small-circle-icon" src="${metrics[i].icon}">` : ''}
            <div class="metric-name">${metrics[i].label}</div>
            <div class="metric-percentage">${((metrics[i].value / total) * 100).toFixed(config.decimal_places)}%</div>
          </div>
        </div>
      `;
      const calloutContainer = document.createElement('div');
      calloutContainer.classList.add('metric-block');
      calloutContainer.innerHTML = calloutContent;
      container.appendChild(calloutContainer);
    }

    element.appendChild(container);
    done();
  }
});
