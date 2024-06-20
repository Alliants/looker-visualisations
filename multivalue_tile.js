looker.plugins.visualizations.add({
  id: "custom-responsiveness",
  label: "Responsive Table",
  options: {},

  create: function(element, config) {
    // Create an empty container element for the visualization
    element.innerHTML = `
      <style>
        .responsive-table {
          width: 100%;
          border-collapse: collapse;
        }

        .responsive-table td {
          text-align: center;
          padding: 10px;
          border: 1px solid #ddd;
          font-family: 'Lato Light', sans-serif;
        }

        .metric-value {
          font-size: 1.5rem;
        }

        .metric-label {
          font-size: 1rem;
          color: #555555;
        }

        @media (max-width: 768px) {
          .metric-value {
            font-size: 1.2rem;
          }

          .metric-label {
            font-size: 0.9rem;
          }
        }

        @media (max-width: 480px) {
          .metric-value {
            font-size: 1rem;
          }

          .metric-label {
            font-size: 0.8rem;
          }
        }
      </style>
      <div class="custom-visualization">
        <table class="responsive-table">
          <tbody>
            <tr>
              <td>
                <div class="metric-value" id="count-of-properties">N/A</div>
                <p class="metric-label">Properties Visited</p>
              </td>
              <td>
                <div class="metric-value" id="count-of-nights">N/A</div>
                <p class="metric-label">Total Nights</p>
              </td>
              <td>
                <div class="metric-value" id="avg-adr">N/A</div>
                <p class="metric-label">Avg. ADR</p>
              </td>
            </tr>
            <tr>
              <td>
                <div class="metric-value" id="count-of-stays">N/A</div>
                <p class="metric-label">Total Stays</p>
              </td>
              <td>
                <div class="metric-value" id="avg-stay-length">N/A</div>
                <p class="metric-label">Avg. Stay Length</p>
              </td>
              <td>
                <div class="metric-value" id="total-room-revenue">N/A</div>
                <p class="metric-label">Total Room Revenue</p>
              </td>
            </tr>
          </tbody>
        </table>
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

    // Assuming data is in the correct order
    document.getElementById("count-of-properties").innerHTML = data[0][queryResponse.fields.dimensions[0].name].value;
    document.getElementById("count-of-nights").innerHTML = data[0][queryResponse.fields.dimensions[1].name].value;
    document.getElementById("avg-adr").innerHTML = data[0][queryResponse.fields.dimensions[2].name].value;
    document.getElementById("count-of-stays").innerHTML = data[0][queryResponse.fields.dimensions[3].name].value;
    document.getElementById("avg-stay-length").innerHTML = data[0][queryResponse.fields.dimensions[4].name].value;
    document.getElementById("total-room-revenue").innerHTML = data[0][queryResponse.fields.dimensions[5].name].value;

    // Call done to indicate rendering is complete
    done();
  }
});
