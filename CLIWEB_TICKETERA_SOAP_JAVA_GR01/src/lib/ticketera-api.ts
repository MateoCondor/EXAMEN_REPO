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
  disponibilidad: number;
  precio: number;
};

export type ReporteItem = {
  codigoLocalidad: string;
  cantidadVendida: number;
  totalRecaudado: number;
};

export type CompraRequest = {
  codigoPartido: string;
  codigoLocalidad: string;
  cantidad: number;
};

export type CompraResponse = {
  idFactura: number;
  fecha: string | number | Date;
  subtotal: number;
  iva: number;
  total: number;
};

type RestError = {
  mensaje?: string;
  message?: string;
};

const DEFAULT_API_BASE_URL =
  Platform.OS === 'android'
    ? 'http://192.168.137.13:8080/WS_TICKETERA_SOAP_JAVA_GR01/api'
    : 'http://localhost:8080/WS_TICKETERA_SOAP_JAVA_GR01/api';

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
