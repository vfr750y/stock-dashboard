# Upgrade steps
To upgrade from a proof-of-concept application into a fully production-ready system with a permanent cloud database and a secure, third-party identity provider, the most cost-effective path is migrating to a Backend-as-a-Service (BaaS) architecture.

To minimize costs to absolute $0, the recommended solution is Supabase. It provides a fully managed PostgreSQL database and an integrated enterprise-grade Identity Provider (IdP) on a highly generous, permanent free tier.


# 1. High-Level Target Architecture

Keep the frontend deployed on Vercel ($0) and bridge the React state to Supabase via its lightweight client SDK.

```
+------------------------+      Secure API Requests     +------------------------+
|   Vercel Hosting       | <--------------------------> |     Supabase (BaaS)    |
| (React Frontend Client)|    (JSON Web Tokens / SSL)   | • PostgreSQL Database  |
+------------------------+                              | • Managed Identity/IdP |
                                                        +------------------------+
```


# 2. Database Migration (PostgreSQL Schema)

A relational SQL database is a much better fit than a NoSQL alternative (like Firebase Firestore), 
Drop localStorage and initialize a PostgreSQL table named products inside the Supabase console using this schema:

```sql
SQLcreate table products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  stock integer not null default 0 check (stock >= 0),
  unit text not null default 'kg',
  sale_price numeric(10, 2) not null default 0.00,
  cost_price numeric(10, 2) not null default 0.00,
  expiry date,
  sold integer not null default 0 check (sold >= 0),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

```

You can also create a separate key-value table called store_settings to house the discount percentages (discount5, discount3, discount2), ensuring configurations scale across multiple user instances:

A traditional generic key-value store, where each distinct setting configuration lives on its own individual row. This makes it highly extensible if you decide to add more settings (like tax_rate or currency_symbol) in the future without altering the database schema.

```SQL
-- Create the true key-value settings table
CREATE TABLE store_settings (
    setting_key TEXT PRIMARY KEY,
    setting_value NUMERIC(3, 2) NOT NULL
);

-- Seed the initial discount markdown percentages
INSERT INTO store_settings (setting_key, setting_value) VALUES
('discount5', 0.05),
('discount3', 0.10),
('discount2', 0.20)
ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value;
```

How to query in React: 
```
SELECT setting_value FROM store_settings WHERE setting_key = 'discount5';
```

# 3. Migrating to Third-Party Identity Provider (IdP)

Your custom client-side credentials (jared / fruitandveg) will be replaced by Supabase Auth. This provides secure handling of password hashing, salt encryption, session tokens, and automatic management of user states.
## Steps to Setup:
In the Supabase dashboard, navigate to Authentication -> Providers.Email/Password Provider: Turn it on. (Alternatively, you can activate Google OAuth for an integrated one-click sign-in).

Create account credentials for your store clerks directly via the dashboard, eliminating user registration screens from your public UI.

The React Code Shift:

Install the client dependency via terminal: npm install @supabase/supabase-jsInitialize a single shared client instance (supabaseClient.js) and swap out your local validation handler:
```JavaScript
// Before: handleLogin searched a client-side hardcoded array
// After: Securely offload authentication to the Identity Provider
import { createClient } from '@supabase/supabase-js';

const supabase = createClient('YOUR_SUPABASE_URL', 'YOUR_SUPABASE_ANON_KEY');

async function handleLogin(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });
  
  if (error) {
    alert("Authentication failed: " + error.message);
  } else {
    // Supabase automatically creates a local JWT session tracking layer
    setUser(data.user); 
  }
}
```

# 4. Rewriting State Management & Helpers

Rather than listening to local mutation changes through a global useEffect mapped to localStorage, change your state architecture to read directly from the cloud on mount, and write changes via API transactions.Data Fetching (useEffect Update)

```JavaScript
useEffect(() => {
  async function fetchInventory() {
    const { data, error } = await supabase
      .from('products')
      .select('*');
    if (!error) setProducts(data);
  }
  
  // Only fetch if a valid user session is authenticated via the IdP
  if (user) fetchInventory();
}, [user]);
```

