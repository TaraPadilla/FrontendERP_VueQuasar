<template>
  <q-page>
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

              <q-input v-model="cliente.nombre_completo" label="Nombre Completo" :disable="!modoEdicion"/>
              <q-select v-model="cliente.tipo_documento" :options="tipoDocumentos" label="Tipo de Documento" :disable="!modoEdicion"/>
              <q-input v-model="cliente.numero_documento" label="Número de Documento" :disable="!modoEdicion"  />
              <q-input v-model="cliente.telefono" label="Teléfono (WhatsApp)"  :disable="!modoEdicion"/>
              <q-input v-model="cliente.direccion" label="Dirección - Nomenclatura"  :disable="!modoEdicion"/>
              <q-input v-model="cliente.vereda" label="Vereda" :disable="!modoEdicion"/>
              <q-input v-model="cliente.finca" label="Finca" :disable="!modoEdicion"/>
              <q-input v-model="cliente.municipio" label="Municipio" :disable="!modoEdicion" />
              <q-input v-model="cliente.departamento" label="Departamento" :disable="!modoEdicion" />
          </q-form>
        </q-card-section>
        </q-card>
      </template>

      <template #table>
        <q-table
          flat
          bordered
          title="Clientes"
          :rows="clientes"
          :columns="columns"
          row-key="id"
          @row-click="seleccionarRegistro"
        />
      </template>
    </CrudLayout>
  </q-page>
</template>

<script setup>
import CrudLayout from "src/layouts/CrudLayout.vue";
import { reglasCliente, validarCampos } from "src/services/validationService.js";
import terceros from "src/terceros.json";
import { computed, onMounted, reactive, ref } from "vue";
import apiService from 'src/services/apiService';

    const cliente = reactive({
        id: null,
        nombre_completo: "",
        tipo_documento: "",
        numero_documento: "",
        telefono: "",
        direccion: "",
        vereda: "",
        finca: "",
        municipio: "",
        departamento: ""
    });

    const clientes = ref([]);
    const registroSeleccionado = ref(false);
    const modoEdicion = ref(false);
    const errores = ref({});

    const tipoDocumentos = ["CC", "TI", "CE", "NIT"];

    const columns = [
      { name: "nombre_completo", label: "Nombre Completo", field: "nombre_completo", align: "left" },
      { name: "tipo_documento", label: "Tipo Documento", field: "tipo_documento", align: "left" },
      { name: "numero_documento", label: "Número Documento", field: "numero_documento", align: "left" },
      { name: "telefono", label: "Teléfono", field: "telefono", align: "left" },
      { name: "direccion", label: "Dirección", field: "direccion", align: "left" }
    ];

    // Computed para habilitar el botón "Guardar"
    const puedeGuardar = computed(() => {
      return modoEdicion.value && Object.keys(validarCampos(cliente, reglasCliente)).length === 0;
    });

    onMounted(() => {
      cargarClientes();
    });

    const cargarClientes = () => {
      apiService.get('/clientes')
        .then(response => {
          clientes.value = response.data
        })
        .catch(() => {
          // El error ya se notifica automáticamente por apiService
        })
    }

    // Función para seleccionar un registro desde la tabla
    const seleccionarRegistro = (evt, row) => {
      Object.assign(cliente, row);
      registroSeleccionado.value = true;
      modoEdicion.value = false;
    };

  // Función para editar
  const editarRegistro = () => {
    modoEdicion.value = true;
  };

  // Función para iniciar un nuevo registro
  const nuevoRegistro = () => {
    Object.assign(cliente, {
      id: null,
      nombre_completo: "",
      tipo_documento: "",
      numero_documento: "",
      telefono: "",
      direccion: "",
      vereda: "",
      finca: "",
      municipio: "",
      departamento: ""
    });
    registroSeleccionado.value = false;
    modoEdicion.value = true;
  };


    // Función para eliminar
  const eliminarRegistro = () => {
    apiService.delete('/clientes', cliente.id)
    .then(() => {
      clientes.value = clientes.value.filter(p => p.id !== cliente.id)
      nuevoRegistro() // Limpia el formulario
    })
    .catch(() => {
      // El error ya lo muestra apiService
    })
  };

  // Función para validar y guardar los cambios
  const guardarRegistro = () => {
    errores.value = validarCampos(cliente, reglasCliente);
    if (Object.keys(errores.value).length > 0) return;

    if (cliente.id === null) {
      // Simula agregar un nuevo producto
      apiService.post('/clientes', cliente)
      .then(response => {
        clientes.value.push(response.data) // agrega el cliente retornado
        modoEdicion.value = false
      })
      .catch(() => {
        // El error ya se maneja automáticamente con Notify en apiService
      })
      //clientes.value.push({ ...cliente });
    } else {
      apiService.put('/clientes', cliente)
      .then(response => {
        const index = clientes.value.findIndex(p => p.id === cliente.id)
        if (index !== -1) {
          clientes.value[index] = response.data
        }
        modoEdicion.value = false
      })
      .catch(() => {
        // El error ya lo muestra apiService
      })
      // const index = clientes.value.findIndex(p => p.id === cliente.id);
      // if (index !== -1) clientes.value[index] = { ...cliente };
    }
    modoEdicion.value = false;
  };

</script>
