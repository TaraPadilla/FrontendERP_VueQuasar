<template>
  <q-select
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
    option-value="value"
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
</template>

<script setup>
import { onMounted, ref } from 'vue'
import clientesData from '../terceros.json'

const props = defineProps({
  modelValue: Object
})

const emit = defineEmits(['update:modelValue'])

const allClientes = ref([])
const filteredOptions = ref([])

const updateValue = (val) => {
  emit('update:modelValue', val)
}

const buildLabel = (cliente) =>
  `${cliente.nombre_completo} - ${cliente.numero_documento}`

onMounted(() => {
  allClientes.value = clientesData.clientes.map(cliente => ({
    label: buildLabel(cliente),
    value: cliente
  }))
  filteredOptions.value = allClientes.value
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
