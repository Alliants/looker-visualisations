looker.plugins.visualizations.add({
  id: 'dynamic_layout_viz',
  label: 'Dynamic Layout Viz',
  options: {
    title: {
      type: 'string',
      label: 'Default Title',
      display: 'text',
      default: '',
    }
  },
  create: function (element, config) {
    element.innerHTML = `
      <style>
        .viz-container, .viz-element {
          display: flex;
          flex-wrap: wrap;
          max-width: 100%;
          margin: 5px;
          text-align: center;
        }
        .viz-element {
          border: 1px solid #ccc;
          padding: 10px;
          box-sizing: border-box;
          flex-grow: 1;
        }
        .viz-title {
          font-size: 14px;
          margin: 5px 0;
        }
        .viz-value {
          font-size: 20px;
        }
      </style>
      <div class="viz-container"></div>
    `;
  },
  updateAsync: function (data, element, config, queryResponse, details, done) {
    // Check for valid data and structure
    if (!data || data.length === 0) {
      return;
    }

    const vizContainer = element.querySelector('.viz-container');
    vizContainer.innerHTML = '';

    const dimensions = queryResponse.fields.dimension_like;
    const measures = queryResponse.fields.measure_like;
    const items = [...dimensions, ...measures];

    const containerWidth = vizContainer.clientWidth;
    const containerHeight = vizContainer.clientHeight;

    const itemCount = items.length;
    const itemWidth = Math.floor(containerWidth / Math.sqrt(itemCount));
    const itemHeight = Math.floor(containerHeight / Math.sqrt(itemCount));
    
    items.forEach(field => {
      const fieldName = field.name;
      const fieldLabel = config[fieldName + '_title'] || field.label_short || field.label;
      const fieldValue = data[0][fieldName].rendered || data[0][fieldName].value;

      const vizElement = document.createElement('div');
      vizElement.className = 'viz-element';
      vizElement.style.width = `${itemWidth}px`;
      vizElement.style.height = `${itemHeight}px`;

      const titleElement = document.createElement('div');
      titleElement.className = 'viz-title';
      titleElement.innerText = fieldLabel;

      const valueElement = document.createElement('div');
      valueElement.className = 'viz-value';
      valueElement.innerHTML = fieldValue;

      vizElement.appendChild(valueElement);
      vizElement.appendChild(titleElement);
      vizContainer.appendChild(vizElement);
    });

    done();
  },
});
