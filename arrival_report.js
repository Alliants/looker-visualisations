// CSS Style 
const style = `
<style>
  .arrival-card {
    border: 1px solid #e0e0e0;
    border-radius: 10px;
    padding: 20px;
    width: 300px;
    font-family: Arial, sans-serif;
  }
  .arrival-header, .arrival-details {
    margin-bottom: 20px;
  }
  .arrival-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .arrival-header .status {
    background: #ffcc00;
    padding: 5px 10px;
    border-radius: 5px;
    color: white;
    font-weight: bold;
  }
  .arrival-details div {
    margin-bottom: 10px;
  }
  .icon {
    margin-right: 10px;
  }
</style>
`;

looker.plugins.visualizations.add({
  create: function (element, config) {
    element.style.fontFamily = `"Open Sans", "Helvetica", sans-serif`
  },
  updateAsync: function (data, element, config, queryResponse, details, done) {
    element.innerHTML = ''; // Clear any existing content

    // Append CSS styles to the element
    element.innerHTML += style;

    // Extracting fields in the specific order
    const fields = queryResponse.fields;
    const dimensionField = fields.dimension_like; // Array of dimension fields
    const measureField = fields.measure_like; // Array of measure fields

    // Check at least 5 fields available (excluding 'dirty' and 'do not disturb')
    if (dimensionField.length < 2 || measureField.length < 3) {
      element.innerHTML += 'Insufficient data fields';
      done();
      return;
    }

    // Extract data from the first row in the order specified
    const row = data[0];
    const due_in_time = row[measureField[0].name].value;
    const location = row[dimensionField[0].name].value;
    const start_date = row[dimensionField[1].name].value;
    const end_date = row[measureField[1].name].value;
    const num_nights = row[measureField[2].name].value;
    const num_guests = row[dimensionField.length > 2 ? dimensionField[2].name : measureField[3].name].value;
    const room_numbers = row[dimensionField.length > 3 ? dimensionField[3].name : measureField[4].name].value;

    // Create the HTML structure
    const arrivalCard = `
      <div class="arrival-card">
        <div class="arrival-header">
          <div>Arrival Report</div>
          <div class="status">Due in - ${due_in_time}</div>
        </div>
        <div class="arrival-details">
          <div><strong>${location}</strong></div>
          <div><i class="icon"></i>${start_date} - ${end_date} (${num_nights} nights)</div>
          <div><i class="icon"></i>${num_guests} guests</div>
          <div><i class="icon"></i>Rooms ${room_numbers}</div>
        </div>
      </div>
    `;
    
    // Append the card to the element
    element.innerHTML += arrivalCard;
    
    done();
  }
});
