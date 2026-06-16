const ALPHA_VANTAGE_URL = "https://www.alphavantage.co/query";
const ALPHA_VANTAGE_REQUEST_INTERVAL_MS = 1100;
const ALPHA_VANTAGE_API_KEY = "XUK5REH5HNVBU1W5";

let lastAlphaVantageRequestTime = 0;

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function waitForAlphaVantageRequestSlot() {
  const now = Date.now();
  const timeSinceLastRequest = now - lastAlphaVantageRequestTime;
  const remainingWaitTime =
    ALPHA_VANTAGE_REQUEST_INTERVAL_MS - timeSinceLastRequest;

  if (remainingWaitTime > 0) {
    await wait(remainingWaitTime);
  }

  lastAlphaVantageRequestTime = Date.now();
}

function isRateLimitMessage(message) {
  if (typeof message !== "string") return false;

  const normalizedMessage = message.toLowerCase();
  return (
    normalizedMessage.includes("rate limit") ||
    normalizedMessage.includes("api requests") ||
    normalizedMessage.includes("1 request per second")
  );
}

async function requestAlphaVantage(params, requestErrorMessage) {
  if (!ALPHA_VANTAGE_API_KEY) {
    throw new Error("API_KEY_MISSING");
  }

  params.set("apikey", ALPHA_VANTAGE_API_KEY);

  await waitForAlphaVantageRequestSlot();

  const response = await fetch(`${ALPHA_VANTAGE_URL}?${params.toString()}`);

  if (!response.ok) {
    throw new Error(requestErrorMessage);
  }

  const data = await response.json();

  if (data.Note || isRateLimitMessage(data.Information)) {
    throw new Error("API_RATE_LIMIT");
  }

  if (data.Information || data["Error Message"]) {
    throw new Error(requestErrorMessage);
  }

  return data;
}

export async function fetchQuote(symbol) {
  const data = await requestAlphaVantage(
    new URLSearchParams({
      function: "GLOBAL_QUOTE",
      symbol,
    }),
    "API_REQUEST_FAILED",
  );
  const quote = data["Global Quote"];

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
  const data = await requestAlphaVantage(
    new URLSearchParams({
      function: "TIME_SERIES_DAILY",
      outputsize: "compact",
      symbol,
    }),
    "API_REQUEST_FAILED",
  );
  const timeSeries = data["Time Series (Daily)"];

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
  const data = await requestAlphaVantage(
    new URLSearchParams({
      function: "NEWS_SENTIMENT",
      limit: "20",
      sort: "RELEVANCE",
      tickers: symbol,
    }),
    "NEWS_REQUEST_FAILED",
  );

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
