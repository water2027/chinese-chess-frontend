import axios, { type AxiosRequestConfig } from 'axios'

import { ApiBus } from '@/utils/eventEmitter'
import { useUserStore } from '@/store/useStore'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

interface Response<T = any> {
  code: number
  message: string
  data: T
}

type ErrorHandler = (resp?: Response) => void

axios.interceptors.request.use((config) => {
  const { url } = config
  if (!url || !url.startsWith('/public')) {
    // 登录接口
    return config
  }
  // 获取token操作
  const { token } = useUserStore()
  config.headers.Authorization = `Bearer ${token}`
  return config
})

const errorCodeHandler: Record<number, ErrorHandler> = {
  // - token无效或没有token 1 (前端需要重新登录)
  1: () => {
    ApiBus.emit('API:UN_AUTH')
  },
}

const httpCodeHandler: Record<number, ErrorHandler> = {
  404: () => {
    ApiBus.emit('API:NOT_FOUND')
  },
  500: () => {},
}

axios.interceptors.response.use(
  (resp) => {
    const { code, data, message } = resp.data as Response
    if (code !== 0) {
      // 业务错误处理
      errorCodeHandler[code]?.(data)
      return Promise.reject(message)
    }
    return data
  },
  (error) => {
    const { status } = error
    httpCodeHandler[status]?.()
    return Promise.reject(error)
  },
)

const instance = axios.create({
  baseURL: API_URL,
  timeout: 5000,
})

const request = async <T>(config: AxiosRequestConfig): Promise<T> => {
  const resp = await instance.request<Response<T>>(config)
  const { code, data, message } = resp.data as Response
  if (code < 100) {
    // 业务错误处理
    errorCodeHandler[code]?.(data)
    return Promise.reject(message)
  }
  return data
}

const RequestHandler = {
  get: <T>(url: string, params?: Record<string, any>) => {
    return request<T>({ url, method: 'get', params })
  },
  post: <T>(url: string, data?: Record<string, any>) => {
    return request<T>({ url, method: 'post', data })
  },
  put: <T>(url: string, data?: Record<string, any>) => {
    return request<T>({ url, method: 'put', data })
  },
  delete: <T>(url: string, data?: Record<string, any>) => {
    return request<T>({ url, method: 'delete', data })
  },
}

export default RequestHandler
