looker.plugins.visualizations.add({
  id: 'dynamic_layout_viz',
  label: 'Dynamic Layout Viz',
  options: {
    /* No default options needed */
  },
  create: function (element, config) {
    element.innerHTML = `
      <style>
        .viz-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 30px;
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
          padding: 10px;
        }
        .viz-title {
          font-size: 14px;
          color: #6c757d;
        }
        .viz-value {
          font-size: 1.5em;
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

    items.forEach(field => {
      const fieldName = field.name;
      this.options[`${fieldName}_group`] = {
        type: "group",
        label: `Metric: ${field.label_short || field.label}`
      };
      this.options[`${fieldName}_title`] = {
        type: 'string',
        label: 'Title',
        display: 'text',
        group: `${fieldName}_group`,
        default: field.label_short || field.label
      };
      this.options[`${fieldName}_color`] = {
        type: 'string',
        label: 'Color',
        display: 'color',
        group: `${fieldName}_group`,
        default: '#000000'
      };
      this.options[`${fieldName}_format`] = {
        type: 'string',
        label: 'Value Format',
        display: 'text',
        group: `${fieldName}_group`
      };
    });

    // Update options
    this.trigger('registerOptions', this.options);
    
    const vizContainer = element.querySelector('.viz-container');
    vizContainer.innerHTML = '';

    const tileHeight = element.clientHeight;
    const columns = Math.min(items.length, 3); // Up to 3 columns
    const rows = Math.ceil(items.length / columns); // Calculate rows needed
    const elementHeightAdjust = tileHeight / rows - 40; // adjust for padding and margins

    items.forEach(field => {
      const fieldName = field.name;
      const fieldLabel = config[fieldName + '_title'] || field.label_short || field.label;
      const fieldColor = config[fieldName + '_color'] || '#000000';
      const fieldFormat = config[fieldName + '_format'] || '';
      let fieldValue = data[0][fieldName].rendered || data[0][fieldName].value;

      if (fieldFormat) {
        fieldValue = looker.utils.format_value(fieldValue, { value_format: fieldFormat });
      }

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

function deleteDynamicOptions (viz) {
  const options = viz.options;
  for (const key in options) {
    if (key.endsWith('_group') || key.endsWith('_title') || key.endsWith('_color') || key.endsWith('_format')) {
      delete options[key];
    }
  }
}
