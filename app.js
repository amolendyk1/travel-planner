// app.js

const weatherSection = document.getElementById("weather");
const packingSection = document.getElementById("packing");
const budgetSection = document.getElementById("budget");
const restaurantSection = document.getElementById("restaurants");
const travelInfoSection = document.getElementById("travelInfo");
const homeMap = document.getElementById("homeMap");

const destinationInput = document.getElementById("destination");
const budgetInput = document.getElementById("budget");
const currencyInput = document.getElementById("currency");

const tripOverview = document.getElementById("tripOverview");
const tripHighlights = document.getElementById("tripHighlights");

function renderInsight(title, body, section) {
  if (!section) return;
  section.innerHTML = `<h2>${title}</h2><p>${body}</p>`;
}

async function refreshTripInsights() {
  const destination = destinationInput.value.trim();
  if (!destination) return;

  // Weather
  const weatherData = await getWeather(destination);
  renderInsight("Weather", weatherData.summary, weatherSection);

  // Packing
  const packingGuide = buildPackingGuide(weatherData.summary, weatherData.packing);
  renderInsight("Packing Guide", packingGuide, packingSection);

  // Budget
  const rate = await getCurrencyRate(currencyInput.value);
  renderBudgetBreakdown(budgetInput.value, rate, currencyInput.value);

  // Overview + Highlights
  renderTripOverview();
  renderTripHighlights();

  // Travel info
  renderTravelInfo();

  // Map
  renderHomeMap();

  // Restaurants
  renderRestaurants();
}

document.getElementById("refreshInsights").addEventListener("click", refreshTripInsights);
