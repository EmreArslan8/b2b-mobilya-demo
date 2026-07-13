/* ============================================================
   Mobilya Ağı — demo etkileşimleri (framework yok)
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Mobil navigasyon ---------- */
  function initNav() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".nav");
    if (!toggle || !nav) return;
    toggle.addEventListener("click", function () {
      nav.classList.toggle("nav-mobile-open");
      toggle.classList.toggle("open");
    });
  }

  /* ---------- Scroll reveal (IntersectionObserver) ---------- */
  function initReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!els.length) return;
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.style.transitionDelay = (e.target.dataset.delay || "0") + "ms";
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Modallar ---------- */
  function openModal(id) {
    var m = document.getElementById(id);
    if (!m) return;
    m.classList.add("open");
    document.body.style.overflow = "hidden";
    // formu başlangıç durumuna al
    var fields = m.querySelector(".form-fields");
    var success = m.querySelector(".form-success");
    if (fields) fields.classList.remove("hide");
    if (success) success.classList.remove("show");
  }
  function closeModal(m) {
    if (!m) return;
    m.classList.remove("open");
    document.body.style.overflow = "";
  }
  function initModals() {
    document.querySelectorAll("[data-modal-open]").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        openModal(btn.getAttribute("data-modal-open"));
      });
    });
    document.querySelectorAll(".modal-overlay").forEach(function (ov) {
      ov.addEventListener("click", function (e) {
        if (e.target === ov || e.target.hasAttribute("data-modal-close")) closeModal(ov);
      });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        document.querySelectorAll(".modal-overlay.open").forEach(closeModal);
      }
    });
  }

  /* ---------- Demo form gönderimi (RFQ / teklif) ---------- */
  function randomRfqNo(prefix) {
    return (prefix || "TLP") + "-" + (2000 + Math.floor(Math.random() * 900));
  }
  function initForms() {
    document.querySelectorAll("form[data-demo-form]").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var modal = form.closest(".modal");
        if (!modal) return;
        var fields = modal.querySelector(".form-fields");
        var success = modal.querySelector(".form-success");
        var noEl = success ? success.querySelector("[data-rfq-no]") : null;
        if (noEl) noEl.textContent = randomRfqNo(form.getAttribute("data-prefix") || "TLP");
        if (fields) fields.classList.add("hide");
        if (success) success.classList.add("show");
      });
    });
  }

  /* ---------- Tab geçişleri (paneller) ---------- */
  function initTabs() {
    document.querySelectorAll("[data-tabs]").forEach(function (group) {
      var tabs = group.querySelectorAll(".tab");
      tabs.forEach(function (tab) {
        tab.addEventListener("click", function () {
          var target = tab.getAttribute("data-tab");
          tabs.forEach(function (t) { t.classList.remove("active"); });
          tab.classList.add("active");
          group.querySelectorAll(".tab-panel").forEach(function (p) {
            p.classList.toggle("active", p.getAttribute("data-tab-panel") === target);
          });
        });
      });
    });
  }

  /* ---------- Panel sol menü bölüm geçişi ---------- */
  function goToSection(target) {
    if (!target) return;
    // sidebar aktif durumu
    document.querySelectorAll("[data-section-nav] button").forEach(function (b) {
      b.classList.toggle("active", b.getAttribute("data-section") === target);
    });
    // görünümler
    document.querySelectorAll("[data-section-view]").forEach(function (v) {
      v.style.display = v.getAttribute("data-section-view") === target ? "" : "none";
    });
    // yeniden görünen reveal öğelerini görünür yap
    document.querySelectorAll("[data-section-view] .reveal").forEach(function (el) {
      el.classList.add("in");
    });
    window.scrollTo(0, 0);
  }
  function initPanelNav() {
    // menü ve içerikteki tüm [data-section] tetikleyicileri
    document.querySelectorAll("[data-section]").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        if (btn.tagName === "A") e.preventDefault();
        goToSection(btn.getAttribute("data-section"));
      });
    });
  }

  /* ---------- Katalog filtreleri ---------- */
  function initFilters() {
    var grid = document.querySelector("[data-filter-grid]");
    if (!grid) return;
    var selects = document.querySelectorAll("[data-filter]");
    var countEl = document.querySelector("[data-filter-count]");
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".pcard"));

    function apply() {
      var filters = {};
      selects.forEach(function (s) {
        var key = s.getAttribute("data-filter");
        if (s.value && s.value !== "all") filters[key] = s.value;
      });
      var visible = 0;
      cards.forEach(function (card) {
        var match = true;
        Object.keys(filters).forEach(function (key) {
          var val = card.getAttribute("data-" + key) || "";
          // birden çok değer boşlukla ayrılabilir
          if (val.split(" ").indexOf(filters[key]) === -1) match = false;
        });
        card.classList.toggle("hidden", !match);
        if (match) visible++;
      });
      if (countEl) countEl.innerHTML = "<b>" + visible + "</b> ürün";
    }
    selects.forEach(function (s) { s.addEventListener("change", apply); });
    apply();
  }

  /* ---------- Admin: onayla / reddet ---------- */
  function initApprovals() {
    document.querySelectorAll("[data-approve], [data-reject]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var row = btn.closest("tr");
        if (!row) return;
        var chip = row.querySelector("[data-status-chip]");
        var actions = row.querySelector("[data-row-actions]");
        var approve = btn.hasAttribute("data-approve");
        if (chip) {
          chip.className = "status " + (approve ? "done" : "cancel");
          chip.textContent = approve ? "Onaylandı" : "Reddedildi";
        }
        if (actions) actions.innerHTML = '<span class="muted" style="font-size:12px;">İşlem tamamlandı</span>';
      });
    });
  }

  /* ---------- Toggle chip (satıcı: yayında / taslak) ---------- */
  function initToggleChips() {
    document.querySelectorAll("[data-toggle-chip]").forEach(function (chip) {
      chip.addEventListener("click", function () {
        var on = chip.classList.toggle("on");
        chip.innerHTML = on ? "Yayında" : "Taslak";
      });
    });
  }

  /* ---------- Basit demo aksiyon geri bildirimi ---------- */
  function initDemoActions() {
    document.querySelectorAll("[data-demo-action]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var msg = btn.getAttribute("data-demo-action");
        var original = btn.innerHTML;
        btn.innerHTML = msg;
        btn.disabled = true;
        btn.style.opacity = "0.75";
        setTimeout(function () {
          btn.innerHTML = original;
          btn.disabled = false;
          btn.style.opacity = "";
        }, 2200);
      });
    });

    // chat demo: mesaj gönder
    document.querySelectorAll("[data-thread]").forEach(function (thread) {
      var form = thread.querySelector(".thread-input");
      var body = thread.querySelector(".thread-body");
      if (!form || !body) return;
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var input = form.querySelector("input");
        if (!input.value.trim()) return;
        var b = document.createElement("div");
        b.className = "bubble me";
        b.innerHTML = input.value.replace(/</g, "&lt;") + '<span class="time">şimdi</span>';
        body.appendChild(b);
        input.value = "";
        body.scrollTop = body.scrollHeight;
      });
    });
  }

  /* ---------- Yıl ---------- */
  function initYear() {
    document.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    initReveal();
    initModals();
    initForms();
    initTabs();
    initPanelNav();
    initFilters();
    initApprovals();
    initToggleChips();
    initDemoActions();
    initYear();
  });
})();
