// 사용자가 저장한 관심종목 목록을 보여주는 컴포넌트
function Watchlist({ watchlist, onSelect, onRemove }) {
  return (
    <section className="watchlist-panel" aria-label="관심종목">
      <div className="section-heading">
        <p className="eyebrow">Watchlist</p>
        <h2>내 관심종목</h2>
      </div>

      {/* 관심종목이 비어 있으면 목록 대신 안내 문구를 보여준다. */}
      {watchlist.length === 0 ? (
        <p className="empty-message">아직 관심종목이 없습니다.</p>
      ) : (
        <ul className="watchlist">
          {/* 관심종목 배열을 화면 목록으로 출력한다. */}
          {watchlist.map((symbol) => (
            <li className="watchlist-item" key={symbol}>
              <button
                className="symbol-button"
                type="button"
                // 종목명을 누르면 해당 종목을 다시 조회한다.
                onClick={() => onSelect(symbol)}
              >
                {symbol}
              </button>
              <div className="watchlist-actions">
                {/* 조회 버튼도 종목명 버튼과 같은 기능을 한다. */}
                <button type="button" onClick={() => onSelect(symbol)}>
                  조회
                </button>
                <button
                  className="remove-button"
                  type="button"
                  // 삭제 버튼은 이 종목만 관심목록에서 제거한다.
                  onClick={() => onRemove(symbol)}
                >
                  삭제
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default Watchlist;
