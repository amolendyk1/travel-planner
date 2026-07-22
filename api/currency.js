async function convertCurrency(code) {
  const currencyCode = (code || "USD").trim().toUpperCase();
  if (!currencyCode || currencyCode === "USD") {
    return 1;
  }

  const key = "";
  if (!key) {
    const sampleRates = {
      EUR: 0.92,
      GBP: 0.79,
      JPY: 157.5,
      CAD: 1.36,
      AUD: 1.5,
      INR: 83.4
    };
    return sampleRates[currencyCode] || 1;
  }

  try {
    const url = `https://v6.exchangerate-api.com/v6/${key}/latest/USD`;
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error("Currency request failed");
    }

    const data = await res.json();
    return data.conversion_rates?.[currencyCode] || 1;
  } catch (error) {
    return 1;
  }
}
