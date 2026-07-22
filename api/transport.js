// transport.js
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
    { value: "other", label: "Other", icon: "🧭" }
  ];

  function loadLegs() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  }

  function saveLegs(legs) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(legs));
  }

  function render() {
    const legs = loadLegs();

    container.innerHTML = `
      <h2>Transportation</h2>
      <p class="status-message">Add flights, trains, or rentals.</p>

      <div class="tm-form" style="grid-template-columns: 1fr 1fr;">
        <div class="tm-form-row">
          <label>Type</label>
          <select id="transportMode">
            ${MODES.map(m => `<option value="${m.value}">${m.icon} ${m.label}</option>`).join("")}
          </select>
        </div>

        <div class="tm-form-row">
          <label>Carrier</label>
          <input id="transportCarrier" placeholder="Delta, Eurostar, Hertz" />
        </div>

        <div class="tm-form-row">
          <label>From</label>
          <input id="transportFrom" />
        </div>

        <div class="tm-form-row">
          <label>To</label>
          <input id="transportTo" />
        </div>

        <div class="tm-form-row">
          <label>Date</label>
          <input id="transportDate" type="date" />
        </div>

        <div class="tm-form-row">
          <label>Time</label>
          <input id="transportTime" type="time" />
        </div>

        <button id="addTransportLeg" class="tm-button">+ Add transportation</button>
      </div>

      <div id="transportList" style="margin-top: 16px;">
        ${
          legs.length === 0
            ? `<p class="empty-state">No transportation added yet.</p>`
            : legs.map((leg, i) => `
              <div class="tm-event-card">
                <h3>${leg.mode.toUpperCase()} • ${leg.carrier || ""}</h3>
                <p>${leg.from || "?"} → ${leg.to || "?"}</p>
                <button class="tm-filter-pill" data-remove="${i}">Remove</button>
              </div>
            `).join("")
        }
      </div>
    `;

    document.getElementById("addTransportLeg").onclick = () => {
      const leg = {
        mode: document.getElementById("transportMode").value,
        carrier: document.getElementById("transportCarrier").value,
        from: document.getElementById("transportFrom").value,
        to: document.getElementById("transportTo").value,
        date: document.getElementById("transportDate").value,
        time: document.getElementById("transportTime").value
      };

      const legs = loadLegs();
      legs.push(leg);
      saveLegs(legs);
      render();
    };

    container.querySelectorAll("[data-remove]").forEach(btn => {
      btn.onclick = () => {
        const index = Number(btn.dataset.remove);
        const legs = loadLegs();
        legs.splice(index, 1);
        saveLegs(legs);
        render();
      };
    });
  }

  // Allow app.js to call this
  window.renderTransportModule = render;

  render();
})();
