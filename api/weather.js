async function getWeather(city) {
  const key = ""; // add your key
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${key}`;
  const res = await fetch(url);
  const data = await res.json();

  const temps = data.list.map((d) => d.main.temp);
  const avg = temps.reduce((a, b) => a + b, 0) / temps.length;

  const packing = ["Passport", "Charger"];
  if (avg < 10) packing.push("Coat");
  else if (avg < 20) packing.push("Jacket");
  else packing.push("T-shirts");

  return {
    summary: `Avg Temp: ${avg.toFixed(1)}°C`,
    packing
  };
}
