// Data State
let itemsData = [];
let itemIdCounter = 1;
let itemHistory = []; // store for datalist suggestions

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    // Set default dates
    const today = new Date();
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + 3);

    document.getElementById('edit-invoice-date').value = today.toISOString().split('T')[0];
    document.getElementById('edit-invoice-due-date').value = dueDate.toISOString().split('T')[0];

    // Load saved info from local storage
    loadSettings();

    // Setup collapsible sections
    setupCollapsibleSections();

    // Render initial items in editor
    renderEditorItems();

    // Bind all inputs to update the preview
    setupLiveSync();
    
    // Initial sync
    syncToPreview();
    
    // Load item history for suggestions
    loadItemHistory();
    
    // Initial scale and window resize binding
    scalePreview();
    window.addEventListener('resize', scalePreview);
});

function scalePreview() {
    const container = document.querySelector('.preview-container');
    const invoice = document.getElementById('invoice');
    
    // Get available dimensions
    const availableHeight = container.clientHeight - 40; // 40px padding
    const availableWidth = container.clientWidth - 40;
    
    // Temporarily reset scale to measure natural dimensions
    invoice.style.setProperty('--preview-scale', 1);
    
    const naturalWidth = invoice.offsetWidth;
    const naturalHeight = invoice.offsetHeight;
    
    const scaleWidth = availableWidth / naturalWidth;
    const scaleHeight = availableHeight / naturalHeight;
    
    // Use the smallest scale to ensure it fits both width and height, but never scale up > 1
    const scale = Math.min(scaleWidth, scaleHeight, 1);
    
    invoice.style.setProperty('--preview-scale', scale);
}

// Setup collapsible panels
function setupCollapsibleSections() {
    document.querySelectorAll('.editor-section-header').forEach(header => {
        header.addEventListener('click', () => {
            const section = header.parentElement;
            section.classList.toggle('collapsed');
        });
    });
}

// Mobile Preview Toggle
function toggleMobilePreview() {
    document.body.classList.toggle('mobile-preview-active');
    
    const isActive = document.body.classList.contains('mobile-preview-active');
    const btn = document.getElementById('btn-toggle-preview');
    
    if (btn) {
        if (isActive) {
            btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
        } else {
            btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
        }
    }
    
    if (isActive) {
        // Recalculate scale after a short delay so the container is fully rendered
        setTimeout(() => scalePreview(), 50);
    }
}

// Live Sync Mechanism
function setupLiveSync() {
    const editorPanel = document.getElementById('editor-panel');
    editorPanel.addEventListener('input', (e) => {
        // If it's an item input, we need to update the itemsData array first
        if (e.target.closest('.item-card')) {
            updateItemData(e.target);
        }
        
        // Sync everything
        syncToPreview();
    });

    // Add Item Button
    document.getElementById('btn-add-item').addEventListener('click', () => {
        itemsData.push({
            id: itemIdCounter++,
            name: 'New Item',
            desc: '',
            price: 0,
            qty: 1
        });
        renderEditorItems();
        syncToPreview();
    });

    // Save Buttons
    document.getElementById('btn-save-company').addEventListener('click', saveCompanyInfo);
    document.getElementById('btn-save-payment').addEventListener('click', savePaymentMethod);
    document.getElementById('btn-save-totals').addEventListener('click', saveTotalsInfo);
    document.getElementById('btn-save-footer').addEventListener('click', saveFooterInfo);

    // Download PDF Button
    document.getElementById('btn-download').addEventListener('click', downloadPDF);

    // Mobile Preview Toggle Button
    const btnTogglePreview = document.getElementById('btn-toggle-preview');
    if (btnTogglePreview) {
        btnTogglePreview.addEventListener('click', toggleMobilePreview);
    }

    // Dismiss overlay on backdrop click
    const previewContainer = document.querySelector('.preview-container');
    if (previewContainer) {
        previewContainer.addEventListener('click', (e) => {
            if (e.target === previewContainer && document.body.classList.contains('mobile-preview-active')) {
                toggleMobilePreview();
            }
        });
    }
}

