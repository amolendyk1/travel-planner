const loadButton = document.getElementById("load");
const weatherSection = document.getElementById("weather");
const packingSection = document.getElementById("packing");
const budgetSection = document.getElementById("budget");
const restaurantSection = document.getElementById("restaurants");
const destinationInput = document.getElementById("destination");
const homeMap = document.getElementById("homeMap");
const budgetInput = document.getElementById("budget");
const currencyInput = document.getElementById("currency");
const tripOverview = document.getElementById("tripOverview");
const tripHighlights = document.getElementById("tripHighlights");
const travelInfoSection = document.getElementById("travelInfo");
let stepButtons = [];
let stepPanels = [];

const destinationCoordinates = {
  paris: { lat: 48.8566, lng: 2.3522, label: "Paris" },
  rome: { lat: 41.9028, lng: 12.4964, label: "Rome" },
  newyork: { lat: 40.7128, lng: -74.0060, label: "New York" },
  barcelona: { lat: 41.3851, lng: 2.1734, label: "Barcelona" }
};

function syncDestination() {
  if (destinationInput) {
    localStorage.setItem("destination", destinationInput.value);
  }
}

function setLoadingState(isLoading) {
  if (loadButton) {
    loadButton.disabled = isLoading;
    loadButton.textContent = isLoading ? "Loading..." : "Load Trip Data";
  }

  if (isLoading) {
    if (weatherSection) {
      weatherSection.innerHTML = '<p class="status-message">Checking weather…</p>';
    }
    if (packingSection) {
      packingSection.innerHTML = '<p class="status-message">Preparing your packing list…</p>';
    }
    if (budgetSection) {
      budgetSection.innerHTML = '<p class="status-message">Calculating your budget…</p>';
    }
  }
}

function renderInsight(title, body, section) {
  if (!section) return;
  section.innerHTML = `<h2>${title}</h2><p>${body}</p>`;
}

function setActiveStep(stepNumber) {
  stepButtons.forEach((button) => {
    const isActive = Number(button.dataset.step) === stepNumber;
    button.classList.toggle("tm-flow-chip-active", isActive);
  });

  stepPanels.forEach((panel) => {
    const isActive = Number(panel.dataset.stepPanel) === stepNumber;
    panel.hidden = !isActive;
  });
}

function renderTripOverview() {
  if (!tripOverview) return;

  const destination = (destinationInput?.value || localStorage.getItem("destination") || "").trim();
  const startDate = document.getElementById("startDate")?.value || "";
  const endDate = document.getElementById("endDate")?.value || "";
  const budget = budgetInput?.value?.trim() || "";
  const currency = currencyInput?.value?.trim().toUpperCase() || "USD";
  const duration = getTripDurationDays();

  const destinationText = destination ? destination : "Add a destination to start shaping your trip";
  const dateText = startDate && endDate
    ? `${startDate} to ${endDate} • ${duration} day${duration === 1 ? "" : "s"}`
    : "Choose your dates to see the full trip span";
  const budgetText = budget
    ? `${budget} ${currency}`
    : "Set a budget to guide your spending";

  tripOverview.innerHTML = `
    <div class="tm-overview-grid">
      <div>
        <p class="tm-label">Destination</p>
        <p class="tm-overview-value">${destinationText}</p>
      </div>
      <div>
        <p class="tm-label">Dates</p>
        <p class="tm-overview-value">${dateText}</p>
      </div>
      <div>
        <p class="tm-label">Budget</p>
        <p class="tm-overview-value">${budgetText}</p>
      </div>
    </div>
    <p class="status-message">Your travel plan comes together here, then flows into weather, packing, food, and map details.</p>
  `;
}

