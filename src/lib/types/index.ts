export type ViewType = 'front' | 'back' | 'model' | 'detail';
export type PrintPlacement = 'front' | 'back' | 'left_pocket' | 'right_pocket' | 'sleeves';
export type ProductStatus = 'draft' | 'published' | 'archived';
export type OrderStatus = 'pending' | 'confirmed' | 'in_production' | 'dispatched' | 'delivered' | 'cancelled' | 'refunded';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'USER_DROPPED' | 'REFUNDED';
export type FulfilmentStatus = 'queued' | 'processing' | 'submitted' | 'shipped' | 'delivered' | 'failed' | 'cancelled';
export type ReviewStatus = 'pending' | 'approved' | 'rejected';
export type GrievanceStatus = 'submitted' | 'acknowledged' | 'under_investigation' | 'resolved' | 'dismissed';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  display_order: number;
  is_active: boolean;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  banner_url?: string;
  is_active: boolean;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string;
  color_name: string;
  color_hex: string;
  size: string;
  price_paise: number;
  compare_at_price_paise?: number;
  qikink_sku?: string;
  qikink_product_id?: string;
  stock_quantity: number;
  is_active: boolean;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text: string;
  display_order: number;
  is_primary: boolean;
  view_type: ViewType;
}

export interface ProductDesign {
  id: string;
  product_id: string;
  variant_id?: string;
  design_code: string;
  placement: PrintPlacement;
  artwork_url: string;
  preview_mockup_url?: string;
  print_width_inches: number;
  print_height_inches: number;
  is_active: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  short_description: string;
  detailed_description: string;
  category_id?: string;
  category?: Category;
  collection_id?: string;
  fabric_info: string;
  fit_info: string;
  wash_care: string;
  base_price_paise: number;
  compare_at_price_paise?: number;
  prior_30d_price_paise?: number; // CPA compliance
  gst_rate_percentage: number;
  is_featured: boolean;
  is_active: boolean;
  meta_title?: string;
  meta_description?: string;
  images: ProductImage[];
  variants: ProductVariant[];
  designs?: ProductDesign[];
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  variant_id: string;
  product: Product;
  variant: ProductVariant;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  coupon_code?: string;
  subtotal_paise: number;
  discount_paise: number;
  shipping_fee_paise: number;
  gst_amount_paise: number;
  total_paise: number;
}

export interface UserAddress {
  id: string;
  user_id?: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default?: boolean;
}

export interface DeliveryEstimate {
  pincode: string;
  is_serviceable: boolean;
  city: string;
  state: string;
  production_days_min: number;
  production_days_max: number;
  courier_transit_days: number;
  total_days_min: number;
  total_days_max: number;
  estimated_delivery_start: string;
  estimated_delivery_end: string;
  shipping_fee_paise: number;
  free_shipping_eligible: boolean;
  notes?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  variant_id: string;
  product_id: string;
  product_name: string;
  variant_name: string;
  sku: string;
  unit_price_paise: number;
  quantity: number;
  total_price_paise: number;
  gst_rate_percentage: number;
  qikink_sku?: string;
  design_snapshot?: {
    design_code: string;
    placement: PrintPlacement;
    artwork_url: string;
    print_width: number;
    print_height: number;
  };
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string;
  guest_email?: string;
  guest_phone?: string;
  status: OrderStatus;
  subtotal_paise: number;
  discount_paise: number;
  shipping_fee_paise: number;
  gst_amount_paise: number;
  total_amount_paise: number;
  coupon_code?: string;
  shipping_address_snapshot: UserAddress;
  delivery_estimate_min_days: number;
  delivery_estimate_max_days: number;
  delivery_estimate_date: string;
  items: OrderItem[];
  payments?: PaymentRecord[];
  fulfilment_job?: FulfilmentJob;
  shipment?: Shipment;
  created_at: string;
  updated_at: string;
}

export interface PaymentRecord {
  id: string;
  order_id: string;
  payment_gateway: 'cashfree';
  cf_order_id: string;
  cf_payment_id?: string;
  payment_session_id?: string;
  payment_status: PaymentStatus;
  amount_paise: number;
  currency: 'INR';
  payment_method?: string;
  created_at: string;
}

export interface FulfilmentJob {
  id: string;
  order_id: string;
  provider: 'qikink';
  status: FulfilmentStatus;
  qikink_order_id?: string;
  retry_count: number;
  max_retries: number;
  last_error?: string;
  created_at: string;
  updated_at: string;
}

export interface Shipment {
  id: string;
  order_id: string;
  courier_name?: string;
  tracking_number?: string;
  tracking_url?: string;
  current_status: string;
  estimated_delivery_date?: string;
  tracking_history?: Array<{
    status: string;
    location: string;
    timestamp: string;
    description: string;
  }>;
}

export interface ProductReview {
  id: string;
  product_id: string;
  user_name: string;
  rating: number;
  title: string;
  review_text: string;
  is_verified_purchase: boolean;
  status: ReviewStatus;
  helpful_votes: number;
  created_at: string;
  images?: string[];
}

export interface GrievanceComplaint {
  id: string;
  complaint_reference: string;
  complainant_name: string;
  email: string;
  phone: string;
  category: string;
  description: string;
  attachment_url?: string;
  status: GrievanceStatus;
  acknowledged_at?: string;
  resolved_at?: string;
  resolution_summary?: string;
  created_at: string;
}

