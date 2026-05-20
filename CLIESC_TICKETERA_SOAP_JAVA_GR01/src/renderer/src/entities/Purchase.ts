export class Purchase {
  constructor(
    public invoiceId: number,
    public dni: number,
    public date: Date,
    public subtotal: number,
    public tax: number,
    public total: number
  ) {}
}
