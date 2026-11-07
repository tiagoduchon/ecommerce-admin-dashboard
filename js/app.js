'use strict';

// Northstar Commerce: frontend-only demo. No backend or real payments.
const STORAGE_KEY = 'northstar-commerce-v2';
const THEME_KEY = 'northstar-theme';
const seed = {
  products: [
    {id:1,name:'Studio Wireless Headphones',category:'Electronics',price:189,stock:42},
    {id:2,name:'Minimalist Desk Lamp',category:'Home',price:79,stock:18},
    {id:3,name:'Everyday Canvas Tote',category:'Accessories',price:35,stock:85},
    {id:4,name:'Essential Cotton Hoodie',category:'Clothing',price:95,stock:7},
    {id:5,name:'Mechanical Keyboard',category:'Electronics',price:149,stock:29},
    {id:6,name:'Ceramic Coffee Set',category:'Home',price:59,stock:4},
    {id:7,name:'Leather Card Holder',category:'Accessories',price:45,stock:55},
    {id:8,name:'Classic Oversized Tee',category:'Clothing',price:42,stock:62}
  ],
  customers: [
    {id:1,name:'Olivia Martin',email:'olivia@example.com'},
    {id:2,name:'Liam Wilson',email:'liam@example.com'},
    {id:3,name:'Sophia Brown',email:'sophia@example.com'},
    {id:4,name:'Noah Davis',email:'noah@example.com'},
    {id:5,name:'Emma Garcia',email:'emma@example.com'},
    {id:6,name:'Lucas Taylor',email:'lucas@example.com'}
  ],
  orders: [
    {id:10081,customerId:1,date:'2026-10-28',total:268,status:'Delivered'},
    {id:10082,customerId:2,date:'2026-10-29',total:149,status:'Processing'},
    {id:10083,customerId:3,date:'2026-10-30',total:95,status:'Processing'},
    {id:10084,customerId:4,date:'2026-11-01',total:224,status:'Delivered'},
    {id:10085,customerId:5,date:'2026-11-02',total:79,status:'Pending'},
    {id:10086,customerId:6,date:'2026-11-03',total:189,status:'Processing'},
    {id:10087,customerId:1,date:'2026-11-04',total:138,status:'Delivered'},
    {id:10088,customerId:3,date:'2026-11-05',total:59,status:'Processing'}
  ]
};

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const clone = value => JSON.parse(JSON.stringify(value));
const money = value => new Intl.NumberFormat('en-US', {style:'currency',currency:'USD'}).format(value);
const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
const statuses = ['Pending','Processing','Delivered','Cancelled'];
let state = loadData();
let editingId = null;
let revenueChart = null;
let statusChart = null;
let toastTimeout;

