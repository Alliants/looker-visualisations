looker.plugins.visualizations.add({
  id: "custom-responsiveness",
  label: "Responsive Table",
  options: {
    properties_name: {
      type: "string",
      label: "Properties Visited Label",
      display: "text",
      default: "Properties Visited"
    },
    nights_name: {
      type: "string",
      label: "Total Nights Label",
      display: "text",
      default: "Total Nights"
    },
    adr_name: {
      type: "string",
      label: "Avg. ADR Label",
      display: "text",
      default: "Avg. ADR"
    },
    stays_name: {
      type: "string",
      label: "Total Stays Label",
      display: "text",
      default: "Total Stays"
    },
    stay_length_name: {
      type: "string",
      label: "Avg. Stay Length Label",
      display: "text",
      default: "Avg. Stay Length"
    },
    revenue_name: {
      type: "string",
      label: "Total Room Revenue Label",
      display: "text",
      default: "Total Room Revenue"
    },
  },

  create: function(element, config) {
    // Create an empty container element for the visualization
    element.innerHTML = `
      <style>
        .custom-visualization {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px;
          box-sizing: border-box;
          width: 100%;
          height: 100%;
        }

        .responsive-table {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          width: 100%;
          gap: 10px;
        }

        .responsive-table div {
          text-align: center;
          font-family: 'Lato Light', sans-serif;
        }

        .metric-value {
          font-size: 1.5rem;
        }

        .metric-label {
          font-size: 1rem;
          color: #555555;
        }

        @media (max-width: 1024px) {
          .metric-value {
            font-size: 1.2rem;
          }

          .metric-label {
            font-size: 0.9rem;
          }
        }

        @media (max-width: 768px) {
          .metric-value {
            font-size: 1rem;
          }

          .metric-label {
            font-size: 0.8rem;
          }
        }

        @media (max-width: 480px) {
          .metric-value {
            font-size: 0.8rem;
          }

          .metric-label {
            font-size: 0.7rem;
          }

          .responsive-table {
            grid-template-columns: 1fr;
          }
        }
      </style>
      <div class="custom-visualization">
        <div class="responsive-table">
          <div>
            <div class="metric-value" id="count-of-properties">N/A</div>
            <p class="metric-label" id="label-properties">Properties Visited</p>
          </div>
          <div>
            <div class="metric-value" id="count-of-nights">N/A</div>
            <p class="metric-label" id="label-nights">Total Nights</p>
          </div>
          <div>
            <div class="metric-value" id="avg-adr">N/A</div>
            <p class="metric-label" id="label-adr">Avg. ADR</p>
          </div>
          <div>
            <div class="metric-value" id="count-of-stays">N/A</div>
            <p class="metric-label" id="label-stays">Total Stays</p>
          </div>
          <div>
            <div class="metric-value" id="avg-stay-length">N/A</div>
            <p class="metric-label" id="label-stay-length">Avg. Stay Length</p>
          </div>
          <div>
            <div class="metric-value" id="total-room-revenue">N/A</div>
            <p class="metric-label" id="label-revenue">Total Room Revenue</p>
          </div>
        </div>
      </div>
    `;
  },

  updateAsync: function(data, element, config, queryResponse, details, done) {
    // Clear any errors from previous updates
    this.clearErrors();

    // Validate that the visualization's data matches the query response
    if (queryResponse.fields.dimensions.length < 6) {
      this.addError({
        title: "Not Enough Dimensions",
        message: "This visualization requires 6 dimensions."
      });
      return;
    }

    // Parse data and format values
    const formatValue = (value) => {
      var options = { style: 'decimal', useGrouping: true };
      if (typeof value === 'number' && value % 1 !== 0) {
        options.minimumFractionDigits = 1;
        options.maximumFractionDigits = 2;
      }
      return new Intl.NumberFormat('en-US', options).format(value);
    };

    document.getElementById("count-of-properties").innerText = formatValue(data[0][queryResponse.fields.dimensions[0].name].value);
    document.getElementById("count-of-nights").innerText = formatValue(data[0][queryResponse.fields.dimensions[1].name].value);
    document.getElementById("avg-adr").innerText = formatValue(data[0][queryResponse.fields.dimensions[2].name].value);
    document.getElementById("count-of-stays").innerText = formatValue(data[0][queryResponse.fields.dimensions[3].name].value);
    document.getElementById("avg-stay-length").innerText = formatValue(data[0][queryResponse.fields.dimensions[4].name].value);
    document.getElementById("total-room-revenue").innerText = formatValue(data[0][queryResponse.fields.dimensions[5].name].value);

    // Update labels with config values
    document.getElementById("label-properties").innerText = config.properties_name || queryResponse.fields.dimensions[0].label_short;
    document.getElementById("label-nights").innerText = config.nights_name || queryResponse.fields.dimensions[1].label_short;
    document.getElementById("label-adr").innerText = config.adr_name || queryResponse.fields.dimensions[2].label_short;
    document.getElementById("label-stays").innerText = config.stays_name || queryResponse.fields.dimensions[3].label_short;
    document.getElementById("label-stay-length").innerText = config.stay_length_name || queryResponse.fields.dimensions[4].label_short;
    document.getElementById("label-revenue").innerText = config.revenue_name || queryResponse.fields.dimensions[5].label_short;

    // Call done to indicate rendering is complete
    done();
  }
});
