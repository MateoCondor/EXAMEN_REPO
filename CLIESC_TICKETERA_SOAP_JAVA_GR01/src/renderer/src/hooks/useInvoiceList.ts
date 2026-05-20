import { ReportApi } from '@renderer/api/Report.api'
import { Invoice } from '@renderer/entities/Invoice'
import { InvoiceMapper } from '@renderer/mappers/Invoice.mapper'
import { handleApiRequest } from '@renderer/utils/api.util'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

export function useInvoiceList() {
  const queryClient = useQueryClient()
  const [data, setData] = useState<Invoice[] | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const getBySoccerGame = async (code: string) => {
    try {
      setError(null)
      setIsPending(true)
      setData(null)

      const response = await queryClient.fetchQuery({
        queryKey: ['invoices', code],
        queryFn: async () => {
          const { data } = await handleApiRequest(() => ReportApi.getInvoicesBySoccerGame(code))
          const mapper = new InvoiceMapper()
          return data.map(mapper.toEntity)
        }
      })

      setData(response)
    } catch (e) {
      if (e instanceof Error) setError(e)
      else setError(new Error('No se pudo obtener las facturas'))
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
