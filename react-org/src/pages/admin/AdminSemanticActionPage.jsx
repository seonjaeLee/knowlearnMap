import { Zap } from 'lucide-react';
import SemanticEntitySplitPage from './semantic/SemanticEntitySplitPage';

function AdminSemanticActionPage({ compact = false }) {
  return (
    <SemanticEntitySplitPage
      compact={compact}
      entityKey="action"
      headerIcon={Zap}
    />
  );
}

export default AdminSemanticActionPage;
