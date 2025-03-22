<template>
  <CrudLayout>
    <!-- Columna izquierda: Formulario -->
    <template #form>
      <q-card class="q-pa-md">
        <q-card-section>
          <q-form>
            <q-card-actions align="left">
              <q-btn label="Nuevo" color="primary" @click="nuevoRegistro" />
              <q-btn label="Editar" color="secondary" @click="editarRegistro" :disable="!registroSeleccionado" />
              <q-btn label="Guardar" color="positive" @click="guardarRegistro" :disable="!modoEdicion" />
              <q-btn label="Eliminar" color="negative" @click="eliminarRegistro" :disable="!registroSeleccionado" />
            </q-card-actions>

            <q-select
              v-model="gasto.categoria"
              :options="categorias"
              label="Categoría"
              :disable="!modoEdicion"
              dense
            />

            <q-input
              v-model="gasto.observacion"
              label="Observación"
              type="textarea"
              :disable="!modoEdicion"
              dense
            />

            <q-input
              v-model.number="gasto.valor"
              label="Valor del Gasto"
              type="number"
              :disable="!modoEdicion"
              dense
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

    <!-- Columna derecha: Tabla de gastos -->
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
      />
    </template>
  </CrudLayout>
</template>

<script setup>
import gastosData from 'src/gastos.json'
import CrudLayout from 'src/layouts/CrudLayout.vue'
import { reactive, ref } from 'vue'

// Datos iniciales cargados desde JSON
const gastos = ref([...gastosData.gastos])

// Categorías predeterminadas
const categorias = ["Combustible", "Alimentación", "Hospedaje", "Peajes", "Otros"]

// Modelo reactivo
const gasto = reactive({
  id: null,
  categoria: "",
  observacion: "",
  valor: 0,
  fecha_hora: ""
})

const registroSeleccionado = ref(false)
const modoEdicion = ref(false)

const columnas = [
  { name: "categoria", label: "Categoría", field: "categoria", align: "left" },
  { name: "observacion", label: "Observación", field: "observacion", align: "left" },
  { name: "valor", label: "Valor", field: "valor", align: "right", format: val => `$${val.toLocaleString("es-CO")}` },
  { name: "fecha_hora", label: "Fecha y Hora", field: "fecha_hora", align: "left" }
]

// Funciones CRUD

function seleccionarRegistro(evt, row) {
  Object.assign(gasto, row)
  registroSeleccionado.value = true
  modoEdicion.value = false
}

function nuevoRegistro() {
  Object.assign(gasto, {
    id: null,
    categoria: "",
    observacion: "",
    valor: 0,
    fecha_hora: ""
  })
  registroSeleccionado.value = false
  modoEdicion.value = true
}

function editarRegistro() {
  modoEdicion.value = true
}

function guardarRegistro() {
  if (gasto.id === null) {
    gasto.id = gastos.value.length + 1
    gastos.value.push({ ...gasto })
  } else {
    const index = gastos.value.findIndex(p => p.id === gasto.id)
    if (index !== -1) gastos.value[index] = { ...gasto }
  }
  modoEdicion.value = false
}

function eliminarRegistro() {
  gastos.value = gastos.value.filter(p => p.id !== gasto.id)
  nuevoRegistro()
}
</script>
