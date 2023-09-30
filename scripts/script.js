let placesService;
$(document).ready(function () {
  const map = initMap();
  let hoveringInfoBox = false;

  $(document).on("mouseenter", ".restaurant-item, .featured-item", function () {
    const placeInfo = getPlaceInfo($(this).data("place-id"));
    showInfoBox($(this), placeInfo);
  });

  $("#infoBox")
    .on("mouseenter", function () {
      hoveringInfoBox = true;
    })
    .on("mouseleave", function () {
      hoveringInfoBox = false;
      hideInfoBox();
    });

  $(document).on("mouseleave", ".restaurant-item", function () {
    if (!hoveringInfoBox) {
      hideInfoBox();
    }
  });

  $(document).on('click', '.like-button', handleLikeButtonClick);

  $("#searchButton").click(handleSearchButtonClick);

  $("#toggleSidebarButton").click(toggleSidebar);

  window.addEventListener('load', displaySavedItems);

  $("#askButton").click(handleAskButtonClick);
});

function initMap() {
  const defaultLocation = { lat: 40.7128, lng: -74.006 };
  const map = new google.maps.Map($("#map")[0], {
    center: defaultLocation,
    zoom: 15,
  });

  placesService = new google.maps.places.PlacesService(map);

  return map;
}

function handleLikeButtonClick() {
  const placeId = $(this).data('place-id');
  const restaurantName = $(this).data('restaurant-name');
  const likedRestaurants = JSON.parse(localStorage.getItem('likedRestaurants')) || [];

  const existingIndex = likedRestaurants.findIndex(item => item.placeId === placeId);

  if (existingIndex > -1) {
    // Remove the restaurant from likedRestaurants
    likedRestaurants.splice(existingIndex, 1);
  } else {
    // Add the restaurant to likedRestaurants
    likedRestaurants.push({ placeId, restaurantName });
  }

  localStorage.setItem('likedRestaurants', JSON.stringify(likedRestaurants));
  $(this).text(existingIndex > -1 ? '🖤' : '❤️');
  displaySavedItems(); // Update the sidebar
}

function handleSearchButtonClick() {
  const locationInput = $("#searchInput").val();

  const geocoder = new google.maps.Geocoder();
  geocoder.geocode({ address: locationInput }, function (results, status) {
    if (status === google.maps.GeocoderStatus.OK) {
      const location = results[0].geometry.location;
      const request = createNearbySearchRequest(location);

      const row = $("<div class='row'></div>");
      const featuredPlacesSection = createFeaturedPlacesSection(location);

      placesService.nearbySearch(request, function (results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          renderRestaurantList(results, row);
        } else {
          console.error("Places API request failed:", status);
        }
      });

      row.append(featuredPlacesSection);

      const searchTitle = $("<h2></h2>");
      searchTitle.text(`- Places near ${locationInput} -`);
      row.append(searchTitle);

      const restaurantList = $("#restaurantList");
      restaurantList.empty();
      restaurantList.append(row);
    } else {
      console.error("Geocoding request failed:", status);
    }
  });
}

function createNearbySearchRequest(location) {
  return {
    location: location,
    radius: 1000,
    types: ["restaurant"],
  };
}

function createFeaturedPlacesSection(location) {
  const featuredPlacesSection = $("<div class='col-md-12 mt-4'></div>");
  featuredPlacesSection.html("<h2>- Featured Places -</h2>");

  const featuredRequest = {
    location: location,
    radius: 1000,
    types: ["restaurant"],
    keyword: "point_of_interest",
  };

  placesService.nearbySearch(featuredRequest, function (results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      renderFeaturedPlaces(results, featuredPlacesSection);
    } else {
      console.error("Places API request for featured places failed:", status);
    }
  });

  return featuredPlacesSection;
}

function renderFeaturedPlaces(results, container) {
  const shuffleFeaturedResults = shuffleArray(results);
  const featuredResults = shuffleFeaturedResults.slice(0, 3);

  const featuredRow = $("<div class='row'></div>"); 

  $.each(featuredResults, function (index, place) {
    const col = $("<div class='col-md-4'></div>");
    const featuredItem = createFeaturedItem(place);
    col.append(featuredItem);
    featuredRow.append(col); 
  });

  container.append(featuredRow); 
  container.append("<hr>");
}

function createFeaturedItem(place) {
  const featuredItem = $("<div class='featured-item'></div>");
  featuredItem.css("height", "150px");

  const likeButton = createLikeButton(place.place_id);
  featuredItem.append(likeButton);

  if (place.photos && place.photos.length > 0) {
    const photoUrl = place.photos[0].getUrl({
      maxWidth: 200,
      maxHeight: 200,
    });
    const thumbnailImage = $("<img>").attr("src", photoUrl).css({
      width: "100%",
      height: "100%",
      objectFit: "cover",
    });
    featuredItem.append(thumbnailImage);
  }

  const details = createRestaurantDetails(place);
  featuredItem.append(details);

  return featuredItem;
}

function createLikeButton(placeId) {
  const likeButton = $("<button class='like-button'></button>")
    .data('place-id', placeId)
    .text('🖤');
  return likeButton;
}

function createRestaurantDetails(place) {
  const details = $("<div class='restaurant-details'></div>");
  details.append(`<strong>${place.name}</strong><br>`);
  details.append(`<span>${place.vicinity}</span><br>`);
  details.append(`Rating: ${place.rating}<br>`);
  details.append(`Price Level: ${place.price_level}`);
  return details;
}