// Update Item Data from Editor
function updateItemData(inputElement) {
    const card = inputElement.closest('.item-card');
    const id = parseInt(card.dataset.id);
    const item = itemsData.find(i => i.id === id);
    if (!item) return;

    if (inputElement.classList.contains('item-name-input')) item.name = inputElement.value;
    if (inputElement.classList.contains('item-desc-input')) item.desc = inputElement.value;
    if (inputElement.classList.contains('item-price-input')) item.price = parseFloat(inputElement.value) || 0;
    if (inputElement.classList.contains('item-qty-input')) item.qty = parseFloat(inputElement.value) || 0;
}

// Render Items in Editor Panel
function renderEditorItems() {
    const list = document.getElementById('editor-items-list');
    list.innerHTML = '';

    itemsData.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.dataset.id = item.id;
        
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.className = 'item-name-input';
        nameInput.value = item.name;
        nameInput.setAttribute('list', 'item-suggestions');
        
        nameInput.oninput = (e) => {
            item.name = e.target.value;
            
            // Auto-fill price if it matches history
            const matchedHistory = itemHistory.find(h => h.name.toLowerCase() === item.name.toLowerCase());
            if (matchedHistory && matchedHistory.price) {
                // Find the price input in this row and update it
                const priceInput = card.querySelector('.item-price-input');
                if (priceInput && (item.price === 0 || item.price === undefined)) {
                    item.price = matchedHistory.price;
                    priceInput.value = matchedHistory.price;
                }
            }
            syncToPreview();
        };

        // First set innerHTML for the rest of the card
        card.innerHTML = `
            <button class="btn-delete-item" title="Delete Item">&times;</button>
            <div class="form-group name-group">
                <label>Item Name</label>
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea class="item-desc-input" rows="2">${item.desc}</textarea>
            </div>
            <div class="row-flex">
                <div class="form-group">
                    <label>Price</label>
                    <input type="number" class="item-price-input" value="${item.price}" min="0" step="0.01">
                </div>
                <div class="form-group">
                    <label>Quantity</label>
                    <input type="number" class="item-qty-input" value="${item.qty}" min="1">
                </div>
            </div>
        `;
        
        // Then append the dynamically created name input to its group
        card.querySelector('.name-group').appendChild(nameInput);
        list.appendChild(card);

        // Delete listener
        card.querySelector('.btn-delete-item').addEventListener('click', () => {
            itemsData = itemsData.filter(i => i.id !== item.id);
            renderEditorItems();
            syncToPreview();
        });
    });
}

// Master function to sync all inputs to the preview side
function syncToPreview() {
    const getVal = (id) => document.getElementById(id).value;
    const formatStr = (str) => str.replace(/\n/g, '<br>'); // Simple newline formatting for HTML

    // 1. Invoice Details
    document.getElementById('preview-invoice-number').innerText = getVal('edit-invoice-number');
    
    // Format dates nicely
    const dateVal = getVal('edit-invoice-date');
    const dueDateVal = getVal('edit-invoice-due-date');
    document.getElementById('preview-invoice-date').innerText = dateVal ? new Date(dateVal).toLocaleDateString() : '';
    document.getElementById('preview-invoice-due-date').innerText = dueDateVal ? new Date(dueDateVal).toLocaleDateString() : '';

    // 2. Company Info
    document.getElementById('preview-company-name').innerText = getVal('edit-company-name');
    document.getElementById('preview-company-address').innerHTML = formatStr(getVal('edit-company-address'));

    // 3. Bill To
    document.getElementById('preview-client-name').innerText = getVal('edit-client-name');
    document.getElementById('preview-client-address').innerText = getVal('edit-client-address');

    // 4. Payment Method
    document.getElementById('preview-bank-name').innerText = getVal('edit-bank-name');
    document.getElementById('preview-account-holder').innerText = getVal('edit-account-holder');
    document.getElementById('preview-account-number').innerText = getVal('edit-account-number');

    // 5. Currency
    const currency = getVal('edit-currency') || '$';

    // 6. Items Table
    const previewItemsBody = document.getElementById('preview-items-body');
    previewItemsBody.innerHTML = '';
    
    let subtotal = 0;

    itemsData.forEach((item, index) => {
        const lineTotal = item.price * item.qty;
        subtotal += lineTotal;

        const row = document.createElement('div');
        row.className = 'invoice-row';
        row.innerHTML = `
            <div class="col-no">${index + 1}</div>
            <div class="col-desc">
                <div class="item-name">${item.name}</div>
                <div class="item-desc">${item.desc}</div>
            </div>
            <div class="col-price">${currency}${item.price.toFixed(2)}</div>
            <div class="col-qty">${item.qty}</div>
            <div class="col-total">${currency}${lineTotal.toFixed(2)}</div>
        `;
        previewItemsBody.appendChild(row);
    });

    // 7. Totals
    const taxRate = parseFloat(getVal('edit-tax-rate')) || 0;
    const discountAmount = parseFloat(getVal('edit-discount-amount')) || 0;

    const taxAmount = subtotal * (taxRate / 100);
    const grandTotal = subtotal + taxAmount - discountAmount;

    document.getElementById('preview-sub-total').innerText = `${currency}${subtotal.toFixed(2)}`;
    document.getElementById('preview-tax-percent').innerText = taxRate;
    document.getElementById('preview-tax-amount').innerText = `${currency}${taxAmount.toFixed(2)}`;
    document.getElementById('preview-discount-amount').innerText = `${currency}${discountAmount.toFixed(2)}`;
    document.getElementById('preview-grand-total').innerText = `${currency}${grandTotal.toFixed(2)}`;

    // 8. Footer
    document.getElementById('preview-owner-name').innerText = getVal('edit-owner-name');
    document.getElementById('preview-signature-text').innerText = getVal('edit-owner-name'); // Cursive
    document.getElementById('preview-owner-title').innerText = getVal('edit-owner-title');
    document.getElementById('preview-terms-text').innerText = getVal('edit-terms');
}

