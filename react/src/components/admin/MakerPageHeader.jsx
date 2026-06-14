import React from 'react';
import PageHeader from '../common/PageHeader';

function MakerPageHeader({ icon: _icon, title, count, subtitle, actions, showDescription = false }) {
  const headerTitle = typeof count === 'number'
    ? `${title} (${count.toLocaleString()})`
    : title;

  return (
    <PageHeader
      title={headerTitle}
      breadcrumbs={['메이커센터']}
      description={showDescription ? subtitle : ''}
      actions={actions}
    />
  );
}

export default MakerPageHeader;
