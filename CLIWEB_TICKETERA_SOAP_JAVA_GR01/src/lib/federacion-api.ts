import { Platform } from 'react-native';

export type PartidoAdmin = {
  codigo: string;
  equipoLocal: string;
  equipoVisita: string;
  fecha?: string | number | Date | null;
  lugar: string;
  estadio?: {
    codigo: string;
  };
};

export type Estadio = {
  codigo: string;
  nombre: string;
  ciudad: string;
  capacidad: number;
};

export type LocalidadEstadio = {
  id?: number;
  codigoLocalidad: string;
  disponibilidad: number;
  precio: number;
};

export type FechaPartido = {
  codigoPartido: string;
  fecha?: string | number | Date | null;
};

type RestError = {
  mensaje?: string;
  message?: string;
};

const DEFAULT_API_BASE_URL =
  Platform.OS === 'android'
    ? 'http://192.168.137.5:8080/WS_FEDERACION_SOAP_JAVA_GR01/resources'
    : 'http://localhost:8080/WS_FEDERACION_SOAP_JAVA_GR01/resources';

function getApiBaseUrl() {
  const envUrl = process.env.EXPO_PUBLIC_FEDERACION_API_BASE_URL;
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

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export function getPartidos() {
  return request<PartidoAdmin[]>('partidos');
}

export function getPartido(codigo: string) {
  return request<PartidoAdmin>(`partidos/${encodeURIComponent(codigo)}`);
}

export function createPartido(payload: PartidoAdmin) {
  return request<PartidoAdmin>('partidos', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updatePartido(codigo: string, payload: PartidoAdmin) {
  return request<PartidoAdmin>(`partidos/${encodeURIComponent(codigo)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function deletePartido(codigo: string) {
  return request<void>(`partidos/${encodeURIComponent(codigo)}`, {
    method: 'DELETE',
  });
}

export function getEstadios() {
  return request<Estadio[]>('estadios');
}

export function getEstadio(codigo: string) {
  return request<Estadio>(`estadios/${encodeURIComponent(codigo)}`);
}

export function createEstadio(payload: Estadio) {
  return request<Estadio>('estadios', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateEstadio(codigo: string, payload: Estadio) {
  return request<Estadio>(`estadios/${encodeURIComponent(codigo)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function deleteEstadio(codigo: string) {
  return request<void>(`estadios/${encodeURIComponent(codigo)}`, {
    method: 'DELETE',
  });
}

export function getLocalidadesByEstadio(codigoEstadio: string) {
  return request<LocalidadEstadio[]>(`estadios/${encodeURIComponent(codigoEstadio)}/localidades`);
}

export function createLocalidadByEstadio(codigoEstadio: string, payload: LocalidadEstadio) {
  return request<LocalidadEstadio>(`estadios/${encodeURIComponent(codigoEstadio)}/localidades`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateLocalidadByEstadio(codigoEstadio: string, idLocalidad: number, payload: LocalidadEstadio) {
  return request<LocalidadEstadio>(
    `estadios/${encodeURIComponent(codigoEstadio)}/localidades/${idLocalidad}`,
    {
      method: 'PUT',
      body: JSON.stringify(payload),
    }
  );
}

export function deleteLocalidadByEstadio(codigoEstadio: string, idLocalidad: number) {
  return request<void>(`estadios/${encodeURIComponent(codigoEstadio)}/localidades/${idLocalidad}`, {
    method: 'DELETE',
  });
}

export function getFechasPartidos() {
  return request<FechaPartido[]>('partidos/fechas');
}

export function getFechaPartido(codigoPartido: string) {
  return request<FechaPartido>(`partidos/${encodeURIComponent(codigoPartido)}/fecha`);
}

export function updateFechaPartido(codigoPartido: string, fecha: string) {
  return request<FechaPartido>(`partidos/${encodeURIComponent(codigoPartido)}/fecha`, {
    method: 'PUT',
    body: JSON.stringify({ fecha }),
  });
}

export function deleteFechaPartido(codigoPartido: string) {
  return request<void>(`partidos/${encodeURIComponent(codigoPartido)}/fecha`, {
    method: 'DELETE',
  });
}