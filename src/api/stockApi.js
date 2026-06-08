const ALPHA_VANTAGE_URL = "https://www.alphavantage.co/query";

export async function fetchQuote(symbol) {
  const apiKey = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY;

  if (!apiKey) {
    throw new Error("API_KEY_MISSING");
  }

  const response = await fetch(
    `${ALPHA_VANTAGE_URL}?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(
      symbol,
    )}&apikey=${apiKey}`,
  );

  if (!response.ok) {
    throw new Error("API_REQUEST_FAILED");
  }

  const data = await response.json();
  const quote = data["Global Quote"];

  if (data.Note || data.Information) {
    throw new Error("API_RATE_LIMIT");
  }

  if (!quote || !quote["05. price"] || Number(quote["05. price"]) === 0) {
    throw new Error("STOCK_NOT_FOUND");
  }

  return {
    price: Number(quote["05. price"]),
    change: Number(quote["09. change"]),
    changePercent: Number(String(quote["10. change percent"]).replace("%", "")),
    high: Number(quote["03. high"]),
    low: Number(quote["04. low"]),
    open: Number(quote["02. open"]),
    previousClose: Number(quote["08. previous close"]),
  };
}

export async function fetchMonthlyCandles(symbol) {
  const apiKey = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY;

  if (!apiKey) {
    throw new Error("API_KEY_MISSING");
  }

  const response = await fetch(
    `${ALPHA_VANTAGE_URL}?function=TIME_SERIES_DAILY&symbol=${encodeURIComponent(
      symbol,
    )}&outputsize=compact&apikey=${apiKey}`,
  );

  if (!response.ok) {
    throw new Error("API_REQUEST_FAILED");
  }

  const data = await response.json();
  const timeSeries = data["Time Series (Daily)"];

  if (data.Note || data.Information) {
    throw new Error("API_RATE_LIMIT");
  }

  if (!timeSeries) {
    throw new Error("CHART_NOT_FOUND");
  }

  return Object.keys(timeSeries)
    .sort()
    .slice(-23)
    .map((date) => ({
      close: Number(timeSeries[date]["4. close"]),
      time: date,
    }));
}

export async function fetchCompanyNews(symbol) {
  const apiKey = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY;

  if (!apiKey) {
    throw new Error("API_KEY_MISSING");
  }

  const response = await fetch(
    `${ALPHA_VANTAGE_URL}?function=NEWS_SENTIMENT&tickers=${encodeURIComponent(
      symbol,
    )}&sort=RELEVANCE&limit=20&apikey=${apiKey}`,
  );

  if (!response.ok) {
    throw new Error("NEWS_REQUEST_FAILED");
  }

  const data = await response.json();

  if (data.Note || data.Information) {
    throw new Error("API_RATE_LIMIT");
  }

  if (!Array.isArray(data.feed)) {
    throw new Error("NEWS_REQUEST_FAILED");
  }

  return data.feed
    .slice(0, 4)
    .map((item) => ({
      id: item.url,
      headline: item.title,
      source: item.source,
      summary: item.summary,
      url: item.url,
      publishedAt: item.time_published,
      sentimentLabel: item.overall_sentiment_label || "Neutral",
    }));
}
