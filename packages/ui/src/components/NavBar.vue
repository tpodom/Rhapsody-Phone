<template>
  <v-app-bar app>
    <v-toolbar-title class="d-flex flex-row flex-grow-1">
      <v-img
        class="logo flex-grow-0 mr-3"
        src="/logo.png"
        max-height="40"
        contain
        width="auto"
        height="40"
        min-width="56"
      />
      <router-view name="nav-content" />
    </v-toolbar-title>
    <router-view name="nav-actions" />
  </v-app-bar>
</template>
<style lang="scss" scoped>
.logo {
  min-height: 40px;
  :deep(.v-img__img) {
    width: auto;
  }
}
:deep(.v-toolbar-title__placeholder) {
  display: flex;
  flex-direction: row;
  flex: 1 1 auto;
  align-items: center;
}
</style>
