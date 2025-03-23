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

              <q-input v-model="formData.nombre" label="Nombre del Producto" :disable="!modoEdicion" />
              <q-input v-model="formData.descripcion" label="Descripción del Producto" :disable="!modoEdicion" />
              <!-- <q-select
                v-model="formData.categoria_id"
                :options="categorias"
                option-label="nombre"
                option-value="id"
                label="Categoría"
                emit-value
                map-options
                :disable="!modoEdicion"
              /> -->
              <q-select
                filled
                v-model="formData.proveedor_id"
                use-input
                input-debounce="0"
                label="Proveedor"
                :options="options"
                @filter="filterFn"
                option-label="nombre_completo"
                option-value="id"
                emit-value
                map-options
                behavior="menu"
                :disable="!modoEdicion"
              />
              <q-input v-model="formData.referencia" label="Referencia" :disable="!modoEdicion" />
              <q-input v-model="formData.color" label="Color" :disable="!modoEdicion" />
              <q-input v-model="formData.talla" label="Talla" :disable="!modoEdicion" />
              <q-input v-model="formData.marca" label="Marca" :disable="!modoEdicion" />
              <q-input v-model="formData.precio_compra" label="Precio de Compra" type="number" :disable="!modoEdicion" />
              <q-input v-model="formData.porcentaje_venta" label="Porcentaje de Venta" type="number" :disable="!modoEdicion" />
              <q-input v-model="formData.precio_venta" label="Precio de Venta" type="number" :disable="!modoEdicion" />
              <q-input v-model="formData.ganancia" label="Ganancia" type="number" :disable="!modoEdicion" />
              <q-input v-model="formData.stock" label="Stock" type="number" :disable="!modoEdicion" />

            </q-form>
          </q-card-section>
        </q-card>
      </template>

      <!-- Columna derecha: Tabla -->
      <template #table>
        <q-table
          flat
          bordered
          title="Inventario de Productos"
          :rows="inventario"
          :columns="columns"
          row-key="id"
          :loading="loading"
          :rows-per-page-options="[10]"
          :rows-per-page="10"
          @row-click="seleccionarRegistro"
        >
        <template #loading>
            <div class="row items-center justify-center q-pa-md">
              <q-spinner-gears color="primary" size="40px" />
              <div class="q-ml-md text-primary text-h6">Cargando productos...</div>
            </div>
          </template>
        </q-table>
      </template>
    </CrudLayout>
  </q-page>
</template>

<script setup>
import CrudLayout from "src/layouts/CrudLayout.vue";
import apiService from 'src/services/apiService';
import { reglasProducto, validarCampos } from "src/services/validationService.js";
import { computed, onMounted, reactive, ref } from "vue";

// Estado del formulario con los nuevos campos
const formData = reactive({
  id: null,
  nombre: "",
  descripcion: "",
  categoria_id: null,
  proveedor_id: null,
  proveedor: "",
  referencia: "",
  color: "",
  talla: "",
  marca: "",
  precio_compra: null,
  porcentaje_venta: null,
  precio_venta: null,
  ganancia: null,
  stock: null
});


// Estado de control
const inventario = ref([]); // Lista de productos en inventario
const registroSeleccionado = ref(false);
const modoEdicion = ref(false);
const errores = ref({});
const loading = ref(false);
const categorias = ref([]);
const proveedores = ref([]);

const options = ref([]);

const filterFn = (val, update) => {
  const needle = val.toLowerCase();
  update(() => {
    options.value = val
      ? proveedores.value.filter(p =>
          p.nombre_completo.toLowerCase().includes(needle)
        )
      : [...proveedores.value];
  });
};

// Computed para habilitar el botón "Guardar"
const puedeGuardar = computed(() => {
  return modoEdicion.value && Object.keys(validarCampos(formData, reglasProducto)).length === 0;
});

// Columnas de la tabla
const columns = [
  { name: "nombre", label: "Nombre", field: "nombre", align: "left" },
  { name: "categoria", label: "Categoría", field: "categoria", align: "left" },
  { name: "precio", label: "Precio Venta", field: "precio_venta", align: "right" },
  { name: "stock", label: "Stock", field: "stock", align: "right" },
];

// Cargar datos al montar el componente
onMounted(() => {
  cargarProductos();
  cargarProveedores();
});

const cargarProveedores = () => {
  return apiService.get('/proveedores')
    .then(res => {
      console.log('Proveedores desde API:', res.data);
      proveedores.value = res.data;
      options.value = res.data; // <-- aquí
    });
};

const cargarProductos = () => {
    loading.value = true;
    apiService.get('/productos')
      .then(response => {
        inventario.value = response.data
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
    Object.assign(formData, row);
    //formData.proveedor_id = Number(row.proveedor_id)
    registroSeleccionado.value = true;
    modoEdicion.value = false;
  };

  // Función para editar
  const editarRegistro = async (registro) => {
    await cargarProveedores();
    Object.assign(formData, { ...registro });
    registroSeleccionado.value = true;
    modoEdicion.value = true;
  };


  const nuevoRegistro = () => {
    Object.assign(formData, {
      id: null,
      nombre: "",
      descripcion: "",
      categoria_id: null,
      proveedor_id: null,
      referencia: "",
      color: "",
      talla: "",
      marca: "",
      precio_compra: null,
      porcentaje_venta: null,
      precio_venta: null,
      ganancia: null,
      stock: null
    });

    options.value = [...proveedores.value]

    registroSeleccionado.value = false;
    modoEdicion.value = true;
  };


// Función para eliminar
const eliminarRegistro = () => {
  inventario.value = inventario.value.filter(p => p.id !== formData.id);
  nuevoRegistro(); // Limpia el formulario
};

// Función para validar y guardar los cambios
const guardarRegistro = () => {
  errores.value = validarCampos(formData);
  if (Object.keys(errores.value).length > 0) return;

  if (formData.id === null) {
    // Simula agregar un nuevo producto
    formData.id = inventario.value.length + 1;
    inventario.value.push({ ...formData });
  } else {
    // Simula actualización
    const index = inventario.value.findIndex(p => p.id === formData.id);
    if (index !== -1) inventario.value[index] = { ...formData };
  }
  modoEdicion.value = false;
};
</script>

<style scoped>
.q-card {
  width: 100%;
  max-width: 400px;
}
</style>
