<script lang="ts" setup>
import { ref } from 'vue'

import FormContainer from '@/components/FormContainer.vue'
import type { CustomFormData } from '@/composables/FormExam'
import { useFormExam } from '@/composables/FormExam'

const registerForm = ref<CustomFormData[]>([
  {
    id: 'username',
    value: '',
    label: '用户名',
    type: 'username',
    autocomplete: 'username'
  },
  {
    id: 'email',
    value: '',
    label: '邮箱',
    autocomplete: 'email',
  },
  {
    id: 'password',
    value: '',
    label: '密码',
    autocomplete: 'new-password',
  },
  {
    id: 'password2',
    value: '',
    label: '确认密码',
  },
  {
    id: 'v_code',
    value: '',
    label: '验证码',
  },
])

const correct = useFormExam(registerForm);
</script>

<template>
  <FormContainer class="w-1/2 mt-5" :form-data="registerForm" :disabled="!correct" />
</template>
