<template>
  <q-page class="q-pa-md">
    <!-- Formulario superior -->
    <q-card class="q-pa-md q-mb-md">
      <div class="row q-col-gutter-md items-start">
        <div class="col-12 col-md-4">
          <ClienteSelect v-model="venta.cliente" />
        </div>

        <div class="col-12 col-md-4">
          <q-input filled v-model="venta.fecha_venta" mask="date" :rules="['date']" label="Fecha">
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="venta.fecha_venta">
                    <div>
                      <q-btn v-close-popup label="Cerrar" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>

        <div class="col-12 col-md-4">
          <q-option-group
            v-model="venta.tipo_pago"
            :options="opcionesTipoPago"
            type="radio"
            label="Tipo de Pago"
            inline
            dense
          />
        </div>
      </div>

      <div
        v-if="venta.tipo_pago === 'credito'"
        class="row q-col-gutter-md q-mt-sm items-start"
      >
        <div class="col-12 col-md-4">
          <q-input
            v-model.number="venta.cuotas"
            type="number"
            label="Número de cuotas"
            dense
          />
        </div>

        <div class="col-12 col-md-4">
          <q-input
            v-model.number="venta.monto_abono"
            type="number"
            label="Monto del abono"
            dense
          />
        </div>

        <div class="col-12 col-md-4">
          <q-input
            :model-value="calcularSaldo"
            label="Saldo pendiente"
            readonly
            filled
            disable
            dense
          />
        </div>
      </div>
    </q-card>

    <!-- Zona inferior: selección de productos -->
    <q-card flat>
      <q-row class="q-col-gutter-md">
        <!-- Tabla de productos disponibles -->
        <q-col cols="12" md="6">
          <q-input dense debounce="300" v-model="filtroProducto"
            label="Buscar producto" class="q-mb-sm" />
            <template v-if="!loading">
              <div class="relative-position">
                <!-- Flecha izquierda -->
                <q-btn
                  round
                  dense
                  flat
                  icon="chevron_left"
                  class="absolute-left self-center z-top"
                  @click="scrollProductos(-1)"
                />

                <!-- Galería horizontal de productos -->
                <div
                  ref="scrollContainer"
                  class="row no-wrap q-col-gutter-sm scroll-x"
                  style="overflow-x: auto; scroll-behavior: smooth;"
                >
                  <div
                    v-for="producto in productosFiltrados"
                    :key="producto.id"
                    class="col-auto"
                  >
                    <q-card
                      class="q-ma-xs cursor-pointer"
                      style="min-width: 180px; max-width: 200px;"
                      @click="agregarProducto(producto)"
                    >
                      <q-card-section>
                        <div class="text-subtitle2 ellipsis">{{ producto.nombre }}</div>
                        <div class="text-caption">Stock: {{ producto.stock }}</div>
                        <div class="text-caption">Precio: ${{ formatearPesos(producto.precio_venta) }}</div>
                      </q-card-section>
                    </q-card>
                  </div>
                </div>

                <!-- Flecha derecha -->
                <q-btn
                  round
                  dense
                  flat
                  icon="chevron_right"
                  class="absolute-right self-center z-top"
                  @click="scrollProductos(1)"
                />
              </div>
            </template>

            <template v-else>
              <div class="row no-wrap q-col-gutter-sm scroll-x" style="overflow-x: auto;">
                <div v-for="n in 6" :key="n" class="col-auto">
                  <q-card class="q-ma-xs" style="min-width: 180px; max-width: 200px;">
                    <q-card-section>
                      <q-skeleton type="text" class="q-mb-sm" />
                      <q-skeleton type="text" width="60%" class="q-mb-xs" />
                      <q-skeleton type="text" width="40%" />
                    </q-card-section>
                  </q-card>
                </div>
              </div>
            </template>

        </q-col>
        <!-- Tabla tipo factura -->
        <q-col cols="6" md="6">
          <q-table
            dense
            flat
            bordered
            :rows="venta.productos"
            :columns="columnasFactura"
            row-key="nombre"
            title="Detalle de la Venta"
            class="q-mt-sm"
          >
            <template v-slot:body-cell-precio_venta="props">
            <q-td class="text-left">
              <q-input
                dense
                type="text"
                v-model="props.row._precio_venta_editable"
                @blur="() => {
                  const limpio = parseInt(props.row._precio_venta_editable.replace(/[^\d]/g, ''), 10) || 0
                  if (!isNaN(limpio) && limpio > 0) {
                    props.row.precio_venta = limpio
                    props.row._precio_venta_editable = formatearPesos(limpio)
                    props.row._precio_editado = props.row._precio_venta_editable !== props.row.precio_original
                    actualizarTotales()
                  } else {
                    props.row._precio_venta_editable = formatearPesos(props.row.precio_venta)
                  }
                }"
                class="q-input--no-padding"
                style="max-width: 120px"
                prefix="$"
                :color="props.row._precio_editado ? 'warning' : 'primary'"
                :bg-color="props.row._precio_editado ? 'yellow-1' : ''"
              >
                <q-tooltip v-if="props.row._precio_editado">
                  Precio modificado
                </q-tooltip>
              </q-input>
            </q-td>
          </template>
            <template v-slot:body-cell-cantidad="props">
              <q-td class="text-left">
                <q-input
                  dense
                  type="number"
                  v-model.number="props.row.cantidad"
                  @blur="actualizarTotales"
                  min="1"
                  class="q-input--no-padding"
                  style="max-width: 80px"
                />
              </q-td>
            </template>

            <template v-slot:body-cell-subtotal="props">
              <q-td class="text-left">
                ${{ (props.row.cantidad * props.row.precio_venta).toLocaleString('es-CO') }}
              </q-td>
            </template>

            <template v-slot:body-cell-acciones="props">
              <q-td class="text-center">
                <q-btn dense icon="delete" color="negative" flat @click="eliminarProducto(props.row)" />
              </q-td>
            </template>

            <template v-slot:bottom-row>
              <q-tr>
                <q-td colspan="3" class="text-right text-bold">Total:</q-td>
                <q-td class="text-right text-bold">
                  ${{ totalVenta.toLocaleString("es-CO") }}
                </q-td>
                <q-td />
              </q-tr>
            </template>
          </q-table>
        </q-col>
      </q-row>
    </q-card>
    <q-card class="q-pa-md q-mt-md">
      <div class="row justify-end q-gutter-sm">
        <q-btn label="Limpiar" color="warning" @click="limpiarFormulario" />
        <q-btn label="Guardar" color="primary" @click="guardarRegistro" />
      </div>
    </q-card>

  </q-page>

  <q-dialog v-model="mostrarDialogo" persistent transition-show="scale" transition-hide="scale">
  <q-card style="min-width: 340px; max-width: 500px" class="q-pa-sm">
    <q-card-section class="row items-center q-gutter-sm">
      <q-icon :name="esExito ? 'check_circle' : 'warning'" :color="esExito ? 'positive' : 'negative'" size="md" />
      <div :class="['text-h6', esExito ? 'text-positive' : 'text-negative']">
        {{ esExito ? 'Éxito' : 'Errores en el formulario' }}
      </div>
    </q-card-section>

    <q-separator />

    <q-card-section>
      <div v-if="esExito">
        {{ mensajeDialogo }}
      </div>
      <q-list v-else dense bordered separator>
        <q-item v-for="(error, index) in erroresLista" :key="index">
          <q-item-section avatar>
            <q-icon name="report_problem" color="warning" />
          </q-item-section>
          <q-item-section>{{ error }}</q-item-section>
        </q-item>
      </q-list>
    </q-card-section>

    <q-card-actions align="right">
      <q-btn flat label="Cerrar" color="primary" v-close-popup />
    </q-card-actions>
  </q-card>
