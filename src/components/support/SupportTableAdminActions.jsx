import PropTypes from 'prop-types';
import { Pencil, Trash2 } from 'lucide-react';

function SupportTableAdminActions({ label, onEdit, onDelete }) {
  return (
    <div className="kl-table-actions">
      <button
        type="button"
        className="kl-table-icon-btn kl-table-icon-btn--neutral"
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
        title="수정"
        aria-label={`${label} 수정`}
      >
        <Pencil strokeWidth={1.75} aria-hidden />
      </button>
      <button
        type="button"
        className="kl-table-icon-btn kl-table-icon-btn--danger"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        title="삭제"
        aria-label={`${label} 삭제`}
      >
        <Trash2 strokeWidth={1.75} size={16} aria-hidden />
      </button>
    </div>
  );
}

SupportTableAdminActions.propTypes = {
  label: PropTypes.string.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default SupportTableAdminActions;
