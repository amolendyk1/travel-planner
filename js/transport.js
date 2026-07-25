// transport.js
// Self-contained "Transportation" feature for the itinerary page.
// Lets the user log flights, trains, rental cars, etc. with confirmation
// details, and keeps them in localStorage under their own key so this
// doesn't touch any other trip data the app already manages.

(function () {
  const STORAGE_KEY = "tf_transport_legs";
  const container = document.getElementById("transportation");
  if (!container) return;

  const MODES = [
    { value: "flight", label: "Flight", icon: "✈️" },
    { value: "train", label: "Train", icon: "🚆" },
    { value: "bus", label: "Bus", icon: "🚌" },
    { value: "car", label: "Car rental", icon: "🚗" },
    { value: "ferry", label: "Ferry", icon: "⛴️" },
    { value: "other", label: "Other", icon: "🧭" },
  ];

  function loadLegs() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveLegs(legs) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(legs));
  }

  function sortedLegs() {
    return loadLegs().sort((a, b) => {
      const da = new Date(`${a.date || "9999-12-31"}T${a.time || "00:00"}`);
      const db = new Date(`${b.date || "9999-12-31"}T${b.time || "00:00"}`);
      return da - db;
    });
  }

  function modeIcon(mode) {
    const found = MODES.find((m) => m.value === mode);
    return found ? found.icon : "🧭";
  }

  function modeLabel(mode) {
    const found = MODES.find((m) => m.value === mode);
    return found ? found.label : "Other";
  }

  function formatDateTime(date, time) {
    if (!date) return "";
    const parts = [];
    try {
      const d = new Date(`${date}T${time || "00:00"}`);
      parts.push(
        d.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        })
      );
      if (time) {
        parts.push(
          d.toLocaleTimeString(undefined, {
            hour: "numeric",
            minute: "2-digit",
          })
        );
      }
    } catch (e) {
      return date + (time ? " " + time : "");
    }
    return parts.join(" • ");
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str || "";
    return div.innerHTML;
  }

  function render() {
    const legs = sortedLegs();
    const totalCost = legs.reduce((sum, l) => sum + (Number(l.cost) || 0), 0);

    container.innerHTML = `
      <div class="tf-transport-heading">
        <div>
          <h2>Transportation</h2>
          <p class="status-message">
            Log flights, trains, or rentals so confirmation details live right
            alongside the rest of your trip.
          </p>
        </div>
        <div class="tf-transport-total">
          <span class="tm-label">Total cost</span>
          <strong>${totalCost.toLocaleString()}</strong>
        </div>
      </div>

      <div id="transportForm" class="tm-form tf-transport-form">
        <div class="tm-form-row">
          <label for="transportMode">Type</label>
          <select id="transportMode">
            ${MODES.map(
              (m) => `<option value="${m.value}">${m.icon} ${m.label}</option>`
            ).join("")}
          </select>
        </div>
        <div class="tm-form-row">
          <label for="transportCarrier">Carrier / provider</label>
          <input id="transportCarrier" placeholder="e.g. Delta, Eurostar, Hertz" />
        </div>
        <div class="tm-form-row">
          <label for="transportFrom">From</label>
          <input id="transportFrom" placeholder="Departure point" />
        </div>
        <div class="tm-form-row">
          <label for="transportTo">To</label>
          <input id="transportTo" placeholder="Arrival point" />
        </div>
        <div class="tm-form-row">
          <label for="transportDate">Date</label>
          <input id="transportDate" type="date" />
        </div>
        <div class="tm-form-row">
          <label for="transportTime">Time</label>
          <input id="transportTime" type="time" />
        </div>
        <div class="tm-form-row">
          <label for="transportConfirmation">Confirmation #</label>
          <input id="transportConfirmation" placeholder="Optional" />
        </div>
        <div class="tm-form-row">
          <label for="transportCost">Cost</label>
          <input id="transportCost" type="number" min="0" step="1" placeholder="0" />
        </div>
      </div>
      <button id="addTransportLeg" class="tm-button" type="button">
        + Add transportation
      </button>

      <div class="tf-transport-list" style="margin-top: 20px;">
        ${
          legs.length === 0
            ? `<p class="empty-state">No transportation added yet.</p>`
            : legs
                .map(
                  (leg, i) => `
              <div class="tm-event-card tf-transport-card">
                <div class="tf-transport-icon-badge">${modeIcon(leg.mode)}</div>
                <div class="tf-transport-details">
                  <h3>${modeLabel(leg.mode)}${
                    leg.carrier ? " • " + escapeHtml(leg.carrier) : ""
                  }</h3>
                  <p class="tf-transport-route">
                    ${escapeHtml(leg.from || "?")}
                    <span class="tf-transport-arrow">→</span>
                    ${escapeHtml(leg.to || "?")}
                  </p>
                  ${leg.date ? `<p class="place-meta">${formatDateTime(leg.date, leg.time)}</p>` : ""}
                  ${
                    leg.confirmation
                      ? `<p class="place-meta">Confirmation: ${escapeHtml(leg.confirmation)}</p>`
                      : ""
                  }
                  ${
                    leg.cost
                      ? `<p class="place-meta">Cost: ${Number(leg.cost).toLocaleString()}</p>`
                      : ""
                  }
                </div>
                <button
                  class="tm-filter-pill tf-transport-remove"
                  data-remove-index="${i}"
                  type="button"
                  aria-label="Remove"
                >✕</button>
              </div>
            `
                )
                .join("")
        }
      </div>
    `;

    document
      .getElementById("addTransportLeg")
      .addEventListener("click", handleAdd);

    container.querySelectorAll("[data-remove-index]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.getAttribute("data-remove-index"));
        const current = sortedLegs();
        current.splice(idx, 1);
        saveLegs(current);
        render();
      });
    });
  }

  function handleAdd() {
    const leg = {
      mode: document.getElementById("transportMode").value,
      carrier: document.getElementById("transportCarrier").value.trim(),
      from: document.getElementById("transportFrom").value.trim(),
      to: document.getElementById("transportTo").value.trim(),
      date: document.getElementById("transportDate").value,
      time: document.getElementById("transportTime").value,
      confirmation: document
        .getElementById("transportConfirmation")
        .value.trim(),
      cost: document.getElementById("transportCost").value,
    };

    if (!leg.from && !leg.to && !leg.carrier) {
      alert("Add at least a carrier, or a from/to, before saving.");
      return;
    }

    const legs = loadLegs();
    legs.push(leg);
    saveLegs(legs);
    render();
  }

  render();
})();