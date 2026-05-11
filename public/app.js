const API_URL = '/api';
let currentUser = null;
let currentAuthRole = 'student';
let activeSection = 'home';
let currentSearchQuery = '';

function showAlert(message, type = 'info') {
    const toastEl = document.getElementById('liveToast');
    const toastMessage = document.getElementById('toast-message');
    const toastTitle = document.getElementById('toast-title');
    const toastIcon = document.getElementById('toast-icon');

    toastMessage.textContent = message;
    toastTitle.textContent = type === 'error' ? 'Error' : 'Success';
    toastIcon.className = type === 'error' ? 'fas fa-exclamation-circle text-danger' : 'fas fa-check-circle text-success';
    
    const toast = new bootstrap.Toast(toastEl);
    toast.show();
}

function showLoader() {
    document.getElementById('loader-overlay').classList.remove('d-none');
}

function hideLoader() {
    document.getElementById('loader-overlay').classList.add('d-none');
}

// --- Session Handling ---
async function checkSession() {
    try {
        const res = await fetch(`${API_URL}/me`, { credentials: 'include' });
        if (res.ok) {
            const data = await res.json();
            currentUser = data.user;
            initDashboard();
        }
    } catch (err) {
        console.log('No active session');
    }
}

window.onload = () => {
    checkSession();
    // Load saved theme
    const isLight = localStorage.getItem('theme') === 'light';
    if (isLight) {
        document.body.classList.add('light-mode');
        document.querySelectorAll('#theme-toggle i, #theme-toggle-auth i').forEach(icon => {
            icon.className = 'fas fa-sun';
        });
        document.querySelectorAll('#theme-toggle, #theme-toggle-auth').forEach(btn => {
            btn.classList.replace('btn-outline-light', 'btn-outline-dark');
        });
    }

    // Password Toggle Logic
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('toggle-password')) {
            const input = e.target.parentElement.querySelector('input');
            if (input) {
                const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
                input.setAttribute('type', type);
                e.target.classList.toggle('fa-eye');
                e.target.classList.toggle('fa-eye-slash');
            }
        }
    });
};

function toggleTheme() {
    const isLight = document.body.classList.toggle('light-mode');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    
    // Update all theme icons
    document.querySelectorAll('#theme-toggle i, #theme-toggle-auth i').forEach(icon => {
        icon.className = isLight ? 'fas fa-sun' : 'fas fa-moon';
    });

    // Update button border colors for light mode
    document.querySelectorAll('#theme-toggle, #theme-toggle-auth').forEach(btn => {
        if (isLight) {
            btn.classList.replace('btn-outline-light', 'btn-outline-dark');
        } else {
            btn.classList.replace('btn-outline-dark', 'btn-outline-light');
        }
    });
}

// --- Auth Functions ---

function switchAuthRole(role) {
    currentAuthRole = role;
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
}

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorEl = document.getElementById('login-error');

    try {
        const res = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, role: currentAuthRole }),
            credentials: 'include'
        });
        const data = await res.json();

        if (data.success) {
            currentUser = data.user;
            initDashboard();
            showAlert(`Welcome back, ${currentUser.name || currentUser.email}!`, 'success');
        } else {
            showAlert(data.message, 'error');
        }
    } catch (err) {
        showAlert('Server error. Is the backend running?', 'error');
    }
});

async function logout() {
    try {
        await fetch(`${API_URL}/logout`, { method: 'POST', credentials: 'include' });
    } catch (err) {
        console.error('Logout failed', err);
    }
    currentUser = null;
    document.getElementById('login-form').reset();
    document.getElementById('dashboard-view').classList.replace('d-flex', 'd-none');
    document.getElementById('auth-view').classList.replace('d-none', 'd-flex');
    window.location.hash = '';
}

// --- Navigation ---

