import { ReportItem } from './ReportItem'

export class Report {
  public total: number

  constructor(public items: ReportItem[]) {
    this.total = items.reduce((total, item) => total + item.amount, 0)
  }
}