function renderTripHighlights() {
  if (!tripHighlights) return;

  const destination = (destinationInput?.value || localStorage.getItem("destination") || "").trim();
  const budget = budgetInput?.value?.trim() || "";
  const currency = currencyInput?.value?.trim().toUpperCase() || "USD";
  const duration = getTripDurationDays();
  const hasDestination = Boolean(destination);
  const hasDates = Boolean(document.getElementById("startDate")?.value && document.getElementById("endDate")?.value);
  const hasBudget = Boolean(budget);

  const readiness = Math.min(100, 30 + (hasDestination ? 25 : 0) + (hasDates ? 20 : 0) + (hasBudget ? 15 : 0) + (currency ? 10 : 0));
  const readinessLabel = readiness >= 85 ? "Ready to go" : readiness >= 65 ? "Almost there" : "Still shaping";

  const pace = duration >= 5 ? "Slow and immersive" : duration >= 3 ? "Balanced and easy" : "Fast and focused";

  const destinationTips = destination.toLowerCase().includes("paris")
    ? ["Book museum entries in advance", "Keep one evening free for a long dinner", "Wear comfortable shoes for cobblestones"]
    : destination.toLowerCase().includes("rome")
      ? ["Carry a little cash for smaller stops", "Plan for longer lunches and slower mornings", "Reserve a few major sights early"]
      : destination.toLowerCase().includes("barcelona")
        ? ["Expect a lot of walking", "Keep a light layer for evenings", "Save room for late-night tapas"]
        : destination.toLowerCase().includes("new york")
          ? ["Map out transit early", "Leave flexibility for spontaneous plans", "Reserve standout restaurants ahead of time"]
          : ["Keep the plan flexible", "Leave space for local discoveries", "Pack light and stay organized"];

  const nextStep = !hasDestination
    ? "Choose a destination to unlock location-specific suggestions."
    : !hasDates
      ? "Add your dates to see the trip span and pacing."
      : !hasBudget
        ? "Set a budget to guide your spend and daily priorities."
        : "Open the itinerary to turn this into a day-by-day experience.";

  tripHighlights.innerHTML = `
    <div class="tm-highlights-grid">
      <div class="tm-highlight-card">
        <p class="tm-label">Readiness</p>
        <p class="tm-highlight-metric">${readiness}%</p>
        <p class="tm-highlight-subtext">${readinessLabel}</p>
      </div>
      <div class="tm-highlight-card">
        <p class="tm-label">Trip pace</p>
        <p class="tm-highlight-metric">${pace}</p>
        <p class="tm-highlight-subtext">A better rhythm for your stay</p>
      </div>
    </div>
    <div class="tm-tip-list">
      <p class="tm-label">Smart notes</p>
      <ul>
        ${destinationTips.map((tip) => `<li>${tip}</li>`).join("")}
      </ul>
      <p class="tm-highlight-subtext">${nextStep}</p>
    </div>
  `;
}

