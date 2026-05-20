import { PurchaseApi } from '@renderer/api/Purchase.api'
import { PurchaseRequest } from '@renderer/types'
import { handleApiRequest } from '@renderer/utils/api.util'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function usePurchaseMutation() {
  const queryClient = useQueryClient()

  const {
    mutateAsync: create,
    error,
    isPending
  } = useMutation({
    mutationFn: ({ dto }: { dto: PurchaseRequest }) =>
      handleApiRequest(() => PurchaseApi.create(dto)),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ['locations']
      })
  })

  return {
    error,
    isPending,
    create
  }
}
