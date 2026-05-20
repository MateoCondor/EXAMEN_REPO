import { zodResolver } from '@hookform/resolvers/zod'
import { Modal } from '@renderer/components/Modal'
import { SoccerGameCard } from '@renderer/components/SoccerGameCard'
import { SoccerGameSelect } from '@renderer/components/SoccerGameSelect'
import { TitlePage } from '@renderer/components/TitlePage'
import { Purchase } from '@renderer/entities/Purchase'
import { SoccerGame } from '@renderer/entities/SoccerGame'
import { useLocationList } from '@renderer/hooks/useLocationList'
import { usePurchaseMutation } from '@renderer/hooks/usePurchaseMutation'
import { PurchaseMapper } from '@renderer/mappers/Purchase.mapper'
import { applyTax, computeTax, formatMoney, LOCALE_TAX } from '@renderer/utils/money.api'
import { useEffect, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { FaCheck } from 'react-icons/fa'
import { ImSpinner8 } from 'react-icons/im'
import z from 'zod'

const validationSchema = z.object({
  dni: z.string().length(10, 'Ingrese una cédula válida'),
  tickets: z.array(
    z.object({
      code: z.string(),
      availability: z.number().int(),
      price: z.number(),
      quantity: z
        .number('Ingrese una cantidad válida')
        .int()
        .min(0, 'Mínimo 0')
        .max(10, 'Máximo 10 por persona')
    })
  )
})

export function PurchasePage() {
  const [soccerGameSelected, setSoccerGameSelected] = useState<SoccerGame | null>(null)
  const [purchaseCompleted, setPurchaseCompleted] = useState<Purchase | null>(null)
  const { data, getBySoccerGame } = useLocationList()
  const { create, error: mutationError } = usePurchaseMutation()

  const {
    control,
    formState: { errors, isSubmitting },
    register,
    handleSubmit,
    reset
  } = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      dni: undefined,
      tickets: []
    }
  })

  const { fields, replace } = useFieldArray({
    control,
    name: 'tickets'
  })

  const handleSelectChange = (item: SoccerGame | null) => {
    setSoccerGameSelected(item)

    if (item) getBySoccerGame(item.code)
  }

  const onSubmit = async (values: z.infer<typeof validationSchema>) => {
    if (!soccerGameSelected) return

    const validTickets = values.tickets.filter((ticket) => ticket.quantity > 0)

    if (!validTickets.length) return

    try {
      const { data } = await create({
        dto: {
          cedula: values.dni,
          codigoPartido: soccerGameSelected.code,
          lineas: validTickets.map((ticket) => ({
            codigoLocalidad: ticket.code,
            cantidad: ticket.quantity
          }))
        }
      })

      const purchaseMapper = new PurchaseMapper()

      setPurchaseCompleted(purchaseMapper.toEntity(data))
    } finally {
      reset()
      setSoccerGameSelected(null)
    }
  }

  const closeModal = () => {
    setPurchaseCompleted(null)
  }

  useEffect(() => {
    if (!data) return

    replace(
      data.map((item) => ({
        ...item,
        quantity: 0
      }))
    )
  }, [data, replace])

  return (
    <main className="main">
      <TitlePage
        title="Comprar boletos"
        description="Selecciona múltiples localidades y cantidades para una compra."
      />
      <section className="card card--primary space-y-2">
        <h2 className="text-xl font-semibold">Buscar</h2>
        <SoccerGameSelect value={soccerGameSelected} onChange={handleSelectChange} />
      </section>
      {soccerGameSelected && (
        <form className="card card--primary space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <h2 className="text-xl font-semibold">Partido</h2>
          <SoccerGameCard variant="secondary" data={soccerGameSelected} />
          <h2 className="text-xl font-semibold">Localidades</h2>
          <ul className="space-y-2">
            {fields?.map((item, index) => (
              <li
                key={`${item.code}-ticket-card`}
                className="card card--secondary flex justify-between"
              >
                <div className="flex flex-col gap-y-1">
                  <h3 className="font-semibold text-lg">{item.code}</h3>
                  <p className="text-muted text-sm">Disponibles: {item.availability}</p>
                  <p className="text-muted text-sm">Base: {formatMoney(item.price)}</p>
                  <p className="text-muted text-sm">
                    IVA ({LOCALE_TAX * 100}%): {formatMoney(computeTax(item.price))}
                  </p>
                  <p className="font-semibold text-sm">
                    Total: {formatMoney(applyTax(item.price))} c/u
                  </p>
                </div>
                <div>
                  <div className="input-group">
                    <label htmlFor="quantity">Cantidad</label>
                    <input
                      className="input input--secondary w-fit"
                      type="number"
                      id="quantity"
                      {...register(`tickets.${index}.quantity` as const, { valueAsNumber: true })}
                    />
                    {errors.tickets?.[index]?.quantity && (
                      <p className="text-error">{errors.tickets[index].quantity.message}</p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <h2>Información personal</h2>
          <div className="input-group">
            <label htmlFor="dni">Cédula</label>
            <input
              className="input input--primary w-full"
              type="text"
              id="dni"
              placeholder="1733058322"
              {...register('dni')}
            />
            {errors.dni && <p className="text-error">{errors.dni.message}</p>}
          </div>
          <div className="flex justify-end">
            <button
              className="button button--primary flex items-center"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting && <ImSpinner8 className="animate-spin" />}
              {isSubmitting ? 'Comprando...' : 'Comprar'}
            </button>
          </div>
          {mutationError && <p className="text-error text-center">{mutationError.message}</p>}
        </form>
      )}

      <Modal open={!!purchaseCompleted}>
        <section className="w-fit px-8 py-6 bg-slate-800 rounded-md space-y-4 mx-auto text-white">
          <header className="flex flex-col items-center gap-y-1">
            <span className="h-10 w-10 rounded-full bg-sky-950 text-sky-400 content-center">
              <FaCheck className="mx-auto" size={'1.2rem'} />
            </span>
            <h2 className="text-lg font-bold">Compra registrada exitosamente</h2>
          </header>

          <div className="pb-2 border-b border-b-slate-600">
            <p className="text-muted text-sm">Factura: #{purchaseCompleted?.invoiceId}</p>
            <p className="text-muted text-sm">Cédula: {purchaseCompleted?.dni}</p>
            <p className="text-muted text-sm">
              Fecha: {purchaseCompleted?.date.toLocaleDateString()}
            </p>
          </div>

          <footer>
            <p className="text-muted text-sm">
              Subtotal: {formatMoney(purchaseCompleted?.subtotal ?? 0)}
            </p>
            <p className="text-muted text-sm">IVA: {formatMoney(purchaseCompleted?.tax ?? 0)}</p>
            <p className="text-sm font-semibold">
              Total: {formatMoney(purchaseCompleted?.total ?? 0)}
            </p>
          </footer>

          <button className="button button--primary w-full" type="button" onClick={closeModal}>
            Aceptar
          </button>
        </section>
      </Modal>
    </main>
  )
}
