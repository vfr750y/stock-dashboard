import React, { useState, useEffect } from "react";

// =======================
//  DEFAULT PRODUCT DATA
// =======================
const defaultProducts = [
  { name: "Apples - Braeburn", stock: 50, unit: "kg", salePrice: 3, costPrice: 1.5, expiry: "2026-05-05", sold: 0 },
  { name: "Apples - Granny Smith", stock: 40, unit: "kg", salePrice: 3.2, costPrice: 1.6, expiry: "2026-05-06", sold: 0 },
  { name: "Apples - Jazz", stock: 35, unit: "kg", salePrice: 3.5, costPrice: 1.8, expiry: "2026-05-09", sold: 0 },
  { name: "Apples - Envy", stock: 30, unit: "kg", salePrice: 4, costPrice: 2, expiry: "2026-05-07", sold: 0 },
  { name: "Mandarins", stock: 60, unit: "kg", salePrice: 2.8, costPrice: 1.4, expiry: "2026-05-03", sold: 0 },
  { name: "Bananas - Fair trade", stock: 45, unit: "kg", salePrice: 2.5, costPrice: 1.3, expiry: "2026-05-12", sold: 0 },
  { name: "Bananas - standard", stock: 70, unit: "kg", salePrice: 2.2, costPrice: 1.1, expiry: "2026-05-12", sold: 0 },
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
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #f9fafb;
    }

    .guide-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 0;
    }

    /* Navigation Bar */
    .nav-bar {
      position: sticky;
      top: 0;
      background: #1a1a2e;
      padding: 15px 20px;
      z-index: 100;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .nav-bar h1 {
      color: white;
      margin-bottom: 10px;
      font-size: 1.8em;
      font-family: 'Georgia', serif;
    }

    .nav-links {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
    }

    .nav-links a {
      color: #e0e0e0;
      text-decoration: none;
      padding: 5px 12px;
      border-radius: 15px;
      transition: all 0.3s;
      font-size: 0.95em;
    }

    .nav-links a:hover {
      background: #2d2d44;
      color: white;
    }

    /* Content Sections */
    .content {
      padding: 30px 20px;
    }

    .section {
      background: white;
      border-radius: 12px;
      padding: 30px;
      margin-bottom: 25px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      border-left: 4px solid #34c759;
    }

    .section h2 {
      color: #1a1a2e;
      margin-bottom: 15px;
      font-size: 1.5em;
      padding-bottom: 10px;
      border-bottom: 2px solid #f0f0f0;
    }

    .section h3 {
      color: #2d2d44;
      margin: 20px 0 10px 0;
      font-size: 1.2em;
    }

    .section p, .section li {
      margin-bottom: 10px;
      color: #555;
    }

    .section ul, .section ol {
      margin-left: 25px;
      margin-bottom: 15px;
    }

    .section li {
      margin-bottom: 8px;
    }

    /* Feature Cards */
    .feature-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
      margin: 20px 0;
    }

    .feature-card {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
      border: 1px solid #e5e7eb;
    }

    .feature-card h4 {
      color: #1a1a2e;
      margin-bottom: 10px;
      font-size: 1.1em;
    }

    /* Tips Box */
    .tip-box {
      background: #fff3cd;
      border: 1px solid #ffc107;
      border-radius: 8px;
      padding: 15px;
      margin: 15px 0;
    }

    .tip-box strong {
      color: #856404;
    }

    /* Color Legend */
    .color-legend {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
      margin: 15px 0;
    }

    .color-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .color-swatch {
      width: 24px;
      height: 24px;
      border-radius: 4px;
    }

    /* Buttons */
    .back-to-top {
      display: inline-block;
      background: #1a1a2e;
      color: white;
      padding: 10px 20px;
      border-radius: 20px;
      text-decoration: none;
      margin-top: 20px;
      transition: background 0.3s;
    }

    .back-to-top:hover {
      background: #2d2d44;
    }

    /* Responsive */
    @media (max-width: 600px) {
      .nav-links {
        flex-direction: column;
        gap: 5px;
      }
      
      .section {
        padding: 20px 15px;
      }
      
      .feature-grid {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <div class="guide-container">
    <!-- Navigation -->
    <nav class="nav-bar">
      <h1>📚 Stock Sage User Guide</h1>
      <div class="nav-links">
        <a href="#getting-started">Getting Started</a>
        <a href="#managing-products">Managing Products</a>
        <a href="#understanding-colors">Color System</a>
        <a href="#sorting-features">Sorting Features</a>
        <a href="#settings">Settings</a>
        <a href="#tips">Tips & Tricks</a>
      </div>
    </nav>

    <!-- Content -->
    <div class="content">
      
      <!-- Getting Started -->
      <div id="getting-started" class="section">
        <h2>🚀 Getting Started</h2>
        <h3>Welcome to Stock Sage!</h3>
        <p>Stock Sage is your friendly inventory management tool for fruit and vegetable shops. It helps you track stock levels, monitor expiry dates, and maximize profits by suggesting smart discounts on items that need to sell quickly.</p>
        
        <h3>Logging In</h3>
        <p>When you first open the app, you'll see a login screen. Use your username and password to access your dashboard.</p>
        <p>Once logged in, you'll see your personalized dashboard with all your products displayed in colorful cards.</p>
        
        <h3>Your Dashboard at a Glance</h3>
        <p>The dashboard shows you:</p>
        <ul>
          <li><strong>Product Cards:</strong> Each product has its own card showing all important information</li>
          <li><strong>Header Controls:</strong> Your username, sorting buttons, settings, and logout</li>
          <li><strong>Add Product Button:</strong> A dashed box at the bottom to add new items</li>
        </ul>
      </div>

      <!-- Managing Products -->
      <div id="managing-products" class="section">
        <h2>📦 Managing Products</h2>
        
        <div class="feature-grid">
          <div class="feature-card">
            <h4>➕ Adding New Products</h4>
            <p>Click the dashed "Add New Product" box at the bottom of your product grid. A new empty card will appear where you can fill in all the details.</p>
          </div>
          
          <div class="feature-card">
            <h4>❌ Removing Products</h4>
            <p>Click the "x" button in the top-right corner of any product card to remove it from your inventory.</p>
          </div>
          
          <div class="feature-card">
            <h4>✏️ Editing Product Details</h4>
            <p>Click directly on any field to edit it. You can change the product name, stock numbers, prices, and expiry dates inline.</p>
          </div>
          
          <div class="feature-card">
            <h4>📊 Stock Management</h4>
            <p>Adjust stock levels using the number input or the convenient slider. When you reduce stock using the slider, the "sold" count increases automatically!</p>
          </div>
        </div>

        <h3>Understanding Each Field</h3>
        <ul>
          <li><strong>Stock:</strong> Current quantity in your shop. Use the slider or type a number.</li>
          <li><strong>Unit:</strong> Choose between "kg" (for loose/fresh produce) or "units" (for packaged items like pies).</li>
          <li><strong>Sale Price:</strong> The price you sell the item for to customers ($)</li>
          <li><strong>Cost Price:</strong> How much the item costs you to buy ($)</li>
          <li><strong>Expiry Date:</strong> The date the product expires. Click to open a calendar picker.</li>
          <li><strong>Days to Go:</strong> Automatically calculated - shows how many days until expiration</li>
          <li><strong>Suggested Next Price:</strong> Smart discount suggestion based on how close to expiry</li>
          <li><strong>Profit:</strong> Shows your current profit as (Sale Price - Cost Price) × Sold units</li>
        </ul>
      </div>

      <!-- Understanding Colors -->
      <div id="understanding-colors" class="section">
        <h2>🎨 Understanding the Color System</h2>
        <p>Each product card has a background color that tells you at a glance how urgent it is to sell:</p>
        
        <div class="color-legend">
          <div class="color-item">
            <div class="color-swatch" style="background: #34c759;"></div>
            <span><strong>Green:</strong> More than 3 days to go - No rush!</span>
          </div>
          <div class="color-item">
            <div class="color-swatch" style="background: #ffcc00;"></div>
            <span><strong>Gold/Yellow:</strong> 2-3 days to go - Pay attention</span>
          </div>
          <div class="color-item">
            <div class="color-swatch" style="background: #ff3b30;"></div>
            <span><strong>Red:</strong> 1 day or less - Sell ASAP!</span>
          </div>
        </div>
        
        <p>This visual system helps you prioritize which products need markdowns or special promotion first.</p>
      </div>

      <!-- Sorting Features -->
      <div id="sorting-features" class="section">
        <h2>🔍 Sorting Features</h2>
        
        <h3>How to Sort Products</h3>
        <p>Use the sorting buttons in the header to organize your product view:</p>
        <ul>
          <li><strong>A‑Z Button:</strong> Sorts products alphabetically by name. Perfect for finding a specific product quickly.</li>
          <li><strong>⏳ Hourglass Button:</strong> Sorts by expiry date, showing products that expire soonest first. This is your most powerful tool for reducing waste!</li>
          <li><strong>Default View:</strong> If neither button is highlighted, products appear in the order you added them.</li>
        </ul>

        <div class="tip-box">
          <strong>💡 Pro Tip:</strong> Click the ⏳ button at the start of each day to see which products need urgent attention. Products with the fewest days remaining will appear first!
        </div>
      </div>

      <!-- Settings -->
      <div id="settings" class="section">
        <h2>⚙️ Settings & Account Management</h2>
        
        <h3>Accessing Settings</h3>
        <p>Click the gear icon (⚙️) in the top-right corner to open the settings panel.</p>
        
        <h3>What You Can Do in Settings</h3>
        
        <h4>1. Adjust Discount Percentages</h4>
        <p>Control how much discount is applied to products that are approaching their expiry date:</p>
        <ul>
          <li><strong>5-3 days left:</strong> Discount for products with 3-5 days remaining (default: 5%)</li>
          <li><strong>3-2 days left:</strong> Discount for products with 2-3 days remaining (default: 10%)</li>
          <li><strong>2-1 days left:</strong> Discount for products with 1-2 days remaining (default: 20%)</li>
        </ul>
        <p>The app will <strong>never</strong> suggest a price below your cost price, protecting your margins.</p>
        
        <h4>2. Change Your Password</h4>
        <p>Keep your account secure by updating your password regularly:</p>
        <ol>
          <li>Enter your current password</li>
          <li>Type your new password</li>
          <li>Confirm the new password</li>
          <li>Click "Update Password"</li>
        </ol>
        
        <h4>3. Add New Users</h4>
        <p>If you have staff members who need access to the inventory system:</p>
        <ol>
          <li>Enter a new username</li>
          <li>Set their password</li>
          <li>Click "Add User"</li>
        </ol>
        <p>New users can immediately log in with their credentials on any device.</p>
        
        <div class="tip-box">
          <strong>💡 Pro Tip:</strong> All your data is saved automatically to your browser's local storage. You won't lose your inventory data when you close the browser!
        </div>
      </div>

      <!-- Tips & Tricks -->
      <div id="tips" class="section">
        <h2>💎 Tips & Tricks for Success</h2>
        
        <h3>Daily Routine</h3>
        <ol>
          <li><strong>Morning Check:</strong> Open Stock Sage and click ⏳ to see products expiring soon</li>
          <li><strong>Check Red Items First:</strong> These need immediate attention - consider special displays or markdowns</li>
          <li><strong>Review Suggested Prices:</strong> The "Suggested Next Price" field helps you make smart discount decisions</li>
          <li><strong>Track Profits:</strong> Monitor the profit field to understand which products are most profitable</li>
          <li><strong>Update Stock:</strong> Use the slider throughout the day to track sales - sold counts update automatically!</li>
        </ol>

        <h3>Reducing Waste</h3>
        <ul>
          <li>Sort by expiry date every morning to catch items before they go bad</li>
          <li>Use the Suggested Next Price as a guide for markdown stickers</li>
          <li>Green items can wait - focus your energy on yellow and red items</li>
          <li>Remove items when they're sold out to keep your dashboard clean</li>
        </ul>

        <h3>Maximizing Profits</h3>
        <ul>
          <li>Check the profit field regularly - it shows (sale price - cost price) × number sold</li>
          <li>Adjust discount percentages in settings based on how quickly items typically sell</li>
          <li>Track which products consistently show high profits and consider stocking more</li>
          <li>The slider is your friend - use it to quickly update stock as items sell</li>
        </ul>

        <div class="tip-box">
          <strong>🔒 Security Note:</strong> Your account information is stored locally in your browser. For shared computers, always log out when you're done by clicking the "Logout" button.
        </div>
      </div>

      <a href="#" class="back-to-top">↑ Back to Top</a>
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

  // Discount settings
  const [discounts, setDiscounts] = useState(() => {
    const saved = localStorage.getItem("discountSettings");
    return saved ? JSON.parse(saved) : { discount5: 0.05, discount3: 0.10, discount2: 0.20 };
  });

  // Authentication
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState("");
  const [loginError, setLoginError] = useState("");
  
  // New state for password visibility toggle
  const [showPassword, setShowPassword] = useState(false);

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

  // Sorting state – 'default' (unsorted), 'alpha' (A-Z), 'expiry' (closest expiry first)
  const [sortBy, setSortBy] = useState("default");

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

  // -----------------------------------------------
  //  DYNAMIC LOADING OF OLD ENGLISH FONT
  // -----------------------------------------------
  useEffect(() => {
    // Only add the Google Font link once
    if (!document.getElementById("playfair-font-link")) {
      const link = document.createElement("link");
      link.id = "playfair-font-link";
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  // -----------------------
  //  USER GUIDE HANDLER
  // -----------------------
  const openUserGuide = () => {
    const guideWindow = window.open("", "StockSageUserGuide", "width=900,height=700,scrollbars=yes,resizable=yes");
    if (guideWindow) {
      guideWindow.document.write(getUserGuideHTML());
      guideWindow.document.close();
    }
  };

  // -----------------------
  //  LOGIN HANDLER (Case Insensitive)
  // -----------------------
  const handleLogin = (e) => {
    e.preventDefault();
    const form = e.target;
    const username = form.username.value.trim();
    const password = form.password.value;

    // Convert username to lowercase for case-insensitive comparison
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
    if (users.some(u => u.username.toLowerCase() === newUsername.trim().toLowerCase())) {
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

    // Special handling for stock updates via number input
    if (field === "stock") {
      const oldStock = Number(updated[i].stock) || 0;
      const newStock = Number(value);
      
      if (newStock < oldStock) {
        const decrease = oldStock - newStock;
        updated[i].sold = (Number(updated[i].sold) || 0) + decrease;
      }
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

  /**
   * Returns a highly vibrant background colour based on days until expiry.
   */
  const getColor = (days) => {
    if (days <= 1) return "#ff3b30"; // vibrant red
    if (days <= 3) return "#ffcc00"; // sunny gold
    return "#34c759";               // fresh green
  };

  // --------------------------------------------------
  //  SORTING LOGIC
  // --------------------------------------------------
  /**
   * Creates a sorted version of the products array along with original indices.
   * Sorting keeps the original index for all editing operations.
   */
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
      // default – keep insertion order
      return withIndex;
    }
  })();

  // -----------------------
  //  COMMON TITLE STYLE
  // -----------------------
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
          {/* Old-fashioned shop title on the login page */}
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
      {/* ---- HEADER WITH SORTING, SETTINGS & LOGOUT ---- */}
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
          {/* USER GUIDE BUTTON */}
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
          {/* USER ICON */}
          <div style={{ background: "rgba(255,255,255,0.8)", padding: "6px 12px", borderRadius: 8 }}>
            👤 {currentUser}
          </div>

          {/* SORTING BUTTON – ALPHABETICAL */}
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

          {/* SORTING BUTTON – BY DAYS TO GO (CLOSEST FIRST) */}
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

          {/* SETTINGS COG */}
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

          {/* LOGOUT */}
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
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 8
        }}
      >
        {sortedProducts.map((p) => {
          // p._originalIndex is the real index in the original products array
          const i = p._originalIndex;
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

                {/* Sale Price */}
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

                {/* Cost Price */}
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