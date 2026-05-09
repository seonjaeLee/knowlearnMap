import PropTypes from 'prop-types';
import { FormControl, MenuItem, Select } from '@mui/material';
import styles from './KmModalSelect.module.scss';

function normalizeRows(optionItems, options) {
    if (optionItems != null && Array.isArray(optionItems)) {
        return optionItems.map((item, index) => ({
            key: `${String(item.value ?? '')}-${index}`,
            value: String(item.value ?? ''),
            label: item.label,
            disabled: Boolean(item.disabled),
        }));
    }
    return (options || []).map((code, index) => ({
        key: `${String(code)}-${index}`,
        value: String(code),
        label: code,
        disabled: false,
    }));
}

/**
 * 네이티브 `<select>` 대체 — OS별 목록 UI 없이 동일한 디자인(참고: modal-form-spec).
 * 부모에 `km-modal-form`이 있어야 공통 토큰 스타일이 맞습니다.
 *
 * - `options`: 문자열 배열 — 값·표시가 동일할 때
 * - `optionItems`: `{ value, label, disabled? }[]` — 라벨이 다를 때
 */
function KmModalSelect({
    id,
    value = '',
    onChange,
    options = [],
    optionItems,
    placeholder = '-- 기본값 --',
    disabled = false,
    className = '',
    warn = false,
    includeNoneOption = false,
    includeEmptyOption = true,
}) {
    const rows = normalizeRows(optionItems, options);
    const safeValue = value === undefined || value === null ? '' : String(value);

    return (
        <FormControl
            id={id}
            fullWidth
            disabled={disabled}
            size="small"
            className={`km-modal-select ${styles.root} ${warn ? styles.warn : ''} ${className}`.trim()}
        >
            <Select
                variant="outlined"
                value={safeValue}
                displayEmpty={includeEmptyOption}
                onChange={(e) => onChange(e)}
                className={styles.selectInput}
                inputProps={id ? { id } : undefined}
                MenuProps={{
                    disablePortal: false,
                    PaperProps: {
                        className: 'km-modal-select-menu-paper',
                    },
                    anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
                    transformOrigin: { vertical: 'top', horizontal: 'left' },
                    marginThreshold: 8,
                }}
            >
                {includeEmptyOption ? (
                    <MenuItem value="">
                        <em className={styles.placeholderEm}>{placeholder}</em>
                    </MenuItem>
                ) : null}
                {includeNoneOption ? (
                    <MenuItem value="NONE">NONE</MenuItem>
                ) : null}
                {rows.map((row) => (
                    <MenuItem key={row.key} value={row.value} disabled={row.disabled}>
                        {row.label}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}

KmModalSelect.propTypes = {
    id: PropTypes.string,
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    options: PropTypes.arrayOf(PropTypes.string),
    optionItems: PropTypes.arrayOf(
        PropTypes.shape({
            value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            label: PropTypes.node.isRequired,
            disabled: PropTypes.bool,
        }),
    ),
    placeholder: PropTypes.string,
    disabled: PropTypes.bool,
    className: PropTypes.string,
    warn: PropTypes.bool,
    includeNoneOption: PropTypes.bool,
    includeEmptyOption: PropTypes.bool,
};

export default KmModalSelect;
