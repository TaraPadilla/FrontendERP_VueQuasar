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
            :options="[
              { label: 'Contado', value: 'Contado' },
              { label: 'Crédito', value: 'Crédito' }
            ]"
            type="radio"
            label="Tipo de Pago"
            inline
            dense
          />
        </div>
      </div>

      <div
        v-if="venta.tipo_pago === 'Crédito'"
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

          <q-table
            dense
            grid
            hide-header
            :rows="productosFiltrados"
            :columns="columnasProductos"
            row-key="nombre">
            <template v-slot:item="props">
              <q-card class="q-ma-xs cursor-pointer" @click="agregarProducto(props.row)">
                <q-card-section>
                  <div class="text-subtitle1">{{ props.row.nombre }}</div>
                  <div class="text-caption">Stock: {{ props.row.stock }}</div>
                  <div class="text-caption">Precio: ${{ props.row.precio_unitario }}</div>
                </q-card-section>
              </q-card>
            </template>
         </q-table>
        </q-col>

        <!-- Tabla tipo factura -->
        <q-col cols="12" md="6">
          <q-table
            dense
            flat
            bordered
            :rows="venta.productos"
            :columns="columnasFactura"
            row-key="nombre"
            title="Detalle de la Venta"
          >
            <template v-slot:body-cell-cantidad="props">
              <q-td>
                <q-input
                  dense
                  type="number"
                  v-model.number="props.row.cantidad"
                  @blur="actualizarTotales"
                  min="1"
                />
              </q-td>
            </template>
            <template v-slot:body-cell-subtotal="props">
              <q-td>{{ props.row.cantidad * props.row.precio_unitario }}</q-td>
            </template>
            <template v-slot:body-cell-acciones="props">
              <q-td>
                <q-btn dense icon="delete" color="negative" flat @click="eliminarProducto(props.row)" />
              </q-td>
            </template>
            <template v-slot:bottom-row>
              <q-tr>
                <q-td colspan="3" class="text-right text-bold">Total:</q-td>
                <q-td class="text-right text-bold">
                  {{ totalVenta.toLocaleString("es-CO") }}
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
        <q-btn label="Guardar" color="primary" @click="guardarVenta" />
      </div>
    </q-card>

  </q-page>
</template>

<script setup>
import { useQuasar } from 'quasar'
import ClienteSelect from 'src/components/ClienteSelect.vue'
import terceros from 'src/terceros.json'
import { computed, reactive, ref } from 'vue'


const $q = useQuasar()


const clientes = terceros.clientes.map(c => ({ nombre: c.nombre_completo }))

const productosDisponibles = [
  { nombre: "Televisor 50 pulgadas", stock: 5, precio_unitario: 1000000 },
  { nombre: "Licuadora Oster", stock: 10, precio_unitario: 250000 },
  { nombre: "Plancha de ropa", stock: 7, precio_unitario: 120000 },
  { nombre: "Ventilador de pedestal", stock: 6, precio_unitario: 300000 }
]

const venta = reactive({
  cliente: null,
  fecha_venta: new Date().toISOString().substr(0, 10),
  tipo_pago: "Contado",
  cuotas: null,
  monto_abono: 0,
  productos: []
})

const filtroProducto = ref("")

const columnasProductos = [
  { name: "nombre", label: "Nombre", field: "nombre" },
  { name: "stock", label: "Stock", field: "stock" },
  { name: "precio_unitario", label: "Precio", field: "precio_unitario" }
]

const columnasFactura = [
  { name: "nombre", label: "Producto", field: "nombre" },
  { name: "precio_unitario", label: "Precio Unitario", field: "precio_unitario", align: "right" },
  { name: "cantidad", label: "Cantidad", field: "cantidad", align: "right" },
  { name: "subtotal", label: "Subtotal", field: "subtotal", align: "right" },
  { name: "acciones", label: "", field: "acciones", align: "center" }
]

const productosFiltrados = computed(() => {
  const filtro = filtroProducto.value.toLowerCase()
  return productosDisponibles.filter(p =>
    p.nombre.toLowerCase().includes(filtro)
  )
})

const totalVenta = computed(() => {
  return venta.productos.reduce((sum, p) => sum + (p.precio_unitario * p.cantidad), 0)
})

const calcularSaldo = computed(() => {
  return totalVenta.value - (venta.monto_abono || 0)
})

function agregarProducto(producto) {
  const existente = venta.productos.find(p => p.nombre === producto.nombre)
  if (!existente) {
    venta.productos.push({
      nombre: producto.nombre,
      cantidad: 1,
      precio_unitario: producto.precio_unitario,
      subtotal: producto.precio_unitario
    })
  }
}

function eliminarProducto(row) {
  venta.productos = venta.productos.filter(p => p.nombre !== row.nombre)
}

function actualizarTotales() {
  venta.productos.forEach(p => {
    p.subtotal = p.cantidad * p.precio_unitario
  })
}

function guardarVenta() {
  const ventaFinal = {
    fecha_venta: venta.fecha_venta,
    cliente: venta.cliente,
    tipo_pago: venta.tipo_pago,
    cuotas: venta.tipo_pago === "Crédito" ? venta.cuotas : null,
    monto_abono: venta.tipo_pago === "Crédito" ? venta.monto_abono : 0,
    saldo_pendiente: calcularSaldo.value,
    productos: venta.productos.map(p => ({
      nombre: p.nombre,
      cantidad: p.cantidad,
      precio_unitario: p.precio_unitario,
      subtotal: p.precio_unitario * p.cantidad
    }))
  }

  console.log("VENTA GUARDADA:", JSON.stringify(ventaFinal, null, 2))
  $q.notify({ type: 'positive', message: 'Venta registrada (ver consola)' })
}

function limpiarFormulario() {
  venta.cliente = null
  venta.fecha_venta = new Date().toISOString().substr(0, 10)
  venta.tipo_pago = "Contado"
  venta.cuotas = null
  venta.monto_abono = 0
  venta.productos = []
  filtroProducto.value = ""
}

</script>
