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

          // Perform the Places API search
          placesService.nearbySearch(request, function (results, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
              // Render the list of restaurants
              const restaurantList = $("#restaurantList");
              restaurantList.empty();

              // Create a Bootstrap row for the grid
              const row = $("<div class='row'></div>");

              $.each(results, function (index, place) {
                const col = $("<div class='col-md-4'></div>");
                const restaurantItem = $("<div class='restaurant-item'></div>");
                const restaurantName = place.name;
                const restaurantAddress = place.vicinity;
                const restaurantRating = place.rating;
                const photos = place.photos;

                // Create and append restaurant list items
                const listItem = $("<div class='restaurant-item'></div>");

                if (photos && photos.length > 0) {
                  const photoUrl = photos[0].getUrl({
                    maxWidth: 100,
                    maxHeight: 100,
                  });
                  const thumbnailImage = $("<img>").attr("src", photoUrl);
                  restaurantItem.append(thumbnailImage); // Append to restaurantItem
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


const newAPI = "AIzaSyCr4L-ujpoWQRdl3HxzNOAtZhT3xGzs6zg";
