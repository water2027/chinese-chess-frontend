<script lang="ts" setup>
import { ref } from 'vue'

import FormContainer from '@/components/FormContainer.vue'
import type { CustomFormData } from '@/composables/FormExam'
import { useFormExam } from '@/composables/FormExam'

import { login } from '@/api/user/login'
import { ApiBus } from '@/utils/eventEmitter'

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
  const password = loginForm.value[0].value

  const resp = await login({ email, password })

  ApiBus.emit('API:LOGIN', () => resp)
}
</script>

<template>
  <FormContainer
    class="w-1/2 mt-5"
    @submit-form="loginAction"
    :form-data="loginForm"
    :disabled="!correct"
  />
</template>