Syncing Data Updates (Optimistic UI Updates)When a clerk tweaks a field or pulls the range slider, you want to immediately update the local React state for a fast user experience, then issue a persistent asynchronous write command to the database background:

```JavaScript
const updateFieldInDB = async (id, updatedFields) => {
  const { error } = await supabase
    .from('products')
    .update(updatedFields)
    .eq('id', id);
    
  if (error) console.error("Cloud synchronization sync error:", error.message);
};

// Wired straight into your handleSliderChange or updateField wrappers
const handleSliderChange = (index, newStock, productObj) => {
  const delta = productObj.stock - newStock;
  const newSold = productObj.sold + delta;

  // 1. Update UI state instantly
  const updated = [...products];
  updated[index] = { ...productObj, stock: newStock, sold: newSold };
  setProducts(updated);

  // 2. Persist safely downstream in the cloud database
  updateFieldInDB(productObj.id, { stock: newStock, sold: newSold });
};
```

How Helpers Change:

Your core mathematical helper logic (getDaysLeft, suggestPrice, calculateProfit) remains entirely intact and requires zero architecture modifications. They continue to run inside the client engine using the database records pulled into your React components.


$$\text{Profit} = (\text{Sale Price} - \text{Cost Price}) \times \text{Units Sold}$$

The calculation continues to render cleanly in your dashboard interface since it derives values directly from the database table's synced state.

# 5. Securing the Cloud Database with RLS

Because the database is now public on the web, you must ensure that malicious third parties cannot intercept your API keys and modify your prices or inventory numbers. You achieve this for free by turning on Row Level Security (RLS) within your Postgres database console. Write a security policy that only permits data access if the client request contains a valid token matching your authenticated store employees:

```SQL
-- Lock down table access
alter table products enable row level security;

-- Create an access rule policy requiring valid authentication tokens
create policy "Allow authenticated store clerks full write access" 
on products for all 
to authenticated 
using (true);
```

