import { supabase } from "./supabase.js";

const id = localStorage.getItem("hostelId");

const container = document.getElementById("details");
const reviewsBox = document.getElementById("reviews");

let selectedRating = 0;

/* ================= LOAD HOSTEL ================= */
async function loadDetails() {

  if (!id) {
    container.innerHTML = "<p>No hostel selected</p>";
    return;
  }

  const { data, error } = await supabase
    .from("hostels")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    container.innerHTML = "<p>Failed to load hostel</p>";
    return;
  }

  container.innerHTML = `
    <div class="hostel-detail">
      <img src="${data.image_url}" class="detail-img">

      <div class="detail-card">
        <h2>${data.name}</h2>
        <p>📍 ${data.location}</p>
        <p>₦${data.price}</p>
        <p>${data.description || ""}</p>
      </div>
    </div>
  `;
}

/* ================= REVIEWS ================= */
async function loadReviews() {

  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("hostel_id", id);

  reviewsBox.innerHTML = "";

  if (error || !data) {
    reviewsBox.innerHTML = "<p>Error loading reviews</p>";
    return;
  }

  if (data.length === 0) {
    reviewsBox.innerHTML = "<p>No reviews yet</p>";
    return;
  }

  data.forEach(r => {
    reviewsBox.innerHTML += `
      <div class="review-card">
        ⭐ ${r.rating}
        <p>${r.comment}</p>
      </div>
    `;
  });
}
window.showReviewForm = async () => {

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    alert("Login required to add review");
    window.location.href = "login.html";
    return;
  }

  const box = document.getElementById("reviewBox");

  if (!box) {
    console.error("reviewBox not found in HTML");
    return;
  }

  box.style.display = "block";
};

/* ================= STAR ================= */
function initStars() {
  const stars = document.querySelectorAll("#stars i");

  stars.forEach((star, index) => {
    star.addEventListener("click", () => {
      selectedRating = index + 1;

      stars.forEach((s, i) => {
        s.className = i < selectedRating
          ? "fa-solid fa-star active"
          : "fa-regular fa-star";
      });
    });
  });
}

/* ================= SUBMIT ================= */
window.submitReview = async () => {

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return window.location.href = "login.html";

  const comment = document.getElementById("comment").value;

  if (!selectedRating) return alert("Select rating");

  const { error } = await supabase.from("reviews").insert([{
    hostel_id: id,
    rating: selectedRating,
    comment,
    user_id: user.id
  }]);

  if (error) return alert("Failed to add review");

  alert("Review added");

  selectedRating = 0;
  document.getElementById("comment").value = "";

  loadReviews();
};

window.addEventListener("DOMContentLoaded", () => {
  loadDetails();
  loadReviews();
  initStars();
});