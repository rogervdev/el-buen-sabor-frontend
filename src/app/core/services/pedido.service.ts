import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PedidoRequest, PedidoResponse } from '../../shared/models/pedido.model';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  private http = inject(HttpClient);
  private apiUrl = '/api/pedidos';

  crearPedido(pedido: PedidoRequest): Observable<PedidoResponse> {
    return this.http.post<PedidoResponse>(this.apiUrl, pedido);
  }

  getPedidosDelDia(): Observable<PedidoResponse[]> {
    return this.http.get<PedidoResponse[]>(`${this.apiUrl}/hoy`);
  }

    // ✅ CORREGIDO: El backend espera '?estado=', no '?nuevoEstado='
  cambiarEstado(id: number, nuevoEstado: string): Observable<PedidoResponse> {
    return this.http.patch<PedidoResponse>(
      `${this.apiUrl}/${id}/estado?estado=${nuevoEstado}`, // ⚠️ Cambia "nuevoEstado=" por "estado="
      {}
    );
  }

  anularPedido(id: number): Observable<PedidoResponse> {
    return this.http.patch<PedidoResponse>(`${this.apiUrl}/${id}/anular`, {});
  }
}