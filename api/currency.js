async function convertCurrency(code) {
  const key = ""; // add your key
  const url = `https://v6.exchangerate-api.com/v6/${key}/latest/USD`;
  const res = await fetch(url);
  const data = await res.json();
  return data.conversion_rates[code];
}
