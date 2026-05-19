import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function load(rel) {
  const path = join(root, rel);
  const s = readFileSync(path, 'utf8');
  return { path, s, nl: s.includes('\r\n') ? '\r\n' : '\n' };
}

function save(path, s) {
  writeFileSync(path, s, 'utf8');
}

function summaryBlock(nl, expr, indent = '                    ') {
  return (
    `${indent}<div className="toolbar-left">${nl}` +
    `${indent}    <span className="kl-table-toolbar-summary">${nl}` +
    `${indent}        \ucd1d <strong>{${expr}}</strong>\uac74${nl}` +
    `${indent}    </span>${nl}` +
    `${indent}</div>`
  );
}

function patchSearchInRight({ path, s, nl }, opts) {
  const { countExpr, removeCount, fromBlock, closeFrom, closeTo } = opts;
  if (removeCount) s = s.replace(removeCount, '');
  if (!s.includes(fromBlock)) {
    console.error('[MISS from]', path);
    return false;
  }
  s = s.replace(fromBlock, opts.toBlock);
  if (!s.includes(closeFrom)) {
    console.error('[MISS close]', path);
    return false;
  }
  s = s.replace(closeFrom, closeTo);
  save(path, s);
  console.log('[OK]', path);
  return true;
}

let fail = 0;

// Workspace
{
  const { path, s, nl } = load('src/pages/admin/AdminWorkspaceManagement.jsx');
  const from =
    `                    <div className="toolbar-left">${nl}` +
    `                        <div className="search-area">${nl}` +
    `                            <Search size={16} className="search-area-icon" aria-hidden />${nl}` +
    `                            <input${nl}` +
    `                                type="text"${nl}` +
    `                                className="search-area-input"${nl}` +
    `                                placeholder="\uc6cc\ud06c\uc2a4\ud398\uc774\uc2a4\uba85, \ub3c4\uba54\uc778, \uc18c\uc720\uc790 \uac80\uc0c9..."${nl}` +
    `                                value={searchTerm}${nl}` +
    `                                onChange={(e) => setSearchTerm(e.target.value)}${nl}` +
    `                                aria-label="\uc6cc\ud06c\uc2a4\ud398\uc774\uc2a4 \uac80\uc0c9"${nl}` +
    `                            />${nl}` +
    `                        </div>${nl}` +
    `                    </div>${nl}` +
    `                </div>`;
  const to =
    summaryBlock(nl, 'filteredWorkspaces.length', '                    ') +
    `${nl}                    <div className="toolbar-right">${nl}` +
    `                        <div className="search-area">${nl}` +
    `                            <Search size={16} className="search-area-icon" aria-hidden />${nl}` +
    `                            <input${nl}` +
    `                                type="text"${nl}` +
    `                                className="search-area-input"${nl}` +
    `                                placeholder="\uc6cc\ud06c\uc2a4\ud398\uc774\uc2a4\uba85, \ub3c4\uba54\uc778, \uc18c\uc720\uc790 \uac80\uc0c9..."${nl}` +
    `                                value={searchTerm}${nl}` +
    `                                onChange={(e) => setSearchTerm(e.target.value)}${nl}` +
    `                                aria-label="\uc6cc\ud06c\uc2a4\ud398\uc774\uc2a4 \uac80\uc0c9"${nl}` +
    `                            />${nl}` +
    `                        </div>${nl}` +
    `                    </div>${nl}` +
    `                </div>`;
  let content = s.replace(`                    count={filteredWorkspaces.length}${nl}`, '');
  if (!content.includes(from)) {
    console.error('[MISS workspace]');
    fail++;
  } else {
    save(path, content.replace(from, to));
    console.log('[OK] workspace');
  }
}

