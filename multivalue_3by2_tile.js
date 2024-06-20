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
          display: flex;
          flex-wrap: wrap;
          justify-content: space-around;
          align-items: center;
          text-align: center;
          padding: 10px;
          gap: 10px;
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
          padding: 10px;
          box-sizing: border-box;
          flex: 1 1 30%;
          min-width: 150px;
        }
        .viz-title {
          font-size: 14px;
          color: #6c757d;
        }
        .viz-value {
          font-size: 2em;
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

      adjustFontSize(valueElement, titleElement, vizElement.clientHeight);
    });

    done();
  }
});

function adjustFontSize(valueElement, titleElement, containerHeight) {
  const maxFontSize = containerHeight * 0.4; // Max font size is 40% of container height
  let fontSize = maxFontSize;

  valueElement.style.fontSize = `${fontSize}px`; // Set initial font size
  let titleFontSize = Math.max(fontSize * 0.25, 14); // Initial title font size with a minimum of 14px

  titleElement.style.fontSize = `${titleFontSize}px`; // Set initial title font size

  // Adjust font size until the elements fit within the container
  while ((valueElement.scrollHeight + titleElement.scrollHeight > containerHeight) && fontSize > 14) {
    fontSize -= 1; // Decrease font size
    valueElement.style.fontSize = `${fontSize}px`;
    titleFontSize = Math.max(fontSize * 0.25, 14); // Adjust title font size proportionally with a minimum of 14px
    titleElement.style.fontSize = `${titleFontSize}px`;
  }
}
