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


/* turning globe in the home page hero */
(function () {
    const canvas = document.querySelector('.logo-globe-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const TILT = 0.32;
    const STEPS = 96;

    const normals = [];
    for (let k = 0; k < 6; k++) {
        const a = k * Math.PI / 6 + 0.2;
        normals.push([Math.cos(a), 0, Math.sin(a)]);
    }
    normals.push([0, 1, 0]);
    [[0.9, 0.7], [2.1, 0.95], [3.2, 0.6], [4.3, 1.05], [5.4, 0.8], [1.5, 0.5]].forEach(function (p) {
        normals.push([
            Math.sin(p[1]) * Math.cos(p[0]),
            Math.cos(p[1]),
            Math.sin(p[1]) * Math.sin(p[0])
        ]);
    });

    function norm(v) {
        const l = Math.hypot(v[0], v[1], v[2]);
        return [v[0] / l, v[1] / l, v[2] / l];
    }

    function cross(a, b) {
        return [
            a[1] * b[2] - a[2] * b[1],
            a[2] * b[0] - a[0] * b[2],
            a[0] * b[1] - a[1] * b[0]
        ];
    }

    const circles = normals.map(function (n) {
        const h = Math.abs(n[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
        const u = norm(cross(n, h));
        const v = cross(n, u);
        const pts = [];
        for (let i = 0; i <= STEPS; i++) {
            const a = i / STEPS * Math.PI * 2;
            const c = Math.cos(a);
            const s = Math.sin(a);
            pts.push([
                c * u[0] + s * v[0],
                c * u[1] + s * v[1],
                c * u[2] + s * v[2]
            ]);
        }
        return pts;
    });

    const cosX = Math.cos(TILT);
    const sinX = Math.sin(TILT);

    function draw(t) {
        const dpr = window.devicePixelRatio || 1;
        const W = canvas.clientWidth;
        const H = canvas.clientHeight;
        if (!W) return;

        if (canvas.width !== Math.round(W * dpr)) {
            canvas.width = Math.round(W * dpr);
            canvas.height = Math.round(H * dpr);
        }

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, W, H);

        const cx = W * 0.5006;
        const cy = H * 0.5328;
        const R = W * 0.325;
        const cosT = Math.cos(t);
        const sinT = Math.sin(t);
        const front = new Path2D();
        const back = new Path2D();

        circles.forEach(function (pts) {
            let px = 0, py = 0, pz = 0;
            pts.forEach(function (p, i) {
                const x1 = p[0] * cosT + p[2] * sinT;
                const z1 = -p[0] * sinT + p[2] * cosT;
                const y2 = p[1] * cosX - z1 * sinX;
                const z2 = p[1] * sinX + z1 * cosX;
                const sx = cx + R * x1;
                const sy = cy - R * y2;
                if (i > 0) {
                    const path = (pz + z2) >= 0 ? front : back;
                    path.moveTo(px, py);
                    path.lineTo(sx, sy);
                }
                px = sx; py = sy; pz = z2;
            });
        });

        ctx.lineCap = 'round';
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.lineWidth = W * 0.0032;
        ctx.stroke(back);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = W * 0.0042;
        ctx.stroke(front);
        ctx.lineWidth = W * 0.006;
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.stroke();
    }

    let t = 0;
    let last = null;

    function frame(ts) {
        if (last !== null) t += (ts - last) / 1000 * 0.21;
        last = ts;
        draw(t);
        requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
})();


/* home page pillars: click one to open it */
(function () {
    const pillars = document.querySelectorAll('.pillar');
    if (!pillars.length) return;

    pillars.forEach(function (pillar) {
        const toggle = pillar.querySelector('.pillar-toggle');
        toggle.addEventListener('click', function () {
            pillars.forEach(function (p) {
                const open = p === pillar;
                p.classList.toggle('active', open);
                p.querySelector('.pillar-toggle').setAttribute('aria-expanded', open);
            });
        });
    });
})();


/* home page "How we work": the yellow lines fill in as you scroll to it */
(function () {
    const steps = document.querySelector('.steps');
    if (!steps) return;

    const items = steps.querySelectorAll('.step');

    function fillIn() {
        items.forEach(function (item, i) {
            setTimeout(function () {
                item.classList.add('in');
            }, i * 350);
        });
    }

    steps.classList.add('js');

    if (!('IntersectionObserver' in window)) {
        fillIn();
        return;
    }

    const observer = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) {
            fillIn();
            observer.disconnect();
        }
    }, { threshold: 0.3 });

    observer.observe(steps);
})();


/* home page hero: the rotating word */
(function () {
    const word = document.getElementById('rotator-word');
    if (!word) return;

    const words = ['websites', 'branding', 'marketing', 'business systems'];
    let i = 0;

    setInterval(function () {
        word.style.transform = 'translateY(-100%)';

        setTimeout(function () {
            i = (i + 1) % words.length;
            word.style.transition = 'none';
            word.textContent = words[i];
            word.style.transform = 'translateY(100%)';
            void word.offsetHeight;
            word.style.transition = '';
            word.style.transform = 'translateY(0)';
        }, 500);
    }, 2400);
})();
