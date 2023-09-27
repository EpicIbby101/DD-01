function initMap() {
  $(document).ready(function () {
    // Initialize the Google Maps Places service
    // Declare default latitude, longitude, and zoom values
    const map = new google.maps.Map($("#map")[0], {
      center: { lat: 40.7128, lng: -74.006 },
      zoom: 15,
    });

    $(document).on("mouseover", ".restaurant-item, .featured-item", function () {
      const placeId = $(this).data("place-id");
      const offset = $(this).offset(); // Get the offset of the hovered item
      const height = $(this).height(); // Get the height of the hovered item
      const info = getPlaceInfo(placeId);
      getPlaceInfo(placeId);

      const infoBoxTop = offset.top + height + 10; // Adjust the vertical position as needed
      const infoBoxLeft = offset.left;

      showInfoBox(infoBoxTop, infoBoxLeft, info);
    });

    let infoBoxTimer; // Timer to delay hiding the InfoBox

    $(document).on("mouseout", ".restaurant-item, .featured-item", function () {
      // Delay hiding the InfoBox by 500 milliseconds
      infoBoxTimer = setTimeout(() => {
        hideInfoBox();
      }, 500);
    });

    // Cancel the InfoBox hiding if the cursor returns to the item
    $(document).on("mouseover", "#infoBox", function () {
      clearTimeout(infoBoxTimer);
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
            radius: 1000,
            types: ["restaurant"],
          };

          // Create a Bootstrap row for the grid
          const row = $("<div class='row'></div>");
          const featuredPlacesSection = $("<div class='col-md-12 mt-4'></div>");
          featuredPlacesSection.html("<h2>- Featured Places -</h2>");

          const featuredRequest = {
            location: location,
            radius: 1000, // Adjust the radius as needed
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
                  featuredItem.attr("data-place-id", place.place_id);
                  featuredItem.css("height", "200px");
                  const featuredName = place.name;
                  const featuredAddress = place.vicinity;
                  const featuredRating = place.rating;
                  const featuredPhotos = place.photos;

                  featuredItem.hover(
                    function () {
                      const placeId = $(this).data("place-id");
                      getPlaceInfo(placeId);
                    },
                    function () {
                      hideInfoBox();
                    }
                  );

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
                restaurantItem.attr("data-place-id", place.place_id);
                restaurantItem.css("height", "150px");
                const restaurantName = place.name;
                const restaurantAddress = place.vicinity;
                const restaurantRating = place.rating;
                const photos = place.photos;

                restaurantItem.hover(
                  function () {
                    const placeId = $(this).data("place-id");
                    getPlaceInfo(placeId);
                  },
                  function () {
                    hideInfoBox();
                  }
                );

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

function getPlaceInfo(placeId) {
  // Create a request object for place details
  const request = {
    placeId: placeId,
    fields: [
      "name",
      "formatted_address",
      "opening_hours",
      "website",
      "formatted_phone_number",
    ],
  };

  // Initialize the Places service
  const placesService = new google.maps.places.PlacesService(map);

  // Request place details
  placesService.getDetails(request, function (place, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      // Handle the response and display the information
      const name = place.name;
      const address = place.formatted_address;
      let openingHours = "N/A";
      if (place.opening_hours && place.opening_hours.weekday_text) {
        openingHours = place.opening_hours.weekday_text.join("<br>");
      }
      const website = place.website
        ? `<a href="${place.website}" target="_blank">${place.website}</a>`
        : "N/A";
      const phoneNumber = place.formatted_phone_number
        ? place.formatted_phone_number
        : "N/A";

      // Create a formatted information string
      const info = `
        <strong>Name:</strong> ${name}<br>
        <strong>Address:</strong> ${address}<br>
        <strong>Opening Hours:</strong><br>${openingHours}<br>
        <strong>Website:</strong> ${website}<br>
        <strong>Phone Number:</strong> ${phoneNumber}
      `;

      // Show the information in the floating info box
      showInfoBox(info);
    } else {
      console.error("Error fetching place details:", status);
    }
  });
}



// Function to show the floating info box
function showInfoBox(top, left, info) {
  const infoBox = $("#infoBox");
  infoBox.css({
    top: top + "px",
    left: left + "px",
  });
  infoBox.html(info); // Set the HTML content of the info box
  infoBox.show();
}

// Function to hide the floating info box
function hideInfoBox() {
  $("#infoBox").hide();
}
