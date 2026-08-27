/**
 * Shared lead capture: POST to /api/chat/lead, show success, optional calendar CTA.
 * Forms: add data-lead-form and matching field ids, or data-field attributes.
 */
(function () {
  "use strict";

  var cfg = window.VLS_CONFIG || {};
  var endpoint = cfg.leadEndpoint || "/api/chat/lead";
  var bookingUrl = cfg.bookingUrl || "";
  var contactEmail = cfg.contactEmail || "info@veteranloanservicing.com";

  function wireBookingLinks() {
    document.querySelectorAll("[data-booking-cta]").forEach(function (el) {
      if (bookingUrl) {
        el.setAttribute("href", bookingUrl);
        el.setAttribute("target", "_blank");
        el.setAttribute("rel", "noopener noreferrer");
        el.hidden = false;
      } else {
        el.setAttribute(
          "href",
          "mailto:" +
            contactEmail +
            "?subject=" +
            encodeURIComponent("Schedule a Platform Demo")
        );
        el.removeAttribute("target");
      }
    });
  }

  function showSuccess(form, id) {
    var panel = form.closest(".form-panel") || form.parentElement;
    var success = panel.querySelector("[data-lead-success]");
    if (!success) {
      success = document.createElement("div");
      success.setAttribute("data-lead-success", "");
      success.className = "form-success";
      success.setAttribute("role", "status");
      panel.appendChild(success);
    }
    var bookLine = bookingUrl
      ? '<p style="margin-top:16px;"><a class="btn btn-primary" href="' +
        bookingUrl +
        '" target="_blank" rel="noopener noreferrer">Book a time on the calendar</a></p>'
      : '<p style="margin-top:16px;">We will follow up by email shortly. Prefer to talk now? Reach us at <a href="mailto:' +
        contactEmail +
        '">' +
        contactEmail +
        "</a>.</p>";
    success.innerHTML =
      "<h2 style=\"font-size:1.35rem;margin-bottom:10px;\">Request received</h2>" +
      "<p>Thanks — your inquiry is in our queue" +
      (id ? " (ref " + id.slice(0, 8) + ")" : "") +
      ".</p>" +
      bookLine;
    form.hidden = true;
    success.hidden = false;
  }

  function collect(form) {
    var data = {
      site: cfg.siteKey || "vls",
      source: form.getAttribute("data-source") || "website",
      page: window.location.pathname,
      submitted_at: new Date().toISOString(),
    };
    form.querySelectorAll("[name]").forEach(function (el) {
      if (el.name) data[el.name] = el.value;
    });
    return data;
  }

  document.querySelectorAll("[data-lead-form]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var btn = form.querySelector('[type="submit"]');
      var original = btn ? btn.textContent : "";
      if (btn) {
        btn.disabled = true;
        btn.textContent = "Submitting…";
      }

      var payload = collect(form);

      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then(function (res) {
          return res.json().then(function (body) {
            return { ok: res.ok, body: body };
          });
        })
        .then(function (result) {
          if (result.ok) {
            showSuccess(form, result.body && result.body.id);
            return;
          }
          throw new Error((result.body && result.body.error) || "submit failed");
        })
        .catch(function () {
          // Fallback: open mailto so the lead is never dropped.
          var subject =
            (payload.company ? "Platform Demo Request - " + payload.company : null) ||
            payload.subject ||
            "Website Contact Inquiry";
          var body =
            "Name: " +
            (payload.name || "") +
            "\nCompany: " +
            (payload.company || "") +
            "\nEmail: " +
            (payload.email || "") +
            "\nPhone: " +
            (payload.phone || "") +
            "\nPortfolio Type: " +
            (payload.portfolio_type || "") +
            "\nSize: " +
            (payload.portfolio_size || "") +
            "\n\nMessage:\n" +
            (payload.message || "");
          window.location.href =
            "mailto:" +
            contactEmail +
            "?subject=" +
            encodeURIComponent(subject) +
            "&body=" +
            encodeURIComponent(body);
        })
        .finally(function () {
          if (btn) {
            btn.disabled = false;
            btn.textContent = original;
          }
        });
    });
  });

  wireBookingLinks();
})();
