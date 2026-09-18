"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "./lib/supabase";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Truck,
  Users,
  Wallet,
  BarChart3,
  Settings,
  Plus,
  Search,
  Bell,
  Menu,
  X,
  RefreshCw,
} from "lucide-react";

type Product = {
  id: string;
  name: string;
  sku: string | null;
  category: string | null;
  unit: string | null;
  stock: number;
  minimum_stock: number;
  purchase_price: number;
  sell_price: number;
  active: boolean;
};

const money = (n: number) =>
  `৳${Number(n || 0).toLocaleString("en-BD", {
    maximumFractionDigits: 2,
  })}`;

export default function Home() {
  const [page, setPage] = useState("Dashboard");
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadProducts() {
    if (!supabase) return;

    setLoading(true);

    const { data, error } = await supabase
      .from("products")
      .select(
        "id,name,sku,category,unit,stock,minimum_stock,buy_price,sell_price,active"
      )
      .order("created_at", { ascending: false });

    if (!error) {
      setProducts(
        (data || []).map((p: any) => ({
          ...p,
          purchase_price: p.buy_price,
        }))
      );
    }

    setLoading(false);
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();

    return products.filter((p) =>
      [p.name, p.sku, p.category]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [products, search]);

  const totalStock = products.reduce(
    (a, p) => a + Number(p.stock || 0),
    0
  );

  const stockValue = products.reduce(
    (a, p) =>
      a +
      Number(p.stock || 0) * Number(p.purchase_price || 0),
    0
  );

  const lowStock = products.filter(
    (p) => Number(p.stock) <= Number(p.minimum_stock)
  ).length;

  const nav = [
    ["Dashboard", LayoutDashboard],
    ["Sales", ShoppingCart],
    ["Inventory", Package],
    ["Purchases", Truck],
    ["Customers", Users],
    ["Accounts", Wallet],
    ["Reports", BarChart3],
    ["Settings", Settings],
  ] as const;

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="logo">R</div>
          RYZORA Inventory
        </div>

        <div className="top-actions">
          <button className="iconbtn">
            <Bell size={18} />
          </button>

          <button className="iconbtn">
            <Menu size={18} />
          </button>
        </div>
      </header>

      <div className="layout">
        <aside className="sidebar">
          {nav.map(([name, Icon]) => (
            <button
              key={name}
              className={`navbtn ${
                page === name ? "active" : ""
              }`}
              onClick={() => setPage(name)}
            >
              <Icon size={18} />
              {name}
            </button>
          ))}
        </aside>

        <main className="main">
          {page === "Dashboard" && (
            <Dashboard
              totalStock={totalStock}
              stockValue={stockValue}
              low={lowStock}
              products={products}
              money={money}
            />
          )}

          {page === "Inventory" && (
            <Inventory
              products={filtered}
              search={search}
              setSearch={setSearch}
              reload={loadProducts}
              loading={loading}
              money={money}
            />
          )}

          {page !== "Dashboard" &&
            page !== "Inventory" && (
              <Generic page={page} />
            )}
        </main>
      </div>

      <nav className="bottomnav">
        {nav.slice(0, 5).map(([name, Icon]) => (
          <button
            key={name}
            className={page === name ? "active" : ""}
            onClick={() => setPage(name)}
          >
            <Icon size={19} />
            <div>{name}</div>
          </button>
        ))}
      </nav>
    </div>
  );
}

/* =========================
   DASHBOARD
========================= */

