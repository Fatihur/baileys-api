// Sidebar Toggle for Mobile
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

// Handle window resize
window.addEventListener('resize', () => {
  const sidebar = document.querySelector('.sidebar');
  if (window.innerWidth > 768) {
    sidebar.classList.remove('show');
    document.removeEventListener('click', closeSidebarOnClickOutside);
  }
});
