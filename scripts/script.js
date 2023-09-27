function initMap() {
  $(document).ready(function () {
    // Initialize the Google Maps Places service
    // Declare default latitude, longitude, and zoom values
    const map = new google.maps.Map($("#map")[0], {
      center: { lat: 40.7128, lng: -74.006 },
      zoom: 15,
    });

    $(document).on("mouseenter", ".restaurant-item, .featured-item", function () {
      const placeInfo = getPlaceInfo($(this).data("place-id")); // Fetch additional information for the place (e.g., contact details)
      showInfoBox($(this), placeInfo);
    });

    $(document).on("mouseleave", ".restaurant-item, .featured-item", function () {
      hideInfoBox();
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

function getPlaceInfo(placeId) {
  // You can make an API request here to fetch additional information
  // For demonstration purposes, let's assume it's a contact phone number
  // Replace this with your actual API call
  return "Contact: 123-456-7890";
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

// new API (openai API)

// Function to display a chat message in the chat interface
function displayChatMessage(message, role) {
  const chatbotResponseDiv = document.getElementById('chatbotResponse');
  const messageParagraph = document.createElement('p');
  messageParagraph.innerHTML = `<strong>${role === 'user' ? 'User' : 'Chatbot'}:</strong> ${message}`;
  chatbotResponseDiv.appendChild(messageParagraph);
}
// Handle user's click on the "Ask" button
document.getElementById('askButton').addEventListener('click', function () {
  // Define userQuestion within the scope of this function
  const userQuestion = document.getElementById('userInput').value;
  if (userQuestion.trim() === '') {
    alert('Please enter a question.');
    return;
  }
  // Make the API request
  const settings = {
    async: true,
    crossDomain: true,
    url: 'https://chatgpt-api8.p.rapidapi.com/',
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'X-RapidAPI-Key': 'dd689b8e4dmshbfcda1d5393a655p18772cjsnea1824fa60c8',
      'X-RapidAPI-Host': 'chatgpt-api8.p.rapidapi.com'
    },
    processData: false,
    data: JSON.stringify([
      {
        "content": userQuestion, // Using userQuestion here
        "role": "user"
      }
    ])
  };
  // Make the API request
  $.ajax(settings)
    .done(function (response) {
      // Console log the API response
      console.log('API Response:', response);

      // Check if the response contains the chatbot's answer
      if (Array.isArray(response) && response.length > 0 && response[0].content) {
        const chatbotAnswer = response[0].content;

        // Display the chatbot's response
        displayChatMessage(userQuestion, 'user'); // Display user's message
        displayChatMessage(chatbotAnswer, 'chatbot'); // Display chatbot's response

        // Clear the user input field
        document.getElementById('userInput').value = '';
      } else {
        // Handle cases where the response does not contain chatbot content
        console.error('API response does not contain chatbot content:', response);

        // Display an appropriate error message to the user
        displayChatMessage('An error occurred while processing your request. Please try again later.', 'chatbot');
      }
    })
    .fail(function (jqXHR, textStatus, errorThrown) {
      // Handle API request failure
      console.error('API Request Failed:', textStatus, errorThrown);

      // Display an error message to the user
      displayChatMessage(userQuestion, 'user'); // Display user's message
      displayChatMessage('An error occurred while processing your request. Please try again later.', 'chatbot'); // Display error message

      // Clear the user input field
      document.getElementById('userInput').value = '';
    });
});