// app.js

const destinationInput = document.getElementById("destination");
const budgetInput = document.getElementById("budget");
const currencyInput = document.getElementById("currency");

const weatherSection = document.getElementById("weather");
const packingSection = document.getElementById("packing");
const budgetSection = document.getElementById("budget");
const restaurantSection = document.getElementById("restaurants");
const travelInfoSection = document.getElementById("travelInfo");
const homeMap = document.getElementById("homeMap");

const tripOverview = document.getElementById("tripOverview");
const tripHighlights = document.getElementById("tripHighlights");

// ⭐ Transportation section (Step 2)
const transportationSection = document.getElementById("transportation");

function renderTransportation() {
  if (window.renderTransportModule) {
    window.renderTransportModule();
  }
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

  // ⭐ Transportation (Step 2)
  renderTransportation();
}

document.getElementById("refreshInsights").addEventListener("click", refreshTripInsights);
