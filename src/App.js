import React, { useState, useEffect, useCallback, memo } from "react";
import { defaultProducts } from "./defaultProducts";
import { getDaysLeft, suggestPrice, calculateProfit } from "./stockHelpers";
import { getUserGuideHTML } from "./userGuide";

// --------------------------------------------------
//  HELPERS
// --------------------------------------------------
const getColor = (days) => {
  if (days <= 1) return "#ff3b30"; 
  if (days <= 3) return "#ffcc00"; 
  return "#34c759";               
};

// --------------------------------------------------
//  MEMOIZED PRODUCT CARD COMPONENT
// --------------------------------------------------
// React.memo prevents this component from re-rendering unless its props change.
const ProductCard = memo(({ p, originalIndex, updateField, removeProduct, handleSliderChange, discounts }) => {
  const days = getDaysLeft(p.expiry);

  return (
    <div
      style={{
        background: getColor(days),
        padding: 6,
        borderRadius: 6,
        position: "relative",
        fontSize: 12
      }}
    >
      <button
        onClick={() => removeProduct(originalIndex)}
        style={{ position: "absolute", top: 2, right: 4 }}
      >
        x
      </button>

      <input
        value={p.name}
        onChange={(e) => updateField(originalIndex, "name", e.target.value)}
        style={{ fontWeight: "bold" }}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 3,
          marginTop: 4
        }}
      >
        <div>Stock:</div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <input
              type="number"
              value={p.stock}
              onChange={(e) => updateField(originalIndex, "stock", e.target.value)}
              style={{ width: "50%" }}
            />
            <button
              type="button"
              onClick={() => updateField(originalIndex, "unit", "kg")}
              style={{
                fontWeight: p.unit === "kg" ? "bold" : "normal",
                background: p.unit === "kg" ? "#d1d5db" : "#f3f4f6",
                border: "1px solid #9ca3af",
                borderRadius: 4,
                padding: "1px 4px",
                cursor: "pointer",
                fontSize: 10
              }}
            >
              kg
            </button>
            <button
              type="button"
              onClick={() => updateField(originalIndex, "unit", "units")}
              style={{
                fontWeight: p.unit === "units" ? "bold" : "normal",
                background: p.unit === "units" ? "#d1d5db" : "#f3f4f6",
                border: "1px solid #9ca3af",
                borderRadius: 4,
                padding: "1px 4px",
                cursor: "pointer",
                fontSize: 10
              }}
            >
              units
            </button>
          </div>
          <input
            type="range"
            min="0"
            max="200"
            value={p.stock}
            onChange={(e) => handleSliderChange(originalIndex, Number(e.target.value))}
            style={{ width: "100%", marginTop: 2 }}
          />
        </div>

        {/* Sale Price */}
        <div>Sale:</div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={{ marginRight: 2 }}>$</span>
          <input
            type="number"
            step="0.01"
            value={Number(p.salePrice).toFixed(2)}
            onChange={(e) => updateField(originalIndex, "salePrice", parseFloat(e.target.value) || 0)}
            style={{ width: "50%" }}
          />
        </div>

        {/* Cost Price */}
        <div>Cost:</div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={{ marginRight: 2 }}>$</span>
          <input
            type="number"
            step="0.01"
            value={Number(p.costPrice).toFixed(2)}
            onChange={(e) => updateField(originalIndex, "costPrice", parseFloat(e.target.value) || 0)}
            style={{ width: "50%" }}
          />
        </div>

        <div>Expiry:</div>
        <input
          type="date"
          value={p.expiry}
          onChange={(e) => updateField(originalIndex, "expiry", e.target.value)}
        />

        <div>Days to go:</div>
        <div style={{ fontSize: "1.3em", fontWeight: "bold" }}>
          {p.expiry ? `${getDaysLeft(p.expiry)}` : "-"}
        </div>

        <div>Suggested Next Price:</div>
        <div>${suggestPrice(p, discounts)}</div>

        <div>Profit:</div>
        <div>${calculateProfit(p)}</div>
      </div>
    </div>
  );
});

