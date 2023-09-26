function initMap() {
$(document).ready(function () {
  const mapOptions = {
    center: { lat: 40.7128, lng: -74.006 },
    zoom: 15,
  };
  

  const map = new google.maps.Map($("#map")[0], mapOptions);
  const placesService = new google.maps.places.PlacesService(map);
  

  // Function to create and append a list of places
  function createPlaceList(container, results, itemClass, itemHeight, title) {
    container.empty();
    const row = $("<div class='row'></div>");

    $.each(results, function (index, place) {
      const col = $(`<div class='col-md-4'></div>`);
      const item = $(`<div class='${itemClass}'></div>`);
      item.css("height", itemHeight);

      const name = place.name;
      const address = place.vicinity;
      const rating = place.rating;
      const photos = place.photos;

      // Create and append place list items
      const listItem = $("<div class='restaurant-item'></div>");

      if (photos && photos.length > 0) {
        const photoUrl = photos[0].getUrl({
          maxWidth: 200,
          maxHeight: 200,
        });
        const thumbnailImage = $("<img>").attr("src", photoUrl).css({
          width: "100%",
          height: "100%",
          objectFit: "cover",
        });
        item.append(thumbnailImage);
      }

      // Display place name, address, and rating
      const details = $("<div class='restaurant-details'></div>");
      details.append(`<strong>${name}</strong><br>`);
      details.append(`<span>${address}</span><br>`);
      details.append(`Rating: ${rating}`);

      item.append(details); // Append to item
      col.append(item); // Append to column
      row.append(col); // Append to row
    });

    container.append(row); // Append the row to the container

    // Add a title for the section
    if (title) {
      const sectionTitle = $("<h2></h2>");
      sectionTitle.text(title);
      container.prepend(sectionTitle); // Prepend the title
    }
  }

  // Function to fetch and display places based on a search request
  function fetchAndDisplayPlaces(request, container, itemClass, itemHeight, title) {
    placesService.nearbySearch(request, function (results, status) {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        createPlaceList(container, results, itemClass, itemHeight, title);
      } else {
        console.error("Places API request failed:", status);
      }
    });
  }

  // Handle the "Search" button click event
  $("#searchButton").click(function () {
    const locationInput = $("#searchInput").val();

    // Perform a Geocoding request to convert the location input to coordinates
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: locationInput }, function (results, status) {
      if (status === google.maps.GeocoderStatus.OK) {
        const location = results[0].geometry.location;

        // Define the search request for restaurants
        const restaurantRequest = {
          location: location,
          radius: 5000,
          types: ["restaurant"],
        };

        // Define the search request for featured places
        const featuredRequest = {
          location: location,
          radius: 5000,
          types: ["restaurant"],
          keyword: "point_of_interest",
        };

        const restaurantList = $("#restaurantList");
        const featuredPlacesList = $("#featuredPlacesList");

        // Fetch and display restaurant places
        fetchAndDisplayPlaces(restaurantRequest, restaurantList, "restaurant-item", "150px", `- Places near ${locationInput} -`);

        // Fetch and display featured places
        fetchAndDisplayPlaces(featuredRequest, featuredPlacesList, "featured-item", "200px", "- Featured Places -");
      } else {
        console.error("Geocoding request failed:", status);
      }
    });
  });

  // Handle mouse enter and leave events for .restaurant-item and .featured-item
  $(document).on("mouseenter mouseleave", ".restaurant-item, .featured-item", function (event) {
    const placeInfo = getPlaceInfo($(this).data("place-id"));
    showInfoBox($(this), placeInfo, event.type === "mouseenter");
  });

  function showInfoBox(item, info, show) {
    const infoBox = $("#infoBox");
    const offset = item.offset();
    const height = item.height();

    infoBox.html(info);

    if (show) {
      infoBox.css({
        top: offset.top + height + 10,
        left: offset.left,
      });
      infoBox.show();
    } else {
      infoBox.hide();
    }
  }

  function getPlaceInfo(placeId) {
    // You can make an API request here to fetch additional information
    // For demonstration purposes, let's assume it's a contact phone number
    // Replace this with your actual API call
    return "Contact: 123-456-7890";
  }
});
}
