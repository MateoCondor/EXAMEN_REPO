export interface Mapper<DTO, Entity> {
  toEntity: (dto: DTO) => Entity
}

export interface ApiErrorResponse {
  mensaje: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface SoccerGameResponse {
  codigo: string
  equipoLocal: string
  equipoVisita: string
  fecha: string
  lugar: string
}

export interface LocationResponse {
  codigoLocalidad: string
  disponibilidad: int
  precio: double
}

export interface ReportItemResponse {
  codigoLocalidad: string
  cantidadVendida: number
  totalRecaudado: number
}

export interface InvoiceItemResponse {
  codigoLocalidad: string
  cantidad: number
  total: number
}

export interface InvoiceResponse {
  idFactura: number
  fecha: string
  total: double
  cedula: string
  lineas: InvoiceItemResponse[]
}

export interface PurchaseItemRequest {
  codigoLocalidad: string
  cantidad: number
}

export interface PurchaseRequest {
  codigoPartido: string
  cedula: string
  lineas: PurchaseItemRequest[]
}

export interface PurchaseResponse {
  idFactura: number
  fecha: string
  subtotal: number
  iva: number
  total: number
  cedula: string
}
