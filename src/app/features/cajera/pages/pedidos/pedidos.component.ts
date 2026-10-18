import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { MenuService } from '../../../../core/services/menu.service';
import { PedidoService } from '../../../../core/services/pedido.service';
import { MenuDiaResponse, PlatoMenuResponse, PresaResponse, ConfiguracionResponse, PlatoCarta } from '../../../../shared/models/menu.model';
import { PedidoRequest, PedidoDetalleRequest } from '../../../../shared/models/pedido.model';

export interface CarritoItem {
  id: number;
  platoId?: number;               // Para MENÚ
  platoCartaId?: number;          // Para CARTA
  nombrePlato: string;
  presaId?: number;
  nombrePresa?: string;
  entradaId?: number;
  nombreEntrada?: string;
  bebidaId?: number;
  nombreBebida?: string;
  cantidad: number;
  precioUnitario: number;
  observacion?: string;
}

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    ToastModule
  ],
  providers: [MessageService],
  template: `
    <p-toast position="top-right"></p-toast>
    
    <div class="container">
      <!-- Header con banner de precios -->
      <header class="header">
        <div>
          <h1 class="title">Tomar Pedido</h1>
          <p class="subtitle">{{modoVenta === 'MENU' ? 'Menú del día' : 'Platos a la carta'}}</p>
        </div>
        
        <!-- Toggle Menú / Carta -->
        <div class="modo-toggle">
          <button class="toggle-btn" [class.active]="modoVenta === 'MENU'" (click)="cambiarModo('MENU')">
            🍽️ Menú del día
          </button>
          <button class="toggle-btn" [class.active]="modoVenta === 'CARTA'" (click)="cambiarModo('CARTA')">
            🍛 Platos a la carta
          </button>
        </div>
        
        <!-- Banner de precios (siempre visible) -->
<div class="price-banner">
  <div class="price-item">
    <span class="price-label">Menú</span>
    <span class="price-value">S/ {{config?.precioMenu || 10}}</span>
  </div>
  <div class="price-divider"></div>
  <div class="price-item">
    <span class="price-label">Taper</span>
    <span class="price-value">S/ {{config?.costoDescartable || 2}}</span>
  </div>
  <div class="price-divider"></div>
  <div class="price-item">
    <span class="price-label">Delivery</span>
    <span class="price-value">S/ {{config?.costoDelivery || 2}}</span>
  </div>
</div>
      </header>

      <div class="layout">
        <!-- ═══════════════════════════════════════════════════════════════ -->
        <!-- COLUMNA IZQUIERDA: MENÚ / CARTA -->
        <!-- ═══════════════════════════════════════════════════════════════ -->
        <div class="menu-column">
          
          <!-- 1. ENTRADAS (SOLO MENÚ) -->
          <section class="section" *ngIf="modoVenta === 'MENU'">
            <h2 class="section-title"><span class="section-icon">🥗</span> Entradas</h2>
            <div class="platos-grid">
              <div *ngFor="let plato of menuDelDia?.entradas" 
                   class="plato-card" [class.selected]="entradaSeleccionada?.id === plato.id"
                   [class.sin-stock]="plato.stock <= 0" (click)="plato.stock > 0 && seleccionarEntrada(plato)">
                <div class="plato-nombre" [class.tachado]="plato.stock <= 0">{{plato.nombre}}</div>
                <div class="plato-stock" [class.low]="plato.stock <= 5" [class.agotado]="plato.stock <= 0">
                  {{plato.stock <= 0 ? 'Agotado' : plato.stock + ' disp.'}}
                </div>
              </div>
              <div *ngIf="!menuDelDia?.entradas?.length" class="empty-state">No hay entradas disponibles</div>
            </div>
          </section>

          <!-- 2. SEGUNDOS (SOLO MENÚ) -->
          <section class="section" *ngIf="modoVenta === 'MENU'">
            <h2 class="section-title"><span class="section-icon">🍛</span> Segundos</h2>
            <div class="segundos-layout">
              <div class="segundos-platos">
                <div class="segundos-column-header">Platos base</div>
                <div class="platos-base-grid">
                  <div *ngFor="let plato of menuDelDia?.segundos" 
                       class="plato-base-card" [class.selected]="segundoSeleccionado?.id === plato.id"
                       [class.sin-stock]="plato.stock <= 0" (click)="plato.stock > 0 && seleccionarSegundo(plato)">
                    <div class="plato-base-nombre" [class.tachado]="plato.stock <= 0">{{plato.nombre}}</div>
                    <div class="plato-base-stock" [class.low]="plato.stock <= 5" [class.agotado]="plato.stock <= 0">
                      {{plato.stock <= 0 ? 'Agotado' : plato.stock + ' disp.'}}
                    </div>
                  </div>
                  <div *ngIf="!menuDelDia?.segundos?.length" class="empty-state">No hay segundos disponibles</div>
                </div>
              </div>
              <div class="segundos-divider"></div>
              <div class="segundos-presas">
                <div class="segundos-column-header">Presas disponibles</div>
                <div *ngIf="!segundoSeleccionado" class="presas-empty">Selecciona un plato base</div>
                <div *ngIf="segundoSeleccionado" class="presas-grid">
                  <button *ngFor="let presa of segundoSeleccionado.presasDisponibles" 
                          class="presa-card" [class.selected]="presaSeleccionada?.id === presa.id"
                          (click)="seleccionarPresa(presa)">
                    <div class="presa-nombre">{{presa.nombre}}</div>
                    <div class="presa-stock" [class.low]="(presa.stock || 0) <= 5">{{presa.stock || 0}} disp.</div>
                  </button>
                  <div *ngIf="!segundoSeleccionado.presasDisponibles?.length" class="presas-empty">No hay presas para este plato</div>
                </div>
              </div>
            </div>
          </section>

          <!-- 3. PLATOS A LA CARTA (SOLO CARTA) -->
          <section class="section" *ngIf="modoVenta === 'CARTA'">
            <h2 class="section-title"><span class="section-icon">🍽️</span> Platos Principales</h2>
            <div class="platos-grid">
              <div *ngFor="let plato of platosCarta" 
                   class="plato-card" 
                   [class.selected]="platoCartaSeleccionado?.id === plato.id"
                   [class.sin-stock]="plato.stock <= 0" 
                   (click)="plato.stock > 0 && seleccionarPlatoCarta(plato)">
                <div class="plato-nombre" [class.tachado]="plato.stock <= 0">{{plato.nombre}}</div>
                <div class="plato-precio" style="color: #16a34a; font-weight: 700; font-size: 1.1rem; margin: 0.25rem 0;">
                  S/ {{plato.precio.toFixed(2)}}
                </div>
                <div class="plato-stock" [class.low]="plato.stock <= 5" [class.agotado]="plato.stock <= 0">
                  {{plato.stock <= 0 ? 'Agotado' : plato.stock + ' disp.'}}
                </div>
              </div>
              <div *ngIf="!platosCarta.length" class="empty-state">No hay platos a la carta disponibles</div>
            </div>
          </section>

          <!-- 4. BEBIDAS (VISIBLE EN AMBOS MODOS) -->
          <section class="section">
            <h2 class="section-title"><span class="section-icon">🥤</span> Bebidas</h2>
            <div class="platos-grid">
              <div *ngFor="let plato of menuDelDia?.bebidas" 
                   class="plato-card" [class.selected]="bebidaSeleccionada?.id === plato.id"
                   [class.sin-stock]="plato.stock <= 0" (click)="plato.stock > 0 && seleccionarBebida(plato)">
                <div class="plato-nombre" [class.tachado]="plato.stock <= 0">{{plato.nombre}}</div>
                <div class="plato-stock" [class.low]="plato.stock <= 5" [class.agotado]="plato.stock <= 0">
                  {{plato.stock <= 0 ? 'Agotado' : plato.stock + ' disp.'}}
                </div>
              </div>
              <div *ngIf="!menuDelDia?.bebidas?.length" class="empty-state">No hay bebidas disponibles</div>
            </div>
          </section>

          <!-- 5. CONTROLES GLOBALES -->
          <section class="section controles-globales">
            <div class="controles-card">
              <h3 class="controles-title">⚙️ Finalizar selección</h3>
              
              <div class="resumen-seleccion">
                <div class="resumen-item" *ngIf="modoVenta === 'MENU'" [class.incompleto]="!entradaSeleccionada">
                  <span class="resumen-label">🥗 Entrada:</span>
                  <span class="resumen-valor">{{entradaSeleccionada?.nombre || '—'}}</span>
                </div>
                
                <div class="resumen-item" [class.incompleto]="modoVenta === 'MENU' ? !segundoSeleccionado : !platoCartaSeleccionado">
                  <span class="resumen-label">{{modoVenta === 'MENU' ? '🍛 Segundo:' : '🍽️ Plato:'}}</span>
                  <span class="resumen-valor">{{(modoVenta === 'MENU' ? segundoSeleccionado?.nombre : platoCartaSeleccionado?.nombre) || '—'}}</span>
                </div>
                
                <div class="resumen-item" *ngIf="modoVenta === 'MENU'" [class.incompleto]="!presaSeleccionada">
                  <span class="resumen-label">🍗 Presa:</span>
                  <span class="resumen-valor">{{presaSeleccionada?.nombre || '—'}}</span>
                </div>
                
                <div class="resumen-item" [class.incompleto]="!bebidaSeleccionada">
                  <span class="resumen-label">🥤 Bebida:</span>
                  <span class="resumen-valor">{{bebidaSeleccionada?.nombre || '—'}}</span>
                </div>
              </div>

              <div class="control-row">
                <label class="control-label">📝 Observación <span class="optional">(opcional)</span></label>
                <input type="text" [(ngModel)]="observacionTemporal" class="control-input" placeholder="Ej: Sin ají, sin cebolla..." />
              </div>

              <div class="control-row">
                <label class="control-label">📦 Cantidad</label>
                <div class="cantidad-control">
                  <button class="cantidad-btn" (click)="decrementarCantidad()" [disabled]="cantidadTemporal <= 1">−</button>
                  <input type="number" [(ngModel)]="cantidadTemporal" class="cantidad-input" min="1" max="99" />
                  <button class="cantidad-btn" (click)="incrementarCantidad()" [disabled]="cantidadTemporal >= 99">+</button>
                </div>
              </div>

              <div class="controles-actions">
                <button class="btn-cancel" (click)="limpiarSeleccion()">Limpiar</button>
                <button class="btn-add" [disabled]="!puedeAgregar()" (click)="agregarAlCarrito()">
                  Agregar {{cantidadTemporal}} al pedido →
                </button>
              </div>
            </div>
          </section>

        </div>

        <!-- ═══════════════════════════════════════════════════════════════ -->
        <!-- COLUMNA DERECHA: CARRITO -->
        <!-- ═══════════════════════════════════════════════════════════════ -->
        <div class="cart-column">
          <div class="cart-card">
            <h2 class="cart-title">🛒 Pedido Actual</h2>

            <div class="cart-section">
              <label class="section-label">Tipo de pedido</label>
              <div class="radio-group">
                <label class="radio-label">
                  <input type="radio" [(ngModel)]="datosPedidoBase.tipo" value="MESA" />
                  <span>🍽️ Mesa</span>
                </label>
                <label class="radio-label">
                  <input type="radio" [(ngModel)]="datosPedidoBase.tipo" value="LLEVAR" />
                  <span>🥡 Para llevar</span>
                </label>
              </div>
              <div *ngIf="datosPedidoBase.tipo === 'LLEVAR'" class="checkbox-group">
                <label class="checkbox-label">
                  <input type="checkbox" [(ngModel)]="datosPedidoBase.requiereDelivery" />
                  <span>Requiere delivery (+S/{{config?.costoDelivery || 2}})</span>
                </label>
              </div>
            </div>

            <div class="cart-section">
              <label class="section-label">Items ({{totalItems}})</label>
              <div *ngIf="carrito.length === 0" class="empty-cart">Selecciona un plato del menú</div>

              <div *ngFor="let item of carrito; let i = index" class="cart-item">
                <div class="cart-item-header">
                  <div class="cart-item-info">
                    <div class="cart-item-name">{{item.nombrePlato}} <span class="cantidad-badge">×{{item.cantidad}}</span></div>
                    <div class="cart-item-details">
                      <span *ngIf="item.nombreEntrada" class="detail-tag">+ {{item.nombreEntrada}}</span>
                      <span *ngIf="item.nombreBebida" class="detail-tag">+ {{item.nombreBebida}}</span>
                      <span *ngIf="item.nombrePresa" class="detail-tag presa">Con {{item.nombrePresa}}</span>
                    </div>
                    <div *ngIf="item.observacion" class="observacion-text">"{{item.observacion}}"</div>
                  </div>
                  <button class="btn-remove" (click)="eliminarItem(i)">✕</button>
                </div>
                <div class="cantidad-control-small">
                  <button class="cantidad-btn-small" (click)="decrementarItem(i)" [disabled]="item.cantidad <= 1">−</button>
                  <span class="cantidad-value">{{item.cantidad}}</span>
                  <button class="cantidad-btn-small" (click)="incrementarItem(i)" [disabled]="item.cantidad >= 99">+</button>
                </div>
                <div class="cart-item-price">S/ {{(item.precioUnitario * item.cantidad).toFixed(2)}}</div>
              </div>
            </div>

            <div class="cart-section totals">
              <div class="total-row">
                <span>Subtotal</span>
                <span>S/ {{subtotal.toFixed(2)}}</span>
              </div>
              <div class="total-row" *ngIf="costoDescartable > 0">
                <span>Descartable ({{totalItems}}x)</span>
                <span>S/ {{costoDescartable.toFixed(2)}}</span>
              </div>
              <div class="total-row" *ngIf="costoDelivery > 0">
                <span>Delivery</span>
                <span>S/ {{costoDelivery.toFixed(2)}}</span>
              </div>
              <div class="total-row final">
                <span>TOTAL</span>
                <span class="total-amount">S/ {{total.toFixed(2)}}</span>
              </div>
            </div>

            <div class="cart-section">
              <label class="section-label">Método de pago</label>
              <select [(ngModel)]="datosPedidoBase.metodoPago" class="control-input">
                <option value="EFECTIVO">💵 Efectivo</option>
                <option value="YAPE">📱 Yape</option>
                <option value="PLIN">📱 Plin</option>
                <option value="TARJETA">💳 Tarjeta</option>
                <option value="TRANSFERENCIA">🏦 Transferencia</option>
              </select>

              <div *ngIf="datosPedidoBase.metodoPago === 'EFECTIVO'" class="monto-group">
                <label class="control-label-small">Monto recibido</label>
                <input type="number" step="0.01" min="0" [(ngModel)]="datosPedidoBase.montoRecibido" class="control-input" placeholder="0.00" />
                <div *ngIf="datosPedidoBase.montoRecibido >= total && datosPedidoBase.montoRecibido > 0" class="vuelto-positive">
                  Vuelto: S/ {{ (datosPedidoBase.montoRecibido - total).toFixed(2) }}
                </div>
                <div *ngIf="datosPedidoBase.montoRecibido > 0 && datosPedidoBase.montoRecibido < total" class="vuelto-negative">
                  Faltan S/ {{ (total - datosPedidoBase.montoRecibido).toFixed(2) }}
                </div>
              </div>
            </div>

            <button class="btn-confirm" [disabled]="!puedeConfirmar()" (click)="confirmarPedido()">
              <span>Confirmar pedido</span>
              <span class="btn-arrow">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1a1a1a; }
    * { box-sizing: border-box; }
    .container { max-width: 1400px; margin: 0 auto; padding: 2rem; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 1px solid #eaeaea; }
    .title { font-size: 1.75rem; font-weight: 600; margin: 0 0 0.25rem 0; }
    .subtitle { font-size: 0.9rem; color: #666; margin: 0; }
    
    .modo-toggle { display: flex; gap: 0.5rem; background: #f5f5f5; padding: 0.4rem; border-radius: 10px; }
    .toggle-btn { padding: 0.6rem 1.25rem; border: none; border-radius: 8px; background: transparent; cursor: pointer; font-size: 0.9rem; font-weight: 500; transition: all 0.2s; font-family: inherit; color: #666; }
    .toggle-btn.active { background: #fff; color: #1a1a1a; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .toggle-btn:hover:not(.active) { color: #1a1a1a; }

    .price-banner { display: flex; gap: 1.5rem; background: #f5f5f5; padding: 0.75rem 1.5rem; border-radius: 12px; }
    .price-item { display: flex; flex-direction: column; align-items: center; }
    .price-label { font-size: 0.75rem; color: #666; text-transform: uppercase; }
    .price-value { font-size: 1.1rem; font-weight: 600; color: #1a1a1a; }
    .price-divider { width: 1px; background: #ddd; }

    .layout { display: grid; grid-template-columns: 1fr 400px; gap: 2rem; }
    @media (max-width: 1024px) { .layout { grid-template-columns: 1fr; } }

    .section { margin-bottom: 2rem; }
    .section-title { font-size: 1.1rem; font-weight: 600; margin: 0 0 1rem 0; display: flex; align-items: center; gap: 0.5rem; }
    .section-icon { font-size: 1.2rem; }
    .platos-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 0.75rem; }

    .plato-card { background: #fff; border: 1px solid #e5e5e5; border-radius: 10px; padding: 1rem; display: flex; flex-direction: column; justify-content: space-between; align-items: center; text-align: center; cursor: pointer; transition: all 0.2s; }
    .plato-card:hover { border-color: #1a1a1a; transform: translateY(-1px); box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
    .plato-card.selected { border-color: #16a34a; background: #f0fdf4; border-width: 2px; }
    .plato-nombre { font-weight: 600; font-size: 0.95rem; margin-bottom: 0.25rem; }
    .plato-stock { font-size: 0.7rem; color: #16a34a; font-weight: 500; background: #f0fdf4; padding: 0.15rem 0.5rem; border-radius: 999px; }
    .plato-stock.low { color: #dc2626; background: #fef2f2; }

    .segundos-layout { display: grid; grid-template-columns: 2fr 1.5fr; gap: 0; background: #fff; border: 1px solid #e5e5e5; border-radius: 12px; overflow: hidden; }
    .segundos-column-header { font-size: 0.75rem; font-weight: 600; color: #666; text-transform: uppercase; letter-spacing: 0.05em; padding: 0.75rem 1rem; background: #fafafa; border-bottom: 1px solid #e5e5e5; }
    .segundos-platos { border-right: 2px solid #e5e5e5; min-height: 200px; }
    .segundos-divider { display: none; }
    .platos-base-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 0.75rem; padding: 1rem; }
    .plato-base-card { background: #fff; border: 1px solid #e5e5e5; border-radius: 8px; padding: 0.85rem; cursor: pointer; transition: all 0.2s; display: flex; flex-direction: column; align-items: center; text-align: center; }
    .plato-base-card:hover { border-color: #1a1a1a; transform: translateY(-1px); box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
    .plato-base-card.selected { border-color: #16a34a; background: #f0fdf4; border-width: 2px; }
    .plato-base-nombre { font-weight: 600; font-size: 0.9rem; color: #1a1a1a; margin-bottom: 0.5rem; }
    .plato-base-stock { font-size: 0.7rem; color: #16a34a; font-weight: 500; background: #f0fdf4; padding: 0.15rem 0.5rem; border-radius: 999px; }
    .plato-base-stock.low { color: #dc2626; background: #fef2f2; }

    .segundos-presas { background: #fafafa; }
    .presas-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; padding: 1rem; }
    .presa-card { background: #fff; border: 1px solid #e5e5e5; border-radius: 8px; padding: 0.85rem; cursor: pointer; transition: all 0.2s; display: flex; flex-direction: column; align-items: center; text-align: center; position: relative; font-family: inherit; }
    .presa-card:hover { border-color: #1a1a1a; transform: translateY(-1px); box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
    .presa-card.selected { border-color: #16a34a; background: #f0fdf4; border-width: 2px; }
    .presa-nombre { font-weight: 600; font-size: 0.9rem; color: #1a1a1a; margin-bottom: 0.5rem; }
    .presa-stock { font-size: 0.7rem; color: #16a34a; font-weight: 500; background: #f0fdf4; padding: 0.15rem 0.5rem; border-radius: 999px; }
    .presa-stock.low { color: #dc2626; background: #fef2f2; }
    .presas-empty { color: #999; font-size: 0.9rem; padding: 2rem 1rem; text-align: center; font-style: italic; }

    .controles-globales { margin-top: 1rem; }
    .controles-card { background: #fff; border: 2px solid #e5e5e5; border-radius: 12px; padding: 1.5rem; }
    .controles-title { font-size: 1.1rem; font-weight: 600; margin: 0 0 1.25rem 0; color: #1a1a1a; }
    .resumen-seleccion { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; margin-bottom: 1.5rem; padding: 1rem; background: #fafafa; border-radius: 8px; }
    .resumen-item { display: flex; flex-direction: column; gap: 0.25rem; }
    .resumen-item.incompleto .resumen-valor { color: #dc2626; font-style: italic; }
    .resumen-item:not(.incompleto) .resumen-valor { color: #16a34a; font-weight: 600; }
    .resumen-label { font-size: 0.75rem; color: #666; text-transform: uppercase; }
    .resumen-valor { font-size: 0.95rem; }

    .control-row { margin-bottom: 1rem; }
    .control-label { display: block; font-size: 0.85rem; font-weight: 600; color: #333; margin-bottom: 0.5rem; }
    .optional { font-weight: 400; color: #999; font-size: 0.8rem; }
    .control-input { width: 100%; padding: 0.65rem 0.85rem; border: 1px solid #e5e5e5; border-radius: 8px; font-size: 0.95rem; background: #fff; font-family: inherit; }
    .control-input:focus { outline: none; border-color: #1a1a1a; }

    .cantidad-control { display: flex; align-items: center; gap: 0.5rem; }
    .cantidad-btn { width: 40px; height: 40px; border: 1px solid #e5e5e5; border-radius: 8px; background: #fff; cursor: pointer; font-size: 1.2rem; font-weight: 600; transition: all 0.2s; }
    .cantidad-btn:hover:not(:disabled) { border-color: #1a1a1a; background: #f5f5f5; }
    .cantidad-btn:disabled { opacity: 0.3; cursor: not-allowed; }
    .cantidad-input { width: 70px; padding: 0.6rem; border: 1px solid #e5e5e5; border-radius: 8px; font-size: 1.1rem; font-weight: 600; text-align: center; }
    .cantidad-input:focus { outline: none; border-color: #1a1a1a; }

    .controles-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid #f0f0f0; }
    .btn-cancel, .btn-add { padding: 0.75rem 1.5rem; border-radius: 8px; font-size: 0.95rem; font-weight: 500; cursor: pointer; border: none; transition: all 0.2s; font-family: inherit; }
    .btn-cancel { background: #f5f5f5; color: #666; }
    .btn-cancel:hover { background: #e5e5e5; }
    .btn-add { background: #1a1a1a; color: #fff; }
    .btn-add:hover:not(:disabled) { background: #000; }
    .btn-add:disabled { background: #e5e5e5; color: #999; cursor: not-allowed; }
    .empty-state { color: #999; font-size: 0.9rem; padding: 1rem; text-align: center; }

    .cart-card { background: #fff; border: 1px solid #e5e5e5; border-radius: 16px; padding: 1.5rem; position: sticky; top: 2rem; }
    .cart-title { font-size: 1.1rem; font-weight: 600; margin: 0 0 1.5rem 0; padding-bottom: 1rem; border-bottom: 1px solid #f0f0f0; }
    .cart-section { margin-bottom: 1.5rem; padding-bottom: 1.5rem; border-bottom: 1px solid #f0f0f0; }
    .cart-section:last-of-type { border-bottom: none; }
    .section-label { display: block; font-size: 0.75rem; font-weight: 600; color: #666; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.75rem; }
    .radio-group { display: flex; gap: 1rem; }
    .radio-label { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-size: 0.9rem; }
    .radio-label input[type="radio"] { width: 16px; height: 16px; cursor: pointer; }
    .checkbox-group { margin-top: 0.75rem; }
    .checkbox-label { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-size: 0.85rem; color: #333; }
    .checkbox-label input[type="checkbox"] { width: 16px; height: 16px; cursor: pointer; }
    .empty-cart { color: #999; font-size: 0.9rem; padding: 1rem; text-align: center; }

    .cart-item { padding: 0.75rem 0; border-bottom: 1px solid #f5f5f5; }
    .cart-item:last-child { border-bottom: none; }
    .cart-item-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem; }
    .cart-item-info { flex: 1; }
    .cart-item-name { font-weight: 600; font-size: 0.95rem; margin-bottom: 0.25rem; }
    .cantidad-badge { font-size: 0.85rem; color: #666; font-weight: 500; }
    .btn-remove { background: none; border: none; color: #999; cursor: pointer; font-size: 0.9rem; padding: 0.25rem 0.5rem; border-radius: 4px; }
    .btn-remove:hover { background: #fee2e2; color: #dc2626; }
    .cart-item-details { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 0.25rem; }
    .detail-tag { font-size: 0.75rem; color: #666; background: #f5f5f5; padding: 0.15rem 0.5rem; border-radius: 4px; }
    .detail-tag.presa { background: #fef3c7; color: #92400e; }
    .observacion-text { font-size: 0.75rem; color: #dc2626; font-style: italic; margin-top: 0.25rem; }

    .cantidad-control-small { display: flex; align-items: center; gap: 0.5rem; margin-top: 0.5rem; }
    .cantidad-btn-small { width: 28px; height: 28px; border: 1px solid #e5e5e5; border-radius: 6px; background: #fff; cursor: pointer; font-size: 1rem; font-weight: 600; transition: all 0.2s; }
    .cantidad-btn-small:hover:not(:disabled) { border-color: #1a1a1a; background: #f5f5f5; }
    .cantidad-btn-small:disabled { opacity: 0.3; cursor: not-allowed; }
    .cantidad-value { font-weight: 600; font-size: 0.95rem; min-width: 30px; text-align: center; }
    .cart-item-price { font-weight: 600; font-size: 0.9rem; text-align: right; margin-top: 0.5rem; }

    .totals { border-bottom: none; padding-bottom: 0; }
    .total-row { display: flex; justify-content: space-between; padding: 0.35rem 0; font-size: 0.9rem; color: #666; }
    .total-row.final { padding-top: 0.75rem; margin-top: 0.5rem; border-top: 2px solid #1a1a1a; font-size: 1.1rem; font-weight: 700; color: #1a1a1a; }
    .total-amount { font-size: 1.25rem; }

    .monto-group { margin-top: 0.75rem; }
    .control-label-small { display: block; font-size: 0.8rem; color: #666; margin-bottom: 0.4rem; }
    .vuelto-positive { margin-top: 0.5rem; padding: 0.5rem 0.75rem; background: #f0fdf4; color: #16a34a; border-radius: 6px; font-size: 0.85rem; font-weight: 500; }
    .vuelto-negative { margin-top: 0.5rem; padding: 0.5rem 0.75rem; background: #fef2f2; color: #dc2626; border-radius: 6px; font-size: 0.85rem; font-weight: 500; }

    .btn-confirm { width: 100%; padding: 0.9rem; background: #1a1a1a; color: #fff; border: none; border-radius: 10px; font-size: 0.95rem; font-weight: 600; cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: all 0.2s; font-family: inherit; }
    .btn-confirm:hover:not(:disabled) { background: #000; transform: translateY(-1px); }
    .btn-confirm:disabled { background: #e5e5e5; color: #999; cursor: not-allowed; }
    .btn-arrow { font-size: 1.2rem; }

    .plato-card.sin-stock, .plato-base-card.sin-stock { opacity: 0.5; cursor: not-allowed; background: #f5f5f5; border-color: #ddd !important; }
    .plato-card.sin-stock:hover, .plato-base-card.sin-stock:hover { border-color: #ddd !important; background: #f5f5f5; transform: none; box-shadow: none; }
    .tachado { text-decoration: line-through; color: #999; }
    .plato-stock.agotado, .plato-base-stock.agotado { background: #fee2e2; color: #dc2626; font-weight: 600; }
  `]
})
export class PedidosComponent implements OnInit {
  private menuService = inject(MenuService);
  private pedidoService = inject(PedidoService);
  private messageService = inject(MessageService);
  private cdr = inject(ChangeDetectorRef);

