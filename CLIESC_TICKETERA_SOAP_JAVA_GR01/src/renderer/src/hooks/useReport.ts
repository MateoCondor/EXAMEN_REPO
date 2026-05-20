import { ReportApi } from '@renderer/api/Report.api'
import { Report } from '@renderer/entities/Report'
import { ReportItemMapper } from '@renderer/mappers/ReportItem.mapper'
import { handleApiRequest } from '@renderer/utils/api.util'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

export function useReport() {
  const queryClient = useQueryClient()
  const [data, setData] = useState<Report | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const getBySoccerGame = async (code: string) => {
    try {
      setError(null)
      setIsPending(true)
      setData(null)

      const response = await queryClient.fetchQuery({
        queryKey: ['report', code],
        queryFn: async () => {
          const { data } = await handleApiRequest(() => ReportApi.getReportBySoccerGame(code))
          const mapper = new ReportItemMapper()
          const items = data.map(mapper.toEntity)
          return new Report(items)
        }
      })

      setData(response)
    } catch (e) {
      if (e instanceof Error) setError(e)
      else setError(new Error('No se pudo obtener el reporte'))
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
