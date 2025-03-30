<script setup lang="ts">
import FormInput from '@/components/FormInput.vue'

import type { CustomFormData } from '@/composables/FormExam'

defineEmits(['SubmitForm'])

defineProps({
  formName: {
    type: String,
    required: false,
    default: '提交',
  },
  disabled: {
    type: Boolean,
    required: false,
    default: false,
  },
  formData: {
    type: Array<CustomFormData>,
    // type: Array as () => CustomFormData[],
    required: true,
  },
})
</script>

<template>
  <form class="p-24 mx-auto border shadow-2xl" @submit.prevent="$emit('SubmitForm')">
    <FormInput
      v-for="item in formData"
      :key="item.id"
      :id="item.id"
      :label="item.label"
      v-model="item.value"
      :type="item.type || 'text'"
      :autocomplete="item.autocomplete || 'off'"
    />
    <slot></slot>
    <button
      :disabled="disabled"
      class="w-full h-10 bg-[#eb6b26] text-white border-0 text-lg cursor-pointer mt-5 rounded-[20px] flex justify-center items-center hover:bg-[#ff7e3b] disabled:bg-zinc-600"
      type="submit"
    >
      {{ disabled ? '请填写完整信息' : formName }}
    </button>
  </form>
</template>
