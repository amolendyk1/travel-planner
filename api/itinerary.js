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

// Fallback icon shown while a real photo is being looked up (or if none is found)
const TYPE_ICON = {
  Landmark: "📍",
  Restaurant: "🍽️",
  Hotel: "🏨"
};

const destinationLookup = {
  paris: [
    { name: "Eiffel Tower", type: "Landmark", note: "Iconic skyline stop and photo spot", transport: "Walk or metro", lat: 48.8584, lng: 2.2945, city: "Paris" },
    { name: "Louvre Museum", type: "Landmark", note: "World-class art and architecture", transport: "Metro and walking", lat: 48.8606, lng: 2.3376, city: "Paris" },
    { name: "Seine", type: "Landmark", note: "Relaxed riverside path and café stop", transport: "Walk or river taxi", lat: 48.8566, lng: 2.3522, city: "Paris" },
    { name: "Café de Flore", type: "Restaurant", mealType: "Breakfast", note: "Classic Parisian breakfast or coffee break", transport: "Walk from Saint-Germain", lat: 48.8550, lng: 2.3330, city: "Paris" },
    { name: "Bistrot Victoires", type: "Restaurant", mealType: "Lunch", note: "Comfort food with a cozy neighborhood feel", transport: "Short walk from the metro", lat: 48.8650, lng: 2.3420, city: "Paris" },
    { name: "Le Petit Cler", type: "Restaurant", mealType: "Dinner", note: "Great for brunch, pastries, and people-watching", transport: "Taxi or metro", lat: 48.8571, lng: 2.3065, city: "Paris" },
    { name: "Hotel Saint-Marc", type: "Hotel", note: "Comfortable boutique stay near central sights", transport: "Easy metro access", lat: 48.8512, lng: 2.3444, city: "Paris" },
    { name: "Hôtel de la Place", type: "Hotel", note: "Stylish accommodation close to major neighborhoods", transport: "Walkable to local transit", lat: 48.8600, lng: 2.3310, city: "Paris" },
    { name: "Musée d'Orsay", type: "Landmark", note: "Beautiful art museum with a calm atmosphere", transport: "Walk or tram", lat: 48.8600, lng: 2.3260, city: "Paris" },
    { name: "Jardin du Luxembourg", type: "Landmark", note: "A peaceful park for a slow afternoon", transport: "Walk or bus", lat: 48.8462, lng: 2.3372, city: "Paris" }
  ],
  rome: [
    { name: "Colosseum", type: "Landmark", note: "Ancient landmark with rich history", transport: "Walk or taxi", lat: 41.8902, lng: 12.4922, city: "Rome" },
    { name: "Trevi Fountain", type: "Landmark", note: "Classic Roman plaza and evening stroll", transport: "Walk from the historic center", lat: 41.9009, lng: 12.4833, city: "Rome" },
    { name: "Villa Borghese", type: "Landmark", note: "Great for a calm afternoon walk", transport: "Bus or taxi", lat: 41.9109, lng: 12.4930, city: "Rome" },
    { name: "Armando al Pantheon", type: "Restaurant", mealType: "Lunch", note: "Traditional Roman pasta and classic dishes", transport: "Short walk from the Pantheon", lat: 41.8988, lng: 12.4768, city: "Rome" },
    { name: "Pizzarium", type: "Restaurant", mealType: "Breakfast", note: "Perfect for a quick, beloved slice stop", transport: "Easy taxi ride", lat: 41.9067, lng: 12.4477, city: "Rome" },
    { name: "Roscioli", type: "Restaurant", mealType: "Dinner", note: "Great for a memorable dinner experience", transport: "Walk from central Rome", lat: 41.8998, lng: 12.4730, city: "Rome" },
    { name: "Hotel Artemide", type: "Hotel", note: "Elegant stay in the heart of Rome", transport: "Close to tram and metro", lat: 41.9000, lng: 12.4920, city: "Rome" },
    { name: "Palazzo Dama", type: "Hotel", note: "Historic hotel with easy access to landmarks", transport: "Walk to major sights", lat: 41.9010, lng: 12.4880, city: "Rome" },
    { name: "Pantheon", type: "Landmark", note: "A must-see monument with dramatic architecture", transport: "Walk from most central zones", lat: 41.8986, lng: 12.4769, city: "Rome" },
    { name: "Campo de' Fiori", type: "Landmark", note: "Lovely for wandering and browsing local stalls", transport: "Walk or taxi", lat: 41.8958, lng: 12.4720, city: "Rome" }
  ],
  newyork: [
    { name: "Central Park", type: "Landmark", note: "Perfect for walking and people-watching", transport: "Walk, subway, or bike", lat: 40.7829, lng: -73.9654, city: "New York" },
    { name: "Brooklyn Bridge", type: "Landmark", note: "Great walk with skyline views", transport: "Walk or subway", lat: 40.7061, lng: -73.9969, city: "New York" },
    { name: "Times Square", type: "Landmark", note: "Bright lights and nonstop activity", transport: "Subway and walking", lat: 40.7580, lng: -73.9855, city: "New York" },
    { name: "Ess-a-Bagel", type: "Restaurant", mealType: "Breakfast", note: "Reliable stop for breakfast and coffee", transport: "Easy subway access", lat: 40.7428, lng: -73.9880, city: "New York" },
    { name: "Katz's Delicatessen", type: "Restaurant", mealType: "Lunch", note: "Classic deli experience with big flavor", transport: "Walk from downtown", lat: 40.7222, lng: -73.9870, city: "New York" },
    { name: "Le Coucou", type: "Restaurant", mealType: "Dinner", note: "Elegant dinner option for a special night", transport: "Taxi or subway", lat: 40.7269, lng: -73.9980, city: "New York" },
    { name: "The Standard, High Line", type: "Hotel", note: "Trendy stay with easy access to Midtown", transport: "Walk to subway and cabs", lat: 40.7440, lng: -74.0050, city: "New York" },
    { name: "The New Yorker Hotel", type: "Hotel", note: "Classic hotel close to public transit", transport: "Short walk to subway", lat: 40.7574, lng: -73.9895, city: "New York" },
    { name: "Metropolitan Museum of Art", type: "Landmark", note: "A major museum and a great rainy-day plan", transport: "Subway or taxi", lat: 40.7794, lng: -73.9632, city: "New York" },
    { name: "High Line", type: "Landmark", note: "A scenic elevated park with city views", transport: "Walk or subway", lat: 40.7430, lng: -74.0067, city: "New York" }
  ],
  barcelona: [
    { name: "Sagrada Família", type: "Landmark", note: "Striking modernist landmark", transport: "Metro or taxi", lat: 41.4036, lng: 2.1744, city: "Barcelona" },
    { name: "Barceloneta Beach", type: "Landmark", note: "Relaxed seaside stop and sunset views", transport: "Walk or bus", lat: 41.3789, lng: 2.1923, city: "Barcelona" },
    { name: "Gothic Quarter", type: "Landmark", note: "Historic streets and small shops", transport: "Walk from the center", lat: 41.3833, lng: 2.1764, city: "Barcelona" },
    { name: "Can Culleretes", type: "Restaurant", mealType: "Breakfast", note: "Historic spot for tapas and local favorites", transport: "Walk from old town", lat: 41.3820, lng: 2.1767, city: "Barcelona" },
    { name: "El Xampanyet", type: "Restaurant", mealType: "Lunch", note: "Great for seafood and a casual lunch", transport: "Short walk from the harbor", lat: 41.3798, lng: 2.1812, city: "Barcelona" },
    { name: "Disfrutar", type: "Restaurant", mealType: "Dinner", note: "Creative flavors for a memorable dinner", transport: "Taxi or metro", lat: 41.4032, lng: 2.1837, city: "Barcelona" },
    { name: "Hotel Arts Barcelona", type: "Hotel", note: "Upscale waterfront stay with great views", transport: "Easy taxi and metro access", lat: 41.3900, lng: 2.1920, city: "Barcelona" },
    { name: "Hotel 1898", type: "Hotel", note: "Historic hotel close to the city center", transport: "Walkable to many attractions", lat: 41.3820, lng: 2.1800, city: "Barcelona" },
    { name: "Park Güell", type: "Landmark", note: "Colorful architecture and beautiful views", transport: "Bus or taxi", lat: 41.4145, lng: 2.1527, city: "Barcelona" },
    { name: "La Boqueria", type: "Landmark", note: "A fun stop for snacks and wandering", transport: "Walk from downtown", lat: 41.3828, lng: 2.1734, city: "Barcelona" }
  ],
  tokyo: [
    { name: "Sensō-ji", type: "Landmark", note: "Tokyo's oldest temple, lively approach street", transport: "Walk or subway", lat: 35.7148, lng: 139.7967, city: "Tokyo" },
    { name: "Shibuya Crossing", type: "Landmark", note: "The famous scramble crossing and shopping", transport: "Subway", lat: 35.6595, lng: 139.7005, city: "Tokyo" },
    { name: "Meiji Shrine", type: "Landmark", note: "A quiet forested shrine near Harajuku", transport: "Walk or subway", lat: 35.6764, lng: 139.6993, city: "Tokyo" },
    { name: "Tsukiji Outer Market", type: "Restaurant", mealType: "Breakfast", note: "Fresh seafood stalls and street food", transport: "Subway", lat: 35.6655, lng: 139.7708, city: "Tokyo" },
    { name: "Ichiran Shibuya", type: "Restaurant", mealType: "Lunch", note: "Solo-booth tonkotsu ramen counter", transport: "Walk from Shibuya station", lat: 35.6598, lng: 139.7006, city: "Tokyo" },
    { name: "Sukiyabashi Jiro", type: "Restaurant", mealType: "Dinner", note: "Renowned sushi counter, reserve ahead", transport: "Subway to Ginza", lat: 35.6721, lng: 139.7636, city: "Tokyo" },
    { name: "Park Hyatt Tokyo", type: "Hotel", note: "Skyline views in Shinjuku", transport: "Subway or taxi", lat: 35.6852, lng: 139.6905, city: "Tokyo" },
    { name: "Hotel Gracery Shinjuku", type: "Hotel", note: "Convenient central base for exploring", transport: "Steps from Shinjuku station", lat: 35.6948, lng: 139.7020, city: "Tokyo" }
  ],
  london: [
    { name: "Tower of London", type: "Landmark", note: "Historic castle and home of the Crown Jewels", transport: "Tube or walk along the river", lat: 51.5081, lng: -0.0759, city: "London" },
    { name: "British Museum", type: "Landmark", note: "World history under one roof, free entry", transport: "Tube to Russell Square", lat: 51.5194, lng: -0.1270, city: "London" },
    { name: "Camden Market", type: "Landmark", note: "Stalls, street food, and canal-side wandering", transport: "Tube to Camden Town", lat: 51.5416, lng: -0.1500, city: "London" },
    { name: "The Wolseley", type: "Restaurant", mealType: "Breakfast", note: "Grand café classic near Piccadilly", transport: "Tube to Green Park", lat: 51.5072, lng: -0.1410, city: "London" },
    { name: "Borough Market", type: "Restaurant", mealType: "Lunch", note: "Stalls for everything from cheese to curry", transport: "Tube to London Bridge", lat: 51.5055, lng: -0.0910, city: "London" },
    { name: "Sketch", type: "Restaurant", mealType: "Dinner", note: "Playful, art-filled fine dining", transport: "Tube to Oxford Circus", lat: 51.5133, lng: -0.1424, city: "London" },
    { name: "The Savoy", type: "Hotel", note: "Storied riverside luxury hotel", transport: "Tube to Covent Garden", lat: 51.5101, lng: -0.1200, city: "London" },
    { name: "The Z Hotel Piccadilly", type: "Hotel", note: "Compact, well-located city base", transport: "Tube to Piccadilly Circus", lat: 51.5098, lng: -0.1350, city: "London" }
  ],
  amsterdam: [
    { name: "Anne Frank House", type: "Landmark", note: "Moving museum along the canal", transport: "Walk or tram, book ahead", lat: 52.3752, lng: 4.8840, city: "Amsterdam" },
    { name: "Van Gogh Museum", type: "Landmark", note: "The largest collection of Van Gogh's work", transport: "Tram to Museumplein", lat: 52.3584, lng: 4.8811, city: "Amsterdam" },
    { name: "Vondelpark", type: "Landmark", note: "Green space for a relaxed afternoon", transport: "Walk or bike", lat: 52.3579, lng: 4.8686, city: "Amsterdam" },
    { name: "Foodhallen", type: "Restaurant", mealType: "Breakfast", note: "Indoor food hall with variety of stalls", transport: "Tram to Bilderdijkstraat", lat: 52.3644, lng: 4.8686, city: "Amsterdam" },
    { name: "Café de Reiger", type: "Restaurant", mealType: "Lunch", note: "Cozy brown café in the Jordaan", transport: "Walk from the center", lat: 52.3745, lng: 4.8830, city: "Amsterdam" },
    { name: "Restaurant Greetje", type: "Restaurant", mealType: "Dinner", note: "Modern take on Dutch classics", transport: "Walk or tram", lat: 52.3708, lng: 4.9070, city: "Amsterdam" },
    { name: "Hotel TwentySeven", type: "Hotel", note: "Boutique luxury on the Dam", transport: "Central, walkable to most sights", lat: 52.3730, lng: 4.8926, city: "Amsterdam" },
    { name: "The Hoxton, Amsterdam", type: "Hotel", note: "Stylish canal-side stay", transport: "Walk or tram", lat: 52.3745, lng: 4.8890, city: "Amsterdam" }
  ],
  lisbon: [
    { name: "Belém Tower", type: "Landmark", note: "Riverside fortress and Lisbon icon", transport: "Tram 15 from downtown", lat: 38.6916, lng: -9.2160, city: "Lisbon" },
    { name: "Alfama", type: "Landmark", note: "Oldest district, narrow streets and fado", transport: "Walk or tram 28", lat: 38.7126, lng: -9.1316, city: "Lisbon" },
    { name: "São Jorge Castle", type: "Landmark", note: "Hilltop views across the city", transport: "Walk or tuk-tuk", lat: 38.7139, lng: -9.1334, city: "Lisbon" },
    { name: "Manteigaria", type: "Restaurant", mealType: "Breakfast", note: "Warm pastéis de nata straight from the oven", transport: "Walk in Chiado", lat: 38.7100, lng: -9.1425, city: "Lisbon" },
    { name: "Time Out Market", type: "Restaurant", mealType: "Lunch", note: "Food hall with the city's best chefs", transport: "Walk or metro to Cais do Sodré", lat: 38.7069, lng: -9.1456, city: "Lisbon" },
    { name: "Belcanto", type: "Restaurant", mealType: "Dinner", note: "Two-Michelin-star Portuguese tasting menu", transport: "Walk in Chiado", lat: 38.7101, lng: -9.1425, city: "Lisbon" },
    { name: "Memmo Alfama", type: "Hotel", note: "Boutique hotel with rooftop river views", transport: "Walk from Alfama", lat: 38.7124, lng: -9.1301, city: "Lisbon" },
    { name: "Bairro Alto Hotel", type: "Hotel", note: "Central stay near nightlife and viewpoints", transport: "Walk or funicular", lat: 38.7099, lng: -9.1454, city: "Lisbon" }
  ],
  kyoto: [
    { name: "Fushimi Inari Shrine", type: "Landmark", note: "Thousands of vermillion torii gates", transport: "Train to Inari station", lat: 34.9671, lng: 135.7727, city: "Kyoto" },
    { name: "Kinkaku-ji", type: "Landmark", note: "The Golden Pavilion reflected in its pond", transport: "Bus from central Kyoto", lat: 35.0394, lng: 135.7292, city: "Kyoto" },
    { name: "Arashiyama Bamboo Grove", type: "Landmark", note: "Towering bamboo path, best early morning", transport: "Train or bus", lat: 35.0094, lng: 135.6667, city: "Kyoto" },
    { name: "Nishiki Market", type: "Restaurant", mealType: "Breakfast", note: "Narrow market street of local snacks", transport: "Walk from downtown", lat: 35.0050, lng: 135.7649, city: "Kyoto" },
    { name: "Omen Kodaiji", type: "Restaurant", mealType: "Lunch", note: "Udon noodles near the eastern temples", transport: "Walk or bus", lat: 35.0022, lng: 135.7788, city: "Kyoto" },
    { name: "Kikunoi", type: "Restaurant", mealType: "Dinner", note: "Refined kaiseki multi-course dinner", transport: "Taxi recommended", lat: 35.0037, lng: 135.7770, city: "Kyoto" },
    { name: "The Ritz-Carlton, Kyoto", type: "Hotel", note: "Riverside luxury near the center", transport: "Walk or subway", lat: 35.0111, lng: 135.7690, city: "Kyoto" },
    { name: "Hotel Kanra Kyoto", type: "Hotel", note: "Modern rooms with a traditional touch", transport: "Walk to the station", lat: 34.9982, lng: 135.7580, city: "Kyoto" }
  ],
  mexicocity: [
    { name: "Zócalo", type: "Landmark", note: "Historic central plaza and cathedral", transport: "Metro to Zócalo", lat: 19.4326, lng: -99.1332, city: "Mexico City" },
    { name: "Frida Kahlo Museum", type: "Landmark", note: "Casa Azul, the artist's former home", transport: "Metro to Coyoacán, book ahead", lat: 19.3551, lng: -99.1624, city: "Mexico City" },
    { name: "Chapultepec Park", type: "Landmark", note: "Sprawling park with museums and a castle", transport: "Metro to Chapultepec", lat: 19.4204, lng: -99.1813, city: "Mexico City" },
    { name: "Panadería Rosetta", type: "Restaurant", mealType: "Breakfast", note: "Beloved bakery in Roma Norte", transport: "Walk in Roma Norte", lat: 19.4227, lng: -99.1657, city: "Mexico City" },
    { name: "Mercado Roma", type: "Restaurant", mealType: "Lunch", note: "Upscale food hall with local favorites", transport: "Walk or taxi", lat: 19.4180, lng: -99.1631, city: "Mexico City" },
    { name: "Pujol", type: "Restaurant", mealType: "Dinner", note: "Celebrated tasting menu, reserve well ahead", transport: "Taxi to Polanco", lat: 19.4326, lng: -99.2013, city: "Mexico City" },
    { name: "Círculo Mexicano", type: "Hotel", note: "Minimalist stay in the historic center", transport: "Walk from the Zócalo", lat: 19.4340, lng: -99.1370, city: "Mexico City" },
    { name: "Hotel Carlota", type: "Hotel", note: "Modern rooms near Reforma", transport: "Walk or metro", lat: 19.4276, lng: -99.1636, city: "Mexico City" }
  ]
};

