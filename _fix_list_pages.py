# -*- coding: utf-8 -*-
"""Restore list-page table-area + move toolbar inside (post-checkout recovery)."""
from pathlib import Path

D = "d" + "iv"
ROOT = Path("src")


def extract_div_block(text: str, class_fragment: str) -> tuple[str, int, int] | None:
    marker = f'className="{class_fragment}"'
    if marker not in text:
        return None
    start = text.rfind(f"<{D}", 0, text.index(marker))
    depth = 0
    i = start
    while i < len(text):
        if text.startswith(f"<{D}", i):
            depth += 1
            i += 3
            continue
        if text.startswith(f"</{D}>", i):
            depth -= 1
            i += 6
            if depth == 0:
                return text[start:i], start, i
            continue
        i += 1
    return None


def patch_member(text: str) -> str:
    text = text.replace("member-mgmt-page", "kl-page")
    text = text.replace("km-main-sticky-head", "kl-main-sticky-head")
    text = text.replace("member-mgmt-table-card", "table-area")
    text = text.replace('className="member-mgmt-table-shell basic-table-shell"', 'className="basic-table-shell"')
    text = text.replace("KmModalSelect", "KlModalSelect").replace("km-modal-form", "kl-modal-form")
    tb = extract_div_block(text, "member-mgmt-toolbar")
    if not tb:
        return text
    block, s, e = tb
    inner = block.replace("member-mgmt-toolbar-left", "toolbar-left")
    inner = inner.replace("member-mgmt-search", "search-area")
    inner = inner.replace("member-mgmt-search-icon", "search-area-icon")
    inner = inner.replace("member-mgmt-search-input", "search-area-input")
    inner = inner.replace('Search size={18}', "Search size={16}")
    inner = inner.replace("member-mgmt-toolbar", "table-toolbar")
    text = text[:s] + text[e:]
    text = text.replace(
        "                            <RotateCcw size={16} aria-hidden />\n                        </button>\n                    )}\n                />",
        "                            <RotateCcw size={16} aria-hidden />\n                        </button>\n                    )}\n                />\n            </div>",
        1,
    )
    area = f'<{D} className="table-area">'
    idx = text.index(area) + len(area)
    indent = "                    "
    tb_lines = "\n".join(indent + ln.strip() for ln in inner.splitlines() if ln.strip())
    return text[:idx] + "\n" + tb_lines + "\n" + text[idx:]


def patch_support_page(text: str, page_class: str) -> str:
    """Faq / NoticeList / QnaBoard."""
    text = text.replace(page_class, "kl-page")
    text = text.replace("km-main-sticky-head", "kl-main-sticky-head")
    text = text.replace("support-table-card", "table-area")
    text = text.replace("support-table-shell basic-table-shell", "basic-table-shell")
    text = text.replace("KmModalSelect", "KlModalSelect").replace("km-modal-form", "kl-modal-form")
    tb = extract_div_block(text, "support-toolbar")
    if not tb:
        return text
    block, s, e = tb
    inner = block.replace("support-toolbar", "table-toolbar")
    inner = inner.replace("support-search", "search-area")
    inner = inner.replace("support-search-icon", "search-area-icon")
    inner = inner.replace("support-search-input", "search-area-input")
    # wrap search in toolbar-left if not present
    if "toolbar-left" not in inner:
        inner = inner.replace(
            f'<{D} className="table-toolbar">',
            f'<{D} className="table-toolbar">\n          <{D} className="toolbar-left">',
            1,
        )
        # insert toolbar-right before last close of toolbar - crude: support-filter gets toolbar-right
        inner = inner.replace(
            f'<{D} className="support-filter">',
            f'</{D}>\n          <{D} className="toolbar-right">\n          <{D} className="support-filter">',
            1,
        )
        inner = inner.replace(f"</{D}>\n      </{D}>", f"</{D}>\n          </{D}>\n      </{D}>", 1)
    text = text[:s] + text[e:]
    # close sticky after PageHeader
    if f"            </{D}>\n\n      <{D} className=\"table-area\">" not in text:
        text = text.replace(
            f"      </{D}>\n\n      <{D} className=\"table-area\">",
            f"      </{D}>\n      </{D}>\n\n      <{D} className=\"table-area\">",
            1,
        )
    area = f'<{D} className="table-area">'
    idx = text.index(area) + len(area)
    tb_lines = "\n".join("        " + ln.strip() for ln in inner.splitlines() if ln.strip())
    return text[:idx] + "\n" + tb_lines + "\n" + text[idx:]


def patch_domain_selection(text: str) -> str:
    text = text.replace("km-main-sticky-head", "kl-main-sticky-head")
    if f'className="kl-page"' not in text:
        text = text.replace('<motion className="kl-page">', f'<{D} className="kl-page">', 1) if False else text
    tb = extract_div_block(text, "table-toolbar")
    if tb and "infotxt" in tb[0]:
        return text  # already moved
    tb = extract_div_block(text, "domain-mgmt-toolbar") or extract_div_block(text, "table-toolbar")
    if not tb:
        # try domain selection toolbar class
        for cls in ("table-toolbar",):
            tb = extract_div_block(text, cls)
            if tb:
                break
    if not tb:
        tb2 = extract_div_block(text, "infotxt")
        if tb2:
            # parent toolbar
            pass
    return text


def main():
    jobs = [
        (ROOT / "pages/admin/AdminMemberManagement.jsx", patch_member),
        (ROOT / "pages/Faq.jsx", lambda t: patch_support_page(t, "faq-page support-page")),
        (ROOT / "pages/NoticeList.jsx", lambda t: patch_support_page(t, "notice-page support-page")),
        (ROOT / "pages/QnaBoard.jsx", lambda t: patch_support_page(t, "qna-page support-page")),
    ]
    for path, fn in jobs:
        if not path.exists():
            print("missing", path)
            continue
        t = path.read_text(encoding="utf-8")
        n = fn(t)
        if n != t:
            path.write_text(n, encoding="utf-8")
            print("ok", path.name)
        else:
            print("skip", path.name)


if __name__ == "__main__":
    main()
