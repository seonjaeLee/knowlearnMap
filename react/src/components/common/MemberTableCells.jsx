import PropTypes from 'prop-types';
import KlBadge from './KlBadge';
import {
  getMemberGradeTextClass,
  getMemberRoleBadgeTone,
  getMemberStatusBadgeTone,
  isDefaultMemberStatus,
  isElevatedMemberRole,
} from './klMemberBadgeTones';

function MemberTableRole({ role }) {
  if (!isElevatedMemberRole(role)) {
    return <span className="member-mgmt-role-text">{role}</span>;
  }
  return (
    <KlBadge tone={getMemberRoleBadgeTone(role)} variant="compact">
      {role}
    </KlBadge>
  );
}

function GradeTierText({ tier, children }) {
  return <span className={getMemberGradeTextClass(tier)}>{children}</span>;
}

function MemberTableGrade({ grade }) {
  return <GradeTierText tier={grade}>{grade}</GradeTierText>;
}

function MemberTableStatus({ status }) {
  if (isDefaultMemberStatus(status)) {
    return <span className="member-mgmt-status-plain">{status}</span>;
  }
  return (
    <div className="member-mgmt-status-cell">
      <KlBadge tone={getMemberStatusBadgeTone(status)} variant="inline" title={status}>
        {status}
      </KlBadge>
    </div>
  );
}

MemberTableRole.propTypes = {
  role: PropTypes.string,
};

MemberTableGrade.propTypes = {
  grade: PropTypes.string,
};

MemberTableStatus.propTypes = {
  status: PropTypes.string,
};

MemberTableRole.defaultProps = {
  role: undefined,
};

MemberTableGrade.defaultProps = {
  grade: undefined,
};

MemberTableStatus.defaultProps = {
  status: undefined,
};

GradeTierText.propTypes = {
  tier: PropTypes.string.isRequired,
  children: PropTypes.node,
};

GradeTierText.defaultProps = {
  children: undefined,
};

export { GradeTierText, MemberTableRole, MemberTableGrade, MemberTableStatus };
