document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--x', (e.clientX - r.left) + 'px');
        card.style.setProperty('--y', (e.clientY - r.top) + 'px');
    });
});

if ('IntersectionObserver' in window) {
    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                fadeObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    document.querySelectorAll('.intro-grid > div').forEach((el, i) => {
        el.classList.add('fade-in');
        el.style.transitionDelay = (i * 150) + 'ms';
        fadeObserver.observe(el);
    });
}
