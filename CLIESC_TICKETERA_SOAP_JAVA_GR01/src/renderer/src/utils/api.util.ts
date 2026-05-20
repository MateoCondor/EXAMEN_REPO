import { ApiErrorResponse } from '@renderer/types'
import { isAxiosError } from 'axios'

function isApiError(error: unknown): error is ApiErrorResponse {
  return error != null && typeof error === 'object' && 'mensaje' in error
}

export async function handleApiRequest<T>(
  request: () => Promise<T>,
  errorMapper?: Record<number, string>
) {
  try {
    return await request()
  } catch (e) {
    let errorMessage = 'Ocurrió un error inesperado'

    if (isAxiosError(e) && e.response?.status) {
      const status = e.response?.status
      const responseData = e.response?.data

      if (status) {
        if (isApiError(responseData)) {
          errorMessage = responseData.mensaje
        } else if (errorMapper && errorMapper[status]) {
          errorMessage = errorMapper[status]
        } else {
          errorMessage = e.message
        }
      } else {
        errorMessage = 'No se pudo conectar con el servidor'
      }
    } else if (e instanceof Error) {
      errorMessage = e.message
    }

    throw new Error(errorMessage)
  }
}
