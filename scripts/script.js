async function fetchData() {
  const url = 'https://tripadvisor16.p.rapidapi.com/api/v1/restaurant/searchRestaurants?locationId=304554';
  const options = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': '8403cb6857msh4e494b01da34267p1a13cajsn19f45d944f8c',
      'X-RapidAPI-Host': 'tripadvisor16.p.rapidapi.com'
    }
  };

  try {
    const response = await fetch(url, options);
    const result = await response.text();
    console.log(result);
  } catch (error) {
    console.error(error);
  }
}

// Call the async function to execute it
fetchData();