function loadData() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && Array.isArray(saved.products) && Array.isArray(saved.orders) && Array.isArray(saved.customers)) return saved;
  } catch (error) { console.warn('Demo data could not be loaded:', error); }
  return clone(seed);
}
function saveData() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  catch (error) { showToast('Browser storage is unavailable. Changes may not persist.'); }
}
function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove('show'), 2800);
}
function customerName(id) {
  return state.customers.find(customer => customer.id === id)?.name || 'Unknown';
}
function statusBadge(status) {
  return `<span class="status status-${escapeHtml(status)}">${escapeHtml(status)}</span>`;
}
function emptyRow(columns) {
  return `<tr><td colspan="${columns}" class="muted">No matching results.</td></tr>`;
}
function closeMenu() { $('#sidebar').classList.remove('open'); }
function navigate(page) {
  $$('.page').forEach(section => section.classList.toggle('hidden', section.id !== page));
  $$('.nav').forEach(button => button.classList.toggle('active', button.dataset.page === page));
  $('#crumb').textContent = page[0].toUpperCase() + page.slice(1);
  closeMenu();
  if (page === 'overview') renderOverview();
  if (page === 'products') renderProducts();
  if (page === 'orders') renderOrders();
  if (page === 'customers') renderCustomers();
}
function renderOverview() {
  const validOrders = state.orders.filter(order => order.status !== 'Cancelled');
  const revenue = validOrders.reduce((sum, order) => sum + order.total, 0);
  const lowStock = state.products.filter(product => product.stock < 10).length;
  const metrics = [
    ['Total revenue', money(revenue), '↗'],
    ['Orders', String(state.orders.length), '▤'],
    ['Products', String(state.products.length), '▦'],
    ['Low stock', String(lowStock), '⚑']
  ];
  $('#metrics').innerHTML = metrics.map(([label, value, icon]) => `
    <article class="metric"><div class="metric-top">${label}<span class="metric-icon">${icon}</span></div>
    <div class="metric-value">${value}</div><div class="metric-sub">Demo data <span>· local browser</span></div></article>
  `).join('');
  const recent = [...state.orders].sort((a,b) => b.date.localeCompare(a.date)).slice(0,5);
  $('#recentOrders').innerHTML = recent.map(order => `<tr>
    <td><strong>#${order.id}</strong></td><td>${escapeHtml(customerName(order.customerId))}</td>
    <td class="muted">${order.date}</td><td>${money(order.total)}</td><td>${statusBadge(order.status)}</td>
  </tr>`).join('') || emptyRow(5);
  drawCharts();
}
function drawCharts() {
  if (revenueChart) revenueChart.destroy();
  if (statusChart) statusChart.destroy();
  if (typeof Chart === 'undefined') {
    $('#revenueChart').style.display = 'none';
    $('#statusChart').style.display = 'none';
    $('#statusLegend').textContent = 'Charts need an internet connection (Chart.js).';
    return;
  }
  const dark = document.body.classList.contains('dark');
  const labels = ['May','Jun','Jul','Aug','Sep','Oct','Nov'];
  // Historical trend is illustrative, not derived from the demo orders.
  const values = [4200,5700,4900,7100,6600,8300,9700];
  revenueChart = new Chart($('#revenueChart'), {
    type:'line', data:{labels,datasets:[{data:values,borderColor:'#635bff',backgroundColor:'rgba(99,91,255,.10)',fill:true,tension:.35,pointRadius:4}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:context => money(context.parsed.y)}}},scales:{x:{ticks:{color:dark?'#aab5c7':'#8490a6'}},y:{beginAtZero:true,ticks:{color:dark?'#aab5c7':'#8490a6'}}}}
  });
  const counts = statuses.map(status => state.orders.filter(order => order.status === status).length);
  const colors = ['#f1b955','#6585f6','#35b995','#ef7c8e'];
  statusChart = new Chart($('#statusChart'), {
    type:'doughnut',data:{labels:statuses,datasets:[{data:counts,backgroundColor:colors,borderWidth:0}]},
    options:{responsive:true,maintainAspectRatio:false,cutout:'72%',plugins:{legend:{display:false}}}
  });
  $('#statusLegend').innerHTML = statuses.map((status,index) => `<span><i class="dot" style="background:${colors[index]}"></i>${status}: ${counts[index]}</span>`).join('');
}
function renderProducts() {
  const search = $('#productSearch').value.trim().toLowerCase();
  const category = $('#categoryFilter').value;
  const sort = $('#productSort').value;
  const categories = [...new Set(state.products.map(product => product.category))].sort();
  const selected = $('#categoryFilter').value;
  $('#categoryFilter').innerHTML = '<option value="all">All categories</option>' + categories.map(value => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join('');
  $('#categoryFilter').value = categories.includes(selected) ? selected : 'all';
  let products = state.products.filter(product =>
    (product.name + ' ' + product.category).toLowerCase().includes(search) &&
    (($('#categoryFilter').value) === 'all' || product.category === $('#categoryFilter').value)
  );
  if (sort === 'name') products.sort((a,b) => a.name.localeCompare(b.name));
  if (sort === 'priceHigh') products.sort((a,b) => b.price - a.price);
  if (sort === 'stockLow') products.sort((a,b) => a.stock - b.stock);
  $('#productRows').innerHTML = products.map(product => `<tr>
    <td><strong>${escapeHtml(product.name)}</strong></td><td>${escapeHtml(product.category)}</td>
    <td>${money(product.price)}</td><td class="${product.stock < 10 ? 'stock-low':'stock-ok'}">${product.stock}</td>
    <td><button class="small-btn" data-edit="${product.id}">Edit</button><button class="small-btn danger" data-delete="${product.id}">Delete</button></td>
  </tr>`).join('') || emptyRow(5);
  $('#productCount').textContent = `Showing ${products.length} of ${state.products.length} products`;
}
function renderOrders() {
  const search = $('#orderSearch').value.trim().toLowerCase();
  const status = $('#orderFilter').value;
  const orders = [...state.orders].filter(order =>
    (`${order.id} ${customerName(order.customerId)}`).toLowerCase().includes(search) && (status === 'all' || order.status === status)
  ).sort((a,b) => b.date.localeCompare(a.date));
  $('#orderRows').innerHTML = orders.map(order => `<tr>
    <td><strong>#${order.id}</strong></td><td>${escapeHtml(customerName(order.customerId))}</td>
    <td>${order.date}</td><td>${money(order.total)}</td><td>${statusBadge(order.status)}</td>
    <td><select class="status-select" data-order="${order.id}" aria-label="Update order ${order.id}">
    ${statuses.map(value => `<option value="${value}" ${order.status === value ? 'selected':''}>${value}</option>`).join('')}
    </select></td></tr>`).join('') || emptyRow(6);
}
function renderCustomers() {
  const search = $('#customerSearch').value.trim().toLowerCase();
  const customers = state.customers.filter(customer => (customer.name + ' ' + customer.email).toLowerCase().includes(search));
  $('#customerRows').innerHTML = customers.map(customer => {
    const orders = state.orders.filter(order => order.customerId === customer.id);
    const spent = orders.filter(order => order.status !== 'Cancelled').reduce((sum,order) => sum + order.total,0);
    return `<tr><td><strong>${escapeHtml(customer.name)}</strong></td><td>${escapeHtml(customer.email)}</td>
      <td>${orders.length}</td><td>${money(spent)}</td></tr>`;
  }).join('') || emptyRow(4);
}
function openProductDialog(id = null) {
  editingId = id;
  const product = state.products.find(item => item.id === id);
  $('#productForm').reset();
  $('#dialogHeading').textContent = product ? 'Edit product' : 'Add product';
  if (product) {
    const fields = $('#productForm').elements;
    fields.namedItem('name').value = product.name;
    fields.namedItem('category').value = product.category;
    fields.namedItem('price').value = product.price;
    fields.namedItem('stock').value = product.stock;
  }
  $('#productDialog').showModal();
}
function exportReport() {
  const header = ['Order ID','Customer','Date','Amount USD','Status'];
  const rows = state.orders.map(order => [order.id,customerName(order.customerId),order.date,order.total,order.status]);
  const csv = [header,...rows].map(row => row.map(value => `"${String(value).replace(/"/g,'""')}"`).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob(['\uFEFF',csv],{type:'text/csv;charset=utf-8'}));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'northstar-orders.csv';
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url),1000);
  showToast('Order report exported');
}

