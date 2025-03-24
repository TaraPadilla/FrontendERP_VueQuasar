<template>
  <q-page>
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

              <q-input v-model="categoria.nombre" label="Nombre" :disable="!modoEdicion" />
              <q-select
                filled
                v-model="categoria.tipo"
                use-input
                input-debounce="0"
                label="Tipo"
                :options="options"
                @filter="filterTipos"
                @update:model-value="onChangeTipo"
                emit-value
                map-options
                behavior="menu"
                new-value-mode="add"
                :disable="!modoEdicion"
              />


            </q-form>
          </q-card-section>
        </q-card>
      </template>

      <template #table>
        <q-table
          flat
          bordered
          title="Categorías"
          :rows="categorias"
          :columns="columns"
          :loading="loading"
          :rows-per-page-options="[10]"
          :rows-per-page="10"
          virtual-scroll
          row-key="id"
          @row-click="seleccionarRegistro"
        >
          <template #loading>
            <div class="row items-center justify-center q-pa-md">
              <q-spinner-gears color="primary" size="40px" />
              <div class="q-ml-md text-primary text-h6">Cargando categorías...</div>
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
import { validarCampos } from "src/services/validationService.js";
import { computed, onMounted, reactive, ref } from "vue";

const categoria = reactive({
  id: null,
  nombre: "",
  tipo: ""
});

const categorias = ref([]);
const tiposDisponibles = ref([]);
const options = ref([]);

const registroSeleccionado = ref(false);
const modoEdicion = ref(false);
const errores = ref({});
const loading = ref(false);

const columns = [
  { name: "nombre", label: "Nombre", field: "nombre", align: "left" },
  { name: "tipo", label: "Tipo", field: "tipo", align: "left" }
];

const puedeGuardar = computed(() => {
  const reglas = {
    nombre: { requerido: true, max: 100 },
    tipo: { requerido: true, max: 20 }
  };
  return modoEdicion.value && Object.keys(validarCampos(categoria, reglas)).length === 0;
});

onMounted(() => {
  cargarCategorias();
});

const filterTipos = (val, update) => {
  const needle = val.toLowerCase();
  update(() => {
    options.value = val
      ? tiposDisponibles.value.filter(t => t.label.toLowerCase().includes(needle))
      : [...tiposDisponibles.value];

    // Si el valor no existe, lo agregamos como opción nueva visible
    if (val && !tiposDisponibles.value.find(t => t.label.toLowerCase() === val.toLowerCase())) {
      options.value.unshift({ label: val, value: val });
    }
  });
};

  const onChangeTipo = (valor) => {
    // Si valor es un string plano, lo usamos directamente
    if (typeof valor === 'string') {
      categoria.tipo = valor;

      // Si no existe aún en la lista, lo agregamos como nueva opción
      if (!tiposDisponibles.value.find(t => t.value === valor)) {
        const nuevoTipo = { label: valor, value: valor };
        tiposDisponibles.value.unshift(nuevoTipo);
      }
    } else if (valor && valor.value) {
      categoria.tipo = valor.value;
    }
  };



const cargarCategorias = () => {
  loading.value = true;
  apiService.get('/categorias')
    .then(response => {
      categorias.value = response.data;
      // Extraer tipos únicos y preparar como objetos
      const tipos = response.data.map(c => c.tipo).filter(Boolean);
      const unicos = [...new Set(tipos)];
      tiposDisponibles.value = unicos.map(t => ({ label: t, value: t }));
      options.value = [...tiposDisponibles.value];
    })
    .catch(() => {})
    .finally(() => {
      loading.value = false;
    });
};

const seleccionarRegistro = (evt, row) => {
  Object.assign(categoria, row);
  registroSeleccionado.value = true;
  modoEdicion.value = false;
};

const editarRegistro = () => {
  modoEdicion.value = true;
};

const nuevoRegistro = () => {
  Object.assign(categoria, { id: null, nombre: "", tipo: "" });
  registroSeleccionado.value = false;
  modoEdicion.value = true;
};

const eliminarRegistro = () => {
  apiService.delete('/categorias', categoria.id)
    .then(() => {
      categorias.value = categorias.value.filter(p => p.id !== categoria.id);
      nuevoRegistro();
    })
    .catch(() => {});
};

const guardarRegistro = () => {
  const reglas = {
    nombre: { requerido: true, max: 100 },
    tipo: { requerido: true, max: 20 }
  };

  errores.value = validarCampos(categoria, reglas);
  if (Object.keys(errores.value).length > 0) return;

  if (categoria.id === null) {
    apiService.post('/categorias', categoria)
      .then(response => {
        categorias.value.push(response.data);
        modoEdicion.value = false;
      })
      .catch(() => {});
  } else {
    apiService.put('/categorias', categoria)
      .then(response => {
        const index = categorias.value.findIndex(p => p.id === categoria.id);
        if (index !== -1) categorias.value[index] = response.data;
        modoEdicion.value = false;
      })
      .catch(() => {});
  }
};
</script>
