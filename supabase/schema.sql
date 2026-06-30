-- Create tables for Printing Shop Invoice Generator

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Shops table
create table if not exists public.shops (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    category text,
    address text,
    mobile text,
    email text,
    website text,
    tin text,
    bin text,
    facebook text,
    footer_text text,
    logo_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Customers table
create table if not exists public.customers (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    address text,
    mobile text,
    email text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Invoices table
create table if not exists public.invoices (
    id uuid default uuid_generate_v4() primary key,
    invoice_number text not null unique,
    date date not null default current_date,
    customer_id uuid references public.customers(id) on delete set null,
    shop_id uuid references public.shops(id) on delete set null,
    subtotal numeric(12, 2) not null default 0,
    discount numeric(12, 2) not null default 0,
    vat numeric(12, 2) not null default 0,
    advance numeric(12, 2) not null default 0,
    paid numeric(12, 2) not null default 0,
    due numeric(12, 2) not null default 0,
    status text not null check (status in ('PAID', 'PARTIAL', 'DUE')),
    notes text,
    amount_in_words text,
    customer_signature text, -- DataURL or name or text representation
    authorized_signature text, -- DataURL or name or text representation
    template_id integer not null default 1 check (template_id between 1 and 6),
    paper_size text not null default 'A4' check (paper_size in ('A4', 'A5', 'HALF_A4')),
    payment_method text default 'Bkash: 01716607988 (send Money)',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Invoice Items table
create table if not exists public.invoice_items (
    id uuid default uuid_generate_v4() primary key,
    invoice_id uuid references public.invoices(id) on delete cascade not null,
    description text not null,
    quantity numeric(10, 2) not null default 1,
    unit_price numeric(10, 2) not null default 0,
    total numeric(12, 2) not null default 0,
    validity text,
    sort_order integer default 0
);

-- Setup Row Level Security (RLS) or public access depending on user environment
alter table public.shops enable row level security;
alter table public.customers enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;

-- Create policies for full public access for now (to simplify setup, or user can restrict later)
create policy "Allow public access to shops" on public.shops for all using (true) with check (true);
create policy "Allow public access to customers" on public.customers for all using (true) with check (true);
create policy "Allow public access to invoices" on public.invoices for all using (true) with check (true);
create policy "Allow public access to invoice_items" on public.invoice_items for all using (true) with check (true);
