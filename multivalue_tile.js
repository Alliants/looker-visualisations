looker.plugins.visualizations.add({
  id: 'structured_layout_viz',
  label: 'Structured Layout Viz',
  options: {
    layout: {
      type: 'string',
      label: 'Layout',
      display: 'select',
      values: [
        { '2x3': '2x3' },
        { '3x2': '3x2' }
      ],
      default: '2x3'
    }
  },
  create: function (element, config) {
    element.innerHTML = `
      <style>
        .viz-container {
          display: grid;
          gap: 10px;
          padding: 10px;
          font-family: 'Lato Light', sans-serif;
          height: 100%;
          box-sizing: border-box;
        }
        .viz-element {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
          padding: 10px;
          overflow: hidden;
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
        .grid-2x3 {
          grid-template-rows: repeat(2, 1fr);
          grid-template-columns: repeat(3, 1fr);
        }
        .grid-3x2 {
          grid-template-rows: repeat(3, 1fr);
          grid-template-columns: repeat(2, 1fr);
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

    const vizContainer = element.querySelector('.viz-container');
    const layout = config.layout || '2x3';

    // Apply grid layout class
    vizContainer.classList.remove(...vizContainer.classList);
    vizContainer.classList.add('viz-container', `grid-${layout}`);

    vizContainer.innerHTML = '';

    // Limit the number of metrics based on layout
    const maxItems = layout === '2x3' ? 6 : 6;
    const dimensions = queryResponse.fields.dimension_like.slice(0, maxItems);
    const measures = queryResponse.fields.measure_like.slice(0, maxItems);
    const items = [...dimensions, ...measures].slice(0, maxItems);

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
