/**
 * Premier Wellness Telehealth — site behaviour.
 *
 * Replaces the previous inline onclick handlers. The booking modal now
 * traps focus, restores it on close, and is hidden from assistive tech
 * while closed.
 */
(function () {
  "use strict";

  // ---------------------------------------------------------------
  // Mobile menu
  // ---------------------------------------------------------------
  var menuToggle = document.getElementById("menuToggle");
  var navLinks = document.getElementById("navLinks");

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", function () {
      var open = navLinks.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(open));
    });

    navLinks.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navLinks.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // ---------------------------------------------------------------
  // Booking modal
  // ---------------------------------------------------------------
  var modal = document.getElementById("bookModal");
  if (!modal) return;

  var lastFocused = null;
  var FOCUSABLE = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    '[tabindex]:not([tabindex="-1"])',
  ].join(",");

  function focusableItems() {
    return Array.prototype.slice
      .call(modal.querySelectorAll(FOCUSABLE))
      .filter(function (el) {
        return el.offsetParent !== null;
      });
  }

  function openModal() {
    lastFocused = document.activeElement;
    modal.hidden = false;
    modal.classList.add("open");
    document.body.style.overflow = "hidden";

    if (navLinks) navLinks.classList.remove("open");
    if (menuToggle) menuToggle.setAttribute("aria-expanded", "false");

    var items = focusableItems();
    if (items.length) items[0].focus();
  }

  function closeModal() {
    modal.classList.remove("open");
    modal.hidden = true;
    document.body.style.overflow = "";

    if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus();
    }
  }

  document.querySelectorAll("[data-open-booking]").forEach(function (trigger) {
    trigger.addEventListener("click", function (event) {
      event.preventDefault();
      openModal();
    });
  });

  document.querySelectorAll("[data-close-booking]").forEach(function (trigger) {
    trigger.addEventListener("click", closeModal);
  });

  // Click the backdrop to dismiss
  modal.addEventListener("click", function (event) {
    if (event.target === modal) closeModal();
  });

  document.addEventListener("keydown", function (event) {
    if (modal.hidden) return;

    if (event.key === "Escape") {
      closeModal();
      return;
    }

    // Keep Tab inside the dialog while it is open
    if (event.key === "Tab") {
      var items = focusableItems();
      if (!items.length) return;

      var first = items[0];
      var last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
})();
