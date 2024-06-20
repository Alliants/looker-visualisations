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
 
