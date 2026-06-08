import { useEffect, useState } from "react";
import {
  fetchCompanyNews,
  fetchMonthlyCandles,
  fetchQuote,
} from "./api/stockApi.js";
import StockInfo from "./components/StockInfo.jsx";
import StockSearch from "./components/StockSearch.jsx";
import Watchlist from "./components/Watchlist.jsx";

const STORAGE_KEY = "watchlist";
const SEARCH_TAB = "search";
const WATCHLIST_TAB = "watchlist";

// 주식 검색, API 결과, 관심종목 상태를 관리하는 메인 컴포넌트
function App() {
  // 검색창에 입력되는 티커 값을 저장한다.
  const [symbol, setSymbol] = useState("");

  // 실제로 조회가 성공한 종목명을 결과 카드에 보여주기 위해 따로 저장한다.
  const [selectedSymbol, setSelectedSymbol] = useState("");

  // API에서 받아온 주식 가격 데이터를 저장한다.
  const [stockData, setStockData] = useState(null);

  // 1개월 차트에 사용할 일별 종가 데이터를 저장한다.
  const [chartData, setChartData] = useState([]);

  // Alpha Vantage에서 받아온 종목 관련 뉴스를 저장한다.
  const [stockNews, setStockNews] = useState([]);

  // 사용자가 관심종목으로 추가한 티커 목록이다.
  const [watchlist, setWatchlist] = useState([]);

  // API 요청 중인지 표시하기 위한 상태이다.
  const [loading, setLoading] = useState(false);

  // API 오류나 입력 오류가 있을 때 화면에 보여줄 메시지이다.
  const [error, setError] = useState("");

  // 현재 보고 있는 탭이 검색 탭인지 관심종목 탭인지 구분한다.
  const [activeTab, setActiveTab] = useState(SEARCH_TAB);

  // 현재 조회된 종목이 관심종목에 저장되어 있는지 판단한다.
  const isSaved = watchlist.includes(selectedSymbol);

  // 입력받은 티커로 Alpha Vantage API에 주식 정보를 요청한다.
  async function fetchStockData(nextSymbol) {
    // 공백을 제거하고, 미국 주식 티커 형식에 맞게 대문자로 바꾼다.
    const cleanSymbol = nextSymbol.trim().toUpperCase();

    // 빈 값으로 검색하지 못하게 막는다.
    if (!cleanSymbol) {
      setError("종목 티커를 입력해주세요.");
      return;
    }

    // 요청이 시작되면 로딩 문구를 보여주고 이전 에러는 지운다.
    setLoading(true);
    setError("");

    try {
      // 필요한 API를 순서대로 요청한다.
      const quoteData = await fetchQuote(cleanSymbol);
      const monthlyData = await fetchMonthlyCandles(cleanSymbol);
      const newsData = await fetchCompanyNews(cleanSymbol);

      // API 요청이 성공하면 결과 데이터를 상태에 저장한다.
      setSelectedSymbol(cleanSymbol);
      setSymbol(cleanSymbol);
      setStockData(quoteData);
      setChartData(monthlyData);
      setStockNews(newsData);
    } catch (fetchError) {
      // API 함수에서 넘어온 에러 종류에 따라 다른 안내 문구를 보여준다.
      if (fetchError.message === "API_KEY_MISSING") {
        setError("Alpha Vantage API Key가 설정되지 않았습니다.");
      } else if (fetchError.message === "API_RATE_LIMIT") {
        setError("API 요청 한도를 초과했습니다.");
      } else if (fetchError.message === "STOCK_NOT_FOUND") {
        setError("종목 정보를 찾을 수 없습니다.");
      } else {
        setError("주식 정보를 불러오지 못했습니다.");
      }

      // 실패한 경우에는 이전 검색 결과가 남아 있지 않도록 비운다.
      setStockData(null);
      setChartData([]);
      setStockNews([]);
    }

    // 요청이 끝나면 로딩을 끈다.
    setLoading(false);
  }

  // 검색 버튼이나 Enter 입력으로 실행되는 함수
  function handleSearch() {
    fetchStockData(symbol);
  }

  // 빠른 선택 버튼을 누르면 해당 종목을 바로 검색한다.
  function handleQuickSelect(nextSymbol) {
    setSymbol(nextSymbol);
    fetchStockData(nextSymbol);
  }

  // 현재 조회된 종목을 관심종목에 추가하거나, 이미 있으면 제거한다.
  function toggleWatchlist() {
    if (!selectedSymbol || !stockData) return;

    setWatchlist((currentWatchlist) => {
      if (currentWatchlist.includes(selectedSymbol)) {
        return currentWatchlist.filter((item) => item !== selectedSymbol);
      }

      return [...currentWatchlist, selectedSymbol];
    });
    setError("");
  }

  // 삭제 버튼을 누른 종목만 관심종목 배열에서 제외한다.
  function removeFromWatchlist(symbolToRemove) {
    setWatchlist((currentWatchlist) =>
      currentWatchlist.filter((item) => item !== symbolToRemove),
    );
  }

  // 관심종목에서 선택한 종목을 검색 탭으로 이동해서 조회한다.
  function selectFromWatchlist(nextSymbol) {
    setSymbol(nextSymbol);
    setActiveTab(SEARCH_TAB);
    fetchStockData(nextSymbol);
  }

  // 처음 실행될 때 저장된 관심종목을 불러온다.
  useEffect(() => {
    try {
      // localStorage에는 문자열로 저장되므로 JSON.parse로 배열로 되돌린다.
      const savedWatchlist = localStorage.getItem(STORAGE_KEY);
      if (savedWatchlist) {
        const parsedWatchlist = JSON.parse(savedWatchlist);
        setWatchlist(parsedWatchlist);
      }
    } catch {
      setWatchlist([]);
    }

  }, []);

  // 관심종목이 바뀔 때마다 브라우저에 저장한다.
  useEffect(() => {
    // 배열은 그대로 저장할 수 없어서 JSON 문자열로 변환한다.
    localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist));
  }, [watchlist]);

  return (
    <main className="app">
      <div className="top-bar">
        <header className="hero">
          <h1>미국주식 대시보드</h1>
          <p>미국 주식 티커를 검색하고 관심종목을 저장해보세요.</p>
        </header>

        {/* activeTab 상태에 따라 선택된 탭의 버튼 스타일을 바꾼다. */}
        <nav className="tab-nav" role="tablist" aria-label="대시보드 메뉴">
          <button
            type="button"
            role="tab"
            id="search-tab"
            className={activeTab === SEARCH_TAB ? "active" : ""}
            onClick={() => setActiveTab(SEARCH_TAB)}
            aria-selected={activeTab === SEARCH_TAB}
            aria-controls="search-panel"
          >
            종목 검색
          </button>
          <button
            type="button"
            role="tab"
            id="watchlist-tab"
            className={activeTab === WATCHLIST_TAB ? "active" : ""}
            onClick={() => setActiveTab(WATCHLIST_TAB)}
            aria-selected={activeTab === WATCHLIST_TAB}
            aria-controls="watchlist-panel"
          >
            관심종목
            {/* 관심종목 개수를 탭 안에 같이 보여준다. */}
            <span>{watchlist.length}</span>
          </button>
        </nav>
      </div>

      {/* 검색 탭이 선택되었을 때만 검색 화면을 보여준다. */}
      {activeTab === SEARCH_TAB && (
        <section
          className="tab-panel"
          id="search-panel"
          role="tabpanel"
          aria-labelledby="search-tab"
        >
          <StockSearch
            symbol={symbol}
            onSymbolChange={setSymbol}
            onSearch={handleSearch}
            onQuickSelect={handleQuickSelect}
          />

          {/* 에러 메시지가 있을 때만 화면에 출력한다. */}
          {error && <p className="error-message">{error}</p>}

          <div className="result-area">
            {/* API 요청 중에는 로딩 문구를 보여준다. */}
            {loading && (
              <p className="status-message">주식 정보를 불러오는 중입니다...</p>
            )}

            {/* 로딩이 끝나고 데이터가 있으면 결과 카드를 보여준다. */}
            {!loading && stockData && (
              <StockInfo
                stockData={stockData}
                chartData={chartData}
                stockNews={stockNews}
                symbol={selectedSymbol}
                isSaved={isSaved}
                onToggleWatchlist={toggleWatchlist}
              />
            )}

            {/* 검색 결과도 에러도 없을 때 기본 안내 문구를 보여준다. */}
            {!loading && !stockData && !error && (
              <p className="status-message">
                종목을 검색하면 결과가 표시됩니다.
              </p>
            )}
          </div>
        </section>
      )}

      {/* 관심종목 탭이 선택되었을 때만 관심종목 목록을 보여준다. */}
      {activeTab === WATCHLIST_TAB && (
        <section
          className="tab-panel"
          id="watchlist-panel"
          role="tabpanel"
          aria-labelledby="watchlist-tab"
        >
          <Watchlist
            watchlist={watchlist}
            onSelect={selectFromWatchlist}
            onRemove={removeFromWatchlist}
          />
        </section>
      )}
    </main>
  );
}

export default App;
