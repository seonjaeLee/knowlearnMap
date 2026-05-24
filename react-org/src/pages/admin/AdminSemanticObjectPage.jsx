import { Box } from 'lucide-react';
import SemanticEntitySplitPage from './semantic/SemanticEntitySplitPage';

function AdminSemanticObjectPage({ compact = false }) {
  return (
    <SemanticEntitySplitPage
      compact={compact}
      entityKey="object"
      headerIcon={Box}
    />
  );
}

export default AdminSemanticObjectPage;
