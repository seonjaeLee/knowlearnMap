import { useState, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import { faqApi } from '../services/api';
import FaqCreateModal from '../components/FaqCreateModal';
import FaqDetailModal from '../components/FaqDetailModal';
import PageHeader from '../components/common/PageHeader';
import './Faq.css';

function Faq() {
    const { user } = useAuth();
    const { showAlert } = useAlert();
    const [faqs, setFaqs] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [searchKeyword, setSearchKeyword] = useState('');
    const [loading, setLoading] = useState(true);
    const [totalElements, setTotalElements] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFaq, setEditingFaq] = useState(null);
    const [selectedFaqId, setSelectedFaqId] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const fetchFaqs = async () => {
        setLoading(true);
        try {
            const params = { page: currentPage, size: 10 };
            if (selectedCategory) params.category = selectedCategory;
            if (searchKeyword) params.keyword = searchKeyword;

            const response = await faqApi.getAll(params);
            setFaqs(response.data || []);
            setTotalElements(response.totalElements || 0);
            setTotalPages(response.totalPages || 0);
        } catch (error) {
            console.error('FAQ 목록 조회 실패:', error);
            showAlert('FAQ 목록을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const data = await faqApi.getCategories();
            setCategories(data || []);
        } catch (error) {
            console.error('카테고리 조회 실패:', error);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchFaqs();
    }, [currentPage, selectedCategory]);

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(0);
        fetchFaqs();
    };

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
        setCurrentPage(0);
    };

    const handleCreateFaq = async (faqData) => {
        try {
            if (editingFaq) {
                await faqApi.update(editingFaq.id, faqData);
                showAlert('FAQ가 수정되었습니다.');
            } else {
                await faqApi.create(faqData);
                showAlert('FAQ가 등록되었습니다.');
            }
            fetchFaqs();
            fetchCategories();
        } catch (error) {
            console.error('FAQ 저장 실패:', error);
            showAlert('FAQ 저장에 실패했습니다.');
            throw error;
        }
    };

    const handleFaqClick = (faqId) => {
        setSelectedFaqId(faqId);
        setIsDetailModalOpen(true);
    };

    const openCreateModal = () => {
        setEditingFaq(null);
        setIsModalOpen(true);
    };

    return (
        <div className="faq-page">
            <div className="faq-container">
                <PageHeader
                    title="자주 묻는 질문"
                    breadcrumbs={['고객센터', '자주 묻는 질문']}
                    actions={(
                        <button className="faq-create-btn" onClick={openCreateModal}>
                            <Plus size={18} />
                            FAQ 작성
                        </button>
                    )}
                />

                <div className="faq-toolbar">
                    <div className="faq-search-wrapper">
                        <Search size={18} className="search-icon" />
                        <form onSubmit={handleSearch}>
                            <input
                                type="text"
                                placeholder="FAQ 검색"
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                            />
                        </form>
                    </div>
                    {categories.length > 0 && (
                        <div className="faq-category-filter">
                            <span className="filter-label">카테고리:</span>
                            <select
                                value={selectedCategory}
                                onChange={(e) => handleCategoryChange(e.target.value)}
                                className="category-select"
                            >
                                <option value="">전체</option>
                                {categories.map((cat, index) => (
                                    <option key={index} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                <div className="faq-list-container">
                    <table className="faq-table">
                        <thead>
                            <tr>
                                <th className="th-title">제목</th>
                                <th className="th-category">카테고리</th>
                                <th className="th-author">작성자</th>
                                <th className="th-created">작성일</th>
                                <th className="th-views">조회수</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="td-loading">로딩 중...</td>
                                </tr>
                            ) : faqs.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="td-empty">등록된 FAQ가 없습니다.</td>
                                </tr>
                            ) : (
                                faqs.map((faq) => (
                                    <tr
                                        key={faq.id}
                                        onClick={() => handleFaqClick(faq.id)}
                                        className="faq-row"
                                    >
                                        <td className="td-title">
                                            <span className="faq-title-text">{faq.title}</span>
                                        </td>
                                        <td className="td-category">
                                            {faq.category && (
                                                <span className="category-badge">{faq.category}</span>
                                            )}
                                        </td>
                                        <td className="td-author">{faq.authorEmail?.split('@')[0] || faq.createdBy || '-'}</td>
                                        <td className="td-created">{new Date(faq.createdAt).toLocaleDateString()}</td>
                                        <td className="td-views">{faq.viewCount}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="faq-pagination">
                        <button
                            className="pagination-btn"
                            disabled={currentPage === 0}
                            onClick={() => setCurrentPage(currentPage - 1)}
                        >
                            이전
                        </button>
                        <span className="pagination-info">
                            {currentPage + 1} / {totalPages}
                        </span>
                        <button
                            className="pagination-btn"
                            disabled={currentPage >= totalPages - 1}
                            onClick={() => setCurrentPage(currentPage + 1)}
                        >
                            다음
                        </button>
                    </div>
                )}
            </div>

            <FaqCreateModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingFaq(null);
                }}
                onSubmit={handleCreateFaq}
                editingFaq={editingFaq}
                categories={categories}
            />

            <FaqDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => {
                    setIsDetailModalOpen(false);
                    setSelectedFaqId(null);
                }}
                faqId={selectedFaqId}
                onUpdate={() => {
                    fetchFaqs();
                    fetchCategories();
                }}
            />
        </div>
    );
}

export default Faq;
