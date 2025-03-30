import { defineStore } from 'pinia'

import { ref, unref } from 'vue'

import { ApiBus } from '@/utils/eventEmitter'

// 管理token
export const useUserStore = defineStore('user', () => {
  const token = ref<string>('')
  const userInfo = ref<UserInfo>()

  ApiBus.on('TOKEN:GET', (_req, resp) => {
    resp.token = token.value
  })

  ApiBus.on('API:UN_AUTH', () => {
    logout()
  })

  ApiBus.on('API:LOGOUT', () => {
    logout()
  })

  const logout = () => {
    token.value = ''
    userInfo.value = undefined
  }

  const setUser = (user: UserInfo) => {
    const newUser = unref(user)
    userInfo.value = newUser
  }

  return { userInfo, setUser }
})
