import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const filePath = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'pages', 'DomainSelection.jsx');
const src = readFileSync(filePath, 'utf8');

const pageIdx = src.indexOf('className="kl-page domain-selection-page"');
if (pageIdx === -1) {
  console.error('page marker not found');
  process.exit(1);
}

const retIdx = src.lastIndexOf('    return (', pageIdx);
const baseModalIdx = src.indexOf('\n            <BaseModal', pageIdx);
if (retIdx === -1 || baseModalIdx === -1) {
  console.error('range not found', { retIdx, baseModalIdx });
  process.exit(1);
}

const block = `    return (
        <div className="kl-page domain-selection-page">
            <div className="kl-main-sticky-head">
                <PageHeader
                    title="?ÑÎ©î???†ÌÉù"
                    breadcrumbs={['?¥ÎìúÎØºÏÑº??]}
                    description={\`Í¥ÄÎ¶¨Ïûê Î°úÍ∑∏??(\${user.email})\`}
                    actions={(
                        <button
                            type="button"
                            onClick={() => { setShowAddModal(true); setAddError(''); }}
                            className="kl-btn kl-btn--primary"
                        >
                            <Plus size={14} aria-hidden />
                            ?ÑÎ©î??Ï∂îÍ?
                        </button>
                    )}
                />
            </div>

            <div className="table-area">
                <div className="table-toolbar">
                    <div className="toolbar-left">
                        <span className="kl-table-toolbar-summary">
                            Ï¥?<strong>{domains.length}</strong>Í±?
                        </span>
                    </div>
                    <div className="toolbar-right">
                        <span className="domain-content-help">?ëÏóÖ???ÑÎ©î?∏ÏùÑ ?†ÌÉù?¥Ï£º?∏Ïöî.</span>
                    </div>
                </div>

                {error ? (
                    <p className="domain-selection-error" role="alert">{error}</p>
                ) : null}

                {loading ? (
                    <div className="admin-loading-state">
                        <div className="admin-spinner" />
                        <span>?ÑÎ©î??Î™©Î°ù??Î∂àÎü¨?§Îäî Ï§?..</span>
                    </div>
                ) : (
                    <div className="basic-table-shell kl-data-table-dense">
                        <BasicTable
                            className="domain-basic-table"
                            columns={domainColumns}
                            data={domains}
                            renderCell={renderDomainCell}
                            onRowClick={(_, { row }) => handleSelectDomain(row.id)}
                            getRowClassName={(domain) =>
                                [
                                    'domain-list-row',
                                    String(domain.id) === currentDomainId ? 'kl-table-row-selected' : '',
                                ]
                                    .filter(Boolean)
                                    .join(' ')
                            }
                            emptyState={{ variant: 'default', message: '?±Î°ù???ÑÎ©î?∏Ïù¥ ?ÜÏäµ?àÎã§.' }}
                        />
                    </div>
                )}
            </div>
`;

writeFileSync(filePath, src.slice(0, retIdx) + block + src.slice(baseModalIdx), 'utf8');
console.log('patched DomainSelection.jsx');
