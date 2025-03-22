<template>
  <q-page>
    <q-tabs v-model="activeTab" align="left">
      <q-tab name="clientes" label="Clientes" />
      <q-tab name="proveedores" label="Proveedores" />
    </q-tabs>

    <q-tab-panels v-model="activeTab" animated>
      <q-tab-panel name="clientes">
        <ClientesPage />
      </q-tab-panel>

      <q-tab-panel name="proveedores">
        <ProveedoresPage />
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<script>
import ClientesPage from "src/pages/ClientesPage.vue";
import ProveedoresPage from 'src/pages/ProveedoresPage.vue';

export default {
  components: {
    ClientesPage,
    ProveedoresPage
  },
  data() {
    return {
      activeTab: "clientes"
    };
  }
};
</script>
