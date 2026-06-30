import { createClient as createBrowserSupabase } from "@/utils/supabase/client";

// Interfaces
export interface Shop {
  id: string;
  name: string;
  category?: string;
  address?: string;
  mobile?: string;
  email?: string;
  website?: string;
  tin?: string;
  bin?: string;
  facebook?: string;
  footer_text?: string;
  logo_url?: string;
  created_at?: string;
}

export interface Customer {
  id: string;
  name: string;
  address?: string;
  mobile?: string;
  email?: string;
  created_at?: string;
}

export interface InvoiceItem {
  id?: string;
  invoice_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  sort_order?: number;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  date: string;
  customer_id?: string;
  shop_id?: string;
  subtotal: number;
  discount: number;
  vat: number;
  advance: number;
  paid: number;
  due: number;
  status: "PAID" | "PARTIAL" | "DUE";
  notes?: string;
  amount_in_words?: string;
  customer_signature?: string;
  authorized_signature?: string;
  template_id: number;
  paper_size: "A4" | "A5" | "HALF_A4";
  created_at?: string;
  items?: InvoiceItem[];
  // Expanded fields for easy rendering without manual joins
  customer?: Customer;
  shop?: Shop;
}

// Check if Supabase env variables are validly set
export const isSupabaseConfigured = (): boolean => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  return !!(url && key && !url.includes("your-supabase") && !key.includes("your-anon-key"));
};

// Return browser supabase client safely
const getSupabaseClient = () => {
  if (typeof window !== "undefined" && isSupabaseConfigured()) {
    try {
      return createBrowserSupabase();
    } catch (e) {
      console.warn("Failed to initialize Supabase client:", e);
    }
  }
  return null;
};

// LocalStorage Helper Keys
const KEYS = {
  SHOPS: "invoice_generator_shops",
  CUSTOMERS: "invoice_generator_customers",
  INVOICES: "invoice_generator_invoices",
  ITEMS: "invoice_generator_invoice_items",
};

// Local Storage Fallback Implementation
const localDb = {
  get: <T>(key: string, defaultValue: T[] = []): T[] => {
    if (typeof window === "undefined") return defaultValue;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  },
  set: <T>(key: string, data: T[]): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem(key, JSON.stringify(data));
  },
};

// Initial Seed Data for local testing (so it is not empty)
const SEED_SHOPS: Shop[] = [
  {
    id: "shop-bd-printing",
    name: "BD Printing Zone",
    category: "Offset & Digital Printing",
    address: "12, Kataban Road, Dhaka-1205",
    mobile: "+8801711223344",
    email: "info@bdprinting.com",
    website: "www.bdprinting.com",
    tin: "123456789012",
    bin: "987654321098",
    facebook: "fb.com/bdprintingzone",
    footer_text: "Thank you for printing with us! Quality is our commitment.",
  },
  {
    id: "shop-ullas",
    name: "Ullas Advertising",
    category: "Signboard, Banner & Print Shop",
    address: "24/B, Nilkhet, Babupura, Dhaka",
    mobile: "+8801822334455",
    email: "ullas.adv@gmail.com",
    facebook: "fb.com/ullasadvertising",
    footer_text: "No claims will be accepted after delivery. Thank you.",
  }
];

const SEED_CUSTOMERS: Customer[] = [
  {
    id: "cust-1",
    name: "Abir Hasan",
    address: "Dhanmondi, Dhaka",
    mobile: "+8801911998877",
    email: "abir@gmail.com",
  },
  {
    id: "cust-2",
    name: "Liza Akter",
    address: "Mirpur-10, Dhaka",
    mobile: "+8801555443322",
  }
];

// Helper to seed localStorage if empty
const seedLocalDbIfEmpty = () => {
  if (typeof window === "undefined") return;
  if (!localStorage.getItem(KEYS.SHOPS)) {
    localDb.set(KEYS.SHOPS, SEED_SHOPS);
  }
  if (!localStorage.getItem(KEYS.CUSTOMERS)) {
    localDb.set(KEYS.CUSTOMERS, SEED_CUSTOMERS);
  }
};