function initDashboard() {
    document.getElementById('auth-view').classList.replace('d-flex', 'd-none');
    const dashboard = document.getElementById('dashboard-view');
    dashboard.classList.remove('d-none');
    dashboard.classList.add('d-flex');
    
    const nameEl = document.getElementById('user-name-nav') || document.getElementById('user-name');
    const roleEl = document.getElementById('user-role-nav') || document.getElementById('user-role');
    const avatarEl = document.getElementById('user-avatar-nav') || document.getElementById('user-avatar');

    if (nameEl) nameEl.textContent = currentUser.name || currentUser.email.split('@')[0];
    if (roleEl) roleEl.textContent = currentUser.role;
    if (avatarEl) avatarEl.textContent = (currentUser.name || currentUser.email)[0].toUpperCase();

    // Role based visibility
    if (currentUser.role === 'superadmin') {
        document.querySelectorAll('.superadmin-only').forEach(el => el.classList.remove('d-none'));
        document.querySelectorAll('.admin-only').forEach(el => el.classList.remove('d-none'));
        document.querySelectorAll('.student-only').forEach(el => el.classList.add('d-none'));
    } else if (currentUser.role === 'admin') {
        document.querySelectorAll('.superadmin-only').forEach(el => el.classList.add('d-none'));
        document.querySelectorAll('.admin-only').forEach(el => el.classList.remove('d-none'));
        document.querySelectorAll('.student-only').forEach(el => el.classList.add('d-none'));
    } else {
        document.querySelectorAll('.superadmin-only').forEach(el => el.classList.add('d-none'));
        document.querySelectorAll('.admin-only').forEach(el => el.classList.add('d-none'));
        document.querySelectorAll('.student-only').forEach(el => el.classList.remove('d-none'));
    }

    showSection('home');
}

function showSection(sectionId) {
    activeSection = sectionId;
    currentSearchQuery = '';
    const searchInput = document.getElementById('global-search');
    if (searchInput) searchInput.value = '';

    document.querySelectorAll('.dashboard-section').forEach(sec => sec.classList.add('d-none'));
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    
    const section = document.getElementById(`section-${sectionId}`);
    if (section) {
        section.classList.remove('d-none');
        let title = sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
        if (sectionId === 'add-book') title = 'Add New Book';
        if (sectionId === 'edit-book') title = 'Edit Book Details';
        document.getElementById('section-title').textContent = title;
    }

    // Close Bootstrap navbar collapse on click (mobile)
    try {
        const navbarCollapse = document.getElementById('mainNavbar');
        if (navbarCollapse && navbarCollapse.classList.contains('show') && typeof bootstrap !== 'undefined') {
            const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse) || new bootstrap.Collapse(navbarCollapse);
            bsCollapse.hide();
        }
    } catch (e) {
        console.log('Navbar collapse failed:', e);
    }

    if (sectionId === 'home') loadStats();
    if (sectionId === 'books') loadBooks();
    if (sectionId === 'users') loadUsers();
    if (sectionId === 'requests') loadRequests();
    if (sectionId === 'mybooks') loadMyBooks();
    if (sectionId === 'admins') loadAdmins();
    if (sectionId === 'search') loadSearch();
}

// --- Pagination State ---
const ITEMS_PER_PAGE = 8;
let currentPages = { books: 1, users: 1, requests: 1, mybooks: 1, admins: 1, search: 1 };
let listData = { books: [], users: [], requests: [], mybooks: [], admins: [], search: [] };

function renderPagination(totalItems, sectionKey, containerId) {
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    const currentPage = currentPages[sectionKey];
    let html = `<nav aria-label="Page navigation" class="mt-4"><ul class="pagination justify-content-center">`;

    html += `<li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="changePage('${sectionKey}', ${currentPage - 1}); return false;" aria-label="Previous">
                    <span aria-hidden="true">&laquo;</span>
                </a>
             </li>`;

    for (let i = 1; i <= totalPages; i++) {
        html += `<li class="page-item ${currentPage === i ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="changePage('${sectionKey}', ${i}); return false;">${i}</a>
                 </li>`;
    }

    html += `<li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="changePage('${sectionKey}', ${currentPage + 1}); return false;" aria-label="Next">
                    <span aria-hidden="true">&raquo;</span>
                </a>
             </li>`;

    html += `</ul></nav>`;
    container.innerHTML = html;
}

function changePage(sectionKey, newPage) {
    const totalItems = getFilteredData(sectionKey).length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    if (newPage < 1 || newPage > totalPages) return;
    
    currentPages[sectionKey] = newPage;
    
    if (sectionKey === 'books') renderBooks();
    if (sectionKey === 'users') renderUsers();
    if (sectionKey === 'requests') renderRequests();
    if (sectionKey === 'mybooks') renderMyBooks();
    if (sectionKey === 'admins') renderAdmins();
    if (sectionKey === 'search') renderSearchResults();
}

