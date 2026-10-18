import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { PedidoService } from '../../../../core/services/pedido.service'; // ⚠️ AJUSTA ESTA RUTA A TU SERVICIO REAL
import { PedidoResponse } from '../../../../shared/models/pedido.model';   // ⚠️ AJUSTA ESTA RUTA A TUS MODELOS

@Component({
  selector: 'app-historial-pedidos',
  standalone: true,
  imports: [
    CommonModule,
    DialogModule,
    ButtonModule,
    ToastModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast position="top-right"></p-toast>
    <p-confirmdialog></p-confirmdialog>

    <div class="container">
      <header class="header">
        <div>
          <h1 class="title">📜 Historial de Pedidos</h1>
          <p class="subtitle">Pedidos del día {{fechaHoy}}</p>
        </div>
        <button class="btn-refresh" (click)="cargarPedidos()">🔄 Actualizar</button>
      </header>

      <!-- Resumen del día -->
      <div class="resumen-cards">
        <div class="resumen-card">
          <span class="resumen-numero">{{pedidos.length}}</span>
          <span class="resumen-label">Total Pedidos</span>
        </div>
        <div class="resumen-card">
          <span class="resumen-numero">{{totalVentas | currency:'S/ ':'symbol':'1.2-2'}}</span>
          <span class="resumen-label">Ventas del Día</span>
        </div>
        <div class="resumen-card">
          <span class="resumen-numero">{{pedidosPendientes}}</span>
          <span class="resumen-label">Pendientes</span>
        </div>
      </div>

      <!-- Filtros por estado -->
      <div class="filtros">
        <button 
          *ngFor="let estado of estados" 
          class="filtro-btn" 
          [class.active]="filtroEstado === estado"
          (click)="aplicarFiltro(estado)">
          {{estado}}
        </button>
      </div>

      <!-- Tabla de pedidos -->
      <div class="table-container">
        <table class="simple-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Hora</th>
              <th>Cliente</th>
              <th>Items</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let pedido of pedidosFiltrados">
              <td><strong>#{{pedido.id}}</strong></td>
              <td>{{pedido.fechaHora | date:'HH:mm'}}</td>
              <td>
                <div class="cliente-info">
                  <div class="cliente-nombre">{{pedido.clienteNombre}}</div>
                  <div class="cliente-tipo">{{pedido.tipo}} · {{pedido.tipoVenta}}</div>
                </div>
              </td>
              <td>{{pedido.detalles.length}}</td>
              <td class="total-cell">S/ {{pedido.total.toFixed(2)}}</td>
              <td>
                <span class="badge" [class]="getEstadoClass(pedido.estado)">
                  {{pedido.estado}}
                </span>
              </td>
              <td class="actions-cell">
                <button class="btn-action btn-view" (click)="verDetalle(pedido)">👁️ Ver</button>
                <button 
                  *ngIf="pedido.estado !== 'ANULADO' && pedido.estado !== 'ENTREGADO'"
                  class="btn-action btn-next" 
                  (click)="avanzarEstado(pedido)">
                  ➡️ {{getSiguienteEstado(pedido.estado)}}
                </button>
                <button 
                  *ngIf="pedido.estado !== 'ANULADO' && pedido.estado !== 'ENTREGADO'"
                  class="btn-action btn-cancel" 
                  (click)="confirmarAnular(pedido)">
                  ❌ Anular
                </button>
              </td>
            </tr>
            <tr *ngIf="pedidosFiltrados.length === 0">
              <td colspan="7" class="empty-row">No hay pedidos para mostrar</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal de Detalle del Pedido -->
    <p-dialog 
      [(visible)]="modalDetalleVisible" 
      header="📋 Detalle del Pedido" 
      [modal]="true" 
      [style]="{ width: '600px' }"
      [draggable]="false"
      [resizable]="false">
      
      <div *ngIf="pedidoSeleccionado" class="detalle-container">
        <div class="detalle-header">
          <div class="detalle-info">
            <h3>Pedido #{{pedidoSeleccionado.id}}</h3>
            <p>{{pedidoSeleccionado.clienteNombre}} · {{pedidoSeleccionado.tipo}} · {{pedidoSeleccionado.tipoVenta}}</p>
          </div>
          <span class="badge" [class]="getEstadoClass(pedidoSeleccionado.estado)">
            {{pedidoSeleccionado.estado}}
          </span>
        </div>

        <div class="detalle-items">
          <div *ngFor="let detalle of pedidoSeleccionado.detalles" class="detalle-item">
            <div class="detalle-item-info">
              <div class="detalle-item-nombre">
                {{detalle.nombrePlatoCarta || detalle.nombreSegundo}}
              </div>
              <div class="detalle-item-extras" *ngIf="detalle.nombreEntrada || detalle.nombreBebida || detalle.nombrePresa">
                <span *ngIf="detalle.nombreEntrada">+ {{detalle.nombreEntrada}}</span>
                <span *ngIf="detalle.nombreBebida">+ {{detalle.nombreBebida}}</span>
                <span *ngIf="detalle.nombrePresa" class="presa-tag">Con {{detalle.nombrePresa}}</span>
              </div>
              <div class="detalle-item-observacion" *ngIf="detalle.observacion">
                "{{detalle.observacion}}"
              </div>
            </div>
            <div class="detalle-item-right">
              <span class="detalle-item-cantidad">x{{detalle.cantidad}}</span>
              <span class="detalle-item-precio">S/ {{(detalle.precioUnitario * detalle.cantidad).toFixed(2)}}</span>
            </div>
          </div>
        </div>

        <div class="detalle-total">
          <div class="total-row">
            <span>Subtotal</span>
            <span>S/ {{(pedidoSeleccionado.total - (pedidoSeleccionado.costoDescartable || 0) - (pedidoSeleccionado.costoDelivery || 0)).toFixed(2)}}</span>
          </div>
          <div class="total-row" *ngIf="pedidoSeleccionado.costoDescartable && pedidoSeleccionado.costoDescartable > 0">
            <span>Descartable</span>
            <span>S/ {{pedidoSeleccionado.costoDescartable.toFixed(2)}}</span>
          </div>
          <div class="total-row" *ngIf="pedidoSeleccionado.costoDelivery && pedidoSeleccionado.costoDelivery > 0">
            <span>Delivery</span>
            <span>S/ {{pedidoSeleccionado.costoDelivery.toFixed(2)}}</span>
          </div>
          <div class="total-row final">
            <span>TOTAL</span>
            <span>S/ {{pedidoSeleccionado.total.toFixed(2)}}</span>
          </div>
          <div class="total-row" *ngIf="pedidoSeleccionado.metodoPago === 'EFECTIVO'">
            <span>Pagó con</span>
            <span>S/ {{pedidoSeleccionado.montoRecibido?.toFixed(2)}}</span>
          </div>
          <div class="total-row" *ngIf="pedidoSeleccionado.metodoPago === 'EFECTIVO'">
            <span>Vuelto</span>
            <span>S/ {{pedidoSeleccionado.vuelto?.toFixed(2)}}</span>
          </div>
        </div>
      </div>
    </p-dialog>
  `,
  styles: [`
    .container { max-width: 1400px; margin: 0 auto; padding: 2rem; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 1px solid #eaeaea; }
    .title { font-size: 1.75rem; font-weight: 600; margin: 0 0 0.25rem 0; }
    .subtitle { font-size: 0.9rem; color: #666; margin: 0; }
    .btn-refresh { background: #f5f5f5; border: none; padding: 0.65rem 1.25rem; border-radius: 8px; cursor: pointer; font-weight: 500; transition: all 0.2s; }
    .btn-refresh:hover { background: #e5e5e5; }

    .resumen-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
    .resumen-card { background: #fff; padding: 1.5rem; border-radius: 12px; border: 1px solid #e5e5e5; display: flex; flex-direction: column; align-items: center; }
    .resumen-numero { font-size: 2rem; font-weight: 700; color: #1a1a1a; }
    .resumen-label { font-size: 0.85rem; color: #666; margin-top: 0.5rem; }

    .filtros { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
    .filtro-btn { padding: 0.5rem 1rem; border: 1px solid #e5e5e5; background: #fff; border-radius: 20px; cursor: pointer; font-size: 0.85rem; font-weight: 500; transition: all 0.2s; }
    .filtro-btn:hover { border-color: #16a34a; color: #16a34a; }
    .filtro-btn.active { background: #16a34a; color: #fff; border-color: #16a34a; }

    .table-container { background: #fff; border-radius: 12px; border: 1px solid #e5e5e5; overflow: hidden; }
    .simple-table { width: 100%; border-collapse: collapse; }
    .simple-table th { background: #fafafa; padding: 1rem; text-align: left; font-size: 0.85rem; font-weight: 600; color: #666; text-transform: uppercase; border-bottom: 2px solid #e5e5e5; }
    .simple-table td { padding: 1rem; border-bottom: 1px solid #f0f0f0; font-size: 0.95rem; vertical-align: middle; }
    .simple-table tr:hover { background: #fafafa; }
    .empty-row { text-align: center; padding: 2rem !important; color: #999; }

    .cliente-info { display: flex; flex-direction: column; gap: 0.25rem; }
    .cliente-nombre { font-weight: 600; }
    .cliente-tipo { font-size: 0.8rem; color: #666; }
    .total-cell { font-weight: 700; color: #16a34a; }

    .badge { padding: 0.35rem 0.75rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600; display: inline-block; }
    .badge-pendiente { background: #fef3c7; color: #92400e; }
    .badge-en_cocina { background: #dbeafe; color: #1e40af; }
    .badge-listo { background: #e0e7ff; color: #3730a3; }
    .badge-entregado { background: #f0fdf4; color: #166534; }
    .badge-anulado { background: #fef2f2; color: #991b1b; }

    .actions-cell { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .btn-action { border: none; padding: 0.4rem 0.75rem; border-radius: 6px; cursor: pointer; font-size: 0.8rem; font-weight: 500; transition: all 0.2s; }
    .btn-view { background: #eff6ff; color: #1d4ed8; }
    .btn-view:hover { background: #dbeafe; }
    .btn-next { background: #f0fdf4; color: #166534; }
    .btn-next:hover { background: #dcfce7; }
    .btn-cancel { background: #fef2f2; color: #991b1b; }
    .btn-cancel:hover { background: #fee2e2; }

    .detalle-container { display: flex; flex-direction: column; gap: 1.5rem; }
    .detalle-header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 1rem; border-bottom: 1px solid #e5e5e5; }
    .detalle-header h3 { margin: 0 0 0.25rem 0; font-size: 1.25rem; }
    .detalle-header p { margin: 0; color: #666; font-size: 0.9rem; }
    .detalle-items { display: flex; flex-direction: column; gap: 0.75rem; }
    .detalle-item { display: flex; justify-content: space-between; align-items: flex-start; padding: 0.75rem; background: #fafafa; border-radius: 8px; }
    .detalle-item-nombre { font-weight: 600; margin-bottom: 0.25rem; }
    .detalle-item-extras { font-size: 0.85rem; color: #666; display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .presa-tag { color: #92400e; background: #fef3c7; padding: 0.1rem 0.4rem; border-radius: 4px; }
    .detalle-item-observacion { font-size: 0.8rem; color: #dc2626; font-style: italic; margin-top: 0.25rem; }
    .detalle-item-right { display: flex; flex-direction: column; align-items: flex-end; gap: 0.25rem; }
    .detalle-item-cantidad { font-size: 0.85rem; color: #666; }
    .detalle-item-precio { font-weight: 700; color: #16a34a; }
    .detalle-total { border-top: 2px solid #1a1a1a; padding-top: 1rem; display: flex; flex-direction: column; gap: 0.5rem; }
    .total-row { display: flex; justify-content: space-between; font-size: 0.95rem; }
    .total-row.final { font-size: 1.25rem; font-weight: 700; }
  `]
})
export class HistorialPedidosComponent implements OnInit {
  private pedidoService = inject(PedidoService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  pedidos: PedidoResponse[] = [];
  pedidosFiltrados: PedidoResponse[] = [];
  filtroEstado: string = 'TODOS';
  estados = ['TODOS', 'PENDIENTE', 'EN_COCINA', 'LISTO', 'ENTREGADO', 'ANULADO'];
  
  modalDetalleVisible = false;
  pedidoSeleccionado: PedidoResponse | null = null;

  ngOnInit() {
    this.cargarPedidos();
  }

  get fechaHoy(): string {
    return new Date().toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  get totalVentas(): number {
    return this.pedidos.filter(p => p.estado !== 'ANULADO').reduce((sum, p) => sum + p.total, 0);
  }

  get pedidosPendientes(): number {
    return this.pedidos.filter(p => p.estado === 'PENDIENTE').length;
  }

  cargarPedidos() {
    this.pedidoService.getPedidosDelDia().subscribe({
      next: (pedidos) => {
        this.pedidos = pedidos;
        this.aplicarFiltro(this.filtroEstado);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los pedidos' });
      }
    });
  }

  aplicarFiltro(estado: string) {
    this.filtroEstado = estado;
    this.pedidosFiltrados = estado === 'TODOS' ? this.pedidos : this.pedidos.filter(p => p.estado === estado);
  }

  getEstadoClass(estado: string): string {
    return 'badge-' + estado.toLowerCase();
  }

  getSiguienteEstado(estado: string): string {
    const flujo: { [key: string]: string } = { 'PENDIENTE': 'EN_COCINA', 'EN_COCINA': 'LISTO', 'LISTO': 'ENTREGADO' };
    return flujo[estado] || '';
  }

  verDetalle(pedido: PedidoResponse) {
    this.pedidoSeleccionado = pedido;
    this.modalDetalleVisible = true;
  }

  avanzarEstado(pedido: PedidoResponse) {
    const siguiente = this.getSiguienteEstado(pedido.estado);
    if (!siguiente) return;

    this.confirmationService.confirm({
      message: `¿Mover pedido #${pedido.id} a "${siguiente}"?`,
      header: 'Cambiar Estado',
      icon: 'pi pi-arrow-right',
      acceptLabel: 'Sí, avanzar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.pedidoService.cambiarEstado(pedido.id, siguiente).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Estado actualizado', detail: `Pedido #${pedido.id} → ${siguiente}` });
            this.cargarPedidos();
          },
          error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'No se pudo cambiar el estado' })
        });
      }
    });
  }

  confirmarAnular(pedido: PedidoResponse) {
    this.confirmationService.confirm({
      message: `¿Estás seguro de anular el pedido #${pedido.id}?\n\nEsta acción devolverá el stock de los productos.`,
      header: 'Anular Pedido',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, anular',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.pedidoService.anularPedido(pedido.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Pedido anulado', detail: `Pedido #${pedido.id} anulado y stock devuelto` });
            this.cargarPedidos();
          },
          error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'No se pudo anular el pedido' })
        });
      }
    });
  }
}