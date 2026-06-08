// 빠른 검색 버튼으로 보여줄 대표 종목들
const QUICK_SYMBOLS = ["AAPL", "MSFT", "NVDA", "TSLA", "AMD"];

// 종목 티커를 입력하거나 빠른 선택 버튼으로 검색하는 영역
function StockSearch({
  symbol,
  onSymbolChange,
  onSearch,
  onQuickSelect,
}) {
  // form 기본 새로고침을 막고 App에서 전달받은 검색 함수를 실행한다.
  function handleSubmit(event) {
    event.preventDefault();
    onSearch();
  }

  return (
    <section className="search-panel" aria-label="종목 검색">
      <form className="search-form" onSubmit={handleSubmit}>
        <label className="search-label" htmlFor="stock-symbol">
          종목 티커
        </label>
        <div className="search-row">
          <input
            id="stock-symbol"
            // 입력값은 App의 symbol state와 연결되어 있다.
            value={symbol}
            onChange={(event) => onSymbolChange(event.target.value)}
            placeholder="예: NVDA"
            autoComplete="off"
          />
          <button type="submit">검색</button>
        </div>
      </form>
      {/* 자주 볼 만한 종목은 버튼으로 바로 검색할 수 있게 했다. */}
      <div className="quick-buttons" aria-label="빠른 선택">
        {/* QUICK_SYMBOLS 배열을 버튼 목록으로 출력한다. */}
        {QUICK_SYMBOLS.map((quickSymbol) => (
          <button
            key={quickSymbol}
            type="button"
            // 버튼을 누르면 해당 티커를 App으로 보내서 바로 조회한다.
            onClick={() => onQuickSelect(quickSymbol)}
          >
            {quickSymbol}
          </button>
        ))}
      </div>
    </section>
  );
}

export default StockSearch;
