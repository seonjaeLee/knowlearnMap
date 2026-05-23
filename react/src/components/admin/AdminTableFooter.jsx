import React from 'react';

/**
 * 목록 하단: 좌측 요약 · 가운데 페이지네이션 · 우측 예약(추가 옵션용).
 * 우측 슬롯은 비어 있어도 1fr 그리드로 폭을 확보해 가운데 정렬이 흐트러지지 않게 합니다.
 */
function AdminTableFooter({ start, center, end, className = '' }) {
    return (
        <div className={`admin-table-footer${className ? ` ${className}` : ''}`}>
            <div className="admin-table-footer__start">{start}</div>
            <div className="admin-table-footer__center">{center}</div>
            <div
                className="admin-table-footer__end"
                aria-hidden={end == null || end === false}
            >
                {end != null && end !== false ? end : null}
            </div>
        </div>
    );
}

export default AdminTableFooter;