</q-dialog>



</template>

<script setup>
import { QSpinnerGears, useQuasar } from 'quasar'
import ClienteSelect from 'src/components/ClienteSelect.vue'
import apiService from 'src/services/apiService'
import { reglasVenta, validarCampos } from 'src/services/validationService'
import { computed, onMounted, reactive, ref } from 'vue'

const $q = useQuasar()

const errores = ref([])
const mostrarDialogo = ref(false)
const mensajeDialogo = ref('')
const erroresLista = ref([])
const esExito = ref(false)



const opcionesTipoPago = [
  { label: 'Contado', value: 'contado' },
  { label: 'Crédito', value: 'credito' } // sin tilde
]

const productos = ref([])
const loading = ref(false)
const scrollContainer = ref(null)

onMounted(() => {
  cargarProductos()
})


function scrollProductos(direccion) {
  const el = scrollContainer.value
  if (!el) return

  const scrollCantidad = 420 * direccion // ancho de tarjeta + margen
  el.scrollBy({ left: scrollCantidad, behavior: 'smooth' })
}

function formatearPesos(valor) {
  return Number(valor || 0).toLocaleString('es-CO', { minimumFractionDigits: 0 })
}


const cargarProductos = () => {
  loading.value = true
  return apiService.get('/productos')
    .then(response => {
      productos.value = response.data
    })
    .catch(() => {
      // El error ya se notifica automáticamente por apiService
    })
    .finally(() => {
      loading.value = false
    })
}

