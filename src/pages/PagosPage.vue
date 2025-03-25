<template>
  <q-page class="q-pa-md">
    <CrudLayout>
      <!-- Columna izquierda: Formulario -->
      <template #form>
        <q-card class="q-pa-md">
          <q-card-section>
            <q-form>
              <q-card-actions align="left" class="q-gutter-x-sm wrap">
                <q-btn dense label="Nuevo" color="primary" @click="nuevoRegistro" />
                <q-btn dense label="Editar" color="secondary" @click="editarRegistro" :disable="!registroSeleccionado" />
                <q-btn dense label="Guardar" color="positive" @click="guardarRegistro" :disable="!puedeGuardar" />
                <q-btn dense label="Eliminar" color="negative" @click="eliminarRegistro" :disable="!registroSeleccionado" />
              </q-card-actions>

              <q-input v-model="pago.fecha" label="Fecha del Pago" type="date" :disable="!modoEdicion" />
              <q-input v-model="pago.monto" label="Monto Pagado" type="number" :disable="!modoEdicion" />

              <ClienteSelect
                v-model="clienteSeleccionado"
                :disable="!modoEdicion"
                @update:modelValue="buscarVentasDelCliente"
              />
              <q-select
                v-model="pago.venta.id"
                :options="ventasCliente"
                option-value="id"
                :option-label="venta => `${venta.factura_id} | ${venta.fecha_venta} | ${formatearPesos(venta.total)}`"
                emit-value
                map-options
                label="Seleccionar Venta"
                :disable="!modoEdicion || ventasCliente.length === 0"
                :loading="seleccionandoVenta"
                hint="Ventas activas del cliente"
              >

                <template #option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section>
                      <q-item-label class="text-bold">
                        <span>{{ scope.opt.factura_id }}</span> |
                        {{ scope.opt.fecha_venta }} | {{ formatearPesos(scope.opt.total) }}
                      </q-item-label>
                      <q-item-label caption>
                        Tipo: {{ scope.opt.tipo_pago }} — Saldo: {{ formatearPesos(scope.opt.saldo_pendiente) }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </template>

                <template #selected>
                  <span>
                    {{ pago.venta?.fecha_venta }} - {{ formatearPesos(pago.venta?.total) }}
                  </span>
                </template>
              </q-select>



              <q-input v-model="pago.venta.id" label="ID de la Venta" :disable="true" />
              <q-input v-model="pago.venta.cliente.nombre_completo" label="Cliente" :disable="true" />

          </q-form>
          </q-card-section>
        </q-card>
      </template>

      <template #table>
        <q-table
          flat
          bordered
          title="Registro de Pagos"
          :rows="pagos"
          :columns="columns"
          row-key="id"
          :loading="loading"
          :rows-per-page-options="[10]"
          :rows-per-page="10"
          virtual-scroll
          @row-click="seleccionarRegistro"
        >
        <template #loading>
            <div class="row items-center justify-center q-pa-md">
              <q-spinner-gears color="primary" size="40px" />
              <div class="q-ml-md text-primary text-h6">Cargando pagos...</div>
            </div>
          </template>
         </q-table>
      </template>
    </CrudLayout>
  </q-page>
</template>

<script setup>
import ClienteSelect from 'src/components/ClienteSelect.vue';
import CrudLayout from "src/layouts/CrudLayout.vue";
import apiService from 'src/services/apiService';
import { reglasPago, validarCampos } from "src/services/validationService";
import { formatearPesos } from "src/utils/utils";
import { computed, onMounted, reactive, ref, watch } from "vue";

const loading = ref(false);
const pagos = ref([]);
const registroSeleccionado = ref(false);
const modoEdicion = ref(false);
const errores = ref({});
const clienteSeleccionado = ref(null);
const seleccionandoVenta = ref(false);
const ventasCliente = ref([]);

const buscarVentasDelCliente = (cliente) => {
  if (!cliente?.id) return;
  pago.venta.cliente = cliente; // asigna el cliente al pago

  seleccionandoVenta.value = true;
  apiService.get(`/ventas/cliente/${cliente.id}`)
    .then(response => {
      ventasCliente.value = response.data;
    })
    .finally(() => {
      seleccionandoVenta.value = false;
    });
};

const pago = reactive({
  id: null,
  fecha: "", // Fecha del pago
  monto: 0,  // Monto abonado
  venta: {
    id: null,
    fecha_venta: "",
    tipo_pago: "", // Contado o Crédito
    total: 0,
    saldo: 0,
    cliente: {
      id: null,
      nombre_completo: ""
    }
  }
});
watch(() => pago.venta.id, (ventaId) => {
  const venta = ventasCliente.value.find(v => v.id === ventaId);
  if (venta) {
    Object.assign(pago.venta, {
      id: venta.id,
      fecha_venta: venta.fecha_venta,
      tipo_pago: venta.tipo_pago,
      total: venta.total,
      saldo_pendiente: venta.saldo_pendiente,
      factura_id: venta.factura_id
    });
  }
});



// Columnas de la tabla
const columns = [
  { name: "nombre", label: "Cliente", field: row => row.venta?.cliente?.nombre_completo, align: "left" },
  { name: "tipo_pago", label: "Tipo de Pago", field: row => row.venta?.tipo_pago, align: "left" },
  { name: "total", label: "Total Venta", field: row => '$' + formatearPesos(row.venta?.total), align: "left" },
  { name: "monto", label: "Monto Pagado", field: row => '$' + formatearPesos(row.monto), align: "left" },
  { name: "saldo", label: "Saldo Pendiente", field: row => '$' + formatearPesos(row.venta?.saldo_pendiente), align: "left" },
  { name: "fecha", label: "Fecha del Pago", field: "fecha", align: "left" }
];

// Computed para habilitar el botón "Guardar"
const puedeGuardar = computed(() => {
  return modoEdicion.value && Object.keys(validarCampos(pago, reglasPago)).length === 0;
});

// Carga inicial
onMounted(() => {
  cargarPagos();
});

const cargarPagos = () => {
  loading.value = true;
  apiService.get('/pagos')
    .then(response => {
      pagos.value = response.data
    })
    .catch(() => {
      // El error ya se notifica automáticamente por apiService
    })
    .finally(() => {
          loading.value = false;
    });
}

// Función para seleccionar un registro desde la tabla
const seleccionarRegistro = (evt, row) => {
  Object.assign(pago, row);
  registroSeleccionado.value = true;
  modoEdicion.value = false;
};

// Función para editar
// const editarRegistro = () => {
//   modoEdicion.value = true;
// };

// Función para iniciar un nuevo registro
const nuevoRegistro = () => {
  Object.assign(pago, {
    id: null,
    fecha: "",
    monto: 0,
    venta: {
      id: null,
      fecha_venta: "",
      tipo_pago: "",
      total: 0,
      saldo: 0,
      cliente: {
        id: null,
        nombre_completo: ""
      }
    }
  });
  registroSeleccionado.value = false;
  modoEdicion.value = true;
};


  // Función para eliminar
  // const eliminarRegistro = () => {
  //   apiService.delete('/proveedores', proveedor.id)
  //     .then(() => {
  //       proveedores.value = proveedores.value.filter(p => p.id !== proveedor.id)
  //       nuevoRegistro() // Limpia el formulario
  //     })
  //     .catch(() => {
  //       // El error ya lo muestra apiService
  //     })
  // };

// Función para validar y guardar los cambios
// const guardarRegistro = () => {
//   errores.value = validarCampos(proveedor, reglasProveedor); // validarCampos adaptado
//   if (Object.keys(errores.value).length > 0) return;

//   if (proveedor.id === null) {
//       apiService.post('/proveedores', proveedor)
//       .then(response => {
//         proveedores.value.push(response.data) // agrega el cliente retornado
//         modoEdicion.value = false
//       })
//       .catch(() => {
//         // El error ya se maneja automáticamente con Notify en apiService
//       })
//   } else {
//     apiService.put('/proveedores', proveedor)
//       .then(response => {
//         const index = proveedores.value.findIndex(p => p.id === proveedor.id)
//         if (index !== -1) {
//           proveedores.value[index] = response.data
//         }
//         modoEdicion.value = false
//       })
//       .catch(() => {
//         // El error ya lo muestra apiService
//       })
//   }
//   modoEdicion.value = false;
// };
</script>
