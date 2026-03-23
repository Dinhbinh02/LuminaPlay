if (performance.getEntriesByType('navigation')[0]?.type === 'back_forward') {
    document.documentElement.classList.add('back-nav-hiding');
}
