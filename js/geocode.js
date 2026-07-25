async function suggestLocations(query) {
  if (!query || query.trim().length < 2) return [];
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.map((item) => ({
      display: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      city: item.address?.city || item.address?.town || item.address?.village || item.address?.state || "",
      country: item.address?.country || ""
    }));
  } catch {
    return [];
  }
}