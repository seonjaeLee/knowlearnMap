import axiosClient from './axiosClient';
import { isPromptMockEnabled } from '../../config/promptMock';
import {
  mockPromptCategories,
  mockPromptPurposes,
  getMockPrompts,
  getMockPrompt,
  createMockPrompt,
  updateMockPrompt,
  deleteMockPrompt,
  isMockPromptCodeDuplicated,
} from '../../data/promptMockData';

const asApiResponse = (data) => ({ success: true, data });

export const promptService = {
  // 프롬프트 목록 조회
  getPrompts: async (params = {}) => {
    if (isPromptMockEnabled) {
      return asApiResponse(getMockPrompts(params));
    }
    const { page = 0, size = 20, isActive, search, category, purpose } = params;
    const queryParams = new URLSearchParams();

    queryParams.append('page', page);
    queryParams.append('size', size);
    if (isActive !== undefined) queryParams.append('isActive', isActive);
    if (category) queryParams.append('category', category);
    if (purpose) queryParams.append('purpose', purpose);
    if (search) queryParams.append('search', search);

    try {
      return await axiosClient.get(`/prompts?${queryParams.toString()}`);
    } catch (error) {
      console.warn('[promptService] 목록 조회 실패, 목 데이터로 대체:', error?.message || error);
      return asApiResponse(getMockPrompts(params));
    }
  },

  // 프롬프트 상세 조회
  getPrompt: async (code) => {
    if (isPromptMockEnabled) {
      return asApiResponse(getMockPrompt(code));
    }
    try {
      return await axiosClient.get(`/prompts/${code}`);
    } catch (error) {
      console.warn('[promptService] 상세 조회 실패, 목 데이터로 대체:', error?.message || error);
      return asApiResponse(getMockPrompt(code));
    }
  },

  // 프롬프트 생성
  createPrompt: async (data) => {
    if (isPromptMockEnabled) {
      return asApiResponse(createMockPrompt(data));
    }
    try {
      return await axiosClient.post('/prompts', data);
    } catch (error) {
      console.warn('[promptService] 생성 실패, 목 데이터로 대체:', error?.message || error);
      return asApiResponse(createMockPrompt(data));
    }
  },

  // 프롬프트 수정
  updatePrompt: async (code, data) => {
    if (isPromptMockEnabled) {
      return asApiResponse(updateMockPrompt(code, data));
    }
    try {
      return await axiosClient.put(`/prompts/${code}`, data);
    } catch (error) {
      console.warn('[promptService] 수정 실패, 목 데이터로 대체:', error?.message || error);
      return asApiResponse(updateMockPrompt(code, data));
    }
  },

  // 프롬프트 삭제
  deletePrompt: async (code) => {
    if (isPromptMockEnabled) {
      return asApiResponse(deleteMockPrompt(code));
    }
    try {
      return await axiosClient.delete(`/prompts/${code}`);
    } catch (error) {
      console.warn('[promptService] 삭제 실패, 목 데이터로 대체:', error?.message || error);
      return asApiResponse(deleteMockPrompt(code));
    }
  },

  // 프롬프트 코드 중복 체크
  checkCode: async (code) => {
    if (isPromptMockEnabled) {
      return asApiResponse({
        code,
        duplicated: isMockPromptCodeDuplicated(code),
      });
    }
    try {
      return await axiosClient.get(`/prompts/check-code/${code}`);
    } catch (error) {
      console.warn('[promptService] 코드 중복 체크 실패, 목 데이터로 대체:', error?.message || error);
      return asApiResponse({
        code,
        duplicated: isMockPromptCodeDuplicated(code),
      });
    }
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
    if (isPromptMockEnabled) {
      return asApiResponse(mockPromptCategories);
    }
    try {
      return await axiosClient.get('/prompts/categories');
    } catch (error) {
      console.warn('[promptService] 카테고리 조회 실패, 목 데이터로 대체:', error?.message || error);
      return asApiResponse(mockPromptCategories);
    }
  },

  // 용도(PURPOSE) 목록 조회
  getPurposes: async () => {
    if (isPromptMockEnabled) {
      return asApiResponse(mockPromptPurposes);
    }
    try {
      return await axiosClient.get('/prompts/purposes');
    } catch (error) {
      console.warn('[promptService] 용도 조회 실패, 목 데이터로 대체:', error?.message || error);
      return asApiResponse(mockPromptPurposes);
    }
  },
};