function getFilteredData(sectionKey) {
    if (!currentSearchQuery) return listData[sectionKey];
    const q = currentSearchQuery.toLowerCase();
    
    return listData[sectionKey].filter(item => {
        if (sectionKey === 'books') return item.bookname?.toLowerCase().includes(q) || item.bookaudor?.toLowerCase().includes(q) || item.serial?.toLowerCase().includes(q);
        if (sectionKey === 'users') return item.name?.toLowerCase().includes(q) || item.email?.toLowerCase().includes(q);
        if (sectionKey === 'admins') return item.email?.toLowerCase().includes(q) || item.role?.toLowerCase().includes(q);
        if (sectionKey === 'requests') return item.username?.toLowerCase().includes(q) || item.bookname?.toLowerCase().includes(q);
        if (sectionKey === 'mybooks') return item.issuebook?.toLowerCase().includes(q);
        return true;
    });
}

function getPaginatedData(sectionKey) {
    const filtered = getFilteredData(sectionKey);
    const page = currentPages[sectionKey];
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filtered.slice(start, end);
}

// Global Search Listener
document.getElementById('global-search')?.addEventListener('input', (e) => {
    currentSearchQuery = e.target.value;
    if (activeSection !== 'home') {
        currentPages[activeSection] = 1;
        if (activeSection === 'books') renderBooks();
        if (activeSection === 'users') renderUsers();
        if (activeSection === 'requests') renderRequests();
        if (activeSection === 'mybooks') renderMyBooks();
        if (activeSection === 'admins') renderAdmins();
        if (activeSection === 'search') renderSearchResults();
    }
});

// --- Data Loading ---

let availabilityChart = null;
let branchChartInstance = null;

async function loadStats() {
    showLoader();
    try {
        const books = await (await fetch(`${API_URL}/books`, { credentials: 'include' })).json();
        const users = await (await fetch(`${API_URL}/users`, { credentials: 'include' })).json();
        const requests = await (await fetch(`${API_URL}/requests`, { credentials: 'include' })).json();
        
        const totalBooks = books.reduce((acc, b) => acc + (b.bookquantity || 0), 0);
        const issuedBooks = books.reduce((acc, b) => acc + (b.bookrent || 0), 0);
        const availableBooks = totalBooks - issuedBooks;

        document.getElementById('stat-total-books').textContent = books.length;
        document.getElementById('stat-issued-books').textContent = issuedBooks;
        document.getElementById('stat-active-users').textContent = users.length;
        document.getElementById('stat-pending-requests').textContent = requests.length;

        // --- Render Charts ---
        renderAvailabilityChart(availableBooks, issuedBooks);
        renderBranchChart(books);
    } finally {
        hideLoader();
    }
}

function renderAvailabilityChart(available, issued) {
    const ctx = document.getElementById('bookAvailabilityChart');
    if (!ctx) return;

    if (availabilityChart) availabilityChart.destroy();

    const textColor = getComputedStyle(document.body).getPropertyValue('--text-main').trim() || '#f8fafc';
    const dimColor = getComputedStyle(document.body).getPropertyValue('--text-dim').trim() || '#94a3b8';

    availabilityChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Available', 'Issued'],
            datasets: [{
                data: [available, issued],
                backgroundColor: [
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(99, 102, 241, 0.8)'
                ],
                borderColor: [
                    'rgba(16, 185, 129, 1)',
                    'rgba(99, 102, 241, 1)'
                ],
                borderWidth: 2,
                hoverOffset: 8,
                spacing: 4,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            cutout: '65%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: dimColor,
                        font: { family: 'Inter', size: 12, weight: '500' },
                        padding: 20,
                        usePointStyle: true,
                        pointStyleWidth: 12
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    titleColor: '#f8fafc',
                    bodyColor: '#94a3b8',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1,
                    cornerRadius: 12,
                    padding: 12
                }
            },
            animation: {
                animateRotate: true,
                duration: 1000
            }
        }
    });
}