// Navigation and actions
$$('.nav').forEach(button => button.addEventListener('click', () => navigate(button.dataset.page)));
$$('[data-goto]').forEach(button => button.addEventListener('click', () => navigate(button.dataset.goto)));
$('#menuBtn').addEventListener('click', () => $('#sidebar').classList.toggle('open'));
$('#addProduct').addEventListener('click', () => openProductDialog());
$('#closeDialog').addEventListener('click', () => $('#productDialog').close());
$('#cancelDialog').addEventListener('click', () => $('#productDialog').close());
$('#exportBtn').addEventListener('click', exportReport);
['productSearch','categoryFilter','productSort'].forEach(id => $('#'+id).addEventListener(id === 'productSearch'?'input':'change',renderProducts));
['orderSearch','orderFilter'].forEach(id => $('#'+id).addEventListener(id === 'orderSearch'?'input':'change',renderOrders));
$('#customerSearch').addEventListener('input',renderCustomers);
$('#productRows').addEventListener('click',event => {
  const edit = event.target.closest('[data-edit]');
  const remove = event.target.closest('[data-delete]');
  if (edit) openProductDialog(Number(edit.dataset.edit));
  if (remove) {
    const id = Number(remove.dataset.delete);
    const product = state.products.find(item => item.id === id);
    if (product && confirm(`Delete "${product.name}"?`)) {
      state.products = state.products.filter(item => item.id !== id);
      saveData();renderProducts();renderOverview();showToast('Product deleted');
    }
  }
});
$('#productForm').addEventListener('submit',event => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const name = String(form.get('name')).trim();
  const category = String(form.get('category'));
  const price = Number(form.get('price'));
  const stock = Number(form.get('stock'));
  if (!name || !Number.isFinite(price) || price <= 0 || !Number.isInteger(stock) || stock < 0) {
    showToast('Please enter valid product details');return;
  }
  if (editingId !== null) {
    const product = state.products.find(item => item.id === editingId);
    if (product) Object.assign(product,{name,category,price,stock});
  } else {
    const id = Math.max(0,...state.products.map(item => item.id)) + 1;
    state.products.push({id,name,category,price,stock});
  }
  saveData();$('#productDialog').close();renderProducts();renderOverview();showToast('Product saved');
});
$('#orderRows').addEventListener('change',event => {
  const select = event.target.closest('[data-order]');
  if (!select || !statuses.includes(select.value)) return;
  const order = state.orders.find(item => item.id === Number(select.dataset.order));
  if (order) {order.status = select.value;saveData();renderOrders();renderOverview();renderCustomers();showToast('Order status updated');}
});
$('#resetBtn').addEventListener('click', () => {
  if (confirm('Reset all demo data?')) {
    state = clone(seed);saveData();renderOverview();renderProducts();renderOrders();renderCustomers();showToast('Demo data restored');
  }
});
$('#themeBtn').addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const theme = document.body.classList.contains('dark')?'dark':'light';
  try {localStorage.setItem(THEME_KEY,theme);} catch(error) {console.warn(error);}
  renderOverview();
});
try {if (localStorage.getItem(THEME_KEY) === 'dark') document.body.classList.add('dark');} catch(error) {console.warn(error);}
$('#today').textContent = new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric'}).format(new Date());
renderOverview();renderProducts();renderOrders();renderCustomers();navigate('overview');
