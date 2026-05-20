import { SoccerGameApi } from '@renderer/api/SoccerGame.api'
import { SoccerGameMapper } from '@renderer/mappers/SoccerGame.mapper'
import { handleApiRequest } from '@renderer/utils/api.util'
import { useQuery } from '@tanstack/react-query'

export function useSoccerGameList() {
  const { data, isPending, error } = useQuery({
    queryKey: ['soccer-games'],
    queryFn: async () => {
      const { data } = await handleApiRequest(() => SoccerGameApi.getAll())
      const mapper = new SoccerGameMapper()
      return data.map(mapper.toEntity)
    },
    refetchOnWindowFocus: false
  })

  return {
    data,
    error,
    isPending
  }
}
