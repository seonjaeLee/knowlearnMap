import { API_BASE_URL } from '../config/api';

const IMAGE_PATTERN = /\[IMAGE:(\/api\/images\/[^\]]+)\]/g;
const TABLE_PATTERN = /\[표\]\n((?:\|.*\|\n)+)/g;
const CAPTION_PATTERN = /\[이미지: ([^\]]+)\]/g;

function ContentRenderer({ content, contentType, tableData, imageCaption }) {
    if (!content) return null;

    const parts = [];
    let lastIndex = 0;

    // 통합 패턴: IMAGE, TABLE, CAPTION 순서
    const combinedPattern = /\[IMAGE:(\/api\/images\/[^\]]+)\]|\[표\]\n((?:\|.*\|\n)+)|\[이미지: ([^\]]+)\]/g;
    let match;

    while ((match = combinedPattern.exec(content)) !== null) {
        // Add text before this match
        if (match.index > lastIndex) {
            const textBefore = content.substring(lastIndex, match.index);
            parts.push(
                <span key={`text-${lastIndex}`} style={{ whiteSpace: 'pre-wrap' }}>
                    {textBefore}
                </span>
            );
        }

        if (match[1]) {
            // IMAGE match
            const imageUrl = match[1];
            const fullUrl = imageUrl.startsWith('/api/')
                ? `${API_BASE_URL.replace('/api', '')}${imageUrl}`
                : imageUrl;

            parts.push(
                <a
                    key={`img-${match.index}`}
                    href={fullUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'block', margin: '8px 0' }}
                >
                    <img
                        src={fullUrl}
                        alt="첨부 이미지"
                        style={{
                            maxWidth: '100%',
                            maxHeight: '400px',
                            borderRadius: '4px',
                            border: '1px solid #e0e0e0',
                            cursor: 'pointer',
                        }}
                        onError={(e) => {
                            e.target.style.display = 'none';
                        }}
                    />
                </a>
            );
        } else if (match[2]) {
            // TABLE match (Markdown)
            const tableMarkdown = match[2];
            parts.push(
                <div key={`table-${match.index}`} style={{ margin: '8px 0', overflowX: 'auto' }}>
                    {renderMarkdownTable(tableMarkdown)}
                </div>
            );
        } else if (match[3]) {
            // Image caption match
            parts.push(
                <div key={`caption-${match.index}`} style={{
                    margin: '8px 0',
                    padding: '10px 14px',
                    background: '#f3e8ff',
                    borderRadius: '6px',
                    borderLeft: '3px solid #7c4dff',
                    fontSize: '13px',
                    color: '#4a148c',
                    lineHeight: '1.5'
                }}>
                    <span style={{ fontWeight: '600', marginRight: '6px' }}>📷 이미지 설명:</span>
                    {match[3]}
                </div>
            );
        }

        lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < content.length) {
        parts.push(
            <span key={`text-${lastIndex}`} style={{ whiteSpace: 'pre-wrap' }}>
                {content.substring(lastIndex)}
            </span>
        );
    }

    // If no patterns found, just render text
    if (parts.length === 0) {
        return <span style={{ whiteSpace: 'pre-wrap' }}>{content}</span>;
    }

    return <div>{parts}</div>;
}

/**
 * Markdown 테이블을 HTML <table>로 렌더링
 */
function renderMarkdownTable(markdown) {
    const lines = markdown.trim().split('\n').filter(l => l.trim());
    if (lines.length < 2) return <pre>{markdown}</pre>;

    const parseRow = (line) =>
        line.split('|').map(cell => cell.trim()).filter(cell => cell.length > 0);

    const headers = parseRow(lines[0]);
    // lines[1] is the separator (---)
    const dataRows = lines.slice(2).map(parseRow);

    return (
        <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '13px',
            border: '1px solid #e0e0e0',
            borderRadius: '6px',
            overflow: 'hidden'
        }}>
            <thead>
                <tr style={{ background: '#f5f5f5' }}>
                    {headers.map((h, i) => (
                        <th key={i} style={{
                            padding: '8px 12px',
                            borderBottom: '2px solid #d0d0d0',
                            textAlign: 'left',
                            fontWeight: '600',
                            fontSize: '12px',
                            color: '#333'
                        }}>
                            {h}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {dataRows.map((row, ri) => (
                    <tr key={ri} style={{ background: ri % 2 === 0 ? '#fff' : '#fafafa' }}>
                        {row.map((cell, ci) => (
                            <td key={ci} style={{
                                padding: '6px 12px',
                                borderBottom: '1px solid #eee',
                                fontSize: '12px',
                                color: '#555'
                            }}>
                                {cell}
                            </td>
                        ))}
                        {/* 부족한 셀 채우기 */}
                        {row.length < headers.length && Array(headers.length - row.length).fill(null).map((_, ci) => (
                            <td key={`empty-${ci}`} style={{
                                padding: '6px 12px',
                                borderBottom: '1px solid #eee'
                            }} />
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

export default ContentRenderer;
