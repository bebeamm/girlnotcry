const API_URL = "https://script.google.com/macros/s/AKfycbwriFqneeTyroTwwcXPHZmYMeUP1_L3TFbm_Uw7COzlpCaexwklS-biXcDGH61lyczWRQ/exec"; // 👉 เปลี่ยน xxx เป็นลิงก์ของบีม
let products = [];

const productList = document.getElementById("product-list");
const totalPriceEl = document.getElementById("total-price");
const sellerSummaryEl = document.getElementById("seller-summary");
const sellerSelect = document.getElementById("seller-select");

// โหลดข้อมูลจาก Google Sheet
async function loadProducts() {
  const res = await fetch(API_URL);
  products = await res.json();
  generateSellerOptions(); // สร้าง dropdown อัตโนมัติ
  updateDisplay();
}

// สร้าง dropdown รายชื่อคนขายอัตโนมัติ
function generateSellerOptions() {
  const sellers = [...new Set(products.map(p => p.seller))]; // เอาชื่อไม่ซ้ำ
  sellerSelect.innerHTML = `<option value="all">แสดงสินค้าทั้งหมด</option>`;
  sellers.forEach(seller => {
    const option = document.createElement("option");
    option.value = seller;
    option.textContent = seller;
    sellerSelect.appendChild(option);
  });
}

function updateDisplay() {
  const selectedSeller = sellerSelect.value;
  productList.innerHTML = '';
  sellerSummaryEl.innerHTML = '';
  let total = 0;
  const sellerTotals = {};

  const filteredProducts = selectedSeller === 'all' 
    ? products 
    : products.filter(p => p.seller === selectedSeller);

  filteredProducts.forEach((product, index) => {
    total += product.price * product.quantity;

    if (!sellerTotals[product.seller]) {
      sellerTotals[product.seller] = 0;
    }
    sellerTotals[product.seller] += product.price * product.quantity;

    const item = document.createElement("div");
    item.className = "item";

    const realIndex = products.indexOf(product);

    item.innerHTML = `
      <div class="item-name">
        ${product.name} <span style="font-size: 0.8rem; color: #888;">(${product.seller})</span>
      </div>
      <div class="controls">
        <button class="button" onclick="removeItem(${realIndex})">−</button>
        <span>${product.quantity}</span>
        <button class="button" onclick="addItem(${realIndex})">+</button>
      </div>
    `;

    productList.appendChild(item);
  });

  for (let seller in sellerTotals) {
    const line = document.createElement("div");
    line.textContent = `รวมของ ${seller}: ${sellerTotals[seller]} บาท`;
    sellerSummaryEl.appendChild(line);
  }

  totalPriceEl.textContent = total;
}

async function updateProductQuantity(index, change) {
  products[index].quantity += change;
  if (products[index].quantity < 0) products[index].quantity = 0;

  await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({
      name: products[index].name,
      quantity: products[index].quantity
    }),
    headers: {
      "Content-Type": "application/json"
    }
  });

  updateDisplay();
}

function addItem(index) {
  updateProductQuantity(index, 1);
}

function removeItem(index) {
  updateProductQuantity(index, -1);
}

sellerSelect.addEventListener('change', updateDisplay);

loadProducts();
