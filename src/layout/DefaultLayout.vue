<script lang="ts" setup></script>

<style scoped>
.router_link{
  font-size: larger;
  padding: 5px 10px;
  background-color: #e0e0e0;
  border-radius: 8px;
}
.router_link:hover{
  background-color: #b1aeae;
}
</style>

<template>
  <div class="w-full h-full flex flex-col justify-between items-center">
    <header class="flex flex-row w-full justify-between items-center p-4 shadow-xl">
      <h1 class="w-fit">ChineseChess</h1>
      <nav class="w-fit hidden sm:block">
        <ul class="flex flex-row gap-4 mr-6">
          <router-link to="/" class="router_link">Home</router-link>
          <router-link to="/about" class="router_link">About</router-link>
          <router-link to="/room" class="router_link">Room</router-link>
        </ul>
      </nav>
    </header>
    <RouterView />
  </div>
</template>
