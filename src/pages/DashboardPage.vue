<template>
  <q-page class="q-pa-md">
    <!-- Filtro de fecha -->
    <div class="row q-col-gutter-md q-mb-md items-center">
      <div class="col-12 col-md-4">
        <q-input :model-value="textoRangoFechas" label="Filtrar por Rango de Fechas" readonly dense filled>
          <template #append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date v-model="rangoFechas" range emit-immediately>
                  <div class="row items-center justify-end q-gutter-sm q-pa-sm">
                    <q-btn label="Cerrar" color="primary" flat v-close-popup />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </div>
      <div class="col-12 col-md-8 text-grey text-caption">
        <div v-if="rangoFechas && rangoFechas.from && rangoFechas.to">
          Mostrando desde <strong>{{ rangoFechas.from }}</strong> hasta <strong>{{ rangoFechas.to }}</strong> — {{ gananciasFiltradas.length }} registros encontrados.<br />
          Fechas encontradas: <span v-for="g in gananciasFiltradas" :key="g.fecha">{{ g.fecha }}, </span>
        </div>
        <div v-else>
          No se ha seleccionado ningún rango. Mostrando todos los datos.
        </div>
      </div>
    </div>

    <!-- Tarjetas resumen -->
    <div class="row q-col-gutter-md q-mb-md">
      <q-card class="col-12 col-md-4" flat bordered>
        <q-card-section>
          <div class="text-h6">Total Ventas</div>
          <div class="text-subtitle1 text-primary">${{ resumenFiltrado.total_ventas.toLocaleString('es-CO') }}</div>
        </q-card-section>
      </q-card>
      <q-card class="col-12 col-md-4" flat bordered>
        <q-card-section>
          <div class="text-h6">Total Gastos</div>
          <div class="text-subtitle1 text-negative">${{ resumenFiltrado.total_gastos.toLocaleString('es-CO') }}</div>
        </q-card-section>
      </q-card>
      <q-card class="col-12 col-md-4" flat bordered>
        <q-card-section>
          <div class="text-h6">Ganancia Neta</div>
          <div class="text-subtitle1 text-positive">${{ resumenFiltrado.ganancia_neta.toLocaleString('es-CO') }}</div>
        </q-card-section>
      </q-card>
    </div>
    <!-- Area de porcentaje -->
    <q-row class="q-mt-md">
      <q-col cols="12" sm="6" md="4">
        <q-card class="bg-indigo-1 text-indigo-10 shadow-4 bordered">
          <q-card-section class="row items-center justify-between">
            <div class="text-h6">Ganancia por porcentaje</div>
            <q-input
              v-model.number="porcentajeSocio"
              type="number"
              min="0"
              max="100"
              dense
              outlined
              suffix="%"
              class="q-ml-sm"
              style="width: 100px"
            />
          </q-card-section>
          <q-card-section class="text-center">
            <div class="text-h4">
              {{ gananciaSocio }}
            </div>
            <div class="text-caption">del {{ porcentajeSocio }}% de la ganancia neta</div>
          </q-card-section>
        </q-card>
      </q-col>
    </q-row>


    <!-- Gráfico: Ganancias diarias -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div class="text-h6">Ganancias Diarias</div>
        <apexcharts v-if="graficaGanancias.series[0].data.length" type="area" height="350" :options="graficaGanancias.options" :series="graficaGanancias.series" />
        <div v-else class="text-center q-pa-md text-grey">No hay datos en el rango seleccionado</div>
      </q-card-section>
    </q-card>

    <!-- Gráfico: Gastos por categoría y Productos Top -->
    <div class="row q-col-gutter-md">
      <q-card flat bordered class="col-12 col-md-6">
        <q-card-section>
          <div class="text-h6">Gastos por Categoría</div>
          <apexcharts type="donut" height="300" :options="graficaGastos.options" :series="graficaGastos.series" />
        </q-card-section>
      </q-card>

      <q-card flat bordered class="col-12 col-md-6">
        <q-card-section>
          <div class="text-h6">Ganancia por Tipo</div>
          <apexcharts type="donut" height="300" :options="chartGananciaTipo.options" :series="chartGananciaTipo.series" />
        </q-card-section>
      </q-card>

      <q-card flat bordered class="col-12 col-md-8">
        <q-card-section>
          <div class="text-h6">Productos Más Rentables</div>
          <apexcharts type="bar" height="500" :options="graficaProductos.options" :series="graficaProductos.series" />
        </q-card-section>
      </q-card>
    </div>
  </q-page>

</template>

<script setup>
import data from 'src/ganancias.json'
import apiService from 'src/services/apiService'
import { formatearPesos } from 'src/utils/utils'
import { computed, defineAsyncComponent, onMounted, ref, watch } from 'vue'

const apexcharts = defineAsyncComponent(() => import('vue3-apexcharts'))

const rangoFechas = ref(null)
const fromDate = ref(null)
const toDate = ref(null)
const ganancias = ref([])
const gastos = ref([])
const porcentajeSocio = ref(20)
const gananciaPorTipo = ref([])

const gananciaSocio = computed(() => {
  if (!resumenFiltrado.value) return 0
  return '$' + formatearPesos((resumenFiltrado.value.ganancia_neta * porcentajeSocio.value) / 100)
})

