import PropTypes from 'prop-types';
import KlTableRowActions from '../common/table/KlTableRowActions';

function SupportTableAdminActions({ label, onEdit, onDelete }) {
  return (
    <KlTableRowActions
      actions={[
        {
          kind: 'edit',
          onClick: onEdit,
          ariaLabel: `${label} 수정`,
        },
        {
          kind: 'delete',
          onClick: onDelete,
          ariaLabel: `${label} 삭제`,
        },
      ]}
    />
  );
}

SupportTableAdminActions.propTypes = {
  label: PropTypes.string.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default SupportTableAdminActions;
