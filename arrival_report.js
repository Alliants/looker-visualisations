// Include custom icons and styles
const styles = document.createElement('style');
styles.textContent = `
  .arrival-card {
    border-radius: 10px;
    padding: 20px;
    width: 100%;
    box-sizing: border-box;
    font-family: Lato, sans-serif;
    font-size: 4vw;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
  }
  .arrival-header, .arrival-details, .arrival-details-nights {
    flex: 1;
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
    display: flex;
    align-items: center;
  }
  .icon {
    margin-right: 10px;
    width: 1em;
    height: 1em;
  }
`;

looker.plugins.visualizations.add({
  create: function (element, config) {
    element.style.fontFamily = 'Lato, sans-serif';
    element.appendChild(styles); // Append styles to the document
  },
  updateAsync: function (data, element, config, queryResponse, details, done) {
    element.innerHTML = ''; // Clear any existing content

    // Extracting fields in the specific order
    const fields = queryResponse.fields.dimension_like;

    // Check if there are at least 7 fields available
    if (fields.length < 7) {
      const errorMessage = document.createElement('div');
      errorMessage.textContent = 'Insufficient data fields';
      element.appendChild(errorMessage);
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

    // Calculate dynamic line height based on container height
    const containerHeight = element.clientHeight;
    // const lineHeight = containerHeight / 18;
    // const statusLineHeight = lineHeight * 0.4;

    // Construct the arrival card with dynamic line height
    const arrivalCard = document.createElement('div');
    arrivalCard.className = 'arrival-card';
    arrivalCard.style.lineHeight = `14vh`;
    arrivalCard.style.borderRadius = '10px';
    arrivalCard.style.padding = '20px';
    arrivalCard.style.width = '100%';
    arrivalCard.style.boxSizing = 'border-box';
    arrivalCard.style.fontSize = '4vw';
    arrivalCard.style.display = 'flex';
    arrivalCard.style.flexDirection = 'column';
    arrivalCard.style.justifyContent = 'space-between';
    arrivalCard.style.height = '100%';

    const arrivalHeader = document.createElement('div');
    arrivalHeader.style.className = 'arrival-header';
    arrivalHeader.style.display = 'flex';
    arrivalHeader.style.justifyContent = 'space-between';
    arrivalHeader.style.alignItems = 'center';

    const title = document.createElement('div');
    title.textContent = 'Arrival Report';

    const status = document.createElement('div');
    status.className = 'status';
    status.style.lineHeight = `7vw`;
    status.style.background = '#ffb921';
    status.style.padding = '0px 10px';
    status.style.borderRadius = '10px';
    status.style.color = 'white';
    status.style.fontWeight = 'bold';
    status.textContent = `Due in - ${due_in_time}`;

    arrivalHeader.appendChild(title);
    arrivalHeader.appendChild(status);

    const arrivalDetails = document.createElement('div');
    arrivalDetails.className = 'arrival-details';
    arrivalDetails.style.display = 'flex';
    arrivalDetails.style.flexDirection = 'column';

    const locationDiv = document.createElement('div');
    const strongLocation = document.createElement('strong');
    strongLocation.textContent = location;
    locationDiv.appendChild(strongLocation);

    const arrivalDetailsNights = document.createElement('div');
    arrivalDetailsNights.className = 'arrival-details-nights';
    arrivalDetailsNights.style.justifyContent = 'space-between';

    const dateRangeDiv = document.createElement('div');
    const dateRangeImg = document.createElement('img');
    dateRangeImg.className = 'icon';
    dateRangeImg.src = 'https://cdn-assets-cloud.frontify.com/s3/frontify-cloud-files-us/eyJwYXRoIjoiZnJvbnRpZnlcL2FjY291bnRzXC8yNVwvMTcyMDUwXC9wcm9qZWN0c1wvMjc4Mjc0XC9hc3NldHNcLzJiXC80OTk5MTQ0XC83MDVmMzYzMGFhMTM1NTcxYTAzYzNmYzk3ODE4MDVmMi0xNjA3NjIyMzc4LnN2ZyJ9:frontify:DsE91qZoxdtRg4QXzR3qxmhTvGoA4k703e74VvXnx6Q?width=2400';
    dateRangeImg.style.width = '1em';
    dateRangeDiv.appendChild(dateRangeImg);
    dateRangeDiv.appendChild(document.createTextNode(`${start_date} - ${end_date}`));

    const nightsDiv = document.createElement('div');
    const nightsImg = document.createElement('img');
    nightsImg.className = 'icon';
    nightsImg.src = 'https://cdn-assets-cloud.frontify.com/s3/frontify-cloud-files-us/eyJwYXRoIjoiZnJvbnRpZnlcL2FjY291bnRzXC8yNVwvMTcyMDUwXC9wcm9qZWN0c1wvMjc4Mjc0XC9hc3NldHNcL2Y4XC80OTk5MDU4XC9hM2MzM2MyZmVmZTYyYTQ3NTBlZDkzZDI2ODc0YWNkNC0xNjA3NjIyMTkyLnN2ZyJ9:frontify:cLkhh1-xYamDkYHdQWOtmVNKFRElcvUisK6PfG7JUk0?width=2400';
    nightsImg.style.width = '1em';
    nightsDiv.appendChild(nightsImg);
    nightsDiv.appendChild(document.createTextNode(`${num_nights}`));

    arrivalDetailsNights.appendChild(dateRangeDiv);
    arrivalDetailsNights.appendChild(nightsDiv);

    const guestsDiv = document.createElement('div');
    const guestsImg = document.createElement('img');
    guestsImg.className = 'icon';
    guestsImg.src = 'https://cdn-assets-cloud.frontify.com/s3/frontify-cloud-files-us/eyJwYXRoIjoiZnJvbnRpZnlcL2FjY291bnRzXC8yNVwvMTcyMDUwXC9wcm9qZWN0c1wvMjc4Mjc0XC9hc3NldHNcLzMzXC80OTk5MDY5XC84NTM1MzZiMTJmM2YwMDc3YTVjNmEyM2Q1YzIwYjZiYS0xNjA3NjIyMTkyLnN2ZyJ9:frontify:XKUzuk-yTmtyqPmtN1vMYqipmXGVfqtUtmLso-gWDxM?width=2400';
    guestsImg.style.width = '1em';
    guestsDiv.appendChild(guestsImg);
    guestsDiv.appendChild(document.createTextNode(`${num_guests} guests`));

    const roomsDiv = document.createElement('div');
    const roomsImg = document.createElement('img');
    roomsImg.className = 'icon';
    roomsImg.src = 'https://cdn-assets-cloud.frontify.com/s3/frontify-cloud-files-us/eyJwYXRoIjoiZnJvbnRpZnlcL2FjY291bnRzXC8yNVwvMTcyMDUwXC9wcm9qZWN0c1wvMjc4Mjc0XC9hc3NldHNcL2ZkXC80OTk5Mzc2XC9kMGUyN2I1Mzg0MTgxOTEzNTUwOWY4ZmU3YmY2NjkwNS0xNjA3NjIyNzI5LnN2ZyJ9:frontify:EPBkv4IFrfiYi5C_oehea7Jr30rluxP8qKl5Ab1WN3k?width=2400';
    roomsImg.style.width = '1em';
    roomsDiv.appendChild(roomsImg);
    roomsDiv.appendChild(document.createTextNode(`Rooms ${room_numbers}`));

    arrivalDetails.appendChild(locationDiv);
    arrivalDetails.appendChild(arrivalDetailsNights);
    arrivalDetails.appendChild(guestsDiv);
    arrivalDetails.appendChild(roomsDiv);

    arrivalCard.appendChild(arrivalHeader);
    arrivalCard.appendChild(arrivalDetails);

    element.appendChild(arrivalCard);

    done();
  }
});
