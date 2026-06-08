// Alpha Vantage에서 가져온 종목 관련 뉴스를 보여주는 컴포넌트
function StockNews({ newsItems, symbol }) {
  // Alpha Vantage 뉴스의 날짜 문자열을 보기 쉬운 날짜로 바꾼다.
  function formatNewsDate(publishedAt) {
    if (!publishedAt || publishedAt.length < 8) {
      return "";
    }

    const year = publishedAt.slice(0, 4);
    const month = publishedAt.slice(4, 6);
    const day = publishedAt.slice(6, 8);

    return `${year}. ${month}. ${day}.`;
  }

  return (
    <aside className="news-panel" aria-label={`${symbol} 관련 뉴스`}>
      <div className="news-heading">
        <p className="eyebrow">Alpha Vantage News</p>
        <h3>관련 뉴스</h3>
      </div>

      {newsItems.length > 0 ? (
        <ul className="news-list">
          {/* 뉴스 제목을 누르면 Alpha Vantage가 제공한 원문 링크로 이동한다. */}
          {newsItems.map((news) => (
            <li key={news.id || news.url}>
              <a href={news.url} target="_blank" rel="noreferrer">
                {news.headline}
              </a>
              <div className="news-meta">
                <span>{news.source}</span>
                <span>{formatNewsDate(news.publishedAt)}</span>
              </div>
              <div className="news-tags">
                <span>{news.sentimentLabel}</span>
              </div>
              {news.summary && <p>{news.summary}</p>}
            </li>
          ))}
        </ul>
      ) : (
        <p className="news-empty">관련 뉴스가 없습니다.</p>
      )}
    </aside>
  );
}

export default StockNews;
