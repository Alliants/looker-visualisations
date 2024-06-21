looker.plugins.visualizations.add({
    id: "dynamic_layout_viz",
    label: "Dynamic Layout Viz",
    options: {
        title: {
            type: "string",
            label: "Title",
            display: "text",
            default: ""
        },
        title_position: {
            type: "string",
            label: "Title Position",
            display: "select",
            values: [
                { 'Left': 'left' },
                { 'Center': 'center' },
                { 'Right': 'right' }
            ],
            default: 'center'
        },
        font_family: {
            type: "string",
            label: "Font Family",
            display: "select",
            values: [
                { 'Lato': 'Lato' },
                { 'Arial': 'Arial' },
                { 'Georgia': 'Georgia' },
                { 'Courier New': 'Courier New' },
                { 'Roboto': 'Roboto' },
                { 'Open Sans': 'Open Sans' },
                { 'Montserrat': 'Montserrat' },
                { 'Oswald': 'Oswald' },
                { 'Raleway': 'Raleway' }
            ],
            default: 'Lato'
        },
        master_color: {
            type: "string",
            label: "Master Color",
            display: "color",
            default: "#333"
        },
        metric_colors: {
            type: "array",
            label: "Metric Colors",
            display: "array",
            array: true,
            default: ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b"]
        },
        value_format: {
            type: "string",
            label: "Value Format",
            display: "text",
            default: ""
        },
        comparison_layout: {
            type: "string",
            label: "Comparison Layout",
            display: "select",
            values: [
                { 'Above': 'column-reverse' },
                { 'Below': 'column' },
                { 'Left': 'row-reverse' },
                { 'Right': 'row' }
            ],
            default: 'column'
        },
        divider_visibility: {
            type: "boolean",
            label: "Show Dividers Between Values?",
            default: false
        }
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
                    flex-wrap: wrap;
                    justify-content: center;
                    align-items: center;
                    text-align: center;
                    padding: 10px;
                    gap: 10px;
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
                }
                .viz-element {
                    display: flex;
                    flex-direction: ${config.comparison_layout};
                    align-items: center;
                    justify-content: center;
                    padding: 10px;
                    box-sizing: border-box;
                    flex: 1 1 30%;
                    min-width: 120px;
                    font-family: ${config.font_family}, sans-serif;
                }
                .viz-divider {
                    background-color: #282828;
                    height: 35vh;
                    width: 1px;
                }
                .viz-title, .viz-value {
                    margin: 0;
                    font-family: ${config.font_family}, sans-serif;
                }
            </style>
            <div class="viz-title-container"></div>
            <div class="viz-container"></div>
        `;
        element.style.height = "100%";
    },

    update: function (data, element, config, queryResponse) {
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

        if (!data || data.length === 0) {
            return;
        }

        const vizContainer = element.querySelector('.viz-container');
        vizContainer.innerHTML = '';

        const fields = [...queryResponse.fields.dimension_like, ...queryResponse.fields.measure_like];
        const maxFields = 6;
        if (fields.length > maxFields) {
            const errorElement = document.createElement('div');
            errorElement.innerHTML = `<p style="color: red;">Error: Please limit to 6 metrics/dimensions.</p>`;
            vizContainer.appendChild(errorElement);
            return;
        }

        const items = fields.slice(0, maxFields);
        const metricColors = config.metric_colors;

        const containerHeight = element.clientHeight;
        const containerWidth = element.clientWidth;
        const minContainerSize = Math.min(containerHeight, containerWidth);
        const baseFontSize = minContainerSize / 10;

        items.forEach((field, index) => {
            const fieldName = field.name;
            const fieldLabel = field.label_short || field.label;
            const fieldValue = data[0][fieldName].rendered || data[0][fieldName].value || '∅';

            const vizElement = document.createElement('div');
            vizElement.className = 'viz-element';

            const metricColor = metricColors[index] || config.master_color;
            const metricTitle = config[`metric${index + 1}_title`] || fieldLabel;

            const valueElement = document.createElement('div');
            valueElement.className = 'viz-value';
            valueElement.innerHTML = fieldValue;
            valueElement.style.fontSize = `${baseFontSize}px`;
            valueElement.style.color = metricColor;

            const titleElement = document.createElement('div');
            titleElement.className = 'viz-title';
            titleElement.innerText = metricTitle;
            titleElement.style.fontSize = `${baseFontSize / 2.5}px`;
            titleElement.style.color = metricColor;

            vizElement.appendChild(valueElement);
            vizElement.appendChild(titleElement);

            // Add divider if necessary
            if (config.divider_visibility && index < items.length - 1) {
                const dividerElement = document.createElement('div');
                dividerElement.className = 'viz-divider';
                vizContainer.appendChild(dividerElement);
            }

            vizContainer.appendChild(vizElement);
        });
    }
});
