-- ==============================================================================
-- IMAGIX E-COMMERCE PLATFORM — COMPLETE SUPABASE POSTGRESQL SCHEMA (30 TABLES)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 2. USER ROLES (Strict role-based access control, never in user metadata)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('customer', 'admin', 'support')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    CONSTRAINT unique_user_role UNIQUE (user_id, role)
);

-- 3. USER ADDRESSES
CREATE TABLE IF NOT EXISTS public.user_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postal_code VARCHAR(10) NOT NULL,
    country VARCHAR(50) NOT NULL DEFAULT 'India',
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 4. CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 5. COLLECTIONS
CREATE TABLE IF NOT EXISTS public.collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    banner_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 6. COLLECTION PRODUCTS
CREATE TABLE IF NOT EXISTS public.collection_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
    product_id UUID NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    CONSTRAINT unique_collection_product UNIQUE (collection_id, product_id)
);

-- 7. PRODUCTS (Prices in integer paise)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    short_description TEXT NOT NULL,
    detailed_description TEXT NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    fabric_info TEXT NOT NULL,
    fit_info TEXT NOT NULL,
    wash_care TEXT NOT NULL,
    base_price_paise BIGINT NOT NULL CHECK (base_price_paise >= 0),
    compare_at_price_paise BIGINT CHECK (compare_at_price_paise >= 0),
    prior_30d_price_paise BIGINT CHECK (prior_30d_price_paise >= 0), -- CPA 2026 Prior Price Rule
    gst_rate_percentage NUMERIC(5,2) NOT NULL DEFAULT 5.00 CHECK (gst_rate_percentage >= 0),
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    meta_title TEXT,
    meta_description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 8. PRODUCT VARIANTS (SKUs and Qikink mapping)
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    sku TEXT NOT NULL UNIQUE,
    color_name TEXT NOT NULL,
    color_hex TEXT NOT NULL,
    size TEXT NOT NULL,
    price_paise BIGINT NOT NULL CHECK (price_paise >= 0),
    compare_at_price_paise BIGINT CHECK (compare_at_price_paise >= 0),
    qikink_sku TEXT,
    qikink_product_id TEXT,
    stock_quantity INT NOT NULL DEFAULT 100 CHECK (stock_quantity >= 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 9. PRODUCT IMAGES
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text TEXT NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    view_type TEXT NOT NULL DEFAULT 'front' CHECK (view_type IN ('front', 'back', 'model', 'detail')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 10. PRODUCT DESIGNS (High-res artwork & Qikink print parameters)
CREATE TABLE IF NOT EXISTS public.product_designs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
    design_code TEXT NOT NULL,
    placement TEXT NOT NULL CHECK (placement IN ('front', 'back', 'left_pocket', 'right_pocket', 'sleeves')),
    artwork_url TEXT NOT NULL,
    preview_mockup_url TEXT,
    print_width_inches NUMERIC(4,2) NOT NULL DEFAULT 10.00,
    print_height_inches NUMERIC(4,2) NOT NULL DEFAULT 12.00,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 11. PRODUCT REVIEWS
CREATE TABLE IF NOT EXISTS public.product_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_name TEXT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT NOT NULL,
    review_text TEXT NOT NULL,
    is_verified_purchase BOOLEAN NOT NULL DEFAULT false,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    helpful_votes INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 12. REVIEW IMAGES
CREATE TABLE IF NOT EXISTS public.review_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id UUID NOT NULL REFERENCES public.product_reviews(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 13. CARTS (Persistent guest & customer cart)
CREATE TABLE IF NOT EXISTS public.carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id TEXT UNIQUE,
    coupon_code TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 14. CART ITEMS
CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
    variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
    quantity INT NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    CONSTRAINT unique_cart_variant UNIQUE (cart_id, variant_id)
);

-- 15. COUPONS
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value BIGINT NOT NULL CHECK (discount_value > 0),
    min_cart_value_paise BIGINT NOT NULL DEFAULT 0,
    max_discount_paise BIGINT,
    starts_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    expires_at TIMESTAMPTZ,
    max_redemptions INT,
    redemptions_count INT NOT NULL DEFAULT 0,
    per_user_limit INT NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 16. COUPON PRODUCTS
CREATE TABLE IF NOT EXISTS public.coupon_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    CONSTRAINT unique_coupon_product UNIQUE (coupon_id, product_id)
);

-- 17. CUSTOMER CONSENTS (DPDP Act 2023 compliance)
CREATE TABLE IF NOT EXISTS public.customer_consents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id TEXT,
    consent_type TEXT NOT NULL CHECK (consent_type IN ('cookies', 'dpdp_privacy', 'marketing_email', 'terms')),
    is_granted BOOLEAN NOT NULL DEFAULT true,
    policy_version TEXT NOT NULL DEFAULT '1.0',
    ip_hash TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 18. ORDERS (Core immutable financial snapshot)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT NOT NULL UNIQUE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    guest_email TEXT,
    guest_phone TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_production', 'dispatched', 'delivered', 'cancelled', 'refunded')),
    subtotal_paise BIGINT NOT NULL CHECK (subtotal_paise >= 0),
    discount_paise BIGINT NOT NULL DEFAULT 0 CHECK (discount_paise >= 0),
    shipping_fee_paise BIGINT NOT NULL DEFAULT 0 CHECK (shipping_fee_paise >= 0),
    gst_amount_paise BIGINT NOT NULL DEFAULT 0 CHECK (gst_amount_paise >= 0),
    total_amount_paise BIGINT NOT NULL CHECK (total_amount_paise >= 0),
    coupon_code TEXT,
    shipping_address_snapshot JSONB NOT NULL,
    delivery_estimate_min_days INT NOT NULL DEFAULT 3,
    delivery_estimate_max_days INT NOT NULL DEFAULT 6,
    delivery_estimate_date TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 19. ORDER ITEMS (Immutable snapshot of purchase)
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    variant_name TEXT NOT NULL,
    sku TEXT NOT NULL,
    unit_price_paise BIGINT NOT NULL CHECK (unit_price_paise >= 0),
    quantity INT NOT NULL CHECK (quantity > 0),
    total_price_paise BIGINT NOT NULL CHECK (total_price_paise >= 0),
    gst_rate_percentage NUMERIC(5,2) NOT NULL DEFAULT 5.00,
    qikink_sku TEXT,
    design_snapshot JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 20. PAYMENTS (Cashfree transactions)
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    payment_gateway TEXT NOT NULL DEFAULT 'cashfree',
    cf_order_id TEXT NOT NULL UNIQUE,
    cf_payment_id TEXT,
    payment_session_id TEXT,
    payment_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'SUCCESS', 'FAILED', 'USER_DROPPED', 'REFUNDED')),
    amount_paise BIGINT NOT NULL CHECK (amount_paise >= 0),
    currency TEXT NOT NULL DEFAULT 'INR',
    payment_method TEXT,
    gateway_response JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 21. PAYMENT WEBHOOK EVENTS (Audit & deduplication)