## Updated app.js:
```javascript
import React, { useState, useEffect } from "react";
// Import the Supabase client connection instance
import { supabase } from "./supabaseClient";

// =======================
//  HELPER FUNCTIONS
// =======================

/** Calculate how many days remain before expiry */
function getDaysLeft(expiry) {
  if (!expiry) return Infinity;
  const now = new Date();
  const exp = new Date(expiry);
  return Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
}

/** Suggest a discounted price based on days until expiry and configurable discounts */
function suggestPrice(p, discounts) {
  const days = getDaysLeft(p.expiry);

  let discount = 0;
  if (days < 5 && days >= 3) discount = discounts.discount5 || 0;
  else if (days < 3 && days >= 2) discount = discounts.discount3 || 0;
  else if (days < 2 && days >= 1) discount = discounts.discount2 || 0;

  // Uses snake_case variables matching the cloud PostgreSQL schema mapping
  const discounted = (Number(p.sale_price) || 0) * (1 - discount);
  return Math.max((Number(p.cost_price) || 0), discounted).toFixed(2);
}

/** Calculate real-time profit: (sale_price - cost_price) * sold */
function calculateProfit(p) {
  const sold = Number(p.sold || 0);
  const sale = Number(p.sale_price || 0);
  const cost = Number(p.cost_price || 0);

  return ((sale - cost) * sold).toFixed(2);
}

// =======================
//  USER GUIDE CONTENT
// =======================

function getUserGuideHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Stock Sage - User Guide</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background: #f9fafb; }
    .guide-container { max-width: 1000px; margin: 0 auto; padding: 0; }
    .nav-bar { position: sticky; top: 0; background: #1a1a2e; padding: 15px 20px; z-index: 100; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .nav-bar h1 { color: white; margin-bottom: 10px; font-size: 1.8em; font-family: 'Georgia', serif; }
    .nav-links { display: flex; gap: 20px; flex-wrap: wrap; }
    .nav-links a { color: #e0e0e0; text-decoration: none; padding: 5px 12px; border-radius: 15px; transition: all 0.3s; font-size: 0.95em; }
    .nav-links a:hover { background: #2d2d44; color: white; }
    .content { padding: 30px 20px; }
    .section { background: white; border-radius: 12px; padding: 30px; margin-bottom: 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); border-left: 4px solid #34c759; }
    .section h2 { color: #1a1a2e; margin-bottom: 15px; font-size: 1.5em; padding-bottom: 10px; border-bottom: 2px solid #f0f0f0; }
    .section h3 { color: #2d2d44; margin: 20px 0 10px 0; font-size: 1.2em; }
    .section p, .section li { margin-bottom: 10px; color: #555; }
    .section ul, .section ol { margin-left: 25px; margin-bottom: 15px; }
    .feature-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; margin: 20px 0; }
    .feature-card { background: #f8f9fa; border-radius: 8px; padding: 20px; border: 1px solid #e5e7eb; }
    .tip-box { background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 15px; margin: 15px 0; }
    .tip-box strong { color: #856404; }
    .color-legend { display: flex; gap: 20px; flex-wrap: wrap; margin: 15px 0; }
    .color-item { display: flex; align-items: center; gap: 8px; }
    .color-swatch { width: 24px; height: 24px; border-radius: 4px; }
    .back-to-top { display: inline-block; background: #1a1a2e; color: white; padding: 10px 20px; border-radius: 20px; text-decoration: none; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="guide-container">
    <nav class="nav-bar">
      <h1>📚 Stock Sage User Guide</h1>
      <div class="nav-links">
        <a href="#getting-started">Getting Started</a>
        <a href="#managing-products">Managing Products</a>
        <a href="#understanding-colors">Color System</a>
        <a href="#sorting-features">Sorting Features</a>
        <a href="#settings">Settings</a>
      </div>
    </nav>
    <div class="content">
      <div id="getting-started" class="section">
        <h2>🚀 Getting Started</h2>
        <p>Stock Sage is linked to persistent cloud infrastructure. All modifications commit directly to centralized storage parameters instantly.</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

// =======================
//  MAIN APP COMPONENT
// =======================
export default function App() {
  // -----------------------
  //  STATE MANAGEMENT
  // -----------------------
  const [products, setProducts] = useState([]);
  const [discounts, setDiscounts] = useState({ discount5: 0.05, discount3: 0.10, discount2: 0.20 });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Settings form states
  const [newDiscount5, setNewDiscount5] = useState("5");
  const [newDiscount3, setNewDiscount3] = useState("10");
  const [newDiscount2, setNewDiscount2] = useState("20");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [settingsMsg, setSettingsMsg] = useState("");
  const [sortBy, setSortBy] = useState("default");

  // -----------------------------------------------
  //  INITIALIZE AUTH & DATABASE LIFECYCLE LISTENERS
  // -----------------------------------------------
  useEffect(() => {
    // Check for an existing persistent cloud session on application load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && session.user) {
        setIsLoggedIn(true);
        setCurrentUser(session.user.email.split("@")[0]);
      }
    });

    // Listen for third-party Identity Provider auth state transitions
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session && session.user) {
        setIsLoggedIn(true);
        setCurrentUser(session.user.email.split("@")[0]);
      } else {
        setIsLoggedIn(false);
        setCurrentUser("");
        setProducts([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sync data from cloud data streams upon successful login
  useEffect(() => {
    if (!isLoggedIn) return;

    async function fetchCloudData() {
      // 1. Download database inventory list
      const { data: databaseProducts, error: prodError } = await supabase
        .from("products")
        .select("*");
      if (!prodError && databaseProducts) {
        setProducts(databaseProducts);
      }

      // 2. Download markdown threshold configuration metrics
      const { data: configRow, error: configError } = await supabase
        .from("store_settings")
        .select("*")
        .eq("id", 1)
        .single();

      if (!configError && configRow) {
        setDiscounts({
          discount5: Number(configRow.discount5),
          discount3: Number(configRow.discount3),
          discount2: Number(configRow.discount2)
        });
        setNewDiscount5((configRow.discount5 * 100).toString());
        setNewDiscount3((configRow.discount3 * 100).toString());
        setNewDiscount2((configRow.discount2 * 100).toString());
      }
    }

    fetchCloudData();
  }, [isLoggedIn]);

  // Load typography fonts
  useEffect(() => {
    if (!document.getElementById("playfair-font-link")) {
      const link = document.createElement("link");
      link.id = "playfair-font-link";
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  const openUserGuide = () => {
    const guideWindow = window.open("", "StockSageUserGuide", "width=900,height=700,scrollbars=yes,resizable=yes");
    if (guideWindow) {
      guideWindow.document.write(getUserGuideHTML());
      guideWindow.document.close();
    }
  };

  // -----------------------------------------------
  //  CLOUD IDENTITY HANDLERS (IdP AUTH)
  // -----------------------------------------------
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    const usernameInput = e.target.username.value.trim();
    const password = e.target.password.value;

    // Normalizes loose storefront handles into structured email records for the IdP
    const cleanEmail = usernameInput.includes("@") ? usernameInput : `${usernameInput}@stocksage.com`;

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: password
    });

    if (error) {
      setLoginError(error.message);
    } else if (data.user) {
      setIsLoggedIn(true);
      setCurrentUser(data.user.email.split("@")[0]);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setCurrentUser("");
    setShowSettings(false);
  };

  // -----------------------------------------------
  //  CLOUD CONFIGURATION WRITERS
  // -----------------------------------------------
  const saveDiscounts = async () => {
    const d5 = parseFloat(newDiscount5) / 100 || 0;
    const d3 = parseFloat(newDiscount3) / 100 || 0;
    const d2 = parseFloat(newDiscount2) / 100 || 0;

    const { error } = await supabase
      .from("store_settings")
      .update({ discount5: d5, discount3: d3, discount2: d2 })
      .eq("id", 1);

    if (error) {
      setSettingsMsg(`Error: ${error.message}`);
    } else {
      setDiscounts({ discount5: d5, discount3: d3, discount2: d2 });
      setSettingsMsg("Discount percentages saved to cloud storage.");
    }
  };

  const changePassword = async () => {
    if (newPassword !== confirmNewPassword) {
      setSettingsMsg("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setSettingsMsg("Identity rules demand minimum 6 characters.");
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setSettingsMsg(`Error: ${error.message}`);
    } else {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setSettingsMsg("Password securely updated in cloud identity registry.");
    }
  };

  const addUser = async () => {
    if (!newUsername.trim() || !newUserPassword.trim()) {
      setSettingsMsg("Username and password are required.");
      return;
    }
    const derivedEmail = `${newUsername.trim().toLowerCase()}@stocksage.com`;

    // Creates an additional storefront operator login record on the centralized IdP
    const { error } = await supabase.auth.signUp({
      email: derivedEmail,
      password: newUserPassword
    });

    if (error) {
      setSettingsMsg(`Error: ${error.message}`);
    } else {
      setNewUsername("");
      setNewUserPassword("");
      setSettingsMsg(`Clerk "${newUsername.trim()}" registered. Check auth lists.`);
    }
  };

  // -----------------------------------------------
  //  PRODUCT TRANSACTION WORKFLOWS (OPTIMISTIC + ASYNC)
  // -----------------------------------------------
  const updateField = async (index, field, value, productObj) => {
    let normalizedValue = value;
    if (["stock", "sale_price", "cost_price", "sold"].includes(field)) {
      normalizedValue = Math.max(0, Number(value));
    }

    const updated = [...products];
    const oldStock = Number(productObj.stock) || 0;

    // Automatic calculation link tracking sales increments on drops
    let calculatedSold = Number(productObj.sold) || 0;
    if (field === "stock" && normalizedValue < oldStock) {
      calculatedSold += (oldStock - normalizedValue);
    }

    // Step 1: Push updates to local UI states instantly (Optimistic UI)
    const updatedRow = { ...productObj, [field]: normalizedValue, sold: calculatedSold };
    updated[index] = updatedRow;
    setProducts(updated);

    // Step 2: Push mutations asynchronously down to remote table
    await supabase
      .from("products")
      .update({ [field]: normalizedValue, sold: calculatedSold })
      .eq("id", productObj.id);
  };

  const handleSliderChange = async (index, newStock, productObj) => {
    const oldStock = Number(productObj.stock) || 0;
    const newStockNum = Number(newStock);
    let calculatedSold = Number(productObj.sold) || 0;

    if (newStockNum < oldStock) {
      calculatedSold += (oldStock - newStockNum);
    }

    // Update UI instantly
    const updated = [...products];
    updated[index] = { ...productObj, stock: newStockNum, sold: calculatedSold };
    setProducts(updated);

    // Sync back-end values downstream
    await supabase
      .from("products")
      .update({ stock: newStockNum, sold: calculatedSold })
      .eq("id", productObj.id);
  };

  const addProduct = async () => {
    const freshTemplate = {
      name: "New Fresh Item",
      stock: 0,
      unit: "kg",
      sale_price: 0.00,
      cost_price: 0.00,
      expiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      sold: 0
    };

    const { data, error } = await supabase
      .from("products")
      .insert([freshTemplate])
      .select();

    if (!error && data) {
      setProducts([...products, data[0]]);
    } else if (error) {
      alert(`Database write error: ${error.message}`);
    }
  };

  const removeProduct = async (id, index) => {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (!error) {
      const updated = [...products];
      updated.splice(index, 1);
      setProducts(updated);
    } else {
      alert(`Deletion aborted by remote system: ${error.message}`);
    }
  };

  const getColor = (days) => {
    if (days <= 1) return "#ff3b30"; // red
    if (days <= 3) return "#ffcc00"; // yellow
    return "#34c759";               // green
  };

  // --------------------------------------------------
  //  SORTING INFRASTRUCTURE
  // --------------------------------------------------
  const sortedProducts = (() => {
    const withIndex = products.map((p, idx) => ({ ...p, _originalIndex: idx }));

    if (sortBy === "alpha") {
      return withIndex.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } else if (sortBy === "expiry") {
      return withIndex.sort((a, b) => {
        const daysA = getDaysLeft(a.expiry);
        const daysB = getDaysLeft(b.expiry);
        return daysA - daysB;
      });
    } else {
      return withIndex;
    }
  })();

  const stockSageTitleStyle = {
    fontFamily: "'Playfair Display', serif",
    fontWeight: 700,
    fontSize: "2em",
    letterSpacing: "1px",
    margin: 0
  };

  // =======================
  //  UI SCREEN: UNAUTHENTICATED GATED ENTRY
  // =======================
  if (!isLoggedIn) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundImage: "url('https://images.unsplash.com/photo-1542838132-92c53300491e')",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        <form
          onSubmit={handleLogin}
          style={{
            background: "rgba(255,255,255,0.9)",
            padding: 30,
            borderRadius: 12,
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            textAlign: "center"
          }}
        >
          <h1 style={stockSageTitleStyle}>Stock Sage</h1>
          <h2 style={{ marginTop: 10 }}>Cloud Login</h2>
          <div style={{ marginBottom: 10 }}>
            <input name="username" placeholder="Username or Email" required style={{ padding: 8, width: "100%" }} />
          </div>
          <div style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", gap: "8px" }}>
              <input 
                name="password" 
                type={showPassword ? "text" : "password"} 
                placeholder="Password" 
                required 
                style={{ padding: 8, flex: 1 }} 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  padding: "8px 12px",
                  cursor: "pointer",
                  background: "#f0f0f0",
                  border: "1px solid #ccc",
                  borderRadius: 4,
                  fontSize: "12px"
                }}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          {loginError && <div style={{ color: "red", marginBottom: 8, fontSize: "12px", maxWidth: "240px" }}>{loginError}</div>}
          <button type="submit" style={{ padding: "8px 20px", cursor: "pointer" }}>Sign In</button>
        </form>
      </div>
    );
  }

  // =======================
  //  UI SCREEN: AUTHENTICATED SYSTEM DASHBOARD
  // =======================
  return (
    <div
      style={{
        padding: 20,
        minHeight: "100vh",
        backgroundImage: "url('https://images.unsplash.com/photo-1542838132-92c53300491e')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        filter: "brightness(0.9) saturate(0.8)"
      }}
    >
      {/* ---- PANEL HEADER INTERFACES ---- */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 15 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ background: "rgba(255, 255, 255, 0.75)", padding: "10px 16px", borderRadius: 10, backdropFilter: "blur(4px)" }}>
            <h1 style={stockSageTitleStyle}>Stock Sage</h1>
          </div>
          <button onClick={openUserGuide} style={{ background: "#1a1a2e", color: "white", border: "none", borderRadius: 8, padding: "10px 18px", cursor: "pointer", fontWeight: 600 }}>
            📖 User Guide
          </button>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ background: "rgba(255,255,255,0.8)", padding: "6px 12px", borderRadius: 8 }}>
            👤 {currentUser}
          </div>
          <button onClick={() => setSortBy("alpha")} style={{ background: sortBy === "alpha" ? "#e0e7ff" : "white", border: "1px solid #aaa", borderRadius: 8, padding: "6px 10px", cursor: "pointer" }}>
            A‑Z
          </button>
          <button onClick={() => setSortBy("expiry")} style={{ background: sortBy === "expiry" ? "#e0e7ff" : "white", border: "1px solid #aaa", borderRadius: 8, padding: "6px 10px", cursor: "pointer" }}>
            ⏳
          </button>
          <button onClick={() => setShowSettings(true)} style={{ background: "white", border: "1px solid #aaa", borderRadius: 8, padding: "6px 10px", cursor: "pointer" }}>
            ⚙️
          </button>
          <button onClick={handleLogout} style={{ background: "#f3f4f6", border: "1px solid #aaa", borderRadius: 8, padding: "6px 12px", cursor: "pointer" }}>
            Logout
          </button>
        </div>
      </div>

      {/* ---- CONFIGURATION MODAL OVERLAY ---- */}
      {showSettings && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }} onClick={() => setShowSettings(false)}>
          <div style={{ background: "white", padding: 20, borderRadius: 12, width: 400, maxHeight: "90vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0 }}>System Configurations</h2>

            <fieldset style={{ marginBottom: 15, padding: 10 }}>
              <legend><strong>Markdown Rules</strong></legend>
              <div style={{ marginBottom: 8 }}><label>5-3 days left (%): </label><input type="number" value={newDiscount5} onChange={(e) => setNewDiscount5(e.target.value)} style={{ width: 60, marginLeft: 8 }} /></div>
              <div style={{ marginBottom: 8 }}><label>3-2 days left (%): </label><input type="number" value={newDiscount3} onChange={(e) => setNewDiscount3(e.target.value)} style={{ width: 60, marginLeft: 8 }} /></div>
              <div style={{ marginBottom: 8 }}><label>2-1 days left (%): </label><input type="number" value={newDiscount2} onChange={(e) => setNewDiscount2(e.target.value)} style={{ width: 60, marginLeft: 8 }} /></div>
              <button onClick={saveDiscounts} style={{ cursor: "pointer" }}>Save Rules</button>
            </fieldset>

            <fieldset style={{ marginBottom: 15, padding: 10 }}>
              <legend><strong>Credential Rotations</strong></legend>
              <div style={{ marginBottom: 8 }}><label>New password: </label><input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={{ width: "100%", marginTop: 4 }} /></div>
              <div style={{ marginBottom: 8 }}><label>Confirm new password: </label><input type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} style={{ width: "100%", marginTop: 4 }} /></div>
              <button onClick={changePassword} style={{ cursor: "pointer" }}>Commit Rotation</button>
            </fieldset>

            <fieldset style={{ marginBottom: 15, padding: 10 }}>
              <legend><strong>Add Associate Operator</strong></legend>
              <div style={{ marginBottom: 8 }}><label>Username handle: </label><input value={newUsername} onChange={(e) => setNewUsername(e.target.value)} style={{ width: "100%", marginTop: 4 }} /></div>
              <div style={{ marginBottom: 8 }}><label>Password: </label><input type="password" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} style={{ width: "100%", marginTop: 4 }} /></div>
              <button onClick={addUser} style={{ cursor: "pointer" }}>Register Associate</button>
            </fieldset>

            {settingsMsg && <div style={{ color: "blue", marginTop: 10, fontSize: "12px" }}>{settingsMsg}</div>}
            <button onClick={() => setShowSettings(false)} style={{ marginTop: 10, cursor: "pointer" }}>Close Panel</button>
          </div>
        </div>
      )}

      {/* ---- ACTIVE INVENTORY TILES ---- */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8 }}>
        {sortedProducts.map((p) => {
          const idx = p._originalIndex;
          const days = getDaysLeft(p.expiry);
          return (
            <div key={p.id || idx} style={{ background: getColor(days), padding: 6, borderRadius: 6, position: "relative", fontSize: 12 }}>
              <button onClick={() => removeProduct(p.id, idx)} style={{ position: "absolute", top: 2, right: 4, cursor: "pointer", border: "1px solid #777", borderRadius: "3px" }}>
                x
              </button>

              <input value={p.name || ""} onChange={(e) => updateField(idx, "name", e.target.value, p)} style={{ fontWeight: "bold", width: "85%" }} />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3, marginTop: 4 }}>
                <div>Stock:</div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <input type="number" value={p.stock || 0} onChange={(e) => updateField(idx, "stock", e.target.value, p)} style={{ width: "45%" }} />
                    <button type="button" onClick={() => updateField(idx, "unit", "kg", p)} style={{ fontWeight: p.unit === "kg" ? "bold" : "normal", fontSize: 10, cursor: "pointer" }}>kg</button>
                    <button type="button" onClick={() => updateField(idx, "unit", "units", p)} style={{ fontWeight: p.unit === "units" ? "bold" : "normal", fontSize: 10, cursor: "pointer" }}>un</button>
                  </div>
                  <input type="range" min="0" max="200" value={p.stock || 0} onChange={(e) => handleSliderChange(idx, e.target.value, p)} style={{ width: "100%", marginTop: 2 }} />
                </div>

                <div>Sale ($):</div>
                <input type="number" step="0.01" value={p.sale_price || 0} onChange={(e) => updateField(idx, "sale_price", e.target.value, p)} style={{ width: "80%" }} />

                <div>Cost ($):</div>
                <input type="number" step="0.01" value={p.cost_price || 0} onChange={(e) => updateField(idx, "cost_price", e.target.value, p)} style={{ width: "80%" }} />

                <div>Expiry:</div>
                <input type="date" value={p.expiry || ""} onChange={(e) => updateField(idx, "expiry", e.target.value, p)} style={{ width: "95%" }} />

                <div>Days Left:</div>
                <div style={{ fontSize: "1.2em", fontWeight: "bold" }}>{days === Infinity ? "-" : days}</div>

                <div>Markdown suggested:</div>
                <div style={{ fontWeight: "600" }}>${suggestPrice(p, discounts)}</div>

                <div>Net Profit:</div>
                <div style={{ fontWeight: "600" }}>${calculateProfit(p)}</div>
              </div>
            </div>
          );
        })}

        <div onClick={addProduct} style={{ border: "2px dashed white", color: "white", display: "flex", alignItems: "center", justifyCenter: "center", justifyContent: "center", cursor: "pointer", borderRadius: 6, minHeight: 120 }}>
          + Add New Product
        </div>
      </div>
    </div>
  );
}
```