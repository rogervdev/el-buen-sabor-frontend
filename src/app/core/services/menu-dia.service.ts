import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ConfigurarMenuDiaRequest {
  platos: { catalogoPlatoMenuId: number; stock: number }[];
  presas: { presaId: number; stock: number }[];
}

export interface MenuDiaConfigurado {
  fecha: string;
  totalPlatos: number;
  totalPresas: number;
  platos: any[];
  presas: any[];
}

@Injectable({ providedIn: 'root' })
export class MenuDiaService {
  private http = inject(HttpClient);
  private baseUrl = '/api/menu-dia';

  // ✅ CORRECCIÓN: Tu GET está en la ruta base, no en /configurado
  obtenerConfigurado(): Observable<MenuDiaConfigurado> {
    return this.http.get<MenuDiaConfigurado>(this.baseUrl); 
  }

  configurar(request: ConfigurarMenuDiaRequest): Observable<MenuDiaConfigurado> {
    return this.http.post<MenuDiaConfigurado>(`${this.baseUrl}/configurar`, request);
  }
}