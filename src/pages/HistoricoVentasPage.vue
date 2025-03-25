<template>
  <CrudLayout>
    <!-- Columna izquierda: Formulario -->
    <template #form>
      <q-card class="q-pa-md">
        <q-card-section>
          <q-form>
            <q-card-actions align="left">
              <q-btn label="Eliminar" color="negative" @click="eliminarRegistro" :disable="!registroSeleccionado" />
            </q-card-actions>

            <q-input v-model="venta.fecha_venta" label="Fecha de Venta" :disable="!modoEdicion" dense />
            <q-input v-model="venta.cliente.nombre_completo" label="Cliente" :disable="!modoEdicion" dense />
            <q-select
              v-model="venta.tipo_pago"
              label="Tipo de Pago"
              :disable="!modoEdicion"
              dense
            />

            <q-input
              v-if="venta.tipo_pago === 'credito'"
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
                <q-item v-for="(p, i) in venta.detalles" :key="i" class="q-pa-sm">
                  <q-item-section avatar top>
                    <q-avatar color="primary" text-color="white" icon="shopping_cart" />
                  </q-item-section>

                  <q-item-section>
                    <q-item-label class="text-weight-medium">{{ p.producto.nombre }}</q-item-label>
                    <q-item-label caption>
                      Cantidad: {{ p.cantidad }} — Subtotal: {{ formatearPesos(p.subtotal) }}
                    </q-item-label>
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
        title="Historico de ventas"
        :rows="ventas"
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
              <div class="q-ml-md text-primary text-h6">Cargando historico de ventas...</div>
            </div>
          </template>
      </q-table>
    </template>
  </CrudLayout>
</template>

<script setup>
import CrudLayout from 'src/layouts/CrudLayout.vue'
import apiService from 'src/services/apiService.js'
import { formatearPesos } from 'src/utils/utils'
import { onMounted, reactive, ref } from 'vue'

const loading = ref(false)


const ventas = ref([])

const venta = reactive({
  fecha_venta: '',
  cliente: '',
  tipo_pago: null,
  cuotas: null,
  monto_abono: 0,
  saldo_pendiente: 0,
  productos: []
})

const registroSeleccionado = ref(false)
const modoEdicion = ref(false)

const columnas = [
  { name: 'fecha_venta', label: 'Fecha', field: 'fecha_venta', align: 'left' },
  { name: 'cliente', label: 'Cliente', field: row => row.cliente?.nombre_completo || '', align: 'left' },
  { name: 'tipo_pago', label: 'Pago', field: 'tipo_pago', align: 'left' },
  { name: 'monto_abono', label: 'Abono', field: row => '$'+ formatearPesos(row.abono_inicial), align: 'left' },
  { name: 'saldo_pendiente', label: 'Saldo', field: row => '$'+ formatearPesos(row.saldo_pendiente), align: 'left' }
]

onMounted(() => {
  cargarVentas()
});

function cargarVentas() {
  // Cargar ventas desde una API o base de datos
    loading.value = true;
    return apiService.get('/ventas')
      .then(response => {
        ventas.value = response.data
      })
      .catch(() => {
        // El error ya se notifica automáticamente por apiService
      })
      .finally(() => {
        loading.value = false;
      });
}
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


// Eliminar venta seleccionada
function eliminarRegistro() {
  ventas.value = ventas.value.filter(v => v !== venta)
  nuevoRegistro()
}
</script>
