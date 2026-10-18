import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cliente } from '../../shared/models/menu.model';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private http = inject(HttpClient);
  private apiUrl = '/api/clientes';

  buscarPorTelefono(telefono: string): Observable<Cliente> {
    const params = new HttpParams().set('telefono', telefono);
    return this.http.get<Cliente>(`${this.apiUrl}/buscar`, { params });
  }

  crear(cliente: Partial<Cliente>): Observable<Cliente> {
    return this.http.post<Cliente>(this.apiUrl, cliente);
  }
}