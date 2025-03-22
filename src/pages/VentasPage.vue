<template>
  <q-page>
    <q-tabs v-model="activeTab" align="left" class="q-mb-md">
      <q-tab name="registro" label="Registrar Venta" />
      <q-tab name="historial" label="Historial de Ventas" />
    </q-tabs>

    <q-tab-panels v-model="activeTab" animated>
      <q-tab-panel name="registro">
        <RegistroVenta />
      </q-tab-panel>

      <q-tab-panel name="historial">
        <HistorialVentas />
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<script>
import HistorialVentas from 'src/pages/HistoricoVentasPage.vue';
import RegistroVenta from 'src/pages/RegistroVentaPage.vue';

export default {
  components: {
    RegistroVenta,
    HistorialVentas
  },
  data() {
    return {
      activeTab: "registro"
    };
  }
};
</script>
