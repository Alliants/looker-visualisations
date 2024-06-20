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
          box-sizing: border-box;
          padding: 10px;
          background-color: white;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
        }
        .viz-title {
          font-size: 14px;
          color: #6c757d;
        }
        .viz-value {
          font-size: 1.5em;
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

    const containerHeight = element.clientHeight;
    const containerWidth = element.clientWidth;
    const columns = Math.min(items.length, 3); // Up to 3 columns
    const rows = Math.ceil(items.length / columns); // Calculate rows needed
    const elementHeightAdjust = containerHeight / rows - 20; // Adjust for padding and margins

    items.forEach((field, index) => {
      const fieldName = field.name;
      const fieldLabel = field.label_short || field.label;
      const fieldValue = data[0][fieldName].rendered || data[0][fieldName].value || '∅';

      const vizElement = document.createElement('div');
      vizElement.className = 'viz-element';
      vizElement.style.flex = `1 0 calc(${100 / columns}% - 20px)`;
      vizElement.style.height = `${elementHeightAdjust}px`;

      const valueElement = document.createElement('div');
      valueElement.className = 'viz-value';
      valueElement.innerHTML = fieldValue;

      const titleElement = document.createElement('div');
      titleElement.className = 'viz-title';
      titleElement.innerText = fieldLabel;

      vizElement.appendChild(valueElement);
      vizElement.appendChild(titleElement);
      vizContainer.appendChild(vizElement);

      adjustFontSize(valueElement, titleElement, elementHeightAdjust);
    });

    done();
  }
});

function adjustFontSize(valueElement, titleElement, containerHeight) {
  const maxFontSize = containerHeight * 0.4; // Max font size is 40% of container height
  let fontSize = maxFontSize;

  valueElement.style.fontSize = `${fontSize}px`; // Set initial font size
  let titleFontSize = Math.max(fontSize * 0.25, 12); // Initial title font size with a minimum of 12px

  titleElement.style.fontSize = `${titleFontSize}px`; // Set initial title font size

  // Adjust font size until the elements fit within the container
  while ((valueElement.scrollHeight + titleElement.scrollHeight > containerHeight) && fontSize > 10) {
    fontSize -= 1; // Decrease font size
    valueElement.style.fontSize = `${fontSize}px`;
    titleFontSize = Math.max(fontSize * 0.25, 12); // Adjust title font size proportionally with a minimum of 12px
    titleElement.style.fontSize = `${titleFontSize}px`;
  }
}
