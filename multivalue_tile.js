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
          gap: 15px;
          padding: 10px;
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
          margin-top: 5px;
        }
        .viz-value {
          font-size: 2em;
          line-height: 1em;
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

    items.forEach(field => {
      const fieldName = field.name;
      const fieldLabel = config[fieldName + '_title'] || field.label_short || field.label;
      const fieldColor = config[fieldName + '_color'] || '#000000';
      let fieldValue = data[0][fieldName].rendered || data[0][fieldName].value;

      const vizElement = document.createElement('div');
      vizElement.className = 'viz-element';

      const valueElement = document.createElement('div');
      valueElement.className = 'viz-value';
      valueElement.innerHTML = fieldValue;
      valueElement.style.color = fieldColor;
      valueElement.style.maxWidth = '100%';
      valueElement.style.overflow = 'hidden';
      valueElement.style.textOverflow = 'ellipsis';

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
  const maxFontSizeValue = containerHeight * 0.4; // Max font size for value element
  const maxFontSizeTitle = containerHeight * 0.15; // Max font size for title element
  let fontSizeValue = Math.min(2 * parseInt(window.getComputedStyle(document.body).fontSize), maxFontSizeValue);
  let fontSizeTitle = Math.min(0.4 * parseInt(window.getComputedStyle(document.body).fontSize), maxFontSizeTitle);

  valueElement.style.fontSize = `${fontSizeValue}px`; // Set initial font size for value element
  titleElement.style.fontSize = `${fontSizeTitle}px`; // Set initial font size for title element

  // Adjust font size until the elements fit within the container
  const totalHeight = () => valueElement.scrollHeight + titleElement.scrollHeight;
  
  while ((totalHeight() > containerHeight) && fontSizeValue > 10 && fontSizeTitle > 10) {
    fontSizeValue -= 1; // Decrease font size for value element
    fontSizeTitle -= 1; // Decrease font size for title element
    valueElement.style.fontSize = `${fontSizeValue}px`;
    titleElement.style.fontSize = `${fontSizeTitle}px`;
  }
}

function deleteDynamicOptions(viz) {
  const options = viz.options;
  for (const key in options) {
    if (key.endsWith('_title') || key.endsWith('_color')) {
      delete options[key];
    }
  }
}
