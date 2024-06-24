// Include custom icons
const icons = `
<style>
  .arrival-card {
    border-radius: 10px;
    padding: 20px;
    width: 100%;
    box-sizing: border-box;
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
    width: 1em; /* Set icon width based on the font size */
    height: 1em; /* Set icon height based on the font size */
  }
</style>
`;

looker.plugins.visualizations.add({
  create: function(element, config) {
    element.style.fontFamily = `"Open Sans", "Helvetica", sans-serif`;
  },
  updateAsync: function(data, element, config, queryResponse, details, done) {
    element.innerHTML = ''; // Clear any existing content

    // Append CSS styles to the element
    element.innerHTML += icons;

    // Extracting fields in the specific order
    const fields = queryResponse.fields.dimension_like;

    // Check if there are at least 7 fields available
    if (fields.length < 7) {
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

    // Set dynamic font size
    const containerHeight = element.clientHeight;
    const containerWidth = element.clientWidth;
    const minContainerSize = Math.min(containerWidth, containerHeight);
    const baseFontSize = Math.floor(minContainerSize / 20); // Use floor to prevent large increases

    const arrivalCard = `
      <div class="arrival-card" style="font-size: ${baseFontSize}vw; max-height: ${containerHeight - 20}px;">
        <div class="arrival-header">
          <div>Arrival Report</div>
          <div class="status">Due in - ${due_in_time}</div>
        </div>
        <div class="arrival-details">
          <div><strong>${location}</strong></div>
          <div>
            <img class="icon" src="https://cdn-assets-cloud.frontify.com/s3/frontify-cloud-files-us/eyJwYXRoIjoiZnJvbnRpZnlcL2FjY291bnRzXC8yNVwvMTcyMDUwXC9wcm9qZWN0c1wvMjc4Mjc0XC9hc3NldHNcLzJiXC80OTk5MTQ0XC83MDVmMzYzMGFhMTM1NTcxYTAzYzNmYzk3ODE4MDVmMi0xNjA3NjIyMzc4LnN2ZyJ9:frontify:DsE91qZoxdtRg4QXzR3qxmhTvGoA4k703e74VvXnx6Q?width=2400"></img>
            ${start_date} - ${end_date} (${num_nights} nights)
          </div>
          <div>
            <img class="icon" src="https://cdn-assets-cloud.frontify.com/s3/frontify-cloud-files-us/eyJwYXRoIjoiZnJvbnRpZnlcL2FjY291bnRzXC8yNVwvMTcyMDUwXC9wcm9qZWN0c1wvMjc4Mjc0XC9hc3NldHNcLzMzXC80OTk5MDY5XC84NTM1MzZiMTJmM2YwMDc3YTVjNmEyM2Q1YzIwYjZiYS0xNjA3NjIyMTkyLnN2ZyJ9:frontify:XKUzuk-yTmtyqPmtN1vMYqipmXGVfqtUtmLso-gWDxM?width=2400"></img>
            ${num_guests} guests
          </div>
          <div>
            <img class="icon" src="https://cdn-assets-cloud.frontify.com/s3/frontify-cloud-files-us/eyJwYXRoIjoiZnJvbnRpZnlcL2FjY291bnRzXC8yNVwvMTcyMDUwXC9wcm9qZWN0c1wvMjc4Mjc0XC9hc3NldHNcL2ZkXC80OTk5Mzc2XC9kMGUyN2I1Mzg0MTgxOTEzNTUwOWY4ZmU3YmY2NjkwNS0xNjA3NjIyNzI5LnN2ZyJ9:frontify:EPBkv4IFrfiYi5C_oehea7Jr30rluxP8qKl5Ab1WN3k?width=2400"></img>
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
