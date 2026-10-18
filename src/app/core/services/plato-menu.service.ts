import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PlatoMenu {
  id: number;
  nombre: string;
  tipoMenu: string;
  permiteCambioPresa: boolean;
  activo: boolean;
  presasAsociadas?: { id: number; nombre: string; porDefecto: boolean }[];
}

@Injectable({ providedIn: 'root' })
export class PlatoMenuService {
  private http = inject(HttpClient);
  private baseUrl = '/api/platos-menu';

  listar(): Observable<PlatoMenu[]> {
    return this.http.get<PlatoMenu[]>(this.baseUrl);
  }

  crear(plato: any): Observable<PlatoMenu> {
    return this.http.post<PlatoMenu>(this.baseUrl, plato);
  }

  actualizar(id: number, plato: any): Observable<PlatoMenu> {
    return this.http.put<PlatoMenu>(`${this.baseUrl}/${id}`, plato);
  }

  cambiarEstado(id: number): Observable<PlatoMenu> {
    return this.http.patch<PlatoMenu>(`${this.baseUrl}/${id}/estado`, {});
  }
}