function renderTravelInfo() {
  if (!travelInfoSection) return;

  const destination = (destinationInput?.value || localStorage.getItem("destination") || "").trim().toLowerCase();
  const duration = getTripDurationDays();
  let cards = [
    {
      title: "Getting around",
      body: "Plan your arrival and local transit early so the first day feels smooth instead of rushed."
    },
    {
      title: "Payments",
      body: "Cards are widely accepted in most destinations, but it helps to keep a little cash for small purchases."
    },
    {
      title: "Power & plugs",
      body: "Bring a universal adapter if you are crossing regions, especially for a multi-country trip."
    },
    {
      title: "Extra prep",
      body: "Keep your documents, phone charger, and a small backup layer close at hand for the day of travel."
    }
  ];

  if (destination.includes("paris")) {
    cards = [
      { title: "Getting around", body: "The Metro is the easiest way to move quickly across Paris, especially for major sights." },
      { title: "Payments", body: "Cards are common, but a small amount of cash still helps for cafés and local markets." },
      { title: "Power & plugs", body: "France uses Type C and E plugs, so a travel adapter is worth packing." },
      { title: "Extra prep", body: "Book museum reservations ahead of time if you want a calmer, more comfortable experience." }
    ];
  } else if (destination.includes("rome")) {
    cards = [
      { title: "Getting around", body: "Rome is best enjoyed slowly, so allow extra time for walking between neighborhoods and landmarks." },
      { title: "Payments", body: "Carry some cash for smaller shops and street-side stops, even if cards are accepted elsewhere." },
      { title: "Power & plugs", body: "Italy uses Type C and F plugs, so an adapter helps if you are arriving from North America." },
      { title: "Extra prep", body: "Long lunches and afternoon breaks are part of the rhythm, so keep the day flexible." }
    ];
  } else if (destination.includes("barcelona")) {
    cards = [
      { title: "Getting around", body: "Barcelona is very walkable, and the metro makes longer hops simple when you want to save energy." },
      { title: "Payments", body: "Cards work well for most plans, but small cafés and market stops can still be cash-friendly." },
      { title: "Power & plugs", body: "Spain uses Type C and F plugs, so a compact adapter is useful." },
      { title: "Extra prep", body: "Keep a light layer with you for evenings, especially if your trip runs late into the night." }
    ];
  } else if (destination.includes("new york") || destination.includes("nyc")) {
    cards = [
      { title: "Getting around", body: "The subway is the best way to move around quickly, and it helps to have a transit plan before arrival." },
      { title: "Payments", body: "Tap-to-pay works well almost everywhere, which makes daily movement a lot easier." },
      { title: "Power & plugs", body: "New York uses Type A and B plugs, so your usual charger should work with the right adapter if needed." },
      { title: "Extra prep", body: "Leave room in the plan for spontaneous stops, since the city rewards flexibility." }
    ];
  }

  if (duration >= 5) {
    cards.push({
      title: "Trip rhythm",
      body: "A longer stay usually benefits from one slower morning and one flexible evening each day."
    });
  }

  travelInfoSection.innerHTML = "";
  const fragment = document.createDocumentFragment();

  cards.forEach((item) => {
    const card = document.createElement("div");
    card.className = "tm-info-card";
    card.innerHTML = `
      <h3>${item.title}</h3>
      <p>${item.body}</p>
    `;
    fragment.appendChild(card);
  });

  travelInfoSection.appendChild(fragment);
}

function renderBudgetBreakdown(parsedBudget, rate, currencyCode) {
  if (!budgetSection) return;

  const safeBudget = Number(parsedBudget) || 0;
  const convertedBudget = safeBudget * rate;
  const lodgingBudget = safeBudget * 0.45;
  const foodBudget = safeBudget * 0.25;
  const activityBudget = safeBudget * 0.2;
  const bufferBudget = safeBudget * 0.1;

  const convertedLodging = lodgingBudget * rate;
  const convertedFood = foodBudget * rate;
  const convertedActivities = activityBudget * rate;
  const convertedBuffer = bufferBudget * rate;

  const helperText = safeBudget > 0
    ? `This plan uses your budget to split spending across stay, food, activities, and a buffer.`
    : "Add a trip budget to create a simple spending plan for your trip.";

  budgetSection.innerHTML = `
    <h2>Budget plan</h2>
    <p>${helperText}</p>
    <p><strong>Total planned spend:</strong> ${convertedBudget.toFixed(2)} ${currencyCode}</p>
    <p>Stay: ${convertedLodging.toFixed(2)} ${currencyCode}</p>
    <p>Food: ${convertedFood.toFixed(2)} ${currencyCode}</p>
    <p>Activities: ${convertedActivities.toFixed(2)} ${currencyCode}</p>
    <p>Buffer: ${convertedBuffer.toFixed(2)} ${currencyCode}</p>
    <p><small>Base budget: ${safeBudget.toFixed(2)} USD</small></p>
  `;
}

