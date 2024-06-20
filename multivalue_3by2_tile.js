looker.plugins.visualizations.add({
  id: 'dynamic_layout_viz',
  label: 'Dynamic Layout Viz',
  options: {
    title: {
      type: 'string',
      label: 'Default Title',
      display: 'text',
      default: 'Metrics Dashboard',
    }
  },
  create: function (element, config) {
    element.innerHTML = `
      <style>
        .viz-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 10px;
          justify-content: center;
          align-items: center;
          text-align: center;
          padding: 10px;
          box-sizing: border-box;
          font-family: 'Lato Light', sans-serif;
        }
        .viz-element {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 10px;
          box-sizing: border-box;
        }
        .viz-title {
          font-size: 1rem;
          color: #6c757d;
        }
        .viz-value {
          font-size: 2rem;
          font-weight: bold;
        }
      </style>
      <div class="viz-container"></div>
    `;
    element.style.height = "100%";
  },
  updateAsync: function (data, element, config, queryResponse, details, done) {
    if (!data || data.length === 0) {
      return;
    }

    const vizContainer = element.querySelector('.viz-container');
    vizContainer.innerHTML = '';

    const fields = [...queryResponse.fields.dimension_like, ...queryResponse.fields.measure_like];
    const maxFields = 6; // Limit to show max 6 items for compact display
    const items = fields.slice(0, maxFields);

    items.forEach((field, index) => {
      const fieldName = field.name;
      const fieldLabel = field.label_short || field.label;
      const fieldValue = data[0][fieldName].rendered || data[0][fieldName].value || '∅';

      const vizElement = document.createElement('div');
      vizElement.className = 'viz-element';

      const valueElement = document.createElement('div');
      valueElement.className = 'viz-value';
      valueElement.innerHTML = fieldValue;

      const titleElement = document.createElement('div');
      titleElement.className = 'viz-title';
      titleElement.innerText = fieldLabel;

      vizElement.appendChild(valueElement);
      vizElement.appendChild(titleElement);
      vizContainer.appendChild(vizElement);
    });

    done();
  }
});
