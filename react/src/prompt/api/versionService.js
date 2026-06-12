import { isPromptMockEnabled } from '../../config/promptMock';
import {
  createMockVersion,
  deleteMockVersion,
  getMockVersion,
  getMockVersions,
  publishMockVersion,
  updateMockVersion,
} from '../../data/promptVersionMockData';
import axiosClient from './axiosClient';

const asApiResponse = (data) => ({ success: true, data });

export const versionService = {
  // 버전 목록 조회
  getVersions: async (code, params = {}) => {
    if (isPromptMockEnabled) {
      return asApiResponse(getMockVersions(code));
    }
    const { page, size, status } = params;
    const queryParams = new URLSearchParams();

    if (page !== undefined) queryParams.append('page', page);
    if (size !== undefined) queryParams.append('size', size);
    if (status) queryParams.append('status', status);

    const query = queryParams.toString();
    try {
      return await axiosClient.get(`/prompts/${code}/versions${query ? `?${query}` : ''}`);
    } catch (error) {
      console.warn('[versionService] 버전 목록 실패, 목 데이터로 대체:', error?.message || error);
      return asApiResponse(getMockVersions(code));
    }
  },

  // 버전 상세 조회
  getVersion: async (code, versionId) => {
    if (isPromptMockEnabled) {
      return asApiResponse(getMockVersion(code, versionId));
    }
    try {
      return await axiosClient.get(`/prompts/${code}/versions/${versionId}`);
    } catch (error) {
      console.warn('[versionService] 버전 상세 실패, 목 데이터로 대체:', error?.message || error);
      return asApiResponse(getMockVersion(code, versionId));
    }
  },

  // 버전 생성 (Draft 저장)
  createVersion: async (code, data) => {
    if (isPromptMockEnabled) {
      return asApiResponse(createMockVersion(code, data));
    }
    try {
      return await axiosClient.post(`/prompts/${code}/versions`, data);
    } catch (error) {
      console.warn('[versionService] 버전 생성 실패, 목 데이터로 대체:', error?.message || error);
      return asApiResponse(createMockVersion(code, data));
    }
  },

  // 버전 수정
  updateVersion: async (code, versionId, data) => {
    if (isPromptMockEnabled) {
      return asApiResponse(updateMockVersion(code, versionId, data));
    }
    try {
      return await axiosClient.put(`/prompts/${code}/versions/${versionId}`, data);
    } catch (error) {
      console.warn('[versionService] 버전 수정 실패, 목 데이터로 대체:', error?.message || error);
      return asApiResponse(updateMockVersion(code, versionId, data));
    }
  },

  // 버전 배포
  publishVersion: async (code, versionId, data) => {
    if (isPromptMockEnabled) {
      return asApiResponse(publishMockVersion(code, versionId));
    }
    try {
      return await axiosClient.post(`/prompts/${code}/versions/${versionId}/publish`, data);
    } catch (error) {
      console.warn('[versionService] 버전 배포 실패, 목 데이터로 대체:', error?.message || error);
      return asApiResponse(publishMockVersion(code, versionId));
    }
  },

  // 버전 삭제
  deleteVersion: async (code, versionId) => {
    if (isPromptMockEnabled) {
      return asApiResponse(deleteMockVersion(code, versionId));
    }
    try {
      return await axiosClient.delete(`/prompts/${code}/versions/${versionId}`);
    } catch (error) {
      console.warn('[versionService] 버전 삭제 실패, 목 데이터로 대체:', error?.message || error);
      return asApiResponse(deleteMockVersion(code, versionId));
    }
  },

  // 버전 복사
  copyVersion: async (code, versionId, data) => {
    if (isPromptMockEnabled) {
      const source = getMockVersion(code, versionId);
      if (!source) throw new Error('Version not found');
      return asApiResponse(createMockVersion(code, {
        content: source.content,
        variableSchema: source.variableSchema,
        notes: data?.notes || `버전 ${source.version}에서 복사됨`,
        status: 'draft',
      }));
    }
    return axiosClient.post(`/prompts/${code}/versions/${versionId}/copy`, data);
  },

  // 버전 종합 평가 수정
  updateRating: async (code, versionId, data) => {
    return axiosClient.put(`/prompts/${code}/versions/${versionId}/rating`, data);
  },
};
