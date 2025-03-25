<template>
  <q-layout view="hHh Lpr fFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          Importadora Ospina Cos
        </q-toolbar-title>

        <div>ERP F1 {{ $q.version }}</div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      overlay
      bordered
      behavior="mobile"
      no-header
    >
      <!-- Encabezado dentro del menú -->
      <q-item class="q-pa-md bg-primary text-white">
        <q-item-section avatar>
          <q-img src="src/assets/logo.png" style="width: 40px; height: 40px;" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-h6">Importadora Ospina Cos</q-item-label>
          <q-item-label caption>Versión 1.0</q-item-label>
        </q-item-section>
      </q-item>

  <q-separator />
      <q-list>
        <q-item-label header >
          Módulos
        </q-item-label>

        <EssentialLink
          v-for="link in linksList"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import EssentialLink from 'components/EssentialLink.vue'
import { ref } from 'vue'

const linksList = [
  {
    title: 'Inicio',
    caption: 'Página principal',
    icon: 'home',
    to: '/dashboard' // Redirige a la página principal
  },
  {
    title: 'Inventario',
    caption: 'Gestión de inventario',
    icon: 'inventory',
    to: '/inventario' // Redirige al CRUD de productos
  },
  {
    title: 'Terceros',
    caption: 'Gestión de terceros',
    icon: 'people',
    to: '/terceros' // Redirige al CRUD de productos
  },
  {
    title: 'Ventas',
    caption: 'Gestión de ventas',
    icon: 'shopping_cart',
    to: '/ventas' // Redirige al CRUD de productos
  },
  {
    title: 'Pagos',
    caption: 'Gestión de pagos',
    icon: 'payment',
    to: '/pagos' // Redirige al CRUD de productos
  },
  {
    title: 'Gastos',
    caption: 'Gestión de gastos',
    icon: 'money_off',
    to: '/gastos' // Redirige al CRUD de productos
  },
  {
    title: 'Categorías',
    caption: 'Gestión de categorías',
    icon: 'category',
    to: '/categorias' // Redirige al CRUD de productos
  }
  // {
  //   title: 'Quasar Awesome',
  //   caption: 'Community Quasar projects',
  //   icon: 'favorite',
  //   link: 'https://awesome.quasar.dev'
  // }
]

const leftDrawerOpen = ref(false)

function toggleLeftDrawer () {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>
