import React, { useState, useEffect, useCallback, useMemo } from "react";
import "./App.css";
import { defaultProducts } from "./defaultProducts";
import { getDaysLeft, suggestPrice, calculateProfit } from "./stockHelpers";
import { getUserGuideHTML } from "./userGuide";
import { supabase } from "./supabaseClient";

// --------------------------------------------------
//  HELPERS
// --------------------------------------------------
const getCardColorClass = (days) => {
  if (days <= 1) return "cardRed";
  if (days <= 3) return "cardYellow";
  return "cardGreen";
};

// --------------------------------------------------
//  PRODUCT CARD COMPONENT
// --------------------------------------------------
const ProductCard = React.memo(({ p, originalIndex, updateField, removeProduct, discounts }) => {
  const days = getDaysLeft(p.expiry);
  const colorClass = getCardColorClass(days);

  return (
    <div className={`productCard ${colorClass}`}>
      <div className="deleteBtnWrapper">
        <button className="btnDanger" onClick={() => removeProduct(originalIndex)}>x</button>
      </div>

      <input
        className="cardInput productTitleInput"
        value={p.name}
        onChange={(e) => updateField(originalIndex, "name", e.target.value)}
        placeholder="Product Name"
      />

      <div className="cardDetailsGrid">
        <div>Product remaining:</div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "4px" }}>
            <input
              className="cardInput"
              type="number"
              value={p.stock}
              max={p.sold > 0 ? p.stock : undefined}
              onChange={(e) => updateField(originalIndex, "stock", e.target.value)}
              style={{ width: "60%" }}
            />
            <button
              type="button"
              className={`btn btnUnit ${p.unit === "kg" ? "active" : ""}`}
              onClick={() => updateField(originalIndex, "unit", "kg")}
            >
              kg
            </button>
            <button
              type="button"
              className={`btn btnUnit ${p.unit === "units" ? "active" : ""}`}
              onClick={() => updateField(originalIndex, "unit", "units")}
            >
              units
            </button>
          </div>
        </div>

        <div>Sale Price:</div>
        <div className="priceInputWrapper">
          <span>$</span>
          <input
            className="cardInput"
            type="number"
            step="0.01"
            value={Number(p.salePrice).toFixed(2)}
            onChange={(e) => updateField(originalIndex, "salePrice", parseFloat(e.target.value) || 0)}
          />
        </div>

        <div>Cost Price:</div>
        <div className="priceInputWrapper">
          <span>$</span>
          <input
            className="cardInput"
            type="number"
            step="0.01"
            value={Number(p.costPrice).toFixed(2)}
            onChange={(e) => updateField(originalIndex, "costPrice", parseFloat(e.target.value) || 0)}
          />
        </div>

        <div>Expiry date:</div>
        <input
          className="cardInput"
          type="date"
          value={p.expiry}
          onChange={(e) => updateField(originalIndex, "expiry", e.target.value)}
        />

        <div>Days until expiry:</div>
        <div className="daysToGo">
          {p.expiry ? `${getDaysLeft(p.expiry)}` : "-"}
        </div>

        <div>Suggested new price:</div>
        <div style={{ fontWeight: "bold", display: "flex", gap: "8px", alignItems: "center" }}>
          ${suggestPrice(p, discounts)}
          <button 
            className="btn btnUnit"
            onClick={() => updateField(originalIndex, "salePrice", suggestPrice(p, discounts))}
          >
            Apply
          </button>
        </div>

        <div>Profit on this item:</div>
        <div style={{ fontWeight: "bold" }}>${calculateProfit(p)}</div>
      </div>
    </div>
  );
});

