// Include custom icons and styles
const icons = `
<style>
  .arrival-card {
    border-radius: 10px;
    padding: 20px;
    width: 100%;
    box-sizing: border-box;
    font-family: Arial, sans-serif;
    font-size: 4vw;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%; /* Ensure full height usage */
  }
  .arrival-header, .arrival-details, .arrival-details-nights {
    flex: 1;
  }
  .arrival-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    line-height: 4vw; /* Overarching line height */
  }
  .arrival-header .status {
    background: #ffb921;
    padding: 5px 10px;
    border-radius: 10px;
    color: white;
    font-weight: bold;
    line-height: 2vw; /* Specific line height for status */
  }
  .arrival-details, .arrival-details-nights {
    line-height: 3vw; /* Line height for details */
  }
  .arrival-details div {
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

    // Calculate dynamic font size and line height
    const containerHeight = element.clientHeight;
    const containerWidth = element.clientWidth;
    const minContainerSize = Math.min(containerHeight, containerWidth);
    const baseFontSize = minContainerSize / 5; // Use for setting a fixed base font size
    const lineHeight = containerHeight / 26; // Adjust this value if needed

    // Adjust the height of the viz-container to fit within the parent element
    const vizContainer = document.createElement('div');
    vizContainer.style.height = `${containerHeight - 20}px`; // Adjust 20px to the margin/padding as per your requirement
    vizContainer.style.overflow = 'hidden'; // Ensure content doesn't overflow

    // Construct the arrival card with dynamic line height
    const arrivalCard = `
      <div class="arrival-card" style="line-height: ${lineHeight}vw;">
        <div class="arrival-header">
          <div>Arrival Report</div>
          <div class="status" style="line-height: ${lineHeight * 0.4}vw;">Due in - ${due_in_time}</div>
        </div>
        <div class="arrival-details">
          <div><strong>${location}</strong></div>
          <div class="arrival-details-nights" style="justify-content: space-between;">
            <div>
              <img class="icon" src="https://cdn-assets-cloud.frontify.com/s3/frontify-cloud-files-us/eyJwYXRoIjoiZnJvbnRpZ"></img>
              ${start_date} - ${end_date}
            </div>
            <div class="nights">
              <img class="icon" src="https://cdn-assets-cloud.frontify.com/s3/frontify-cloud-files-us/e"></img>
              ${num_nights}
            </div>
          </div>
          <div>
            <img class="icon" src="https://cdn-assets-cloud.frontify.com/s3/frontify-cloud-files-us/"></img>
            ${num_guests} guests
          </div>
          <div>
            <img class="icon" src="https://cdn-assets-cloud.frontify.com/s3/frontify-cloud-files-us/"></img>
            Rooms ${room_numbers}
          </div>
        </div>
      </div>
    `;
    
    // Append the arrival card to the vizContainer
    vizContainer.innerHTML = arrivalCard;

    // Append the vizContainer to the element
    element.appendChild(vizContainer);

    done();
  }
});
