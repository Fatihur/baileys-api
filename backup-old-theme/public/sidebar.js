// Sidebar with Categories - Complete functionality

// Mobile sidebar toggle
function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar');
  sidebar.classList.toggle('show');
  
  // Close sidebar when clicking outside on mobile
  if (sidebar.classList.contains('show')) {
    document.addEventListener('click', closeSidebarOnClickOutside);
  } else {
    document.removeEventListener('click', closeSidebarOnClickOutside);
  }
}

function closeSidebarOnClickOutside(event) {
  const sidebar = document.querySelector('.sidebar');
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const sidebarToggle = document.querySelector('.sidebar-toggle');
  
  if (!sidebar.contains(event.target) && 
      event.target !== menuBtn && 
      event.target !== sidebarToggle &&
      !menuBtn?.contains(event.target) &&
      !sidebarToggle?.contains(event.target)) {
    sidebar.classList.remove('show');
    document.removeEventListener('click', closeSidebarOnClickOutside);
  }
}

// Category expand/collapse
function toggleCategory(categoryId) {
  const category = document.getElementById(categoryId);
  if (!category) return;
  
  const isExpanded = category.classList.contains('expanded');
  
  if (isExpanded) {
    category.classList.remove('expanded');
  } else {
    category.classList.add('expanded');
  }
  
  // Save state
  saveCategoryStates();
}

// Save all category states to localStorage
function saveCategoryStates() {
  const categories = document.querySelectorAll('.nav-category');
  const states = {};
  
  categories.forEach(cat => {
    states[cat.id] = cat.classList.contains('expanded');
  });
  
  localStorage.setItem('categoriesState', JSON.stringify(states));
}

// Restore category states from localStorage
function restoreCategoryStates() {
  const savedStates = localStorage.getItem('categoriesState');
  
  if (savedStates) {
    const states = JSON.parse(savedStates);
    
    Object.keys(states).forEach(catId => {
      const category = document.getElementById(catId);
      if (category && states[catId]) {
        category.classList.add('expanded');
      }
    });
  } else {
    // By default, expand all categories
    const categories = document.querySelectorAll('.nav-category');
    categories.forEach(cat => cat.classList.add('expanded'));
  }
}

// Handle window resize
window.addEventListener('resize', () => {
  const sidebar = document.querySelector('.sidebar');
  if (window.innerWidth > 768) {
    sidebar.classList.remove('show');
    document.removeEventListener('click', closeSidebarOnClickOutside);
  }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  // Restore category states
  restoreCategoryStates();
  
  // Highlight current page
  highlightCurrentPage();
});

// Highlight current page in navigation
function highlightCurrentPage() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('nav a');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage) {
      link.classList.add('active');
      // Also expand parent category
      const category = link.closest('.nav-category');
      if (category) {
        category.classList.add('expanded');
      }
    } else {
      link.classList.remove('active');
    }
  });
}
