/**
 * 회원 등급(Grade) 공통 정의 및 권한별 부여 가능 등급 계산.
 *
 * 등급 순서(높음 → 낮음): SPECIAL > MAX > PRO > FREE
 * 규칙: 로그인 사용자의 권한이 ADMIN이 아니면, 본인 등급보다 높은 등급은 부여할 수 없다.
 */

/** 셀렉트에 노출하는 등급 옵션(낮음 → 높음 순서로 정의) */
export const GRADE_OPTIONS = [
    { value: 'FREE', label: 'FREE' },
    { value: 'PRO', label: 'PRO' },
    { value: 'MAX', label: 'MAX' },
    { value: 'SPECIAL', label: 'SPECIAL (무제한)' },
];

/** 등급 우선순위(클수록 상위). ADMIN 등급은 최상위로 취급. */
const GRADE_RANK = {
    FREE: 0,
    PRO: 1,
    MAX: 2,
    SPECIAL: 3,
    ADMIN: 4,
};

export function gradeRank(grade) {
    // 알 수 없는 값은 최상위로 취급 → 과도하게 제한해 UI가 깨지는 것을 방지
    return GRADE_RANK[grade] ?? GRADE_RANK.SPECIAL;
}

/**
 * 로그인 사용자가 부여할 수 있는 등급 옵션 목록.
 * - ADMIN(role): 전체 등급
 * - 그 외(SYSOP 등): 본인 등급 이하만
 *
 * @param {string} viewerRole  로그인 사용자 권한 (ADMIN/SYSOP/...)
 * @param {string} viewerGrade 로그인 사용자 등급 (FREE/PRO/MAX/SPECIAL/ADMIN)
 * @returns {{value:string,label:string}[]}
 */
export function allowedGradeOptions(viewerRole, viewerGrade) {
    if (viewerRole === 'ADMIN') return GRADE_OPTIONS;
    const max = gradeRank(viewerGrade);
    return GRADE_OPTIONS.filter((opt) => gradeRank(opt.value) <= max);
}

/**
 * 수정 모달용: 부여 가능한 옵션 + (대상의 현재 등급이 그보다 높으면) 현재 등급을 disabled로 포함.
 * → 셀렉트가 현재 값을 정상 표시하면서, 본인 등급보다 높은 값은 새로 선택하지 못하게 한다.
 *
 * @returns {{value:string,label:string,disabled?:boolean}[]}
 */
export function allowedGradeOptionsForEdit(viewerRole, viewerGrade, currentGrade) {
    const opts = allowedGradeOptions(viewerRole, viewerGrade);
    if (currentGrade && !opts.some((o) => o.value === currentGrade)) {
        const base = GRADE_OPTIONS.find((o) => o.value === currentGrade);
        return [
            { value: currentGrade, label: `${base ? base.label : currentGrade} (현재)`, disabled: true },
            ...opts,
        ];
    }
    return opts;
}
