import { LoginRequest } from '@renderer/types'
import { useState } from 'react'
import { useNavigate } from 'react-router'

const authUsername = 'MONSTER'
const authPassword = 'MONSTER9'

export function useAuth() {
  const navigate = useNavigate()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const login = ({ dto }: { dto: LoginRequest }) => {
    try {
      setIsPending(true)

      if (dto.username.trim() !== authUsername || dto.password.trim() !== authPassword)
        throw new Error('Credeciales invalidas')
    } catch (e) {
      if (e instanceof Error) setError(new Error(e.message))
      else setError(new Error('No se puede ingresar al sistema. Intente más tarde.'))
    } finally {
      setIsPending(false)
    }
  }

  const logout = () => {
    navigate('/')
  }

  return {
    isPending,
    error,
    login,
    logout
  }
}
