import { LocationApi } from '@renderer/api/Location.api'
import { Location } from '@renderer/entities/Location'
import { LocationMapper } from '@renderer/mappers/Location.mapper'
import { handleApiRequest } from '@renderer/utils/api.util'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

export function useLocationList() {
  const queryClient = useQueryClient()
  const [data, setData] = useState<Location[] | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const getBySoccerGame = async (code: string) => {
    try {
      setError(null)
      setIsPending(true)
      setData(null)

      const response = await queryClient.fetchQuery({
        queryKey: ['locations', code],
        queryFn: async () => {
          const { data } = await handleApiRequest(() => LocationApi.getBySoccerGame(code))
          const mapper = new LocationMapper()
          return data.map(mapper.toEntity)
        }
      })

      setData(response)
    } catch (e) {
      if (e instanceof Error) setError(e)
      else setError(new Error('No se pudo obtener las localidades'))
    } finally {
      setIsPending(false)
    }
  }

  return {
    data,
    isPending,
    error,
    getBySoccerGame
  }
}
