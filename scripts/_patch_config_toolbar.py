from pathlib import Path

path = Path("src/pages/admin/AdminConfigManagement.jsx")
text = path.read_text(encoding="utf-8")

old = (
    "                    <motion.div className=\"table-toolbar\">\n"
    "                        <motion.div className=\"toolbar-left\">\n"
    "                            <motion.div className=\"config-mgmt-toolbar-filter\">"
)
old = (
    '                    <div className="table-toolbar">\n'
    '                        <div className="toolbar-left">\n'
    '                            <div className="config-mgmt-toolbar-filter">'
)
new = (
    '                    <div className="table-toolbar table-toolbar--end">\n'
    '                        <div className="config-mgmt-toolbar-filter">'
)

if old not in text:
    old = old.replace("\n", "\r\n")
    new = new.replace("\n", "\r\n")

if old not in text:
    raise SystemExit("block not found")

text = text.replace(old, new, 1)

for close in (
    "                            </div>\n                        </div>\n                    </div>\n                    {tableData",
    "                            </motion.div>\r\n                        </motion.div>\r\n                    </motion.div>\r\n                    {tableData",
    "                            </div>\r\n                        </div>\r\n                    </div>\r\n                    {tableData",
):
    if close in text:
        text = text.replace(
            close,
            close.replace(
                "                            </div>\n                        </div>\n                    </div>\n",
                "                            </div>\n                    </div>\n",
            ).replace(
                "                            </motion.div>\r\n                        </motion.div>\r\n                    </motion.div>\r\n",
                "                            </motion.div>\r\n                    </motion.div>\r\n",
            ),
            1,
        )
        break

# simpler close fix
text = text.replace(
    "                        </div>\n                    </div>\n                    {tableData.length === 0",
    "                    </div>\n                    {tableData.length === 0",
    1,
)
text = text.replace(
    "                        </motion.div>\r\n                    </motion.div>\r\n                    {tableData.length === 0",
    "                    </motion.div>\r\n                    {tableData.length === 0",
    1,
)

path.write_text(text, encoding="utf-8")
print("ok")