// --------------------------------------------------
//  MAIN APP
// --------------------------------------------------
export default function App() {
  // -----------------------
  //  STATE
  // -----------------------
  const [products, setProducts] = useState([]);
  const [discounts, setDiscounts] = useState({ discount5: 0.05, discount3: 0.10, discount2: 0.20 });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loginError, setLoginError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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

  // -----------------------
  //  DATA FETCHING FROM SUPABASE
  // -----------------------
  const fetchSettings = useCallback(async () => {
    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .maybeSingle();
    if (error) {
      console.error("Error fetching settings:", error);
      return;
    }
    if (data) {
      setDiscounts({
        discount5: data.discount5,
        discount3: data.discount3,
        discount2: data.discount2,
      });
      setNewDiscount5((data.discount5 * 100).toString());
      setNewDiscount3((data.discount3 * 100).toString());
      setNewDiscount2((data.discount2 * 100).toString());
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) {
      console.error("Error fetching products:", error);
      return;
    }
    if (data && data.length === 0) {
      // Seed default products
      const { error: insertError } = await supabase.from("products").insert(
        defaultProducts.map((p) => ({
          name: p.name,
          stock: p.stock,
          unit: p.unit,
          sale_price: p.salePrice,
          cost_price: p.costPrice,
          expiry: p.expiry,
          sold: p.sold,
          revenue: p.revenue || 0,
        }))
      );
      if (insertError) {
        console.error("Error seeding default products:", insertError);
      } else {
        // Refetch after seeding
        const { data: newData, error: refetchError } = await supabase
          .from("products")
          .select("*")
          .order("created_at", { ascending: true });
        if (!refetchError && newData) {
          setProducts(newData);
        }
        return;
      }
    }
    if (data) {
      setProducts(data);
    }
  }, []);

  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([fetchSettings(), fetchProducts()]);
    setIsLoading(false);
  }, [fetchSettings, fetchProducts]);

  // -----------------------
  //  AUTHENTICATION
  // -----------------------
  const handleLogin = async (e) => {
    e.preventDefault();
    const form = e.target;
    const email = form.username.value.trim(); // treat as email
    const password = form.password.value;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoginError(error.message);
      return;
    }
    if (data.user) {
      setIsLoggedIn(true);
      setCurrentUser(data.user);
      setLoginError("");
      await loadInitialData();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setCurrentUser(null);
    setShowSettings(false);
  };

  // Check session on mount and listen for auth changes
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setIsLoggedIn(true);
        setCurrentUser(session.user);
        await loadInitialData();
      } else {
        setIsLoading(false);
      }
    };
    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setIsLoggedIn(true);
        setCurrentUser(session.user);
        await loadInitialData();
      } else if (event === "SIGNED_OUT") {
        setIsLoggedIn(false);
        setCurrentUser(null);
        setProducts([]);
        setIsLoading(false);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [loadInitialData]);

  // -----------------------
  //  SETTINGS OPERATIONS
  // -----------------------
  const saveDiscounts = async () => {
    const d5 = parseFloat(newDiscount5) / 100 || 0;
    const d3 = parseFloat(newDiscount3) / 100 || 0;
    const d2 = parseFloat(newDiscount2) / 100 || 0;

    // Get the settings row id (there should be only one)
    const { data: settingsData, error: fetchError } = await supabase
      .from("settings")
      .select("id")
      .maybeSingle();
    if (fetchError || !settingsData) {
      setSettingsMsg("Failed to fetch settings ID");
      return;
    }

    const { error } = await supabase
      .from("settings")
      .update({ discount5: d5, discount3: d3, discount2: d2 })
      .eq("id", settingsData.id);

    if (error) {
      setSettingsMsg("Failed to save discounts: " + error.message);
    } else {
      setDiscounts({ discount5: d5, discount3: d3, discount2: d2 });
      setSettingsMsg("Discount percentages saved.");
    }
  };

  const changePassword = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setSettingsMsg("Please fill in all password fields.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setSettingsMsg("New passwords do not match.");
      return;
    }
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) {
      setSettingsMsg("Failed to change password: " + error.message);
    } else {
      setSettingsMsg("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    }
  };

  const addUser = async () => {
    const email = newUsername.trim();
    const password = newUserPassword.trim();
    if (!email || !password) {
      setSettingsMsg("Email and password are required.");
      return;
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      setSettingsMsg("Failed to add user: " + error.message);
    } else {
      setSettingsMsg(`User "${email}" added. They can now log in.`);
      setNewUsername("");
      setNewUserPassword("");
    }
  };

  // -----------------------
  //  PRODUCT CRUD (with Supabase sync)
  // -----------------------
  const syncProductToDb = useCallback(async (product) => {
    if (!product.id) return; // not yet persisted
    const { error } = await supabase
      .from("products")
      .update({
        name: product.name,
        stock: product.stock,
        unit: product.unit,
        sale_price: product.salePrice,
        cost_price: product.costPrice,
        expiry: product.expiry,
        sold: product.sold,
        revenue: product.revenue,
      })
      .eq("id", product.id);
    if (error) {
      console.error("Failed to sync product:", error);
    }
  }, []);

  const updateField = useCallback((index, field, value) => {
    // Optimistically update local state, then sync to DB
    setProducts((prev) => {
      const updated = [...prev];
      const oldProduct = updated[index];
      let newValue = value;

      if (["stock", "salePrice", "costPrice", "sold", "revenue"].includes(field)) {
        newValue = Math.max(0, Number(value));
      }

      if (field === "expiry") {
        const d = new Date(value);
        if (isNaN(d.getTime())) return prev;
      }

      let newSold = Number(oldProduct.sold) || 0;
      let newRevenue = Number(oldProduct.revenue) || 0;

      if (field === "stock") {
        const oldStock = Number(oldProduct.stock) || 0;
        const newStock = Number(newValue);

        // Logic Enforcement: Prevent stock increases if items have already been sold
        if (newStock > oldStock && newSold > 0) {
          return prev; // Reject the state change
        }

        // Logic update: Track cumulative revenue at the CURRENT sale price
        if (newStock < oldStock) {
          const amountSold = oldStock - newStock;
          newSold += amountSold;
          newRevenue += (amountSold * Number(oldProduct.salePrice));
        }
      }

      const updatedProduct = {
        ...oldProduct,
        [field]: newValue,
        ...(field === "stock" ? { sold: newSold, revenue: newRevenue } : {}),
      };
      updated[index] = updatedProduct;

      // Sync to Supabase
      syncProductToDb(updatedProduct);

      return updated;
    });
  }, [syncProductToDb]);

  const removeProduct = useCallback(async (index) => {
    const productToRemove = products[index];
    if (!productToRemove.id) {
      // If it's an unsaved product, just remove locally
      setProducts((prev) => prev.filter((_, i) => i !== index));
      return;
    }
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productToRemove.id);
    if (error) {
      console.error("Failed to delete product:", error);
      return;
    }
    setProducts((prev) => prev.filter((_, i) => i !== index));
  }, [products]);

  const addProduct = useCallback(async () => {
    const newProduct = {
      name: "",
      stock: 0,
      unit: "kg",
      sale_price: 0,
      cost_price: 0,
      expiry: "",
      sold: 0,
      revenue: 0,
    };
    const { data, error } = await supabase
      .from("products")
      .insert([newProduct])
      .select();
    if (error) {
      console.error("Failed to add product:", error);
      return;
    }
    if (data && data.length > 0) {
      setProducts((prev) => [...prev, data[0]]);
    }
  }, []);

  // ------------------------
  //  SORTING LOGIC
  // -----------------------
  const sortedProducts = useMemo(() => {
    const withIndex = products.map((p, idx) => ({ ...p, _originalIndex: idx }));
    if (sortBy === "alpha") {
      return withIndex.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "expiry") {
      return withIndex.sort((a, b) => {
        const daysA = getDaysLeft(a.expiry) || Infinity;
        const daysB = getDaysLeft(b.expiry) || Infinity;
        return daysA - daysB;
      });
    } else {
      return withIndex;
    }
  }, [products, sortBy]);

  // -----------------------
  //  USER GUIDE
  // -----------------------
  const openUserGuide = () => {
    const guideWindow = window.open("", "StockSageUserGuide", "width=900,height=700,scrollbars=yes,resizable=yes");
    if (guideWindow) {
      guideWindow.document.write(getUserGuideHTML());
      guideWindow.document.close();
    }
  };

  // Load Playfair font
  useEffect(() => {
    if (!document.getElementById("playfair-font-link")) {
      const link = document.createElement("link");
      link.id = "playfair-font-link";
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  // =======================
  //  LOGIN SCREEN
  // =======================
  if (!isLoggedIn) {
    return (
      <div className="loginContainer">
        <form onSubmit={handleLogin} className="loginForm">
          <h1 className="title">Stock Sage</h1>
          <h2>Login</h2>
          <div className="inputGroup">
            <input className="formInput" name="username" placeholder="Email" required />
          </div>
          <div className="inputGroup passwordWrapper">
            <input
              className="formInput"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              required
            />
            <button type="button" className="btn" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          {loginError && <div className="errorText">{loginError}</div>}
          <button type="submit" className="btn btnPrimary" style={{ width: "100%", marginTop: "10px" }}>
            Sign In
          </button>
        </form>
      </div>
    );
  }

  // =======================
  //  MAIN APP (LOGGED IN)
  // =======================
  if (isLoading) {
    return (
      <div className="loginContainer" style={{ color: "white" }}>
        Loading...
      </div>
    );
  }

  return (
    <div className="appContainer">
      {/* ---- HEADER ---- */}
      <div className="header">
        <div className="headerLeft">
          <div className="titleBox">
            <h1 className="title">Stock Sage</h1>
          </div>
          <button onClick={openUserGuide} title="Open User Guide" className="btnPrimary">
            📖 User Guide
          </button>
        </div>
        <div className="headerRight">
          <div className="userBadge">👤 {currentUser?.email}</div>
          <button
            onClick={() => setSortBy("alpha")}
            title="Sort alphabetically (A‑Z)"
            className={`btn btnSort ${sortBy === "alpha" ? "active" : ""}`}
          >
            A‑Z
          </button>
          <button
            onClick={() => setSortBy("expiry")}
            title="Sort by days to go (lowest first)"
            className={`btn btnSort ${sortBy === "expiry" ? "active" : ""}`}
          >
            ⏳
          </button>
          <button onClick={() => setShowSettings(true)} title="Settings" className="btn btnIcon">
            ⚙️
          </button>
          <button onClick={handleLogout} className="btn">
            Logout
          </button>
        </div>
      </div>

      {/* ---- SETTINGS MODAL ---- */}
      {showSettings && (
        <div className="modalOverlay" onClick={() => setShowSettings(false)}>
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0 }}>Settings</h2>

            <fieldset>
              <legend>Price Reduction Percentages</legend>
              <div className="inputGroup">
                <label>5-3 days left (%): </label>
                <input
                  className="formInput"
                  type="number"
                  min="0"
                  max="100"
                  value={newDiscount5}
                  onChange={(e) => setNewDiscount5(e.target.value)}
                />
              </div>
              <div className="inputGroup">
                <label>3-2 days left (%): </label>
                <input
                  className="formInput"
                  type="number"
                  min="0"
                  max="100"
                  value={newDiscount3}
                  onChange={(e) => setNewDiscount3(e.target.value)}
                />
              </div>
              <div className="inputGroup">
                <label>2-1 days left (%): </label>
                <input
                  className="formInput"
                  type="number"
                  min="0"
                  max="100"
                  value={newDiscount2}
                  onChange={(e) => setNewDiscount2(e.target.value)}
                />
              </div>
              <button onClick={saveDiscounts} className="btn btnPrimary">
                Save Discounts
              </button>
            </fieldset>

            <fieldset>
              <legend>Change Password</legend>
              <div className="inputGroup">
                <label>Current password: </label>
                <input
                  className="formInput"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div className="inputGroup">
                <label>New password: </label>
                <input
                  className="formInput"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="inputGroup">
                <label>Confirm new password: </label>
                <input
                  className="formInput"
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                />
              </div>
              <button onClick={changePassword} className="btn btnPrimary">
                Update Password
              </button>
            </fieldset>

            <fieldset>
              <legend>Add New User</legend>
              <div className="inputGroup">
                <label>Email (username): </label>
                <input
                  className="formInput"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="user@example.com"
                />
              </div>
              <div className="inputGroup">
                <label>Password: </label>
                <input
                  className="formInput"
                  type="password"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                />
              </div>
              <button onClick={addUser} className="btn btnPrimary">
                Add User
              </button>
            </fieldset>

            {settingsMsg && <div className="settingsMessage">{settingsMsg}</div>}
            <button
              onClick={() => setShowSettings(false)}
              className="btn"
              style={{ width: "100%", marginTop: "10px" }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ---- PRODUCT GRID ---- */}
      <div className="productGrid">
        {sortedProducts.map((p) => (
          <ProductCard
            key={p.id || p._originalIndex}
            p={p}
            originalIndex={p._originalIndex}
            updateField={updateField}
            removeProduct={removeProduct}
            discounts={discounts}
          />
        ))}
        <div onClick={addProduct} className="addProductBtn">
          + Add New Product
        </div>
      </div>
    </div>
  );
}