// Member (compact toolbar markup)
{
  const { path, s, nl } = load('src/pages/admin/AdminMemberManagement.jsx');
  const from =
    `                    <div className="toolbar-left">${nl}` +
    `                    <div className="search-area">${nl}` +
    `                    <Search size={16} className="search-area-icon" aria-hidden />${nl}` +
    `                    <input${nl}` +
    `                    type="text"${nl}` +
    `                    className="search-area-input"${nl}` +
    `                    placeholder="\uc774\uba54\uc77c, \ub3c4\uba54\uc778, \uad8c\ud55c \uac80\uc0c9..."${nl}` +
    `                    value={searchTerm}${nl}` +
    `                    onChange={(e) => setSearchTerm(e.target.value)}${nl}` +
    `                    aria-label="\uc0ac\uc6a9\uc790 \uac80\uc0c9"${nl}` +
    `                    />${nl}` +
    `                    </motion.div>${nl}` +
    `                    </motion.div>${nl}` +
    `                    </motion.div>`;
  const fromOk = from.replace(/motion\.motion/g, 'x').replace(/<\/motion\.motion>/g, '</div>').replace(/motion\.motion/g, 'div');
  const fromFixed =
    `                    <div className="toolbar-left">${nl}` +
    `                    <div className="search-area">${nl}` +
    `                    <Search size={16} className="search-area-icon" aria-hidden />${nl}` +
    `                    <input${nl}` +
    `                    type="text"${nl}` +
    `                    className="search-area-input"${nl}` +
    `                    placeholder="\uc774\uba54\uc77c, \ub3c4\uba54\uc778, \uad8c\ud55c \uac80\uc0c9..."${nl}` +
    `                    value={searchTerm}${nl}` +
    `                    onChange={(e) => setSearchTerm(e.target.value)}${nl}` +
    `                    aria-label="\uc0ac\uc6a9\uc790 \uac80\uc0c9"${nl}` +
    `                    />${nl}` +
    `                    </div>${nl}` +
    `                    </div>${nl}` +
    `                    </div>`;
  const to =
    summaryBlock(nl, 'filteredMembers.length', '                    ') +
    `${nl}                    <div className="toolbar-right">${nl}` +
    `                    <div className="search-area">${nl}` +
    `                    <Search size={16} className="search-area-icon" aria-hidden />${nl}` +
    `                    <input${nl}` +
    `                    type="text"${nl}` +
    `                    className="search-area-input"${nl}` +
    `                    placeholder="\uc774\uba54\uc77c, \ub3c4\uba54\uc778, \uad8c\ud55c \uac80\uc0c9..."${nl}` +
    `                    value={searchTerm}${nl}` +
    `                    onChange={(e) => setSearchTerm(e.target.value)}${nl}` +
    `                    aria-label="\uc0ac\uc6a9\uc790 \uac80\uc0c9"${nl}` +
    `                    />${nl}` +
    `                    </div>${nl}` +
    `                    </div>${nl}` +
    `                    </div>`;
  let content = s.replace(`                    count={filteredMembers.length}${nl}`, '');
  if (!content.includes(fromFixed)) {
    console.error('[MISS member]');
    fail++;
  } else {
    save(path, content.replace(fromFixed, to));
    console.log('[OK] member');
  }
}

// Upgrade
{
  const { path, s, nl } = load('src/pages/admin/AdminUpgradeRequests.jsx');
  const insert =
    `                <div className="table-toolbar">${nl}` +
    summaryBlock(nl, 'requests.length', '                ') +
    `${nl}                </motion.div>${nl}${nl}`;
  const insertOk = insert.replace(/motion\.div/g, 'motion.div').replace(`                </motion.div>`, `                </div>`);
  const marker = `            <div className="table-area">${nl}                <div className="basic-table-shell">`;
  const replacement =
    `            <div className="table-area">${nl}` +
    `                <div className="table-toolbar">${nl}` +
    summaryBlock(nl, 'requests.length', '                ') +
    `${nl}                </div>${nl}${nl}` +
    `                <div className="basic-table-shell">`;
  let content = s.replace(' count={requests.length}', '');
  if (!content.includes(marker)) {
    console.error('[MISS upgrade]');
    fail++;
  } else {
    save(path, content.replace(marker, replacement));
    console.log('[OK] upgrade');
  }
}

// Arango
{
  const { path, s, nl } = load('src/pages/admin/AdminArangoManagement.jsx');
  const marker = `                <motion.div className="table-area">${nl}                    <div className="basic-table-shell">`;
  const markerOk = marker.replace(/motion\.div/g, 'motion.div');
  const markerFixed = `                <div className="table-area">${nl}                    <div className="basic-table-shell">`;
  const replacement =
    `                <div className="table-area">${nl}` +
    `                    <div className="table-toolbar">${nl}` +
    summaryBlock(nl, 'databases.length', '                    ') +
    `${nl}                    </div>${nl}${nl}` +
    `                    <div className="basic-table-shell">`;
  let content = s.replace(`                    count={databases.length}${nl}`, '');
  if (!content.includes(markerFixed)) {
    console.error('[MISS arango]');
    fail++;
  } else {
    save(path, content.replace(markerFixed, replacement));
    console.log('[OK] arango');
  }
}

