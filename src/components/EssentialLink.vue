<template>
  <!-- Enlace interno con Vue Router -->
  <q-item v-if="to" clickable v-ripple tag="router-link" :to="to" active-class="active-link">
    <q-item-section avatar>
      <q-icon :name="icon" />
    </q-item-section>
    <q-item-section>
      <q-item-label>{{ title }}</q-item-label>
      <q-item-label caption>{{ caption }}</q-item-label>
    </q-item-section>
  </q-item>

  <!-- Enlace externo con <a>, abre en una nueva pestaña -->
  <q-item v-else clickable v-ripple tag="a" :href="link" target="_blank">
    <q-item-section avatar>
      <q-icon :name="icon" />
    </q-item-section>
    <q-item-section>
      <q-item-label>{{ title }}</q-item-label>
      <q-item-label caption>{{ caption }}</q-item-label>
    </q-item-section>
  </q-item>
</template>

<script setup>
defineProps({
  title: String,
  caption: String,
  icon: String,
  to: String,   // Para rutas internas (Vue Router)
  link: String  // Para enlaces externos
});
</script>
<style scoped>
.active-link {
  background-color: rgba(0, 0, 0, 0.1); /* Color de fondo cuando está seleccionado */
  border-radius: 8px;
}
</style>

