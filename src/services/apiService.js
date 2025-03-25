// src/services/apiService.js

import axios from 'axios'
import { Notify } from 'quasar'

// Instancia de Axios con la URL base de tu API Laravel
const apiClient = axios.create({
  //baseURL: 'http://localhost:8094/api', // cambia esto según tu dominio real
  baseURL: 'https://importadosospinacos.lat/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para mostrar errores automáticamente
apiClient.interceptors.response.use(
  response => response,
  error => {
    const message = error.response?.data?.message || 'Error de conexión con el servidor'
    Notify.create({
      type: 'negative',
      message
    })
    return Promise.reject(error)
  }
)

// Métodos genéricos
export default {
  get(resource, params = {}) {
    return apiClient.get(resource, { params })
  },
  post(resource, data) {
    return apiClient.post(resource, data)
  },
  put(resource, data) {
    return apiClient.put(`${resource}/${data.id}`, data)
  },
  delete(resource, id) {
    return apiClient.delete(`${resource}/${id}`)
  }
}
