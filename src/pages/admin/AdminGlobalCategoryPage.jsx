import SemanticOptionsEditor from './SemanticOptionsEditor';
import { adminSemanticOptionsApi } from '../../services/api';

export default function AdminGlobalCategoryPage() {
    return (
        <SemanticOptionsEditor
            title="전체 카테고리 관리"
            subtitle="MAP 전체에서 사용하는 시멘틱 카테고리. 온톨로지 프롬프트 빌드 시 이 값이 참조됩니다. EXP 에서는 읽기 전용으로 조회됩니다."
            loadFn={adminSemanticOptionsApi.getGlobalCategories}
            saveFn={adminSemanticOptionsApi.setGlobalCategories}
            itemLabel="카테고리"
        />
    );
}