// Database Service Layer
export const db = {
  // SHOPS
  shops: {
    list: async (): Promise<Shop[]> => {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase.from("shops").select("*").order("name");
        if (!error && data) return data as Shop[];
        console.warn("Supabase fetch failed, falling back to LocalStorage:", error?.message || error);
      }
      seedLocalDbIfEmpty();
      return localDb.get<Shop>(KEYS.SHOPS);
    },
    get: async (id: string): Promise<Shop | null> => {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase.from("shops").select("*").eq("id", id).single();
        if (!error && data) return data as Shop;
      }
      seedLocalDbIfEmpty();
      const shops = localDb.get<Shop>(KEYS.SHOPS);
      return shops.find((s) => s.id === id) || null;
    },
    create: async (shop: Omit<Shop, "id" | "created_at">): Promise<Shop> => {
      const id = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9);
      const newShop: Shop = { ...shop, id, created_at: new Date().toISOString() };
      
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase.from("shops").insert([shop]).select().single();
        if (!error && data) return data as Shop;
        console.warn("Supabase insert failed, falling back to LocalStorage:", error?.message || error);
      }
      seedLocalDbIfEmpty();
      const shops = localDb.get<Shop>(KEYS.SHOPS);
      shops.push(newShop);
      localDb.set(KEYS.SHOPS, shops);
      return newShop;
    },
    update: async (id: string, shop: Partial<Shop>): Promise<Shop | null> => {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase.from("shops").update(shop).eq("id", id).select().single();
        if (!error && data) return data as Shop;
      }
      seedLocalDbIfEmpty();
      const shops = localDb.get<Shop>(KEYS.SHOPS);
      const index = shops.findIndex((s) => s.id === id);
      if (index === -1) return null;
      const updatedShop = { ...shops[index], ...shop };
      shops[index] = updatedShop;
      localDb.set(KEYS.SHOPS, shops);
      return updatedShop;
    },
    delete: async (id: string): Promise<boolean> => {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { error } = await supabase.from("shops").delete().eq("id", id);
        if (!error) return true;
      }
      seedLocalDbIfEmpty();
      const shops = localDb.get<Shop>(KEYS.SHOPS);
      const filtered = shops.filter((s) => s.id !== id);
      localDb.set(KEYS.SHOPS, filtered);
      return true;
    },
  },

  // CUSTOMERS
  customers: {
    list: async (): Promise<Customer[]> => {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase.from("customers").select("*").order("name");
        if (!error && data) return data as Customer[];
      }
      seedLocalDbIfEmpty();
      return localDb.get<Customer>(KEYS.CUSTOMERS);
    },
    get: async (id: string): Promise<Customer | null> => {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase.from("customers").select("*").eq("id", id).single();
        if (!error && data) return data as Customer;
      }
      seedLocalDbIfEmpty();
      const customers = localDb.get<Customer>(KEYS.CUSTOMERS);
      return customers.find((c) => c.id === id) || null;
    },
    create: async (customer: Omit<Customer, "id" | "created_at">): Promise<Customer> => {
      const id = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9);
      const newCustomer: Customer = { ...customer, id, created_at: new Date().toISOString() };

      const supabase = getSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase.from("customers").insert([customer]).select().single();
        if (!error && data) return data as Customer;
      }
      seedLocalDbIfEmpty();
      const customers = localDb.get<Customer>(KEYS.CUSTOMERS);
      customers.push(newCustomer);
      localDb.set(KEYS.CUSTOMERS, customers);
      return newCustomer;
    },
    update: async (id: string, customer: Partial<Customer>): Promise<Customer | null> => {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase.from("customers").update(customer).eq("id", id).select().single();
        if (!error && data) return data as Customer;
      }
      seedLocalDbIfEmpty();
      const customers = localDb.get<Customer>(KEYS.CUSTOMERS);
      const index = customers.findIndex((c) => c.id === id);
      if (index === -1) return null;
      const updated = { ...customers[index], ...customer };
      customers[index] = updated;
      localDb.set(KEYS.CUSTOMERS, customers);
      return updated;
    },
    delete: async (id: string): Promise<boolean> => {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { error } = await supabase.from("customers").delete().eq("id", id);
        if (!error) return true;
      }
      seedLocalDbIfEmpty();
      const customers = localDb.get<Customer>(KEYS.CUSTOMERS);
      const filtered = customers.filter((c) => c.id !== id);
      localDb.set(KEYS.CUSTOMERS, filtered);
      return true;
    },
  },

  // INVOICES
  invoices: {
    list: async (): Promise<Invoice[]> => {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase
          .from("invoices")
          .select("*, customers(*), shops(*), invoice_items(*)")
          .order("date", { ascending: false });
        if (!error && data) {
          return data.map((inv: any) => ({
            ...inv,
            customer: inv.customers,
            shop: inv.shops,
            items: inv.invoice_items,
          })) as Invoice[];
        }
      }
      
      const invoices = localDb.get<Invoice>(KEYS.INVOICES);
      const items = localDb.get<InvoiceItem>(KEYS.ITEMS);
      const shops = localDb.get<Shop>(KEYS.SHOPS);
      const customers = localDb.get<Customer>(KEYS.CUSTOMERS);

      return invoices.map((inv) => {
        const invItems = items.filter((it) => it.invoice_id === inv.id);
        const shop = shops.find((s) => s.id === inv.shop_id);
        const customer = customers.find((c) => c.id === inv.customer_id);
        return {
          ...inv,
          items: invItems,
          shop,
          customer,
        };
      }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },
    get: async (id: string): Promise<Invoice | null> => {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase
          .from("invoices")
          .select("*, customers(*), shops(*), invoice_items(*)")
          .eq("id", id)
          .single();
        if (!error && data) {
          return {
            ...data,
            customer: data.customers,
            shop: data.shops,
            items: data.invoice_items,
          } as Invoice;
        }
      }

      const invoices = localDb.get<Invoice>(KEYS.INVOICES);
      const invoice = invoices.find((i) => i.id === id);
      if (!invoice) return null;

      const items = localDb.get<InvoiceItem>(KEYS.ITEMS).filter((it) => it.invoice_id === id);
      const shop = localDb.get<Shop>(KEYS.SHOPS).find((s) => s.id === invoice.shop_id);
      const customer = localDb.get<Customer>(KEYS.CUSTOMERS).find((c) => c.id === invoice.customer_id);

      return {
        ...invoice,
        items,
        shop,
        customer,
      };
    },
    create: async (
      invoice: Omit<Invoice, "id" | "invoice_number" | "created_at" | "items" | "customer" | "shop"> & { invoice_number?: string },
      items: Omit<InvoiceItem, "id" | "invoice_id">[]
    ): Promise<Invoice> => {
      const id = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9);
      const invoiceNumber = invoice.invoice_number?.trim() || (await db.invoices.getNextInvoiceNumber());
      const createdAt = new Date().toISOString();

      const newInvoice: Invoice = {
        ...invoice,
        id,
        invoice_number: invoiceNumber,
        created_at: createdAt,
      };

      const newItems: InvoiceItem[] = items.map((item, index) => ({
        ...item,
        id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9) + index,
        invoice_id: id,
        sort_order: index,
      }));

      const supabase = getSupabaseClient();
      if (supabase) {
        // Insert invoice
        const { error: invError } = await supabase.from("invoices").insert([
          {
            id,
            invoice_number: invoiceNumber,
            date: invoice.date,
            customer_id: invoice.customer_id,
            shop_id: invoice.shop_id,
            subtotal: invoice.subtotal,
            discount: invoice.discount,
            vat: invoice.vat,
            advance: invoice.advance,
            paid: invoice.paid,
            due: invoice.due,
            status: invoice.status,
            notes: invoice.notes,
            amount_in_words: invoice.amount_in_words,
            customer_signature: invoice.customer_signature,
            authorized_signature: invoice.authorized_signature,
            template_id: invoice.template_id,
            paper_size: invoice.paper_size,
          },
        ]);

        if (!invError) {
          // Insert items
          const { error: itemsError } = await supabase.from("invoice_items").insert(
            newItems.map((it) => ({
              invoice_id: it.invoice_id,
              description: it.description,
              quantity: it.quantity,
              unit_price: it.unit_price,
              total: it.total,
              sort_order: it.sort_order,
            }))
          );
          if (!itemsError) {
            // Retrieve created invoice fully populated
            const fullInvoice = await db.invoices.get(id);
            if (fullInvoice) return fullInvoice;
          } else {
            console.error("Supabase items insert failed:", itemsError?.message || JSON.stringify(itemsError));
          }
        } else {
          console.error("Supabase invoice insert failed:", invError?.message || JSON.stringify(invError));
        }
      }

      // LocalStorage Fallback
      seedLocalDbIfEmpty();
      const invoices = localDb.get<Invoice>(KEYS.INVOICES);
      invoices.push(newInvoice);
      localDb.set(KEYS.INVOICES, invoices);

      const localItems = localDb.get<InvoiceItem>(KEYS.ITEMS);
      localItems.push(...newItems);
      localDb.set(KEYS.ITEMS, localItems);

      const shops = localDb.get<Shop>(KEYS.SHOPS);
      const customers = localDb.get<Customer>(KEYS.CUSTOMERS);

      return {
        ...newInvoice,
        items: newItems,
        shop: shops.find((s) => s.id === invoice.shop_id),
        customer: customers.find((c) => c.id === invoice.customer_id),
      };
    },
    update: async (
      id: string,
      invoice: Partial<Invoice>,
      items?: Omit<InvoiceItem, "id" | "invoice_id">[]
    ): Promise<Invoice | null> => {
      const supabase = getSupabaseClient();
      if (supabase) {
        // Update main invoice table
        const { error: invError } = await supabase
          .from("invoices")
          .update({
            invoice_number: invoice.invoice_number,
            date: invoice.date,
            customer_id: invoice.customer_id,
            shop_id: invoice.shop_id,
            subtotal: invoice.subtotal,
            discount: invoice.discount,
            vat: invoice.vat,
            advance: invoice.advance,
            paid: invoice.paid,
            due: invoice.due,
            status: invoice.status,
            notes: invoice.notes,
            amount_in_words: invoice.amount_in_words,
            customer_signature: invoice.customer_signature,
            authorized_signature: invoice.authorized_signature,
            template_id: invoice.template_id,
            paper_size: invoice.paper_size,
          })
          .eq("id", id);

        if (!invError && items) {
          // Delete old items
          await supabase.from("invoice_items").delete().eq("invoice_id", id);
          
          // Re-insert new items
          const { error: itemsError } = await supabase.from("invoice_items").insert(
            items.map((it, idx) => ({
              invoice_id: id,
              description: it.description,
              quantity: it.quantity,
              unit_price: it.unit_price,
              total: it.total,
              sort_order: idx,
            }))
          );
          if (itemsError) {
            console.error("Supabase re-insert items failed:", itemsError?.message || JSON.stringify(itemsError));
          }
        }

        if (!invError) {
          return await db.invoices.get(id);
        }
      }

      // LocalStorage Fallback
      seedLocalDbIfEmpty();
      const invoices = localDb.get<Invoice>(KEYS.INVOICES);
      const index = invoices.findIndex((i) => i.id === id);
      if (index === -1) return null;

      const oldInv = invoices[index];
      const updatedInv = { ...oldInv, ...invoice };
      invoices[index] = updatedInv;
      localDb.set(KEYS.INVOICES, invoices);

      if (items) {
        // Remove old items
        const allItems = localDb.get<InvoiceItem>(KEYS.ITEMS);
        const filteredItems = allItems.filter((it) => it.invoice_id !== id);
        
        // Add new items
        const newItems: InvoiceItem[] = items.map((item, idx) => ({
          ...item,
          id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9) + idx,
          invoice_id: id,
          sort_order: idx,
        }));
        filteredItems.push(...newItems);
        localDb.set(KEYS.ITEMS, filteredItems);
      }

      return await db.invoices.get(id);
    },
    delete: async (id: string): Promise<boolean> => {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { error } = await supabase.from("invoices").delete().eq("id", id);
        if (!error) return true;
      }
      seedLocalDbIfEmpty();
      
      const invoices = localDb.get<Invoice>(KEYS.INVOICES).filter((i) => i.id !== id);
      localDb.set(KEYS.INVOICES, invoices);

      const items = localDb.get<InvoiceItem>(KEYS.ITEMS).filter((it) => it.invoice_id !== id);
      localDb.set(KEYS.ITEMS, items);

      return true;
    },
    getNextInvoiceNumber: async (): Promise<string> => {
      const currentYear = new Date().getFullYear();
      const prefix = `INV-${currentYear}-`;
      
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase
          .from("invoices")
          .select("invoice_number")
          .like("invoice_number", `${prefix}%`)
          .order("invoice_number", { ascending: false })
          .limit(1);

        if (!error && data && data.length > 0) {
          const lastNumStr = data[0].invoice_number.replace(prefix, "");
          const nextVal = parseInt(lastNumStr, 10) + 1;
          return `${prefix}${String(nextVal).padStart(5, "0")}`;
        }
      }

      // LocalStorage Fallback
      seedLocalDbIfEmpty();
      const invoices = localDb.get<Invoice>(KEYS.INVOICES);
      const matching = invoices
        .filter((inv) => inv.invoice_number?.startsWith(prefix))
        .map((inv) => parseInt(inv.invoice_number.replace(prefix, ""), 10))
        .sort((a, b) => b - a);

      const nextVal = matching.length > 0 ? matching[0] + 1 : 1;
      return `${prefix}${String(nextVal).padStart(5, "0")}`;
    },
  },

  // DATABASE ADMIN / BACKUP RESTORE
  admin: {
    backup: async (): Promise<string> => {
      seedLocalDbIfEmpty();
      const backupObj = {
        shops: localDb.get<Shop>(KEYS.SHOPS),
        customers: localDb.get<Customer>(KEYS.CUSTOMERS),
        invoices: localDb.get<Invoice>(KEYS.INVOICES),
        items: localDb.get<InvoiceItem>(KEYS.ITEMS),
        exported_at: new Date().toISOString(),
        version: "1.0",
      };
      return JSON.stringify(backupObj, null, 2);
    },
    restore: async (jsonString: string): Promise<boolean> => {
      try {
        const data = JSON.parse(jsonString);
        if (data.shops && Array.isArray(data.shops)) {
          localDb.set(KEYS.SHOPS, data.shops);
        }
        if (data.customers && Array.isArray(data.customers)) {
          localDb.set(KEYS.CUSTOMERS, data.customers);
        }
        if (data.invoices && Array.isArray(data.invoices)) {
          localDb.set(KEYS.INVOICES, data.invoices);
        }
        if (data.items && Array.isArray(data.items)) {
          localDb.set(KEYS.ITEMS, data.items);
        }
        return true;
      } catch (e) {
        console.error("Restoring database backup failed:", e);
        return false;
      }
    },
  },
};
