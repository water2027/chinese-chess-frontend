<script lang="ts" setup>
import { ref } from 'vue'

import FormContainer from '@/components/FormContainer.vue'
import type { CustomFormData } from '@/composables/FormExam'
import { useFormExam } from '@/composables/FormExam'

const loginForm = ref<CustomFormData[]>([
  {
    id: 'username',
    value: '',
    label: '用户名',
    autocomplete: 'username'
  },
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
</script>

<template>
  <FormContainer class="w-1/2 mt-5" :form-data="loginForm" :disabled="!correct" />
</template>
