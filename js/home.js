import { supabase } from "./supabase.js";

let hostels = [];

const container =
  document.getElementById("hostels");

const search =
  document.getElementById("searchInput");


/* =========================
CHECK ELEMENTS
========================= */

if (!container) {

  console.error(
    "Hostels container not found"
  );
}


/* =========================
LOAD HOSTELS
========================= */

async function loadHostels() {

  if (!container) return;

  container.innerHTML = `
    <div class="loading-box">
      Loading hostels...
    </div>
  `;

  try {

    console.log("Loading hostels...");

    const {
      data,
      error
    } = await supabase
      .from("hostels")
      .select("*")
      .order("created_at", {
        ascending: false
      });

    console.log("Supabase response:", data);
    console.log("Supabase error:", error);

    if (error) {

      container.innerHTML = `

        <div class="error-box">

          Failed to load hostels

          <br><br>

          <small>
            ${error.message}
          </small>

        </div>

      `;

      return;
    }

    hostels = data || [];

    if (hostels.length === 0) {

      container.innerHTML = `

        <div class="empty-box">

          No hostels available yet

        </div>

      `;

      return;
    }

    render(hostels);

  } catch (err) {

    console.log("Unexpected error:", err);

    container.innerHTML = `

      <div class="error-box">

        Something went wrong

      </div>

    `;
  }
}


/* =========================
SEARCH
========================= */

if (search) {

  search.addEventListener(
    "input",
    () => {

      const value =
        search.value
          .toLowerCase()
          .trim();

      const filtered =
        hostels.filter(h =>

          (h.name || "")
            .toLowerCase()
            .includes(value)

          ||

          (h.location || "")
            .toLowerCase()
            .includes(value)

          ||

          String(h.price || "")
            .includes(value)

        );

      render(filtered);
    }
  );
}


/* =========================
GENERATE STARS
========================= */

function generateStars(rating = 0) {

  let stars = "";

  const rounded =
    Math.round(rating);

  for (let i = 1; i <= 5; i++) {

    if (i <= rounded) {

      stars += `
        <i class="fa-solid fa-star active-star"></i>
      `;

    } else {

      stars += `
        <i class="fa-regular fa-star inactive-star"></i>
      `;
    }
  }

  return stars;
}


/* =========================
LOAD REVIEWS
========================= */

async function loadReviews(hostelId) {

  try {

    const {
      data,
      error
    } = await supabase
      .from("reviews")
      .select("*")
      .eq("hostel_id", hostelId)
      .order("created_at", {
        ascending: false
      });

    if (error) {

      console.log(
        "Review error:",
        error
      );

      return [];
    }

    return data || [];

  } catch (err) {

    console.log(err);

    return [];
  }
}


/* =========================
RENDER HOSTELS
========================= */

async function render(list) {

  container.innerHTML = "";

  for (const h of list) {

    let avg = 0;

    let reviewHTML = "";

    const reviews =
      await loadReviews(h.id);


    /* =========================
    CALCULATE AVERAGE
    ========================= */

    if (reviews.length > 0) {

      const total =
        reviews.reduce(
          (sum, r) =>
            sum + (r.rating || 0),
          0
        );

      avg =
        total / reviews.length;


      /* =========================
      SHOW REVIEWS
      ========================= */

      const latestReviews =
        reviews.slice(0, 2);

      latestReviews.forEach(r => {

        reviewHTML += `

          <div class="review-item">

            <div class="review-top">

              <strong>
                Student
              </strong>

              <div class="mini-stars">

                ${generateStars(r.rating)}

              </div>

            </div>

            <p>

              ${
                r.comment ||
                "Nice hostel environment"
              }

            </p>

          </div>

        `;
      });

    } else {

      reviewHTML = `

        <div class="review-item">

          <p>
            No reviews yet
          </p>

        </div>

      `;
    }


    /* =========================
    CREATE CARD
    ========================= */

    const card =
      document.createElement("div");

    card.className = "card";

    card.onclick = () =>
      openHostel(h.id);

    card.innerHTML = `

      <img
        src="${
          h.image_url ||
          "https://via.placeholder.com/300"
        }"
        alt="${h.name || "Hostel"}"
      >

      <div class="card-content">

        <div class="card-top">

          <h3>
            ${h.name || "No name"}
          </h3>

          <span class="price">

            ₦${Number(
              h.price || 0
            ).toLocaleString()}

          </span>

        </div>

        <p class="location-text">

          <i class="fa fa-location-dot"></i>

          ${h.location || "No location"}

        </p>

        <!-- STARS -->
        <div class="rating-row">

          <div class="stars">

            ${generateStars(avg)}

          </div>

          <span class="rating-text">

            ${avg.toFixed(1)}

          </span>

        </div>

        <!-- REVIEWS -->
        <div class="review-box">

          ${reviewHTML}

        </div>

        <button class="small-btn">

          View Hostel

        </button>

      </div>

    `;

    container.appendChild(card);
  }
}


/* =========================
OPEN HOSTEL
========================= */

window.openHostel = (id) => {

  localStorage.setItem(
    "hostelId",
    id
  );

  window.location.href =
    "hostel.html";
};


/* =========================
START
========================= */

loadHostels();
