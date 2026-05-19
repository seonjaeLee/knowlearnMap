import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const p = join(dirname(fileURLToPath(import.meta.url)), '..', 'src/components/DomainManagement.jsx');
let s = readFileSync(p, 'utf8');
const nl = s.includes('\r\n') ? '\r\n' : '\n';

const fromOkFixed = `                    <div className="toolbar-left">${nl}                    <div className="search-area">`;

const toClean =
  `                        <div className="toolbar-left">${nl}` +
  `                            <span className="kl-table-toolbar-summary">${nl}` +
  `                                \ucd1d <strong>{filteredDomains.length}</strong>\uac74${nl}` +
  `                            </span>${nl}` +
  `                        </div>${nl}` +
  `                        <div className="toolbar-right">${nl}` +
  `                            <div className="search-area">`;

if (!s.includes(fromOkFixed)) {
  console.error('toolbar block not found');
  process.exit(1);
}
s = s.replace(fromOkFixed, toClean);

const closeFrom =
  `                    aria-label="\ub3c4\uba54\uc778 \uac80\uc0c9"${nl}` +
  `                    />${nl}` +
  `                    </div>${nl}` +
  `                    </div>${nl}` +
  `                    </div>`;

const closeFromFixed = closeFrom;

const closeTo =
  `                    aria-label="\ub3c4\uba54\uc778 \uac80\uc0c9"${nl}` +
  `                                />${nl}` +
  `                            </div>${nl}` +
  `                        </div>${nl}` +
  `                    </div>`;

if (!s.includes(closeFromFixed)) {
  console.error('close block not found');
  process.exit(1);
}
s = s.replace(closeFromFixed, closeTo);

writeFileSync(p, s, 'utf8');
console.log('DomainManagement toolbar patched');
