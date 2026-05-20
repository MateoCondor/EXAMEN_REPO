import { ImSpinner8 } from 'react-icons/im'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router'
import { useAuth } from '@renderer/hooks/useAuth'

const validationSchema = z.object({
  username: z.string().nonempty('Este campo es obligatorio'),
  password: z.string().nonempty('Este campo es obligatorio')
})

export function LoginPage() {
  const navigate = useNavigate()
  const { login, error: mutationError } = useAuth()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      password: undefined,
      username: undefined
    }
  })

  const onSubmit = (values: z.infer<typeof validationSchema>) => {
    login({
      dto: values
    })

    reset()
    navigate('/soccer-games')
  }

  return (
    <main className="h-dvh text-center content-center">
      <section className="text-center flex flex-col gap-y-8 items-center">
        <header className="flex flex-col gap-y-2 items-center">
          <h1 className="text-3xl font-bold">TicketPremium</h1>
          <p className="text-muted text-sm">Sistema de venta de entradas con SOAP y Java</p>
        </header>

        <form
          className="bg-slate-800 w-fit rounded-md p-6 text-left flex flex-col gap-y-4 min-w-105"
          onSubmit={handleSubmit(onSubmit)}
        >
          <h2 className="text-xl text-center font-semibold">Iniciar Sesión</h2>
          <div className="input-group">
            <label htmlFor="username">Usuario</label>
            <input
              className="input input--primary"
              type="text"
              id="username"
              autoFocus
              {...register('username')}
            />
            {errors.username && <p className="text-error">{errors.username.message}</p>}
          </div>
          <div className="input-group">
            <label htmlFor="password">Contraseña</label>
            <input
              className="input input--primary"
              type="password"
              id="password"
              {...register('password')}
            />
            {errors.password && <p className="text-error">{errors.password.message}</p>}
          </div>
          <div>
            <button type="submit" className="button button--primary w-full" disabled={isSubmitting}>
              {isSubmitting && <ImSpinner8 className="animate-spin" />}
              {isSubmitting ? 'Ingresando...' : 'Ingresar'}
            </button>
          </div>
          {mutationError && <p className="text-error text-center">{mutationError.message}</p>}
        </form>
        <footer>
          <p className="text-muted text-xs">© 2026 EurekaBank • Arquitectura GR01</p>
        </footer>
      </section>
    </main>
  )
}
