const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const state = {
  currentType: 'all',
  user: null,
};

function formToJSON(form) {
  const data = new FormData(form);
  const obj = {};
  for (const [k, v] of data.entries()) {
    if (!k.includes('.')) {
      if (v !== '') obj[k] = v;
      continue;
    }
    // support nested keys like owner.name or availability.start
    const [a, b] = k.split('.');
    obj[a] = obj[a] || {};
    if (v !== '') obj[a][b] = v;
  }
  if (obj.price != null && obj.price !== '') obj.price = Number(obj.price);
  return obj;
}

async function getCurrentUser() {
  try {
    const res = await fetch('/api/auth/me');
    const json = await res.json();
    state.user = json.user;
  } catch (_) {
    state.user = null;
  }
  renderUserSlot();
  toggleAuthRequirements();
}

function renderUserSlot() {
  const slot = $('#user-slot');
  if (!slot) return;
  if (state.user) {
    slot.innerHTML = `
      <div class="user-menu">
        <div class="avatar" title="${escapeHtml(state.user.email)}">${escapeHtml(state.user.name?.[0] || 'U')}</div>
        <div class="user-meta">
          <div class="name">${escapeHtml(state.user.name || '')}</div>
          <div class="email muted small">${escapeHtml(state.user.email || '')}</div>
        </div>
        <button id="logout-btn" class="ghost">Log out</button>
      </div>
    `;
    $('#logout-btn')?.addEventListener('click', async () => {
      await fetch('/api/auth/logout', { method: 'POST' });
      state.user = null;
      renderUserSlot();
      toggleAuthRequirements();
    });
  } else {
    slot.innerHTML = `
      <div class="auth-links">
        <a href="/login.html" class="button">Sign in</a>
        <a href="/signup.html" class="button primary">Create account</a>
      </div>
    `;
  }
}

function toggleAuthRequirements() {
  const hint = $('#auth-hint');
  const submitBtn = $('#listing-form button[type="submit"]');
  if (!hint || !submitBtn) return;
  if (state.user) {
    hint.classList.add('hidden');
    submitBtn.disabled = false;
  } else {
    hint.classList.remove('hidden');
    submitBtn.disabled = true;
  }
}

async function fetchListings() {
  const params = new URLSearchParams();
  if (state.currentType !== 'all') params.set('type', state.currentType);
  const q = $('#main-search')?.value.trim() || '';
  if (q) params.set('q', q);
  const res = await fetch(`/api/listings?${params}`);
  const items = await res.json();
  renderListings(items);
}

function renderListings(items) {
  const container = $('#listings');
  if (!items.length) {
    container.innerHTML = `<div class="empty">No listings found. Be the first to create one!</div>`;
    return;
  }
  container.innerHTML = items.map(cardHTML).join('');
}

function cardHTML(l) {
  const price = l.price != null ? `${l.currency || 'USD'} ${l.price}` : (l.type === 'exchange' ? 'Exchange' : 'Contact for price');
  const badge = l.type.charAt(0).toUpperCase() + l.type.slice(1);
  const img = (l.images && l.images.length)
    ? `<img class="card-img" src="${escapeHtml(l.images[0])}" alt="${escapeHtml(l.title)}" loading="lazy">`
    : `<div class="card-img" style="background:#1a1f2e;display:flex;align-items:center;justify-content:center;color:#4b5563;font-size:48px">📦</div>`;
  
  return `
  <article class="card" data-id="${l.id}">
    <div class="card-badge ${l.type}">${badge}</div>
    ${img}
    <div class="card-content">
      <div class="card-price">${price}</div>
      <h3>${escapeHtml(l.title)}</h3>
      <div class="card-location">📍 ${escapeHtml(l.location || 'Location not specified')}</div>
    </div>
  </article>`;
}

function escapeHtml(str) {
  return String(str).replace(/[&<>\"]+/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;'
  }[c]));
}

