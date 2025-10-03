// Sidebar Loader - Load sidebar partial into all pages
(function() {
  // Preload sidebar state immediately to prevent flicker
  const preloadedState = {
    collapsed: localStorage.getItem('sidebarCollapsed') === 'true',
    categories: JSON.parse(localStorage.getItem('categoriesState') || '{}')
  };

  async function loadSidebar() {
    try {
      const response = await fetch('sidebar.html');
      if (!response.ok) throw new Error('Failed to load sidebar');
      
      const sidebarHTML = await response.text();
      const container = document.getElementById('sidebar-container');
      
      if (container) {
        // Insert sidebar HTML
        container.innerHTML = sidebarHTML;
        
        // Apply preloaded state immediately (before any rendering)
        applySidebarState();
        
        // Set active link based on current page
        setActiveLink();
        
        // Mark sidebar as loaded
        container.classList.add('sidebar-loaded');
      }
    } catch (error) {
      console.error('Error loading sidebar:', error);
    }
  }

  function applySidebarState() {
    const sidebar = document.querySelector('.sidebar');
    
    // Apply sidebar collapsed state
    if (preloadedState.collapsed && sidebar) {
      sidebar.classList.add('collapsed');
    }
    
    // Apply category expanded states
    const categoryStates = preloadedState.categories;
    const hasStates = Object.keys(categoryStates).length > 0;
    
    if (hasStates) {
      // Restore saved states
      Object.keys(categoryStates).forEach(categoryId => {
        const category = document.getElementById(categoryId);
        if (category && categoryStates[categoryId]) {
          category.classList.add('expanded');
        }
      });
    } else {
      // Default: expand all categories on first load
      const categories = document.querySelectorAll('.nav-category');
      categories.forEach(cat => cat.classList.add('expanded'));
    }
  }

  function setActiveLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const links = document.querySelectorAll('.sidebar nav a');
    
    links.forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      if (href === currentPage) {
        link.classList.add('active');
        // Ensure parent category is expanded
        const category = link.closest('.nav-category');
        if (category && !category.classList.contains('expanded')) {
          category.classList.add('expanded');
        }
      }
    });
  }

  // Load sidebar immediately
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadSidebar);
  } else {
    loadSidebar();
  }
})();
