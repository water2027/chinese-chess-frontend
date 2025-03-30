import axios from 'axios'

import { ApiBus } from '@/utils/eventEmitter'

interface Response {
  code: number
  message: string
  data: any
}

type ErrorHandler = (resp?: Response) => void

axios.interceptors.request.use((config) => {
  const { url } = config
  if (!url || !url.startsWith('/public')) {
    // 登录接口
    return config
  }
  // 获取token操作
  const resp: Record<'token', string> = { token: '' }
  ApiBus.emit('TOKEN:GET', undefined, resp)
  const { token } = resp
  if (!token) {
    ApiBus.emit('API:UN_AUTH')
    return config
  }
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
  baseURL: 'http://localhost:3000/api',
  timeout: 5000,
})

export default instance
