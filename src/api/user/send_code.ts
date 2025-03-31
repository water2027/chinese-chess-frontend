import instance from '../useRequest'

export interface SendCodeRequest {
  email: string
}

export const sendCode = (req: SendCodeRequest) => {
  return instance.post('/public/send-code', req)
}