// Config
{
  const { path, s, nl } = load('src/pages/admin/AdminConfigManagement.jsx');
  const from =
    `                    <div className="table-toolbar table-toolbar--end">${nl}` +
    `                            <div className="config-mgmt-toolbar-filter">`;
  const to =
    `                    <div className="table-toolbar">${nl}` +
    summaryBlock(nl, 'tableData.length', '                    ') +
    `${nl}                    <div className="toolbar-right">${nl}` +
    `                            <div className="config-mgmt-toolbar-filter">`;
  let content = s.replace(`                    count={configs.length}${nl}`, '');
  if (!content.includes(from)) {
    console.error('[MISS config]');
    fail++;
  } else {
    content = content.replace(from, to);
    const closeFrom = `                            </div>${nl}                    </div>${nl}                    {tableData.length`;
    const closeTo = `                            </div>${nl}                    </div>${nl}                    </div>${nl}                    {tableData.length`;
    if (!content.includes(closeFrom)) {
      console.error('[MISS config close]');
      fail++;
    } else {
      save(path, content.replace(closeFrom, closeTo));
      console.log('[OK] config');
    }
  }
}

// FAQ
{
  const { path, s, nl } = load('src/pages/Faq.jsx');
  const from =
    `          <div className="toolbar-left">${nl}` +
    `            <div className="search-area">${nl}` +
    `              <Search size={16} className="search-area-icon" aria-hidden />${nl}` +
    `              <input${nl}` +
    `                type="text"${nl}` +
    `                className="search-area-input"${nl}` +
    `                placeholder="FAQ \uac80\uc0c9"${nl}` +
    `                value={faqSearch}${nl}` +
    `                onChange={(e) => {${nl}` +
    `                  setFaqSearch(e.target.value);${nl}` +
    `                }}${nl}` +
    `                aria-label="FAQ \uac80\uc0c9"${nl}` +
    `              />${nl}` +
    `            </div>${nl}` +
    `          </div>${nl}` +
    `          <div className="toolbar-right">`;
  const to =
    `          <div className="toolbar-left">${nl}` +
    `            <span className="kl-table-toolbar-summary">${nl}` +
    `              \ucd1d <strong>{filteredFaqs.length}</strong>\uac74${nl}` +
    `            </span>${nl}` +
    `          </div>${nl}` +
    `          <div className="toolbar-right">${nl}` +
    `            <div className="search-area">${nl}` +
    `              <Search size={16} className="search-area-icon" aria-hidden />${nl}` +
    `              <input${nl}` +
    `                type="text"${nl}` +
    `                className="search-area-input"${nl}` +
    `                placeholder="FAQ \uac80\uc0c9"${nl}` +
    `                value={faqSearch}${nl}` +
    `                onChange={(e) => {${nl}` +
    `                  setFaqSearch(e.target.value);${nl}` +
    `                }}${nl}` +
    `                aria-label="FAQ \uac80\uc0c9"${nl}` +
    `              />${nl}` +
    `            </div>`;
  if (!s.includes(from)) {
    console.error('[MISS faq]');
    fail++;
  } else {
    save(path, s.replace(from, to));
    console.log('[OK] faq');
  }
}

// QnA
{
  const { path, s, nl } = load('src/pages/QnaBoard.jsx');
  const from =
    `                    <div className="toolbar-left">${nl}` +
    `                    <div className="search-area">${nl}` +
    `                    <Search size={16} className="search-area-icon" aria-hidden />${nl}` +
    `                    <input${nl}` +
    `                    type="text"${nl}` +
    `                    className="search-area-input"${nl}` +
    `                    placeholder="\ubb38\uc758 \uac80\uc0c9"${nl}` +
    `                    value={qnaSearch}${nl}` +
    `                    onChange={(e) => {${nl}` +
    `                    setQnaSearch(e.target.value);${nl}` +
    `                    }}${nl}` +
    `                    aria-label="\ubb38\uc758 \uac80\uc0c9"${nl}` +
    `                    />${nl}` +
    `                    </div>${nl}` +
    `                    </div>${nl}` +
    `                    <div className="toolbar-right">`;
  const to =
    summaryBlock(nl, 'filteredQuestions.length', '                    ') +
    `${nl}                    <div className="toolbar-right">${nl}` +
    `                    <div className="search-area">${nl}` +
    `                    <Search size={16} className="search-area-icon" aria-hidden />${nl}` +
    `                    <input${nl}` +
    `                    type="text"${nl}` +
    `                    className="search-area-input"${nl}` +
    `                    placeholder="\ubb38\uc758 \uac80\uc0c9"${nl}` +
    `                    value={qnaSearch}${nl}` +
    `                    onChange={(e) => {${nl}` +
    `                    setQnaSearch(e.target.value);${nl}` +
    `                    }}${nl}` +
    `                    aria-label="\ubb38\uc758 \uac80\uc0c9"${nl}` +
    `                    />${nl}` +
    `                    </div>`;
  if (!s.includes(from)) {
    console.error('[MISS qna]');
    fail++;
  } else {
    save(path, s.replace(from, to));
    console.log('[OK] qna');
  }
}

