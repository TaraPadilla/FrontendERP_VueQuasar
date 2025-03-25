<template>
  <CrudLayout>
    <!-- Formulario -->
    <template #form>
      <q-card class="q-pa-md">
        <q-card-section>
          <q-form>
            <q-card-actions align="left">
              <q-btn label="Nuevo" color="primary" @click="nuevoRegistro" />
              <q-btn label="Editar" color="secondary" @click="editarRegistro" :disable="!registroSeleccionado" />
              <q-btn label="Guardar" color="positive" @click="guardarRegistro" :disable="!puedeGuardar" />
              <q-btn label="Eliminar" color="negative" @click="eliminarRegistro" :disable="!registroSeleccionado" />
            </q-card-actions>

            <q-select
              v-model="gasto.categoria_id"
              :options="categorias"
              option-label="nombre"
              option-value="id"
              label="Categoría"
              :disable="!modoEdicion"
              dense
              emit-value
              map-options
            />

            <q-input
              v-model="gasto.observacion"
              label="Observación"
              type="textarea"
              :disable="!modoEdicion"
              dense
            />

            <q-input
              v-if="modoEdicion"
              v-model.number="gasto.valor"
              label="Valor del Gasto"
              type="number"
              :disable="!modoEdicion"
              dense
            />

            <q-input
              v-else
              :model-value="formatearPesos(gasto.valor)"
              label="Valor del Gasto"
              disable
              dense
              prefix="$"
            />

            <q-input
              v-model="gasto.fecha_hora"
              label="Fecha y Hora"
              type="datetime-local"
              :disable="!modoEdicion"
              dense
            />
          </q-form>
        </q-card-section>
      </q-card>
    </template>

    <!-- Tabla -->
    <template #table>
      <q-table
        flat
        bordered
        title="Gastos"
        :rows="gastos"
        :columns="columnas"
        row-key="id"
        @row-click="seleccionarRegistro"
        dense
        :loading="loading"
        :rows-per-page-options="[10]"
        :rows-per-page="10"
      >
        <template #loading>
              <div class="row items-center justify-center q-pa-md">
                <q-spinner-gears color="primary" size="40px" />
                <div class="q-ml-md text-primary text-h6">Cargando gastos...</div>
              </div>
        </template>
      </q-table>
    </template>
  </CrudLayout>
</template>

<script setup>
import CrudLayout from 'src/layouts/CrudLayout.vue';
import apiService from 'src/services/apiService';
import { reglasGasto, validarCampos } from "src/services/validationService.js";
import { formatearPesos } from 'src/utils/utils';
import { computed, onMounted, reactive, ref } from 'vue';

const gastos = ref([])
const categorias = ref([])
const registroSeleccionado = ref(false)
const loading = ref(false);
const modoEdicion = ref(false)
const errores = ref({});

const gasto = reactive({
  id: null,
  usuario_id: 1, // Alexander fijo
  categoria_id: null,
  observacion: '',
  valor: formatearPesos(0),
  fecha_hora: ''
})

const columnas = [
  { name: 'categoria', label: 'Categoría', field: row => row.categoria?.nombre, align: 'left' },
  { name: 'observacion', label: 'Observación', field: 'observacion', align: 'left' },
  { name: 'valor', label: 'Valor', field: row => '$'+formatearPesos(row.valor), align: 'left' },
  { name: 'fecha_hora', label: 'Fecha y Hora', field: 'fecha_hora', align: 'left' }
]

onMounted(() => {
  cargarGastos()
  cargarCategorias()
})

const puedeGuardar = computed(() => {
  return modoEdicion.value && Object.keys(validarCampos(gasto, reglasGasto)).length === 0;
});

const cargarGastos = () => {
  loading.value = true;
  return apiService.get('/gastos')
    .then(res => {
      gastos.value = res.data;
      options.value = res.data; // <-- aquí
    })
    .catch(() => {
        // El error ya se notifica automáticamente por apiService
      })
    .finally(() => {
        loading.value = false;
      });
};

const cargarCategorias = () => {
  return apiService.get('/categorias')
    .then(res => {
      categorias.value = res.data;
      //optionsCategoria.value = res.data;
    });
};

function seleccionarRegistro(evt, row) {
  Object.assign(gasto, row)
  gasto.categoria_id = row.categoria?.id || null
  registroSeleccionado.value = true
  modoEdicion.value = false
}

function nuevoRegistro() {
  Object.assign(gasto, {
    id: null,
    usuario_id: 1,
    categoria_id: null,
    observacion: '',
    valor: formatearPesos(0),
    fecha_hora: ''
  })
  registroSeleccionado.value = false
  modoEdicion.value = true
}

function editarRegistro() {
  modoEdicion.value = true
}

// Función para validar y guardar los cambios
const guardarRegistro = () => {
  errores.value = validarCampos(gasto, reglasGasto);
  if (Object.keys(errores.value).length > 0) return;

  if (gasto.id === null) {
    apiService.post('/gastos', gasto)
      .then(response => {
        cargarGastos();
        modoEdicion.value = false
      })
      .catch(() => {
        // El error ya se maneja automáticamente con Notify en apiService
      })
  } else {
    apiService.put('/gastos', gasto)
    .then(async () => {
      await cargarGastos(); // esperar que se recargue con relaciones completas
      modoEdicion.value = false;
    })
    .catch(() => {
      // El error ya lo muestra apiService
    });
  }
};

async function eliminarRegistro() {
  if (gasto.id !== null) {
    await api.delete(`gastos/${gasto.id}`)
    await cargarGastos()
    nuevoRegistro()
  }
}
</script>
