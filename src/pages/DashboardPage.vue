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
          <div class="text-h6">Productos Más Rentables</div>
          <apexcharts type="bar" height="300" :options="graficaProductos.options" :series="graficaProductos.series" />
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import data from 'src/ganancias.json'
import { computed, defineAsyncComponent, ref } from 'vue'
const apexcharts = defineAsyncComponent(() => import('vue3-apexcharts'))

const rangoFechas = ref(null)

const textoRangoFechas = computed(() => {
  if (!rangoFechas.value || !rangoFechas.value.from || !rangoFechas.value.to) return ''
  return `${rangoFechas.value.from} a ${rangoFechas.value.to}`
})

const resumen = data.resumen
const ganancias = data.ganancias_diarias
const gastos = data.gastos_por_categoria
const productos = data.productos_top

const gananciasFiltradas = computed(() => {
  if (!rangoFechas.value || !rangoFechas.value.from || !rangoFechas.value.to) {
    return ganancias
  }
  const normalize = str => str.replaceAll('/', '-');
  const desde = normalize(rangoFechas.value.from)
  const hasta = normalize(rangoFechas.value.to)
  return ganancias.filter(g => g.fecha >= desde && g.fecha <= hasta)
})

const resumenFiltrado = computed(() => {
  const totalVentas = gananciasFiltradas.value.reduce((sum, g) => sum + g.ventas, 0)
  const totalGastos = gananciasFiltradas.value.reduce((sum, g) => sum + g.gastos, 0)
  return {
    total_ventas: totalVentas,
    total_gastos: totalGastos,
    ganancia_neta: totalVentas - totalGastos
  }
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
    colors: ['#21BA45']
  }
}))

const graficaGastos = {
  series: gastos.map(g => g.total),
  options: {
    labels: gastos.map(g => g.categoria),
    legend: { position: 'bottom' },
    colors: ['#F44336', '#FF9800', '#FFC107', '#4CAF50', '#2196F3', '#9C27B0', '#00BCD4', '#8BC34A', '#607D8B', '#795548']
  }
}

const graficaProductos = {
  series: [
    {
      name: 'Ganancia Total',
      data: productos.map(p => p.ganancia_total)
    }
  ],
  options: {
    chart: { id: 'productos-top', toolbar: { show: false } },
    xaxis: {
      categories: productos.map(p => p.nombre)
    },
    colors: ['#3F51B5']
  }
}
</script>

<style scoped>
.text-h6 {
  font-weight: 600;
}
</style>
