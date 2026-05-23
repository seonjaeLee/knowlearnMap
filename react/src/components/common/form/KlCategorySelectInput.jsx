import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
    KL_CATEGORY_DIRECT_INPUT_LABEL,
    KL_CATEGORY_DIRECT_INPUT_VALUE,
} from './klCategorySelectConstants';
import styles from './KlCategorySelectInput.module.scss';

function resolveInitialState(categories, initialCategory) {
    const list = Array.isArray(categories) ? categories : [];
    const saved = (initialCategory ?? '').trim();

    if (!saved) {
        return { selectValue: '', directText: '' };
    }
    if (list.includes(saved)) {
        return { selectValue: saved, directText: '' };
    }
    return { selectValue: KL_CATEGORY_DIRECT_INPUT_VALUE, directText: saved };
}

/**
 * 카테고리 select + (직접입력 선택 시) text input
 * - 기본: select만 전체 너비
 * - 「직접입력」 선택 시: select + input
 * - 저장·API 연동은 부모 onChange에서 처리 (껍데기 UI)
 */
function KlCategorySelectInput({
    categories = [],
    initialCategory = '',
    selectId,
    inputId,
    emptyOptionLabel = '카테고리 선택',
    directInputPlaceholder = '새 카테고리명 입력',
    directInputMaxLength = 50,
    className = '',
    onChange,
}) {
    const [selectValue, setSelectValue] = useState('');
    const [directText, setDirectText] = useState('');

    useEffect(() => {
        const next = resolveInitialState(categories, initialCategory);
        setSelectValue(next.selectValue);
        setDirectText(next.directText);
        if (next.selectValue === KL_CATEGORY_DIRECT_INPUT_VALUE) {
            onChange?.({
                mode: 'direct',
                category: '',
                directText: next.directText,
                isDirectInput: true,
            });
        } else {
            onChange?.({
                mode: 'list',
                category: next.selectValue,
                directText: '',
                isDirectInput: false,
            });
        }
    }, [categories, initialCategory]);

    const isDirectInput = selectValue === KL_CATEGORY_DIRECT_INPUT_VALUE;

    const emitChange = (mode, listValue, nextDirectText) => {
        onChange?.({
            mode,
            category: mode === 'list' ? listValue : '',
            directText: mode === 'direct' ? nextDirectText : '',
            isDirectInput: mode === 'direct',
        });
    };

    const handleSelectChange = (e) => {
        const v = e.target.value;
        setSelectValue(v);
        if (v === KL_CATEGORY_DIRECT_INPUT_VALUE) {
            emitChange('direct', '', directText);
            return;
        }
        setDirectText('');
        emitChange('list', v, '');
    };

    const handleDirectInputChange = (e) => {
        const v = e.target.value;
        setDirectText(v);
        emitChange('direct', '', v);
    };

    const wrapClass = [
        styles.wrap,
        isDirectInput ? styles['wrap--withInput'] : '',
        className,
    ].filter(Boolean).join(' ');

    return (
        <div className={wrapClass}>
            <div className={styles.selectWrap}>
                <select
                    id={selectId}
                    value={selectValue}
                    onChange={handleSelectChange}
                    aria-label="카테고리"
                >
                    <option value="">{emptyOptionLabel}</option>
                    {categories.map((cat) => (
                        <option key={cat} value={cat}>
                            {cat}
                        </option>
                    ))}
                    <option value={KL_CATEGORY_DIRECT_INPUT_VALUE}>
                        {KL_CATEGORY_DIRECT_INPUT_LABEL}
                    </option>
                </select>
            </div>
            {isDirectInput ? (
                <div className={styles.inputWrap}>
                    <input
                        id={inputId}
                        type="text"
                        value={directText}
                        onChange={handleDirectInputChange}
                        placeholder={directInputPlaceholder}
                        maxLength={directInputMaxLength}
                        aria-label="직접 입력 카테고리명"
                    />
                </div>
            ) : null}
        </div>
    );
}

KlCategorySelectInput.propTypes = {
    categories: PropTypes.arrayOf(PropTypes.string),
    initialCategory: PropTypes.string,
    selectId: PropTypes.string,
    inputId: PropTypes.string,
    emptyOptionLabel: PropTypes.string,
    directInputPlaceholder: PropTypes.string,
    directInputMaxLength: PropTypes.number,
    className: PropTypes.string,
    onChange: PropTypes.func,
};

export default KlCategorySelectInput;
