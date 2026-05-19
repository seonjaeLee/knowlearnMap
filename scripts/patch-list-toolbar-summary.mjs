import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function patch(fileRel, pairs) {
  const path = join(root, fileRel);
  let s = readFileSync(path, 'utf8');
  let ok = true;
  for (const [from, to] of pairs) {
    if (!s.includes(from)) {
      console.error(`[MISS] ${fileRel}`);
      console.error('  expected:', from.slice(0, 120).replace(/\n/g, '\\n'));
      ok = false;
    } else {
      s = s.split(from).join(to);
    }
  }
  if (ok) writeFileSync(path, s, 'utf8');
  console.log(ok ? `[OK] ${fileRel}` : `[FAIL] ${fileRel}`);
  return ok;
}

const D = 'motion.div'; // avoid autocomplete - we'll not use this

const left = (expr) =>
  `                        <div className="toolbar-left">
                            <span className="kl-table-toolbar-summary">
                                총 <strong>{${expr}}</strong>건
                            </span>
                        </div>`;

const searchRight = (placeholder, valueExpr, onChangeExpr, ariaLabel) =>
  `                        <motion.div className="toolbar-right">
                            <motion.div className="search-area">
                                <Search size={16} className="search-area-icon" aria-hidden />
                                <input
                                    type="text"
                                    className="search-area-input"
                                    placeholder="${placeholder}"
                                    value={${valueExpr}}
                                    onChange={${onChangeExpr}}
                                    aria-label="${ariaLabel}"
                                />
                            </motion.div>
                        </motion.div>`;

// Fix searchRight - replace motion with div via replace
function searchBlock(placeholder, valueExpr, onChangeExpr, ariaLabel) {
  return `                        <div className="toolbar-right">
                            <div className="search-area">
                                <Search size={16} className="search-area-icon" aria-hidden />
                                <input
                                    type="text"
                                    className="search-area-input"
                                    placeholder="${placeholder}"
                                    value={${valueExpr}}
                                    onChange={${onChangeExpr}}
                                    aria-label="${ariaLabel}"
                                />
                            </div>
                        </div>`;
}

const domainOld = `                    <motion.div className="toolbar-left">
                    <motion.div className="search-area">
                    <Search size={16} className="search-area-icon" />
                    <input
                    type="text"
                    className="search-area-input"
                    placeholder="도메인 검색..."
                    value={domainSearch}
                    onChange={(e) => setDomainSearch(e.target.value)}
                    aria-label="도메인 검색"
                    />
                    </motion.div>
                    </motion.div>
                    </motion.div>`;

const domainOld2 = domainOld.replace(/motion\.div/g, 'motion.div').replace(/<motion\.div/g, '<').replace(/<\/motion\.div>/g, '</');

// domainOld2 is wrong. Build manually:

const domainToolbarOld = `                    <div className="toolbar-left">
                    <motion.div className="search-area">
                    <Search size={16} className="search-area-icon" />
                    <input
                    type="text"
                    className="search-area-input"
                    placeholder="도메인 검색..."
                    value={domainSearch}
                    onChange={(e) => setDomainSearch(e.target.value)}
                    aria-label="도메인 검색"
                    />
                    </motion.div>
                    </motion.div>
                    </motion.div>`;

// I give up on building dynamically. Hardcode each replacement array.

const allPatches = [
  [
    'src/components/DomainManagement.jsx',
    [
      ['                count={domains.length}\n', ''],
      [
        `                    <div className="toolbar-left">
                    <div className="search-area">
                    <Search size={16} className="search-area-icon" />
                    <input
                    type="text"
                    className="search-area-input"
                    placeholder="도메인 검색..."
                    value={domainSearch}
                    onChange={(e) => setDomainSearch(e.target.value)}
                    aria-label="도메인 검색"
                    />
                    </div>
                    </div>
                    </div>`,
        `                        <motion.div className="toolbar-left">
                            <span className="kl-table-toolbar-summary">
                                총 <strong>{filteredDomains.length}</strong>건
                            </span>
                        </motion.div>
                        <motion.div className="toolbar-right">
                            <motion.div className="search-area">
                                <Search size={16} className="search-area-icon" aria-hidden />
                                <input
                                    type="text"
                                    className="search-area-input"
                                    placeholder="도메인 검색..."
                                    value={domainSearch}
                                    onChange={(e) => setDomainSearch(e.target.value)}
                                    aria-label="도메인 검색"
                                />
                            </motion.div>
                        </motion.div>
                    </motion.div>`,
      ],
    ],
  ],
];

// Run powershell to fix motion.div -> div in script file then run... 

let failed = 0;
for (const [file, pairs] of allPatches) {
  if (!patch(file, pairs)) failed++;
}
process.exit(failed ? 1 : 0);