// LocalStorage Persistence
function saveInvoiceDetails() {
    const info = { invoiceNumber: document.getElementById('edit-invoice-number').value };
    localStorage.setItem('leaflet-invoice', JSON.stringify(info));
}

function saveItemHistory() {
    // Collect current items
    itemsData.forEach(item => {
        if (!item.name || item.name.trim() === '') return;
        
        const existingIndex = itemHistory.findIndex(h => h.name.toLowerCase() === item.name.trim().toLowerCase());
        
        if (existingIndex >= 0) {
            // Update price if they changed it
            itemHistory[existingIndex].price = item.price;
        } else {
            // Add new
            itemHistory.push({ name: item.name.trim(), price: item.price });
        }
    });
    
    // Keep last 50 items to prevent bloat
    if (itemHistory.length > 50) {
        itemHistory = itemHistory.slice(-50);
    }
    
    localStorage.setItem('leaflet-item-history', JSON.stringify(itemHistory));
    loadItemHistory(); // Refresh datalist
}

function loadItemHistory() {
    const historyStr = localStorage.getItem('leaflet-item-history');
    if (historyStr) {
        try {
            itemHistory = JSON.parse(historyStr);
        } catch (e) {
            itemHistory = [];
        }
    }
    
    const dataList = document.getElementById('item-suggestions');
    if (dataList) {
        dataList.innerHTML = '';
        itemHistory.forEach(item => {
            const option = document.createElement('option');
            option.value = item.name;
            dataList.appendChild(option);
        });
    }
}

function saveCompanyInfo() {
    const info = {
        name: document.getElementById('edit-company-name').value,
        address: document.getElementById('edit-company-address').value
    };
    localStorage.setItem('leaflet-company', JSON.stringify(info));
    alert('Company info saved to browser!');
}

function savePaymentMethod() {
    const info = {
        bankName: document.getElementById('edit-bank-name').value,
        accountHolder: document.getElementById('edit-account-holder').value,
        accountNumber: document.getElementById('edit-account-number').value
    };
    localStorage.setItem('leaflet-payment', JSON.stringify(info));
    alert('Payment method saved to browser!');
}

function saveTotalsInfo() {
    const info = {
        currency: document.getElementById('edit-currency').value,
        taxRate: document.getElementById('edit-tax-rate').value
    };
    localStorage.setItem('leaflet-totals', JSON.stringify(info));
    alert('Currency and Tax settings saved to browser!');
}

