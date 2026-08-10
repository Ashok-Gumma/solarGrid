export type Role = 'ADMIN' | 'WAREHOUSE' | 'TECHNICIAN' | 'CUSTOMER';
export type CustomerType = 'RETAIL' | 'WHOLESALE' | 'DISTRIBUTOR';
export type CustomerStatus = 'LEAD' | 'ACTIVE' | 'INACTIVE';
export type ChallanStatus = 'DRAFT' | 'CONFIRMED' | 'CANCELLED';
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'DISPATCHED' | 'DELIVERED' | 'COMPLETED' | 'RETURN_REQUESTED' | 'RETURNED' | 'CANCELLED';
export type InstallationType = 'SOLARGRID_INSTALLER' | 'CUSTOMER_OWN_INSTALLER' | 'NO_INSTALLATION';
export type InstallationStatus = 'SCHEDULED' | 'ASSIGNED' | 'EN_ROUTE' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type ServiceStatus = 'OPEN' | 'ASSIGNED' | 'SCHEDULED' | 'IN_PROGRESS' | 'WAITING_FOR_PARTS' | 'RESOLVED' | 'CANCELLED';
export type WarrantyStatus = 'ACTIVE' | 'EXPIRED' | 'CLAIMED';
export type MovementType = 'IN' | 'OUT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  avatarUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Notification {
  id: string;
  userId?: string;
  targetRole?: Role | 'ALL';
  title: string;
  message: string;
  referenceType?: string;
  referenceId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Customer {
  id: string;
  userId?: string;
  name: string;
  businessName?: string;
  email: string;
  phone: string;
  gstNumber?: string;
  customerType: CustomerType;
  status: CustomerStatus;
  followUpDate?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Address {
  id: string;
  customerId: string;
  addressLabel: string;
  addressLine: string;
  area?: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  contactPerson?: string;
  contactPhone?: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
  createdAt?: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  categoryId?: string;
  categoryName?: string;
  unitPrice: number;
  currentStock: number;
  minStockAlert: number;
  location: string;
  installationEligible: boolean;
  warrantyMonths: number;
  description: string;
  specifications: string[];
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName?: string;
  productSku?: string;
  quantity: number;
  movementType: MovementType;
  reason: string;
  referenceType?: string;
  referenceId?: string;
  createdBy?: string;
  createdByName?: string;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  installationEligible: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName?: string;
  addressId?: string;
  addressText?: string;
  installationType: InstallationType;
  totalAmount: number;
  status: OrderStatus;
  returnReason?: string;
  returnNotes?: string;
  items?: OrderItem[];
  createdAt: string;
  updatedAt?: string;
}

export interface ChallanItem {
  id: string;
  challanId: string;
  productId: string;
  productName: string;
  sku: string;
  unitPrice: number;
  quantity: number;
}

export interface Challan {
  id: string;
  challanNumber: string;
  orderId?: string;
  customerId: string;
  customerName?: string;
  status: ChallanStatus;
  totalQuantity: number;
  createdBy?: string;
  createdByName?: string;
  confirmedAt?: string;
  items?: ChallanItem[];
  createdAt: string;
  updatedAt?: string;
}

export interface ChecklistState {
  panels: boolean;
  inverter: boolean;
  wiring: boolean;
  safety: boolean;
  testing?: boolean;
}

export interface InstallationJob {
  id: string;
  jobNumber: string;
  orderId: string;
  customerId: string;
  customerName?: string;
  customerPhone?: string;
  addressId: string;
  addressText?: string;
  latitude?: number;
  longitude?: number;
  scheduledDate: string;
  timeSlot: string;
  requiredCrewSize: number;
  status: InstallationStatus;
  checklistState: ChecklistState;
  technicians?: User[];
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Warranty {
  id: string;
  customerId: string;
  orderId?: string;
  productId: string;
  productName: string;
  serialNumber: string;
  startDate: string;
  endDate: string;
  status: WarrantyStatus;
  createdAt?: string;
}

export interface ServicePart {
  id: string;
  serviceRequestId: string;
  productId: string;
  productName?: string;
  quantity: number;
  unitPrice: number;
}

export interface ServiceRequest {
  id: string;
  serviceNumber: string;
  customerId: string;
  customerName?: string;
  customerPhone?: string;
  addressId: string;
  addressText?: string;
  latitude?: number;
  longitude?: number;
  productId?: string;
  productName?: string;
  problemCategory: string;
  description: string;
  warrantyStatus: WarrantyStatus;
  scheduledDate?: string;
  timeSlot?: string;
  status: ServiceStatus;
  technicians?: User[];
  partsUsed?: ServicePart[];
  resolutionNotes?: string;
  totalCost: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CrmFollowUp {
  id: string;
  customerId: string;
  customerName?: string;
  createdBy?: string;
  createdByName?: string;
  followUpDate: string;
  notes: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId?: string;
  userName?: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: Record<string, any>;
  createdAt: string;
}
