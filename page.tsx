 "use client";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { LayoutDashboard, Package, ShoppingCart, Truck, Users, Wallet, BarChart3, Settings, Plus, Search, Bell, Menu, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";

type Product = { id:string; name:string; sku:string|null; category:string|null; stock:number; minimum_stock:number; purchase_price:number; sell_price:number; active:boolean };

const money=(n:number)=>`৳${Number(n||0).toLocaleString("en-BD",{maximumFractionDigits:2})}`;

export default function Home(){
  const [page,setPage]=useState("Dashboard");
  const [products,setProducts]=useState<Product[]>([]);
  const [search,setSearch]=useState("");
  const [loading,setLoading]=useState(false);

  async function loadProducts(){
    if(!supabase) return;
    setLoading(true);
    const {data}=await supabase.from("products").select("id,name,sku,category,stock,minimum_stock,buy_price,sell_price,active").order("created_at",{ascending:false});
    setProducts((data||[]).map((p:any)=>({...p,purchase_price:p.buy_price})));
    setLoading(false);
  }
  useEffect(()=>{loadProducts()},[]);

  const filtered=useMemo(()=>products.filter(p=>[p.name,p.sku,p.category].join(" ").toLowerCase().includes(search.toLowerCase())),[products,search]);
  const totalStock=products.reduce((a,p)=>a+Number(p.stock||0),0);
  const stockValue=products.reduce((a,p)=>a+Number(p.stock||0)*Number(p.purchase_price||0),0);
  const low=products.filter(p=>Number(p.stock)<=Number(p.minimum_stock)).length;

  const nav=[
    ["Dashboard",LayoutDashboard],["Sales",ShoppingCart],["Inventory",Package],["Purchases",Truck],["Customers",Users],["Accounts",Wallet],["Reports",BarChart3],["Settings",Settings]
  ] as const;

  return <div className="app">
    <header className="topbar">
      <div className="brand"><div className="logo">R</div>RYZORA Inventory</div>
      <div className="top-actions"><button className="iconbtn"><Bell size={18}/></button><button className="iconbtn"><Menu size={18}/></button></div>
    </header>
    <div className="layout">
      <aside className="sidebar">{nav.map(([name,Icon])=><button key={name} className={`navbtn ${page===name?"active":""}`} onClick={()=>setPage(name)}><Icon size={18}/>{name}</button>)}</aside>
      <main className="main">
        {page==="Dashboard" && <Dashboard totalStock={totalStock} stockValue={stockValue} low={low} products={products} money={money} />}
        {page==="Inventory" && <Inventory products={filtered} search={search} setSearch={setSearch} reload={loadProducts} loading={loading} money={money}/>}
        {page!=="Dashboard"&&page!=="Inventory"&&<Generic page={page}/>}
      </main>
    </div>
    <nav className="bottomnav">{nav.slice(0,5).map(([name,Icon])=><button key={name} className={page===name?"active":""} onClick={()=>setPage(name)}><Icon size={19}/><div>{name}</div></button>)}</nav>
  </div>
}

function Dashboard({totalStock,stockValue,low,products,money}:{totalStock:number;stockValue:number;low:number;products:Product[];money:(n:number)=>string}){
 return <><div className="pagehead"><div><h1>Dashboard</h1><div className="muted">Business overview at a glance</div></div><button className="btn accent"><Plus size={16}/> Quick Sale</button></div>
 <div className="grid">
  <div className="card"><div className="muted">Today&apos;s Sales</div><div className="metric gold">{money(25500)}</div></div>
  <div className="card"><div className="muted">Today&apos;s Purchase</div><div className="metric">{money(12800)}</div></div>
  <div className="card"><div className="muted">Income</div><div className="metric green">{money(8500)}</div></div>
  <div className="card"><div className="muted">Net Profit</div><div className="metric green">{money(4300)}</div></div>
 </div>
 <div className="grid section">
  <div className="card"><div className="muted">Total Products</div><div className="metric">{products.length}</div></div>
  <div className="card"><div className="muted">Total Stock</div><div className="metric">{totalStock}</div></div>
  <div className="card"><div className="muted">Stock Value</div><div className="metric">{money(stockValue)}</div></div>
  <div className="card"><div className="muted">Low Stock</div><div className="metric red">{low}</div></div>
 </div>
 <div className="card section"><h3>Inventory Snapshot</h3><div className="tablewrap"><table className="table"><thead><tr><th>Product</th><th>SKU</th><th>Stock</th><th>Sell Price</th><th>Status</th></tr></thead><tbody>{products.slice(0,8).map(p=><tr key={p.id}><td>{p.name}</td><td>{p.sku||"-"}</td><td>{p.stock}</td><td>{money(p.sell_price)}</td><td className={p.stock<=p.minimum_stock?"red":"green"}>{p.stock<=p.minimum_stock?"Low":"Healthy"}</td></tr>)}</tbody></table>{!products.length&&<div className="empty">No products yet. Add your first product from Inventory.</div>}</div></div>
 </>;
}

function Inventory({products,search,setSearch,reload,loading,money}:{products:Product[];search:string;setSearch:(v:string)=>void;reload:()=>void;loading:boolean;money:(n:number)=>string}){
 return <><div className="pagehead"><div><h1>Inventory</h1><div className="muted">Products, stock and pricing</div></div><button className="btn primary"><Plus size={16}/> Add Product</button></div>
 <div className="toolbar"><input className="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search product, SKU or category..."/><button className="btn secondary" onClick={reload}>Refresh</button></div>
 <div className="grid"><div className="card"><div className="muted">Products</div><div className="metric">{products.length}</div></div><div className="card"><div className="muted">Low Stock</div><div className="metric red">{products.filter(p=>p.stock<=p.minimum_stock).length}</div></div></div>
 <div className="card section"><div className="tablewrap"><table className="table"><thead><tr><th>Product</th><th>SKU</th><th>Category</th><th>Stock</th><th>Purchase</th><th>Sell</th><th>Status</th></tr></thead><tbody>{products.map(p=><tr key={p.id}><td><b>{p.name}</b></td><td>{p.sku||"-"}</td><td>{p.category||"-"}</td><td>{p.stock}</td><td>{money(p.purchase_price)}</td><td>{money(p.sell_price)}</td><td className={p.stock<=p.minimum_stock?"red":"green"}>{p.stock<=p.minimum_stock?"Low":"OK"}</td></tr>)}</tbody></table>{loading&&<div className="empty">Loading...</div>}{!loading&&!products.length&&<div className="empty">No products found.</div>}</div></div>
 </>;
}

function Generic({page}:{page:string}){
 const icons:any={Sales:ShoppingCart,Purchases:Truck,Customers:Users,Accounts:Wallet,Reports:BarChart3,Settings:Settings};
 const Icon=icons[page]||ArrowDownToLine;
 return <div className="pagehead"><div><h1>{page}</h1><div className="muted">RYZORA {page} module</div></div><button className="btn primary"><Plus size={16}/> Add New</button></div>
}

