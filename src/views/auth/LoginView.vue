<script lang="ts" setup>
import { ref, useTemplateRef } from 'vue'

import FormContainer from '@/components/FormContainer.vue'
import type { CustomFormData } from '@/composables/FormExam'
import { useFormExam } from '@/composables/FormExam'

import { login } from '@/api/user/login'
import { ApiBus } from '@/utils/eventEmitter'

const rememberMe = useTemplateRef('rememberMe')

const loginForm = ref<CustomFormData[]>([
  {
    id: 'email',
    value: '',
    label: '邮箱',
    type: 'email',
    autocomplete: 'email',
  },
  {
    id: 'password',
    value: '',
    label: '密码',
    type: 'password',
    autocomplete: 'current-password',
  },
])

const correct = useFormExam(loginForm)

const loginAction = async () => {
  const email = loginForm.value[0].value
  const password = loginForm.value[1].value

  const resp = await login({ email, password })

  ApiBus.emit('API:LOGIN', () => resp)

  if(rememberMe.value?.checked) {
    localStorage.setItem('email', email)
    localStorage.setItem('password', password)
  }
}
</script>

<template>
  <FormContainer
    class="w-1/2 mt-5"
    @submit-form="loginAction"
    :form-data="loginForm"
    :disabled="!correct"
  >
    <input type="checkbox" ref="rememberMe">
      <label for="rememberMe">记住我</label>
      <span class="text-sm text-gray-500">下次自动登录</span>
    </input>
  </FormContainer>
</template>
