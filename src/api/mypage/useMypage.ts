import { useProfileQuery, useUpdateProfileQuery } from "./queries";

export const useMypage = () => {
  const query = useProfileQuery();

  return {
    ...query,
    data: query.data,
  };
};

export const useUpdateProfile = () => {
  const mutation = useUpdateProfileQuery();

  return {
    ...mutation,
    updateProfile: mutation.mutate,
  };
};