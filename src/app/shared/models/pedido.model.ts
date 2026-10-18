export interface PedidoRequest {
  clienteId?: number;
  clienteNombre: string;
  clienteTelefono?: string;
  tipo: 'MESA' | 'LLEVAR';
  tipoVenta: 'MENU' | 'CARTA';
  metodoPago: 'EFECTIVO' | 'YAPE' | 'PLIN' | 'TARJETA' | 'TRANSFERENCIA';
  montoRecibido?: number;
  requiereDelivery?: boolean;
  detalles: PedidoDetalleRequest[];
}

export interface PedidoDetalleRequest {
  platoId?: number;                   // ✅ Ahora es opcional (solo para MENÚ)
  catalogoPlatoCartaId?: number;      // ✅ NUEVO: Para que el backend sepa si es CARTA
  presaId?: number;
  entradaId?: number;
  bebidaId?: number;
  cantidad: number;
  precioUnitario: number;             // ✅ NUEVO: El backend necesita el precio para validarlo
  observacion?: string;
}

export interface PedidoResponse {
  id: number;
  clienteNombre: string;
  clienteTelefono?: string;
  tipo: string;
  tipoVenta: string;
  estado: string;
  total: number;
  metodoPago: string;
  montoRecibido?: number;
  vuelto?: number;
  costoDescartable?: number;
  requiereDelivery?: boolean;
  costoDelivery?: number;
  fechaHora: string;
  detalles: PedidoDetalleResponse[];
}

export interface PedidoDetalleResponse {
  id: number;
  catalogoPlatoCartaId?: number;
  nombreSegundo?: string;
  nombreEntrada?: string;
  nombreBebida?: string;
  nombrePresa?: string;
  nombrePlatoCarta?: string;
  cantidad: number;
  precioUnitario: number;
  observacion?: string;
}

// Interfaz para el carrito (visual)
export interface CarritoItem {
  id: number;                         // ✅ Obligatorio para el manejo interno del carrito
  platoId?: number;                   // ✅ Opcional (si es MENÚ)
  platoCartaId?: number;              // ✅ NUEVO: Opcional (si es CARTA)
  nombrePlato: string;
  nombrePresa?: string;
  nombreEntrada?: string;
  nombreBebida?: string;
  cantidad: number;
  precioUnitario: number;
  observacion?: string;
}