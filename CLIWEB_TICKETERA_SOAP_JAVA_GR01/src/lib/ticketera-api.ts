import { Platform } from 'react-native';

export type Partido = {
  codigo: string;
  equipoLocal: string;
  equipoVisita: string;
  fecha: string | number | Date;
  lugar: string;
};

export type Localidad = {
  codigoLocalidad: string;
  capacidad: number;
  disponibilidad: number;
  precio: number;
};

export type ReporteItem = {
  codigoLocalidad: string;
  cantidadVendida: number;
  totalRecaudado: number;
};

export interface AsientoCompra {
  seccion: string;
  numeroAsiento: string;
  nombreAsistente: string;
}

export interface LineaCompra {
  codigoPartido: string;
  codigoLocalidad: string;
  asientos: AsientoCompra[];
}

export interface CompraRequest {
  cedula: string;
  formaPago: 'EFECTIVO' | 'CREDITO';
  plazo?: number;
  lineas: LineaCompra[];
}

export type CompraResponse = {
  idFactura: number;
  fecha: string | number | Date;
  subtotal: number;
  iva: number;
  descuento: number;
  total: number;
  formaPago: string;
  cedula: string;
};

type RestError = {
  mensaje?: string;
  message?: string;
};

const DEFAULT_API_BASE_URL =
  Platform.OS === 'android'
    ? 'http://192.168.137.5:8080/WS_TICKETERA_SOAP_JAVA_GR01/api'
    : 'http://localhost:8080/WS_TICKETERA_SOAP_JAVA_GR01/api';

const COREBANCARIO_BASE_URL =
  Platform.OS === 'android'
    ? 'http://192.168.137.5:8080/WS_COREBANCARIO_SOAP_JAVA_GR01/resources'
    : 'http://localhost:8080/WS_COREBANCARIO_SOAP_JAVA_GR01/resources';

function getApiBaseUrl() {
  const envUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  const base = envUrl && envUrl.trim().length > 0 ? envUrl.trim() : DEFAULT_API_BASE_URL;
  return base.replace(/\/+$/, '');
}

async function request<T>(path: string, options: RequestInit = {}) {
  const response = await fetch(`${getApiBaseUrl()}/${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    let message = `HTTP ${response.status}`;
    try {
      const data = (await response.json()) as RestError;
      message = data?.mensaje ?? data?.message ?? message;
    } catch {
      // ignore json parsing errors
    }
    throw new Error(message);
  }

  return (await response.json()) as T;
}

export function getPartidos() {
  return request<Partido[]>('partidos');
}

export function getLocalidades(codigoPartido: string) {
  return request<Localidad[]>(`localidades/${encodeURIComponent(codigoPartido)}`);
}

export function comprarBoletos(payload: CompraRequest) {
  return request<CompraResponse>('comprar', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getReporte(codigoPartido: string) {
  return request<ReporteItem[]>(`reporte/${encodeURIComponent(codigoPartido)}`);
}

export type BoletoOcupado = {
  seccion: string;
  numeroAsiento: string;
  nombreAsistente: string;
  facturaId: number;
  cedulaCliente: string;
};

export function getBoletosOcupados(codigoPartido: string, codigoLocalidad: string) {
  return request<BoletoOcupado[]>(`boletos/ocupados?codigoPartido=${encodeURIComponent(codigoPartido)}&codigoLocalidad=${encodeURIComponent(codigoLocalidad)}`);
}

export type FacturaLinea = {
  codigoPartido: string;
  codigoLocalidad: string;
  cantidad: number;
  total: number;
};

export type Factura = {
  idFactura: number;
  fecha: string | number | Date;
  total: number;
  cedula: string;
  lineas: FacturaLinea[];
};

export type Cliente = {
  cedula: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  correo?: string;
};

export function getFacturasPorPartido(codigoPartido: string) {
  return request<Factura[]>(`reporte/${encodeURIComponent(codigoPartido)}/facturas`);
}

export function getClientes() {
  return request<Cliente[]>('clientes');
}

export function getCliente(cedula: string) {
  return request<Cliente>(`clientes/${encodeURIComponent(cedula)}`);
}

export function createCliente(payload: Cliente) {
  return request<Cliente>('clientes', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateCliente(cedula: string, payload: Cliente) {
  return request<Cliente>(`clientes/${encodeURIComponent(cedula)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function deleteCliente(cedula: string) {
  return request<void>(`clientes/${encodeURIComponent(cedula)}`, {
    method: 'DELETE',
  });
}

// --- Auth ---

export type LoginRequest = {
  username: string;
  password: string;
};

export type LoginResponse = {
  username: string;
  rol: string;
  cedula: string | null;
};

export type RegistroRequest = {
  username: string;
  password: string;
  cedula: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  correo?: string;
};

export function loginUser(payload: LoginRequest) {
  return request<LoginResponse>('auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function registrarCliente(payload: RegistroRequest) {
  return request<LoginResponse>('auth/registro', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getFacturasCliente(cedula: string) {
  return request<Factura[]>(`reporte/cliente/${encodeURIComponent(cedula)}`);
}

// --- Core Bancario ---

export type AmortizacionRow = {
  numeroCuota: number;
  valorCuota: number;
  interes: number;
  capital: number;
  saldo: number;
};

export async function getAmortizacion(cedula: string): Promise<AmortizacionRow[]> {
  const url = `${COREBANCARIO_BASE_URL}/credito/amortizacion/${encodeURIComponent(cedula)}`;
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`Error al obtener tabla de amortización: HTTP ${response.status}`);
  }
  return (await response.json()) as AmortizacionRow[];
}

export async function simularAmortizacion(monto: number, plazo: number): Promise<AmortizacionRow[]> {
  const url = `${COREBANCARIO_BASE_URL}/credito/simular`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ monto, plazo }),
  });
  if (!response.ok) {
    throw new Error(`Error al simular tabla de amortización: HTTP ${response.status}`);
  }
  return (await response.json()) as AmortizacionRow[];
}
