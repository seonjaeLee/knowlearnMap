import {
  FlaskConical,
  FileText,
  Megaphone,
  Wallet,
  Stethoscope,
  GraduationCap,
  Code2,
  ShoppingCart,
  Factory,
  Plane,
  Building2,
  Palette,
  Newspaper,
  Files,
} from 'lucide-react';

/**
 * 워크스페이스 이름에 포함된 키워드로 그리드 카드 아이콘을 자동 매칭합니다.
 * 매칭되는 카테고리가 없으면 기본 아이콘(Files)을 사용합니다.
 * 새 카테고리 추가 방법: react/docs/workspace-icon-keywords.md 참고.
 */
export const WORKSPACE_ICON_CATEGORIES = [
  { icon: FlaskConical, keywords: ['화장품', '뷰티', 'cosmetic', 'beauty'] },
  { icon: FileText, keywords: ['계약', '법무', 'legal', 'contract'] },
  { icon: Megaphone, keywords: ['마케팅', '광고', '홍보', 'marketing'] },
  { icon: Wallet, keywords: ['재무', '회계', '예산', 'finance'] },
  { icon: Stethoscope, keywords: ['의료', '병원', '헬스', 'medical', 'health'] },
  { icon: GraduationCap, keywords: ['교육', '강의', '학습', 'education', 'course'] },
  { icon: Code2, keywords: ['개발', '코드', 'development', 'engineering', 'api'] },
  { icon: ShoppingCart, keywords: ['쇼핑', '커머스', '판매', 'ecommerce', 'shopping'] },
  { icon: Factory, keywords: ['제조', '공장', '생산', 'manufacturing', 'factory'] },
  { icon: Plane, keywords: ['여행', '출장', 'travel', 'trip'] },
  { icon: Building2, keywords: ['건축', '부동산', '시설', 'building', 'real estate'] },
  { icon: Palette, keywords: ['디자인', '브랜드', 'design', 'ui', 'ux'] },
  { icon: Newspaper, keywords: ['뉴스', '언론', 'news', 'media'] },
];

export const WORKSPACE_ICON_DEFAULT = Files;

/** 워크스페이스 이름과 키워드를 대소문자 무관 부분일치로 비교해 아이콘 컴포넌트를 반환합니다. */
export function getWorkspaceIcon(name) {
  const lower = (name || '').toLowerCase();
  const matched = WORKSPACE_ICON_CATEGORIES.find(({ keywords }) =>
    keywords.some((keyword) => lower.includes(keyword.toLowerCase())),
  );
  return matched ? matched.icon : WORKSPACE_ICON_DEFAULT;
}
