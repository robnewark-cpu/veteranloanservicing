/**
 * Pulse-style demo calendar UI:
 * month grid with slot markers → pick day → pick time → register.
 */
(function () {
  "use strict";

  var root = document.getElementById("demo-calendar-app");
  if (!root) return;

  var slotsEndpoint = "/api/demo/slots";
  var bookEndpoint = "/api/demo/book";

  var state = {
    slots: [],
    month: startOfMonth(new Date()),
    selectedDate: null,
    selectedSlotId: null,
    loading: true,
    error: null,
  };

  function startOfMonth(d) {
    return new Date(d.getFullYear(), d.getMonth(), 1);
  }

  function dateKey(d) {
    return (
      d.getFullYear() +
      "-" +
      String(d.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(d.getDate()).padStart(2, "0")
    );
  }

  function fromKey(key) {
    var p = key.split("-").map(Number);
    return new Date(p[0], p[1] - 1, p[2]);
  }

  function load() {
    state.loading = true;
    state.error = null;
    render();
    fetch(slotsEndpoint)
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        state.slots = (data.slots || []).filter(function (s) {
          return s.available;
        });
        state.loading = false;
        if (!state.selectedDate && state.slots.length) {
          state.selectedDate = state.slots[0].date;
        }
        render();
      })
      .catch(function () {
        state.loading = false;
        state.error = "Could not load open times. Refresh or use the request form.";
        render();
      });
  }

  function slotsByDate() {
    var map = {};
    state.slots.forEach(function (s) {
      if (!map[s.date]) map[s.date] = [];
      map[s.date].push(s);
    });
    return map;
  }

  function render() {
    var byDate = slotsByDate();
    root.innerHTML = "";

    var layout = el("div", "demo-cal-layout");
    layout.appendChild(renderMonth(byDate));
    layout.appendChild(renderList(byDate));
    root.appendChild(layout);

    if (state.selectedSlotId) {
      root.appendChild(renderForm());
    }
  }

  function renderMonth(byDate) {
    var aside = el("aside", "demo-cal-aside");
    aside.innerHTML =
      '<p class="demo-cal-kicker">Demo calendar</p>' +
      '<p class="demo-cal-hint">Days with a gold marker have open walkthrough slots (Central Time). Pick a day, then a time.</p>';

    var nav = el("div", "demo-cal-month-nav");
    var prev = el("button", "demo-cal-nav-btn");
    prev.type = "button";
    prev.textContent = "‹";
    prev.addEventListener("click", function () {
      state.month = new Date(state.month.getFullYear(), state.month.getMonth() - 1, 1);
      render();
    });
    var next = el("button", "demo-cal-nav-btn");
    next.type = "button";
    next.textContent = "›";
    next.addEventListener("click", function () {
      state.month = new Date(state.month.getFullYear(), state.month.getMonth() + 1, 1);
      render();
    });
    var title = el("div", "demo-cal-month-title");
    title.textContent = state.month.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
    nav.appendChild(prev);
    nav.appendChild(title);
    nav.appendChild(next);
    aside.appendChild(nav);

    var grid = el("div", "demo-cal-grid");
    ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].forEach(function (d) {
      var h = el("div", "demo-cal-dow");
      h.textContent = d;
      grid.appendChild(h);
    });

    var first = startOfMonth(state.month);
    var startPad = first.getDay();
    var daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
    var todayKey = dateKey(new Date());

    for (var i = 0; i < startPad; i++) {
      grid.appendChild(el("div", "demo-cal-day empty"));
    }
    for (var day = 1; day <= daysInMonth; day++) {
      var d = new Date(first.getFullYear(), first.getMonth(), day);
      var key = dateKey(d);
      var btn = el("button", "demo-cal-day");
      btn.type = "button";
      btn.textContent = String(day);
      if (byDate[key]) btn.classList.add("has-slots");
      if (key === todayKey) btn.classList.add("is-today");
      if (key === state.selectedDate) btn.classList.add("is-selected");
      if (!byDate[key]) btn.disabled = key < todayKey;
      btn.addEventListener(
        "click",
        (function (k) {
          return function () {
            state.selectedDate = k;
            state.selectedSlotId = null;
            render();
          };
        })(key)
      );
      grid.appendChild(btn);
    }
    aside.appendChild(grid);

    var clear = el("button", "demo-cal-clear");
    clear.type = "button";
    clear.textContent = state.selectedDate
      ? "Showing " + fromKey(state.selectedDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) + " — show all"
      : "Showing all upcoming slots";
    clear.addEventListener("click", function () {
      state.selectedDate = null;
      state.selectedSlotId = null;
      render();
    });
    aside.appendChild(clear);
    return aside;
  }

  function renderList(byDate) {
    var panel = el("div", "demo-cal-list");
    if (state.loading) {
      panel.innerHTML = "<p class=\"demo-cal-hint\">Loading open times…</p>";
      return panel;
    }
    if (state.error) {
      panel.innerHTML =
        "<p class=\"demo-cal-error\">" +
        state.error +
        ' <a class="inline-link" href="/request-demo">Request a demo instead</a></p>';
      return panel;
    }

    var visible = state.selectedDate
      ? state.slots.filter(function (s) {
          return s.date === state.selectedDate;
        })
      : state.slots;

    if (!visible.length) {
      panel.innerHTML =
        "<p class=\"demo-cal-hint\">No open slots on that day. Pick another date or " +
        '<a class="inline-link" href="/request-demo">request a custom time</a>.</p>';
      return panel;
    }

    var heading = el("h2", "demo-cal-list-heading");
    heading.textContent = state.selectedDate ? "Open times that day" : "Upcoming open times";
    panel.appendChild(heading);

    var ul = el("ul", "demo-cal-slots");
    visible.forEach(function (slot) {
      var li = el("li", "demo-cal-slot");
      if (slot.id === state.selectedSlotId) li.classList.add("is-active");
      var meta = el("div", "");
      meta.innerHTML =
        "<strong>" +
        escapeHtml(slot.label) +
        "</strong><span>30-minute platform walkthrough · Central Time</span>";
      var book = el("button", "btn btn-primary btn-sm");
      book.type = "button";
      book.textContent = slot.id === state.selectedSlotId ? "Selected" : "Select";
      book.addEventListener(
        "click",
        (function (id) {
          return function () {
            state.selectedSlotId = id;
            render();
            var form = document.getElementById("demo-book-form");
            if (form) form.scrollIntoView({ behavior: "smooth", block: "start" });
          };
        })(slot.id)
      );
      li.appendChild(meta);
      li.appendChild(book);
      ul.appendChild(li);
    });
    panel.appendChild(ul);
    return panel;
  }

  function renderForm() {
    var slot = state.slots.find(function (s) {
      return s.id === state.selectedSlotId;
    });
    var wrap = el("div", "demo-cal-form-wrap form-panel");
    wrap.id = "demo-book-form";
    wrap.innerHTML =
      "<h2 style=\"font-size:1.35rem;margin-bottom:6px;\">Confirm your demo</h2>" +
      "<p class=\"form-intro\" style=\"margin-bottom:22px;\">Selected: <strong>" +
      escapeHtml(slot ? slot.label : "") +
      "</strong></p>";

    var form = el("form", "");
    form.innerHTML =
      '<div class="form-row">' +
      '<div class="form-group"><label for="dc-name">Full Name</label><input id="dc-name" name="name" required></div>' +
      '<div class="form-group"><label for="dc-company">Company / Fund</label><input id="dc-company" name="company" required></div>' +
      "</div>" +
      '<div class="form-row">' +
      '<div class="form-group"><label for="dc-email">Email</label><input id="dc-email" name="email" type="email" required></div>' +
      '<div class="form-group"><label for="dc-phone">Phone</label><input id="dc-phone" name="phone" type="tel"></div>' +
      "</div>" +
      '<div class="form-group"><label for="dc-type">Portfolio Type</label>' +
      '<select id="dc-type" name="portfolio_type">' +
      '<option>Commercial Real Estate</option>' +
      '<option>Business &amp; Commercial Loans</option>' +
      "<option>Both</option></select></div>" +
      '<div class="form-group"><label for="dc-msg">Anything we should know?</label>' +
      '<textarea id="dc-msg" name="message" rows="3"></textarea></div>' +
      '<button type="submit" class="btn btn-primary btn-lg btn-block">Book this time</button>' +
      '<p class="form-foot-note">We will confirm by email. Times are America/Chicago.</p>' +
      '<p class="demo-cal-error" data-book-error hidden></p>';

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var errEl = form.querySelector("[data-book-error]");
      errEl.hidden = true;
      var btn = form.querySelector('[type="submit"]');
      btn.disabled = true;
      btn.textContent = "Booking…";

      var payload = {
        slotId: state.selectedSlotId,
        name: form.name.value,
        company: form.company.value,
        email: form.email.value,
        phone: form.phone.value,
        portfolio_type: form.portfolio_type.value,
        message: form.message.value,
      };

      fetch(bookEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then(function (r) {
          return r.json().then(function (body) {
            return { ok: r.ok, body: body };
          });
        })
        .then(function (result) {
          if (!result.ok) throw new Error(result.body.error || "Booking failed");
          wrap.innerHTML =
            '<div class="form-success" role="status">' +
            "<h2 style=\"font-size:1.35rem;margin-bottom:10px;\">Demo reserved</h2>" +
            "<p>You're on the calendar for <strong>" +
            escapeHtml(result.body.booking.label) +
            "</strong>.</p>" +
            "<p style=\"margin-top:12px;\">Confirmation ref " +
            escapeHtml(String(result.body.booking.id).slice(0, 8)) +
            ". We'll follow up at " +
            escapeHtml(payload.email) +
            ".</p>" +
            '<p style="margin-top:18px;"><a class="btn btn-ghost" href="/">Back to home</a></p>' +
            "</div>";
          state.slots = state.slots.filter(function (s) {
            return s.id !== state.selectedSlotId;
          });
          state.selectedSlotId = null;
        })
        .catch(function (err) {
          errEl.textContent = err.message || "Could not book. Try another slot.";
          errEl.hidden = false;
          btn.disabled = false;
          btn.textContent = "Book this time";
          if (/taken|no longer/i.test(err.message || "")) load();
        });
    });

    wrap.appendChild(form);
    return wrap;
  }

  function el(tag, className) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    return node;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  load();
})();
