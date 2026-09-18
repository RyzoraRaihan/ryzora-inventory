"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
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
  LogOut,
  X,
} from "lucide-react";

type Product = {
  id: string;
  name: string;
  sku: string | null;
  category: string | null;
  unit: string | null;
  stock: number;
  minimum_stock: number;
  buy_price: number;
  sell_price: number;
  active: boolean;
};

const money = (value: number) =>
  `৳${Number(value || 0).toLocaleString("en-BD", {
    maximumFractionDigits: 2,
  })}`;

export default function Home() {
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [page, setPage] = useState("Dashboard");
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [authBusy, setAuthBusy] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadProducts() {
    if (!supabase || !session?.user?.id) {
      setProducts([]);
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("products")
      .select(
        "id,name,sku,category,unit,stock,minimum_stock,buy_price,sell_price,active"
      )
      .order("created_at", { ascending: false });

    if (!error) {
      setProducts((data || []) as Product[]);
    }

    setLoading(false);
  }

  useEffect(() => {
    if (session) {
      loadProducts();
    } else {
      setProducts([]);
    }
  }, [session]);

  async function handleAuth() {
    if (!supabase) {
      setAuthError("Supabase is not configured.");
      return;
    }

    setAuthError("");
    setAuthMessage("");

    if (!email || !password) {
      setAuthError("Email and password দিন।");
      return;
    }

    if (password.length < 6) {
      setAuthError("Password কমপক্ষে 6 characters হতে হবে।");
      return;
    }

    setAuthBusy(true);

    if (authMode === "login") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setAuthError(error.message);
      } else {
        setShowAuth(false);
        setEmail("");
        setPassword("");
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setAuthError(error.message);
      } else {
        setAuthMessage(
          "Account তৈরি হয়েছে। এখন Login করুন।"
        );
        setAuthMode("login");
        setPassword("");
      }
    }

    setAuthBusy(false);
  }

  async function logout() {
    if (!supabase) return;

    await supabase.auth.signOut();
    setPage("Dashboard");
  }

  const filteredProducts = useMemo(() => {
    const keyword = search.toLowerCase();

    return products.filter((product) =>
      [product.name, product.sku, product.category]
        .join(" ")
        .toLowerCase()
        .includes(keyword)
    );
  }, [products, search]);

  const totalStock = products.reduce(
    (total, product) => total + Number(product.stock || 0),
    0
  );

  const stockValue = products.reduce(
    (total, product) =>
      total +
      Number(product.stock || 0) *
        Number(product.buy_price || 0),
    0
  );

  const lowStock = products.filter(
    (product) =>
      Number(product.stock || 0) <=
      Number(product.minimum_stock || 0)
  ).length;

  const navigation = [
    ["Dashboard", LayoutDashboard],
    ["Sales", ShoppingCart],
    ["Inventory", Package],
    ["Purchases", Truck],
    ["Customers", Users],
    ["Accounts", Wallet],
    ["Reports", BarChart3],
    ["Settings", Settings],
  ] as const;

  if (authLoading) {
    return (
      <div className="app">
        <div className="empty">Loading RYZORA Inventory...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="authpage">
        <div className="authcard">
          <div className="authlogo">R</div>

          <h1>RYZORA Inventory</h1>

          <p className="muted">
            Business Management System
          </p>

          <div className="authbuttons">
            <button
              className="btn primary full"
              onClick={() => {
                setAuthMode("login");
                setShowAuth(true);
                setAuthError("");
                setAuthMessage("");
              }}
            >
              Login
            </button>

            <button
              className="btn secondary full"
              onClick={() => {
                setAuthMode("signup");
                setShowAuth(true);
                setAuthError("");
                setAuthMessage("");
              }}
            >
              Create Account
            </button>
          </div>

          <div className="muted authnote">
            Securely powered by Supabase
          </div>
        </div>

        {showAuth && (
          <AuthModal
            mode={authMode}
            setMode={setAuthMode}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            error={authError}
            message={authMessage}
            busy={authBusy}
            onSubmit={handleAuth}
            onClose={() => setShowAuth(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="app">
      {/* TOP BAR */}
      <header className="topbar">
        <div className="brand">
          <div className="logo">R</div>
          <span>RYZORA Inventory</span>
        </div>

        <div className="top-actions">
          <span className="useremail">
            {session.user.email}
          </span>

          <button
            className="iconbtn"
            onClick={logout}
            title="Logout"
          >
            <LogOut size={18} />
          </button>

          <button className="iconbtn">
            <Bell size={18} />
          </button>

          <button className="iconbtn">
            <Menu size={18} />
          </button>
        </div>
      </header>

      <div className="layout">
        {/* SIDEBAR */}
        <aside className="sidebar">
          {navigation.map(([name, Icon]) => (
            <button
              key={name}
              className={`navbtn ${
                page === name ? "active" : ""
              }`}
              onClick={() => setPage(name)}
            >
              <Icon size={18} />
              <span>{name}</span>
            </button>
          ))}

          <button className="navbtn logoutbtn" onClick={logout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </aside>

        {/* MAIN CONTENT */}
        <main className="main">
          {page === "Dashboard" && (
            <Dashboard
              products={products}
              totalStock={totalStock}
              stockValue={stockValue}
              lowStock={lowStock}
            />
          )}

          {page === "Inventory" && (
            <Inventory
              products={filteredProducts}
              search={search}
              setSearch={setSearch}
              reload={loadProducts}
              loading={loading}
            />
          )}

          {page !== "Dashboard" &&
            page !== "Inventory" && (
              <GenericPage page={page} />
            )}
        </main>
      </div>

      {/* MOBILE NAV */}
      <nav className="bottomnav">
        {navigation.slice(0, 5).map(([name, Icon]) => (
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

/* ================= AUTH MODAL ================= */

function AuthModal({
  mode,
  setMode,
  email,
  setEmail,
  password,
  setPassword,
  error,
  message,
  busy,
  onSubmit,
  onClose,
}: {
  mode: "login" | "signup";
  setMode: (value: "login" | "signup") => void;
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  error: string;
  message: string;
  busy: boolean;
  onSubmit: () => void;
  onClose: () => void;
}) {
  return (
    <div className="modalbackdrop">
      <div className="modal">
        <div className="modalhead">
          <div>
            <h2>
              {mode === "login"
                ? "Welcome Back"
                : "Create Account"}
            </h2>

            <div className="muted">
              {mode === "login"
                ? "Login to your RYZORA account"
                : "Create your RYZORA account"}
            </div>
          </div>

          <button className="iconbtn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="errorbox">
            {error}
          </div>
        )}

        {message && (
          <div className="successbox">
            {message}
          </div>
        )}

        <div className="formgrid">
          <label>
            Email
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="you@example.com"
            />
          </label>

          <label>
            Password
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Minimum 6 characters"
            />
          </label>
        </div>

        <div className="modalactions">
          <button
            className="btn secondary"
            onClick={() =>
              setMode(
                mode === "login"
                  ? "signup"
                  : "login"
              )
            }
          >
            {mode === "login"
              ? "Create Account"
              : "Login Instead"}
          </button>

          <button
            className="btn primary"
            onClick={onSubmit}
            disabled={busy}
          >
            {busy
              ? "Please wait..."
              : mode === "login"
              ? "Login"
              : "Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= DASHBOARD ================= */

function Dashboard({
  products,
  totalStock,
  stockValue,
  lowStock,
}: {
  products: Product[];
  totalStock: number;
  stockValue: number;
  lowStock: number;
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
        <MetricCard
          title="Today's Sales"
          value={money(25500)}
          className="gold"
        />

        <MetricCard
          title="Today's Purchase"
          value={money(12800)}
        />

        <MetricCard
          title="Income"
          value={money(8500)}
          className="green"
        />

        <MetricCard
          title="Net Profit"
          value={money(4300)}
          className="green"
        />
      </div>

      <div className="grid section">
        <MetricCard
          title="Total Products"
          value={products.length.toString()}
        />

        <MetricCard
          title="Total Stock"
          value={totalStock.toLocaleString()}
        />

        <MetricCard
          title="Stock Value"
          value={money(stockValue)}
        />

        <MetricCard
          title="Low Stock"
          value={lowStock.toString()}
          className="red"
        />
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
              {products.slice(0, 8).map((product) => {
                const isLow =
                  Number(product.stock) <=
                  Number(product.minimum_stock);

                return (
                  <tr key={product.id}>
                    <td>
                      <b>{product.name}</b>
                    </td>
                    <td>{product.sku || "-"}</td>
                    <td>{product.stock}</td>
                    <td>
                      {money(product.sell_price)}
                    </td>
                    <td
                      className={
                        isLow ? "red" : "green"
                      }
                    >
                      {isLow ? "Low" : "Healthy"}
                    </td>
                  </tr>
                );
              })}
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

/* ================= METRIC ================= */

function MetricCard({
  title,
  value,
  className = "",
}: {
  title: string;
  value: string;
  className?: string;
}) {
  return (
    <div className="card">
      <div className="muted">{title}</div>
      <div className={`metric ${className}`}>
        {value}
      </div>
    </div>
  );
}

/* ================= INVENTORY ================= */

function Inventory({
  products,
  search,
  setSearch,
  reload,
  loading,
}: {
  products: Product[];
  search: string;
  setSearch: (value: string) => void;
  reload: () => void;
  loading: boolean;
}) {
  const [showAdd, setShowAdd] = useState(false);

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
          onClick={() => setShowAdd(true)}
        >
          <Plus size={16} />
          Add Product
        </button>
      </div>

      <div className="toolbar">
        <div
          style={{
            position: "relative",
            flex: 1,
          }}
        >
          <Search
            size={18}
            style={{
              position: "absolute",
              left: 12,
              top: 12,
              color: "#777",
            }}
          />

          <input
            className="search"
            style={{
              width: "100%",
              paddingLeft: 40,
            }}
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search product, SKU or category..."
          />
        </div>

        <button
          className="btn secondary"
          onClick={reload}
        >
          Refresh
        </button>
      </div>

      <div className="grid">
        <MetricCard
          title="Products"
          value={products.length.toString()}
        />

        <MetricCard
          title="Low Stock"
          value={products
            .filter(
              (p) =>
                Number(p.stock) <=
                Number(p.minimum_stock)
            )
            .length.toString()}
          className="red"
        />

        <MetricCard
          title="Active Products"
          value={products
            .filter((p) => p.active)
            .length.toString()}
        />

        <MetricCard
          title="Total Stock"
          value={products
            .reduce(
              (total, product) =>
                total + Number(product.stock || 0),
              0
            )
            .toLocaleString()}
        />
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
              {products.map((product) => {
                const isLow =
                  Number(product.stock) <=
                  Number(product.minimum_stock);

                return (
                  <tr key={product.id}>
                    <td>
                      <b>{product.name}</b>
                    </td>
                    <td>{product.sku || "-"}</td>
                    <td>
                      {product.category || "-"}
                    </td>
                    <td>
                      {product.stock}{" "}
                      {product.unit || ""}
                    </td>
                    <td>
                      {money(product.buy_price)}
                    </td>
                    <td>
                      {money(product.sell_price)}
                    </td>
                    <td
                      className={
                        isLow ? "red" : "green"
                      }
                    >
                      {isLow ? "Low" : "OK"}
                    </td>
                  </tr>
                );
              })}
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

      {showAdd && (
        <AddProductModal
          onClose={() => setShowAdd(false)}
          onSaved={() => {
            setShowAdd(false);
            reload();
          }}
        />
      )}
    </>
  );
}

/* ================= ADD PRODUCT ================= */

function AddProductModal({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState("");
  const [unit, setUnit] = useState("pcs");
  const [buyPrice, setBuyPrice] = useState("");
  const [sellPrice, setSellPrice] = useState("");
  const [stock, setStock] = useState("");
  const [minimumStock, setMinimumStock] =
    useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function saveProduct() {
    if (!supabase) {
      setError("Supabase is not configured.");
      return;
    }

    if (!name.trim()) {
      setError("Product name দিন।");
      return;
    }

    setSaving(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Please login first.");
      setSaving(false);
      return;
    }

    const openingStock = Number(stock || 0);

    const { data: product, error: productError } =
      await supabase
        .from("products")
        .insert({
          user_id: user.id,
          name: name.trim(),
          sku: sku.trim() || null,
          category: category.trim() || null,
          unit: unit || "pcs",
          buy_price: Number(buyPrice || 0),
          sell_price: Number(sellPrice || 0),
          stock: openingStock,
          minimum_stock: Number(
            minimumStock || 0
          ),
          active: true,
        })
        .select()
        .single();

    if (productError) {
      setError(productError.message);
      setSaving(false);
      return;
    }

    if (openingStock > 0 && product) {
      const { error: movementError } =
        await supabase
          .from("inventory_stock_movements")
          .insert({
            user_id: user.id,
            product_id: product.id,
            movement_type: "opening",
            quantity: openingStock,
            reference: "OPENING",
            note: "Opening stock",
          });

      if (movementError) {
        setError(
          "Product saved, but stock movement failed: " +
            movementError.message
        );
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    onSaved();
  }

  return (
    <div className="modalbackdrop">
      <div className="modal">
        <div className="modalhead">
          <div>
            <h2>Add Product</h2>
            <div className="muted">
              Add a new inventory product
            </div>
          </div>

          <button
            className="iconbtn"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="errorbox">
            {error}
          </div>
        )}

        <div className="formgrid">
          <label>
            Product Name *
            <input
              className="input"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              placeholder="Product name"
            />
          </label>

          <label>
            SKU
            <input
              className="input"
              value={sku}
              onChange={(e) =>
                setSku(e.target.value)
              }
              placeholder="SKU"
            />
          </label>

          <label>
            Category
            <input
              className="input"
              value={category}
              onChange={(e) =>
                setCategory(e.target.value)
              }
              placeholder="Category"
            />
          </label>

          <label>
            Unit
            <select
              className="input"
              value={unit}
              onChange={(e) =>
                setUnit(e.target.value)
              }
            >
              <option value="pcs">pcs</option>
              <option value="box">box</option>
              <option value="kg">kg</option>
              <option value="g">g</option>
              <option value="liter">liter</option>
              <option value="meter">meter</option>
            </select>
          </label>

          <label>
            Purchase Price
            <input
              className="input"
              type="number"
              value={buyPrice}
              onChange={(e) =>
                setBuyPrice(e.target.value)
              }
              placeholder="0"
            />
          </label>

          <label>
            Sell Price
            <input
              className="input"
              type="number"
              value={sellPrice}
              onChange={(e) =>
                setSellPrice(e.target.value)
              }
              placeholder="0"
            />
          </label>

          <label>
            Opening Stock
            <input
              className="input"
              type="number"
              value={stock}
              onChange={(e) =>
                setStock(e.target.value)
              }
              placeholder="0"
            />
          </label>

          <label>
            Minimum Stock
            <input
              className="input"
              type="number"
              value={minimumStock}
              onChange={(e) =>
                setMinimumStock(e.target.value)
              }
              placeholder="0"
            />
          </label>
        </div>

        <div className="modalactions">
          <button
            className="btn secondary"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="btn primary"
            onClick={saveProduct}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Product"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= OTHER MODULES ================= */

function GenericPage({ page }: { page: string }) {
  const icons: Record<string, any> = {
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
        <h1>{page}</h1>

        <div className="muted">
          RYZORA {page} module
        </div>
      </div>

      <button className="btn primary">
        <Plus size={16} />
        Add New
      </button>

      <div
        className="card section"
        style={{ width: "100%" }}
      >
        <div className="empty">
          <Icon size={42} />

          <p>
            {page} module is ready for development.
          </p>
        </div>
      </div>
    </div>
  );
}