function renderBranchChart(books) {
    const ctx = document.getElementById('branchChart');
    if (!ctx) return;

    if (branchChartInstance) branchChartInstance.destroy();

    // Count books per branch
    const branchMap = {};
    books.forEach(b => {
        const branch = b.branch || 'General';
        branchMap[branch] = (branchMap[branch] || 0) + (b.bookquantity || 1);
    });

    const labels = Object.keys(branchMap);
    const data = Object.values(branchMap);

    const colors = [
        'rgba(99, 102, 241, 0.75)',
        'rgba(16, 185, 129, 0.75)',
        'rgba(245, 158, 11, 0.75)',
        'rgba(239, 68, 68, 0.75)',
        'rgba(139, 92, 246, 0.75)',
        'rgba(6, 182, 212, 0.75)',
        'rgba(236, 72, 153, 0.75)',
        'rgba(34, 197, 94, 0.75)'
    ];

    const dimColor = getComputedStyle(document.body).getPropertyValue('--text-dim').trim() || '#94a3b8';

    branchChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Books',
                data: data,
                backgroundColor: labels.map((_, i) => colors[i % colors.length]),
                borderColor: labels.map((_, i) => colors[i % colors.length].replace('0.75', '1')),
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false,
                barPercentage: 0.6,
                categoryPercentage: 0.7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    titleColor: '#f8fafc',
                    bodyColor: '#94a3b8',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1,
                    cornerRadius: 12,
                    padding: 12
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: {
                        color: dimColor,
                        font: { family: 'Inter', size: 11, weight: '500' }
                    },
                    border: { display: false }
                },
                y: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)',
                        drawBorder: false
                    },
                    ticks: {
                        color: dimColor,
                        font: { family: 'Inter', size: 11 },
                        stepSize: 1
                    },
                    border: { display: false },
                    beginAtZero: true
                }
            },
            animation: {
                duration: 800,
                easing: 'easeOutQuart'
            }
        }
    });
}

async function loadBooks() {
    showLoader();
    try {
        listData.books = await (await fetch(`${API_URL}/books`, { credentials: 'include' })).json();
        currentPages.books = 1;
        renderBooks();
    } finally {
        hideLoader();
    }
}

function renderBooks() {
    const container = document.getElementById('book-list');
    container.innerHTML = '';
    
    const paginatedBooks = getPaginatedData('books');

    paginatedBooks.forEach(book => {
        const card = document.createElement('div');
        card.className = 'book-card glass-card';
        card.style.cursor = 'pointer';
        card.innerHTML = `
            <img src="${book.bookpic || 'https://images.unsplash.com/photo-1543005139-7645854d93e5?w=400'}" 
                 onerror="this.src='https://images.unsplash.com/photo-1543005139-7645854d93e5?w=400'" 
                 alt="Book Cover">
            <div style="display:flex; justify-content:space-between; align-items:start">
                <span class="badge" style="background:rgba(255,255,255,0.1); margin-bottom:5px">#${book.serial || 'N/A'}</span>
                ${(currentUser.role === 'admin' || currentUser.role === 'superadmin') ? `
                    <div class="d-flex gap-2">
                        <button class="logout-btn book-action-btn" style="color:var(--primary)" onclick="event.stopPropagation(); openEditPage('${book.id}')"><i class="fas fa-edit"></i></button>
                        <button class="logout-btn book-action-btn" style="color:#ef4444" onclick="event.stopPropagation(); deleteBook('${book.id}')"><i class="fas fa-trash"></i></button>
                    </div>` : ''}
            </div>
            <h4>${book.bookname}</h4>
            <p>${book.bookaudor}</p>
            <p style="font-size: 0.75rem; opacity: 0.8;">${book.bookpub || 'No Publisher'} | ${book.branch || 'General'}</p>
            <div style="display:flex; justify-content:space-between; align-items:center">
                <span class="badge">${book.bookava} available</span>
                ${currentUser.role !== 'admin' && currentUser.role !== 'superadmin' ? `<button class="primary-btn book-action-btn" style="width:auto; padding:5px 10px" onclick="event.stopPropagation(); requestBook('${book.id}')">Request</button>` : ''}
            </div>
        `;
        card.addEventListener('click', () => showBookDetail(book.id));
        container.appendChild(card);
    });
    
    renderPagination(getFilteredData('books').length, 'books', 'books-pagination');
}

async function loadSearch() {
    showLoader();
    try {
        // If we haven't loaded books yet, load them so we can filter
        if (listData.books.length === 0) {
            listData.books = await (await fetch(`${API_URL}/books`, { credentials: 'include' })).json();
        }
        // Initially, search results are empty until user searches
        listData.search = [];
        currentPages.search = 1;
        renderSearchResults();
    } finally {
        hideLoader();
    }
}