const cargarGananciaPorTipo  = async () => {
  try {
    const params = {}
    if (fromDate.value) params.from = fromDate.value
    if (toDate.value) params.to = toDate.value

    const response = await apiService.get('/ganancias-por-tipo', params)
    gananciaPorTipo.value = response.data
  } catch (error) {
    // Interceptor ya maneja errores
  }
}

const cargarGastos = async () => {
  try {
    const params = {}
    if (fromDate.value) params.from = fromDate.value
    if (toDate.value) params.to = toDate.value

    const response = await apiService.get('/gastos-por-categoria', params)
    gastos.value = response.data
  } catch (error) {
    // Interceptor ya maneja errores
  }
}


const cargarKpis = async () => {
  try {
    const params = {}
    if (fromDate.value) params.from = fromDate.value
    if (toDate.value) params.to = toDate.value

    const response = await apiService.get('/kpi-dashboard', params)
    console.log(response.data)
    resumenFiltrado.value = response.data

  } catch (error) {
    // Ya está manejado por el interceptor de apiService
  }
}

const cargarGanancias = async () => {
  try {
    const params = {}
    if (fromDate.value) params.from = fromDate.value
    if (toDate.value) params.to = toDate.value

    const response = await apiService.get('/ganancias-diarias', params)
    ganancias.value = response.data
  } catch (error) {
    // Manejo ya está en el interceptor
  }
}

const cargarProductos = async () => {
  try {
    const params = {}
    if (fromDate.value) params.from = fromDate.value
    if (toDate.value) params.to = toDate.value

    const response = await apiService.get('/productos-rentables', params)
    productos.value = response.data
  } catch (error) {
    // Manejo por interceptor
  }
}

onMounted(() => {
  cargarKpis()
  cargarGanancias()
  cargarGastos()
  cargarProductos()
  cargarGananciaPorTipo()
});
watch([fromDate, toDate], () => {
  cargarKpis()
  cargarGanancias()
  cargarGastos()
  cargarProductos()
  cargarGananciaPorTipo()
})
watch(rangoFechas, (nuevo) => {
  if (nuevo && nuevo.from && nuevo.to) {
    fromDate.value = nuevo.from
    toDate.value = nuevo.to
  } else {
    fromDate.value = null
    toDate.value = null
  }
})

const textoRangoFechas = computed(() => {
  if (!rangoFechas.value || !rangoFechas.value.from || !rangoFechas.value.to) return ''
  return `${rangoFechas.value.from} a ${rangoFechas.value.to}`
})

const resumen = data.resumen

const productos = ref([])

const gananciasFiltradas = computed(() => {
  if (!rangoFechas.value || !rangoFechas.value.from || !rangoFechas.value.to) {
    return ganancias.value
  }
  const normalize = str => str.replaceAll('/', '-');
  const desde = normalize(rangoFechas.value.from)
  const hasta = normalize(rangoFechas.value.to)
  return ganancias.value.filter(g => g.fecha >= desde && g.fecha <= hasta)
})

const resumenFiltrado = ref({
  total_ventas: 0,
  total_gastos: 0,
  ganancia_neta: 0
})

const graficaGanancias = computed(() => ({
  series: [
    {
      name: 'Ganancia Neta',
      data: gananciasFiltradas.value.map(g => g.ganancia)
    }
  ],
  options: {
    chart: { id: 'ganancias-diarias', toolbar: { show: false } },
    xaxis: {
      categories: gananciasFiltradas.value.map(g => g.fecha)
    },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth' },
    colors: ['#21BA45'],
    tooltip: {
      y: {
        formatter: (val) => {
          return '$' + val.toLocaleString('es-CO');
        }
      }
    }
  }
}))

const graficaGastos = computed(() => ({
  series: gastos.value.map(g => parseFloat(g.total) || 0),
  options: {
    labels: gastos.value.map(g => g.categoria),
    legend: { position: 'bottom' },
    tooltip: {
      y: {
        formatter: (val) => {
          return '$' + val.toLocaleString('es-CO');
        }
      }
    },
    colors: ['#F44336', '#FF9800', '#FFC107', '#4CAF50', '#2196F3', '#9C27B0', '#00BCD4', '#8BC34A', '#607D8B', '#795548']
  }
}))

const chartGananciaTipo = computed(() => ({
  series: gananciaPorTipo.value.map(g => parseFloat(g.ganancia) || 0),
  options: {
    labels: gananciaPorTipo.value.map(g => g.tipo_pago),
    legend: { position: 'bottom' },
    colors: ['#F44336', '#FF9800', '#FFC107', '#4CAF50', '#2196F3', '#9C27B0', '#00BCD4', '#8BC34A', '#607D8B', '#795548'],
    tooltip: {
      y: {
        formatter: (val) => {
          return '$' + val.toLocaleString('es-CO');
        }
      }
    }

  }
}))


const graficaProductos = computed(() => ({
  series: [
    {
      name: 'Ganancia Total',
      data: productos.value.map(p => parseFloat(p.ganancia_total) || 0)
    }
  ],
  options: {
    chart: { id: 'productos-top', toolbar: { show: false } },
    xaxis: {
      categories: productos.value.map(p => p.nombre)
    },
    colors: ['#3F51B5'],
    tooltip: {
      y: {
        formatter: (val) => {
          return '$' + val.toLocaleString('es-CO');
        }
      }
    },
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return '$' + val.toLocaleString('es-CO')
      },
      style: {
        fontWeight: 'bold',
        colors: ['#fff']
      }
    }
  }
}))


</script>

<style scoped>
.text-h6 {
  font-weight: 600;
}
</style>