  menuDelDia: MenuDiaResponse | null = null;
  config: ConfiguracionResponse | null = null;
  modoVenta: 'MENU' | 'CARTA' = 'MENU';
  
  platosCarta: PlatoCarta[] = [];
  platoCartaSeleccionado: PlatoCarta | null = null; // ✅ CORREGIDO
  
  entradaSeleccionada: PlatoMenuResponse | null = null;
  segundoSeleccionado: PlatoMenuResponse | null = null;
  presaSeleccionada: PresaResponse | null = null;
  bebidaSeleccionada: PlatoMenuResponse | null = null;
  observacionTemporal: string = '';
  cantidadTemporal: number = 1;

  carrito: CarritoItem[] = [];
  nextItemId = 1;

  datosPedidoBase = {
    clienteNombre: 'Cliente de Mostrador',
    clienteTelefono: '',
    tipo: 'MESA' as 'MESA' | 'LLEVAR',
    tipoVenta: 'MENU' as 'MENU' | 'CARTA',
    metodoPago: 'EFECTIVO' as 'EFECTIVO' | 'YAPE' | 'PLIN' | 'TARJETA' | 'TRANSFERENCIA',
    montoRecibido: 0,
    requiereDelivery: false
  };

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.menuService.getConfiguracion().subscribe({
      next: (config) => {
        this.config = config;
        this.cdr.detectChanges();
      },
      error: () => {
        this.config = { precioMenu: 10, costoDescartable: 2, costoDelivery: 2 };
      }
    });

