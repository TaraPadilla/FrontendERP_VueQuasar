<template>
  <div>
    <q-select
      v-if="!cargando"
      filled
      clearable
      :model-value="modelValue"
      @update:model-value="updateValue"
      label="Selecciona un cliente"
      :options="filteredOptions"
      use-input
      input-debounce="0"
      @filter="filterClientes"
      option-label="label"
      :track-by="'id'"
      style="width: 300px"
      behavior="menu"
    >
      <template v-slot:no-option>
        <q-item>
          <q-item-section class="text-grey">
            No se encontraron clientes
          </q-item-section>
        </q-item>
      </template>
    </q-select>

    <q-skeleton
      v-else
      height="56px"
      width="300px"
      animation="wave"
      class="rounded-borders"
    />
  </div>
</template>

<script setup>
import apiService from 'src/services/apiService'
import { onMounted, ref } from 'vue'

const props = defineProps({
  modelValue: Object
})

const emit = defineEmits(['update:modelValue'])

const allClientes = ref([])
const filteredOptions = ref([])
const cargando = ref(true)

const updateValue = (val) => {
  emit('update:modelValue', val)
}

const buildLabel = (cliente) =>
  `${cliente.nombre_completo} - ${cliente.tipo_documento} ${cliente.numero_documento}`

onMounted(() => {
  apiService.get('/clientes')
    .then(response => {
      const options = response.data.map(cliente => ({
        ...cliente,
        label: buildLabel(cliente)
      }))
      allClientes.value = options
      filteredOptions.value = options
    })
    .finally(() => {
      cargando.value = false
    })
})

const filterClientes = (val, update) => {
  if (val === '') {
    update(() => {
      filteredOptions.value = allClientes.value
    })
    return
  }

  const needle = val.toLowerCase()
  update(() => {
    filteredOptions.value = allClientes.value.filter(opt =>
      opt.label.toLowerCase().includes(needle)
    )
  })
}
</script>
