looker.plugins.visualizations.add({
  id: 'single_value_tile_viz',
  label: 'Single Value Tile Viz',
  options: {
    title: {
      type: 'string',
      label: 'Title',
      display: 'text',
      default: '',
    },
    title_position: {
      type: 'string',
      label: 'Title Position',
      display: 'select',
      values: [
        { 'Left': 'left' },
        { 'Center': 'center' },
        { 'Right': 'right' }
      ],
      default: 'center',
    },
    font_family: {
      type: 'string',
      label: 'Font Family',
      display: 'select',
      values: [
        { 'Lato': 'Lato' },
        { 'Arial': 'Arial' },
        { 'Georgia': 'Georgia' },
        { 'Courier New': 'Courier New' },
        { 'Roboto': 'Roboto' },
        { 'Open Sans': 'Open Sans' },
        { 'Montserrat': 'Montserrat' },
        { 'Oswald': 'Oswald' },
        { 'Raleway': 'Raleway' },
      ],
      default: 'Lato',
    },
    master_color: {
      type: 'string',
      label: 'Master Color',
      display: 'color',
      default: '#000000',
    },
  },
  create: function (element, config) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${config.font_family.replace(/ /g, '+')}&display=swap`;
    document.head.appendChild(link);

    element.innerHTML = `
      <style>
        .viz-container {
          display: flex;
          justify-content: center;
          align-items: center;
          text-align: center;
          border-radius: 8px;
          height: 100%;
          box-sizing: border-box;
          font-family: ${config.font_family}, sans-serif;
        }
        .viz-title-container {
          width: 100%;
          text-align: ${config.title_position || 'center'};
          margin-bottom: 5px;
          font-family: ${config.font_family}, sans-serif;
          font-size: 2.5vw;
        }
        .viz-element {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
          font-family: ${config.font_family}, sans-serif;
        }
        .viz-value {
          margin: 0;
          font-size: 5vw;
          font-family: ${config.font_family}, sans-serif;
          color: ${config.master_color};
        }
        .viz-title {
          margin: 0;
          font-size: 2.5vw;
          font-family: ${config.font_family}, sans-serif;
          color: ${config.master_color};
        }
      </style>
      <div class="viz-title-container"></div>
      <div class="viz-container"></div>
    `;
    element.style.height = "100%";
  },
  updateAsync: function (data, element, config, queryResponse, details, done) {
    // Apply font family style dynamically
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${config.font_family.replace(/ /g, '+')}&display=swap`;
    document.head.appendChild(link);

    const vizTitleContainer = element.querySelector('.viz-title-container');
    if (config.title) {
      vizTitleContainer.innerHTML = `<div style="text-align: ${config.title_position};">${config.title}</div>`;
    } else {
      vizTitleContainer.innerHTML = '';
    }

    if (!data || data.length === 0 || queryResponse.fields.measure_like.length > 1) {
      const vizContainer = element.querySelector('.viz-container');
      vizContainer.innerHTML = `<p style="color: red;">Error: This visualization supports only a single value.</p>`;
      done();
      return;
    }

    const vizContainer = element.querySelector('.viz-container');
    vizContainer.innerHTML = '';

    const measure = queryResponse.fields.measure_like[0];
    const measureName = measure.name;
    const measureValue = data[0][measureName].rendered || data[0][measureName].value || '∅';

    const vizElement = document.createElement('div');
    vizElement.className = 'viz-element';

    const valueElement = document.createElement('div');
    valueElement.className = 'viz-value';
    valueElement.innerHTML = measureValue;

    const titleElement = document.createElement('div');
    titleElement.className = 'viz-title';
    titleElement.innerText = config.title || measure.label_short || measure.label;

    vizElement.appendChild(valueElement);
    vizElement.appendChild(titleElement);
    vizContainer.appendChild(vizElement);
    
    done();
  }
});
