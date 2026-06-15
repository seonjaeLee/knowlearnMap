import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';
import { getMockSnapshots } from '../../data/snapshotMockData';

// 스냅샷 목록 조회
export const useSnapshots = (code, params = {}) => {
  return useQuery({
    queryKey: ['snapshots', code, params],
    queryFn: async () => {
      try {
        const response = await axiosClient.get(`/prompts/${code}/all-snapshots`, { params });
        if (response && response.data) {
          return response.data;
        }
        return { content: [], totalElements: 0 };
      } catch {
        // API 미연결 환경 — 더미 데이터로 fallback
        return getMockSnapshots(code, params);
      }
    },
    enabled: !!code,
    retry: false,
  });
};

// 만족도 업데이트
export const useUpdateSatisfaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ snapshotId, satisfaction }) => {
      const { data } = await axiosClient.put(`/prompts/snapshots/${snapshotId}/satisfaction`, {
        satisfaction,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['snapshots']);
    },
  });
};

// 스냅샷 삭제
export const useDeleteSnapshot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (snapshotId) => {
      const { data } = await axiosClient.delete(`/prompts/snapshots/${snapshotId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['snapshots']);
    },
  });
};
