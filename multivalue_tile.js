looker.plugins.visualizations.add({
  id: 'dynamic_layout_viz',
  label: 'Dynamic Layout Viz',
  options: {
    /* Options will be generated dynamically */
  },
  create: function (element, config) {
    element.innerHTML = `
      <style>
        .viz-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 20px;
          padding: 10px;
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
    element.style.height = "100%"; // Ensure the main element takes the full height
  },
  updateAsync: function (data, element, config, queryResponse, details, done) {
    if (!data || data.length === 0) {
      return;
    }

    // Clear previous options
    deleteDynamicOptions(this);

    // Create new options dynamically
    const dimensions = queryResponse.fields.dimension_like;
    const measures = queryResponse.fields.measure_like;
    const items = [...dimensions, ...measures];

    items.forEach((field, index) => {
      const fieldName = field.name;
      const labelIndex = index + 1;
      this.options[`${fieldName}_title`] = {
        type: 'string',
        label: `Value ${labelIndex} Title`,
        display: 'text',
        default: field.label_short || field.label
      };
      this.options[`${fieldName}_color`] = {
        type: 'string',
        label: `Value ${labelIndex} Color`,
        display: 'color',
        default: '#000000'
      };
    });

    // Update options
    this.trigger('registerOptions', this.options);
    
    const vizContainer = element.querySelector('.viz-container');
    vizContainer.innerHTML = '';

    const tileHeight = element.clientHeight;
    const columns = Math.min(items.length, 3); // Up to 3 columns
    const rows = Math.ceil(items.length / columns); // Calculate rows needed
    const elementHeightAdjust = tileHeight / rows - 20; // adjust for padding and margins

    items.forEach(field => {
      const fieldName = field.name;
      const fieldLabel = config[fieldName + '_title'] || field.label_short || field.label;
      const fieldColor = config[fieldName + '_color'] || '#000000';
      let fieldValue = data[0][fieldName].rendered || data[0][fieldName].value;

      const vizElement = document.createElement('div');
      vizElement.className = 'viz-element';
      vizElement.style.height = `${elementHeightAdjust}px`;

      const valueElement = document.createElement('div');
      valueElement.className = 'viz-value';
      valueElement.innerHTML = fieldValue;
      valueElement.style.color = fieldColor;

      const titleElement = document.createElement('div');
      titleElement.className = 'viz-title';
      titleElement.innerText = fieldLabel;

      vizElement.appendChild(valueElement);
      vizElement.appendChild(titleElement);
      vizContainer.appendChild(vizElement);

      // Adjust font size to fit both the value and title within the tile
      adjustFontSize(valueElement, titleElement, vizElement.clientHeight);
    });

    done();
  }
});

function adjustFontSize(valueElement, titleElement, containerHeight) {
  const maxFontSize = containerHeight * 0.5; // Max font size is 50% of container height
  let fontSize = maxFontSize;

  valueElement.style.fontSize = `${fontSize}px`; // Set initial font size
  let titleFontSize = Math.max(fontSize * 0.2, 12); // Initial title font size with a minimum of 12px

  titleElement.style.fontSize = `${titleFontSize}px`; // Set initial title font size

  // Adjust font size until the elements fit within the container
  const totalHeight = () => valueElement.scrollHeight + titleElement.scrollHeight;
  
  while ((totalHeight() > containerHeight) && fontSize > 10) {
    fontSize -= 1; // Decrease font size
    valueElement.style.fontSize = `${fontSize}px`;
    titleFontSize = Math.max(fontSize * 0.2, 12); // Adjust title font size proportionally with a minimum of 12px
    titleElement.style.fontSize = `${titleFontSize}px`;
  }
}

function deleteDynamicOptions (viz) {
  const options = viz.options;
  for (const key in options) {
    if (key.endsWith('_title') || key.endsWith('_color')) {
      delete options[key];
    }
  }
}
