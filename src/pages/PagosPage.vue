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

              <!-- Si es nuevo, mostramos los selects -->
              <template v-if="esNuevo">
                <ClienteSelect
                  v-model="pago.venta.cliente"
                  :disable="!modoEdicion"
                  option-label="nombre_completo"
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
                    <span v-if="pago.venta?.id">
                      {{ pago.venta.fecha_venta }} - {{ formatearPesos(pago.venta.total) }}
                    </span>
                    <span v-else class="text-grey"></span>
                  </template>

                </q-select>
              </template>

              <!-- Si no es nuevo, mostramos los campos estáticos -->
              <template v-else>
                <q-input v-model="pago.venta.factura_id" label="Factura ID" :disable="true" />
                <q-input v-model="pago.venta.fecha_venta" label="Fecha de la Venta" :disable="true" />
                <q-input v-model="pago.venta.cliente.nombre_completo" label="Cliente" :disable="true" />
              </template>

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

const seleccionandoVenta = ref(false);
const ventasCliente = ref([]);
const esNuevo = computed(() => modoEdicion.value && !registroSeleccionado.value);


// Objeto reactivo principal del pago
const pago = reactive({
  id: null,
  fecha: "",
  monto: 0,
  venta: {
    id: null,
    fecha_venta: "",
    tipo_pago: "",
    total: 0,
    saldo: 0,
    factura_id: null,
    cliente: {
      id: null,
      nombre_completo: ""
    }
  }
});
watch(
  () => ({
    venta_id: pago.venta.id,
    fecha: pago.fecha,
    monto: pago.monto
  }),
  (val) => {
    errores.value = validarCampos(val, reglasPago);
  },
  { immediate: true }
);






// Cargar ventas de un cliente
const buscarVentasDelCliente = (cliente) => {
  if (!cliente?.id) return;

  pago.venta.cliente = cliente;

  seleccionandoVenta.value = true;
  apiService.get(`/ventas/cliente/${cliente.id}`)
    .then(response => {
      ventasCliente.value = response.data;
    })
    .finally(() => {
      seleccionandoVenta.value = false;
    });
};

// Cuando se selecciona una venta, actualiza los datos (sin borrar cliente)
watch(() => pago.venta.id, (ventaId) => {
  const venta = ventasCliente.value.find(v => v.id === ventaId);
  if (venta) {
    pago.venta.fecha_venta = venta.fecha_venta;
    pago.venta.tipo_pago = venta.tipo_pago;
    pago.venta.total = venta.total;
    pago.venta.saldo = venta.saldo_pendiente;
    pago.venta.factura_id = venta.factura_id;
  }
});


// Columnas de la tabla
const columns = [
  { name: "factura_id", label: "Factura ID", field: row => row.venta?.factura_id, align: "left" },
  { name: "fecha_venta", label: "Fecha de la Venta", field: row => row.venta?.fecha_venta, align: "left" },
  { name: "nombre", label: "Cliente", field: row => row.venta?.cliente?.nombre_completo, align: "left" },
  { name: "tipo_pago", label: "Tipo de Pago", field: row => row.venta?.tipo_pago, align: "left" },
  { name: "total", label: "Total Venta", field: row => '$' + formatearPesos(row.venta?.total), align: "left" },
  { name: "monto", label: "Monto Pagado", field: row => '$' + formatearPesos(row.monto), align: "left" },
  { name: "saldo", label: "Saldo Pendiente", field: row => '$' + formatearPesos(row.venta?.saldo_pendiente), align: "left" },
  { name: "fecha", label: "Fecha del Pago", field: "fecha", align: "left" }
];


const puedeGuardar = computed(() => {
  return modoEdicion.value && Object.keys(errores.value).length === 0;
});


// Carga inicial
onMounted(() => {
  cargarPagos();
});

const cargarPagos = () => {
  loading.value = true;
  apiService.get('/pagos')
    .then(response => {
      pagos.value = response.data;
    })
    .finally(() => {
      loading.value = false;
    });
};

// Seleccionar un pago desde la tabla
const seleccionarRegistro = (evt, row) => {
  Object.assign(pago, row);
  registroSeleccionado.value = true;
  modoEdicion.value = false;
};

// Nuevo registro
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
      factura_id: null,
      cliente: null
    }
  });
  registroSeleccionado.value = false;
  modoEdicion.value = true;
};

// Función para validar y guardar los cambios
const guardarRegistro = () => {
  const datos = {
    venta_id: pago.venta.id,
    fecha: pago.fecha,
    monto: pago.monto
  };

  errores.value = validarCampos(datos, reglasPago);
  if (Object.keys(errores.value).length > 0) return;

  if (pago.id === null) {
    apiService.post('/pagos', datos)
      .then(response => {
        cargarPagos(); // recarga toda la tabla con relaciones completas
        modoEdicion.value = false;
      })
      .catch(() => {
        // El error ya se maneja automáticamente por apiService
      });
  } else {
    apiService.put(`/pagos/${pago.id}`, datos)
      .then(response => {
        const index = pagos.value.findIndex(p => p.id === pago.id);
        if (index !== -1) {
          pagos.value[index] = response.data;
        }
        modoEdicion.value = false;
      })
      .catch(() => {
        // El error ya se maneja automáticamente por apiService
      });
  }

  modoEdicion.value = false
};

</script>
