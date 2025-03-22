<template>
  <q-page class="q-pa-md">
    <CrudLayout>
      <!-- Columna izquierda: Formulario -->
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

              <q-input v-model="formData.nombre" label="Nombre del Producto" :disable="!modoEdicion" />
              <q-input v-model="formData.descripcion" label="Descripción del Producto" :disable="!modoEdicion" />
              <q-input v-model="formData.categoria" label="Categoría" :disable="!modoEdicion" />
              <q-input v-model="formData.proveedor" label="Proveedor" :disable="!modoEdicion" />
              <q-input v-model="formData.articulo" label="Artículo" :disable="!modoEdicion" />
              <q-input v-model="formData.color" label="Color" :disable="!modoEdicion" />
              <q-input v-model="formData.tallaje" label="Tallaje" :disable="!modoEdicion" />
              <q-input v-model="formData.marca" label="Marca" :disable="!modoEdicion" />
              <q-input v-model="formData.precioCompra" label="Precio de Compra" type="number" :disable="!modoEdicion" />
              <q-input v-model="formData.porcentajeVenta" label="Porcentaje de Venta" type="number" :disable="!modoEdicion" />
              <q-input v-model="formData.precioVenta" label="Precio de Venta" type="number" :disable="!modoEdicion" />
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
          title="Productos"
          :rows="productos"
          :columns="columns"
          row-key="id"
          @row-click="seleccionarRegistro"
        />
      </template>
    </CrudLayout>
  </q-page>
</template>

<script setup>
import data from "src/data.json"; // Importamos el JSON de prueba
import CrudLayout from "src/layouts/CrudLayout.vue";
import { reglasProducto, validarCampos } from "src/services/validationService.js";
import { computed, onMounted, reactive, ref } from "vue";

// Estado para los productos
const productos = ref([]);

// Estado del formulario con los nuevos campos
const formData = reactive({
  id: null,
  nombre: "",
  descripcion: "",
  categoria: "",
  proveedor: "",
  articulo: "",
  color: "",
  tallaje: "",
  marca: "",
  precioCompra: "",
  porcentajeVenta: "",
  precioVenta: "",
  ganancia: "",
  stock: ""
});

// Estado de control
const inventario = ref([]); // Lista de productos en inventario
const registroSeleccionado = ref(false);
const modoEdicion = ref(false);
const errores = ref({});

// Computed para habilitar el botón "Guardar"
const puedeGuardar = computed(() => {
  return modoEdicion.value && Object.keys(validarCampos(formData, reglasProducto)).length === 0;
});

// Columnas de la tabla
const columns = [
  { name: "nombre", label: "Nombre", field: "nombre", align: "left" },
  { name: "categoria", label: "Categoría", field: "categoria", align: "left" },
  { name: "precio", label: "Precio Venta", field: "precioVenta", align: "right" },
  { name: "stock", label: "Stock", field: "stock", align: "right" },
];

// Cargar datos al montar el componente
onMounted(() => {
  productos.value = data;
});

// Seleccionar un registro de la tabla
// Función para seleccionar un registro desde la tabla
const seleccionarRegistro = (evt, row) => {
  Object.assign(formData, row);
  registroSeleccionado.value = true;
  modoEdicion.value = false;
};

// Función para editar
const editarRegistro = () => {
  modoEdicion.value = true;
};

// Función para iniciar un nuevo registro
const nuevoRegistro = () => {
  Object.assign(formData, {
    id: null, nombre: "", descripcion: "", categoria: "", proveedor: "",
    articulo: "", color: "", tallaje: "", marca: "", precioCompra: "",
    porcentajeVenta: "", precioVenta: "", ganancia: "", stock: ""
  });
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
