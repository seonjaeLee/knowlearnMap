import axiosClient from './axiosClient';

export const promptService = {
  // 프롬프트 목록 조회
  getPrompts: async (params = {}) => {
    const { page = 0, size = 20, isActive, search, category, purpose } = params;
    const queryParams = new URLSearchParams();

    queryParams.append('page', page);
    queryParams.append('size', size);
    if (isActive !== undefined) queryParams.append('isActive', isActive);
    if (category) queryParams.append('category', category);
    if (purpose) queryParams.append('purpose', purpose);
    if (search) queryParams.append('search', search);

    return axiosClient.get(`/prompts?${queryParams.toString()}`);
  },

  // 프롬프트 상세 조회
  getPrompt: async (code) => {
    return axiosClient.get(`/prompts/${code}`);
  },

  // 프롬프트 생성
  createPrompt: async (data) => {
    return axiosClient.post('/prompts', data);
  },

  // 프롬프트 수정
  updatePrompt: async (code, data) => {
    return axiosClient.put(`/prompts/${code}`, data);
  },

  // 프롬프트 삭제
  deletePrompt: async (code) => {
    return axiosClient.delete(`/prompts/${code}`);
  },

  // 프롬프트 코드 중복 체크
  checkCode: async (code) => {
    return axiosClient.get(`/prompts/check-code/${code}`);
  },

  // 프롬프트 통계
  getStatistics: async (code) => {
    return axiosClient.get(`/prompts/${code}/statistics`);
  },

  // 만족도 추이
  getSatisfactionTrend: async (code) => {
    return axiosClient.get(`/prompts/${code}/satisfaction-trend`);
  },

  // 카테고리 목록 조회
  getCategories: async () => {
    return axiosClient.get('/prompts/categories');
  },

  // 용도(PURPOSE) 목록 조회
  getPurposes: async () => {
    return axiosClient.get('/prompts/purposes');
  },
};
