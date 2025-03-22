<template>
  <q-page class="q-pa-md">
    <CrudLayout>
      <!-- Columna izquierda: Formulario -->
      <template #form>
        <q-card class="q-pa-md">
          <q-card-section>
            <q-form>
              <q-card-actions align="right">
                <q-btn label="Nuevo" color="primary" @click="nuevoRegistro" />
                <q-btn label="Editar" color="secondary" @click="editarRegistro" :disable="!registroSeleccionado" />
                <q-btn label="Guardar" color="positive" @click="guardarRegistro" :disable="!puedeGuardar" />
                <q-btn label="Eliminar" color="negative" @click="eliminarRegistro" :disable="!registroSeleccionado" />
              </q-card-actions>

              <q-input v-model="proveedor.nombre" label="Nombre" :disable="!modoEdicion"/>
              <q-input v-model="proveedor.telefono" label="Teléfono" :disable="!modoEdicion"/>
              <q-input v-model="proveedor.correo" label="Correo" :disable="!modoEdicion"/>
              <q-input v-model="proveedor.direccion.nomenclatura" label="Dirección - Nomenclatura" :disable="!modoEdicion"/>
              <q-input v-model="proveedor.direccion.vereda" label="Vereda" :disable="!modoEdicion"/>
              <q-input v-model="proveedor.direccion.finca" label="Finca" :disable="!modoEdicion"/>
              <q-input v-model="proveedor.direccion.municipio" label="Municipio" :disable="!modoEdicion"/>
              <q-input v-model="proveedor.direccion.departamento" label="Departamento" :disable="!modoEdicion"/>
            </q-form>
          </q-card-section>
        </q-card>
      </template>

      <template #table>
        <q-table
          flat
          bordered
          title="Proveedores"
          :rows="proveedores"
          :columns="columns"
          row-key="id"
          @row-click="seleccionarRegistro"
        />
      </template>
    </CrudLayout>
  </q-page>
</template>

<script setup>
import CrudLayout from "src/layouts/CrudLayout.vue";
import { reglasProveedor, validarCampos } from "src/services/validationService";
import terceros from "src/terceros.json";
import { computed, onMounted, reactive, ref } from "vue";


const proveedor = reactive({
  id: null,
  nombre: "",
  telefono: "",
  correo: "",
  direccion: {
    nomenclatura: "",
    vereda: "",
    finca: "",
    municipio: "",
    departamento: ""
  }
});

const proveedores = ref([]);
const registroSeleccionado = ref(false);
const modoEdicion = ref(false);
const errores = ref({});

// Columnas de la tabla
const columns = [
  { name: "nombre", label: "Nombre", field: "nombre", align: "left" },
  { name: "telefono", label: "Teléfono", field: "telefono", align: "left" },
  { name: "correo", label: "Correo", field: "correo", align: "left" },
  { name: "direccion", label: "Dirección", field: row => row.direccion.nomenclatura, align: "left" }
];

// Computed para habilitar el botón "Guardar"
const puedeGuardar = computed(() => {
  return modoEdicion.value && Object.keys(validarCampos(proveedor, reglasProveedor)).length === 0;
});

// Carga inicial
onMounted(() => {
  proveedores.value = terceros.proveedores;
});

// Función para seleccionar un registro desde la tabla
const seleccionarRegistro = (evt, row) => {
  Object.assign(proveedor, row);
  registroSeleccionado.value = true;
  modoEdicion.value = false;
};

// Función para editar
const editarRegistro = () => {
  modoEdicion.value = true;
};

// Función para iniciar un nuevo registro
const nuevoRegistro = () => {
  Object.assign(proveedor, {
    id: null,
    nombre: "",
    telefono: "",
    correo: "",
    direccion: {
      nomenclatura: "",
      vereda: "",
      finca: "",
      municipio: "",
      departamento: ""
    }
  });
  registroSeleccionado.value = false;
  modoEdicion.value = true;
};

// Función para eliminar
const eliminarRegistro = () => {
  proveedores.value = proveedores.value.filter(p => p.id !== proveedor.id);
  nuevoRegistro(); // Limpia el formulario
};

// Función para validar y guardar los cambios
const guardarRegistro = () => {
  errores.value = validarCampos(proveedor, reglasProveedor); // validarCampos adaptado
  if (Object.keys(errores.value).length > 0) return;

  if (proveedor.id === null) {
    proveedor.id = proveedores.value.length + 1;
    proveedores.value.push({ ...proveedor });
  } else {
    const index = proveedores.value.findIndex(p => p.id === proveedor.id);
    if (index !== -1) proveedores.value[index] = { ...proveedor };
  }
  modoEdicion.value = false;
};
</script>
