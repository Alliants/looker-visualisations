const layoutOptions = {
  1: { '1x1': '1x1' },
  2: { '2x1': '2x1', '1x2': '1x2' },
  3: { '3x1': '3x1', '1x3': '1x3' },
  4: { '2x2': '2x2', '4x1': '4x1', '1x4': '1x4' },
  5: { '2x2 + 1x1': '2x2-1x1', '5x1': '5x1', '1x5': '1x5' },
  6: { '3x2': '3x2', '2x3': '2x3' },
  7: { '3x2 + 2x1': '3x2-2x1' },
  8: { '4x2': '4x2', '2x4': '2x4' }
};

function getRelevantLayouts(numberOfItems) {
  return layoutOptions[numberOfItems] || {};
}

function updateLayoutOptions(viz, numberOfItems) {
  const allowedLayouts = getRelevantLayouts(numberOfItems);

  // Update the layout options dynamically
  viz.options.layout.values = allowedLayouts;

  // Delete any invalid layout option set previously
  if (!allowedLayouts[viz.config.layout]) {
    viz.config.layout = Object.keys(allowedLayouts)[0] || 'auto';
  }

  // Re-register the options to update the UI
  viz.trigger('registerOptions', viz.options);
}

looker.plugins.visualizations.add({
  id: 'structured_layout_viz',
  label: 'Structured Layout Viz',
  options: {
    layout: {
      type: 'string',
      label: 'Layout',
      display: 'select',
      values: { 'Auto': 'auto' },
      default: 'auto'
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
          font-size: 16px;
          color: #6c757d;
          margin-top: 5px;
        }
        .viz-value {
          font-size: 2em;
          line-height: 1em;
        }
        .grid-1x1 {
          grid-template-rows: repeat(1, 1fr);
          grid-template-columns: repeat(1, 1fr);
        }
        .grid-2x1 {
          grid-template-rows: repeat(1, 1fr);
          grid-template-columns: repeat(2, 1fr);
        }
        .grid-1x2 {
          grid-template-rows: repeat(2, 1fr);
          grid-template-columns: repeat(1, 1fr);
        }
        .grid-3x1 {
          grid-template-rows: repeat(1, 1fr);
          grid-template-columns: repeat(3, 1fr);
        }
        .grid-1x3 {
          grid-template-rows: repeat(3, 1fr);
          grid-template-columns: repeat(1, 1fr);
        }
        .grid-2x2 {
          grid-template-rows: repeat(2, 1fr);
          grid-template-columns: repeat(2, 1fr);
        }
        .grid-4x1 {
          grid-template-rows: repeat(1, 1fr);
          grid-template-columns: repeat(4, 1fr);
        }
        .grid-1x4 {
          grid-template-rows: repeat(4, 1fr);
          grid-template-columns: repeat(1, 1fr);
        }
        .grid-2x2-1x1 {
          display: grid;
          grid-template-areas:
            "a a b b"
            "a a c c"
            "d d e e";
        }
        .grid-5x1 {
          grid-template-rows: repeat(1, 1fr);
          grid-template-columns: repeat(5, 1fr);
        }
        .grid-1x5 {
          grid-template-rows: repeat(5, 1fr);
          grid-template-columns: repeat(1, 1fr);
        }
        .grid-3x2 {
          grid-template-rows: repeat(2, 1fr);
          grid-template-columns: repeat(3, 1fr);
        }
        .grid-2x3 {
          grid-template-rows: repeat(3, 1fr);
          grid-template-columns: repeat(2, 1fr);
        }
        .grid-3x2-2x1 {
          display: grid;
          grid-template-areas:
            "a a b b c c"
            "d d e e f f";
        }
        .grid-4x2 {
          grid-template-rows: repeat(2, 1fr);
          grid-template-columns: repeat(4, 1fr);
        }
        .grid-2x4 {
          grid-template-rows: repeat(4, 1fr);
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

    const dimensions = queryResponse.fields.dimension_like;
    const measures = queryResponse.fields.measure_like;
    const items = [...dimensions, ...measures].slice(0, 8); // Limit to 8 metrics

    const numberOfItems = items.length;
    updateLayoutOptions(this, numberOfItems); // Update the layout options based on the number of items

    let layout = config.layout === 'auto' ? Object.keys(this.options.layout.values)[0] : config.layout;

    const vizContainer = element.querySelector('.viz-container');
    vizContainer.classList.remove(...vizContainer.classList);
    vizContainer.classList.add('viz-container', `grid-${layout}`);

    vizContainer.innerHTML = '';

    // Clear previous options
    deleteDynamicOptions(this);

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
  let fontSizeTitle = 16; // Consistent max font size for title element

  valueElement.style.fontSize = `${fontSizeValue}px`; // Set initial font size for value element
  titleElement.style.fontSize = `${fontSizeTitle}px`; // Set initial font size for title element

  // Adjust font size until the elements fit within the container
  const totalHeight = () => valueElement.scrollHeight + titleElement.scrollHeight;
  
  while ((totalHeight() > containerHeight) && fontSizeValue > 10) {
    fontSizeValue -= 1; // Decrease font size for value element
    valueElement.style.fontSize = `${fontSizeValue}px`;
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
