import { Routes } from '@angular/router';
import { CajeraLayoutComponent } from './layouts/cajera-layout/cajera-layout.component';
import { PedidosComponent } from './features/cajera/pages/pedidos/pedidos.component';

export const routes: Routes = [
  {
    path: 'cajera',
    component: CajeraLayoutComponent,
    children: [
      {
        path: 'pedidos',
        component: PedidosComponent
      },
      {
        path: '',
        redirectTo: 'pedidos',
        pathMatch: 'full'
      }
    ]
  },
  
  // ✅ 1. RUTA DEL CATÁLOGO
  {
    path: 'admin/catalogo',
    loadComponent: () => import('./features/admin/pages/admin-catalogo/admin-catalogo.component')
      .then(m => m.AdminCatalogoComponent)
  },

  // ✅ 2. RUTA DEL HISTORIAL DE PEDIDOS (NUEVA)
  {
    path: 'admin/historial',
    loadComponent: () => import('./features/admin/pages/historial-pedidos/historial-pedidos.component')
      .then(m => m.HistorialPedidosComponent)
  },
  
  // ✅ 3. Ruta por defecto (si entras a localhost:4200)
  {
    path: '',
    redirectTo: 'cajera/pedidos',
    pathMatch: 'full'
  },
  
  // ✅ 4. Ruta comodín: ¡SIEMPRE debe ir al FINAL de todo!
  {
    path: '**',
    redirectTo: 'cajera/pedidos'
  }
];