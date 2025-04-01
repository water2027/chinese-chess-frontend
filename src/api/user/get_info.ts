import instance from '../useRequest'

export interface GetInfoRequest {
  id: number
}

export interface GetInfoResponse {
  id: number
  name: string
}

export const login = (req: GetInfoRequest) => {
  return instance.post<GetInfoResponse>('/public/login', req)
}