// Notice
{
  const { path, s, nl } = load('src/pages/NoticeList.jsx');
  const from =
    `                    <div className="toolbar-left">${nl}` +
    `                    <div className="search-area">${nl}` +
    `                    <Search size={16} className="search-area-icon" aria-hidden />${nl}` +
    `                    <input${nl}` +
    `                    type="text"${nl}` +
    `                    className="search-area-input"${nl}` +
    `                    placeholder="\uacf5\uc9c0\uc0ac\ud56d \uac80\uc0c9"${nl}` +
    `                    value={noticeSearch}${nl}` +
    `                    onChange={(e) => {${nl}` +
    `                    setNoticeSearch(e.target.value);${nl}` +
    `                    }}${nl}` +
    `                    aria-label="\uacf5\uc9c0\uc0ac\ud56d \uac80\uc0c9"${nl}` +
    `                    />${nl}` +
    `                    </div>${nl}` +
    `                    </div>${nl}` +
    `                    </div>`;
  const to =
    summaryBlock(nl, 'filteredNotices.length', '                    ') +
    `${nl}                    <motion.div className="toolbar-right">${nl}` +
    `                    <motion.div className="search-area">${nl}` +
    `                    <Search size={16} className="search-area-icon" aria-hidden />${nl}` +
    `                    <input${nl}` +
    `                    type="text"${nl}` +
    `                    className="search-area-input"${nl}` +
    `                    placeholder="\uacf5\uc9c0\uc0ac\ud56d \uac80\uc0c9"${nl}` +
    `                    value={noticeSearch}${nl}` +
    `                    onChange={(e) => {${nl}` +
    `                    setNoticeSearch(e.target.value);${nl}` +
    `                    }}${nl}` +
    `                    aria-label="\uacf5\uc9c0\uc0ac\ud56d \uac80\uc0c9"${nl}` +
    `                    />${nl}` +
    `                    </motion.div>${nl}` +
    `                    </motion.div>${nl}` +
    `                    </motion.div>`;
  const toOk = to.replace(/motion\.div/g, 'motion.div');
  const toFixed = toOk
    .replace(/<motion\.div/g, '<div')
    .replace(/<\/motion\.motion>/g, '</div>');
  // fix notice to - use explicit div only
  const toClean =
    summaryBlock(nl, 'filteredNotices.length', '                    ') +
    `${nl}                    <div className="toolbar-right">${nl}` +
    `                    <div className="search-area">${nl}` +
    `                    <Search size={16} className="search-area-icon" aria-hidden />${nl}` +
    `                    <input${nl}` +
    `                    type="text"${nl}` +
    `                    className="search-area-input"${nl}` +
    `                    placeholder="\uacf5\uc9c0\uc0ac\ud56d \uac80\uc0c9"${nl}` +
    `                    value={noticeSearch}${nl}` +
    `                    onChange={(e) => {${nl}` +
    `                    setNoticeSearch(e.target.value);${nl}` +
    `                    }}${nl}` +
    `                    aria-label="\uacf5\uc9c0\uc0ac\ud56d \uac80\uc0c9"${nl}` +
    `                    />${nl}` +
    `                    </div>${nl}` +
    `                    </div>${nl}` +
    `                    </div>`;
  if (!s.includes(from)) {
    console.error('[MISS notice]');
    fail++;
  } else {
    save(path, s.replace(from, toClean));
    console.log('[OK] notice');
  }
}

process.exit(fail);
