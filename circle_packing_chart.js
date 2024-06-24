// Include custom styles
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
  }
  .big-circle {
    background-color: #4D6EBF;
    width: 30vw;
    height: 30vw;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    flex-shrink: 0;
  }
  .big-circle div {
    text-align: center;
  }
  .metrics-container {
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    height: 30vw; /* This ensures the height matches the big circle */
    margin-left: 20px;
  }
  .metric-block {
    display: flex;
    align-items: center;
    margin-bottom: 5px;
  }
  .small-circle {
    background-color: #EAEAEA;
    width: 5vw;
    height: 5vw;
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
    font-size: 1.5vw;
  }
  .metric-name {
    margin-left: 5px;
  }
  .metric-percentage {
    margin-left: 5px;
    color: grey;
  }
</style>
`;

looker.plugins.visualizations.add({
  create: function (element, config) {
    element.style.fontFamily = `"Open Sans", "Helvetica", sans-serif`;
    element.innerHTML = styles;
  },
  updateAsync: function (data, element, config, queryResponse, details, done) {
    element.innerHTML = ''; // Clear any existing content
    element.innerHTML += styles;

    const fields = [...queryResponse.fields.dimension_like, ...queryResponse.fields.measure_like];

    // Dynamically extract metric names and values
    const metrics = fields.map((field) => {
      const value = data[0][field.name]?.value;
      return {
        label: field.label_short || field.label,
        value: isNaN(value) ? 0 : Number(value)
      };
    }).filter(metric => metric.value !== 0); // Eliminate zero values

    // Sort metrics based on the value in descending order
    metrics.sort((a, b) => b.value - a.value);

    // Ensure there are enough metrics
    if (metrics.length === 0) {
      element.innerHTML += 'No valid data available';
      done();
      return;
    }

    // Calculate the total sum of metrics
    const total = metrics.reduce((sum, metric) => sum + metric.value, 0);

    const container = document.createElement('div');
    container.classList.add('meta-container');

    // Creating the big circle for the highest metric
    const bigCircleContent = `
      <div class="big-circle">
        ${metrics[0].value}
        <div>${metrics[0].label}</div>
        <div>${((metrics[0].value / total) * 100).toFixed(2)}%</div>
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
      const calloutContent = `
        <div class="metric-block">
          <div class="small-circle">
            ${metrics[i].value}
          </div>
          <div class="metric-callout">
            <div class="metric-name">${metrics[i].label}</div>
            <div class="metric-percentage">${((metrics[i].value / total) * 100).toFixed(2)}%</div>
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
