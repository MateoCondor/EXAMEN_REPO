import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL ?? 'http://localhost:8080/WS_TICKETERA_SOAP_JAVA_GR01/api'
})