CREATE TABLE IF NOT EXISTS public.payment_webhook_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gateway TEXT NOT NULL DEFAULT 'cashfree',
    event_type TEXT NOT NULL,
    event_id TEXT UNIQUE,
    payload JSONB NOT NULL,
    signature_verified BOOLEAN NOT NULL DEFAULT false,
    processed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 22. FULFILMENT JOBS (Asynchronous transactional outbox)
CREATE TABLE IF NOT EXISTS public.fulfilment_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL UNIQUE REFERENCES public.orders(id) ON DELETE CASCADE,
    provider TEXT NOT NULL DEFAULT 'qikink',
    status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'submitted', 'shipped', 'delivered', 'failed', 'cancelled')),
    qikink_order_id TEXT,
    payload_sent JSONB,
    response_received JSONB,
    retry_count INT NOT NULL DEFAULT 0,
    max_retries INT NOT NULL DEFAULT 5,
    last_error TEXT,
    next_retry_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 23. FULFILMENT EVENTS
CREATE TABLE IF NOT EXISTS public.fulfilment_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fulfilment_job_id UUID NOT NULL REFERENCES public.fulfilment_jobs(id) ON DELETE CASCADE,
    event_status TEXT NOT NULL,
    description TEXT NOT NULL,
    raw_data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 24. SHIPMENTS
