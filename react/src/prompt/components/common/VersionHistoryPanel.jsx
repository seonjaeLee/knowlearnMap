import React from 'react';
import { ChevronsLeft, Copy, Trash2 } from 'lucide-react';
import { useAlert } from '../../../context/AlertContext';
import KlTooltip from '../../../components/common/KlTooltip';
import { formatPromptVersionDate, getPromptVersionStatus } from '../../utils/promptVersionStatus';
import './VersionHistoryPanel.css';

const StatusTag = ({ tone, label }) => (
  <span className={`prompt-skin-tag${tone ? ` prompt-skin-tag--${tone}` : ''}`}>
    <span className="prompt-skin-tag__dot" aria-hidden />
    {label}
  </span>
);

const VersionHistoryPanel = ({
  promptName = '',
  versions = [],
  selectedVersion,
  onVersionChange,
  onCopyVersion,
  onDeleteVersion,
  compareVersions,
  collapsed = false,
  onToggleCollapse,
}) => {
  const { showAlert, showConfirm } = useAlert();

  const handleVersionClick = async (newVersionId) => {
    const currentVersion = versions.find((v) => v.id === selectedVersion);
    const newVersion = versions.find((v) => v.id === newVersionId);

    if (!currentVersion || !newVersion) {
      onVersionChange?.(newVersionId, newVersion?.content || '');
      return;
    }

    const comparison = compareVersions(currentVersion.version, newVersion.version);

    if (comparison > 0) {
      const confirmed = await showConfirm(
        `버전을 ${currentVersion.version}에서 ${newVersion.version}으로 변경하시겠습니까?`,
      );
      if (confirmed) {
        onVersionChange?.(newVersionId, newVersion.content);
      }
    } else {
      onVersionChange?.(newVersionId, newVersion.content);
    }
  };

  const handleDelete = async (e, version) => {
    e.stopPropagation();

    if (version.isActive) {
      if (versions.length === 1) {
        const confirmed = await showConfirm(
          '활성화된 버전을 삭제하면 프롬프트 전체가 삭제됩니다. 계속하시겠습니까?',
        );
        if (confirmed) {
          onDeleteVersion?.(version.id);
        }
      } else {
        showAlert('활성화된 버전은 삭제할 수 없습니다. 다른 버전을 활성화한 후 삭제해주세요.');
      }
      return;
    }

    const sortedVersions = [...versions].sort((a, b) => compareVersions(b.version, a.version));
    const top5 = sortedVersions.slice(0, 5);
    const isTop5 = top5.some((v) => v.id === version.id);

    if (isTop5) {
      const confirmed = await showConfirm(`버전 ${version.version}을(를) 삭제하시겠습니까?`);
      if (confirmed) {
        onDeleteVersion?.(version.id);
      }
    } else {
      onDeleteVersion?.(version.id);
    }
  };

  return (
    <div className={`vh-col ${collapsed ? 'is-collapsed' : ''}`}>
      <div className="vh-head">
        <h3 className="vh-head__title">
          <span className="vh-head__name">{promptName}</span>
          <span className="vh-head__sub">버전 히스토리</span>
        </h3>
        <div className="vh-head__toggle">
          <KlTooltip title={collapsed ? '펼치기' : '접기'} placement="top">
            <button
              type="button"
              className="vhc-btn"
              aria-label={collapsed ? '버전 패널 펼치기' : '버전 패널 접기'}
              onClick={() => onToggleCollapse?.(!collapsed)}
            >
              <ChevronsLeft size={16} aria-hidden />
            </button>
          </KlTooltip>
        </div>
      </div>
      <div className="vh-panel">
        <div className="vh-scroll">
          <table className="vh-table">
            <thead>
              <tr>
                <th>버전</th>
                <th>상태</th>
                <th>수정일자</th>
                <th className="vh-table__col-center vh-table__col-active">활성</th>
                <th className="vh-table__col-center vh-table__col-actions" aria-label="관리" />
              </tr>
            </thead>
            <tbody>
              {versions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="vh-table__empty">
                    버전이 없습니다.
                  </td>
                </tr>
              ) : (
                versions.map((version) => {
                  const status = getPromptVersionStatus(version, selectedVersion);
                  const isSelected = selectedVersion === version.id;
                  const rowClass = [
                    version.isActive ? 'vh-active-row' : '',
                    !version.isActive && (isSelected || status.tone === 'editing') ? 'vh-editing' : '',
                  ]
                    .filter(Boolean)
                    .join(' ');

                  const tagTone = status.tone === 'active' ? 'ok'
                    : status.tone === 'editing' ? 'warn'
                    : null;

                  return (
                    <tr
                      key={version.id}
                      className={rowClass}
                      onClick={() => handleVersionClick(version.id)}
                    >
                      <td>
                        <div className="vh-vercell">
                          <span className="vh-ver">v{version.version}</span>
                          <KlTooltip title="복사본 만들기" placement="top" enterDelay={300}>
                            <button
                              type="button"
                              className="vh-copy"
                              aria-label={`버전 ${version.version} 복사`}
                              onClick={(e) => {
                                e.stopPropagation();
                                onCopyVersion?.(version);
                              }}
                            >
                              <Copy size={14} strokeWidth={1.9} aria-hidden />
                            </button>
                          </KlTooltip>
                        </div>
                      </td>
                      <td>
                        <StatusTag tone={tagTone} label={status.label} />
                      </td>
                      <td>
                        {formatPromptVersionDate(version.updatedAt || version.createdAt)}
                      </td>
                      <td className="vh-table__col-center vh-table__col-active">
                        <span
                          className={`vh-radio${version.isActive ? ' is-checked' : ''}`}
                          role="radio"
                          aria-checked={version.isActive}
                          aria-label={version.isActive ? '현재 활성' : '활성으로 적용'}
                        />
                      </td>
                      <td className="vh-table__col-center vh-table__col-actions">
                        <button
                          type="button"
                          className="vh-del"
                          aria-label={`버전 ${version.version} 삭제`}
                          onClick={(e) => handleDelete(e, version)}
                        >
                          <Trash2 size={15} strokeWidth={1.9} aria-hidden />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VersionHistoryPanel;
