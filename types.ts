
export enum UserRole {
  CLIENT = 'CLIENT',
  ADMIN = 'ADMIN',
  SUPPLIER = 'SUPPLIER',
}

export enum OrderStatus {
  PENDING_APPROVAL = 'Pendiente Aprobación', // New status for initial creation
  IN_REVIEW = 'En Licitación', // Visible to suppliers
  IN_PREPARATION = 'En Preparación', // Adjudicated
  ON_ITS_WAY = 'En Camino',
  DELIVERED = 'Entregado',
  REJECTED = 'Rechazado',
}

export interface User {
  id: number;
  email: string;
  password?: string; // Should not be stored long-term in a real app
  role: UserRole;
  schoolName: string;
  address: string;
  cuit: string;
  taxStatus: string; // "Responsable Inscripto"
}

export interface OrderItem {
  id: number;
  quantity: number;
  product: string;
  brand: string;
}

export interface Comment {
  id: string;
  userId: number;
  userName: string;
  text: string;
  timestamp: string;
  isAdmin: boolean;
}

export interface DispatchDetails {
  driverName: string;
  vehiclePlate: string;
  dispatchedAt: string;
  trackingNumber?: string;
}

export interface Order {
  id: number;
  userId: number;
  schoolName: string;
  items: OrderItem[];
  status: OrderStatus;
  createdAt: string;
  // New fields for request details
  expirationDate?: string; // When the bidding closes
  requestedDeliveryDate?: string; // Desired delivery date
  termsAndConditions?: string; // Client notes/requirements
  comments?: Comment[]; // Added comments field
  dispatchDetails?: DispatchDetails; // Added dispatch info
}

// Interface specific for the Supplier Dashboard view
export interface SupplierOrder {
  id: string; // Alphanumeric code (e.g., REQ-2024-001)
  schoolName: string;
  title: string;
  itemsTotal: number;
  itemsQuoted: number;
  status: 'PENDIENTE' | 'COTIZADA' | 'VENCIDA';
  remainingTimeSeconds: number; // For the countdown
  province: string;
  createdAt: string;
}

// Interfaces for the Detailed Quote View
export interface ProductToQuote {
  id: string;
  sku: string;
  name: string;
  quantity: number;
  targetBrand?: string; // Brand requested by client (optional)
  // Fields for the supplier to fill:
  quotedPrice?: number;
  quotedBrand?: string;
}

export interface QuoteDetail {
  id: string;
  title: string;
  clientName: string;
  clientAddress: string;
  requestedPaymentTerm: string;
  requestedDeliveryDays: number;
  creationDate: string;
  expirationDate: string;
  termsAndConditions: string; // Client notes
  products: ProductToQuote[];
}

// New Types for Comparison View
export interface SupplierQuoteResponse {
  supplierId: number;
  supplierName: string;
  supplierScore: number; // 1-5 stars based on history
  paymentTerms: string;
  deliveryDays: number;
  totalAmount: number;
  items: {
    productId: string;
    price: number;
    brandOffered: string;
    notes?: string;
  }[];
}
