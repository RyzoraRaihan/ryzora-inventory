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
} from "lucide-react";

type Product = {
  id: string;
  name: string;
  sku: string | null;
  category: string | null;
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
        "id,name,sku,category,stock,minimum_stock,buy_price,sell_price,active"
      )
      .order("created_at", { ascending: false });

    if (!error) {
      setProducts((data || []) as Product[]);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadProducts();
  }, []);

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
      Number(product.stock || 0) * Number(product.buy_price || 0),
    0
  );

  const lowStock = products.filter(
    (product) =>
      Number(product.stock || 0) <= Number(product.minimum_stock || 0)
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

  return (
    <div className="app">
      {/* TOP BAR */}
      <header className="topbar">
        <div className="brand">
          <div className="logo">R</div>
          <span>RYZORA Inventory</span>
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
        {/* SIDEBAR */}
        <aside className="sidebar">
          {navigation.map(([name, Icon]) => (
            <button
              key={name}
              className={`navbtn ${page === name ? "active" : ""}`}
              onClick={() => setPage(name)}
            >
              <Icon size={18} />
              <span>{name}</span>
            </button>
          ))}
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

          {page !== "Dashboard" && page !== "Inventory" && (
            <GenericPage page={page} />
          )}
        </main>
      </div>

      {/* MOBILE BOTTOM NAV */}
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

      {/* BUSINESS METRICS */}
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

      {/* INVENTORY METRICS */}
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

      {/* INVENTORY SNAPSHOT */}
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

                    <td>{money(product.sell_price)}</td>

                    <td className={isLow ? "red" : "green"}>
                      {isLow ? "Low" : "Healthy"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {!products.length && (
            <div className="empty">
              No products yet. Add your first product from Inventory.
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ================= METRIC CARD ================= */

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
      <div className={`metric ${className}`}>{value}</div>
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
  const lowStock = products.filter(
    (product) =>
      Number(product.stock) <= Number(product.minimum_stock)
  ).length;

  return (
    <>
      <div className="pagehead">
        <div>
          <h1>Inventory</h1>
          <div className="muted">
            Products, stock and pricing
          </div>
        </div>

        <button className="btn primary">
          <Plus size={16} />
          Add Product
        </button>
      </div>

      {/* SEARCH */}
      <div className="toolbar">
        <div style={{ position: "relative", flex: 1 }}>
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
            style={{ width: "100%", paddingLeft: 40 }}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
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

      {/* INVENTORY SUMMARY */}
      <div className="grid">
        <MetricCard
          title="Products"
          value={products.length.toString()}
        />

        <MetricCard
          title="Low Stock"
          value={lowStock.toString()}
          className="red"
        />

        <MetricCard
          title="Active Products"
          value={products
            .filter((product) => product.active)
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

      {/* PRODUCT TABLE */}
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

                    <td>{product.category || "-"}</td>

                    <td>{product.stock}</td>

                    <td>{money(product.buy_price)}</td>

                    <td>{money(product.sell_price)}</td>

                    <td className={isLow ? "red" : "green"}>
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
    </>
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

      <div className="card section" style={{ width: "100%" }}>
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