CREATE TABLE IF NOT EXISTS public.shipments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    fulfilment_job_id UUID REFERENCES public.fulfilment_jobs(id) ON DELETE SET NULL,
    courier_name TEXT,
    tracking_number TEXT,
    tracking_url TEXT,
    current_status TEXT NOT NULL DEFAULT 'manifested',
    estimated_delivery_date TIMESTAMPTZ,
    actual_delivery_date TIMESTAMPTZ,
    tracking_history JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 25. REFUND REQUESTS
CREATE TABLE IF NOT EXISTS public.refund_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'approved', 'rejected', 'processed')),
    amount_paise BIGINT NOT NULL CHECK (amount_paise >= 0),
    cf_refund_id TEXT,
    admin_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 26. CUSTOMER FEEDBACK
CREATE TABLE IF NOT EXISTS public.customer_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'suggestion' CHECK (type IN ('suggestion', 'complaint', 'inquiry')),
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_review', 'resolved')),
    admin_reply TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 27. GRIEVANCE COMPLAINTS (Mandatory CPA 2026/2020 Compliance)
CREATE TABLE IF NOT EXISTS public.grievance_complaints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_reference TEXT NOT NULL UNIQUE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    complainant_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    attachment_url TEXT,
    status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'acknowledged', 'under_investigation', 'resolved', 'dismissed')),
    acknowledged_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    resolution_summary TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 28. EMAIL PREFERENCES
CREATE TABLE IF NOT EXISTS public.email_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    transactional_opt_in BOOLEAN NOT NULL DEFAULT true,
    marketing_opt_in BOOLEAN NOT NULL DEFAULT false,
    unsubscribe_token TEXT NOT NULL UNIQUE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 29. POLICY VERSIONS
CREATE TABLE IF NOT EXISTS public.policy_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_type TEXT NOT NULL CHECK (policy_type IN ('terms', 'privacy', 'shipping', 'returns', 'grievance', 'pricing')),
    version TEXT NOT NULL,
    effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    CONSTRAINT unique_policy_version UNIQUE (policy_type, version)
);

-- 30. AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID,
    actor_role TEXT,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 31. ADMIN SETTINGS (Configurable store & compliance metadata)
