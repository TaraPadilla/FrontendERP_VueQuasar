const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('src/pages/DashboardPage.vue') },
      { path: 'inventario', component: () => import('src/pages/InventoryPage.vue') },
      { path: 'terceros', component: () => import('src/pages/TercerosPage.vue') },
      { path: 'ventas', component: () => import('src/pages/VentasPage.vue') },
      { path: 'gastos', component: () => import('src/pages/GastosPage.vue') },
      { path: 'dashboard', component: () => import('src/pages/DashboardPage.vue') }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
