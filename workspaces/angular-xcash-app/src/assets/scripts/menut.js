document.addEventListener('DOMContentLoaded', () => {
    const $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);
    const $navbarItems = document.querySelectorAll(".navbar-item");

    $navbarBurgers.forEach(burger_el => {
        burger_el.addEventListener('click', () => {
            // Toggle burger-menu
            const target = burger_el.dataset.target;
            const $target = document.getElementById(target);
            // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
            burger_el.classList.toggle('is-active');
            $target.classList.toggle('is-active');
        });
        $navbarItems.forEach(item => {
            item.addEventListener("click", () => {
                // Close burger-menu
                burger_el.classList.toggle('is-active');
                document.getElementById("xnavbar").classList.remove('is-active');
            });
        });
    });
});