function Dashboard({
  totalStock,
  stockValue,
  low,
  products,
  money,
}: {
  totalStock: number;
  stockValue: number;
  low: number;
  products: Product[];
  money: (n: number) => string;
}) {
  return (
    <>
      <div className="pagehead">
        <div>
          <h1>Dashboard</h1>
          <div className="muted">
            Business overview at a glance
          </div>
        </div>

        <button className="btn accent">
          <Plus size={16} />
          Quick Sale
        </button>
      </div>

      <div className="grid">
        <div className="card">
          <div className="muted">Today&apos;s Sales</div>
          <div className="metric gold">
            {money(25500)}
          </div>
        </div>

        <div className="card">
          <div className="muted">Today&apos;s Purchase</div>
          <div className="metric">
            {money(12800)}
          </div>
        </div>

        <div className="card">
          <div className="muted">Income</div>
          <div className="metric green">
            {money(8500)}
          </div>
        </div>

        <div className="card">
          <div className="muted">Net Profit</div>
          <div className="metric green">
            {money(4300)}
          </div>
        </div>
      </div>

      <div className="grid section">
        <div className="card">
          <div className="muted">Total Products</div>
          <div className="metric">
            {products.length}
          </div>
        </div>

        <div className="card">
          <div className="muted">Total Stock</div>
          <div className="metric">
            {totalStock}
          </div>
        </div>

        <div className="card">
          <div className="muted">Stock Value</div>
          <div className="metric">
            {money(stockValue)}
          </div>
        </div>

        <div className="card">
          <div className="muted">Low Stock</div>
          <div className="metric red">
            {low}
          </div>
        </div>
      </div>

      <div className="card section">
        <h3>Inventory Snapshot</h3>

        <div className="tablewrap">
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Stock</th>
                <th>Sell Price</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {products.slice(0, 8).map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.sku || "-"}</td>
                  <td>
                    {p.stock} {p.unit || ""}
                  </td>
                  <td>{money(p.sell_price)}</td>
                  <td
                    className={
                      p.stock <= p.minimum_stock
                        ? "red"
                        : "green"
                    }
                  >
                    {p.stock <= p.minimum_stock
                      ? "Low"
                      : "Healthy"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!products.length && (
            <div className="empty">
              No products yet. Add your first product
              from Inventory.
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* =========================
   INVENTORY
========================= */

function Inventory({
  products,
  search,
  setSearch,
  reload,
  loading,
  money,
}: {
  products: Product[];
  search: string;
  setSearch: (v: string) => void;
  reload: () => void;
  loading: boolean;
  money: (n: number) => string;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    sku: "",
    category: "",
    unit: "pcs",
    buy_price: "",
    sell_price: "",
    stock: "0",
    minimum_stock: "0",
  });

  function reset() {
    setForm({
      name: "",
      sku: "",
      category: "",
      unit: "pcs",
      buy_price: "",
      sell_price: "",
      stock: "0",
      minimum_stock: "0",
    });

    setError("");
  }

  async function addProduct() {
    if (!form.name.trim()) {
      setError("Product name is required.");
      return;
    }

    if (!supabase) {
      setError("Supabase is not configured.");
      return;
    }

    setSaving(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError(
        "Please login first. Product data is protected by Supabase RLS."
      );
      setSaving(false);
      return;
    }

    const stock = Number(form.stock) || 0;

    const { data, error: insertError } =
      await supabase
        .from("products")
        .insert({
          user_id: user.id,
          name: form.name.trim(),
          sku: form.sku.trim() || null,
          category: form.category.trim() || null,
          unit: form.unit.trim() || "pcs",
          buy_price: Number(form.buy_price) || 0,
          sell_price: Number(form.sell_price) || 0,
          stock,
          minimum_stock:
            Number(form.minimum_stock) || 0,
          active: true,
        })
        .select("id")
        .single();

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    if (stock > 0 && data?.id) {
      const { error: movementError } =
        await supabase
          .from("inventory_stock_movements")
          .insert({
            user_id: user.id,
            product_id: data.id,
            movement_type: "opening",
            quantity: stock,
            reference: "OPENING",
            note: "Opening stock",
          });

      if (movementError) {
        setError(
          `Product saved, but stock movement failed: ${movementError.message}`
        );
      }
    }

    setSaving(false);

    if (!error) {
      setOpen(false);
      reset();
      reload();
    }
  }

  return (
    <>
      <div className="pagehead">
        <div>
          <h1>Inventory</h1>
          <div className="muted">
            Products, stock and pricing
          </div>
        </div>

        <button
          className="btn primary"
          onClick={() => {
            reset();
            setOpen(true);
          }}
        >
          <Plus size={16} />
          Add Product
        </button>
      </div>

      <div className="toolbar">
        <div className="searchbox">
          <Search size={17} />

          <input
            className="search"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search product, SKU or category..."
          />
        </div>

        <button
          className="btn secondary"
          onClick={reload}
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      <div className="grid">
        <div className="card">
          <div className="muted">Products</div>
          <div className="metric">
            {products.length}
          </div>
        </div>

        <div className="card">
          <div className="muted">Low Stock</div>
          <div className="metric red">
            {
              products.filter(
                (p) =>
                  p.stock <= p.minimum_stock
              ).length
            }
          </div>
        </div>
      </div>

      <div className="card section">
        <div className="tablewrap">
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Purchase</th>
                <th>Sell</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>
                    <b>{p.name}</b>
                  </td>

                  <td>{p.sku || "-"}</td>

                  <td>
                    {p.category || "-"}
                  </td>

                  <td>
                    {p.stock} {p.unit || ""}
                  </td>

                  <td>
                    {money(p.purchase_price)}
                  </td>

                  <td>
                    {money(p.sell_price)}
                  </td>

                  <td
                    className={
                      p.stock <= p.minimum_stock
                        ? "red"
                        : "green"
                    }
                  >
                    {p.stock <= p.minimum_stock
                      ? "Low"
                      : "OK"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {loading && (
            <div className="empty">
              Loading products...
            </div>
          )}

          {!loading && !products.length && (
            <div className="empty">
              No products found.
            </div>
          )}
        </div>
      </div>

      {/* ADD PRODUCT MODAL */}

      {open && (
        <div className="modalbackdrop">
          <div className="modal">
            <div className="modalhead">
              <div>
                <h2>Add Product</h2>

                <div className="muted">
                  Create product and opening stock
                </div>
              </div>

              <button
                className="iconbtn"
                onClick={() =>
                  setOpen(false)
                }
              >
                <X size={19} />
              </button>
            </div>

            <div className="formgrid">
              <label>
                Product Name

                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                  placeholder="Air Buds 2nd Gen"
                />
              </label>

              <label>
                SKU

                <input
                  value={form.sku}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      sku: e.target.value,
                    })
                  }
                  placeholder="RYZ-001"
                />
              </label>

              <label>
                Category

                <input
                  value={form.category}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      category:
                        e.target.value,
                    })
                  }
                  placeholder="Electronics"
                />
              </label>

              <label>
                Unit

                <input
                  value={form.unit}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      unit: e.target.value,
                    })
                  }
                  placeholder="pcs"
                />
              </label>

              <label>
                Purchase Price

                <input
                  type="number"
                  min="0"
                  value={form.buy_price}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      buy_price:
                        e.target.value,
                    })
                  }
                  placeholder="0"
                />
              </label>

              <label>
                Sell Price

                <input
                  type="number"
                  min="0"
                  value={form.sell_price}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      sell_price:
                        e.target.value,
                    })
                  }
                  placeholder="0"
                />
              </label>

              <label>
                Opening Stock

                <input
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      stock: e.target.value,
                    })
                  }
                  placeholder="0"
                />
              </label>

              <label>
                Minimum Stock

                <input
                  type="number"
                  min="0"
                  value={
                    form.minimum_stock
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      minimum_stock:
                        e.target.value,
                    })
                  }
                  placeholder="0"
                />
              </label>
            </div>

            {error && (
              <div className="errorbox">
                {error}
              </div>
            )}

            <div className="modalactions">
              <button
                className="btn secondary"
                onClick={() =>
                  setOpen(false)
                }
              >
                Cancel
              </button>

              <button
                className="btn primary"
                disabled={saving}
                onClick={addProduct}
              >
                {saving
                  ? "Saving..."
                  : "Save Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* =========================
   OTHER MODULES
========================= */

function Generic({ page }: { page: string }) {
  const icons: any = {
    Sales: ShoppingCart,
    Purchases: Truck,
    Customers: Users,
    Accounts: Wallet,
    Reports: BarChart3,
    Settings: Settings,
  };

  const Icon = icons[page] || Package;

  return (
    <div className="pagehead">
      <div>
        <div className="moduleicon">
          <Icon size={28} />
        </div>

        <h1>{page}</h1>

        <div className="muted">
          RYZORA {page} module
        </div>
      </div>

      <button className="btn primary">
        <Plus size={16} />
        Add New
      </button>
    </div>
  );
}
