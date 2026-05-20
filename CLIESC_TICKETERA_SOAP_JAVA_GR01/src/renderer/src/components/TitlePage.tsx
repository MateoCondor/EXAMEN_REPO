interface Props {
  title: string
  description: string
}

export function TitlePage({ title, description }: Props) {
  return (
    <section className="flex flex-col gap-y-4">
      <h1 className="text-5xl font-bold text-sky-100 uppercase">{title}</h1>
      <p className="text-muted">{description}</p>
    </section>
  )
}