export default function App() {
  // -----------------------
  //  STATE & PERSISTENCE
  // -----------------------
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem("products");
    return saved ? JSON.parse(saved) : defaultProducts;
  });

  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem("users");
    return saved ? JSON.parse(saved) : [{ username: "jared", password: "fruitandveg" }];
  });

  const [discounts, setDiscounts] = useState(() => {
    const saved = localStorage.getItem("discountSettings");
    return saved ? JSON.parse(saved) : { discount5: 0.05, discount3: 0.10, discount2: 0.20 };
  });

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Settings form states
  const [newDiscount5, setNewDiscount5] = useState((discounts.discount5 * 100).toString());
  const [newDiscount3, setNewDiscount3] = useState((discounts.discount3 * 100).toString());
  const [newDiscount2, setNewDiscount2] = useState((discounts.discount2 * 100).toString());
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [settingsMsg, setSettingsMsg] = useState("");

  const [sortBy, setSortBy] = useState("default");

  useEffect(() => {
    localStorage.setItem("products", JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem("users", JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem("discountSettings", JSON.stringify(discounts));
  }, [discounts]);

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

  const handleLogin = (e) => {
    e.preventDefault();
    const form = e.target;
    const username = form.username.value.trim();
    const password = form.password.value;

    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
    if (user) {
      setIsLoggedIn(true);
      setCurrentUser(username);
      setLoginError("");
    } else {
      setLoginError("Invalid username or password");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser("");
    setShowSettings(false);
  };

  const saveDiscounts = () => {
    const d5 = parseFloat(newDiscount5) / 100 || 0;
    const d3 = parseFloat(newDiscount3) / 100 || 0;
    const d2 = parseFloat(newDiscount2) / 100 || 0;
    setDiscounts({ discount5: d5, discount3: d3, discount2: d2 });
    setSettingsMsg("Discount percentages saved.");
  };

  const changePassword = () => {
    const user = users.find(u => u.username === currentUser);
    if (!user || user.password !== currentPassword) {
      setSettingsMsg("Current password is incorrect.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setSettingsMsg("New passwords do not match.");
      return;
    }
    if (newPassword.length < 1) {
      setSettingsMsg("Password cannot be empty.");
      return;
    }
    const updatedUsers = users.map(u =>
      u.username === currentUser ? { ...u, password: newPassword } : u
    );
    setUsers(updatedUsers);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setSettingsMsg("Password changed successfully.");
  };

  const addUser = () => {
    if (!newUsername.trim() || !newUserPassword.trim()) {
      setSettingsMsg("Username and password are required.");
      return;
    }
    if (users.some(u => u.username.toLowerCase() === newUsername.trim().toLowerCase())) {
      setSettingsMsg("Username already exists.");
      return;
    }
    setUsers([...users, { username: newUsername.trim(), password: newUserPassword }]);
    setNewUsername("");
    setNewUserPassword("");
    setSettingsMsg(`User "${newUsername.trim()}" added.`);
  };

  // -----------------------
  //  PRODUCT UPDATE HELPERS (Memoized with useCallback)
  // -----------------------
  const updateField = useCallback((i, field, value) => {
    setProducts((prev) => {
      const updated = [...prev];
      let newValue = value;

      if (["stock", "salePrice", "costPrice", "sold"].includes(field)) {
        newValue = Math.max(0, Number(value));
      }

      if (field === "expiry") {
        const d = new Date(value);
        if (isNaN(d.getTime())) return prev;
      }

      let newSold = Number(updated[i].sold) || 0;
      if (field === "stock") {
        const oldStock = Number(updated[i].stock) || 0;
        const newStock = Number(newValue);
        if (newStock < oldStock) {
          newSold += (oldStock - newStock);
        }
      }

      // Create a new object reference for the modified product so React.memo catches it
      updated[i] = { 
        ...updated[i], 
        [field]: newValue,
        ...(field === 'stock' ? { sold: newSold } : {})
      };
      
      return updated;
    });
  }, []);

  const handleSliderChange = useCallback((i, newStock) => {
    setProducts((prev) => {
      const updated = [...prev];
      const oldStock = Number(updated[i].stock) || 0;
      const newStockNum = Number(newStock);
      let newSold = Number(updated[i].sold) || 0;

      if (newStockNum < oldStock) {
        newSold += (oldStock - newStockNum);
      }

      // Create a new object reference
      updated[i] = { ...updated[i], stock: newStockNum, sold: newSold };
      return updated;
    });
  }, []);

  const removeProduct = useCallback((i) => {
    setProducts((prev) => {
      const updated = [...prev];
      updated.splice(i, 1);
      return updated;
    });
  }, []);

  const addProduct = () => {
    setProducts((prev) => [
      ...prev,
      {
        name: "",
        stock: 0,
        unit: "kg",
        salePrice: 0,
        costPrice: 0,
        expiry: "",
        sold: 0
      }
    ]);
  };

  // --------------------------------------------------
  //  SORTING LOGIC
  // --------------------------------------------------
  const sortedProducts = (() => {
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
  })();

  const stockSageTitleStyle = {
    fontFamily: "'Playfair Display', serif",
    fontWeight: 700,
    fontSize: "2em",
    letterSpacing: "1px",
    margin: 0
  };

  // =======================
  //  LOGIN SCREEN
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
          <h2 style={{ marginTop: 10 }}>Login</h2>
          <div style={{ marginBottom: 10 }}>
            <input name="username" placeholder="Username" required style={{ padding: 8, width: "100%" }} />
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
          {loginError && <div style={{ color: "red", marginBottom: 8 }}>{loginError}</div>}
          <button type="submit" style={{ padding: "8px 20px", cursor: "pointer" }}>Sign In</button>
        </form>
      </div>
    );
  }

  // =======================
  //  MAIN APP (LOGGED IN)
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
      {/* ---- HEADER ---- */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 15 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div
            style={{
              background: "rgba(255, 255, 255, 0.75)",
              padding: "10px 16px",
              borderRadius: 10,
              border: "1px solid rgba(0,0,0,0.1)",
              backdropFilter: "blur(4px)"
            }}
          >
            <h1 style={stockSageTitleStyle}>Stock Sage</h1>
          </div>
          <button
            onClick={openUserGuide}
            title="Open User Guide"
            style={{
              background: "#1a1a2e",
              color: "white",
              border: "none",
              borderRadius: 8,
              padding: "10px 18px",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: "0.5px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
              transition: "background 0.2s"
            }}
            onMouseEnter={(e) => e.target.style.background = "#2d2d44"}
            onMouseLeave={(e) => e.target.style.background = "#1a1a2e"}
          >
            📖 User Guide
          </button>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ background: "rgba(255,255,255,0.8)", padding: "6px 12px", borderRadius: 8 }}>
            👤 {currentUser}
          </div>
          <button
            onClick={() => setSortBy("alpha")}
            title="Sort alphabetically (A‑Z)"
            style={{
              background: sortBy === "alpha" ? "#e0e7ff" : "white",
              border: "1px solid #aaa",
              borderRadius: 8,
              padding: "6px 10px",
              cursor: "pointer",
              fontSize: 16,
              fontWeight: sortBy === "alpha" ? "bold" : "normal"
            }}
          >
            A‑Z
          </button>
          <button
            onClick={() => setSortBy("expiry")}
            title="Sort by days to go (lowest first)"
            style={{
              background: sortBy === "expiry" ? "#e0e7ff" : "white",
              border: "1px solid #aaa",
              borderRadius: 8,
              padding: "6px 10px",
              cursor: "pointer",
              fontSize: 16,
              fontWeight: sortBy === "expiry" ? "bold" : "normal"
            }}
          >
            ⏳
          </button>
          <button
            onClick={() => setShowSettings(true)}
            title="Settings"
            style={{
              background: "white",
              border: "1px solid #aaa",
              borderRadius: 8,
              padding: "6px 10px",
              cursor: "pointer",
              fontSize: 18
            }}
          >
            ⚙️
          </button>
          <button
            onClick={handleLogout}
            style={{
              background: "#f3f4f6",
              border: "1px solid #aaa",
              borderRadius: 8,
              padding: "6px 12px",
              cursor: "pointer"
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* ---- SETTINGS MODAL ---- */}
      {showSettings && (
        <div
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000
          }}
          onClick={() => setShowSettings(false)}
        >
          <div
            style={{
              background: "white",
              padding: 20,
              borderRadius: 12,
              width: 400,
              maxHeight: "90vh",
              overflowY: "auto"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginTop: 0 }}>Settings</h2>
            <fieldset style={{ marginBottom: 15, padding: 10 }}>
              <legend><strong>Price Reduction Percentages</strong></legend>
              <div style={{ marginBottom: 8 }}>
                <label>5-3 days left (%): </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={newDiscount5}
                  onChange={(e) => setNewDiscount5(e.target.value)}
                  style={{ width: 60, marginLeft: 8 }}
                />
              </div>
              <div style={{ marginBottom: 8 }}>
                <label>3-2 days left (%): </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={newDiscount3}
                  onChange={(e) => setNewDiscount3(e.target.value)}
                  style={{ width: 60, marginLeft: 8 }}
                />
              </div>
              <div style={{ marginBottom: 8 }}>
                <label>2-1 days left (%): </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={newDiscount2}
                  onChange={(e) => setNewDiscount2(e.target.value)}
                  style={{ width: 60, marginLeft: 8 }}
                />
              </div>
              <button onClick={saveDiscounts} style={{ cursor: "pointer" }}>Save Discounts</button>
            </fieldset>

            <fieldset style={{ marginBottom: 15, padding: 10 }}>
              <legend><strong>Change Password</strong></legend>
              <div style={{ marginBottom: 8 }}>
                <label>Current password: </label>
                <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} style={{ width: "100%", marginTop: 4 }} />
              </div>
              <div style={{ marginBottom: 8 }}>
                <label>New password: </label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={{ width: "100%", marginTop: 4 }} />
              </div>
              <div style={{ marginBottom: 8 }}>
                <label>Confirm new password: </label>
                <input type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} style={{ width: "100%", marginTop: 4 }} />
              </div>
              <button onClick={changePassword} style={{ cursor: "pointer" }}>Update Password</button>
            </fieldset>

            <fieldset style={{ marginBottom: 15, padding: 10 }}>
              <legend><strong>Add New User</strong></legend>
              <div style={{ marginBottom: 8 }}>
                <label>New username: </label>
                <input value={newUsername} onChange={(e) => setNewUsername(e.target.value)} style={{ width: "100%", marginTop: 4 }} />
              </div>
              <div style={{ marginBottom: 8 }}>
                <label>Password: </label>
                <input type="password" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} style={{ width: "100%", marginTop: 4 }} />
              </div>
              <button onClick={addUser} style={{ cursor: "pointer" }}>Add User</button>
            </fieldset>

            {settingsMsg && <div style={{ color: "green", marginTop: 10 }}>{settingsMsg}</div>}
            <button onClick={() => setShowSettings(false)} style={{ marginTop: 10, cursor: "pointer" }}>Close</button>
          </div>
        </div>
      )}

      {/* ---- PRODUCT GRID ---- */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 8
        }}
      >
        {sortedProducts.map((p) => (
          <ProductCard
            // Always use a reliable key. Since items can be sorted/removed, 
            // _originalIndex serves as our stable ID mapping for now.
            key={p._originalIndex}
            p={p}
            originalIndex={p._originalIndex}
            updateField={updateField}
            handleSliderChange={handleSliderChange}
            removeProduct={removeProduct}
            discounts={discounts}
          />
        ))}

        <div
          onClick={addProduct}
          style={{
            border: "2px dashed white",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            borderRadius: 6,
            minHeight: 100
          }}
        >
          + Add New Product
        </div>
      </div>
    </div>
  );
}