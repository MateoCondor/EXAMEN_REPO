interface Props {
  children?: React.ReactNode
  open?: boolean
}

export function Modal({ children, open }: Props) {
  return (
    <dialog className="modal" open={open}>
      {children}
    </dialog>
  )
}
