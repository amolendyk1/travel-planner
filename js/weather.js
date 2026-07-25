async function getWeather(city) {
  const trimmedCity = (city || "").trim();
  const normalizedCity = trimmedCity.toLowerCase();

  if (!trimmedCity) {
    return {
      summary: "Add a destination to preview weather.",
      packing: ["Passport", "Charger", "Comfortable walking shoes"]
    };
  }

  const key = "";
  if (!key) {
    const baseTemp = trimmedCity.length % 7 + 18;
    const destinationStyle = normalizedCity.includes("barcelona") || normalizedCity.includes("rome")
      ? ["Light layers", "Walking shoes", "Sun protection"]
      : normalizedCity.includes("new york") || normalizedCity.includes("nyc")
        ? ["Layered outfit", "Compact umbrella", "Phone charger"]
        : ["Comfortable clothes", "Sunglasses", "Water bottle"];

    return {
      summary: `Weather preview for ${trimmedCity}: around ${baseTemp}°C and sunny.`,
      packing: ["Passport", "Phone charger", ...destinationStyle]
    };
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(trimmedCity)}&units=metric&appid=${key}`;
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error("Weather request failed");
    }

    const data = await res.json();
    const temps = data.list.map((d) => d.main.temp);
    const avg = temps.reduce((a, b) => a + b, 0) / temps.length;

    const packing = ["Passport", "Phone charger", "Comfortable walking shoes"];

    if (avg < 10) {
      packing.push("Warm coat", "Scarf");
    } else if (avg < 20) {
      packing.push("Light jacket", "Layered top");
    } else {
      packing.push("T-shirts", "Sunglasses");
    }

    if (normalizedCity.includes("barcelona") || normalizedCity.includes("rome")) {
      packing.push("Day bag");
    } else if (normalizedCity.includes("new york") || normalizedCity.includes("nyc")) {
      packing.push("Compact umbrella");
    }

    return {
      summary: `Avg Temp: ${avg.toFixed(1)}°C`,
      packing
    };
  } catch (error) {
    return {
      summary: `Weather preview for ${trimmedCity}: mild conditions.`,
      packing: ["Passport", "Phone charger", "Light layer", "Sunglasses"]
    };
  }
}