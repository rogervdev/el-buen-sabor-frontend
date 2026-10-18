import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Presa {
  id: number;
  nombre: string;
  precioAdicional: number;
  activo: boolean;
}

@Injectable({ providedIn: 'root' })
export class PresaService {
  private http = inject(HttpClient);
  private baseUrl = '/api/presas';

  listar(): Observable<Presa[]> {
    return this.http.get<Presa[]>(this.baseUrl);
  }

  obtener(id: number): Observable<Presa> {
    return this.http.get<Presa>(`${this.baseUrl}/${id}`);
  }

  crear(presa: { nombre: string; precioAdicional: number }): Observable<Presa> {
    return this.http.post<Presa>(this.baseUrl, presa);
  }

  actualizar(id: number, presa: { nombre: string; precioAdicional: number }): Observable<Presa> {
    return this.http.put<Presa>(`${this.baseUrl}/${id}`, presa);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  deshabilitar(id: number): Observable<Presa> {
  return this.http.patch<Presa>(`${this.baseUrl}/${id}/deshabilitar`, {});
}

activar(id: number): Observable<Presa> {
  return this.http.patch<Presa>(`${this.baseUrl}/${id}/activar`, {});
}
}