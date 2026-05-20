export class InvoiceItem {
  constructor(
    public locationCode: string,
    public quantity: number,
    public total: number
  ) {}
}
