import { useMutation, useQueryClient } from '@tanstack/react-query'
import { removeAttendance } from '../api/attendance'

type RemoveVars = {
  id: string
  userId?: string
  activityId?: string
}

export const useRemoveAttendance = () => {
  const queryClient = useQueryClient()

  const mutation = useMutation<void, unknown, RemoveVars>({
    mutationFn: ({ id }) => removeAttendance(id),
    onSuccess: (_, variables) => {
      const { userId, activityId } = variables

      if (userId) {
        queryClient.invalidateQueries({
          queryKey: ['attendance', 'byUser', userId],
        })
      }

      if (activityId) {
        queryClient.invalidateQueries({
          queryKey: ['attendance', 'activity', activityId],
        })
      }
    },
  })

  return mutation
}
