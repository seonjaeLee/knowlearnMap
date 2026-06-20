import PropTypes from 'prop-types';
import { CornerDownRight, Loader2 } from 'lucide-react';

/**
 * BasicTable `renderRowDetail`용 — recessed 트레이 + ↳ + 흰 카드 래퍼.
 * @see patterns/kl-table-row-detail.css
 */
function BasicTableRowDetail({ children, loading = false, loadingMessage = '불러오는 중...' }) {
    return (
        <div className="kl-table-row-detail">
            <span className="kl-table-row-detail__arrow" aria-hidden>
                <CornerDownRight size={18} strokeWidth={1.75} />
            </span>
            <div className="kl-table-row-detail__card">
                {loading ? (
                    <div className="kl-table-row-detail__loading" role="status">
                        <Loader2 className="kl-table-row-detail__spin" size={18} aria-hidden />
                        <span>{loadingMessage}</span>
                    </div>
                ) : (
                    children
                )}
            </div>
        </div>
    );
}

BasicTableRowDetail.propTypes = {
    children: PropTypes.node,
    loading: PropTypes.bool,
    loadingMessage: PropTypes.string,
};

export default BasicTableRowDetail;
