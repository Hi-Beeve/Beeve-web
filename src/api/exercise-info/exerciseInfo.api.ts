import instance from '@/api/instance';
import { ExerciseInfoRequest, ExerciseInfoPostResponse, ExerciseInfoGetResponse } from '@/types/exerciseInfo';

export const getExerciseInfoApi = async (): Promise<ExerciseInfoGetResponse> => {
  const response = await instance.get<ExerciseInfoGetResponse>('/fitness/exercise-info');
  return response.data;
};

export const postExerciseInfoApi = async (params: ExerciseInfoRequest): Promise<ExerciseInfoPostResponse> => {
  const response = await instance.post<ExerciseInfoPostResponse>('/fitness/exercise-info', params);
  return response.data;
};