const venta = reactive({
  cliente: null,
  fecha_venta: new Date().toISOString().substr(0, 10),
  tipo_pago: null,
  cuotas: null,
  monto_abono: 0,
  productos: []
})

const filtroProducto = ref("")

const columnasProductos = [
  { name: "nombre", label: "Nombre", field: "nombre" },
  { name: "stock", label: "Stock", field: "stock" },
  { name: "precio_venta", label: "Precio", field: "precio_venta" }
]

const columnasFactura = [
  { name: "nombre", label: "Producto", field: "nombre", align: "left" },
  { name: "precio_venta", label: "Precio", field: "precio_venta", align: "left"},
  { name: "cantidad", label: "Cantidad", field: "cantidad", align: "left" },
  { name: "subtotal", label: "Subtotal", field: "subtotal", align: "left"},
  { name: "acciones", label: "", field: "acciones", align: "left"}
]

const productosFiltrados = computed(() => {
  const filtro = filtroProducto.value.toLowerCase()
  return productos.value.filter(p =>
    p.nombre.toLowerCase().includes(filtro)
  )
})

const totalVenta = computed(() => {
  return venta.productos.reduce((sum, p) => sum + (p.precio_venta * p.cantidad), 0)
})

const calcularSaldo = computed(() => {
  return totalVenta.value - (venta.monto_abono || 0)
})

function agregarProducto(producto) {
  const existente = venta.productos.find(p => p.nombre === producto.nombre)
  if (!existente) {
    venta.productos.push({
      id: producto.id,
      nombre: producto.nombre,
      cantidad: 1,
      precio_venta: producto.precio_venta,
      precio_original: formatearPesos(producto.precio_venta),
      _precio_venta_editable: formatearPesos(producto.precio_venta),
      _precio_editado: false,
      subtotal: producto.precio_venta
    })

  }
}

function eliminarProducto(row) {
  venta.productos = venta.productos.filter(p => p.nombre !== row.nombre)
}

function actualizarTotales() {
  venta.productos.forEach(p => {
    p.subtotal = p.cantidad * p.precio_venta
  })
}

const guardarRegistro = () => {
  errores.value = validarCampos(venta, reglasVenta);

  if (Object.keys(errores.value).length > 0) {
    mostrarErrores(errores.value) // <- pasas el .value aquí
    return
  }

  const ventaFinal = {
    fecha_venta: venta.fecha_venta,
    tipo_pago: venta.tipo_pago.toLowerCase(),
    cliente_id: venta.cliente?.id || null,
    total: totalVenta.value,
    abono_inicial: venta.tipo_pago === 'credito' ? venta.monto_abono : 0,
    cuotas: venta.tipo_pago === 'credito' ? venta.cuotas : 0,
    saldo_pendiente: venta.tipo_pago === 'credito' ? calcularSaldo.value : 0,
    usuario_id: 1,
    productos: venta.productos.map(p => ({
      producto_id: p.id,
      cantidad: p.cantidad,
      precio_venta: p.precio_venta,
      subtotal: p.subtotal
    }))
  }

  $q.loading.show({
    message: 'Guardando venta...',
    spinner: QSpinnerGears,
    spinnerColor: 'primary'
  })

  apiService.post('/ventas', ventaFinal)
    .then(() => {
      mostrarExito('La venta fue registrada exitosamente.')
      limpiarFormulario()
    })
    .catch(() => {
      // Manejo de error automático en apiService
    })
    .finally(() => {
      $q.loading.hide()
    })
}


function limpiarFormulario() {
  venta.cliente = null
  venta.fecha_venta = new Date().toISOString().substr(0, 10)
  venta.tipo_pago = null
  venta.cuotas = null
  venta.monto_abono = 0
  venta.productos = []
  filtroProducto.value = ""
}

function mostrarErrores(erroresObj) {
  erroresLista.value = Object.entries(erroresObj).map(
    ([campo, mensaje]) => `${campo.charAt(0).toUpperCase() + campo.slice(1)}: ${mensaje}`
  )
  esExito.value = false
  mostrarDialogo.value = true
}

function mostrarExito(mensaje) {
  mensajeDialogo.value = mensaje
  erroresLista.value = [] // Limpiar lista de errores si hay
  esExito.value = true
  mostrarDialogo.value = true
}


function formatearCampo(campo) {
  return campo.charAt(0).toUpperCase() + campo.slice(1).replace(/_/g, ' ')
}




</script>
