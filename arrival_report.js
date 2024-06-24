// Include custom icons
const icons = `
<style>
  .arrival-card {
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
    background: #ffb921;
    padding: 5px 10px;
    border-radius: 10px;
    color: white;
    font-weight: bold;
  }
  .arrival-details div {
    margin-bottom: 10px;
    display: flex;
    align-items: center;
  }
  .icon {
    margin-right: 10px;
    width: 18px;
    height: 18px;
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
    element.innerHTML += icons;

    // Extracting fields in the specific order
    const fields = queryResponse.fields.dimension_like;

    // Check if there are at least 6 fields available
    if (fields.length < 6) {
      element.innerHTML += 'Insufficient data fields';
      done();
      return;
    }

    // Extract data from the first row in the order specified
    const row = data[0];
    const due_in_time = row[fields[0].name].value;
    const location = row[fields[1].name].value;
    const start_date = row[fields[2].name].value;
    const end_date = row[fields[3].name].value;
    const num_nights = row[fields[4].name].value;
    const num_guests = row[fields[5].name].value;
    const room_numbers = row[fields[6].name].value;

    // Create the HTML structure
    const arrivalCard = `
      <div class="arrival-card">
        <div class="arrival-header">
          <div>Arrival Report</div>
          <div class="status">Due in - ${due_in_time}</div>
        </div>
        <div class="arrival-details">
          <div><strong>${location}</strong></div>
          <div>
            <img class="icon" src="https://alliants.frontify.com/d/Zp2zi58MrKau/icon-library/show/eyJpZCI6NDk5OTE0NCwidGltZXN0YW1wIjoiMTcxOTIyMjk4MiJ9:frontify:ZK5seepHanopagqhaf0x3AJO4TdhbFQOF-aCSHl9C88"></img>
            ${start_date} - ${end_date} (${num_nights} nights)
          </div>
          <div>
            <img class="icon" src="https://alliants.frontify.com/d/Zp2zi58MrKau/icon-library/show/eyJpZCI6NDk5OTA2OSwidGltZXN0YW1wIjoiMTcxOTIyMjc4MSJ9:frontify:mnKq88msTBja1iFK7f7A8O-nTvofXasDV1eMpjLo3o8"></img>
            ${num_guests} guests
          </div>
          <div>
            <img class="icon" src="https://alliants.frontify.com/d/Zp2zi58MrKau/icon-library/show/eyJpZCI6NDk5OTM3NiwidGltZXN0YW1wIjoiMTcxOTIyMzAwMSJ9:frontify:BK1jFWY0XNBt5LzOiAag7PYC62HTADPrI960YUNQ3uQ"></img>
            Rooms ${room_numbers}
          </div>
        </div>
      </div>
    `;
    
    // Append the card to the element
    element.innerHTML += arrivalCard;
    
    done();
  }
});
