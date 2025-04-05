import instance from '../useRequest'

import type { RoomInfo } from './room'

export interface LoginResponse {
  rooms: RoomInfo[]
}

export const getSpareRoom = () => {
  return instance.post<LoginResponse>('/user/rooms')
}
