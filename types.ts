
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
  id: string; // Changed to string (UUID from Supabase auth)
  email: string;
  role: UserRole;
  schoolName: string;
  address: string;
  cuit: string;
  taxStatus: string; // "Responsable Inscripto"
  password?: string; // Optional password for local storage simulation
}

export interface OrderItem {
  id: number; // Stays number (bigint from Supabase)
  quantity: number;
  product: string;
  brand: string;
}

export interface Comment {
  id: string;
  userId: string; // Changed to string (references User.id)
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
  id: number; // Stays number (bigint from Supabase)
  userId: string; // Changed to string (references User.id)
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