function saveFooterInfo() {
    const info = {
        ownerName: document.getElementById('edit-owner-name').value,
        ownerTitle: document.getElementById('edit-owner-title').value,
        terms: document.getElementById('edit-terms').value
    };
    localStorage.setItem('leaflet-footer', JSON.stringify(info));
    alert('Footer info saved to browser!');
}

function loadSettings() {
    const invoice = localStorage.getItem('leaflet-invoice');
    if (invoice) {
        const data = JSON.parse(invoice);
        if (data.invoiceNumber) {
            // Auto-increment logic
            const match = data.invoiceNumber.match(/^([^0-9]*)([0-9]+)([^0-9]*)$/);
            if (match) {
                const prefix = match[1];
                const numStr = match[2];
                const suffix = match[3];
                // Increment number but keep padding
                const nextNum = parseInt(numStr, 10) + 1;
                const paddedNum = nextNum.toString().padStart(numStr.length, '0');
                document.getElementById('edit-invoice-number').value = prefix + paddedNum + suffix;
            } else {
                document.getElementById('edit-invoice-number').value = data.invoiceNumber;
            }
        }
    }

    const company = localStorage.getItem('leaflet-company');
    if (company) {
        const data = JSON.parse(company);
        if(data.name) document.getElementById('edit-company-name').value = data.name;
        if(data.address) document.getElementById('edit-company-address').value = data.address;
    }

    const payment = localStorage.getItem('leaflet-payment');
    if (payment) {
        const data = JSON.parse(payment);
        if(data.bankName) document.getElementById('edit-bank-name').value = data.bankName;
        if(data.accountHolder) document.getElementById('edit-account-holder').value = data.accountHolder;
        if(data.accountNumber) document.getElementById('edit-account-number').value = data.accountNumber;
    }

    const totals = localStorage.getItem('leaflet-totals');
    if (totals) {
        const data = JSON.parse(totals);
        if(data.currency) document.getElementById('edit-currency').value = data.currency;
        if(data.taxRate) document.getElementById('edit-tax-rate').value = data.taxRate;
    }

    const footer = localStorage.getItem('leaflet-footer');
    if (footer) {
        const data = JSON.parse(footer);
        if(data.ownerName) document.getElementById('edit-owner-name').value = data.ownerName;
        if(data.ownerTitle) document.getElementById('edit-owner-title').value = data.ownerTitle;
        if(data.terms) document.getElementById('edit-terms').value = data.terms;
    }
}

// PDF Export
function downloadPDF() {
    // Auto-save invoice number and item history on download
    saveInvoiceDetails();
    saveItemHistory();
    
    const element = document.getElementById('invoice');
    const invoiceNumber = document.getElementById('edit-invoice-number').value.replace(/[^0-9a-zA-Z-]/g, '');
    
    // Show a loading indication on the button
    const btn = document.getElementById('btn-download');
    const originalText = btn.innerText;
    btn.innerText = 'Generating...';
    btn.disabled = true;

    // Capture with html2canvas, using onclone to ensure the element is visible and properly styled
    html2canvas(element, { 
        scale: 2, 
        useCORS: true,
        onclone: (clonedDoc) => {
            const clonedContainer = clonedDoc.querySelector('.preview-container');
            const clonedInvoice = clonedDoc.getElementById('invoice');
            
            // Force container to be visible so html2canvas can capture its contents
            if (clonedContainer) {
                clonedContainer.style.display = 'flex';
                clonedContainer.style.position = 'absolute'; // avoid affecting layout
                clonedContainer.style.overflow = 'visible';
                clonedContainer.style.alignItems = 'flex-start';
            }
            
            // Remove transform from the cloned invoice to capture at full A4 size
            if (clonedInvoice) {
                clonedInvoice.style.transform = 'none';
                clonedInvoice.style.boxShadow = 'none';
            }
        }
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/jpeg', 0.98);
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        // Force the image onto exactly one A4 page (210 x 297 mm)
        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
        pdf.save(`Invoice-${invoiceNumber || 'New'}.pdf`);
        
        // Restore button state
        btn.innerText = originalText;
        btn.disabled = false;
    }).catch(err => {
        console.error("PDF Generation Error:", err);
        btn.innerText = originalText;
        btn.disabled = false;
        alert("There was an error generating the PDF. Please try again.");
    });
}
