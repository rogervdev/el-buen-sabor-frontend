import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { PresaService, Presa } from '../../../../core/services/presa.service';
import { PlatoMenuService, PlatoMenu } from '../../../../core/services/plato-menu.service';
import { MenuDiaService, ConfigurarMenuDiaRequest, MenuDiaConfigurado } from '../../../../core/services/menu-dia.service';

@Component({
  selector: 'app-admin-catalogo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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
          <h1 class="title"> Panel de Administración</h1>
          <p class="subtitle">Gestiona el catálogo y el menú del día</p>
        </div>
      </header>

      <!-- Pestañas -->
      <div class="tabs">
        <button class="tab" [class.active]="tabActiva === 'presas'" (click)="cambiarTab('presas')">🍗 Presas</button>
        <button class="tab" [class.active]="tabActiva === 'menu'" (click)="cambiarTab('menu')">🍛 Platos del Menú</button>
        <button class="tab" [class.active]="tabActiva === 'carta'" (click)="cambiarTab('carta')">️ Platos a la Carta</button>
        <button class="tab" [class.active]="tabActiva === 'configurar'" (click)="cambiarTab('configurar')">📅 Configurar Menú del Día</button>
      </div>

      <!-- Mensaje de bienvenida -->
      <div class="welcome-message" *ngIf="!tabActiva">
        <div class="welcome-icon"></div>
        <h3>Selecciona una categoría</h3>
        <p>Haz clic en una de las pestañas superiores para comenzar.</p>
      </div>

      <!-- ══════════════════════════════════════════════════════════ -->
      <!-- TAB: PRESAS -->
      <!-- ═══════════════════════════════════════════════════════════ -->
      <div class="tab-content" *ngIf="tabActiva === 'presas'">
        <div class="actions-bar">
          <h2 class="section-title">Gestión de Presas</h2>
          <button class="btn-primary" (click)="abrirModalPresa()">➕ Nueva Presa</button>
        </div>
        <div class="table-container">
          <table class="simple-table">
            <thead>
              <tr><th>ID</th><th>Nombre</th><th>Precio Adic.</th><th>Estado</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              <tr *ngFor="let presa of presas">
                <td>{{presa.id}}</td>
                <td><strong>{{presa.nombre}}</strong></td>
                <td>S/ {{presa.precioAdicional.toFixed(2)}}</td>
                <td>
                  <span class="badge" [class.badge-success]="presa.activo" [class.badge-danger]="!presa.activo">
                    {{presa.activo ? 'Activo' : 'Inactivo'}}
                  </span>
                </td>
                <td class="actions-cell">
                  <button class="btn-action btn-edit" (click)="abrirModalPresa(presa)">✏️ Editar</button>
                  <button class="btn-action" [class.btn-deactivate]="presa.activo" [class.btn-activate]="!presa.activo" (click)="confirmarDeshabilitarPresa(presa)">
                    {{ presa.activo ? '🚫 Deshabilitar' : '✅ Activar' }}
                  </button>
                </td>
              </tr>
              <tr *ngIf="cargando"><td colspan="5" class="empty-row">Cargando presas...</td></tr>
              <tr *ngIf="!cargando && presas.length === 0"><td colspan="5" class="empty-row">No hay presas registradas</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════════════════════ -->
      <!-- TAB: PLATOS DEL MENÚ -->
      <!-- ═══════════════════════════════════════════════════════════ -->
      <div class="tab-content" *ngIf="tabActiva === 'menu'">
        <div class="actions-bar">
          <h2 class="section-title">Gestión de Platos del Menú</h2>
          <button class="btn-primary" (click)="abrirModalPlato()">➕ Nuevo Plato</button>
        </div>
        <div class="table-container">
          <table class="simple-table">
            <thead>
              <tr><th>ID</th><th>Nombre</th><th>Tipo</th><th>Cambio Presa</th><th>Estado</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              <tr *ngFor="let plato of platosMenu">
                <td>{{plato.id}}</td>
                <td><strong>{{plato.nombre}}</strong></td>
                <td><span class="badge badge-info">{{plato.tipoMenu}}</span></td>
                <td>{{plato.permiteCambioPresa ? '✅ Sí' : '❌ No'}}</td>
                <td>
                  <span class="badge" [class.badge-success]="plato.activo" [class.badge-danger]="!plato.activo">
                    {{plato.activo ? 'Activo' : 'Inactivo'}}
                  </span>
                </td>
                <td class="actions-cell">
                  <button class="btn-action btn-edit" (click)="abrirModalPlato(plato)">✏️ Editar</button>
                  <button class="btn-action" [class.btn-deactivate]="plato.activo" [class.btn-activate]="!plato.activo" (click)="confirmarDeshabilitarPlato(plato)">
                    {{ plato.activo ? '🚫 Deshabilitar' : '✅ Activar' }}
                  </button>
                </td>
              </tr>
              <tr *ngIf="cargandoPlatos"><td colspan="6" class="empty-row">Cargando platos...</td></tr>
              <tr *ngIf="!cargandoPlatos && platosMenu.length === 0"><td colspan="6" class="empty-row">No hay platos registrados</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- TAB: PLATOS A LA CARTA (Placeholder) -->
      <div class="tab-content" *ngIf="tabActiva === 'carta'">
        <div class="empty-tab">
          <div class="empty-icon">🍽️</div>
          <h3>Platos a la Carta</h3>
          <p>Próximamente: CRUD de platos con categoría, precio y stock.</p>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════════════════════ -->
      <!-- TAB: CONFIGURAR MENÚ DEL DÍA -->
      <!-- ═══════════════════════════════════════════════════════════ -->
      <div class="tab-content" *ngIf="tabActiva === 'configurar'">
        <div class="configurar-header">
          <div>
            <h2 class="section-title"> Configurar Menú del Día</h2>
            <p class="configurar-subtitle">Selecciona qué platos y presas estarán disponibles hoy y asigna su stock inicial.</p>
          </div>
          <button class="btn-primary btn-large" (click)="publicarMenuDia()" [disabled]="procesandoConfiguracion">
            {{procesandoConfiguracion ? '⏳ Publicando...' : '🚀 Publicar Menú de Hoy'}}
          </button>
        </div>

        <!-- Sección: Platos -->
        <div class="configurar-section">
          <h3 class="subsection-title">🍛 Platos Disponibles</h3>
          <p class="subsection-hint">Marca los platos que se servirán hoy y asigna la cantidad de porciones.</p>
          
          <div class="platos-config-grid">
            <!-- Entradas -->
            <div class="plato-tipo-group" *ngIf="platosMenuActivosEntradas.length > 0">
              <h4 class="plato-tipo-label">🥗 Entradas</h4>
              <div class="plato-config-list">
                <div *ngFor="let plato of platosMenuActivosEntradas" class="plato-config-item">
                  <label class="plato-config-checkbox">
                    <input type="checkbox" [checked]="isPlatoSeleccionado(plato.id)" (change)="togglePlato(plato.id)">
                    <span class="plato-config-nombre">{{plato.nombre}}</span>
                  </label>
                  <div class="plato-config-stock" *ngIf="isPlatoSeleccionado(plato.id)">
                    <label>Stock:</label>
                    <input type="number" [(ngModel)]="platosStockMap[plato.id]" min="0" class="stock-input">
                  </div>
                </div>
              </div>
            </div>

            <!-- Segundos -->
            <div class="plato-tipo-group" *ngIf="platosMenuActivosSegundos.length > 0">
              <h4 class="plato-tipo-label">🍛 Segundos</h4>
              <div class="plato-config-list">
                <div *ngFor="let plato of platosMenuActivosSegundos" class="plato-config-item">
                  <label class="plato-config-checkbox">
                    <input type="checkbox" [checked]="isPlatoSeleccionado(plato.id)" (change)="togglePlato(plato.id)">
                    <span class="plato-config-nombre">{{plato.nombre}}</span>
                  </label>
                  <div class="plato-config-stock" *ngIf="isPlatoSeleccionado(plato.id)">
                    <label>Stock:</label>
                    <input type="number" [(ngModel)]="platosStockMap[plato.id]" min="0" class="stock-input">
                  </div>
                </div>
              </div>
            </div>

            <!-- Bebidas -->
            <div class="plato-tipo-group" *ngIf="platosMenuActivosBebidas.length > 0">
              <h4 class="plato-tipo-label">🥤 Bebidas</h4>
              <div class="plato-config-list">
                <div *ngFor="let plato of platosMenuActivosBebidas" class="plato-config-item">
                  <label class="plato-config-checkbox">
                    <input type="checkbox" [checked]="isPlatoSeleccionado(plato.id)" (change)="togglePlato(plato.id)">
                    <span class="plato-config-nombre">{{plato.nombre}}</span>
                  </label>
                  <div class="plato-config-stock" *ngIf="isPlatoSeleccionado(plato.id)">
                    <label>Stock:</label>
                    <input type="number" [(ngModel)]="platosStockMap[plato.id]" min="0" class="stock-input">
                  </div>
                </div>
              </div>
            </div>

            <div *ngIf="platosMenuActivos.length === 0" class="empty-helper">
              No hay platos activos en el catálogo. Crea algunos en la pestaña " Platos del Menú".
            </div>
          </div>
        </div>

        <!-- Sección: Presas -->
        <div class="configurar-section">
          <h3 class="subsection-title">🍗 Presas Disponibles</h3>
          <p class="subsection-hint">Asigna el stock de cada presa para hoy.</p>
          
          <div class="presas-config-grid">
            <div *ngFor="let presa of presasActivas" class="presa-config-item">
              <label class="presa-config-checkbox">
                <input type="checkbox" [checked]="isPresaDiaSeleccionada(presa.id)" (change)="togglePresaDia(presa.id)">
                <span class="presa-config-nombre">{{presa.nombre}}</span>
                <span class="presa-config-precio">+ S/ {{presa.precioAdicional.toFixed(2)}}</span>
              </label>
              <div class="presa-config-stock" *ngIf="isPresaDiaSeleccionada(presa.id)">
                <label>Stock:</label>
                <input type="number" [(ngModel)]="presasStockMap[presa.id]" min="0" class="stock-input">
              </div>
            </div>

            <div *ngIf="presasActivas.length === 0" class="empty-helper">
              No hay presas activas. Crea algunas en la pestaña "🍗 Presas".
            </div>
          </div>
        </div>

        <!-- Resumen -->
        <div class="resumen-config" *ngIf="platosSeleccionadosIds.length > 0 || presasDiaSeleccionadasIds.length > 0">
          <h3 class="resumen-title"> Resumen de la Configuración</h3>
          <div class="resumen-stats">
            <div class="stat-card">
              <span class="stat-number">{{platosSeleccionadosIds.length}}</span>
              <span class="stat-label">Platos</span>
            </div>
            <div class="stat-card">
              <span class="stat-number">{{presasDiaSeleccionadasIds.length}}</span>
              <span class="stat-label">Presas</span>
            </div>
            <div class="stat-card">
              <span class="stat-number">{{totalStockPlatos}}</span>
              <span class="stat-label">Porciones Totales</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL: Presa -->
    <p-dialog [(visible)]="modalPresaVisible" [header]="presaSeleccionada ? '✏️ Editar Presa' : '➕ Nueva Presa'" [modal]="true" [style]="{ width: '450px' }" [draggable]="false" [resizable]="false">
      <div class="form-group">
        <label class="form-label">Nombre de la presa *</label>
        <input type="text" name="nombre" [(ngModel)]="presaForm.nombre" class="form-input" placeholder="Ej: Seco de pollo" />
      </div>
      <div class="form-group">
        <label class="form-label">Precio adicional (S/) *</label>
        <input type="number" name="precioAdicional" [(ngModel)]="presaForm.precioAdicional" class="form-input" min="0" step="0.01" placeholder="0.00" />
      </div>
      <div class="dialog-footer">
        <button class="btn-secondary" (click)="modalPresaVisible = false">Cancelar</button>
        <button class="btn-primary" (click)="guardarPresa()" [disabled]="!presaForm.nombre">{{presaSeleccionada ? 'Actualizar' : 'Crear'}}</button>
      </div>
    </p-dialog>

    <!-- MODAL: Plato del Menú -->
    <p-dialog [(visible)]="modalPlatoVisible" [header]="platoSeleccionado ? '✏️ Editar Plato' : '➕ Nuevo Plato'" [modal]="true" [style]="{ width: '500px' }" [draggable]="false" [resizable]="false">
      <div class="form-group">
        <label class="form-label">Nombre del plato *</label>
        <input type="text" name="nombre" [(ngModel)]="platoForm.nombre" class="form-input" placeholder="Ej: Frejoles" />
      </div>
      <div class="form-group">
        <label class="form-label">Tipo de plato *</label>
        <select name="tipoMenu" [(ngModel)]="platoForm.tipoMenu" class="form-input">
          <option value="ENTRADA">🥗 Entrada</option>
          <option value="SEGUNDO"> Segundo</option>
          <option value="BEBIDA">🥤 Bebida</option>
        </select>
      </div>
      <div class="form-group checkbox-group">
        <label class="checkbox-label">
          <input type="checkbox" name="permiteCambioPresa" [(ngModel)]="platoForm.permiteCambioPresa" />
          <span>¿Permite cambio de presa?</span>
        </label>
      </div>
      <div class="form-group" *ngIf="platoForm.permiteCambioPresa">
        <label class="form-label">Selecciona las presas disponibles:</label>
        <p class="helper-text">💡 La primera presa que marques será la opción por defecto.</p>
        <div class="presas-list">
          <label *ngFor="let presa of presasActivas" class="presa-checkbox">
            <input type="checkbox" [checked]="isPresaSelected(presa.id)" (change)="togglePresa(presa.id)">
            <span>{{presa.nombre}}</span>
            <span class="precio-tag">+ S/ {{presa.precioAdicional.toFixed(2)}}</span>
          </label>
          <div *ngIf="presasActivas.length === 0" class="empty-helper">No hay presas activas disponibles.</div>
        </div>
      </div>
      <div class="dialog-footer">
        <button class="btn-secondary" (click)="modalPlatoVisible = false">Cancelar</button>
        <button class="btn-primary" (click)="guardarPlato()" [disabled]="!platoForm.nombre || !platoForm.tipoMenu">
          {{platoSeleccionado ? 'Actualizar' : 'Crear'}}
        </button>
      </div>
    </p-dialog>
  `,
  styles: [`
    .container { max-width: 1400px; margin: 0 auto; padding: 2rem; }
    .header { margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 1px solid #eaeaea; }
    .title { font-size: 1.75rem; font-weight: 600; margin: 0 0 0.25rem 0; }
    .subtitle { font-size: 0.9rem; color: #666; margin: 0; }
    .tabs { display: flex; gap: 0.5rem; margin-bottom: 2rem; border-bottom: 2px solid #e5e5e5; flex-wrap: wrap; }
    .tab { padding: 0.85rem 1.5rem; border: none; background: transparent; cursor: pointer; font-size: 0.95rem; font-weight: 500; color: #666; border-bottom: 3px solid transparent; margin-bottom: -2px; transition: all 0.2s; font-family: inherit; }
    .tab:hover { color: #1a1a1a; }
    .tab.active { color: #16a34a; border-bottom-color: #16a34a; font-weight: 600; }
    .welcome-message { text-align: center; padding: 4rem 2rem; background: #f8fafc; border-radius: 12px; border: 2px dashed #cbd5e1; }
    .welcome-icon { font-size: 3rem; margin-bottom: 1rem; }
    .welcome-message h3 { margin: 0 0 0.5rem 0; color: #1a1a1a; }
    .welcome-message p { margin: 0; color: #64748b; }
    .actions-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .section-title { font-size: 1.25rem; font-weight: 600; margin: 0; }
    .btn-primary { background: #1a1a1a; color: #fff; border: none; padding: 0.65rem 1.25rem; border-radius: 8px; cursor: pointer; font-weight: 500; font-size: 0.9rem; transition: all 0.2s; font-family: inherit; }
    .btn-primary:hover:not(:disabled) { background: #000; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-secondary { background: #f5f5f5; color: #666; border: none; padding: 0.65rem 1.25rem; border-radius: 8px; cursor: pointer; font-weight: 500; font-size: 0.9rem; transition: all 0.2s; font-family: inherit; }
    .btn-secondary:hover { background: #e5e5e5; }
    .table-container { background: #fff; border-radius: 12px; border: 1px solid #e5e5e5; overflow: hidden; }
    .simple-table { width: 100%; border-collapse: collapse; }
    .simple-table th { background: #fafafa; padding: 1rem; text-align: left; font-size: 0.85rem; font-weight: 600; color: #666; text-transform: uppercase; border-bottom: 2px solid #e5e5e5; }
    .simple-table td { padding: 1rem; border-bottom: 1px solid #f0f0f0; font-size: 0.95rem; vertical-align: middle; }
    .simple-table tr:hover { background: #fafafa; }
    .simple-table tr:last-child td { border-bottom: none; }
    .empty-row { text-align: center; padding: 2rem !important; color: #999; }
    .badge { padding: 0.35rem 0.75rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600; display: inline-block; }
    .badge-success { background: #f0fdf4; color: #16a34a; }
    .badge-danger { background: #fef2f2; color: #dc2626; }
    .badge-info { background: #eff6ff; color: #1d4ed8; }
    .actions-cell { display: flex; gap: 0.5rem; }
    .btn-action { border: none; padding: 0.5rem 0.85rem; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 500; transition: all 0.2s; font-family: inherit; display: flex; align-items: center; gap: 0.35rem; }
    .btn-edit { background: #fef3c7; color: #92400e; }
    .btn-edit:hover { background: #fde68a; }
    .btn-deactivate { background: #fee2e2; color: #991b1b; }
    .btn-deactivate:hover { background: #fecaca; }
    .btn-activate { background: #dcfce7; color: #166534; }
    .btn-activate:hover { background: #bbf7d0; }
    .empty-tab { text-align: center; padding: 4rem 2rem; background: #fafafa; border-radius: 12px; border: 2px dashed #e5e5e5; }
    .empty-icon { font-size: 3rem; margin-bottom: 1rem; }
    .empty-tab h3 { margin: 0 0 0.5rem 0; color: #1a1a1a; }
    .empty-tab p { margin: 0; color: #666; }
    .form-group { margin-bottom: 1.25rem; }
    .form-label { display: block; font-size: 0.85rem; font-weight: 600; color: #333; margin-bottom: 0.5rem; }
    .form-input { width: 100%; padding: 0.65rem 0.85rem; border: 1px solid #e5e5e5; border-radius: 8px; font-size: 0.95rem; font-family: inherit; box-sizing: border-box; }
    .form-input:focus { outline: none; border-color: #16a34a; }
    .dialog-footer { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem; }
    .checkbox-group { display: flex; align-items: center; margin-top: 1rem; }
    .checkbox-label { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-size: 0.95rem; font-weight: 500; color: #333; }
    .checkbox-label input[type="checkbox"] { width: 18px; height: 18px; cursor: pointer; }
    .helper-text { font-size: 0.8rem; color: #666; margin-top: -0.5rem; margin-bottom: 0.75rem; font-style: italic; }
    .presas-list { display: flex; flex-direction: column; gap: 0.5rem; max-height: 200px; overflow-y: auto; border: 1px solid #e5e5e5; border-radius: 8px; padding: 0.75rem; background: #fafafa; }
    .presa-checkbox { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem; background: #fff; border-radius: 6px; border: 1px solid #e5e5e5; cursor: pointer; transition: all 0.2s; }
    .presa-checkbox:hover { border-color: #16a34a; background: #f0fdf4; }
    .presa-checkbox input[type="checkbox"] { width: 16px; height: 16px; cursor: pointer; }
    .precio-tag { margin-left: auto; font-size: 0.8rem; color: #16a34a; font-weight: 600; }
    .empty-helper { text-align: center; color: #999; font-size: 0.85rem; padding: 1rem; }

    /* ═══════════════════════════════════════════════════════════ */
    /* ESTILOS: Configurar Menú del Día */
    /* ═══════════════════════════════════════════════════════════ */
    .configurar-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; padding: 1.5rem; background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 12px; border: 1px solid #bbf7d0; }
    .configurar-subtitle { margin: 0.5rem 0 0 0; color: #166534; font-size: 0.9rem; }
    .btn-large { padding: 0.85rem 1.75rem; font-size: 1rem; font-weight: 600; }
    
    .configurar-section { margin-bottom: 2rem; padding: 1.5rem; background: #fff; border-radius: 12px; border: 1px solid #e5e5e5; }
    .subsection-title { font-size: 1.1rem; font-weight: 600; margin: 0 0 0.5rem 0; color: #1a1a1a; }
    .subsection-hint { margin: 0 0 1.5rem 0; color: #666; font-size: 0.85rem; }
    
    .platos-config-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; }
    .plato-tipo-group { background: #fafafa; padding: 1rem; border-radius: 8px; border: 1px solid #e5e5e5; }
    .plato-tipo-label { font-size: 0.9rem; font-weight: 600; color: #666; margin: 0 0 1rem 0; text-transform: uppercase; letter-spacing: 0.05em; }
    .plato-config-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .plato-config-item { background: #fff; padding: 0.75rem; border-radius: 6px; border: 1px solid #e5e5e5; }
    .plato-config-checkbox { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-weight: 500; }
    .plato-config-checkbox input[type="checkbox"] { width: 18px; height: 18px; cursor: pointer; }
    .plato-config-nombre { font-size: 0.95rem; }
    .plato-config-stock { display: flex; align-items: center; gap: 0.5rem; margin-top: 0.5rem; padding-left: 1.5rem; }
    .plato-config-stock label { font-size: 0.85rem; color: #666; font-weight: 500; }
    .stock-input { width: 80px; padding: 0.4rem 0.6rem; border: 1px solid #e5e5e5; border-radius: 6px; font-size: 0.9rem; text-align: center; }
    .stock-input:focus { outline: none; border-color: #16a34a; }
    
    .presas-config-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 0.75rem; }
    .presa-config-item { background: #fafafa; padding: 0.75rem; border-radius: 6px; border: 1px solid #e5e5e5; }
    .presa-config-checkbox { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; flex-wrap: wrap; }
    .presa-config-checkbox input[type="checkbox"] { width: 18px; height: 18px; cursor: pointer; }
    .presa-config-nombre { font-weight: 500; font-size: 0.95rem; }
    .presa-config-precio { font-size: 0.8rem; color: #16a34a; font-weight: 600; margin-left: auto; }
    .presa-config-stock { display: flex; align-items: center; gap: 0.5rem; margin-top: 0.5rem; padding-left: 1.5rem; }
    .presa-config-stock label { font-size: 0.85rem; color: #666; font-weight: 500; }
    
    .resumen-config { margin-top: 2rem; padding: 1.5rem; background: #eff6ff; border-radius: 12px; border: 1px solid #bfdbfe; }
    .resumen-title { font-size: 1.1rem; font-weight: 600; margin: 0 0 1rem 0; color: #1e40af; }
    .resumen-stats { display: flex; gap: 1.5rem; flex-wrap: wrap; }
    .stat-card { background: #fff; padding: 1rem 1.5rem; border-radius: 8px; border: 1px solid #bfdbfe; display: flex; flex-direction: column; align-items: center; min-width: 120px; }
    .stat-number { font-size: 1.75rem; font-weight: 700; color: #1e40af; }
    .stat-label { font-size: 0.8rem; color: #64748b; text-transform: uppercase; font-weight: 600; margin-top: 0.25rem; }
  `]
})
export class AdminCatalogoComponent implements OnInit {
  private presaService = inject(PresaService);
  private platoMenuService = inject(PlatoMenuService);
  private menuDiaService = inject(MenuDiaService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private cdr = inject(ChangeDetectorRef);

  tabActiva: 'presas' | 'menu' | 'carta' | 'configurar' | null = null;
  
  // Datos
  presas: Presa[] = [];
  presasActivas: Presa[] = [];
  platosMenu: PlatoMenu[] = [];
  platosMenuActivos: PlatoMenu[] = [];
  platosMenuActivosEntradas: PlatoMenu[] = [];
  platosMenuActivosSegundos: PlatoMenu[] = [];
  platosMenuActivosBebidas: PlatoMenu[] = [];
  
  // Estados de carga
  cargando = false;
  cargandoPlatos = false;
  procesandoConfiguracion = false;
  
  // Modales
  modalPresaVisible = false;
  modalPlatoVisible = false;
  
  // Formularios
  presaSeleccionada: Presa | null = null;
  presaForm = { nombre: '', precioAdicional: 0 };

  platoSeleccionado: PlatoMenu | null = null;
  platoForm = { nombre: '', tipoMenu: 'ENTRADA', permiteCambioPresa: false };
  presasSeleccionadasIds: number[] = [];

  // Configuración del menú del día
  platosSeleccionadosIds: number[] = [];
  platosStockMap: { [key: number]: number } = {};
  presasDiaSeleccionadasIds: number[] = [];
  presasStockMap: { [key: number]: number } = {};

  ngOnInit() {}

  cambiarTab(tab: 'presas' | 'menu' | 'carta' | 'configurar') {
    this.tabActiva = tab;
    if (tab === 'presas' && this.presas.length === 0) this.cargarPresas();
    if (tab === 'menu') {
      this.cargarPlatosMenu();
      this.cargarPresasActivas();
    }
    if (tab === 'configurar') {
      this.cargarPresasActivas();
      this.cargarPlatosMenuActivos();
      this.cargarMenuDiaConfigurado();
    }
  }

  // ═══════════════════════════════════════════════════════════
  // LÓGICA DE PRESAS
  // ═══════════════════════════════════════════════════════════
  cargarPresas() {
    this.cargando = true;
    this.presaService.listar().subscribe({
      next: (presas) => {
        this.presas = presas;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargando = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar las presas' });
      }
    });
  }

  cargarPresasActivas() {
    this.presaService.listar().subscribe({
      next: (presas) => {
        this.presasActivas = presas.filter(p => p.activo);
      }
    });
  }

  abrirModalPresa(presa?: Presa) {
    this.presaSeleccionada = presa || null;
    this.presaForm = presa ? { nombre: presa.nombre, precioAdicional: presa.precioAdicional } : { nombre: '', precioAdicional: 0 };
    this.modalPresaVisible = true;
  }

  guardarPresa() {
    if (!this.presaForm.nombre.trim()) return;
    const accion = this.presaSeleccionada 
      ? this.presaService.actualizar(this.presaSeleccionada.id, this.presaForm)
      : this.presaService.crear(this.presaForm);

    accion.subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: '¡Éxito!', detail: `Presa ${this.presaSeleccionada ? 'actualizada' : 'creada'}` });
        this.modalPresaVisible = false;
        this.cargarPresas();
        if (this.tabActiva === 'menu' || this.tabActiva === 'configurar') this.cargarPresasActivas();
      },
      error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'No se pudo guardar' })
    });
  }

  confirmarDeshabilitarPresa(presa: Presa) {
    const accionTexto = presa.activo ? 'deshabilitar' : 'activar';
    this.confirmarCambioEstado(
      presa.activo ? this.presaService.deshabilitar(presa.id) : this.presaService.activar(presa.id),
      accionTexto,
      presa.nombre,
      () => this.cargarPresas()
    );
  }

  // ═══════════════════════════════════════════════════════════
  // LÓGICA DE PLATOS DEL MENÚ
  // ═══════════════════════════════════════════════════════════
  cargarPlatosMenu() {
    this.cargandoPlatos = true;
    this.platoMenuService.listar().subscribe({
      next: (platos) => {
        this.platosMenu = platos;
        this.cargandoPlatos = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargandoPlatos = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los platos' });
      }
    });
  }

  cargarPlatosMenuActivos() {
    this.platoMenuService.listar().subscribe({
      next: (platos) => {
        this.platosMenuActivos = platos.filter(p => p.activo);
        this.platosMenuActivosEntradas = this.platosMenuActivos.filter(p => p.tipoMenu === 'ENTRADA');
        this.platosMenuActivosSegundos = this.platosMenuActivos.filter(p => p.tipoMenu === 'SEGUNDO');
        this.platosMenuActivosBebidas = this.platosMenuActivos.filter(p => p.tipoMenu === 'BEBIDA');
      }
    });
  }

  abrirModalPlato(plato?: PlatoMenu) {
    this.platoSeleccionado = plato || null;
    if (plato) {
      this.platoForm = { nombre: plato.nombre, tipoMenu: plato.tipoMenu, permiteCambioPresa: plato.permiteCambioPresa };
      this.presasSeleccionadasIds = plato.presasAsociadas?.map(p => p.id) || [];
    } else {
      this.platoForm = { nombre: '', tipoMenu: 'ENTRADA', permiteCambioPresa: false };
      this.presasSeleccionadasIds = [];
    }
    this.modalPlatoVisible = true;
  }

  isPresaSelected(presaId: number): boolean {
    return this.presasSeleccionadasIds.includes(presaId);
  }

  togglePresa(presaId: number) {
    if (this.isPresaSelected(presaId)) {
      this.presasSeleccionadasIds = this.presasSeleccionadasIds.filter(id => id !== presaId);
    } else {
      this.presasSeleccionadasIds.push(presaId);
    }
  }

  guardarPlato() {
    if (!this.platoForm.nombre.trim()) return;
    
    if (this.platoForm.permiteCambioPresa && this.presasSeleccionadasIds.length === 0) {
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Debes seleccionar al menos una presa' });
      return;
    }

    const payload = {
      ...this.platoForm,
      presaIds: this.platoForm.permiteCambioPresa ? this.presasSeleccionadasIds : []
    };

    const accion = this.platoSeleccionado
      ? this.platoMenuService.actualizar(this.platoSeleccionado.id, payload)
      : this.platoMenuService.crear(payload);

    accion.subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: '¡Éxito!', detail: `Plato ${this.platoSeleccionado ? 'actualizado' : 'creado'}` });
        this.modalPlatoVisible = false;
        this.cargarPlatosMenu();
        if (this.tabActiva === 'configurar') this.cargarPlatosMenuActivos();
      },
      error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'No se pudo guardar' })
    });
  }

  confirmarDeshabilitarPlato(plato: PlatoMenu) {
    const accionTexto = plato.activo ? 'deshabilitar' : 'activar';
    this.confirmarCambioEstado(
      this.platoMenuService.cambiarEstado(plato.id),
      accionTexto,
      plato.nombre,
      () => this.cargarPlatosMenu()
    );
  }

  // ═══════════════════════════════════════════════════════════
  // LÓGICA: CONFIGURAR MENÚ DEL DÍA
  // ═══════════════════════════════════════════════════════════
  cargarMenuDiaConfigurado() {
    this.menuDiaService.obtenerConfigurado().subscribe({
      next: (config) => {
        // Cargar platos ya configurados
        this.platosSeleccionadosIds = config.platos.map(p => p.id);
        this.platosStockMap = {};
        config.platos.forEach(p => {
          this.platosStockMap[p.id] = p.stock;
        });

        // Cargar presas ya configuradas
        this.presasDiaSeleccionadasIds = config.presas.map(p => p.id);
        this.presasStockMap = {};
        config.presas.forEach(p => {
          this.presasStockMap[p.id] = p.stock;
        });

        this.cdr.detectChanges();
      },
      error: () => {
        // Si no hay configuración, iniciar vacío
        this.platosSeleccionadosIds = [];
        this.platosStockMap = {};
        this.presasDiaSeleccionadasIds = [];
        this.presasStockMap = {};
      }
    });
  }

  isPlatoSeleccionado(platoId: number): boolean {
    return this.platosSeleccionadosIds.includes(platoId);
  }

  togglePlato(platoId: number) {
    if (this.isPlatoSeleccionado(platoId)) {
      this.platosSeleccionadosIds = this.platosSeleccionadosIds.filter(id => id !== platoId);
      delete this.platosStockMap[platoId];
    } else {
      this.platosSeleccionadosIds.push(platoId);
      this.platosStockMap[platoId] = 20; // Stock por defecto
    }
  }

  isPresaDiaSeleccionada(presaId: number): boolean {
    return this.presasDiaSeleccionadasIds.includes(presaId);
  }

  togglePresaDia(presaId: number) {
    if (this.isPresaDiaSeleccionada(presaId)) {
      this.presasDiaSeleccionadasIds = this.presasDiaSeleccionadasIds.filter(id => id !== presaId);
      delete this.presasStockMap[presaId];
    } else {
      this.presasDiaSeleccionadasIds.push(presaId);
      this.presasStockMap[presaId] = 30; // Stock por defecto
    }
  }

  get totalStockPlatos(): number {
    return this.platosSeleccionadosIds.reduce((sum, id) => sum + (this.platosStockMap[id] || 0), 0);
  }

  publicarMenuDia() {
    // Validación básica
    if (this.platosSeleccionadosIds.length === 0 && this.presasDiaSeleccionadasIds.length === 0) {
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Debes seleccionar al menos un plato o una presa' });
      return;
    }

    this.procesandoConfiguracion = true;

    this.confirmationService.confirm({
      message: `¿Estás seguro de publicar este menú para hoy?\n\n• ${this.platosSeleccionadosIds.length} platos\n• ${this.presasDiaSeleccionadasIds.length} presas`,
      header: 'Confirmar Publicación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, publicar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-success',
      accept: () => {
        // ✅ IMPORTANTE: Construimos el payload asegurando que siempre sean arrays []
        // para que tu @NotNull en el backend no falle.
        const request = {
          platos: this.platosSeleccionadosIds.map(id => ({
            catalogoPlatoMenuId: id,
            stock: this.platosStockMap[id] || 0
          })),
          presas: this.presasDiaSeleccionadasIds.map(id => ({
            presaId: id,
            stock: this.presasStockMap[id] || 0
          }))
        };

        this.menuDiaService.configurar(request).subscribe({
          next: (response) => {
            this.messageService.add({
              severity: 'success',
              summary: '¡Menú Publicado!',
              detail: `${response.totalPlatos} platos y ${response.totalPresas} presas configurados para hoy`
            });
            this.procesandoConfiguracion = false;
            this.cargarMenuDiaConfigurado(); // Recarga los datos para ver los cambios
          },
          error: (err) => {
            console.error('Error al publicar:', err);
            this.messageService.add({ 
              severity: 'error', 
              summary: 'Error', 
              detail: err.error?.message || 'No se pudo publicar el menú' 
            });
            this.procesandoConfiguracion = false;
          }
        });
      },
      reject: () => {
        this.procesandoConfiguracion = false;
      }
    });
  }

  // ═══════════════════════════════════════════════════════════
  // UTILIDADES
  // ═══════════════════════════════════════════════════════════
  private confirmarCambioEstado(accion: any, accionTexto: string, nombre: string, callback: () => void) {
    this.confirmationService.confirm({
      message: `¿Estás seguro de ${accionTexto} "${nombre}"?`,
      header: accionTexto === 'deshabilitar' ? 'Deshabilitar' : 'Activar',
      icon: accionTexto === 'deshabilitar' ? 'pi pi-exclamation-triangle' : 'pi pi-check',
      acceptLabel: accionTexto === 'deshabilitar' ? 'Sí, deshabilitar' : 'Sí, activar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: accionTexto === 'deshabilitar' ? 'p-button-danger' : 'p-button-success',
      accept: () => {
        accion.subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: `"${nombre}" ${accionTexto}do correctamente` });
            callback();
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cambiar el estado' })
        });
      }
    });
  }
}