    this.menuService.getMenuDelDia().subscribe({
      next: (menu) => {
        this.menuDelDia = menu;
        this.cdr.detectChanges();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el menú.' });
      }
    });

    this.menuService.getPlatosCarta().subscribe({
      next: (platos) => {
        this.platosCarta = platos.filter(p => p.activo && p.stock > 0);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error cargando carta:', err)
    });
  }

    // 🚀 NUEVO: Solo actualiza los stocks, NO pide la configuración de nuevo
  actualizarStocks() {
    this.menuService.getMenuDelDia().subscribe({
      next: (menu) => {
        this.menuDelDia = menu;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error actualizando stocks del menú:', err)
    });

    this.menuService.getPlatosCarta().subscribe({
      next: (platos) => {
        this.platosCarta = platos.filter(p => p.activo && p.stock > 0);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error actualizando stocks de carta:', err)
    });
  }

  cambiarModo(modo: 'MENU' | 'CARTA') {
    this.modoVenta = modo;
    this.limpiarSeleccion();
  }

  seleccionarEntrada(entrada: PlatoMenuResponse) {
    this.entradaSeleccionada = this.entradaSeleccionada?.id === entrada.id ? null : entrada;
  }

  seleccionarSegundo(plato: PlatoMenuResponse) {
    if (this.segundoSeleccionado?.id === plato.id) {
      this.segundoSeleccionado = null;
      this.presaSeleccionada = null;
    } else {
      this.segundoSeleccionado = plato;
      const presaDefault = plato.presasDisponibles?.find(p => p.porDefecto);
      this.presaSeleccionada = presaDefault || null;
    }
  }

  seleccionarPresa(presa: PresaResponse) {
    this.presaSeleccionada = presa;
  }

  seleccionarBebida(bebida: PlatoMenuResponse) {
    this.bebidaSeleccionada = this.bebidaSeleccionada?.id === bebida.id ? null : bebida;
  }

  seleccionarPlatoCarta(plato: PlatoCarta) {
    this.platoCartaSeleccionado = this.platoCartaSeleccionado?.id === plato.id ? null : plato;
  }

  incrementarCantidad() { if (this.cantidadTemporal < 99) this.cantidadTemporal++; }
  decrementarCantidad() { if (this.cantidadTemporal > 1) this.cantidadTemporal--; }

  puedeAgregar(): boolean {
    if (this.modoVenta === 'MENU') {
      return !!(this.entradaSeleccionada && this.segundoSeleccionado && this.presaSeleccionada && this.bebidaSeleccionada);
    } else {
      return !!(this.platoCartaSeleccionado && this.bebidaSeleccionada);
    }
  }

  limpiarSeleccion() {
    this.entradaSeleccionada = null;
    this.segundoSeleccionado = null;
    this.presaSeleccionada = null;
    this.bebidaSeleccionada = null;
    this.platoCartaSeleccionado = null;
    this.observacionTemporal = '';
    this.cantidadTemporal = 1;
  }

  agregarAlCarrito() {
    if (!this.puedeAgregar()) {
      this.messageService.add({ 
        severity: 'warn', 
        summary: 'Faltan datos', 
        detail: this.modoVenta === 'MENU' ? 'Debes seleccionar entrada, segundo, presa y bebida' : 'Debes seleccionar un plato a la carta y una bebida' 
      });
      return;
    }

    if (this.modoVenta === 'MENU') {
      const item: CarritoItem = {
        id: this.nextItemId++,
        platoId: this.segundoSeleccionado!.id,
        nombrePlato: this.segundoSeleccionado!.nombre,
        presaId: this.presaSeleccionada!.id,
        nombrePresa: this.presaSeleccionada!.nombre,
        entradaId: this.entradaSeleccionada!.id,
        nombreEntrada: this.entradaSeleccionada!.nombre,
        bebidaId: this.bebidaSeleccionada?.id,
        nombreBebida: this.bebidaSeleccionada?.nombre,
        cantidad: this.cantidadTemporal,
        precioUnitario: this.config?.precioMenu || 10,
        observacion: this.observacionTemporal || undefined
      };
      this.carrito.push(item);
      this.messageService.add({ severity: 'success', summary: 'Agregado', detail: `${this.cantidadTemporal}x Menú de ${this.segundoSeleccionado!.nombre}` });
    } else {
      const item: CarritoItem = {
        id: this.nextItemId++,
        platoCartaId: this.platoCartaSeleccionado!.id,
        nombrePlato: this.platoCartaSeleccionado!.nombre,
        bebidaId: this.bebidaSeleccionada?.id,
        nombreBebida: this.bebidaSeleccionada?.nombre,
        cantidad: this.cantidadTemporal,
        precioUnitario: this.platoCartaSeleccionado!.precio,
        observacion: this.observacionTemporal || undefined
      };
      this.carrito.push(item);
      this.messageService.add({ severity: 'success', summary: 'Agregado', detail: `${this.cantidadTemporal}x ${this.platoCartaSeleccionado!.nombre}` });
    }

    this.limpiarSeleccion();
  }

  eliminarItem(index: number) { this.carrito.splice(index, 1); }
  incrementarItem(index: number) { if (this.carrito[index].cantidad < 99) this.carrito[index].cantidad++; }
  decrementarItem(index: number) { if (this.carrito[index].cantidad > 1) this.carrito[index].cantidad--; }

  get totalItems(): number { return this.carrito.reduce((sum, item) => sum + item.cantidad, 0); }
  get subtotal(): number { return this.carrito.reduce((sum, item) => sum + (item.precioUnitario * item.cantidad), 0); }
  get costoDescartable(): number { return (this.datosPedidoBase.tipo === 'LLEVAR') ? (this.totalItems * (this.config?.costoDescartable || 2)) : 0; }
  get costoDelivery(): number { return this.datosPedidoBase.requiereDelivery ? (this.config?.costoDelivery || 2) : 0; }
  get total(): number { return this.subtotal + this.costoDescartable + this.costoDelivery; }

  puedeConfirmar(): boolean {
    if (this.carrito.length === 0) return false;
    if (this.datosPedidoBase.metodoPago === 'EFECTIVO') {
      return this.datosPedidoBase.montoRecibido >= this.total;
    }
    return true;
  }

  confirmarPedido() {
  if (!this.puedeConfirmar()) {
    this.messageService.add({ severity: 'warn', summary: 'Datos incompletos', detail: 'Verifica el monto recibido.' });
    return;

    
  }

  const detallesParaBackend: PedidoDetalleRequest[] = this.carrito.map(item => ({
    platoId: item.platoId,
    catalogoPlatoCartaId: item.platoCartaId, // ✅ Importante para CARTA
    presaId: item.presaId,
    entradaId: item.entradaId,
    bebidaId: item.bebidaId,
    cantidad: item.cantidad,
    precioUnitario: item.precioUnitario,
    observacion: item.observacion
  }));

  const pedidoFinal: PedidoRequest = { 
    ...this.datosPedidoBase, 
    tipoVenta: this.modoVenta, // ✅ ¡ESTA ES LA LÍNEA MÁGICA! Sobrescribe el 'MENU' por defecto
    detalles: detallesParaBackend 
  };

  // (Opcional pero recomendado para depurar)
  console.log("🔥 Enviando al backend:", pedidoFinal);

  this.pedidoService.crearPedido(pedidoFinal).subscribe({
    next: (pedido) => {
      this.messageService.add({
        severity: 'success', 
        summary: '¡Pedido Creado!', 
        detail: `Pedido #${pedido.id} | Total: S/${pedido.total} | Vuelto: S/${pedido.vuelto}`
      });

      this.carrito = [];
      this.datosPedidoBase.tipo = 'MESA';
      this.datosPedidoBase.metodoPago = 'EFECTIVO';
      this.datosPedidoBase.montoRecibido = 0;
      this.datosPedidoBase.requiereDelivery = false;
      this.limpiarSeleccion();
      
      this.cargarDatos(); // Recargar stocks
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error('Error del backend:', err);
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Error', 
        detail: err.error?.message || 'No se pudo crear el pedido' 
      });
    }
  });
}
}