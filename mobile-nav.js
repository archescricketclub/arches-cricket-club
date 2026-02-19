(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        var toggle = document.querySelector('.nav-toggle');
        var menu = document.querySelector('.nav-menu');

        if (!toggle || !menu) return;

        // Create overlay element
        var overlay = document.createElement('div');
        overlay.className = 'nav-overlay';
        document.body.appendChild(overlay);

        function openMenu() {
            menu.classList.add('active');
            toggle.classList.add('active');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeMenu() {
            menu.classList.remove('active');
            toggle.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }

        function toggleMenu() {
            if (menu.classList.contains('active')) {
                closeMenu();
            } else {
                openMenu();
            }
        }

        // Toggle button click
        toggle.addEventListener('click', function (e) {
            e.stopPropagation();
            toggleMenu();
        });

        // Close on overlay click
        overlay.addEventListener('click', closeMenu);

        // Close when a nav link is clicked
        var navLinks = menu.querySelectorAll('a');
        navLinks.forEach(function (link) {
            link.addEventListener('click', closeMenu);
        });

        // Close on Escape key
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && menu.classList.contains('active')) {
                closeMenu();
            }
        });

        // Close on resize above breakpoint
        window.addEventListener('resize', function () {
            if (window.innerWidth > 968 && menu.classList.contains('active')) {
                closeMenu();
            }
        });
    });
})();
