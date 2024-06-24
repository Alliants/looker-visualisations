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
        this.options[`metric_color_${i}`] = {
          type: "string",
          label: `Font color for Metric ${i + 1}`,
          default: "#000000",
          order: 5 + i * 2
        };
        this.options[`metric_icon_${i}`] = {
          type: "string",
          label: `Icon URL for Metric ${i + 1}`,
          default: "",
          order: 6 + i * 2
        };
      }
      this.trigger('registerOptions', this.options);
    },
  
    updateAsync: function(data, element, config, queryResponse, details, done) {
      // Update dynamic options
      this.updateDynamicOptions(queryResponse);
  
      // Remove any existing content
      element.innerHTML = '';
  
      const styles = `
        <style>
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
          min-width: 30vw; /* Fixed size for big circle container */
          min-height: 30vw; /* Fixed size for big circle container */
        }
        .big-circle {
          width: 30vw; /* Fixed size for big circle */
          height: 30vw; /* Fixed size for big circle */
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          justify-content: space-evenly;
          align-items: center;
          flex-shrink: 0;
          font-size: 3vw;
          padding: 2vw; /* Add padding here to prevent text from touching edges */
          box-sizing: border-box; /* Ensure padding is included in the size */
        }
        .big-circle-icon {
          max-width: 8vw; 
          max-height: 8vh; 
          padding-bottom: 0.5vw;
        }
        .small-circle {
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          flex-shrink: 0;
        }
        .metrics-container {
          display: flex;
          flex-direction: column;
          justify-content: space-evenly;
          height: 30vw; /* Match height with big circle */
          margin-left: 20px;
        }
        .metric-block {
          display: flex;
          align-items: center;
          font-size: 2.5vw;
        }
        .metric-callout {
          display: flex;
          align-items: center;
          margin-left: 10px;
        }
        .metric-name, .metric-percentage {
          margin-left: 5px;
          color: grey;
          display: flex;
        }
        .small-circle-icon {
          max-width: 5vw; 
          max-height: 5vh; 
          padding-right: 0.5vw;
          align-self: center;
          vertical-align: middle;
        }
      </style>
      `;
      element.innerHTML += styles;
  
      const fields = [...queryResponse.fields.dimension_like, ...queryResponse.fields.measure_like];
  
      const metrics = fields.map((field, index) => {
        const value = data[0][field.name]?.value;
        const label = config[`metric_label_${index}`] || field.label_short || field.label;
        const color = config[`metric_color_${index}`];
        const icon = config[`metric_icon_${index}`] || "";
        return {
          label: label,
          value: isNaN(value) ? 0 : Number(value),
          color: color,
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
        <div class="big-circle" style="background-color: ${config.big_circle_color}; style="background-color: ${metrics[0].color};">
          <div>${metrics[0].icon ? `<img class="big-circle-icon" src="${metrics[0].icon}&color=255,255,255,1">` : ''}</div>
          <div><strong>${metrics[0].value} ${metrics[0].label}</strong></div>
          <div style="font-size: 2.5vw;">${((metrics[0].value / total) * 100).toFixed(config.decimal_places)}%</div>
        </div>
      `;
  
      const bigCircleContainer = document.createElement('div');
      bigCircleContainer.classList.add('big-circle-container');
      bigCircleContainer.innerHTML = bigCircleContent;
      container.appendChild(bigCircleContainer);
  
      const metricsContainer = document.createElement('div');
      metricsContainer.classList.add('metrics-container');
  
      for (let i = 1; i < metrics.length; i++) {
        const sizePercentage = (metrics[i].value / maxMetricValue) * 30; // Relative to 30vw of the big circle
        const fontSizePercentage = sizePercentage * 0.3;
  
        const calloutContent = `
          <div class="metric-block">
            <div class="small-circle" style="width: ${sizePercentage}vw; height: ${sizePercentage}vw; font-size: ${fontSizePercentage}vw; background-color: ${config.small_circle_color}; style="background-color: ${metrics[i].color};">
              ${metrics[i].value}
            </div>
            <div class="metric-callout">
              <div class="metric-name">
                ${metrics[i].icon ? `<img class="small-circle-icon" src="${metrics[i].icon}">` : ''} ${metrics[i].label} ${((metrics[i].value / total) * 100).toFixed(config.decimal_places)}%
              </div>
          </div>
        `;
        const calloutContainer = document.createElement('div');
        calloutContainer.classList.add('metric-block');
        calloutContainer.innerHTML = calloutContent;
        metricsContainer.appendChild(calloutContainer);
      }
  
      container.appendChild(metricsContainer);
      element.appendChild(container);
      done();
    }
  });
