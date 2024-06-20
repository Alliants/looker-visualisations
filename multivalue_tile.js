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
          align-items: center;
          text-align: center;
          padding: 10px;
          gap: 30px;
          border-radius: 8px;
          font-family: 'Lato Light', sans-serif;
          height: 100%;
          box-sizing: border-box;
          overflow: hidden;
        }
        .viz-element {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
          padding: 10px;
        }
        .viz-title {
          font-size: 14px;
          color: #6c757d;
        }
        .viz-value {
          font-size: 1.5em; /* base size, will be adjusted */
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
    element.style.height = "100%"; // Ensure the main element takes the full height
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

    const tileHeight = element.clientHeight;
    const tileWidth = element.clientWidth;
    const columns = Math.min(items.length, 3); // Up to 3 columns
    const rows = Math.ceil(items.length / columns); // Calculate rows needed
    const elementHeightAdjust = tileHeight / rows - 40; // adjust for padding and margins

    items.forEach(field => {
      const fieldName = field.name;
      const fieldLabel = config[fieldName + '_title'] || field.label_short || field.label;
      const fieldValue = data[0][fieldName].rendered || data[0][fieldName].value;

      const vizElement = document.createElement('div');
      vizElement.className = 'viz-element';
      vizElement.style.flex = `1 0 calc(${100 / columns}% - 20px)`;
      vizElement.style.height = `${elementHeightAdjust}px`; // Adjust height

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
      fitTextToElement(valueElement, vizElement);
    });

    done();
  },
});

// Function to adjust font size of the value to fit within its container
function fitTextToElement(element, container) {
  let fontSize = parseInt(window.getComputedStyle(element).fontSize);
  let maxHeight = container.clientHeight * 0.5; // 50% of container height

  element.style.fontSize = `${fontSize}px`; // Set initial font size
  while (element.scrollHeight > maxHeight && fontSize > 10) {
    fontSize -= 1; // Reduce font size
    element.style.fontSize = fontSize + 'px';
  }
}
