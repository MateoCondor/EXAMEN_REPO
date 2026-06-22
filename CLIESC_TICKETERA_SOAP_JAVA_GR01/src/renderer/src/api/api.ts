import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL ?? 'http://10.40.89.197:8080/WS_TICKETERA_SOAP_JAVA_GR01/api'
})
