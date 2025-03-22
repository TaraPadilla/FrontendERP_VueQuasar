<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md">
      <!-- Columna Izquierda: Formulario -->
      <div class="col-4">
        <slot name="form"></slot>
      </div>

      <!-- Columna Derecha: Tabla -->
      <div class="col-8">
        <slot name="table"></slot>
      </div>
    </div>
  </q-page>
</template>

<script setup>
</script>

<style scoped>
/* Ajustes básicos para mantener la estructura en desktop */
.row {
  display: flex;
}
.col-4 {
  min-width: 300px;
}
</style>
