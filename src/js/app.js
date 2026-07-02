// MOBILE NAV TOGGLE
function toggleMobileNav() {
    const nav = document.getElementById('mobileNav');
    const hamburger = document.getElementById('hamburger');
    nav.classList.toggle('open');
    hamburger.classList.toggle('open');
    if (nav.classList.contains('open')) {
        document.body.style.overflow = 'hidden';
        hamburger.setAttribute('aria-expanded', 'true');
    } else {
        document.body.style.overflow = '';
        hamburger.setAttribute('aria-expanded', 'false');
    }
}

// Set active link based on current URL
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    const page = path.split("/").pop() || 'index.html';
    const links = document.querySelectorAll('.nav-links a');
    links.forEach(link => {
        if (link.getAttribute('href') === page) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
});

// GSAP Animations
if (typeof gsap !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    // Initial Navbar animation
    gsap.to("#navbar", {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power3.out",
        delay: 0.1
    });

    // Animate Hero text line by line
    if (document.getElementById('heroTitle')) {
        gsap.to("#heroTitle .line1", { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", delay: 0.2 });
        gsap.to("#heroTitle .line2", { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", delay: 0.4 });
    }

    // Scroll reveal elements
    gsap.utils.toArray('.reveal').forEach(element => {
        gsap.to(element, {
            scrollTrigger: {
                trigger: element,
                start: "top 85%",
                toggleActions: "play none none none"
            },
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out"
        });
    });

    // Sponsors infinite scroll track logic
    const track = document.querySelector('.sponsors-track');
    if (track) {
        let items = Array.from(track.children);
        items.forEach(item => {
            let clone = item.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true');
            track.appendChild(clone);
        });
    }

    // Navbar shrink on scroll
    window.addEventListener('scroll', () => {
        const nav = document.getElementById('navbar');
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });
}
