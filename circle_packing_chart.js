// Include custom styles
const styles = `
<style>
  .meta-container {
    display: flex;
    align-items: center;
    height: 100%;
    width: 100%;
    box-sizing: border-box;
    font-family: Lato, sans-serif;
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
    color: white;
    flex-shrink: 0;
    font-size: 3vw;
    padding: 2vw; /* Add padding here to prevent text from touching edges */
    box-sizing: border-box; /* Ensure padding is included in the size */
  }
  .big-circle div {
    text-align: center;
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
  }
  .small-circle {
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    color: black;
    flex-shrink: 0;
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
</style>
`;

looker.plugins.visualizations.add({
  create: function(element, config) {
    element.style.fontFamily = `"Open Sans", "Helvetica", sans-serif`;
    element.innerHTML = styles;
  },
  updateAsync: function(data, element, config, queryResponse, details, done) {
    element.innerHTML = ''; // Clear any existing content
    element.innerHTML += styles;

    // Add UI Configuration options
    this.addedConfig = false;
    this.addConfig = function() {
      if (this.addedConfig) return;
      this.addedConfig = true;
      
      looker.visualizations.build({
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
        }
      });

      queryResponse.fields.dimension_like.concat(queryResponse.fields.measure_like).forEach((field, index) => {
        looker.visualizations.build({
          options: {
            [`metric_label_${index}`]: {
              type: "string",
              label: `Metric Label ${index + 1}`,
              default: "",
              placeholder: field.label_short || field.label,
              order: 4 + index * 2
            },
            [`metric_icon_${index}`]: {
              type: "string",
              label: `Metric Icon URL ${index + 1}`,
              default: "",
              placeholder: "https://example.com/icon.png",
              order: 5 + index * 2
            }
          }
        });
      });
    };

    this.addConfig();
    
    const fields = [...queryResponse.fields.dimension_like, ...queryResponse.fields.measure_like];

    // Dynamically extract metric names and values
    const metrics = fields.map((field, index) => {
      const value = data[0][field.name]?.value;
      const label = config[`metric_label_${index}`] || field.label_short || field.label;
      const icon = config[`metric_icon_${index}`] || "";
      return {
        label: label,
        value: isNaN(value) ? 0 : Number(value),
        icon: icon
      };
    }).filter(metric => metric.value !== 0); // Eliminate zero values

    // Sort metrics based on the value in descending order
    metrics.sort((a, b) => b.value - a.value);

    // Ensure there are enough metrics
    if (metrics.length === 0) {
      element.innerHTML += 'No valid data is available';
      done();
      return;
    }

    // Calculate the total sum of metrics
    const total = metrics.reduce((sum, metric) => sum + metric.value, 0);
    const maxMetricValue = metrics[0].value;

    const container = document.createElement('div');
    container.classList.add('meta-container');

    // Creating the big circle for the highest metric
    const bigCircleContent = `
      <div class="big-circle" style="background-color: ${config.big_circle_color || '#4D6EBF'};">
        <img src="${metrics[0].icon}" style="max-width: 6vw; max-height: 6vh; padding-bottom: 0.5vw;">
        <div><strong>${metrics[0].value} ${metrics[0].label}</strong></div>
        <div style="font-size: 2.5vw;">${((metrics[0].value / total) * 100).toFixed(config.decimal_places || 2)}%</div>
      </div>
    `;

    const bigCircleContainer = document.createElement('div');
    bigCircleContainer.classList.add('big-circle-container');
    bigCircleContainer.innerHTML = bigCircleContent;
    container.appendChild(bigCircleContainer);

    // Creating the callouts for the remaining metrics
    const metricsContainer = document.createElement('div');
    metricsContainer.classList.add('metrics-container');

    for (let i = 1; i < metrics.length; i++) {
      // Calculate the size based on the percentage of the biggest metric
      const sizePercentage = (metrics[i].value / maxMetricValue) * 30; // Relative to 30vw of the big circle
      const fontSizePercentage = sizePercentage * 0.3; // Adjust this value as needed for readability

      const calloutContent = `
        <div class="metric-block" style="font-size: ${fontSizePercentage}vw;">
          <div class="small-circle" style="width: ${sizePercentage}vw; height: ${sizePercentage}vw; font-size: ${fontSizePercentage}vw; background-color: ${config.small_circle_color || '#EAEAEA'};">
            ${metrics[i].value}
          </div>
          <div class="metric-callout">
            <img src="${metrics[i].icon}" style="max-width: 3vw; max-height: 3vh; padding-right: 0.5vw;">
            <div class="metric-name">${metrics[i].label}</div>
            <div class="metric-percentage">${((metrics[i].value / total) * 100).toFixed(config.decimal_places || 2)}%</div>
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
