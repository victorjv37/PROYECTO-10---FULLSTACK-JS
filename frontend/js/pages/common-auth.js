(function () {
  document.addEventListener("DOMContentLoaded", () => {
    const currentPage = document.body?.dataset?.page || "";

    window.HeroApp?.Components?.renderNavbar({
      variant: "private",
      currentPage,
    });
  });
})();