function performAdvancedSearch() {
    const titleQ = document.getElementById('adv-search-title').value.toLowerCase().trim();
    const authorQ = document.getElementById('adv-search-author').value.toLowerCase().trim();
    const branchQ = document.getElementById('adv-search-branch').value.toLowerCase().trim();

    listData.search = listData.books.filter(b => {
        const matchTitle = !titleQ || (b.bookname && b.bookname.toLowerCase().includes(titleQ));
        const matchAuthor = !authorQ || (b.bookaudor && b.bookaudor.toLowerCase().includes(authorQ));
        const matchBranch = !branchQ || (b.branch && b.branch.toLowerCase().includes(branchQ));
        return matchTitle && matchAuthor && matchBranch;
    });

    currentPages.search = 1;
    renderSearchResults();
}

function renderSearchResults() {
    const container = document.getElementById('search-results-list');
    container.innerHTML = '';
    
    // In search mode, getFilteredData('search') will return listData.search
    // plus any global search filtering if applied
    const paginatedBooks = getPaginatedData('search');

    if (paginatedBooks.length === 0 && listData.search.length === 0) {
        container.innerHTML = '<p class="text-dim" style="grid-column: 1 / -1; text-align: center; padding: 2rem;">No books found matching your criteria. Try adjusting your search.</p>';
    }

    paginatedBooks.forEach(book => {
        const card = document.createElement('div');
        card.className = 'book-card glass-card';
        card.style.cursor = 'pointer';
        card.innerHTML = `
            <img src="${book.bookpic || 'https://images.unsplash.com/photo-1543005139-7645854d93e5?w=400'}" 
                 onerror="this.src='https://images.unsplash.com/photo-1543005139-7645854d93e5?w=400'" 
                 alt="Book Cover">
            <div style="display:flex; justify-content:space-between; align-items:start">
                <span class="badge" style="background:rgba(255,255,255,0.1); margin-bottom:5px">#${book.serial || 'N/A'}</span>
                ${(currentUser.role === 'admin' || currentUser.role === 'superadmin') ? `
                    <div class="d-flex gap-2">
                        <button class="logout-btn book-action-btn" style="color:var(--primary)" onclick="event.stopPropagation(); openEditPage('${book.id}')"><i class="fas fa-edit"></i></button>
                        <button class="logout-btn book-action-btn" style="color:#ef4444" onclick="event.stopPropagation(); deleteBook('${book.id}')"><i class="fas fa-trash"></i></button>
                    </div>` : ''}
            </div>
            <h4>${book.bookname}</h4>
            <p>${book.bookaudor}</p>
            <p style="font-size: 0.75rem; opacity: 0.8;">${book.bookpub || 'No Publisher'} | ${book.branch || 'General'}</p>
            <div style="display:flex; justify-content:space-between; align-items:center">
                <span class="badge">${book.bookava} available</span>
                ${currentUser.role !== 'admin' && currentUser.role !== 'superadmin' ? `<button class="primary-btn book-action-btn" style="width:auto; padding:5px 10px" onclick="event.stopPropagation(); requestBook('${book.id}')">Request</button>` : ''}
            </div>
        `;
        card.addEventListener('click', () => showBookDetail(book.id));
        container.appendChild(card);
    });
    
    renderPagination(getFilteredData('search').length, 'search', 'search-pagination');
}

