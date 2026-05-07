import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import PageHeader from '../components/common/PageHeader';
import userGuideMarkdown from '../../docs/user-guide.md?raw';
import './UserGuide.css';

function UserGuide() {
  return (
    <div className="user-guide-page">
      <PageHeader
        title="사용 가이드"
        breadcrumbs={['고객센터', '사용 가이드']}
      />
      <section className="user-guide-content" aria-label="사용 가이드 문서">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {userGuideMarkdown}
        </ReactMarkdown>
      </section>
    </div>
  );
}

export default UserGuide;
