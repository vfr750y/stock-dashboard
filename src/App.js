import React, { useState, useEffect, useCallback, memo } from "react";
import "./App.css"; // IMPORTANT: Import your new stylesheet here
import { defaultProducts } from "./defaultProducts";
import { getDaysLeft, suggestPrice, calculateProfit } from "./stockHelpers";
import { getUserGuideHTML } from "./userGuide";

// --------------------------------------------------
//  HELPERS
// --------------------------------------------------
const getCardColorClass = (days) => {
  if (days <= 1) return "cardRed";
  if (days <= 3) return "cardYellow";
  return "cardGreen";
};

// --------------------------------------------------
//  MEMOIZED PRODUCT CARD COMPONENT
// --------------------------------------------------
const ProductCard = memo(({ p, originalIndex, updateField, removeProduct, handleSliderChange, discounts }) => {
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
        <div>Stock:</div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "4px" }}>
            <input
              className="cardInput"
              type="number"
              value={p.stock}
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
          <input
            type="range"
            min="0"
            max="200"
            value={p.stock}
            onChange={(e) => handleSliderChange(originalIndex, Number(e.target.value))}
            style={{ width: "100%" }}
          />
        </div>

        <div>Sale:</div>
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

        <div>Cost:</div>
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

        <div>Expiry:</div>
        <input
          className="cardInput"
          type="date"
          value={p.expiry}
          onChange={(e) => updateField(originalIndex, "expiry", e.target.value)}
        />

        <div>Days to go:</div>
        <div className="daysToGo">
          {p.expiry ? `${getDaysLeft(p.expiry)}` : "-"}
        </div>

        <div>Suggested Price:</div>
        <div style={{ fontWeight: "bold" }}>${suggestPrice(p, discounts)}</div>

        <div>Profit:</div>
        <div style={{ fontWeight: "bold" }}>${calculateProfit(p)}</div>
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
  //  PRODUCT UPDATE HELPERS
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
            <input className="formInput" name="username" placeholder="Username" required />
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
          <div className="userBadge">👤 {currentUser}</div>
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
                <input className="formInput" type="number" min="0" max="100" value={newDiscount5} onChange={(e) => setNewDiscount5(e.target.value)} />
              </div>
              <div className="inputGroup">
                <label>3-2 days left (%): </label>
                <input className="formInput" type="number" min="0" max="100" value={newDiscount3} onChange={(e) => setNewDiscount3(e.target.value)} />
              </div>
              <div className="inputGroup">
                <label>2-1 days left (%): </label>
                <input className="formInput" type="number" min="0" max="100" value={newDiscount2} onChange={(e) => setNewDiscount2(e.target.value)} />
              </div>
              <button onClick={saveDiscounts} className="btn btnPrimary">Save Discounts</button>
            </fieldset>

            <fieldset>
              <legend>Change Password</legend>
              <div className="inputGroup">
                <label>Current password: </label>
                <input className="formInput" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
              </div>
              <div className="inputGroup">
                <label>New password: </label>
                <input className="formInput" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              </div>
              <div className="inputGroup">
                <label>Confirm new password: </label>
                <input className="formInput" type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} />
              </div>
              <button onClick={changePassword} className="btn btnPrimary">Update Password</button>
            </fieldset>

            <fieldset>
              <legend>Add New User</legend>
              <div className="inputGroup">
                <label>New username: </label>
                <input className="formInput" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} />
              </div>
              <div className="inputGroup">
                <label>Password: </label>
                <input className="formInput" type="password" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} />
              </div>
              <button onClick={addUser} className="btn btnPrimary">Add User</button>
            </fieldset>

            {settingsMsg && <div className="settingsMessage">{settingsMsg}</div>}
            <button onClick={() => setShowSettings(false)} className="btn" style={{ width: "100%", marginTop: "10px" }}>Close</button>
          </div>
        </div>
      )}

      {/* ---- PRODUCT GRID ---- */}
      <div className="productGrid">
        {sortedProducts.map((p) => (
          <ProductCard
            key={p._originalIndex}
            p={p}
            originalIndex={p._originalIndex}
            updateField={updateField}
            handleSliderChange={handleSliderChange}
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