import React from 'react';

/**
 * 재사용 가능한 빈 상태 컴포넌트
 * @param {React.ReactNode} icon - 아이콘 (lucide-react 등)
 * @param {string} title - 메인 메시지
 * @param {string} description - 보조 설명
 * @param {React.ReactNode} action - CTA 버튼/링크
 * @param {string} size - 'small' | 'medium' | 'large'
 */
function EmptyState({ icon, title, description, action, size = 'medium' }) {
    const sizes = {
        small: { padding: '20px', iconSize: 24, titleSize: '13px', descSize: '12px' },
        medium: { padding: '40px 20px', iconSize: 36, titleSize: '15px', descSize: '13px' },
        large: { padding: '60px 20px', iconSize: 48, titleSize: '17px', descSize: '14px' },
    };
    const s = sizes[size] || sizes.medium;

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: s.padding,
            textAlign: 'center',
            color: '#888',
        }}>
            {icon && (
                <div style={{ marginBottom: '12px', color: '#bbb' }}>
                    {React.cloneElement(icon, { size: s.iconSize })}
                </div>
            )}
            {title && (
                <div style={{ fontSize: s.titleSize, fontWeight: '500', color: '#666', marginBottom: '6px' }}>
                    {title}
                </div>
            )}
            {description && (
                <div style={{ fontSize: s.descSize, color: '#999', lineHeight: '1.5', maxWidth: '320px' }}>
                    {description}
                </div>
            )}
            {action && (
                <div style={{ marginTop: '16px' }}>
                    {action}
                </div>
            )}
        </div>
    );
}

export default EmptyState;
