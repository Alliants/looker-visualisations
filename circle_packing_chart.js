// Include custom icons and styles
const styles = `
<style>
  .meta-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    box-sizing: border-box;
  }
  .persona-breakdown {
    display: flex;
    align-items: center;
    font-size: 1.5vw;
    margin-bottom: 10px;
  }
  .circle {
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 4vw;
    font-weight: bold;
    color: white;
    text-align: center;
  }
  .big-circle {
    background-color: #4D6EBF;
    width: 10vw;
    height: 10vw;
    flex-shrink: 0;
  }
  .small-circle {
    background-color: #EAEAEA;
    color: black;
    width: 5vw;
    height: 5vw;
    margin-left: 10px;
    flex-shrink: 0;
  }
  .text-content {
    display: flex;
    align-items: center;
    margin-left: 10px;
    justify-content: space-between;
    flex-grow: 1;
  }
  .metric-name {
    margin-right: 5px;
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
      <div class="circle big-circle">
        ${metrics[0].value}
        <div style="font-size: 2vw;">${metrics[0].label}</div>
        <div style="font-size: 1vw;">${((metrics[0].value / total) * 100).toFixed(2)}%</div>
      </div>
    `;

    const bigCircleContainer = document.createElement('div');
    bigCircleContainer.classList.add('persona-breakdown');
    bigCircleContainer.innerHTML = bigCircleContent;
    container.appendChild(bigCircleContainer);

    // Creating small circles for the remaining metrics
    for (let i = 1; i < metrics.length; i++) {
      const smallCircleContent = `
        <div class="circle small-circle">
          ${metrics[i].value}
        </div>
        <div class="text-content">
          <div class="metric-name">${metrics[i].label}</div>
          <div>${((metrics[i].value / total) * 100).toFixed(2)}%</div>
        </div>
      `;
      const smallCircleContainer = document.createElement('div');
      smallCircleContainer.classList.add('persona-breakdown');
      smallCircleContainer.innerHTML = smallCircleContent;
      container.appendChild(smallCircleContainer);
    }

    element.appendChild(container);
    done();
  }
});
