export interface MenuDiaResponse {
  fecha: string;
  precioMenu: number;
  entradas: PlatoMenuResponse[];
  segundos: PlatoMenuResponse[];
  bebidas: PlatoMenuResponse[];
}

export interface PlatoMenuResponse {
  id: number;
  nombre: string;
  tipoMenu: string;
  stock: number;
  disponible: boolean;
  permiteCambioPresa: boolean;
    precioUnitario?: number; 
  presasDisponibles?: PresaResponse[];
}

export interface PresaResponse {
  id: number;
  nombre: string;
  precioAdicional: number;
  stock?: number;
  porDefecto?: boolean;
}

export interface CatalogoPlatoMenu {
  id: number;
  nombre: string;
  tipoMenu: string;
  permiteCambioPresa: boolean;
  activo: boolean;
  presasAsociadas?: PresaResponse[];
}

export interface Cliente {
  id: number;
  telefono: string;
  nombre?: string;
  notas?: string;
}
export interface ConfiguracionResponse {
  precioMenu: number;
  costoDescartable: number;
  costoDelivery: number;
}

export interface PlatoCarta {
  id: number;
  nombre: string;
  categoria: string;
  precio: number;
  stock: number;
  activo: boolean;
}