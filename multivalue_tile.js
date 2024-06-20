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
        .viz-container {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-around;
          align-items: stretch;
          text-align: center;
          padding: 20px;
          gap: 30px;
          border-radius: 8px;
          font-family: 'Lato Light', sans-serif;
        }
        .viz-element {
          flex-basis: calc(33.333% - 20px);
          box-sizing: border-box;
          max-width: 200px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .viz-title {
          font-size: 14px;
          color: #6c757d;
        }
        .viz-value {
          font-size: 24px; /* Larger than title */
          margin-bottom: 5px;
          flex-grow: 1;
        }
        @media (max-width: 768px) {
          .viz-element {
            flex-basis: calc(50% - 20px);
          }
        }
        @media (max-width: 480px) {
          .viz-element {
            flex-basis: 100%;
          }
        }
      </style>
      <div class="viz-container"></div>
    `;
  },
  updateAsync: function (data, element, config, queryResponse, details, done) {
    if (!data || data.length === 0) {
      return;
    }

    const vizContainer = element.querySelector('.viz-container');
    vizContainer.innerHTML = '';

    const dimensions = queryResponse.fields.dimension_like;
    const measures = queryResponse.fields.measure_like;
    const items = [...dimensions, ...measures];

    items.forEach(field => {
      const fieldName = field.name;
      const fieldLabel = config[fieldName + '_title'] || field.label_short || field.label;
      const fieldValue = data[0][fieldName].rendered || data[0][fieldName].value;

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

      // Adjust font size to fit the value within the tile
      fitTextToElement(valueElement);
    });

    done();
  },
});

// Function to adjust font size of the value to fit within its container
function fitTextToElement(element) {
  let fontSize = parseInt(window.getComputedStyle(element).fontSize);
  const parentElement = element.parentElement;
  const maxHeight = parentElement.clientHeight - 35; // Consider title height and margin

  while (element.scrollHeight > maxHeight && fontSize > 10) {
    fontSize -= 1;
    element.style.fontSize = fontSize + 'px';
  }
}
