import { InvoiceItem } from './InvoiceItem'

export class Invoice {
  constructor(
    public id: number,
    public date: Date,
    public dni: string,
    public total: number,
    public items: InvoiceItem[]
  ) {}
}