function renderRestaurants() {
  if (!restaurantSection) return;

  const destination = (destinationInput?.value || localStorage.getItem("destination") || "").trim().toLowerCase();
  let restaurants = [
    { name: "Café Locale", type: "Breakfast", note: "Fresh pastries and coffee" },
    { name: "Market Bistro", type: "Lunch", note: "Local dishes and daily specials" },
    { name: "Riverside Grill", type: "Dinner", note: "Relaxed setting for a nice meal" }
  ];

  if (destination.includes("rome")) {
    restaurants = [
      { name: "Armando al Pantheon", type: "Classic Roman", note: "Traditional pasta and hearty plates" },
      { name: "Pizzarium", type: "Pizza", note: "Quick and beloved slice stop" },
      { name: "Roscioli", type: "Dinner", note: "Great for a memorable evening meal" }
    ];
  } else if (destination.includes("paris")) {
    restaurants = [
      { name: "Le Petit Cler", type: "Breakfast", note: "Parisian café breakfast" },
      { name: "Bistrot Victoires", type: "Lunch", note: "Classic French comfort food" },
      { name: "Septime", type: "Dinner", note: "Stylish dinner with modern flavors" }
    ];
  } else if (destination.includes("barcelona")) {
    restaurants = [
      { name: "Can Culleretes", type: "Tapas", note: "Historic spot for local favorites" },
      { name: "El Xampanyet", type: "Lunch", note: "Great seafood and casual bites" },
      { name: "Disfrutar", type: "Dinner", note: "Creative tasting menu" }
    ];
  } else if (destination.includes("new york") || destination.includes("nyc")) {
    restaurants = [
      { name: "Ess-a-Bagel", type: "Breakfast", note: "Reliable fast breakfast" },
      { name: "Katz's Delicatessen", type: "Lunch", note: "Classic deli experience" },
      { name: "Le Coucou", type: "Dinner", note: "Elegant dinner option" }
    ];
  }

  restaurantSection.innerHTML = "";
  const fragment = document.createDocumentFragment();

  restaurants.forEach((place) => {
    const card = document.createElement("div");
    card.className = "tm-event-card";
    card.innerHTML = `
      <h3>${place.name}</h3>
      <p><strong>${place.type}</strong></p>
      <p>${place.note}</p>
    `;
    fragment.appendChild(card);
  });

  restaurantSection.appendChild(fragment);
}

function getTripDurationDays() {
  const startDate = document.getElementById("startDate")?.value;
  const endDate = document.getElementById("endDate")?.value;

  if (!startDate || !endDate) return 0;

  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1);
  return diff;
}

function buildPackingGuide(weatherSummary, packingItems) {
  const duration = getTripDurationDays();
  const baseItems = [...packingItems];
  const guide = [];

  if (duration > 0) {
    guide.push(`Trip length: ${duration} day${duration > 1 ? "s" : ""}`);
  }

  guide.push(`Weather: ${weatherSummary}`);
  guide.push(`Recommended items: ${baseItems.join(", ")}`);

  if (duration >= 3) {
    guide.push("Bring 3 to 4 outfits and one extra layer for changing weather.");
  }

  return guide.join("<br>");
}

function renderHomeMap() {
  if (!homeMap) return;

  const destination = (destinationInput?.value || localStorage.getItem("destination") || "").trim().toLowerCase();
  let location = destinationCoordinates.paris;

  if (destination.includes("rome")) location = destinationCoordinates.rome;
  else if (destination.includes("new york") || destination.includes("nyc")) location = destinationCoordinates.newyork;
  else if (destination.includes("barcelona")) location = destinationCoordinates.barcelona;

  homeMap.innerHTML = "";
  const frame = document.createElement("iframe");
  frame.src = `https://www.openstreetmap.org/export/embed.html?bbox=${location.lng - 0.08}%2C${location.lat - 0.08}%2C${location.lng + 0.08}%2C${location.lat + 0.08}&layer=mapnik&marker=${location.lat}%2C${location.lng}`;
  frame.className = "tm-map-iframe";
  homeMap.appendChild(frame);
}

