-- SolarGrid Production PostgreSQL Database Schema

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL,
    phone VARCHAR(64),
    avatar_url VARCHAR(512),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    business_name VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(64) NOT NULL,
    gst_number VARCHAR(64),
    customer_type VARCHAR(32) DEFAULT 'RETAIL',
    status VARCHAR(32) DEFAULT 'ACTIVE',
    follow_up_date VARCHAR(64),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS addresses (
    id VARCHAR(64) PRIMARY KEY,
    customer_id VARCHAR(64) REFERENCES customers(id) ON DELETE CASCADE,
    address_label VARCHAR(128) NOT NULL,
    address_line TEXT NOT NULL,
    area VARCHAR(128),
    city VARCHAR(128) NOT NULL,
    state VARCHAR(128) NOT NULL,
    pincode VARCHAR(32) NOT NULL,
    landmark VARCHAR(255),
    contact_person VARCHAR(128),
    contact_phone VARCHAR(64),
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(64) PRIMARY KEY,
    sku VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category_id VARCHAR(64),
    category_name VARCHAR(128),
    unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    current_stock INT NOT NULL DEFAULT 0,
    min_stock_alert INT NOT NULL DEFAULT 5,
    location VARCHAR(128) DEFAULT 'Main Warehouse',
    installation_eligible BOOLEAN DEFAULT TRUE,
    warranty_months INT DEFAULT 12,
    description TEXT,
    specifications JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stock_movements (
    id VARCHAR(64) PRIMARY KEY,
    product_id VARCHAR(64) REFERENCES products(id) ON DELETE CASCADE,
    product_name VARCHAR(255),
    product_sku VARCHAR(64),
    quantity INT NOT NULL,
    movement_type VARCHAR(16) NOT NULL,
    reason TEXT NOT NULL,
    reference_type VARCHAR(64),
    reference_id VARCHAR(64),
    created_by VARCHAR(64),
    created_by_name VARCHAR(128),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(64) PRIMARY KEY,
    order_number VARCHAR(64) UNIQUE NOT NULL,
    customer_id VARCHAR(64) REFERENCES customers(id) ON DELETE RESTRICT,
    customer_name VARCHAR(255),
    address_id VARCHAR(64),
    address_text TEXT,
    installation_type VARCHAR(64) DEFAULT 'NO_INSTALLATION',
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(32) DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
    id VARCHAR(64) PRIMARY KEY,
    order_id VARCHAR(64) REFERENCES orders(id) ON DELETE CASCADE,
    product_id VARCHAR(64) REFERENCES products(id) ON DELETE RESTRICT,
    product_name VARCHAR(255) NOT NULL,
    sku VARCHAR(64) NOT NULL,
    unit_price NUMERIC(12, 2) NOT NULL,
    quantity INT NOT NULL,
    installation_eligible BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS challans (
    id VARCHAR(64) PRIMARY KEY,
    challan_number VARCHAR(64) UNIQUE NOT NULL,
    order_id VARCHAR(64) REFERENCES orders(id) ON DELETE SET NULL,
    customer_id VARCHAR(64) REFERENCES customers(id) ON DELETE RESTRICT,
    customer_name VARCHAR(255),
    status VARCHAR(32) DEFAULT 'DRAFT',
    total_quantity INT NOT NULL DEFAULT 0,
    created_by VARCHAR(64),
    created_by_name VARCHAR(128),
    confirmed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS challan_items (
    id VARCHAR(64) PRIMARY KEY,
    challan_id VARCHAR(64) REFERENCES challans(id) ON DELETE CASCADE,
    product_id VARCHAR(64) REFERENCES products(id) ON DELETE RESTRICT,
    product_name VARCHAR(255) NOT NULL,
    sku VARCHAR(64) NOT NULL,
    unit_price NUMERIC(12, 2) NOT NULL,
    quantity INT NOT NULL
);

CREATE TABLE IF NOT EXISTS installation_jobs (
    id VARCHAR(64) PRIMARY KEY,
    job_number VARCHAR(64) UNIQUE NOT NULL,
    order_id VARCHAR(64) REFERENCES orders(id) ON DELETE CASCADE,
    customer_id VARCHAR(64) REFERENCES customers(id) ON DELETE RESTRICT,
    customer_name VARCHAR(255),
    customer_phone VARCHAR(64),
    address_id VARCHAR(64),
    address_text TEXT,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    scheduled_date VARCHAR(64) NOT NULL,
    time_slot VARCHAR(64) NOT NULL,
    required_crew_size INT DEFAULT 2,
    status VARCHAR(32) DEFAULT 'SCHEDULED',
    checklist_state JSONB DEFAULT '{"panels": false, "inverter": false, "wiring": false, "safety": false}'::jsonb,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS warranties (
    id VARCHAR(64) PRIMARY KEY,
    customer_id VARCHAR(64) REFERENCES customers(id) ON DELETE CASCADE,
    order_id VARCHAR(64) REFERENCES orders(id) ON DELETE SET NULL,
    product_id VARCHAR(64) REFERENCES products(id) ON DELETE RESTRICT,
    product_name VARCHAR(255) NOT NULL,
    serial_number VARCHAR(128) UNIQUE NOT NULL,
    start_date VARCHAR(64) NOT NULL,
    end_date VARCHAR(64) NOT NULL,
    status VARCHAR(32) DEFAULT 'ACTIVE'
);

CREATE TABLE IF NOT EXISTS service_requests (
    id VARCHAR(64) PRIMARY KEY,
    service_number VARCHAR(64) UNIQUE NOT NULL,
    customer_id VARCHAR(64) REFERENCES customers(id) ON DELETE CASCADE,
    customer_name VARCHAR(255),
    customer_phone VARCHAR(64),
    address_id VARCHAR(64),
    address_text TEXT,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    product_id VARCHAR(64),
    product_name VARCHAR(255),
    problem_category VARCHAR(128) NOT NULL,
    description TEXT NOT NULL,
    warranty_status VARCHAR(32) DEFAULT 'ACTIVE',
    scheduled_date VARCHAR(64),
    time_slot VARCHAR(64),
    status VARCHAR(32) DEFAULT 'OPEN',
    resolution_notes TEXT,
    total_cost NUMERIC(12, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS crm_follow_ups (
    id VARCHAR(64) PRIMARY KEY,
    customer_id VARCHAR(64) REFERENCES customers(id) ON DELETE CASCADE,
    customer_name VARCHAR(255),
    created_by VARCHAR(64),
    created_by_name VARCHAR(128),
    follow_up_date VARCHAR(64) NOT NULL,
    notes TEXT NOT NULL,
    status VARCHAR(32) DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64),
    user_name VARCHAR(128),
    action VARCHAR(128) NOT NULL,
    entity VARCHAR(128) NOT NULL,
    entity_id VARCHAR(64),
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indexes for Fast Queries and Foreign Key Joins
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_addresses_customer_id ON addresses(customer_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product_id ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_challans_order_id ON challans(order_id);
CREATE INDEX IF NOT EXISTS idx_challans_customer_id ON challans(customer_id);
CREATE INDEX IF NOT EXISTS idx_challan_items_challan_id ON challan_items(challan_id);
CREATE INDEX IF NOT EXISTS idx_installation_jobs_order_id ON installation_jobs(order_id);
CREATE INDEX IF NOT EXISTS idx_installation_jobs_customer_id ON installation_jobs(customer_id);
CREATE INDEX IF NOT EXISTS idx_warranties_customer_id ON warranties(customer_id);
CREATE INDEX IF NOT EXISTS idx_warranties_order_id ON warranties(order_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_customer_id ON service_requests(customer_id);
CREATE INDEX IF NOT EXISTS idx_crm_follow_ups_customer_id ON crm_follow_ups(customer_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);

