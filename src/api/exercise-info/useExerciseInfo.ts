import { useGetExerciseInfoQuery, usePostExerciseInfoMutation } from "./queries";

export const useGetExerciseInfo = () => {
  const query = useGetExerciseInfoQuery();

  return {
    ...query,
    data: query.data?.data,
  };
};

export const usePostExerciseInfo = () => {
  const mutation = usePostExerciseInfoMutation();

  return {
    ...mutation,
    postExerciseInfo: mutation.mutate,
  };
};
