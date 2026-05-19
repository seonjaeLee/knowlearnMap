import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const files = [
  {
    path: 'src/components/DomainManagement.jsx',
    replacements: [
      ['                count={domains.length}\n', ''],
      [
        `                    <div className="toolbar-left">
                    <div className="search-area">
                    <Search size={16} className="search-area-icon" />
                    <input
                    type="text"
                    className="search-area-input"
                    placeholder="?꾨찓??寃??.."
                    value={domainSearch}
                    onChange={(e) => setDomainSearch(e.target.value)}
                    aria-label="?꾨찓??寃??
                    />
                    </motion.div>
                    </motion.div>
                    </motion.div>`,
        `                        <div className="toolbar-left">
                            <span className="kl-table-toolbar-summary">
                                珥?<strong>{filteredDomains.length}</strong>嫄?
                            </span>
                        </motion.div>
                        <div className="toolbar-right">
                            <div className="search-area">
                                <Search size={16} className="search-area-icon" aria-hidden />
                                <input
                                    type="text"
                                    className="search-area-input"
                                    placeholder="?꾨찓??寃??.."
                                    value={domainSearch}
                                    onChange={(e) => setDomainSearch(e.target.value)}
                                    aria-label="?꾨찓??寃??
                                />
                            </motion.div>
                        </motion.div>
                    </motion.div>`,
      ],
    ],
  },
];

let fail = 0;
for (const { path: rel, replacements } of files) {
  const abs = join(root, rel);
  let s = readFileSync(abs, 'utf8');
  let ok = true;
  for (const [from, to] of replacements) {
    const fixedFrom = from.replace(/motion\.div/g, 'motion.div');
    const fixedTo = to.replace(/motion\.motion/g, '').replace(/<motion\.motion/g, '<').replace(/<\/motion\.motion/g, '</');
    if (!s.includes(fixedFrom)) {
      console.error('MISS', rel, fixedFrom.slice(0, 60));
      ok = false;
    } else {
      s = s.split(fixedFrom).join(fixedTo);
    }
  }
  if (ok) {
    writeFileSync(abs, s, 'utf8');
    console.log('OK', rel);
  } else fail++;
}
process.exit(fail);
