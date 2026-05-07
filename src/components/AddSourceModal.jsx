import { useState, useEffect, useRef } from 'react';
import { Button, Stack } from '@mui/material';
import './AddSourceModal.css';
import { API_URL } from '../config/api';
import { useDialog } from '../hooks/useDialog';
import { structuredApi } from '../services/api';
import axios from 'axios';
import DbConnectionModal from './DbConnectionModal';
import BaseModal from './common/modal/BaseModal';

function AddSourceModal({ isOpen, onClose, workspaceId, domainId, onUploadComplete }) {
    const [currentView, setCurrentView] = useState('main'); // main, website, youtube, text, drive, csv
    const [inputValue, setInputValue] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [selectedFile, setSelectedFile] = useState(null);
    const [csvUploading, setCsvUploading] = useState(false);
    const [csvUploadProgress, setCsvUploadProgress] = useState(null);
    const [showDbModal, setShowDbModal] = useState(false);
    const [csvFiles, setCsvFiles] = useState([]); // 선택된 CSV 파일 목록
    const [csvFileFilter, setCsvFileFilter] = useState(''); // 파일명 필터
    const [csvChecked, setCsvChecked] = useState({}); // 체크된 파일 인덱스
    const [csvUploadingIndex, setCsvUploadingIndex] = useState(-1); // 현재 업로드 중 인덱스
    const csvPollRef = useRef(null);
    const { alert } = useDialog();
    const showAlert = (message) => { alert(message); };

    // Demo mode handler
    const handleDemoClick = (e) => {
        e.stopPropagation();
        showAlert('데모에서는 지원하지 않습니다.');
    };

    // CSV 파일 선택 핸들러 (멀티 선택 → 파일 목록 표시)
    const handleCsvFileSelect = (event) => {
        const files = Array.from(event.target.files || []);
        if (files.length === 0) return;

        const csvOnly = files.filter(f => f.name.toLowerCase().endsWith('.csv'));
        if (csvOnly.length === 0) {
            showAlert('CSV 파일만 업로드 가능합니다.');
            event.target.value = '';
            return;
        }
        if (csvOnly.length < files.length) {
            showAlert(`CSV가 아닌 파일 ${files.length - csvOnly.length}개는 제외되었습니다.`);
        }

        if (!workspaceId) {
            showAlert('워크스페이스 정보를 찾을 수 없습니다.');
            return;
        }

        // 파일이 1개면 바로 업로드, 2개 이상이면 선택 UI 표시
        if (csvOnly.length === 1) {
            event.target.value = '';
            uploadSingleCsv(csvOnly[0]);
            return;
        }

        const checked = {};
        csvOnly.forEach((_, i) => { checked[i] = true; });
        setCsvFiles(csvOnly);
        setCsvChecked(checked);
        setCsvFileFilter('');
        setCurrentView('csv-select');
        event.target.value = '';
    };

    // 단일 CSV 업로드 (기존 로직)
    const uploadSingleCsv = async (file) => {
        setCsvUploading(true);
        setCsvUploadProgress(null);

        try {
            const result = await structuredApi.uploadCsv(workspaceId, file);
            console.log('CSV 업로드 시작:', result);

            if (result && result.taskId) {
                const pollProgress = async () => {
                    try {
                        const progress = await structuredApi.getCsvUploadProgress(result.taskId);
                        if (!progress) {
                            csvPollRef.current = setTimeout(pollProgress, 1500);
                            return;
                        }
                        setCsvUploadProgress(progress);

                        if (progress.phase === 'COMPLETED') {
                            setCsvUploading(false);
                            setCsvUploadProgress(null);
                            showAlert(`CSV 업로드 완료! ${progress.totalRows.toLocaleString()}건의 데이터가 등록되었습니다.`);
                            onClose();
                            if (onUploadComplete) onUploadComplete();
                        } else if (progress.phase === 'FAILED') {
                            setCsvUploading(false);
                            setCsvUploadProgress(null);
                            showAlert(progress.message || 'CSV 업로드 실패');
                        } else {
                            csvPollRef.current = setTimeout(pollProgress, 1500);
                        }
                    } catch {
                        csvPollRef.current = setTimeout(pollProgress, 2000);
                    }
                };
                csvPollRef.current = setTimeout(pollProgress, 500);
            } else {
                setCsvUploading(false);
                showAlert(`CSV 업로드 완료! ${result.totalRecords || 0}건의 데이터가 등록되었습니다.`);
                onClose();
                if (onUploadComplete) onUploadComplete();
            }
        } catch (error) {
            console.error('CSV 업로드 오류:', error);
            showAlert(error.message || 'CSV 업로드 중 오류가 발생했습니다.');
            setCsvUploading(false);
            setCsvUploadProgress(null);
        }
    };

    // 멀티 CSV 순차 업로드
    const handleCsvMultiUpload = async () => {
        const selectedFiles = csvFiles.filter((_, i) => csvChecked[i]);
        if (selectedFiles.length === 0) {
            showAlert('업로드할 파일을 선택해주세요.');
            return;
        }

        setCsvUploading(true);
        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];
            const fileIdx = csvFiles.indexOf(file);
            setCsvUploadingIndex(fileIdx);
            setCsvUploadProgress({ phase: 'UPLOADING', fileName: file.name, current: i + 1, total: selectedFiles.length });

            try {
                const result = await structuredApi.uploadCsv(workspaceId, file);

                if (result && result.taskId) {
                    // 비동기 업로드: polling으로 완료 대기
                    await new Promise((resolve) => {
                        const poll = async () => {
                            try {
                                const progress = await structuredApi.getCsvUploadProgress(result.taskId);
                                if (progress?.phase === 'COMPLETED') {
                                    successCount++;
                                    resolve();
                                } else if (progress?.phase === 'FAILED') {
                                    failCount++;
                                    resolve();
                                } else {
                                    setTimeout(poll, 1500);
                                }
                            } catch {
                                setTimeout(poll, 2000);
                            }
                        };
                        setTimeout(poll, 500);
                    });
                } else {
                    successCount++;
                }
            } catch (error) {
                console.error(`CSV 업로드 실패: ${file.name}`, error);
                failCount++;
            }
        }

        setCsvUploading(false);
        setCsvUploadProgress(null);
        setCsvUploadingIndex(-1);
        setCsvFiles([]);
        setCsvChecked({});

        let msg = `CSV 업로드 완료: ${successCount}개 성공`;
        if (failCount > 0) msg += `, ${failCount}개 실패`;
        showAlert(msg);
        onClose();
        if (onUploadComplete) onUploadComplete();
    };

    // File upload handler
    const handleFileUpload = async (event) => {
        const file = event.target.files[0];

        if (!file) return;

        // PDF, PPTX, DOCX 허용
        const allowedExtensions = ['.pdf', '.pptx', '.docx'];
        const fileName = file.name.toLowerCase();
        if (!allowedExtensions.some(ext => fileName.endsWith(ext))) {
            showAlert('PDF, PowerPoint(.pptx), Word(.docx) 파일만 업로드 가능합니다.');
            event.target.value = ''; // Reset input
            return;
        }

        // 파일 크기 제한 (100MB)
        const MAX_FILE_SIZE = 100 * 1024 * 1024;
        if (file.size > MAX_FILE_SIZE) {
            showAlert('파일 크기가 100MB를 초과하여 업로드할 수 없습니다.');
            event.target.value = '';
            return;
        }

        if (!workspaceId) {
            showAlert('워크스페이스 정보를 찾을 수 없습니다.');
            return;
        }

        setUploading(true);
        setUploadProgress(0);
        setSelectedFile(file);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('workspaceId', workspaceId);

            const response = await axios.post(`${API_URL}/api/documents/upload`, formData, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                },
            });

            // Axios throws on non-2xx status, so if we are here, it's success (usually)
            const result = response.data;

            console.log('업로드 성공:', result);

            showAlert('파일이 성공적으로 업로드되었습니다!');

            // 모달 닫기 및 상태 초기화
            event.target.value = ''; // Reset file input
            setSelectedFile(null);
            setUploadProgress(0);
            onClose();

            // Notify parent to refresh list
            if (onUploadComplete) {
                onUploadComplete();
            }

        } catch (error) {
            console.error('업로드 오류:', error);
            const errMsg = error.response?.status === 413
                ? '파일 크기가 100MB를 초과하여 업로드할 수 없습니다.'
                : (error.response?.data?.message || error.message || '파일 업로드 중 오류가 발생했습니다.');
            showAlert(errMsg);
            event.target.value = ''; // Reset input on error
        } finally {
            setUploading(false);
            setSelectedFile(null);
            setUploadProgress(0);
        }
    };

    // Reset view when opening / cleanup polling on close
    useEffect(() => {
        if (isOpen) {
            setCurrentView('main');
            setInputValue('');
            setShowDbModal(false);
            setCsvFiles([]);
            setCsvChecked({});
            setCsvFileFilter('');
            setCsvUploadingIndex(-1);
        } else {
            // cleanup polling when modal closes
            if (csvPollRef.current) {
                clearTimeout(csvPollRef.current);
                csvPollRef.current = null;
            }
        }
        return () => {
            if (csvPollRef.current) {
                clearTimeout(csvPollRef.current);
                csvPollRef.current = null;
            }
        };
    }, [isOpen]);

    // Close on Escape key
    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                if (currentView === 'main') {
                    onClose();
                } else {
                    setCurrentView('main');
                }
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose, currentView]);

    if (!isOpen) return null;

    const handleBack = () => {
        setCurrentView('main');
        setInputValue('');
    };

    const handleInsert = () => {
        // Mock insert functionality
        console.log(`Inserting from ${currentView}: ${inputValue}`);
        onClose();
    };

    const renderMainView = () => (
        <>
            <div className="modal-body main-view">
                <p className="modal-description">
                    소스를 추가하면 KNOWLEARN MAP이 가장 중요한 정보에 따라 응답을 제공합니다.
                </p>

                <div className="source-cards-row">
                    {/* PDF 업로드 카드 */}
                    <div className="source-card">
                        <div className="source-card-icon">
                            <svg width="36" height="36" viewBox="0 0 48 48" fill="#e53935">
                                <path d="M14 4C11.8 4 10 5.8 10 8v32c0 2.2 1.8 4 4 4h20c2.2 0 4-1.8 4-4V16l-12-12H14zm12 14V6l10 12H26z"/>
                            </svg>
                        </div>
                        <p className="source-card-title">문서 업로드</p>
                        <p className="source-card-desc">PDF, PowerPoint, Word 파일을 업로드하여 RAG 소스로 활용</p>
                        <input
                            type="file"
                            id="file-upload"
                            className="file-input"
                            accept=".pdf,.pptx,.docx"
                            onChange={handleFileUpload}
                            disabled={uploading}
                        />
                        <label htmlFor="file-upload" className="source-card-btn" style={{ backgroundColor: '#e53935' }}>
                            {uploading ? `${uploadProgress}%` : 'PDF 선택'}
                        </label>
                        {uploading && (
                            <div className="source-card-progress">
                                <div className="source-card-progress-bar" style={{ width: `${uploadProgress}%` }}></div>
                            </div>
                        )}
                        <span className="source-card-formats">PDF</span>
                    </div>

                    {/* CSV 업로드 카드 */}
                    <div className="source-card">
                        <div className="source-card-icon">
                            <svg width="36" height="36" viewBox="0 0 48 48" fill="#4caf50">
                                <path d="M14 4C11.8 4 10 5.8 10 8v32c0 2.2 1.8 4 4 4h20c2.2 0 4-1.8 4-4V16l-12-12H14zm12 14V6l10 12H26zM16 26h16v2H16v-2zm0 4h16v2H16v-2zm0 4h10v2H16v-2z"/>
                            </svg>
                        </div>
                        <p className="source-card-title">CSV 데이터</p>
                        <p className="source-card-desc">정형 데이터(CSV)로 온톨로지 생성</p>
                        <input
                            type="file"
                            id="csv-upload"
                            className="file-input"
                            accept=".csv"
                            multiple
                            onChange={handleCsvFileSelect}
                            disabled={csvUploading}
                        />
                        <label htmlFor="csv-upload" className="source-card-btn" style={{ backgroundColor: '#4caf50' }}>
                            {csvUploading && csvUploadProgress
                                ? `${csvUploadProgress.totalRows > 0 ? Math.round((csvUploadProgress.processedRows / csvUploadProgress.totalRows) * 100) : 0}%`
                                : csvUploading ? '파싱 중...' : 'CSV 선택'}
                        </label>
                        {csvUploading && csvUploadProgress && csvUploadProgress.totalRows > 0 && (
                            <>
                                <div className="source-card-progress">
                                    <div
                                        className="source-card-progress-bar csv"
                                        style={{ width: `${Math.round((csvUploadProgress.processedRows / csvUploadProgress.totalRows) * 100)}%` }}
                                    />
                                </div>
                                <span className="source-card-progress-text">
                                    저장 중 {csvUploadProgress.processedRows.toLocaleString()} / {csvUploadProgress.totalRows.toLocaleString()}건
                                </span>
                            </>
                        )}
                        {!csvUploading && <span className="source-card-formats">UTF-8, EUC-KR</span>}
                    </div>

                    {/* DB 연결 카드 */}
                    <div className="source-card">
                        <div className="source-card-icon">
                            <svg width="36" height="36" viewBox="0 0 48 48" fill="#1a73e8">
                                <path d="M24 6c-8.8 0-16 3.6-16 8v20c0 4.4 7.2 8 16 8s16-3.6 16-8V14c0-4.4-7.2-8-16-8zm0 4c7.7 0 12 3 12 4s-4.3 4-12 4-12-3-12-4 4.3-4 12-4zM12 34V28c2.8 2 7.6 3.2 12 3.2s9.2-1.2 12-3.2v6c0 1-4.3 4-12 4s-12-3-12-4zm0-10V18c2.8 2 7.6 3.2 12 3.2s9.2-1.2 12-3.2v6c0 1-4.3 4-12 4s-12-3-12-4z"/>
                            </svg>
                        </div>
                        <p className="source-card-title">DB 테이블</p>
                        <p className="source-card-desc">외부 DB 연결하여 테이블 임포트</p>
                        <button
                            className="source-card-btn"
                            style={{ backgroundColor: '#1a73e8' }}
                            onClick={() => setShowDbModal(true)}
                        >
                            DB 연결
                        </button>
                        <span className="source-card-formats">MySQL, PostgreSQL, Oracle, MariaDB</span>
                    </div>
                </div>

                <div className="connection-options">
                    <div className="option-section demo-disabled">
                        <div className="option-header">
                            <svg width="16" height="16" viewBox="0 0 20 20" fill="#9e9e9e">
                                <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm5-6h4c2.76 0 5 2.24 5 5s-2.24 5-5 5h-4v-1.9h4c1.71 0 3.1-1.39 3.1-3.1 0-1.71-1.39-3.1-3.1-3.1h-4V7z" />
                            </svg>
                            <span>웹사이트 / YouTube</span>
                        </div>
                        <button className="option-btn demo-disabled-btn" onClick={handleDemoClick}>웹사이트</button>
                        <button className="option-btn demo-disabled-btn" onClick={handleDemoClick}>YouTube</button>
                    </div>
                    <div className="option-section demo-disabled">
                        <div className="option-header">
                            <svg width="16" height="16" viewBox="0 0 20 20" fill="#9e9e9e">
                                <path d="M14 2H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H7V9h6v2z" />
                            </svg>
                            <span>기타</span>
                        </div>
                        <button className="option-btn demo-disabled-btn" onClick={handleDemoClick}>텍스트 붙여넣기</button>
                        <button className="option-btn demo-disabled-btn" onClick={handleDemoClick}>Google Drive</button>
                    </div>
                </div>
            </div>
        </>
    );

    const renderInputView = (title, placeholder, description, notes) => (
        <>
            <div className="subview-title-row">
                <button className="back-btn" onClick={handleBack}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                    </svg>
                </button>
                <h3 className="subview-title">{title}</h3>
            </div>
            <div className="modal-body sub-view">
                <p className="input-description">{description}</p>
                <div className="input-container">
                    <div className="input-wrapper">
                        {currentView === 'website' && (
                            <div className="input-icon website">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                    <line x1="3" y1="9" x2="21" y2="9" />
                                </svg>
                            </div>
                        )}
                        {currentView === 'youtube' && (
                            <div className="input-icon youtube">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                                </svg>
                            </div>
                        )}
                        <input
                            type="text"
                            placeholder={placeholder}
                            className="text-input"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            autoFocus
                        />
                    </div>
                    {notes && <div className="notes-list">{notes}</div>}
                </div>
                <div className="footer-actions">
                    <button className="insert-btn" disabled={!inputValue.trim()} onClick={handleInsert}>
                        삽입
                    </button>
                </div>
            </div>
        </>
    );

    const renderTextView = () => (
        <>
            <div className="subview-title-row">
                <button className="back-btn" onClick={handleBack}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                    </svg>
                </button>
                <h3 className="subview-title">복사한 텍스트 붙여넣기</h3>
            </div>
            <div className="modal-body sub-view">
                <p className="input-description">
                    KNOWLEARN MAP에 소스로 업로드할 복사한 텍스트를 아래에 붙여넣으세요.
                </p>
                <div className="textarea-container">
                    <textarea
                        className="large-textarea"
                        placeholder="여기에 텍스트를 붙여넣으세요.*"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        autoFocus
                    />
                </div>
                <div className="footer-actions">
                    <button className="insert-btn" disabled={!inputValue.trim()} onClick={handleInsert}>
                        삽입
                    </button>
                </div>
            </div>
        </>
    );

    const renderDriveView = () => (
        <>
            <div className="drive-header-top">
                <div className="drive-search-bar">
                    <div className="drive-logo">
                        <svg width="24" height="24" viewBox="0 0 87.3 78" className="drive-icon-svg">
                            <path d="M6.6 66.85l16.1-27.9 16.1-27.9H71L54.9 38.95 38.8 66.85H6.6z" fill="#0066DA" />
                            <path d="M43.65 25l-16.1 27.9-16.1 27.9h64.3l-16.1-27.9L43.65 25z" fill="#00AC47" />
                            <path d="M79.75 66.85l-16.1-27.9-16.1-27.9H15.1l16.1 27.9 16.1 27.9h32.45z" fill="#EA4335" />
                            <path d="M43.65 25L27.55 52.9 11.45 80.8h64.3l-16.1-27.9-16.1-27.9z" fill="#FFBA00" />
                        </svg>
                        <span>항목 선택</span>
                    </div>
                    <input type="text" placeholder="Drive에서 검색하거나 URL 붙여넣기" className="drive-search-input" />
                    <button className="drive-close-btn" onClick={onClose}>×</button>
                </div>
                <div className="drive-tabs">
                    <button className="drive-tab active">최근</button>
                    <button className="drive-tab">내 드라이브</button>
                    <button className="drive-tab">공유 문서함</button>
                    <button className="drive-tab">중요 문서함</button>
                    <button className="drive-tab">컴퓨터</button>
                </div>
            </div>

            <div className="drive-body">
                <div className="drive-list-header">
                    <span>최근 문서함</span>
                    <button className="drive-view-toggle">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M4 11h5V5H4v6zm0 7h5v-6H4v6zm6 0h5v-6h-5v6zm6 0h5v-6h-5v6zm-6-7h5V5h-5v6zm6-6v6h5V5h-5z" /></svg>
                    </button>
                </div>
                <div className="drive-grid">
                    <div className="drive-item">
                        <div className="drive-preview sheet"></div>
                        <div className="drive-name">
                            <span className="file-icon sheet"></span>
                            11월 23-24일 부의금 ...
                        </div>
                    </div>
                    <div className="drive-item">
                        <div className="drive-preview doc"></div>
                        <div className="drive-name">
                            <span className="file-icon doc"></span>
                            JOY_정리노트
                        </div>
                    </div>
                </div>
            </div>

            <div className="drive-footer">
                <button className="drive-select-btn" disabled>선택</button>
            </div>
        </>
    );

    const filteredCsvFiles = csvFiles.map((file, idx) => ({ file, idx }))
        .filter(({ file }) => !csvFileFilter || file.name.toLowerCase().includes(csvFileFilter.toLowerCase()));

    const allFilteredChecked = filteredCsvFiles.length > 0 && filteredCsvFiles.every(({ idx }) => csvChecked[idx]);

    const renderCsvSelectView = () => (
        <>
            <div className="subview-title-row">
                <button className="back-btn" onClick={handleBack}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                    </svg>
                </button>
                <h3 className="subview-title">CSV 파일 선택</h3>
            </div>
            <div className="modal-body sub-view">
                <p className="input-description">
                    업로드할 CSV 파일을 선택하세요. ({csvFiles.length}개 파일)
                </p>
                <div style={{ marginBottom: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                        type="text"
                        placeholder="파일명 검색..."
                        value={csvFileFilter}
                        onChange={e => setCsvFileFilter(e.target.value)}
                        style={{
                            flex: 1, padding: '8px 12px', borderRadius: '8px',
                            border: '1px solid #ddd', fontSize: '13px'
                        }}
                        autoFocus
                    />
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#666', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                        <input
                            type="checkbox"
                            checked={allFilteredChecked}
                            onChange={() => {
                                const newChecked = { ...csvChecked };
                                filteredCsvFiles.forEach(({ idx }) => { newChecked[idx] = !allFilteredChecked; });
                                setCsvChecked(newChecked);
                            }}
                        />
                        전체 선택
                    </label>
                </div>
                <div style={{
                    maxHeight: '300px', overflowY: 'auto', border: '1px solid #e0e0e0',
                    borderRadius: '8px', marginBottom: '12px'
                }}>
                    {filteredCsvFiles.length === 0 ? (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#999', fontSize: '13px' }}>
                            일치하는 파일이 없습니다.
                        </div>
                    ) : (
                        filteredCsvFiles.map(({ file, idx }) => (
                            <label
                                key={idx}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '10px',
                                    padding: '10px 14px', borderBottom: '1px solid #f0f0f0',
                                    cursor: csvUploading ? 'default' : 'pointer',
                                    backgroundColor: csvUploadingIndex === idx ? '#e8f5e9' : 'transparent',
                                    opacity: csvUploading && csvUploadingIndex !== idx ? 0.6 : 1
                                }}
                            >
                                <input
                                    type="checkbox"
                                    checked={!!csvChecked[idx]}
                                    onChange={() => {
                                        if (csvUploading) return;
                                        setCsvChecked(prev => ({ ...prev, [idx]: !prev[idx] }));
                                    }}
                                    disabled={csvUploading}
                                    style={{ width: '15px', height: '15px' }}
                                />
                                <svg width="20" height="20" viewBox="0 0 48 48" fill="#4caf50" style={{ flexShrink: 0 }}>
                                    <path d="M14 4C11.8 4 10 5.8 10 8v32c0 2.2 1.8 4 4 4h20c2.2 0 4-1.8 4-4V16l-12-12H14zm12 14V6l10 12H26zM16 26h16v2H16v-2zm0 4h16v2H16v-2zm0 4h10v2H16v-2z"/>
                                </svg>
                                <span style={{ fontSize: '13px', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {file.name}
                                </span>
                                <span style={{ fontSize: '11px', color: '#999', whiteSpace: 'nowrap' }}>
                                    {(file.size / 1024).toFixed(0)} KB
                                </span>
                                {csvUploadingIndex === idx && (
                                    <span style={{ fontSize: '11px', color: '#4caf50', fontWeight: '500' }}>업로드 중...</span>
                                )}
                            </label>
                        ))
                    )}
                </div>
                {csvUploading && csvUploadProgress && (
                    <div style={{ marginBottom: '12px', fontSize: '12px', color: '#666', textAlign: 'center' }}>
                        {csvUploadProgress.current} / {csvUploadProgress.total} 파일 처리 중...
                    </div>
                )}
                <div className="footer-actions">
                    <span style={{ fontSize: '13px', color: '#666' }}>
                        {Object.values(csvChecked).filter(Boolean).length}개 선택
                    </span>
                    <button
                        className="insert-btn"
                        onClick={handleCsvMultiUpload}
                        disabled={csvUploading || Object.values(csvChecked).filter(Boolean).length === 0}
                        style={{ backgroundColor: '#4caf50' }}
                    >
                        {csvUploading ? '업로드 중...' : '업로드'}
                    </button>
                </div>
            </div>
        </>
    );

    return (
        <>
            <BaseModal
                open={isOpen}
                title="소스 추가"
                onClose={() => {
                    if (showDbModal) return;
                    if (currentView === 'main') {
                        onClose();
                    } else {
                        handleBack();
                    }
                }}
                maxWidth="md"
                disableEscapeKeyDown
                contentClassName="add-source-modal-content"
                actions={currentView === 'main' ? (
                    <Stack direction="row" spacing={1}>
                        <Button variant="outlined" onClick={onClose}>취소</Button>
                        <Button variant="contained" onClick={onClose}>저장</Button>
                    </Stack>
                ) : null}
            >
                <div className={`modal-container ${currentView}`}>
                    {currentView === 'main' && renderMainView()}
                    {currentView === 'website' && renderInputView(
                        '웹사이트 URL',
                        'URL 붙여넣기*',
                        'KNOWLEARN MAP에 소스로 업로드할 웹 URL을 아래에 붙여넣으세요.',
                        <div className="notes">
                            <h4>참고</h4>
                            <ul>
                                <li>여러 URL을 추가하려면 공백이나 줄 바꿈으로 구분하세요.</li>
                                <li>웹사이트에 표시되는 텍스트만 가져옵니다.</li>
                                <li>유료 기사는 지원되지 않습니다.</li>
                            </ul>
                        </div>
                    )}
                    {currentView === 'youtube' && renderInputView(
                        'YouTube URL',
                        'YouTube URL 붙여넣기*',
                        'KNOWLEARN MAP에 소스로 업로드할 YouTube URL을 아래에 붙여넣으세요.',
                        <div className="notes">
                            <h4>참고</h4>
                            <ul>
                                <li>현재 텍스트 스크립트만 가져옵니다.</li>
                                <li>공개 YouTube 동영상만 지원됩니다.</li>
                                <li>최근에 업로드된 동영상은 가져올 수 없습니다.</li>
                                <li>업로드에 실패하는 경우 자세히 알아보기 를 통해 일반적인 이유를 확인하세요.</li>
                            </ul>
                        </div>
                    )}
                    {currentView === 'text' && renderTextView()}
                    {currentView === 'csv-select' && renderCsvSelectView()}
                    {currentView === 'drive' && renderDriveView()}
                </div>
            </BaseModal>

            <DbConnectionModal
                isOpen={showDbModal}
                onClose={() => setShowDbModal(false)}
                workspaceId={workspaceId}
                domainId={domainId}
                onImportComplete={() => {
                    setShowDbModal(false);
                    onClose();
                    if (onUploadComplete) onUploadComplete();
                }}
            />
        </>
    );
}

export default AddSourceModal;
