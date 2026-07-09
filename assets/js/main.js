/**
 * Veteran Loan Servicing — shared site behavior.
 * Mobile navigation toggle, mega-menu accessibility, and active-link marking.
 */
(function () {
  "use strict";

  var header = document.querySelector(".site-header");
  var navToggle = document.querySelector(".nav-toggle");
  var megaButtons = document.querySelectorAll("[data-mega-toggle]");

  if (navToggle && header) {
    navToggle.addEventListener("click", function () {
      var isOpen = header.classList.toggle("menu-open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  megaButtons.forEach(function (btn) {
    var panelId = btn.getAttribute("aria-controls");
    var panel = panelId ? document.getElementById(panelId) : null;
    if (!panel) return;

    function closePanel() {
      panel.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
    }

    function togglePanel(e) {
      e.preventDefault();
      var willOpen = !panel.classList.contains("open");
      document.querySelectorAll(".mega-panel.open").forEach(function (p) {
        p.classList.remove("open");
      });
      document.querySelectorAll("[data-mega-toggle]").forEach(function (b) {
        b.setAttribute("aria-expanded", "false");
      });
      if (willOpen) {
        panel.classList.add("open");
        btn.setAttribute("aria-expanded", "true");
      }
    }

    btn.addEventListener("click", togglePanel);
    document.addEventListener("click", function (e) {
      if (!btn.contains(e.target) && !panel.contains(e.target)) closePanel();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closePanel();
    });
  });

  // Mark the current page's nav link as active based on pathname.
  var path = window.location.pathname.replace(/\/index\.html$/, "/").replace(/\/$/, "") || "/";
  document.querySelectorAll(".nav-link, .footer-col a").forEach(function (link) {
    var href = link.getAttribute("href");
    if (!href) return;
    var normalized = href.replace(/\/$/, "") || "/";
    if (normalized === path && normalized !== "/") {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    }
  });

  // Close mobile menu when a link is chosen.
  document.querySelectorAll(".nav-primary a").forEach(function (link) {
    link.addEventListener("click", function () {
      if (header) {
        header.classList.remove("menu-open");
        if (navToggle) navToggle.setAttribute("aria-expanded", "false");
      }
    });
  });
})();
