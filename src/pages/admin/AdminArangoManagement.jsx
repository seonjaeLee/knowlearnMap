import React, { useState, useEffect } from 'react';
import { adminArangoApi } from '../../services/api';
import { useAlert } from '../../context/AlertContext';
import { RotateCcw, ChevronDown, ChevronRight, Database, Loader2 } from 'lucide-react';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import './admin-common.css';

function AdminArangoManagement() {
    const [databases, setDatabases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedDomain, setExpandedDomain] = useState(null);
    const [workspaceDetails, setWorkspaceDetails] = useState({});
    const [loadingDetails, setLoadingDetails] = useState({});
    const { showAlert } = useAlert();

    const fetchDatabases = async () => {
        try {
            setLoading(true);
            const data = await adminArangoApi.getDatabases();
            setDatabases(data || []);
        } catch (error) {
            console.error('Failed to fetch arango databases:', error);
            showAlert('ArangoDB 데이터베이스 목록을 불러오는데 실패했습니다.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDatabases();
    }, []);

    const handleRowClick = async (domainId) => {
        if (expandedDomain === domainId) {
            setExpandedDomain(null);
            return;
        }

        setExpandedDomain(domainId);

        if (workspaceDetails[domainId]) return;

        try {
            setLoadingDetails(prev => ({ ...prev, [domainId]: true }));
            const data = await adminArangoApi.getWorkspaces(domainId);
            setWorkspaceDetails(prev => ({ ...prev, [domainId]: data || [] }));
        } catch (error) {
            console.error('Failed to fetch workspace details:', error);
            showAlert('워크스페이스 상세 정보를 불러오는데 실패했습니다.', 'error');
        } finally {
            setLoadingDetails(prev => ({ ...prev, [domainId]: false }));
        }
    };

    const handleRefresh = () => {
        setExpandedDomain(null);
        setWorkspaceDetails({});
        fetchDatabases();
    };

    const thStyle = { padding: '12px 16px', fontWeight: 600, color: '#555' };
    const tdStyle = { padding: '12px 16px', color: '#666' };
    const tdCenterStyle = { ...tdStyle, textAlign: 'center' };

    return (
        <div className="admin-page">
            <AdminPageHeader
                icon={Database}
                title="ArangoDB 관리"
                count={databases.length}
                actions={(
                    <button onClick={handleRefresh} className="admin-btn admin-btn-icon" title="새로고침">
                        <RotateCcw size={16} />
                    </button>
                )}
            />

            {loading ? (
                <div style={{ padding: '60px', textAlign: 'center', color: '#666', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} color="#2563eb" />
                    <span>데이터를 불러오는 중...</span>
                    <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
                </div>
            ) : (
                <div className="table-container" style={{ overflowX: 'auto', background: 'white', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--admin-font-md)' }}>
                        <thead>
                            <tr style={{ background: '#f8f9fa', borderBottom: '1px solid #e0e0e0', textAlign: 'left' }}>
                                <th style={{ ...thStyle, width: '40px' }}></th>
                                <th style={thStyle}>도메인</th>
                                <th style={thStyle}>DB명</th>
                                <th style={{ ...thStyle, textAlign: 'center' }}>Objects</th>
                                <th style={{ ...thStyle, textAlign: 'center' }}>Relations</th>
                                <th style={{ ...thStyle, textAlign: 'center' }}>Edges</th>
                                <th style={{ ...thStyle, textAlign: 'center' }}>WS(RDB)</th>
                                <th style={{ ...thStyle, textAlign: 'center' }}>WS(Arango)</th>
                                <th style={{ ...thStyle, textAlign: 'center' }}>고아</th>
                                <th style={{ ...thStyle, textAlign: 'center' }}>DB상태</th>
                            </tr>
                        </thead>
                        <tbody>
                            {databases.length > 0 ? (
                                databases.map(db => (
                                    <React.Fragment key={db.domainId}>
                                        {/* Level 1 Row */}
                                        <tr
                                            onClick={() => handleRowClick(db.domainId)}
                                            style={{
                                                borderBottom: '1px solid #f0f0f0',
                                                cursor: 'pointer',
                                                background: expandedDomain === db.domainId ? '#f0f7ff' : 'white',
                                                transition: 'background 0.15s'
                                            }}
                                            onMouseEnter={e => { if (expandedDomain !== db.domainId) e.currentTarget.style.background = '#fafafa'; }}
                                            onMouseLeave={e => { if (expandedDomain !== db.domainId) e.currentTarget.style.background = 'white'; }}
                                        >
                                            <td style={{ ...tdCenterStyle, width: '40px' }}>
                                                {expandedDomain === db.domainId
                                                    ? <ChevronDown size={16} />
                                                    : <ChevronRight size={16} />}
                                            </td>
                                            <td style={{ ...tdStyle, fontWeight: 500, color: '#333' }}>{db.domainName}</td>
                                            <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: 'var(--admin-font-base)' }}>{db.arangoDbName || '-'}</td>
                                            <td style={tdCenterStyle}>{db.objectNodeCount.toLocaleString()}</td>
                                            <td style={tdCenterStyle}>{db.relationNodeCount.toLocaleString()}</td>
                                            <td style={tdCenterStyle}>{db.edgeCount.toLocaleString()}</td>
                                            <td style={tdCenterStyle}>{db.rdbWorkspaceCount}</td>
                                            <td style={tdCenterStyle}>{db.arangoWorkspaceCount}</td>
                                            <td style={tdCenterStyle}>
                                                {db.orphanWorkspaceCount > 0 ? (
                                                    <span style={{
                                                        padding: '2px 8px',
                                                        borderRadius: '12px',
                                                        fontSize: 'var(--admin-font-sm)',
                                                        backgroundColor: '#fff1f0',
                                                        color: '#cf1322',
                                                        fontWeight: 600
                                                    }}>
                                                        {db.orphanWorkspaceCount}
                                                    </span>
                                                ) : (
                                                    <span style={{ color: '#999' }}>0</span>
                                                )}
                                            </td>
                                            <td style={tdCenterStyle}>
                                                <span style={{
                                                    padding: '4px 8px',
                                                    borderRadius: '12px',
                                                    fontSize: 'var(--admin-font-sm)',
                                                    backgroundColor: db.dbExists ? '#e8f5e9' : '#f5f5f5',
                                                    color: db.dbExists ? '#2e7d32' : '#9e9e9e',
                                                    fontWeight: 500
                                                }}>
                                                    {db.dbExists ? '정상' : '없음'}
                                                </span>
                                            </td>
                                        </tr>

                                        {/* Level 2 Expanded Detail */}
                                        {expandedDomain === db.domainId && (
                                            <tr>
                                                <td colSpan="10" style={{ padding: 0, background: '#f9fafb' }}>
                                                    <div style={{ padding: '16px 24px 16px 56px' }}>
                                                        {loadingDetails[db.domainId] ? (
                                                            <div style={{ padding: '20px', textAlign: 'center', color: '#888', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                                                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} color="#2563eb" />
                                                                워크스페이스 상세 정보를 불러오는 중...
                                                            </div>
                                                        ) : (
                                                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--admin-font-base)', background: 'white', border: '1px solid #e8e8e8', borderRadius: '6px' }}>
                                                                <thead>
                                                                    <tr style={{ background: '#fafafa', borderBottom: '1px solid #e8e8e8', textAlign: 'left' }}>
                                                                        <th style={{ padding: '10px 12px', fontWeight: 600, color: '#555' }}>WS ID</th>
                                                                        <th style={{ padding: '10px 12px', fontWeight: 600, color: '#555' }}>워크스페이스명</th>
                                                                        <th style={{ padding: '10px 12px', fontWeight: 600, color: '#555' }}>소유자</th>
                                                                        <th style={{ padding: '10px 12px', fontWeight: 600, color: '#555', textAlign: 'center' }}>Objects</th>
                                                                        <th style={{ padding: '10px 12px', fontWeight: 600, color: '#555', textAlign: 'center' }}>Relations</th>
                                                                        <th style={{ padding: '10px 12px', fontWeight: 600, color: '#555', textAlign: 'center' }}>Edges</th>
                                                                        <th style={{ padding: '10px 12px', fontWeight: 600, color: '#555', textAlign: 'center' }}>문서(Arango)</th>
                                                                        <th style={{ padding: '10px 12px', fontWeight: 600, color: '#555', textAlign: 'center' }}>문서(RDB)</th>
                                                                        <th style={{ padding: '10px 12px', fontWeight: 600, color: '#555', textAlign: 'center' }}>상태</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {(workspaceDetails[db.domainId] || []).length > 0 ? (
                                                                        (workspaceDetails[db.domainId] || []).map(ws => (
                                                                            <tr
                                                                                key={ws.workspaceId}
                                                                                style={{
                                                                                    borderBottom: '1px solid #f0f0f0',
                                                                                    background: ws.isOrphan ? '#fff3f0' : 'white'
                                                                                }}
                                                                            >
                                                                                <td style={{ padding: '10px 12px', color: '#888', fontFamily: 'monospace' }}>{ws.workspaceId}</td>
                                                                                <td style={{ padding: '10px 12px', fontWeight: 500, color: ws.isOrphan ? '#cf1322' : '#333' }}>
                                                                                    {ws.workspaceName}
                                                                                </td>
                                                                                <td style={{ padding: '10px 12px', color: '#666' }}>{ws.createdBy || '-'}</td>
                                                                                <td style={{ padding: '10px 12px', textAlign: 'center', color: '#666' }}>{ws.objectNodeCount.toLocaleString()}</td>
                                                                                <td style={{ padding: '10px 12px', textAlign: 'center', color: '#666' }}>{ws.relationNodeCount.toLocaleString()}</td>
                                                                                <td style={{ padding: '10px 12px', textAlign: 'center', color: '#666' }}>{ws.edgeCount.toLocaleString()}</td>
                                                                                <td style={{ padding: '10px 12px', textAlign: 'center', color: '#666' }}>{ws.arangoDocumentCount}</td>
                                                                                <td style={{ padding: '10px 12px', textAlign: 'center', color: '#666' }}>{ws.rdbDocumentCount}</td>
                                                                                <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                                                                                    {ws.isOrphan ? (
                                                                                        <span style={{
                                                                                            padding: '2px 8px',
                                                                                            borderRadius: '12px',
                                                                                            fontSize: 'var(--admin-font-xs)',
                                                                                            backgroundColor: '#fff1f0',
                                                                                            color: '#cf1322',
                                                                                            fontWeight: 600,
                                                                                            border: '1px solid #ffa39e'
                                                                                        }}>
                                                                                            고아
                                                                                        </span>
                                                                                    ) : (
                                                                                        <span style={{
                                                                                            padding: '2px 8px',
                                                                                            borderRadius: '12px',
                                                                                            fontSize: 'var(--admin-font-xs)',
                                                                                            backgroundColor: '#e8f5e9',
                                                                                            color: '#2e7d32',
                                                                                            fontWeight: 500
                                                                                        }}>
                                                                                            정상
                                                                                        </span>
                                                                                    )}
                                                                                </td>
                                                                            </tr>
                                                                        ))
                                                                    ) : (
                                                                        <tr>
                                                                            <td colSpan="9" style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
                                                                                워크스페이스 데이터가 없습니다.
                                                                            </td>
                                                                        </tr>
                                                                    )}
                                                                </tbody>
                                                            </table>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="10" style={{ padding: '32px', textAlign: 'center', color: '#888' }}>
                                        등록된 도메인이 없습니다.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default AdminArangoManagement;
