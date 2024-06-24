looker.plugins.visualizations.add({
  id: 'single_value_viz',
  label: 'Single Value Viz',
  options: {
    show_title: {
      type: 'boolean',
      label: 'Show Title',
      default: false,
    },
    title: {
      type: 'string',
      label: 'Title',
      display: 'text',
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
    color: {
      type: 'string',
      label: 'Color',
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
        .single-value-container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          height: 100%;
          width: 100%;
          box-sizing: border-box;
          font-family: ${config.font_family}, sans-serif;
        }
        .single-value-title {
          font-size: 5vw;
          margin-bottom: 5px;
          font-family: ${config.font_family}, sans-serif;
        }
        .single-value {
          font-size: 10vw;
        }
      </style>
      <div class="single-value-title-container"></div>
      <div class="single-value-container"></div>
    `;
  },
  updateAsync: function (data, element, config, queryResponse, details, done) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${config.font_family.replace(/ /g, '+')}&display=swap`;
    document.head.appendChild(link);

    const titleContainer = element.querySelector('.single-value-title-container');
    const valueContainer = element.querySelector('.single-value-container');
    valueContainer.innerHTML = '';

    if (!data || data.length === 0) {
      done();
      return;
    }

    const fields = [...queryResponse.fields.dimension_like, ...queryResponse.fields.measure_like];

    if (fields.length !== 1) {
      const errorElement = document.createElement('div');
      errorElement.innerHTML = `<p style="color: red;">Error: Please provide exactly one metric or dimension.</p>`;
      valueContainer.appendChild(errorElement);
      done();
      return;
    }

    const field = fields[0];
    const fieldName = field.name;
    const fieldLabel = field.label_short || field.label;
    const fieldValue = data[0][fieldName].rendered || data[0][fieldName].value || '∅';

    if (config.show_title) {
      const titleText = config.title ? config.title : fieldLabel;
      titleContainer.innerHTML = `<div class="single-value-title" style="text-align: ${config.title_position};">${titleText}</div>`;
    } else {
      titleContainer.innerHTML = '';
    }

    const valueElement = document.createElement('div');
    valueElement.className = 'single-value';
    valueElement.style.color = config.color;
    valueElement.innerHTML = fieldValue;

    valueContainer.appendChild(valueElement);
    done();
  }
});