async function showBookDetail(bookId) {
    try {
        const res = await fetch(`${API_URL}/books/${bookId}`, { credentials: 'include' });
        if (!res.ok) { showAlert('Book not found', 'error'); return; }
        const book = await res.json();

        // Hide all sections and show book detail
        document.querySelectorAll('.dashboard-section').forEach(sec => sec.classList.add('d-none'));
        document.getElementById('section-bookdetail').classList.remove('d-none');
        document.getElementById('section-title').textContent = book.bookname;
        activeSection = 'bookdetail';

        // Populate data
        const fallbackImg = 'https://images.unsplash.com/photo-1543005139-7645854d93e5?w=400';
        document.getElementById('detail-book-img').src = book.bookpic || fallbackImg;
        document.getElementById('detail-book-img').onerror = function() { this.src = fallbackImg; };
        document.getElementById('detail-book-serial').textContent = `#${book.serial || 'N/A'}`;
        document.getElementById('detail-book-branch').textContent = book.branch || 'General';
        document.getElementById('detail-book-name').textContent = book.bookname;
        document.getElementById('detail-book-author').querySelector('span').textContent = book.bookaudor || 'Unknown Author';
        document.getElementById('detail-book-publisher').querySelector('span').textContent = book.bookpub || 'Unknown Publisher';
        
        const descEl = document.getElementById('detail-book-description');
        if (book.bookdetail) {
            descEl.classList.remove('d-none');
            descEl.querySelector('p').textContent = book.bookdetail;
        } else {
            descEl.classList.add('d-none');
        }

        document.getElementById('detail-book-price').textContent = book.bookprice ? `₹${book.bookprice}` : 'Free';
        document.getElementById('detail-book-quantity').textContent = book.bookquantity || 0;
        document.getElementById('detail-book-available').textContent = book.bookava || 0;
        document.getElementById('detail-book-issued').textContent = book.bookrent || 0;

        // Action buttons based on role
        const actionsEl = document.getElementById('detail-book-actions');
        let actionsHtml = '';
        if (currentUser.role !== 'admin' && currentUser.role !== 'superadmin') {
            actionsHtml += `<button class="primary-btn" onclick="requestBook('${book.id}'); showAlert('Request sent!', 'success')">
                <i class="fas fa-hand-holding-heart me-2"></i>Request This Book
            </button>`;
        }
        if (currentUser.role === 'admin' || currentUser.role === 'superadmin') {
            actionsHtml += `
            <button class="primary-btn me-2" onclick="openEditPage('${book.id}')">
                <i class="fas fa-edit me-2"></i>Edit Book
            </button>
            <button class="delete-btn" onclick="deleteBook('${book.id}').then(() => showSection('books'))">
                <i class="fas fa-trash me-2"></i>Delete Book
            </button>`;
        }
        actionsEl.innerHTML = actionsHtml;

    } catch (err) {
        showAlert('Failed to load book details', 'error');
        console.error(err);
    }
}

async function loadUsers() {
    showLoader();
    try {
        listData.users = await (await fetch(`${API_URL}/users`, { credentials: 'include' })).json();
        currentPages.users = 1;
        renderUsers();
    } finally {
        hideLoader();
    }
}

function renderUsers() {
    const tbody = document.getElementById('user-table-body');
    tbody.innerHTML = '';
    
    const paginatedUsers = getPaginatedData('users');

    paginatedUsers.forEach(user => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td><span class="badge" style="background:rgba(255,255,255,0.1)">${user.type}</span></td>
            <td><button class="logout-btn" onclick="deleteUser('${user.id}')"><i class="fas fa-trash"></i></button></td>
        `;
        tbody.appendChild(tr);
    });
    
    renderPagination(getFilteredData('users').length, 'users', 'users-pagination');
}

async function loadRequests() {
    showLoader();
    try {
        listData.requests = await (await fetch(`${API_URL}/requests`, { credentials: 'include' })).json();
        currentPages.requests = 1;
        renderRequests();
    } finally {
        hideLoader();
    }
}

function renderRequests() {
    const tbody = document.getElementById('request-table-body');
    tbody.innerHTML = '';
    
    const paginatedRequests = getPaginatedData('requests');

    paginatedRequests.forEach(req => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${req.username}</td>
            <td>${req.bookname}</td>
            <td>${req.issuedays}</td>
            <td><button class="primary-btn" style="width:auto; padding:5px 15px" onclick="approveRequest('${req.id}')">Approve</button></td>
        `;
        tbody.appendChild(tr);
    });
    
    renderPagination(getFilteredData('requests').length, 'requests', 'requests-pagination');
}

async function loadMyBooks() {
    showLoader();
    try {
        listData.mybooks = await (await fetch(`${API_URL}/issues/${currentUser.id}`, { credentials: 'include' })).json();
        currentPages.mybooks = 1;
        renderMyBooks();
    } finally {
        hideLoader();
    }
}

