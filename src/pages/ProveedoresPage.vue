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

              <q-input v-model="proveedor.nombre_completo" label="Nombre" :disable="!modoEdicion"/>
              <q-select v-model="proveedor.tipo_documento" :options="tipoDocumentos" label="Tipo de Documento" :disable="!modoEdicion"/>
              <q-input v-model="proveedor.numero_documento" label="Número de Documento" :disable="!modoEdicion"  />
              <q-input v-model="proveedor.telefono" label="Teléfono (WhatsApp)" :disable="!modoEdicion"/>
              <q-input v-model="proveedor.email" label="Correo" :disable="!modoEdicion"/>
              <q-input v-model="proveedor.direccion" label="Dirección - Nomenclatura" :disable="!modoEdicion"/>
              <q-input v-model="proveedor.municipio" label="Municipio" :disable="!modoEdicion"/>
              <q-input v-model="proveedor.departamento" label="Departamento" :disable="!modoEdicion"/>
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
import apiService from 'src/services/apiService';
import { reglasProveedor, validarCampos } from "src/services/validationService";
import { computed, onMounted, reactive, ref } from "vue";


const proveedor = reactive({
  id: null,
  nombre_completo: "",
  tipo_documento: "",
  numero_documento: "",
  telefono: "",
  email: "",
  direccion: "",
  municipio: "",
  departamento: ""
});

const tipoDocumentos = ["CC", "TI", "CE", "NIT"];

const proveedores = ref([]);
const registroSeleccionado = ref(false);
const modoEdicion = ref(false);
const errores = ref({});

// Columnas de la tabla
const columns = [
  { name: "nombre", label: "Nombre", field: "nombre_completo", align: "left" },
  { name: "telefono", label: "Teléfono", field: "telefono", align: "left" },
  { name: "email", label: "Correo", field: "email", align: "left" },
  { name: "direccion", label: "Dirección", field: "direccion", align: "left" }
];

// Computed para habilitar el botón "Guardar"
const puedeGuardar = computed(() => {
  return modoEdicion.value && Object.keys(validarCampos(proveedor, reglasProveedor)).length === 0;
});

// Carga inicial
onMounted(() => {
  cargarProveedores();
});

const cargarProveedores = () => {
  apiService.get('/proveedores')
    .then(response => {
      proveedores.value = response.data
    })
    .catch(() => {
      // El error ya se notifica automáticamente por apiService
    })
}

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
    nombre_completo: "",
    tipo_documento: "",
    numero_documento: "",
    telefono: "",
    email: "",
    direccion: "",
    municipio: "",
    departamento: ""
  });
  registroSeleccionado.value = false;
  modoEdicion.value = true;
};

  // Función para eliminar
  const eliminarRegistro = () => {
    apiService.delete('/proveedores', proveedor.id)
      .then(() => {
        proveedores.value = proveedores.value.filter(p => p.id !== proveedor.id)
        nuevoRegistro() // Limpia el formulario
      })
      .catch(() => {
        // El error ya lo muestra apiService
      })
  };

// Función para validar y guardar los cambios
const guardarRegistro = () => {
  errores.value = validarCampos(proveedor, reglasProveedor); // validarCampos adaptado
  if (Object.keys(errores.value).length > 0) return;

  if (proveedor.id === null) {
      // Simula agregar un nuevo producto
      apiService.post('/proveedores', proveedor)
      .then(response => {
        proveedores.value.push(response.data) // agrega el cliente retornado
        modoEdicion.value = false
      })
      .catch(() => {
        // El error ya se maneja automáticamente con Notify en apiService
      })
  } else {
    apiService.put('/proveedores', proveedor)
      .then(response => {
        const index = proveedores.value.findIndex(p => p.id === proveedor.id)
        if (index !== -1) {
          proveedores.value[index] = response.data
        }
        modoEdicion.value = false
      })
      .catch(() => {
        // El error ya lo muestra apiService
      })
  }
  modoEdicion.value = false;
};
</script>
