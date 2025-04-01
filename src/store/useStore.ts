import { defineStore } from 'pinia'

import { computed, ref, unref } from 'vue'

import { ApiBus } from '@/utils/eventEmitter'

// 管理token
export const useUserStore = defineStore('user', () => {
  const t = ref<string>('')
  const userInfo = ref<UserInfo>()

  const token = computed(()=>{
    if (t.value) {
      return t.value
    }
    ApiBus.emit('API:UN_AUTH')
    return ''
  })

  const logout = () => {
    t.value = ''
    userInfo.value = undefined
  }

  const setToken = (newToken: string) => {
    const tokenValue = unref(newToken)
    t.value = tokenValue
  }

  const setUser = (user: UserInfo) => {
    const newUser = unref(user)
    userInfo.value = newUser
  }

  ApiBus.on('API:LOGIN', (req) => {
    const { token: newToken, name, avatar, exp } = req()
    setToken(newToken)
    setUser({ name, avatar, exp })
  })

  ApiBus.on('API:UN_AUTH', () => {
    logout()
  })

  ApiBus.on('API:LOGOUT', () => {
    logout()
  })

  return { token, userInfo }
})
