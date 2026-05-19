import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const filePath = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'pages', 'DomainSelection.jsx');
let src = readFileSync(filePath, 'utf8');

const replacements = [
  [/title="[^"]*"/, 'title="도메인 선택"'],
  [/breadcrumbs=\{\[[^\]]*\]\}/, "breadcrumbs={['어드민센터']}"],
  [/description=\{`관리자[^`]*`\}/, 'description={`관리자 로그인 (${user.email})`}'],
  [/>\s*[^<]*도메인 추가[^<]*\n\s*<\/button>/m, '>\n                            도메인 추가\n                        </button>'],
];

// Line-targeted fixes inside return block only
const fixes = [
  ['title="도메인 선택"', 'title="도메인 선택"'],
];

// Direct string replacements for known corruption patterns
const pairs = [
  ['title="?메???택"', 'title="도메인 선택"'],
  ["breadcrumbs={['?드민센??]}", "breadcrumbs={['어드민센터']}"],
  ['description={`관리자 로그??(${user.email})`}', 'description={`관리자 로그인 (${user.email})`}'],
  ['?메??추?', '도메인 추가'],
  ['?<strong>{domains.length}</strong>?', '총 <strong>{domains.length}</strong>건'],
  ['?업???메?을 ?택?주?요.', '작업할 도메인을 선택해주세요.'],
  ['?메??목록??불러?는 ?..', '도메인 목록을 불러오는 중...'],
  ["message: '?록???메?이 ?습?다.'", "message: '등록된 도메인이 없습니다.'"],
];

for (const [from, to] of pairs) {
  if (src.includes(from)) {
    src = src.split(from).join(to);
  }
}

// Fallback regex if mojibake variants differ
if (!src.includes('title="도메인 선택"')) {
  src = src.replace(/title="[^"]*"\s*\n\s*breadcrumbs/, 'title="도메인 선택"\n                    breadcrumbs');
}
if (!src.includes("breadcrumbs={['어드민센터']}")) {
  src = src.replace(/breadcrumbs=\{[^}]+\}/, "breadcrumbs={['어드민센터']}");
}
if (!src.includes('관리자 로그인')) {
  src = src.replace(/description=\{`[^`]+`\}/, 'description={`관리자 로그인 (${user.email})`}');
}
if (!src.includes('kl-table-toolbar-summary')) {
  // noop
}
if (src.includes('kl-table-toolbar-summary') && !src.includes('총 <strong>')) {
  src = src.replace(
    /<span className="kl-table-toolbar-summary">\s*[\s\S]*?<\/span>/,
    '<span className="kl-table-toolbar-summary">\n                            총 <strong>{domains.length}</strong>건\n                        </span>'
  );
}
if (!src.includes('작업할 도메인을 선택해주세요')) {
  src = src.replace(
    /<span className="domain-content-help">[^<]*<\/span>/,
    '<span className="domain-content-help">작업할 도메인을 선택해주세요.</span>'
  );
}
if (!src.includes('도메인 목록을 불러오는 중')) {
  src = src.replace(
    /<span>[^<]*<\/span>\s*<\/div>\s*\) : \(\s*<div className="basic-table-shell/,
    '<span>도메인 목록을 불러오는 중...</span>\n                    </div>\n                ) : (\n                    <motion.div className="basic-table-shell'
  );
  src = src.replace('motion.div className="basic-table-shell', 'div className="basic-table-shell');
}
if (!src.includes("message: '등록된 도메인이 없습니다.'")) {
  src = src.replace(
    /emptyState=\{\{ variant: 'default', message: '[^']*' \}\}/,
    "emptyState={{ variant: 'default', message: '등록된 도메인이 없습니다.' }}"
  );
}

writeFileSync(filePath, src, 'utf8');
console.log('encoding fixes applied');
