import StockNews from "./StockNews.jsx";

// API로 가져온 주식 정보와 1개월 차트를 보여주는 컴포넌트
function StockInfo({
  stockData,
  chartData,
  stockNews,
  symbol,
  isSaved,
  onToggleWatchlist,
}) {
  // 등락률에 따라 화면 색상을 다르게 보여주기 위한 클래스
  let trendClass = "neutral";

  if (stockData.changePercent > 0) {
    trendClass = "up";
  } else if (stockData.changePercent < 0) {
    trendClass = "down";
  }

  // 반복되는 가격 항목은 배열로 만들어 map으로 출력한다.
  const priceRows = [
    { label: "등락폭", value: stockData.change },
    { label: "오늘 고가", value: stockData.high },
    { label: "오늘 저가", value: stockData.low },
    { label: "오늘 시가", value: stockData.open },
    { label: "전일 종가", value: stockData.previousClose },
  ];

  // 숫자 가격을 달러 표시 형식으로 맞춘다.
  function formatPrice(value) {
    return `$${Number(value).toFixed(2)}`;
  }

  // 1개월 종가 데이터를 SVG 라인 차트 좌표로 바꾼다.
  function makeChartPoints() {
    if (!chartData || chartData.length === 0) {
      return "";
    }

    const closePrices = chartData.map((item) => Number(item.close));
    const minPrice = Math.min(...closePrices);
    const maxPrice = Math.max(...closePrices);
    const width = 260;
    const height = 120;
    const padding = 12;

    return closePrices
      .map((price, index) => {
        const x =
          chartData.length === 1
            ? width / 2
            : padding +
              (index / (chartData.length - 1)) * (width - padding * 2);
        const y =
          maxPrice === minPrice
            ? height / 2
            : height -
              padding -
              ((price - minPrice) / (maxPrice - minPrice)) *
                (height - padding * 2);

        return `${x},${y}`;
      })
      .join(" ");
  }

  const chartPoints = makeChartPoints();
  const chartPrices = chartData.map((item) => Number(item.close));
  const chartMin = chartPrices.length > 0 ? Math.min(...chartPrices) : 0;
  const chartMax = chartPrices.length > 0 ? Math.max(...chartPrices) : 0;
  const newsItems = stockNews || [];

  return (
    <article className="stock-card">
      <div className="stock-card-layout">
        <div className="stock-main-column">
          <div className="stock-card-header">
            <div>
              <p className="eyebrow">검색 결과</p>
              {/* App에서 전달받은 실제 조회 종목명을 보여준다. */}
              <h2>{symbol}</h2>
            </div>
            <button
              className={`add-button ${isSaved ? "saved" : ""}`}
              type="button"
              onClick={onToggleWatchlist}
              aria-pressed={isSaved}
            >
              {isSaved ? "관심종목 해제" : "관심종목 추가"}
            </button>
          </div>

          <div className="price-summary">
            <span>현재가</span>
            <strong>{formatPrice(stockData.price)}</strong>
            <p className={trendClass}>
              {formatPrice(stockData.change)} /{" "}
              {Number(stockData.changePercent).toFixed(2)}%
            </p>
          </div>

          <div className="stock-detail-layout">
            <dl className="price-grid">
              {/* 가격 세부 항목을 반복해서 같은 모양으로 출력한다. */}
              {priceRows.map((row) => (
                <div key={row.label}>
                  <dt>{row.label}</dt>
                  <dd>{formatPrice(row.value)}</dd>
                </div>
              ))}
            </dl>

            <section className="mini-chart" aria-label="1개월 종가 차트">
              <div className="mini-chart-header">
                <span>1개월 종가 차트</span>
                <strong>{chartData.length}일</strong>
              </div>

              {chartPoints ? (
                <>
                  <svg className="month-chart" viewBox="0 0 260 120" role="img">
                    <title>최근 1개월 종가 흐름</title>
                    <polyline
                      className={`month-chart-line ${trendClass}`}
                      points={chartPoints}
                    />
                  </svg>

                  <div className="range-labels">
                    <span>최저 {formatPrice(chartMin)}</span>
                    <span>최고 {formatPrice(chartMax)}</span>
                  </div>
                </>
              ) : (
                <p className="chart-empty">차트 데이터가 없습니다.</p>
              )}
            </section>
          </div>
        </div>

        <StockNews newsItems={newsItems} symbol={symbol} />
      </div>
    </article>
  );
}

export default StockInfo;
