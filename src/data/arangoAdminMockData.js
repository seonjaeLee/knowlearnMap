/**
 * 어드민 ArangoDB 관리(`/admin/arango`) UI용 로컬 더미.
 * `VITE_ENABLE_ARANGO_MOCK=true` 또는 API 실패 시 사용.
 */

/** 도메인별 Arango 요약 (백엔드 스키마와 동일 필드명) */
export const mockArangoDatabases = [
    {
        domainId: 5101,
        domainName: '데모 도메인 A',
        arangoDbName: 'demo_domain_a',
        objectNodeCount: 12840,
        relationNodeCount: 3200,
        edgeCount: 9100,
        rdbWorkspaceCount: 12,
        arangoWorkspaceCount: 11,
        orphanWorkspaceCount: 1,
        dbExists: true,
    },
    {
        domainId: 5102,
        domainName: '데모 도메인 B',
        arangoDbName: 'demo_domain_b',
        objectNodeCount: 420,
        relationNodeCount: 88,
        edgeCount: 210,
        rdbWorkspaceCount: 3,
        arangoWorkspaceCount: 3,
        orphanWorkspaceCount: 0,
        dbExists: true,
    },
    {
        domainId: 5103,
        domainName: '미연결 도메인',
        arangoDbName: 'not_created_yet',
        objectNodeCount: 0,
        relationNodeCount: 0,
        edgeCount: 0,
        rdbWorkspaceCount: 2,
        arangoWorkspaceCount: 0,
        orphanWorkspaceCount: 2,
        dbExists: false,
    },
];

/** domainId → 워크스페이스 상세 행 */
export const mockArangoWorkspacesByDomainId = {
    5101: [
        {
            workspaceId: 90001,
            workspaceName: '제품 지식 그래프',
            createdBy: 'kim@demo.io',
            objectNodeCount: 8200,
            relationNodeCount: 2100,
            edgeCount: 5400,
            arangoDocumentCount: 12000,
            rdbDocumentCount: 11800,
            isOrphan: false,
        },
        {
            workspaceId: 90002,
            workspaceName: '고객 VOC 분석',
            createdBy: 'lee@demo.io',
            objectNodeCount: 4640,
            relationNodeCount: 1100,
            edgeCount: 3700,
            arangoDocumentCount: 9000,
            rdbDocumentCount: 9000,
            isOrphan: false,
        },
        {
            workspaceId: 90003,
            workspaceName: 'RDB만 존재 (고아)',
            createdBy: 'orphan@demo.io',
            objectNodeCount: 0,
            relationNodeCount: 0,
            edgeCount: 0,
            arangoDocumentCount: 0,
            rdbDocumentCount: 4,
            isOrphan: true,
        },
    ],
    5102: [
        {
            workspaceId: 91001,
            workspaceName: '내부 위키',
            createdBy: 'admin@demo.io',
            objectNodeCount: 420,
            relationNodeCount: 88,
            edgeCount: 210,
            arangoDocumentCount: 600,
            rdbDocumentCount: 600,
            isOrphan: false,
        },
        {
            workspaceId: 91002,
            workspaceName: '스키마 실험실',
            createdBy: 'dev@demo.io',
            objectNodeCount: 0,
            relationNodeCount: 0,
            edgeCount: 0,
            arangoDocumentCount: 0,
            rdbDocumentCount: 0,
            isOrphan: false,
        },
    ],
    5103: [],
};
