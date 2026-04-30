import React, { useState, useEffect } from "react";

// =======================
//  DEFAULT PRODUCT DATA
// =======================
const defaultProducts = [
  { name: "Apples - Braeburn", stock: 50, unit: "kg", salePrice: 3, costPrice: 1.5, expiry: "2026-05-05", sold: 0 },
  { name: "Apples - Granny Smith", stock: 40, unit: "kg", salePrice: 3.2, costPrice: 1.6, expiry: "2026-05-06", sold: 0 },
  { name: "Apples - Jazz", stock: 35, unit: "kg", salePrice: 3.5, costPrice: 1.8, expiry: "2026-05-04", sold: 0 },
  { name: "Apples - Envy", stock: 30, unit: "kg", salePrice: 4, costPrice: 2, expiry: "2026-05-07", sold: 0 },
  { name: "Mandarins", stock: 60, unit: "kg", salePrice: 2.8, costPrice: 1.4, expiry: "2026-05-03", sold: 0 },
  { name: "Bananas - Fair trade", stock: 45, unit: "kg", salePrice: 2.5, costPrice: 1.3, expiry: "2026-05-02", sold: 0 },
  { name: "Bananas - standard", stock: 70, unit: "kg", salePrice: 2.2, costPrice: 1.1, expiry: "2026-05-02", sold: 0 },
  { name: "Frozen Pie - Steak", stock: 25, unit: "units", salePrice: 6, costPrice: 3.5, expiry: "2026-06-01", sold: 0 },
  { name: "Frozen Pie - Chicken", stock: 25, unit: "units", salePrice: 6, costPrice: 3.5, expiry: "2026-06-01", sold: 0 }
];

// =======================
//  HELPER FUNCTIONS
// =======================

/** Calculate how many days remain before expiry */
function getDaysLeft(expiry) {
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

  const discounted = p.salePrice * (1 - discount);
  return Math.max(p.costPrice, discounted).toFixed(2);
}

/** Calculate real-time profit: (salePrice - costPrice) * sold */
function calculateProfit(p) {
  const sold = Number(p.sold || 0);
  const sale = Number(p.salePrice || 0);
  const cost = Number(p.costPrice || 0);

  return ((sale - cost) * sold).toFixed(2);
}

