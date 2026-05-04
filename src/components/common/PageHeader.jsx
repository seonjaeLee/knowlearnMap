import React from 'react';
import './PageHeader.css';

function PageHeader({
  title,
  breadcrumbs = [],
  description,
  actions,
  autoTrimTitleFromBreadcrumb = true,
}) {
  const normalizedTitle = String(title || '').trim();
  const normalizedBreadcrumbs = (breadcrumbs || [])
    .filter((item) => item !== null && item !== undefined && String(item).trim() !== '')
    .map((item) => String(item).trim());
  const displayBreadcrumbs =
    autoTrimTitleFromBreadcrumb &&
    normalizedBreadcrumbs.length > 0 &&
    normalizedBreadcrumbs[normalizedBreadcrumbs.length - 1] === normalizedTitle
      ? normalizedBreadcrumbs.slice(0, -1)
      : normalizedBreadcrumbs;

  return (
    <div className="page-header">
      <div className="page-header-left">
        <div className="page-header-title-row">
          <h1 className="page-header-title">{title}</h1>
          {displayBreadcrumbs.length > 0 && (
            <div className="page-header-breadcrumb" aria-label="현재 위치">
              {displayBreadcrumbs.map((item, idx) => (
                <React.Fragment key={`${item}-${idx}`}>
                  <span className={idx === displayBreadcrumbs.length - 1 ? 'is-current' : ''}>{item}</span>
                  {idx < displayBreadcrumbs.length - 1 && <span className="page-header-separator">/</span>}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
        {description && <p className="page-header-description">{description}</p>}
      </div>
      {actions && <div className="page-header-actions">{actions}</div>}
    </div>
  );
}

export default PageHeader;
