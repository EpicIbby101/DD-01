$(document).ready(function() {
  // Initialize the Google Maps Places service
  // Declare default latitude, longitude and zoom values
  const map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 40.7128, lng: -74.0060 },
    zoom: 15,
  });

  const placesService = new google.maps.places.PlacesService(map);

  // Handle the "Search" button click event
  $("#searchButton").click(function() {
    const locationInput = $("#searchInput").val();

    // Perform a Geocoding request to convert the location input to coordinates
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: locationInput }, function(results, status) {
      if (status === google.maps.GeocoderStatus.OK) {
        const location = results[0].geometry.location;

        // Define the search request for restaurants
        const request = {
          location: location,
          radius: 5000,
          types: ["restaurant"],
        };

        // Perform the Places API search
        placesService.nearbySearch(request, function(results, status) {
          if (status === google.maps.places.PlacesServiceStatus.OK) {
            // Render the list of restaurants
            const restaurantList = $("#restaurantList");
            restaurantList.empty();

            $.each(results, function(index, place) {
              const restaurantName = place.name;
              const restaurantAddress = place.vicinity;
              const restaurantRating = place.rating;
              const photos = place.photos;

              // Create and append restaurant list items
              const listItem = $("<div class='restaurant-item'></div>");
              
              if (photos && photos.length > 0) {
                const photoUrl = photos[0].getUrl({ maxWidth: 100, maxHeight: 100 });
                const thumbnailImage = $("<img>").attr("src", photoUrl);
                listItem.append(thumbnailImage);
              }

              // Display restaurant name, address, and rating
              const details = $("<div class='restaurant-details'></div>");
              details.append(`<strong>${restaurantName}</strong><br>`);
              details.append(`<span>${restaurantAddress}</span><br>`);
              details.append(`Rating: ${restaurantRating}`);

              listItem.append(details);

              restaurantList.append(listItem);
            });
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



const newAPI = 'AIzaSyCr4L-ujpoWQRdl3HxzNOAtZhT3xGzs6zg'
