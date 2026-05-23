import { Link2 } from 'lucide-react';
import SemanticEntitySplitPage from './semantic/SemanticEntitySplitPage';

function AdminSemanticRelationPage({ compact = false }) {
  return (
    <SemanticEntitySplitPage
      compact={compact}
      entityKey="relation"
      headerIcon={Link2}
    />
  );
}

export default AdminSemanticRelationPage;
