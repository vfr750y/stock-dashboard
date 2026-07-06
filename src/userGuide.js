// =======================
//  USER GUIDE CONTENT
// =======================

export function getUserGuideHTML() {
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