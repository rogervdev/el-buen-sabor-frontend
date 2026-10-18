import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MenuDiaResponse, ConfiguracionResponse, PlatoCarta } from '../../shared/models/menu.model';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private http = inject(HttpClient);

  getMenuDelDia(): Observable<MenuDiaResponse> {
    return this.http.get<MenuDiaResponse>('/api/menu/hoy');
  }

  getConfiguracion(): Observable<ConfiguracionResponse> {
    return this.http.get<ConfiguracionResponse>('/api/configuracion');
  }

 // 🚀 NUEVO: Obtener platos a la carta
  getPlatosCarta(): Observable<PlatoCarta[]> {
    return this.http.get<PlatoCarta[]>('/api/platos-carta'); 
    // ⚠️ Asegúrate de que tu Controller en Spring Boot tenga este endpoint: @GetMapping("/api/platos-carta")
  }

}