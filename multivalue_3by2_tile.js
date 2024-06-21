looker.plugins.visualizations.add({
  id: 'dynamic_layout_viz',
  label: 'Dynamic Layout Viz',
  options: {
    title: {
      type: 'string',
      label: 'Title',
      display: 'text',
      default: '',
    },
    title_position: {
      type: 'string',
      label: 'Title Position',
      display: 'select',
      values: [
        { 'Left': 'left' },
        { 'Center': 'center' },
        { 'Right': 'right' }
      ],
      default: 'center',
    },
    master_color: {
      type: 'string',
      label: 'Master Color',
      display: 'color',
      default: '#333',
    },
    metric1_color: {
      type: 'string',
      label: 'Metric 1 Color',
      display: 'color',
      default: '#1f77b4',
    },
    metric2_color: {
      type: 'string',
      label: 'Metric 2 Color',
      display: 'color',
      default: '#ff7f0e',
    },
    // Add more metric colors as needed, up to 6
  },
  create: function (element, config) {
    element.innerHTML = `
      <style>
        .viz-container {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          align-items: center;
          text-align: center;
          padding: 10px;
          gap: 10px;
          border-radius: 8px;
          font-family: 'Lato Light', sans-serif;
          height: 100%;
          box-sizing: border-box;
        }
        .viz-title-container {
          width: 100%;
          text-align: ${config.title_position || 'center'};
          margin-bottom: 10px;
        }
        .viz-element {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 10px;
          box-sizing: border-box;
          flex: 1 1 30%;
          min-width: 120px;
        }
        .viz-title, .viz-value {
          margin: 0;
        }
      </style>
      <div class="viz-title-container"></div>
      <div class="viz-container"></div>
    `;
    element.style.height = "100%";
  },
  updateAsync: function (data, element, config, queryResponse, details, done) {
    const vizTitleContainer = element.querySelector('.viz-title-container');
    if (config.title) {
      vizTitleContainer.innerHTML = `<h2 style="text-align: ${config.title_position};">${config.title}</h2>`;
    } else {
      vizTitleContainer.innerHTML = '';
    }

    if (!data || data.length === 0) {
      done();
      return;
    }

    const vizContainer = element.querySelector('.viz-container');
    vizContainer.innerHTML = '';

    const fields = [...queryResponse.fields.dimension_like, ...queryResponse.fields.measure_like];
    const maxFields = 6;
    if (fields.length > maxFields) {
      const errorElement = document.createElement('div');
      errorElement.innerHTML = `<p style="color: red;">Error: Please limit to 6 metrics/dimensions.</p>`;
      vizContainer.appendChild(errorElement);
      done();
      return;
    }

    const items = fields.slice(0, maxFields);

    const containerHeight = element.clientHeight;
    const containerWidth = element.clientWidth;
    const minContainerSize = Math.min(containerHeight, containerWidth);
    const baseFontSize = minContainerSize / 10; 

    items.forEach((field, index) => {
      const fieldName = field.name;
      const fieldLabel = field.label_short || field.label;
      const fieldValue = data[0][fieldName].rendered || data[0][fieldName].value || '∅';

      const vizElement = document.createElement('div');
      vizElement.className = 'viz-element';
      
      const metricColor = config[`metric${index + 1}_color`] || config.master_color;

      const valueElement = document.createElement('div');
      valueElement.className = 'viz-value';
      valueElement.innerHTML = fieldValue;
      valueElement.style.fontSize = `${baseFontSize}px`;
      valueElement.style.color = metricColor;

      const titleElement = document.createElement('div');
      titleElement.className = 'viz-title';
      titleElement.innerText = fieldLabel;
      titleElement.style.fontSize = `${baseFontSize / 2.5}px`;
      titleElement.style.color = metricColor;

      vizElement.appendChild(valueElement);
      vizElement.appendChild(titleElement);
      vizContainer.appendChild(vizElement);
    });

    done();
  }
});