function renderRestaurantList(results, container) {
  $.each(results, function (index, place) {
    const col = $("<div class='col-md-4'></div>");
    const restaurantItem = createRestaurantItem(place);
    col.append(restaurantItem);
    container.append(col);
  });
}

function createRestaurantItem(place) {
  const restaurantItem = $("<div class='restaurant-item'></div>");
  restaurantItem.css("height", "140px");

  const likeButton = createLikeButton(place.place_id);
  restaurantItem.append(likeButton);

  if (place.photos && place.photos.length > 0) {
    const photoUrl = place.photos[0].getUrl({
      maxWidth: 300,
      maxHeight: 300,
    });
    const thumbnailImage = $("<img>").attr("src", photoUrl).css({
      width: "100%",
      height: "100%",
      objectFit: "cover",
    });
    restaurantItem.append(thumbnailImage);
  }

  const details = createRestaurantDetails(place);
  restaurantItem.append(details);

  return restaurantItem;
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function getPlaceInfo(placeId) {
  const placeInfo = {
    address: "69 Baloney Ave, Somewhere, The City",
    openingTimes: [
      "Mon-Fri: 9:00 AM - 10:00 PM",
      "Sat-Sun: 10:00 AM - 9:00 PM",
    ],
    website: "https://www.example.com",
    phone: "123-456-7890",
  };

  const infoHTML = `
    <div class="place-info">
      <div class="info-row">
          <span class="info-label">Address:</span>
          <span class="info-value">${placeInfo.address}</span>
      </div>
      <div class="info-row">
          <span class="info-label">Opening Times:</span>
          <ul class="opening-times-list">
              ${placeInfo.openingTimes.map((time) => `<li>${time}</li>`).join("")}
          </ul>
      </div>
      <div class="info-row">
          <span class="info-label">Website:</span>
          <a class="info-link" href="${placeInfo.website}" target="_blank">${
    placeInfo.website
  }</a>
      </div>
      <div class="info-row">
          <span class="info-label">Phone:</span>
          <span class="info-value">${placeInfo.phone}</span>
      </div>
    </div>
  `;

  return infoHTML;
}

function showInfoBox(item, info) {
  const infoBox = $("#infoBox");

  const offset = item.offset();
  const height = item.height();

  infoBox.html(info);
  infoBox.css({
    position: "absolute",
    top: offset.top + height + 10,
    left: offset.left,
  });

  infoBox.show();
}

function hideInfoBox() {
  $("#infoBox").hide();
}

function openSidebar() {
  document.getElementById("sidebar").style.width = "250px";
}

function closeSidebar() {
  document.getElementById("sidebar").style.width = "0";
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('show-sidebar');
}

function displaySavedItems() {
  const likedRestaurants = JSON.parse(localStorage.getItem('likedRestaurants')) || [];
  const savedItemsContainer = $('#savedItems');
  savedItemsContainer.empty();

  if (likedRestaurants.length === 0) {
    savedItemsContainer.html('<p>No saved restaurants yet.</p>');
  } else {
    likedRestaurants.forEach(function (restaurant) {
      const item = $('<div class="saved-item"></div>');
      item.text(restaurant.placeId);
      savedItemsContainer.append(item);
    });
  }
}

displaySavedItems();

// OPENAI API /////////////////////////////////

function handleAskButtonClick() {
  const userQuestion = document.getElementById("userInput").value;
  if (userQuestion.trim() === "") {
    alert("Please enter a question.");
    return;
  }

  const settings = {
    async: true,
    crossDomain: true,
    url: "https://chatgpt-api8.p.rapidapi.com/",
    method: "POST",
    headers: {
      "content-type": "application/json",
      "X-RapidAPI-Key": "dd689b8e4dmshbfcda1d5393a655p18772cjsnea1824fa60c8",
      "X-RapidAPI-Host": "chatgpt-api8.p.rapidapi.com",
    },
    processData: false,
    data: JSON.stringify([
      {
        content: userQuestion,
        role: "user",
      },
    ]),
  };

  $.ajax(settings)
    .done(function (response) {
      handleApiResponse(response, userQuestion);
    })
    .fail(function (jqXHR, textStatus, errorThrown) {
      console.error("API Request Failed:", textStatus, errorThrown);
      displayChatMessage(userQuestion, "user");
      displayChatMessage(
        "An error occurred while processing your request. Please try again later.",
        "chatbot"
      );
      document.getElementById("userInput").value = "";
    });
}

function displayChatMessage(message, role) {
  const chatbotResponseDiv = document.getElementById("chatbotResponse");
  const messageParagraph = document.createElement("p");
  messageParagraph.innerHTML = `<strong>${
    role === "user" ? "User" : "Chatbot"
  }:</strong> ${message}`;
  chatbotResponseDiv.appendChild(messageParagraph);
}

function handleApiResponse(response, userQuestion) {
  if (response && response.text) {
    const chatbotAnswer = response.text;
    displayChatMessage(userQuestion, "user");
    displayChatMessage(chatbotAnswer, "chatbot");
    document.getElementById("userInput").value = "";
  } else {
    console.error("API response does not contain chatbot content:", response);
    displayChatMessage(
      "An error occurred while processing your request. Please try again later.",
      "chatbot"
    );
  }
}
