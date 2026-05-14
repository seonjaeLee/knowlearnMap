/**
 * 프롬프트 관리(`PromptList`) 툴바 MUI Select와 동일 토큰.
 * admin-common.css 의 input·select 시각과 맞추기 위한 sx 객체.
 */
export const promptToolbarSelectSx = {
    minWidth: 140,
    fontSize: 'var(--admin-font-md)',
    bgcolor: 'var(--admin-bg-panel)',
    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--admin-border)' },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--admin-border-strong)' },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--admin-color-primary)' },
};
