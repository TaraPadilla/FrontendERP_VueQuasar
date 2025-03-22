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

            <q-input v-model="venta.fecha_venta" label="Fecha de Venta" :disable="!modoEdicion" dense />
            <q-input v-model="venta.cliente" label="Cliente" :disable="!modoEdicion" dense />
            <q-select
              v-model="venta.tipo_pago"
              :options="['Contado', 'Crédito']"
              label="Tipo de Pago"
              :disable="!modoEdicion"
              dense
            />

            <q-input
              v-if="venta.tipo_pago === 'Crédito'"
              v-model.number="venta.cuotas"
              label="Cuotas"
              type="number"
              :disable="!modoEdicion"
              dense
            />

            <q-input
              v-if="venta.tipo_pago === 'Crédito'"
              v-model.number="venta.monto_abono"
              label="Monto del abono"
              type="number"
              :disable="!modoEdicion"
              dense
            />

            <q-input
              v-if="venta.tipo_pago === 'Crédito'"
              v-model.number="venta.saldo_pendiente"
              label="Saldo pendiente"
              type="number"
              :disable="!modoEdicion"
              dense
            />

            <div class="q-mt-md">
              <div class="text-subtitle2 q-mb-sm">Productos</div>
              <q-list bordered separator>
                <q-item v-for="(p, i) in venta.productos" :key="i">
                  <q-item-section>
                    {{ p.nombre }} - Cant: {{ p.cantidad }} - ${{ p.subtotal.toLocaleString('es-CO') }}
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </template>

    <!-- Columna derecha: Tabla de ventas -->
    <template #table>
      <q-table
        flat
        bordered
        title="Ventas"
        :rows="ventas"
        :columns="columnas"
        row-key="fecha_venta"
        @row-click="seleccionarRegistro"
        dense
      />
    </template>
  </CrudLayout>
</template>

<script setup>
import CrudLayout from 'src/layouts/CrudLayout.vue'
import ventasData from 'src/ventas.json'
import { reactive, ref } from 'vue'

const ventas = ref([...ventasData.ventas])

const venta = reactive({
  fecha_venta: '',
  cliente: '',
  tipo_pago: 'Contado',
  cuotas: null,
  monto_abono: 0,
  saldo_pendiente: 0,
  productos: []
})

const registroSeleccionado = ref(false)
const modoEdicion = ref(false)

const columnas = [
  { name: 'fecha_venta', label: 'Fecha', field: 'fecha_venta', align: 'left' },
  { name: 'cliente', label: 'Cliente', field: 'cliente', align: 'left' },
  { name: 'tipo_pago', label: 'Pago', field: 'tipo_pago', align: 'left' },
  { name: 'monto_abono', label: 'Abono', field: 'monto_abono', align: 'right' },
  { name: 'saldo_pendiente', label: 'Saldo', field: 'saldo_pendiente', align: 'right' }
]

// Seleccionar una venta
function seleccionarRegistro(evt, row) {
  Object.assign(venta, row)
  registroSeleccionado.value = true
  modoEdicion.value = false
}

// Nuevo registro
function nuevoRegistro() {
  Object.assign(venta, {
    fecha_venta: '',
    cliente: '',
    tipo_pago: 'Contado',
    cuotas: null,
    monto_abono: 0,
    saldo_pendiente: 0,
    productos: []
  })
  registroSeleccionado.value = false
  modoEdicion.value = true
}

// Editar venta seleccionada
function editarRegistro() {
  modoEdicion.value = true
}

// Guardar cambios
function guardarRegistro() {
  if (venta.fecha_venta === '') return
  if (venta.productos.length === 0) return

  if (!registroSeleccionado.value) {
    ventas.value.push({ ...venta })
  } else {
    const index = ventas.value.findIndex(v => v.fecha_venta === venta.fecha_venta && v.cliente === venta.cliente)
    if (index !== -1) ventas.value[index] = { ...venta }
  }

  modoEdicion.value = false
}

// Eliminar venta seleccionada
function eliminarRegistro() {
  ventas.value = ventas.value.filter(v => v !== venta)
  nuevoRegistro()
}
</script>