let nearbySuggestions = [];
const imageCache = {};

// Looks up a real photo for a place via Wikipedia's public REST API so images
// actually match the place being shown, instead of a fixed set of stock photos.
async function fetchPlaceImage(place) {
  const cacheKey = place.name;
  if (imageCache[cacheKey] !== undefined) return imageCache[cacheKey];

  const candidates = [place.name, `${place.name}, ${place.city}`];
  for (const title of candidates) {
    try {
      const res = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`
      );
      if (!res.ok) continue;
      const data = await res.json();
      const url = data?.thumbnail?.source || data?.originalimage?.source || null;
      if (url) {
        imageCache[cacheKey] = url;
        return url;
      }
    } catch (e) {
      // try next candidate
    }
  }

  imageCache[cacheKey] = null;
  return null;
}

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
  if (normalized.includes("tokyo")) return "tokyo";
  if (normalized.includes("london")) return "london";
  if (normalized.includes("amsterdam")) return "amsterdam";
  if (normalized.includes("lisbon") || normalized.includes("lisboa")) return "lisbon";
  if (normalized.includes("kyoto")) return "kyoto";
  if (normalized.includes("mexico city") || normalized.includes("mexico d.f") || normalized.includes("cdmx")) return "mexicocity";

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
    const icon = TYPE_ICON[place.type] || "📍";
    card.innerHTML = `
      <div class="tm-place-image" data-place-image="${place.name}">${icon}</div>
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

    // Resolve and fill in the real photo asynchronously, without blocking render.
    fetchPlaceImage(place).then((url) => {
      if (!url) return;
      const imageEl = card.querySelector('[data-place-image]');
      if (imageEl) {
        imageEl.style.backgroundImage = `url('${url}')`;
        imageEl.textContent = "";
      }
    });
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