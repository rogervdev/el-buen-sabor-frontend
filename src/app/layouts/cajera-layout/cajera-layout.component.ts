import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';

@Component({
  selector: 'app-cajera-layout',
  standalone: true,
  imports: [RouterOutlet, MenubarModule, ButtonModule, BadgeModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Barra superior -->
      <p-menubar [model]="menuItems" class="shadow-md">
        <ng-template pTemplate="start">
          <div class="flex items-center gap-2 ml-2">
            <i class="pi pi-utensils text-xl text-orange-600"></i>
            <span class="font-bold text-xl text-gray-800">El Buen Sabor</span>
          </div>
        </ng-template>
        <ng-template pTemplate="end">
          <div class="flex items-center gap-3 mr-2">
            <p-badge value="Cajera" severity="success" class="text-sm"></p-badge>
            <button pButton label="Dashboard" icon="pi pi-chart-bar" 
                    class="p-button-text" (click)="irDashboard()"></button>
          </div>
        </ng-template>
      </p-menubar>

      <!-- Contenido principal -->
      <div class="p-6">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class CajeraLayoutComponent {
  menuItems: any[] = [];

  constructor() {
    this.menuItems = [
      {
        label: 'Pedidos',
        icon: 'pi pi-shopping-cart',
        routerLink: '/cajera/pedidos',
        routerLinkActiveOptions: { exact: true }
      },
      {
        label: 'Historial',
        icon: 'pi pi-history',
        routerLink: '/cajera/historial'
      },
      {
        label: 'Clientes',
        icon: 'pi pi-users',
        routerLink: '/cajera/clientes'
      }
    ];
  }

  irDashboard() {
    // Navegar al dashboard
    console.log('Ir a dashboard');
  }
}