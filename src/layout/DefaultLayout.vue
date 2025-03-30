<script lang="ts" setup></script>

<template>
  <div class="w-full h-full flex flex-col justify-between items-center bg-gray-100">
    <header class="flex flex-row w-full justify-between items-center p-4 shadow-xl">
      <h1>Chinese Chess</h1>
      <nav>
        <ul class="flex flex-row gap-4 mr-6">
          <router-link to="/">Home</router-link>
          <router-link to="/about">About</router-link>
          <router-link to="/room">Room</router-link>
        </ul>
      </nav>
    </header>
    <RouterView />
  </div>
</template>
