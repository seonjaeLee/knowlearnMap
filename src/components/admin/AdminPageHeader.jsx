import React from 'react';
import PageHeader from '../common/PageHeader';

/**
 * 어드민 센터 공통 페이지 헤더.
 *
 * Props:
 * - icon:     lucide 아이콘 컴포넌트 (예: Users, Settings). 생략 가능.
 * - title:    필수. 페이지 제목.
 * - count:    숫자 카운트 배지 (예: 등록 사용자 수). 생략 가능.
 * - subtitle: 보조 설명문. 생략 가능.
 * - actions:  우측 액션 버튼 슬롯 (ReactNode).
 *
 * 스타일은 admin-common.css 의 .admin-page-header-* 클래스를 사용합니다.
 */
function AdminPageHeader({ icon: _icon, title, count, subtitle, actions, showDescription = false }) {
    const headerTitle = typeof count === 'number'
        ? `${title} (${count.toLocaleString()})`
        : title;

    return (
        <PageHeader
            title={headerTitle}
            breadcrumbs={['어드민센터']}
            description={showDescription ? subtitle : ''}
            actions={actions}
        />
    );
}

export default AdminPageHeader;
