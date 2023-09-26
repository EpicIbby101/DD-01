function initMap() {
  $(document).ready(function () {
    // Initialize the Google Maps Places service
    // Declare default latitude, longitude, and zoom values
    const map = new google.maps.Map($("#map")[0], {
      center: { lat: 40.7128, lng: -74.006 },
      zoom: 15,
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
            keyword: "featured", // Add a keyword for featured places
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
                        width: "100%", // Set the width to 100%
                        height: "100%", // Set the height to 100%
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
                    width: "100%", // Set the width to 100%
                    height: "100%", // Set the height to 100%
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

const newAPI = "AIzaSyCr4L-ujpoWQRdl3HxzNOAtZhT3xGzs6zg";
