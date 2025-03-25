openSidebar.addEventListener('click', () => {
    sidebar.classList.remove('-translate-x-full', 'hidden');
    sidebar.classList.add('translate-x-0');
    sidebarOverlay.classList.remove('bg-opacity-0', 'hidden');
    sidebarOverlay.classList.add('bg-opacity-50');
    setTimeout(() => {
        sidebar.classList.remove('hidden');
        sidebarOverlay.classList.remove('hidden');
    }, 300);
});

sidebarOverlay.addEventListener('click', () => {
    sidebar.classList.remove('translate-x-0');
    sidebar.classList.add('-translate-x-full');
    sidebarOverlay.classList.remove('bg-opacity-50');
    sidebarOverlay.classList.add('bg-opacity-0');
    setTimeout(() => {
        sidebar.classList.add('hidden');
        sidebarOverlay.classList.add('hidden');
    }, 300);
});