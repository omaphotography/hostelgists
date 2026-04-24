import { supabase } from "./supabase.js";

let hostels = [];

const container = document.getElementById("hostels");
const search = document.getElementById("searchInput");

async function loadHostels() {

  const { data } = await supabase
    .from("hostels")
    .select("*, reviews(rating)");

  hostels = data || [];
  render(hostels);

  search.addEventListener("input", filterHostels);
}

function filterHostels(e) {

  const value = e.target.value.toLowerCase();

  const filtered = hostels.filter(h =>
    (h.name || "").toLowerCase().includes(value) ||
    (h.location || "").toLowerCase().includes(value) ||
    String(h.price || "").includes(value)
  );

  render(filtered);
}

function render(list) {

  container.innerHTML = "";

  list.forEach(h => {

    let avg = 0;

    if (h.reviews?.length) {
      avg = h.reviews.reduce((a, b) => a + (b.rating || 0), 0) / h.reviews.length;
    }

    container.innerHTML += `
      <div class="card" onclick="openHostel('${h.id}')">
        <img src="${h.image_url || 'https://via.placeholder.com/300'}">
        <h3>${h.name}</h3>
        <p>${h.location}</p>
        <p>₦${h.price}</p>
        <p>⭐ ${avg.toFixed(1)}</p>
      </div>
    `;
  });
}

window.openHostel = (id) => {
  localStorage.setItem("hostelId", id);
  window.location.href = "hostel.html";
};

loadHostels();