function renderMyBooks() {
    const tbody = document.getElementById('my-books-table-body');
    tbody.innerHTML = '';
    
    const paginatedMyBooks = getPaginatedData('mybooks');

    paginatedMyBooks.forEach(issue => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${issue.issuebook}</td>
            <td>${issue.issuedate}</td>
            <td>${issue.issuereturn}</td>
            <td>₹${issue.fine}</td>
        `;
        tbody.appendChild(tr);
    });
    
    renderPagination(getFilteredData('mybooks').length, 'mybooks', 'mybooks-pagination');
}

async function loadAdmins() {
    showLoader();
    try {
        listData.admins = await (await fetch(`${API_URL}/admins`, { credentials: 'include' })).json();
        currentPages.admins = 1;
        renderAdmins();
    } finally {
        hideLoader();
    }
}

function renderAdmins() {
    const tbody = document.getElementById('admin-table-body');
    tbody.innerHTML = '';
    
    const paginatedAdmins = getPaginatedData('admins');

    paginatedAdmins.forEach(admin => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${admin.email}</td>
            <td><span class="badge">${admin.role}</span></td>
            <td><button class="logout-btn" onclick="deleteAdmin('${admin.id}')"><i class="fas fa-trash"></i></button></td>
        `;
        tbody.appendChild(tr);
    });
    
    renderPagination(getFilteredData('admins').length, 'admins', 'admins-pagination');
}

// --- Action Functions ---

async function requestBook(bookId) {
    const res = await fetch(`${API_URL}/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userid: currentUser.id, bookid: bookId }),
        credentials: 'include'
    });
    const data = await res.json();
    if (res.ok) {
        showAlert('Request sent to admin!', 'success');
    } else {
        showAlert(data.message || 'Failed to send request', 'error');
    }
}

async function approveRequest(requestId) {
    showLoader();
    try {
        const res = await fetch(`${API_URL}/approve-request`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ requestId }),
            credentials: 'include'
        });
        if (res.ok) loadRequests();
    } finally {
        hideLoader();
    }
}

async function deleteUser(id) {
    if (confirm('Delete this student?')) {
        showLoader();
        try {
            await fetch(`${API_URL}/users/${id}`, { method: 'DELETE', credentials: 'include' });
            loadUsers();
        } finally {
            hideLoader();
        }
    }
}

async function deleteAdmin(id) {
    if (confirm('Delete this admin?')) {
        showLoader();
        try {
            await fetch(`${API_URL}/admins/${id}`, { method: 'DELETE', credentials: 'include' });
            loadAdmins();
        } finally {
            hideLoader();
        }
    }
}

async function deleteBook(id) {
    if (confirm('Are you sure you want to delete this book?')) {
        const res = await fetch(`${API_URL}/books/${id}`, { method: 'DELETE', credentials: 'include' });
        if (res.ok) loadBooks();
    }
}

async function deleteBook(id) {
    if (confirm('Are you sure you want to delete this book?')) {
        showLoader();
        try {
            const res = await fetch(`${API_URL}/books/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (res.ok) {
                showAlert('Book deleted successfully!', 'success');
                loadBooks();
            } else {
                showAlert('Failed to delete book', 'error');
            }
        } catch (err) {
            console.error('Delete error:', err);
            showAlert('Network error', 'error');
        } finally {
            hideLoader();
        }
    }
}

// --- UI Helpers ---

function toggleModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.toggle('d-none');
    
    const form = modal.querySelector('form');
    if (form) {
        // Reset disabled states for photo/URL fields
        const photoInput = form.querySelector('input[type="file"]');
        const urlInput = form.querySelector('input[name="bookpic"]');
        if (photoInput) { photoInput.disabled = false; photoInput.style.opacity = '1'; }
        if (urlInput) { urlInput.disabled = false; urlInput.style.opacity = '1'; }

        if (modal.classList.contains('d-none')) {
            form.reset();
        }
    }
}

document.getElementById('add-book-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    showLoader();
    try {
        const res = await fetch(`${API_URL}/books`, {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });
        
        let data;
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            data = await res.json();
        }

        if (res.ok) {
            showSection('books');
            showAlert('Book added successfully!', 'success');
        } else {
            showAlert(data?.error || data?.message || `Server error: ${res.status}`, 'error');
        }
    } catch (err) {
        console.error('Add Book error:', err);
        showAlert('Network error or server is down', 'error');
    } finally {
        hideLoader();
    }
});

