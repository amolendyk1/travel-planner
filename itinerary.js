let itinerary = JSON.parse(localStorage.getItem("itinerary")) || [];

document.getElementById("addDay").addEventListener("click", () => {
  itinerary.push({ activities: "" });
  localStorage.setItem("itinerary", JSON.stringify(itinerary));
  render();
});

function render() {
  const list = document.getElementById("itineraryList");
  list.innerHTML = "";

  itinerary.forEach((day, index) => {
    const div = document.createElement("div");
    div.className = "day";

    div.innerHTML = `
      <textarea data-index="${index}">${day.activities}</textarea>
    `;

    list.appendChild(div);
  });

  document.querySelectorAll("textarea").forEach((textarea) => {
    textarea.addEventListener("input", (e) => {
      const i = e.target.dataset.index;
      itinerary[i].activities = e.target.value;
      localStorage.setItem("itinerary", JSON.stringify(itinerary));
    });
  });
}

render();
