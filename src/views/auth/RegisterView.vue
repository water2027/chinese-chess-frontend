<script lang="ts" setup>
import { computed, ref } from 'vue'

import FormContainer from '@/components/FormContainer.vue'
import type { CustomFormData } from '@/composables/FormExam'
import { useFormExam } from '@/composables/FormExam'

import { register } from '@/api/user/register'
import { sendCode } from '@/api/user/send_code'

import { useUserStore } from '@/store/useStore'
const { setToken, setUser } = useUserStore()

const registerForm = ref<CustomFormData[]>([
  {
    id: 'username',
    value: '',
    label: '用户名',
    autocomplete: 'username',
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
    autocomplete: 'new-password',
  },
  {
    id: 'password2',
    value: '',
    label: '确认密码',
    type: 'password',
  },
  {
    id: 'v_code',
    value: '',
    label: '验证码',
  },
])

const emailIsCorrect = computed(() => {
  const email = registerForm.value[1].value
  const reg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return reg.test(email)
})

const correct = useFormExam(registerForm)

const sendCodeAction = async () => {
  const email = registerForm.value[1].value
  if (!emailIsCorrect.value) {
    return
  }
  await sendCode({ email })
}

const registerAction = async () => {
  const name = registerForm.value[0].value
  const email = registerForm.value[1].value
  const password = registerForm.value[2].value
  const password2 = registerForm.value[3].value
  const vcode = registerForm.value[4].value

  if (!correct.value) {
    return
  }

  const resp = await register({ name, email, password, password2, vcode })
  const { token, name:newName, exp, avatar } = resp

  setToken(token)
  setUser({ name: newName, exp, avatar })
}
</script>

<template>
  <FormContainer
    class="w-1/2 mt-5"
    @submit-form="registerAction"
    :form-data="registerForm"
    :disabled="!correct"
  >
    <button
      type="button"
      @click.prevent="sendCodeAction"
      :disabled="!emailIsCorrect"
      class="w-full h-10 bg-[#eb6b26] text-white border-0 text-lg cursor-pointer mt-5 rounded-[20px] flex justify-center items-center hover:bg-[#ff7e3b] disabled:bg-zinc-600"
    >
      {{ emailIsCorrect ? '发送验证码' : '请填写正确邮箱' }}
    </button>
  </FormContainer>
</template>
