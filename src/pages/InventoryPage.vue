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
              <q-select
                filled
                v-model="formData.categoria_id"
                use-input
                input-debounce="0"
                label="Categoría"
                :options="optionsCategoria"
                @filter="filterFnCategoria"
                @update:model-value="onChangeCategoria"
                option-label="nombre"
                option-value="id"
                emit-value
                map-options
                behavior="menu"
                :disable="!modoEdicion"
              />
              <q-input v-model="formData.descripcion" label="Descripción del Producto" :disable="!modoEdicion" />
              <q-select
                filled
                v-model="formData.proveedor_id"
                use-input
                input-debounce="0"
                label="Proveedor"
                :options="options"
                @filter="filterFn"
                @update:model-value="onChangeProveedor"
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
              <q-input
                v-model="formData.precio_compra"
                label="Precio de Compra"
                prefix="$"
                type="number"
                :disable="!modoEdicion" />
              <q-input
                v-model="formData.porcentaje_venta"
                label="Porcentaje de Venta"
                type="number"
                suffix="%"
                :disable="!modoEdicion" />
              <q-input
                v-model="formData.precio_venta"
                label="Precio de Venta"
                type="number"
                prefix="$"
                :disable="!modoEdicion" />
              <q-input
                v-model="formData.ganancia"
                label="Ganancia"
                prefix="$"
                type="number"
                :disable="!modoEdicion" />
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
import { computed, onMounted, reactive, ref, watch } from "vue";

  // Estado de control
  const inventario = ref([]); // Lista de productos en inventario
  const registroSeleccionado = ref(false);
  const modoEdicion = ref(false);
  const errores = ref({});
  const loading = ref(false);
  const categorias = ref([]);
  const proveedores = ref([]);
  const precioVentaManual = ref(false);
  const options = ref([]);
  const optionsCategoria = ref([]);

  // Estado del formulario con los nuevos campos
  const formData = reactive({
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

    watch(
    () => [formData.porcentaje_venta, formData.precio_compra],
    ([nuevoPorcentaje, nuevoCompra]) => {
      if (nuevoPorcentaje !== null && nuevoCompra !== null) {
        const porcentaje = parseFloat(nuevoPorcentaje);
        const compra = parseFloat(nuevoCompra);
        if (!isNaN(porcentaje) && !isNaN(compra)) {
          const ganancia = (compra * porcentaje) / 100;
          formData.ganancia = Math.round(ganancia);
          formData.precio_venta = Math.round(compra + ganancia);
        }
      }
    }
  );


  watch(() => formData.precio_venta, (nuevoValor) => {
    const compra = parseFloat(formData.precio_compra);
    const venta = parseFloat(nuevoValor);

    if (!isNaN(compra) && !isNaN(venta)) {
      formData.ganancia = Math.round(venta - compra);
      precioVentaManual.value = true;
    }
  });

  watch(
  () => [formData.porcentaje_venta, formData.precio_compra],
  ([nuevoPorcentaje, nuevoCompra]) => {
    if (precioVentaManual.value) return; // No recalcular si fue modificado a mano

    const porcentaje = parseFloat(nuevoPorcentaje);
    const compra = parseFloat(nuevoCompra);

    if (!isNaN(porcentaje) && !isNaN(compra)) {
      const ganancia = (compra * porcentaje) / 100;
      formData.ganancia = Math.round(ganancia);
      formData.precio_venta = Math.round(compra + ganancia);
    }
  }
);



  const onChangeProveedor = (valor) => {
  console.log('¡Seleccionaste algo! proveedor_id es', valor)
  console.log('Proveedor ID:', formData.proveedor_id);
  }

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

const onChangeCategoria = (valor) => {
  console.log('¡Seleccionaste algo! categoria_id es', valor)
  console.log('Categoria ID:', formData.categoria_id);
}

const filterFnCategoria = (val, update) => {
  const needle = val.toLowerCase();
  update(() => {
    options.value = val
      ? categorias.value.filter(c =>
          c.nombre.toLowerCase().includes(needle)
        )
      : [...categorias.value];
  });
};

// Computed para habilitar el botón "Guardar"
const puedeGuardar = computed(() => {
  return modoEdicion.value && Object.keys(validarCampos(formData, reglasProducto)).length === 0;
});

// Columnas de la tabla
const columns = [
  { name: "nombre", label: "Nombre", field: "nombre", align: "left" },
  { name: "categoria", label: "Categoría", field: row => row.categoria?.nombre || '', align: "left" },
  { name: "precio", label: "Precio Venta", field: "precio_venta", align: "left", format: val => `$${val}` },
  { name: "stock", label: "Stock", field: "stock", align: "left" },
  { name: "proveedor", label: "Proveedor", field: row => row.proveedor?.nombre_completo || '', align: "left" }
];

// Cargar datos al montar el componente
onMounted(() => {
  cargarProductos();
  cargarProveedores();
  cargarCategorias();
});

const cargarProveedores = () => {
  return apiService.get('/proveedores')
    .then(res => {
      proveedores.value = res.data;
      options.value = res.data; // <-- aquí
    });
};

const cargarCategorias = () => {
  return apiService.get('/categorias')
    .then(res => {
      categorias.value = res.data;
      optionsCategoria.value = res.data;
    });
};

const cargarProductos = () => {
    loading.value = true;
    return apiService.get('/productos')
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
    registroSeleccionado.value = true;
    modoEdicion.value = false;
  };

  // Función para editar
  const editarRegistro = async (registro) => {
    //await cargarProveedores();
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
    optionsCategoria.value = [...categorias.value]

    registroSeleccionado.value = false;
    modoEdicion.value = true;
    precioVentaManual.value = false;
  };


// Función para eliminar
const eliminarRegistro = () => {
  apiService.delete('/productos', formData.id)
    .then(() => {
      inventario.value = inventario.value.filter(p => p.id !== formData.id)
      nuevoRegistro() // Limpia el formulario
    })
    .catch(() => {
      // El error ya lo muestra apiService
    })
};

// Función para validar y guardar los cambios
const guardarRegistro = () => {
  errores.value = validarCampos(formData, reglasProducto);
  if (Object.keys(errores.value).length > 0) return;

  if (formData.id === null) {
    apiService.post('/productos', formData)
      .then(response => {
        inventario.value.push(response.data) // agrega el cliente retornado
        cargarProductos();
        modoEdicion.value = false
      })
      .catch(() => {
        // El error ya se maneja automáticamente con Notify en apiService
      })
  } else {
    apiService.put('/productos', formData)
    .then(async () => {
      await cargarProductos(); // esperar que se recargue con relaciones completas
      modoEdicion.value = false;
    })
    .catch(() => {
      // El error ya lo muestra apiService
    });
  }
};
</script>
