<script lang="ts" setup>
import { Icon } from '@iconify/vue/dist/iconify.js'
import { useUserStore } from '@/store/useStore';

const { userInfo } = useUserStore();
</script>

<template>
  <div class="w-full h-full flex flex-col justify-between items-center">
    <header class="flex flex-row w-full justify-between items-center p-4 shadow-2xl">
      <h1 class="w-fit">ChineseChess</h1>
      <nav class="w-fit hidden sm:block">
        <ul class="flex flex-row gap-4 mr-6">
          <router-link to="/" class="text-xl p-4 rounded-lg bg-[#e0e0e0]" hover="bg-[#b1aeae]"
            >首页</router-link
          >
          <router-link to="/about" class="text-xl p-4 rounded-lg bg-[#e0e0e0]" hover="bg-[#b1aeae]"
            >关于</router-link
          >
          <router-link to="/room" class="text-xl p-4 rounded-lg bg-[#e0e0e0]" hover="bg-[#b1aeae]"
            >大厅</router-link
          >
          <a href="javascript:;"
            v-if="userInfo"
            class="text-xl p-4 rounded-lg bg-[#e0e0e0]"
            hover="bg-[#b1aeae]"
            >{{ userInfo.name }}</a
          >
          <RouterLink
            v-else
            to="/auth/login"
            class="text-xl p-4 rounded-lg bg-[#e0e0e0]"
            hover="bg-[#b1aeae]"
            >登录</RouterLink
          >
        </ul>
      </nav>
      <nav class="group sm:hidden relative">
        <Icon width="25" height="25" icon="ion:navicon-round" />
        <div
          class="hidden absolute flex-col -translate-x-3/5 bg-white shadow-lg rounded-lg p-4 gap-2 z-10"
          group-focus="flex"
          group-hover="flex"
        >
          <router-link to="/" class="text-xl p-4 rounded-lg bg-[#e0e0e0]" hover="bg-[#b1aeae]"
            >首页</router-link
          >
          <router-link to="/about" class="text-xl p-4 rounded-lg bg-[#e0e0e0]" hover="bg-[#b1aeae]"
            >关于</router-link
          >
          <router-link to="/room" class="text-xl p-4 rounded-lg bg-[#e0e0e0]" hover="bg-[#b1aeae]"
            >大厅</router-link
          >
          <a href="javascript:;"
            v-if="userInfo"
            class="text-xl p-4 rounded-lg bg-[#e0e0e0]"
            hover="bg-[#b1aeae]"
            >{{ userInfo.name }}</a
          >
          <RouterLink
            v-else
            to="/auth/login"
            class="text-xl p-4 rounded-lg bg-[#e0e0e0]"
            hover="bg-[#b1aeae]"
            >登录</RouterLink
          >
        </div>
      </nav>
    </header>
    <RouterView />
  </div>
</template>