async function openEditPage(bookId) {
    showLoader();
    try {
        const res = await fetch(`${API_URL}/books/${bookId}`, { credentials: 'include' });
        if (!res.ok) throw new Error('Book not found');
        const book = await res.json();
        
        // Ensure we have an ID
        const id = book.id || book._id;
        if (!id) throw new Error('Invalid book data');

        showSection('edit-book');

        document.getElementById('edit-book-id').value = id;
        document.getElementById('edit-book-serial').value = book.serial || '';
        document.getElementById('edit-book-name').value = book.bookname || '';
        document.getElementById('edit-book-pic').value = book.bookpic || '';
        document.getElementById('edit-book-author').value = book.bookaudor || '';
        document.getElementById('edit-book-pub').value = book.bookpub || '';
        document.getElementById('edit-book-branch').value = book.branch || '';
        document.getElementById('edit-book-price').value = book.bookprice || '';
        document.getElementById('edit-book-quantity').value = book.bookquantity || '';
        document.getElementById('edit-book-detail').value = book.bookdetail || '';
        
        // Reset disabled states for photo/URL fields
        const photoInput = document.getElementById('edit-book-photo');
        const urlInput = document.getElementById('edit-book-pic');
        if (photoInput) { photoInput.disabled = false; photoInput.style.opacity = '1'; }
        if (urlInput) { urlInput.disabled = false; urlInput.style.opacity = '1'; }

    } catch (err) {
        console.error('Error opening edit page:', err);
        showAlert(err.message || 'Failed to load book data', 'error');
    } finally {
        hideLoader();
    }
}

document.getElementById('edit-book-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-book-id').value;
    
    if (!id) {
        showAlert('Error: Book ID is missing. Please close and try again.', 'error');
        return;
    }

    const formData = new FormData(e.target);
    
    showLoader();
    try {
        const res = await fetch(`${API_URL}/books/update/${id}`, {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });
        
        const data = await res.json();
        
        if (res.ok && data.success) {
            showSection('books');
            if (activeSection === 'bookdetail') showBookDetail(id);
            showAlert('Book updated successfully!', 'success');
        } else {
            showAlert(data.error || data.message || 'Failed to update book', 'error');
        }
    } catch (err) {
        console.error('Update error:', err);
        showAlert('Network or server error occurred', 'error');
    } finally {
        hideLoader();
    }
});

// Mutual exclusion for Photo Upload vs URL
document.getElementById('bookphoto').addEventListener('change', (e) => {
    const urlInput = document.getElementById('bookpic-url');
    if (e.target.files.length > 0) {
        urlInput.disabled = true;
        urlInput.style.opacity = '0.5';
    } else {
        urlInput.disabled = false;
        urlInput.style.opacity = '1';
    }
});

document.getElementById('bookpic-url').addEventListener('input', (e) => {
    const fileInput = document.getElementById('bookphoto');
    if (e.target.value.trim() !== '') {
        fileInput.disabled = true;
        fileInput.style.opacity = '0.5';
    } else {
        fileInput.disabled = false;
        fileInput.style.opacity = '1';
    }
});

// Mutual exclusion for Edit Modal
document.getElementById('edit-book-photo').addEventListener('change', (e) => {
    const urlInput = document.getElementById('edit-book-pic');
    if (e.target.files.length > 0) {
        urlInput.disabled = true;
        urlInput.style.opacity = '0.5';
    } else {
        urlInput.disabled = false;
        urlInput.style.opacity = '1';
    }
});

document.getElementById('edit-book-pic').addEventListener('input', (e) => {
    const fileInput = document.getElementById('edit-book-photo');
    if (e.target.value.trim() !== '') {
        fileInput.disabled = true;
        fileInput.style.opacity = '0.5';
    } else {
        fileInput.disabled = false;
        fileInput.style.opacity = '1';
    }
});

document.getElementById('add-user-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const user = Object.fromEntries(formData.entries());
    
    showLoader();
    try {
        const res = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        });
        if (res.ok) {
            toggleModal('add-user-modal');
            loadUsers();
            showAlert('User added successfully!', 'success');
        } else {
            showAlert('Failed to add user', 'error');
        }
    } finally {
        hideLoader();
    }
});

document.getElementById('add-admin-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const admin = Object.fromEntries(formData.entries());
    
    showLoader();
    try {
        const res = await fetch(`${API_URL}/admins`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(admin)
        });
        if (res.ok) {
            toggleModal('add-admin-modal');
            loadAdmins();
            showAlert('Admin added successfully!', 'success');
        } else {
            showAlert('Failed to add admin', 'error');
        }
    } finally {
        hideLoader();
    }
});
