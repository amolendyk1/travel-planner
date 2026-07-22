let itinerary = JSON.parse(localStorage.getItem("itinerary")) || [];
itinerary = itinerary.map((entry) => ({
  activity: entry?.activity || entry?.plan || ""
}));
let saveTimer = null;

const list = document.getElementById("itineraryList");
const addButton = document.getElementById("addDay");
const mapPreview = document.getElementById("mapPreview");
const nearbyPlaces = document.getElementById("nearbyPlaces");
const daySelect = document.getElementById("daySelect");
const searchInput = document.getElementById("searchPlaces");
const filterButtons = Array.from(document.querySelectorAll(".tm-filter-pill"));
const pinDetail = document.getElementById("pinDetail");
let activeFilter = "all";
let selectedPlace = null;

const destinationLookup = {
  paris: [
    { name: "Eiffel Tower", type: "Landmark", note: "Iconic skyline stop and photo spot", transport: "Walk or metro", image: "https://images.unsplash.com/photo-1543349689-9a4d426bee8e?auto=format&fit=crop&w=900&q=80", lat: 48.8584, lng: 2.2945, city: "Paris" },
    { name: "Louvre Museum", type: "Landmark", note: "World-class art and architecture", transport: "Metro and walking", image: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=900&q=80", lat: 48.8606, lng: 2.3376, city: "Paris" },
    { name: "Seine Riverside", type: "Landmark", note: "Relaxed riverside path and café stop", transport: "Walk or river taxi", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=80", lat: 48.8566, lng: 2.3522, city: "Paris" },
    { name: "Café de Flore", type: "Restaurant", mealType: "Breakfast", note: "Classic Parisian breakfast or coffee break", transport: "Walk from Saint-Germain", image: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=900&q=80", lat: 48.8550, lng: 2.3330, city: "Paris" },
    { name: "Bistrot Victoires", type: "Restaurant", mealType: "Lunch", note: "Comfort food with a cozy neighborhood feel", transport: "Short walk from the metro", image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80", lat: 48.8650, lng: 2.3420, city: "Paris" },
    { name: "Le Petit Cler", type: "Restaurant", mealType: "Dinner", note: "Great for brunch, pastries, and people-watching", transport: "Taxi or metro", image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80", lat: 48.8571, lng: 2.3065, city: "Paris" },
    { name: "Hotel Saint-Marc", type: "Hotel", note: "Comfortable boutique stay near central sights", transport: "Easy metro access", image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80", lat: 48.8512, lng: 2.3444, city: "Paris" },
    { name: "Hôtel de la Place", type: "Hotel", note: "Stylish accommodation close to major neighborhoods", transport: "Walkable to local transit", image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80", lat: 48.8600, lng: 2.3310, city: "Paris" },
    { name: "Musée d'Orsay", type: "Landmark", note: "Beautiful art museum with a calm atmosphere", transport: "Walk or tram", image: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=900&q=80", lat: 48.8600, lng: 2.3260, city: "Paris" },
    { name: "Jardin du Luxembourg", type: "Landmark", note: "A peaceful park for a slow afternoon", transport: "Walk or bus", image: "https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=900&q=80", lat: 48.8462, lng: 2.3372, city: "Paris" }
  ],
  rome: [
    { name: "Colosseum", type: "Landmark", note: "Ancient landmark with rich history", transport: "Walk or taxi", image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=900&q=80", lat: 41.8902, lng: 12.4922, city: "Rome" },
    { name: "Trevi Fountain", type: "Landmark", note: "Classic Roman plaza and evening stroll", transport: "Walk from the historic center", image: "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?auto=format&fit=crop&w=900&q=80", lat: 41.9009, lng: 12.4833, city: "Rome" },
    { name: "Villa Borghese", type: "Landmark", note: "Great for a calm afternoon walk", transport: "Bus or taxi", image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80", lat: 41.9109, lng: 12.4930, city: "Rome" },
    { name: "Armando al Pantheon", type: "Restaurant", mealType: "Lunch", note: "Traditional Roman pasta and classic dishes", transport: "Short walk from the Pantheon", image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80", lat: 41.8988, lng: 12.4768, city: "Rome" },
    { name: "Pizzarium", type: "Restaurant", mealType: "Breakfast", note: "Perfect for a quick, beloved slice stop", transport: "Easy taxi ride", image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80", lat: 41.9067, lng: 12.4477, city: "Rome" },
    { name: "Roscioli", type: "Restaurant", mealType: "Dinner", note: "Great for a memorable dinner experience", transport: "Walk from central Rome", image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=900&q=80", lat: 41.8998, lng: 12.4730, city: "Rome" },
    { name: "Hotel Artemide", type: "Hotel", note: "Elegant stay in the heart of Rome", transport: "Close to tram and metro", image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80", lat: 41.9000, lng: 12.4920, city: "Rome" },
    { name: "Palazzo Dama", type: "Hotel", note: "Historic hotel with easy access to landmarks", transport: "Walk to major sights", image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80", lat: 41.9010, lng: 12.4880, city: "Rome" },
    { name: "Pantheon", type: "Landmark", note: "A must-see monument with dramatic architecture", transport: "Walk from most central zones", image: "https://images.unsplash.com/photo-1529260830199-42c24126f198?auto=format&fit=crop&w=900&q=80", lat: 41.8986, lng: 12.4769, city: "Rome" },
    { name: "Campo de' Fiori", type: "Landmark", note: "Lovely for wandering and browsing local stalls", transport: "Walk or taxi", image: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=900&q=80", lat: 41.8958, lng: 12.4720, city: "Rome" }
  ],
  newyork: [
    { name: "Central Park", type: "Landmark", note: "Perfect for walking and people-watching", transport: "Walk, subway, or bike", image: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80", lat: 40.7829, lng: -73.9654, city: "New York" },
    { name: "Brooklyn Bridge", type: "Landmark", note: "Great walk with skyline views", transport: "Walk or subway", image: "https://images.unsplash.com/photo-1499092346589-b9b6be3e94b2?auto=format&fit=crop&w=900&q=80", lat: 40.7061, lng: -73.9969, city: "New York" },
    { name: "Times Square", type: "Landmark", note: "Bright lights and nonstop activity", transport: "Subway and walking", image: "https://images.unsplash.com/photo-1499092346589-b9b6be3e94b2?auto=format&fit=crop&w=900&q=80", lat: 40.7580, lng: -73.9855, city: "New York" },
    { name: "Ess-a-Bagel", type: "Restaurant", mealType: "Breakfast", note: "Reliable stop for breakfast and coffee", transport: "Easy subway access", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80", lat: 40.7428, lng: -73.9880, city: "New York" },
    { name: "Katz's Delicatessen", type: "Restaurant", mealType: "Lunch", note: "Classic deli experience with big flavor", transport: "Walk from downtown", image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=900&q=80", lat: 40.7222, lng: -73.9870, city: "New York" },
    { name: "Le Coucou", type: "Restaurant", mealType: "Dinner", note: "Elegant dinner option for a special night", transport: "Taxi or subway", image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80", lat: 40.7269, lng: -73.9980, city: "New York" },
    { name: "The Standard", type: "Hotel", note: "Trendy stay with easy access to Midtown", transport: "Walk to subway and cabs", image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80", lat: 40.7440, lng: -74.0050, city: "New York" },
    { name: "The New Yorker", type: "Hotel", note: "Classic hotel close to public transit", transport: "Short walk to subway", image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80", lat: 40.7574, lng: -73.9895, city: "New York" },
    { name: "The Met", type: "Landmark", note: "A major museum and a great rainy-day plan", transport: "Subway or taxi", image: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=900&q=80", lat: 40.7794, lng: -73.9632, city: "New York" },
    { name: "High Line", type: "Landmark", note: "A scenic elevated park with city views", transport: "Walk or subway", image: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=900&q=80", lat: 40.7430, lng: -74.0067, city: "New York" }
  ],
  barcelona: [
    { name: "Sagrada Família", type: "Landmark", note: "Striking modernist landmark", transport: "Metro or taxi", image: "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=900&q=80", lat: 41.4036, lng: 2.1744, city: "Barcelona" },
    { name: "Barceloneta Beach", type: "Landmark", note: "Relaxed seaside stop and sunset views", transport: "Walk or bus", image: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=900&q=80", lat: 41.3789, lng: 2.1923, city: "Barcelona" },
    { name: "Gothic Quarter", type: "Landmark", note: "Historic streets and small shops", transport: "Walk from the center", image: "https://images.unsplash.com/photo-1523875194681-bedf1cd8bc63?auto=format&fit=crop&w=900&q=80", lat: 41.3833, lng: 2.1764, city: "Barcelona" },
    { name: "Can Culleretes", type: "Restaurant", mealType: "Breakfast", note: "Historic spot for tapas and local favorites", transport: "Walk from old town", image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=900&q=80", lat: 41.3820, lng: 2.1767, city: "Barcelona" },
    { name: "El Xampanyet", type: "Restaurant", mealType: "Lunch", note: "Great for seafood and a casual lunch", transport: "Short walk from the harbor", image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80", lat: 41.3798, lng: 2.1812, city: "Barcelona" },
    { name: "Disfrutar", type: "Restaurant", mealType: "Dinner", note: "Creative flavors for a memorable dinner", transport: "Taxi or metro", image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80", lat: 41.4032, lng: 2.1837, city: "Barcelona" },
    { name: "Hotel Arts Barcelona", type: "Hotel", note: "Upscale waterfront stay with great views", transport: "Easy taxi and metro access", image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80", lat: 41.3900, lng: 2.1920, city: "Barcelona" },
    { name: "Hotel 1898", type: "Hotel", note: "Historic hotel close to the city center", transport: "Walkable to many attractions", image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80", lat: 41.3820, lng: 2.1800, city: "Barcelona" },
    { name: "Park Güell", type: "Landmark", note: "Colorful architecture and beautiful views", transport: "Bus or taxi", image: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=900&q=80", lat: 41.4145, lng: 2.1527, city: "Barcelona" },
    { name: "Boqueria Market", type: "Landmark", note: "A fun stop for snacks and wandering", transport: "Walk from downtown", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80", lat: 41.3828, lng: 2.1734, city: "Barcelona" }
  ]
};

let nearbySuggestions = [];

function saveItinerary() {
  localStorage.setItem("itinerary", JSON.stringify(itinerary));
}

function queueSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveItinerary, 120);
}

addButton.addEventListener("click", () => {
  itinerary.push({ activity: "" });
  saveItinerary();
  render();
});

function updateEntry(target) {
  const index = Number(target.dataset.index);
  if (!Number.isInteger(index) || index < 0 || !itinerary[index]) return;

  if (target.name === "activity") {
      itinerary[index].activity = target.value;
    }

  queueSave();
}

list.addEventListener("input", (event) => {
  const target = event.target;
  if (!target.matches("input, select, textarea")) return;
  updateEntry(target);
});

list.addEventListener("change", (event) => {
  const target = event.target;
  if (!target.matches("input, select, textarea")) return;
  updateEntry(target);
});

function getDestinationKey() {
  const savedDestination = localStorage.getItem("destination") || "";
  const normalized = savedDestination.toLowerCase().trim();

  if (normalized.includes("paris")) return "paris";
  if (normalized.includes("rome")) return "rome";
  if (normalized.includes("new york") || normalized.includes("nyc")) return "newyork";
  if (normalized.includes("barcelona")) return "barcelona";

  return "paris";
}

function updateDaySelect() {
  daySelect.innerHTML = "";
  const options = itinerary.length ? itinerary.map((_, index) => index + 1) : [1];

  options.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = `Day ${value}`;
    daySelect.appendChild(option);
  });
}

function addPlaceToItinerary(place) {
  const time = place.mealType ? (place.mealType === "Breakfast" ? "08:00" : place.mealType === "Lunch" ? "13:00" : place.mealType === "Dinner" ? "19:00" : "10:00") : "10:00";
  const meal = place.mealType || "Other";
  const transportNote = place.transport ? ` | Travel: ${place.transport}` : "";
  const text = `${place.name} — ${place.type}: ${place.note}${transportNote}`;
  const targetDay = Number(daySelect.value || 1) - 1;

  if (!itinerary[targetDay]) {
    itinerary.push({ time, meal, activity: "" });
  }

  const dayEntry = itinerary[targetDay] || { time, meal, activity: "" };
  dayEntry.time = dayEntry.time || time;
  dayEntry.meal = dayEntry.meal || meal;
  dayEntry.activity = `${dayEntry.activity}${dayEntry.activity ? "\n" : ""}${text}`.trim();
  itinerary[targetDay] = dayEntry;

  saveItinerary();
  render();
  updateDaySelect();
}

function getFilteredSuggestions() {
  const destinationKey = getDestinationKey();
  nearbySuggestions = destinationLookup[destinationKey] || destinationLookup.paris;
  const query = (searchInput?.value || "").trim().toLowerCase();

  return nearbySuggestions.filter((place) => {
    const matchesFilter = activeFilter === "all"
      ? true
      : activeFilter === "landmark"
        ? place.type === "Landmark"
        : activeFilter === "restaurant"
          ? place.type === "Restaurant"
          : place.type === "Hotel";

    if (!matchesFilter) return false;
    if (!query) return true;

    const haystack = `${place.name} ${place.type} ${place.note} ${place.city}`.toLowerCase();
    return haystack.includes(query);
  });
}

function showPlaceDetail(place) {
  if (!pinDetail) return;
  selectedPlace = place;
  pinDetail.hidden = false;
  pinDetail.innerHTML = `
    <h3>${place.name}</h3>
    <p><strong>${place.type}</strong>${place.mealType ? ` • ${place.mealType}` : ""}</p>
    <p>${place.note}</p>
    ${place.transport ? `<p><strong>Transport:</strong> ${place.transport}</p>` : ""}
    <div class="tm-pin-actions">
      <button class="tm-button" type="button" data-add-place="true">Add to itinerary</button>
    </div>
  `;

  const addButton = pinDetail.querySelector("[data-add-place]");
  if (addButton) {
    addButton.addEventListener("click", () => addPlaceToItinerary(place));
  }
}

function renderNearbyPlaces() {
  const filteredSuggestions = getFilteredSuggestions();

  mapPreview.innerHTML = "";
  nearbyPlaces.innerHTML = "";
  if (pinDetail) {
    pinDetail.hidden = true;
    pinDetail.innerHTML = "";
  }


  const mapIframe = document.createElement("iframe");
  const centerPoint = nearbySuggestions[0];
  const pins = filteredSuggestions.length ? filteredSuggestions : nearbySuggestions;
  const pinQuery = pins.map((place) => `markers=${place.lat.toFixed(5)},${place.lng.toFixed(5)}`).join("&");
  mapIframe.src = `https://www.openstreetmap.org/export/embed.html?bbox=${centerPoint.lng - 0.2}%2C${centerPoint.lat - 0.2}%2C${centerPoint.lng + 0.2}%2C${centerPoint.lat + 0.2}&layer=mapnik&${pinQuery}`;
  mapIframe.className = "tm-map-iframe";
  mapPreview.appendChild(mapIframe);

  if (!filteredSuggestions.length) {
    const emptyState = document.createElement("p");
    emptyState.className = "empty-state";
    emptyState.textContent = "No places or restaurants match that search yet.";
    nearbyPlaces.appendChild(emptyState);
    return;
  }

  const fragment = document.createDocumentFragment();
  filteredSuggestions.forEach((place) => {
    const card = document.createElement("button");
    card.className = "tm-event-card tm-place-card";
    card.type = "button";
    card.innerHTML = `
      <div class="tm-place-image" style="background-image:url('${place.image || "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=80"}')"></div>
      <div class="tm-place-content">
        <h3>${place.name}</h3>
        <p><strong>${place.type}</strong>${place.mealType ? ` • ${place.mealType}` : ""}</p>
        <p>${place.note}</p>
        ${place.transport ? `<p class="place-meta">Transport: ${place.transport}</p>` : ""}
        <p class="place-meta">${place.city}</p>
      </div>
    `;
    card.addEventListener("click", () => {
      showPlaceDetail(place);
      addPlaceToItinerary(place);
    });
    fragment.appendChild(card);
  });
  nearbyPlaces.appendChild(fragment);
}

function render() {
  list.innerHTML = "";
  updateDaySelect();

  if (!itinerary.length) {
    const emptyState = document.createElement("p");
    emptyState.className = "empty-state";
    emptyState.textContent = "Add a day to start building your travel plan.";
    list.appendChild(emptyState);
    return;
  }

  const fragment = document.createDocumentFragment();

  itinerary.forEach((day, index) => {
    const card = document.createElement("div");
    card.className = "tm-event-card";

    card.innerHTML = `
          <h3>Day ${index + 1}</h3>
          <div class="tm-time-row">
            <label>Plan</label>
            <textarea name="activity" data-index="${index}" placeholder="What do you want to do today?">${day.activity || ""}</textarea>
          </div>
        `;

    fragment.appendChild(card);
  });

  list.appendChild(fragment);
}

render();
renderNearbyPlaces();

const destinationInput = document.getElementById("destination");
if (destinationInput) {
  destinationInput.addEventListener("input", () => {
    localStorage.setItem("destination", destinationInput.value);
    renderNearbyPlaces();
  });
}

if (searchInput) {
  searchInput.addEventListener("input", renderNearbyPlaces);
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter || "all";
    filterButtons.forEach((pill) => pill.classList.toggle("active", pill === button));
    renderNearbyPlaces();
  });
});