async function submitOffer(e) {
  e.preventDefault();
  if (!state.user) {
    window.location.href = '/login.html';
    return;
  }
  const form = e.currentTarget;
  const id = form.dataset.id;
  const body = formToJSON(form);
  const status = form.querySelector('.form-status');
  status.textContent = 'Sending...';
  try {
    const res = await fetch(`/api/listings/${id}/offers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(j.error || 'Failed to send');
    status.textContent = 'Sent!';
    form.reset();
  } catch (err) {
    console.error(err);
    status.textContent = err.message || 'Error sending offer';
  }
}

async function submitListing(e) {
  e.preventDefault();
  if (!state.user) {
    window.location.href = '/login.html';
    return;
  }
  const form = e.currentTarget;
  const type = form.dataset.type;
  const status = form.querySelector('.form-status');
  
  status.textContent = 'Uploading images...';
  
  try {
    // Upload images first
    const imageUrls = await uploadImages(type);
    
    status.textContent = 'Publishing listing...';
    
    // Get form data
    const body = formToJSON(form);
    body.type = type;
    body.images = imageUrls;
    
    const res = await fetch('/api/listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(j.error || 'Failed');
    
    // Clear uploaded files and preview
    uploadedFiles[type] = [];
    form.querySelector('.image-preview').innerHTML = '';
    
    await fetchListings();
    form.reset();
    status.textContent = 'Published!';
    setTimeout(() => (status.textContent = ''), 2000);
  } catch (err) {
    console.error(err);
    status.textContent = err.message || 'Error publishing';
  }
}

function setupBottomNav() {
  $$('.nav-item[data-type]').forEach((btn) => {
    btn.addEventListener('click', () => {
      $$('.nav-item').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.currentType = btn.getAttribute('data-type');
      fetchListings();
    });
  });

  const createBtn = $('#create-btn');
  const modal = $('#create-modal');
  const closeBtn = $('#modal-close');
  
  if (createBtn && modal) {
    createBtn.addEventListener('click', () => {
      if (!state.user) {
        window.location.href = '/login.html';
        return;
      }
      modal.classList.remove('hidden');
    });
  }
  
  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.add('hidden');
    });
  }

  $$('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      $$('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tab = btn.getAttribute('data-tab');
      $$('.listing-form').forEach(f => f.classList.remove('active'));
      $(`#form-${tab}`)?.classList.add('active');
    });
  });

  $$('.listing-form').forEach((form) => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!state.user) {
        window.location.href = '/login.html';
        return;
      }
      const type = form.getAttribute('data-type');
      const body = formToJSON(form);
      body.type = type;
      const status = form.querySelector('.form-status');
      status.textContent = 'Publishing...';
      try {
        const res = await fetch('/api/listings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const j = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(j.error || 'Failed');
        await fetchListings();
        form.reset();
        modal.classList.add('hidden');
        status.textContent = '';
      } catch (err) {
        console.error(err);
        status.textContent = err.message || 'Error publishing';
      }
    });
  });

  const searchInput = $('#main-search');
  if (searchInput) {
    let timeout;
    searchInput.addEventListener('input', () => {
      clearTimeout(timeout);
      timeout = setTimeout(fetchListings, 500);
    });
  }
}

// Tab switching functionality
function setupTabs() {
  const tabBtns = $$('.tab-btn');
  const forms = $$('.listing-form');
  
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      
      // Update active tab button
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Show corresponding form
      forms.forEach(f => f.classList.remove('active'));
      $(`#form-${tab}`)?.classList.add('active');
    });
  });
}

// Image upload preview
const uploadedFiles = {
  sell: [],
  buy: [],
  exchange: [],
  rent: []
};

function setupImageUpload() {
  const fileInputs = $$('.file-input');
  
  fileInputs.forEach(input => {
    input.addEventListener('change', (e) => {
      const form = e.target.closest('.listing-form');
      const type = form.dataset.type;
      const previewContainer = form.querySelector('.image-preview');
      const files = Array.from(e.target.files);
      
      // Limit to 6 images
      if (uploadedFiles[type].length + files.length > 6) {
        alert('Maximum 6 images allowed');
        return;
      }
      
      files.forEach(file => {
        if (file.size > 5 * 1024 * 1024) {
          alert(`File ${file.name} is too large. Maximum 5MB per file.`);
          return;
        }
        
        uploadedFiles[type].push(file);
        
        // Create preview
        const reader = new FileReader();
        reader.onload = (ev) => {
          const previewItem = document.createElement('div');
          previewItem.className = 'preview-item';
          previewItem.innerHTML = `
            <img src="${ev.target.result}" alt="Preview">
            <button type="button" class="remove-btn" data-index="${uploadedFiles[type].length - 1}">×</button>
          `;
          
          previewItem.querySelector('.remove-btn').addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            uploadedFiles[type].splice(index, 1);
            previewItem.remove();
            // Update indices
            updatePreviewIndices(type);
          });
          
          previewContainer.appendChild(previewItem);
        };
        reader.readAsDataURL(file);
      });
      
      // Clear input
      e.target.value = '';
    });
  });
}

function updatePreviewIndices(type) {
  const form = $(`#form-${type}`);
  const previews = form.querySelectorAll('.preview-item .remove-btn');
  previews.forEach((btn, idx) => {
    btn.dataset.index = idx;
  });
}

async function uploadImages(type) {
  if (uploadedFiles[type].length === 0) return [];
  
  const formData = new FormData();
  uploadedFiles[type].forEach(file => {
    formData.append('files', file);
  });
  
  try {
    const res = await fetch('/api/uploads', {
      method: 'POST',
      body: formData
    });
    
    if (!res.ok) throw new Error('Upload failed');
    
    const data = await res.json();
    return data.urls || [];
  } catch (err) {
    console.error('Image upload error:', err);
    return [];
  }
}

function init() {
  $('#year').textContent = new Date().getFullYear();
  setupBottomNav();
  getCurrentUser().then(fetchListings);
}

document.addEventListener('DOMContentLoaded', init);
