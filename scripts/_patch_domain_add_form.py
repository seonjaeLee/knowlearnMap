# -*- coding: utf-8 -*-
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "src" / "pages" / "DomainSelection.jsx"

text = TARGET.read_text(encoding="utf-8")

form_new = """                <form className="domain-add-modal-form" onSubmit={(e) => e.preventDefault()}>
                    <motion.div className="domain-form-row">
                        <label className="domain-form-row__label" htmlFor="domain-add-name">
                            \ub3c4\uba54\uc778\uba85 <span className="domain-required" aria-hidden="true">*</span>
                        </label>
                        <div className="domain-form-row__control">
                            <input
                                id="domain-add-name"
                                type="text"
                                value={addForm.name}
                                onChange={(e) => setAddForm((p) => ({ ...p, name: e.target.value }))}
                                placeholder="\ub3c4\uba54\uc778 \uc774\ub984"
                                autoFocus
                                autoComplete="off"
                            />
                        </div>
                    </div>

                    <div className="domain-form-row">
                        <label className="domain-form-row__label" htmlFor="domain-add-desc">
                            \uc124\uba85
                        </label>
                        <div className="domain-form-row__control">
                            <input
                                id="domain-add-desc"
                                type="text"
                                value={addForm.description}
                                onChange={(e) => setAddForm((p) => ({ ...p, description: e.target.value }))}
                                placeholder="\ub3c4\uba54\uc778 \uc124\uba85 (\uc120\ud0dd)"
                                autoComplete="off"
                            />
                        </div>
                    </div>

                    <div className="domain-form-row domain-form-row--start">
                        <label className="domain-form-row__label" htmlFor="domain-add-arango">
                            ArangoDB \ub370\uc774\ud130\ubca0\uc774\uc2a4\uba85 <span className="domain-required" aria-hidden="true">*</span>
                        </label>
                        <div className="domain-form-row__control">
                            <input
                                id="domain-add-arango"
                                type="text"
                                value={addForm.arangoDbName}
                                onChange={(e) => {
                                    const v = e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '');
                                    setAddForm((p) => ({ ...p, arangoDbName: v }));
                                }}
                                placeholder="\uc608: my_domain-01"
                                autoComplete="off"
                            />
                            <p className="domain-add-help">
                                \uc0ac\uc6a9 \uac00\ub2a5: \uc601\ubb38 \uc18c\ubb38\uc790, \uc22b\uc790, \ud558\uc774\ud508(-), \uc5b8\ub354\uc2a4\ucf54\uc5b4(_) \u00b7 \uc0dd\uc131 \ud6c4 \ubcc0\uacbd \ubd88\uac00
                            </p>
                        </div>
                    </div>

                    {addError && <div className="domain-add-error">{addError}</div>}
                </form>"""

form_new = form_new.replace("<motion.div className=\"domain-form-row\">", "<div className=\"domain-form-row\">", 1)

text2, n = re.subn(
    r'                <motion.div className="domain-add-form">.*?                </motion.div>\n            </BaseModal>',
    form_new + "\n            </BaseModal>",
    text,
    count=1,
    flags=re.DOTALL,
)
if n != 1:
    text2, n = re.subn(
        r'                <div className="domain-add-form">.*?                </div>\n            </BaseModal>',
        form_new + "\n            </BaseModal>",
        text,
        count=1,
        flags=re.DOTALL,
    )
if n != 1:
    raise SystemExit(f"form block not replaced: {n}")

TARGET.write_text(text2, encoding="utf-8")
print("OK", TARGET)
