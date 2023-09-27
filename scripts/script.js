function initMap() {
  $(document).ready(function () {
    // Initialize the Google Maps Places service
    // Declare default latitude, longitude, and zoom values
    const map = new google.maps.Map($("#map")[0], {
      center: { lat: 40.7128, lng: -74.006 },
      zoom: 15,
    });

    let hoveringInfoBox = false; 

    $(document).on(
      "mouseenter",
      ".restaurant-item, .featured-item",
      function () {
        const placeInfo = getPlaceInfo($(this).data("place-id")); // Fetch additional information for the place (e.g., contact details)
        showInfoBox($(this), placeInfo);
      }
    );

    $('#infoBox')
    .on('mouseenter', function () {
        hoveringInfoBox = true;
    })
    .on('mouseleave', function () {
        hoveringInfoBox = false;
        hideInfoBox();
    });

    $(document).on('mouseleave', '.restaurant-item', function () {
      if (!hoveringInfoBox) {
          hideInfoBox();
      }
  });

    const placesService = new google.maps.places.PlacesService(map);

    // Handle the "Search" button click event
    $("#searchButton").click(function () {
      const locationInput = $("#searchInput").val();

      // Perform a Geocoding request to convert the location input to coordinates
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: locationInput }, function (results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
          const location = results[0].geometry.location;

          // Define the search request for restaurants
          const request = {
            location: location,
            radius: 5000,
            types: ["restaurant"],
          };

          // Create a Bootstrap row for the grid
          const row = $("<div class='row'></div>");
          const featuredPlacesSection = $("<div class='col-md-12 mt-4'></div>");
          featuredPlacesSection.html("<h2>- Featured Places -</h2>");

          const featuredRequest = {
            location: location,
            radius: 5000, // Adjust the radius as needed
            types: ["restaurant"], // Adjust the types as needed
            keyword: "point_of_interest", // Add a keyword for featured places
          };

          placesService.nearbySearch(
            featuredRequest,
            function (results, status) {
              if (status === google.maps.places.PlacesServiceStatus.OK) {
                // Randomize featured places
                const shuffleFeaturedResults = shuffleArray(results);
                // Create a Bootstrap row for featured places
                const featuredRow = $("<div class='row'></div>");
                // Limit the number of featured places to 3
                const featuredResults = results.slice(0, 3);

                $.each(featuredResults, function (index, place) {
                  const col = $("<div class='col-md-4'></div>");
                  const featuredItem = $("<div class='featured-item'></div>");
                  featuredItem.css("height", "200px");
                  const featuredName = place.name;
                  const featuredAddress = place.vicinity;
                  const featuredRating = place.rating;
                  const featuredPhotos = place.photos;

                  // Create and append featured place list items
                  const listItem = $("<div class='featured-item'></div>");

                  if (featuredPhotos && featuredPhotos.length > 0) {
                    const photoUrl = featuredPhotos[0].getUrl({
                      maxWidth: 200,
                      maxHeight: 200,
                    });
                    const thumbnailImage = $("<img>")
                      .attr("src", photoUrl)
                      .css({
                        width: "100%",
                        height: "100%",
                        objectFit: "cover", // Maintain aspect ratio and cover the container
                      });
                    featuredItem.append(thumbnailImage);
                  }
                  // Display featured place name, address, and rating
                  const details = $("<div class='restaurant-details'></div>");
                  details.append(`<strong>${featuredName}</strong><br>`);
                  details.append(`<span>${featuredAddress}</span><br>`);
                  details.append(`Rating: ${featuredRating}`);

                  featuredItem.append(details); // Append to featuredItem

                  col.append(featuredItem); // Append to column
                  featuredRow.append(col); // Append to featuredRow
                });
                // Append the featured places row to the featuredPlacesSection
                featuredPlacesSection.append(featuredRow);
                featuredPlacesSection.append("<hr>");
              } else {
                console.error(
                  "Places API request for featured places failed:",
                  status
                );
              }
            }
          );

          row.append(featuredPlacesSection);

          const searchTitle = $("<h2></h2>");
          searchTitle.text(`- Places near ${locationInput} -`);
          row.append(searchTitle); // Append the title

          // Perform the Places API search
          placesService.nearbySearch(request, function (results, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
              // Render the list of restaurants
              const restaurantList = $("#restaurantList");
              restaurantList.empty();

              $.each(results, function (index, place) {
                const col = $("<div class='col-md-4'></div>");
                const restaurantItem = $("<div class='restaurant-item'></div>");
                restaurantItem.css("height", "150px");
                const restaurantName = place.name;
                const restaurantAddress = place.vicinity;
                const restaurantRating = place.rating;
                const photos = place.photos;
                

                // Create and append restaurant list items
                const listItem = $("<div class='restaurant-item'></div>");

                if (photos && photos.length > 0) {
                  const photoUrl = photos[0].getUrl({
                    maxWidth: 200,
                    maxHeight: 200,
                  });
                  const thumbnailImage = $("<img>").attr("src", photoUrl).css({
                    width: "100%",
                    height: "100%",
                    objectFit: "cover", // Maintain aspect ratio and cover the container
                  });
                  restaurantItem.append(thumbnailImage);
                }

                // Display restaurant name, address, and rating
                const details = $("<div class='restaurant-details'></div>");
                details.append(`<strong>${restaurantName}</strong><br>`);
                details.append(`<span>${restaurantAddress}</span><br>`);
                details.append(`Rating: ${restaurantRating}`);

                restaurantItem.append(details); // Append to restaurantItem

                col.append(restaurantItem); // Append to column
                row.append(col); // Append to row
              });

              restaurantList.append(row); // Append the row to the restaurantList container
            } else {
              console.error("Places API request failed:", status);
            }
          });
        } else {
          console.error("Geocoding request failed:", status);
        }
      });
    });
  });
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Function to generate placeholder place details
function getPlaceInfo(placeId) {
  // For demonstration purposes, create placeholder information
  const placeInfo = {
    address: "69 Baloney Ave, Somewhere, The City",
    openingTimes: [
      "Mon-Fri: 9:00 AM - 10:00 PM",
      "Sat-Sun: 10:00 AM - 9:00 PM",
    ],
    website: "https://www.example.com",
    phone: "123-456-7890",
  };

  // Format the information as HTML
  const infoHTML = `
  <div class="place-info">
  <div class="info-row">
      <span class="info-label">Address:</span>
      <span class="info-value">${placeInfo.address}</span>
  </div>
  <div class="info-row">
      <span class="info-label">Opening Times:</span>
      <ul class="opening-times-list">
          ${placeInfo.openingTimes
              .map((time) => `<li>${time}</li>`)
              .join('')}
      </ul>
  </div>
  <div class="info-row">
      <span class="info-label">Website:</span>
      <a class="info-link" href="${placeInfo.website}" target="_blank">${placeInfo.website}</a>
  </div>
  <div class="info-row">
      <span class="info-label">Phone:</span>
      <span class="info-value">${placeInfo.phone}</span>
  </div>
</div>
`;

  return infoHTML;
}

// Function to show the floating info box
function showInfoBox(item, info) {
  const infoBox = $("#infoBox");
  const offset = item.offset();
  const height = item.height();

  infoBox.html(info);

  infoBox.css({
    top: offset.top + height + 10, // Adjust the position as needed
    left: offset.left,
  });

  infoBox.show();
}

// Function to hide the floating info box
function hideInfoBox() {
  $("#infoBox").hide();
}
