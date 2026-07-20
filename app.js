document.getElementById("load").addEventListener("click", async () => {
  const destination = document.getElementById("destination").value;
  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;
  const budget = document.getElementById("budget").value;
  const currency = document.getElementById("currency").value;

  const weatherData = await getWeather(destination);
  const rate = await convertCurrency(currency);

  document.getElementById("weather").innerHTML =
    `<h2>Weather</h2>${weatherData.summary}`;

  document.getElementById("budget").innerHTML =
    `<h2>Budget</h2>${(budget * rate).toFixed(2)} ${currency}`;

  document.getElementById("packing").innerHTML =
    `<h2>Packing List</h2>${weatherData.packing.join(", ")}`;
});