// =======================
//  MAIN APP COMPONENT
// =======================
export default function App() {
  // -----------------------
  //  STATE & PERSISTENCE
  // -----------------------
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem("products");
    return saved ? JSON.parse(saved) : defaultProducts;
  });

  // User accounts (default admin: jared / fruitandveg)
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem("users");
    return saved ? JSON.parse(saved) : [{ username: "jared", password: "fruitandveg" }];
  });

  // Discount settings (percentages as decimals)
  const [discounts, setDiscounts] = useState(() => {
    const saved = localStorage.getItem("discountSettings");
    return saved ? JSON.parse(saved) : { discount5: 0.05, discount3: 0.10, discount2: 0.20 };
  });

  // Authentication
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState("");
  const [loginError, setLoginError] = useState("");

  // Settings panel visibility
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

  // Persistence
  useEffect(() => {
    localStorage.setItem("products", JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem("users", JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem("discountSettings", JSON.stringify(discounts));
  }, [discounts]);

  // -----------------------
  //  LOGIN HANDLER
  // -----------------------
  const handleLogin = (e) => {
    e.preventDefault();
    const form = e.target;
    const username = form.username.value.trim();
    const password = form.password.value;

    const user = users.find(u => u.username === username && u.password === password);
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

  // -----------------------
  //  SETTINGS HANDLERS
  // -----------------------
  const saveDiscounts = () => {
    const d5 = parseFloat(newDiscount5) / 100 || 0;
    const d3 = parseFloat(newDiscount3) / 100 || 0;
    const d2 = parseFloat(newDiscount2) / 100 || 0;
    const updated = { discount5: d5, discount3: d3, discount2: d2 };
    setDiscounts(updated);
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
    if (users.some(u => u.username === newUsername.trim())) {
      setSettingsMsg("Username already exists.");
      return;
    }
    const updatedUsers = [...users, { username: newUsername.trim(), password: newUserPassword }];
    setUsers(updatedUsers);
    setNewUsername("");
    setNewUserPassword("");
    setSettingsMsg(`User "${newUsername.trim()}" added.`);
  };

  // -----------------------
  //  PRODUCT UPDATE HELPERS
  // -----------------------
  const updateField = (i, field, value) => {
    const updated = [...products];

    if (["stock", "salePrice", "costPrice", "sold"].includes(field)) {
      value = Math.max(0, Number(value));
    }

    if (field === "expiry") {
      const d = new Date(value);
      if (isNaN(d.getTime())) return;
    }

    updated[i][field] = value;
    setProducts(updated);
  };

  /** When stock is reduced via slider, increase sold count automatically */
  const handleSliderChange = (i, newStock) => {
    const updated = [...products];
    const oldStock = Number(updated[i].stock) || 0;
    const newStockNum = Number(newStock);

    if (newStockNum < oldStock) {
      const decrease = oldStock - newStockNum;
      updated[i].sold = (Number(updated[i].sold) || 0) + decrease;
    }

    updated[i].stock = newStockNum;
    setProducts(updated);
  };

  const addProduct = () => {
    setProducts([
      ...products,
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

  const removeProduct = (i) => {
    const updated = [...products];
    updated.splice(i, 1);
    setProducts(updated);
  };

  // Vibrant colour mapping based on days until expiry
  const getColor = (days) => {
    // More vibrant colours: bright red, gold, and bright green
    if (days <= 1) return "#ff4444"; // vivid red
    if (days <= 3) return "#ffd700"; // vibrant gold
    return "#33cc33";                // lively green
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
          <h2>Login</h2>
          <div style={{ marginBottom: 10 }}>
            <input name="username" placeholder="Username" required style={{ padding: 8, width: "100%" }} />
          </div>
          <div style={{ marginBottom: 10 }}>
            <input name="password" type="password" placeholder="Password" required style={{ padding: 8, width: "100%" }} />
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
        // Reduce background vibrancy so the colourful product tiles pop
        filter: "saturate(0.2) brightness(0.8)"
      }}
    >
      {/* ---- HEADER WITH SETTINGS COG & LOGOUT ---- */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 15 }}>
        <div
          style={{
            background: "rgba(255, 255, 255, 0.75)",
            padding: "10px 16px",
            borderRadius: 10,
            border: "1px solid rgba(0,0,0,0.1)",
            backdropFilter: "blur(4px)"
          }}
        >
          <h1 style={{ margin: 0 }}>Stock Sage</h1>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ background: "rgba(255,255,255,0.8)", padding: "6px 12px", borderRadius: 8 }}>
            👤 {currentUser}
          </div>
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

            {/* Discount percentages */}
            <fieldset style={{ marginBottom: 15, padding: 10 }}>
              <legend><strong>Price Reduction Percentages</strong></legend>
              <div style={{ marginBottom: 8 }}>
                <label>5‑3 days left (%): </label>
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
                <label>3‑2 days left (%): </label>
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
                <label>2‑1 days left (%): </label>
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

            {/* Change Password */}
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

            {/* Add User */}
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
          // Responsive grid: tiles automatically adjust to fill the row
          // Minimum tile width is 200px, they expand to fill available space
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 8
        }}
      >
        {products.map((p, i) => {
          const days = getDaysLeft(p.expiry);
          return (
            <div
              key={i}
              style={{
                background: getColor(days),
                padding: 6,
                borderRadius: 6,
                position: "relative",
                fontSize: 12
              }}
            >
              <button
                onClick={() => removeProduct(i)}
                style={{ position: "absolute", top: 2, right: 4 }}
              >
                x
              </button>

              <input
                value={p.name}
                onChange={(e) => updateField(i, "name", e.target.value)}
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
                      onChange={(e) => updateField(i, "stock", e.target.value)}
                      style={{ width: "50%" }}
                    />
                    <button
                      type="button"
                      onClick={() => updateField(i, "unit", "kg")}
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
                      onClick={() => updateField(i, "unit", "units")}
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
                    onChange={(e) => handleSliderChange(i, Number(e.target.value))}
                    style={{ width: "100%", marginTop: 2 }}
                  />
                </div>

                {/* ---- CURRENCY FORMAT for Sale Price ---- */}
                <div>Sale:</div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span style={{ marginRight: 2 }}>$</span>
                  <input
                  type="number"
                  step="0.01"
                  value={Number(p.salePrice).toFixed(2)}
                  onChange={(e) => updateField(i, "salePrice", parseFloat(e.target.value) || 0)}
                  style={{ width: "50%" }}
                  />
                </div>

                {/* ---- CURRENCY FORMAT for Cost Price ---- */}
                <div>Cost:</div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span style={{ marginRight: 2 }}>$</span>
                  <input
                  type="number"
                  step="0.01"
                  value={Number(p.costPrice).toFixed(2)}
                  onChange={(e) => updateField(i, "costPrice", parseFloat(e.target.value) || 0)}
                  style={{ width: "50%" }}
                  />
                </div>

                <div>Expiry:</div>
                <input
                  type="date"
                  value={p.expiry}
                  onChange={(e) => updateField(i, "expiry", e.target.value)}
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
        })}

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