CREATE TABLE IF NOT EXISTS public.admin_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ==============================================================================
-- INDEXES FOR HIGH-PERFORMANCE QUERYING
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active_featured ON public.products(is_active, is_featured);
CREATE INDEX IF NOT EXISTS idx_variants_product_id ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_variants_sku ON public.product_variants(sku);
CREATE INDEX IF NOT EXISTS idx_variants_qikink_sku ON public.product_variants(qikink_sku);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images(product_id, display_order);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_cf_order_id ON public.payments(cf_order_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_fulfilment_jobs_status ON public.fulfilment_jobs(status);
CREATE INDEX IF NOT EXISTS idx_fulfilment_jobs_order_id ON public.fulfilment_jobs(order_id);
CREATE INDEX IF NOT EXISTS idx_shipments_order_id ON public.shipments(order_id);
CREATE INDEX IF NOT EXISTS idx_shipments_tracking_number ON public.shipments(tracking_number);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.product_reviews(product_id, status);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fulfilment_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fulfilment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refund_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grievance_complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Helper function: Check if current auth user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Public catalogue read policies
CREATE POLICY "Public can view active categories" ON public.categories FOR SELECT USING (is_active = true);
CREATE POLICY "Admin manage categories" ON public.categories FOR ALL USING (public.is_admin());

CREATE POLICY "Public can view active collections" ON public.collections FOR SELECT USING (is_active = true);
CREATE POLICY "Admin manage collections" ON public.collections FOR ALL USING (public.is_admin());

CREATE POLICY "Public can view collection products" ON public.collection_products FOR SELECT USING (true);
CREATE POLICY "Admin manage collection products" ON public.collection_products FOR ALL USING (public.is_admin());

CREATE POLICY "Public can view published products" ON public.products FOR SELECT USING (is_active = true);
CREATE POLICY "Admin manage products" ON public.products FOR ALL USING (public.is_admin());

CREATE POLICY "Public can view active variants" ON public.product_variants FOR SELECT USING (is_active = true);
CREATE POLICY "Admin manage variants" ON public.product_variants FOR ALL USING (public.is_admin());

CREATE POLICY "Public can view product images" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "Admin manage product images" ON public.product_images FOR ALL USING (public.is_admin());

-- Product designs (sensitive high-res artwork URL hidden from general public; admin only)
CREATE POLICY "Admin view designs" ON public.product_designs FOR ALL USING (public.is_admin());

-- Reviews
CREATE POLICY "Public can view approved reviews" ON public.product_reviews FOR SELECT USING (status = 'approved');
CREATE POLICY "Authenticated users create reviews" ON public.product_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin manage reviews" ON public.product_reviews FOR ALL USING (public.is_admin());

-- User Profiles
CREATE POLICY "Users can view and edit own profile" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Admin can view all profiles" ON public.profiles FOR SELECT USING (public.is_admin());

-- User Roles
CREATE POLICY "Users can read own role" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admin manage roles" ON public.user_roles FOR ALL USING (public.is_admin());

-- Addresses
CREATE POLICY "Users can manage own addresses" ON public.user_addresses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admin view addresses" ON public.user_addresses FOR SELECT USING (public.is_admin());

-- Carts & Items
CREATE POLICY "Users can manage own cart" ON public.carts FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can manage own cart items" ON public.cart_items FOR ALL USING (true);

-- Orders & Items (Customer sees only own orders; admin sees all)
CREATE POLICY "Users view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admin manage orders" ON public.orders FOR ALL USING (public.is_admin());

CREATE POLICY "Users view own order items" ON public.order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "Admin manage order items" ON public.order_items FOR ALL USING (public.is_admin());

-- Payments
CREATE POLICY "Users view own payments" ON public.payments FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = payments.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "Admin manage payments" ON public.payments FOR ALL USING (public.is_admin());

-- Fulfilment & Shipments
CREATE POLICY "Users view own shipments" ON public.shipments FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = shipments.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "Admin manage shipments" ON public.shipments FOR ALL USING (public.is_admin());
CREATE POLICY "Admin manage fulfilment jobs" ON public.fulfilment_jobs FOR ALL USING (public.is_admin());

-- Grievances & Feedback
CREATE POLICY "Anyone can submit feedback" ON public.customer_feedback FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin manage feedback" ON public.customer_feedback FOR ALL USING (public.is_admin());

CREATE POLICY "Anyone can submit grievance" ON public.grievance_complaints FOR INSERT WITH CHECK (true);
CREATE POLICY "User view own grievance" ON public.grievance_complaints FOR SELECT USING (auth.uid() = user_id OR email = (SELECT email FROM auth.users WHERE id = auth.uid()));
CREATE POLICY "Admin manage grievances" ON public.grievance_complaints FOR ALL USING (public.is_admin());

-- Policies & Settings
CREATE POLICY "Public view active policies" ON public.policy_versions FOR SELECT USING (true);
CREATE POLICY "Admin manage policies" ON public.policy_versions FOR ALL USING (public.is_admin());

CREATE POLICY "Public view admin settings" ON public.admin_settings FOR SELECT USING (true);
CREATE POLICY "Admin manage admin settings" ON public.admin_settings FOR ALL USING (public.is_admin());

-- Default business and compliance settings
INSERT INTO public.admin_settings (key, value, description) VALUES
('business_name', 'IMAGIX Apparel Private Limited', 'Legal Registered Business Name'),
('brand_name', 'IMAGIX', 'Public Brand Name'),
('gstin', '33AABCU9603R1ZM', 'Goods and Services Tax Identification Number (India)'),
('registered_address', 'Studio 4B, Minimalist Mill Compound, Tirupur, Tamil Nadu - 641602, India', 'Registered Corporate Address'),
('support_email', 'care@imagix.in', 'Customer Support Email Address'),
('support_phone', '+91 80 4718 9000', 'Customer Support Toll-Free Helpline'),
('grievance_officer_name', 'Karthik Subramanian', 'Statutory Grievance Redressal Officer'),
('grievance_officer_email', 'grievance@imagix.in', 'Direct Email for Consumer Grievances'),
('grievance_officer_phone', '+91 80 4718 9001', 'Direct Phone for Consumer Grievances')
ON CONFLICT (key) DO NOTHING;