function bindFormEvents() {
  if (destinationInput) {
    destinationInput.addEventListener("input", () => {
      syncDestination();
      renderTripOverview();
      renderTripHighlights();
      renderTravelInfo();
      renderHomeMap();
      renderRestaurants();
    });
  }

  ["startDate", "endDate", "budget", "currency"].forEach((id) => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener("input", () => {
        renderTripOverview();
        renderTripHighlights();
      });
      element.addEventListener("change", () => {
        renderTripOverview();
        renderTripHighlights();
      });
    }
  });

  ["startDate", "endDate"].forEach((id) => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener("input", () => {
        if (document.getElementById("load")) {
          renderInsight("Packing Guide", "Update the destination and click load to refresh your packing advice.", packingSection);
        }
      });
      element.addEventListener("change", () => {
        if (document.getElementById("load")) {
          renderInsight("Packing Guide", "Update the destination and click load to refresh your packing advice.", packingSection);
        }
      });
    }
  });
}

function initPlannerPage() {
  stepButtons = Array.from(document.querySelectorAll(".tm-flow-chip"));
  stepPanels = Array.from(document.querySelectorAll(".tm-step-panel"));

  stepButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const nextStep = Number(button.dataset.step);
      setActiveStep(nextStep);
    });
  });

  setActiveStep(1);
  renderTripOverview();
  renderTripHighlights();
}

async function refreshTripInsights() {
  if (!weatherSection && !packingSection && !budgetSection && !travelInfoSection && !restaurantSection && !homeMap) {
    return;
  }

  const destination = (destinationInput?.value || localStorage.getItem("destination") || "").trim();
  const budget = budgetInput?.value?.trim() || "";
  const currency = currencyInput?.value?.trim().toUpperCase() || "USD";

  if (!destination) {
    renderInsight("Weather", "Enter a destination to get started.", weatherSection);
    renderInsight("Packing List", "Add a destination first.", packingSection);
    renderInsight("Budget", "Enter a destination first.", budgetSection);
    return;
  }

  syncDestination();
  setLoadingState(true);

  const [weatherResult, currencyResult] = await Promise.allSettled([
    getWeather(destination),
    convertCurrency(currency)
  ]);

  const weatherData = weatherResult.status === "fulfilled"
    ? weatherResult.value
    : { summary: "Weather is currently unavailable.", packing: ["Passport", "Charger"] };

  const rate = currencyResult.status === "fulfilled" && typeof currencyResult.value === "number"
    ? currencyResult.value
    : 1;

  const parsedBudget = Number(budget) || 0;

  renderInsight("Weather", weatherData.summary, weatherSection);
  renderInsight("Packing Guide", buildPackingGuide(weatherData.summary, weatherData.packing), packingSection);
  renderBudgetBreakdown(parsedBudget, rate, currency);
  renderTripOverview();
  renderTripHighlights();
  renderTravelInfo();
  renderHomeMap();
  renderRestaurants();

  setLoadingState(false);
  }

function initApp() {
  if (destinationInput) {
    destinationInput.value = localStorage.getItem("destination") || "";
  }

  bindFormEvents();
  renderTripOverview();
  renderTripHighlights();
  renderTravelInfo();
  renderHomeMap();
  renderRestaurants();

  if (document.querySelector(".tm-flow-chip")) {
    initPlannerPage();
  }

  if (weatherSection || packingSection || budgetSection || travelInfoSection || restaurantSection || homeMap) {
    refreshTripInsights();
  }

  if (loadButton) {
    loadButton.addEventListener("click", () => {
      refreshTripInsights();
    });
  }

  const refreshButton = document.getElementById("refreshInsights");
  if (refreshButton) {
    refreshButton.addEventListener("click", () => {
      refreshTripInsights();
    });
  }
}

initApp();
