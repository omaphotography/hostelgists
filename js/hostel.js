import { supabase } from "./supabase.js";

const id = localStorage.getItem("hostelId");

const container =
  document.getElementById("details");

const reviewsBox =
  document.getElementById("reviews");

let selectedRating = 0;


/* =========================
CHECK HOSTEL ID
========================= */

if (!id) {

  if (container) {

    container.innerHTML = `

      <div class="form-card">

        <p>
          No hostel selected
        </p>

      </div>

    `;
  }

  throw new Error(
    "No hostel ID found"
  );
}


/* =========================
LOAD HOSTEL DETAILS
========================= */

async function loadDetails() {

  if (!container) return;

  container.innerHTML = `

    <div class="loading-box">

      Loading hostel details...

    </div>

  `;

  try {

    console.log(
      "Loading hostel details..."
    );

    const {
      data,
      error
    } = await supabase
      .from("hostels")
      .select("*")
      .eq("id", id)
      .single();

    console.log("Hostel:", data);
    console.log("Error:", error);

    if (error || !data) {

      container.innerHTML = `

        <div class="form-card">

          <p>
            Failed to load hostel
          </p>

          <small>
            ${error?.message || ""}
          </small>

        </div>

      `;

      return;
    }


    /* =========================
    LOAD REVIEW STATS
    ========================= */

    let avg = 0;
    let count = 0;

    try {

      const {
        data: reviews,
        error: reviewError
      } = await supabase
        .from("reviews")
        .select("rating")
        .eq("hostel_id", id);

      if (reviewError) {

        console.log(
          "Review stats error:",
          reviewError
        );

      } else {

        const safeReviews =
          reviews || [];

        count =
          safeReviews.length;

        if (count > 0) {

          const total =
            safeReviews.reduce(
              (sum, r) =>
                sum + Number(r.rating || 0),
              0
            );

          avg = total / count;
        }
      }

    } catch (err) {

      console.log(
        "Review stats failed:",
        err
      );
    }

    const avgDisplay =
      count > 0
        ? avg.toFixed(1)
        : "0.0";


    /* =========================
    DISPLAY HOSTEL
    ========================= */

    container.innerHTML = `

      <div class="details-card">

        <img
          src="${
            data.image_url ||
            "https://via.placeholder.com/500"
          }"
          class="detail-img"
          alt="${data.name || "Hostel"}"
        />

        <div class="details-content">

          <h2>

            ${data.name || "No Name"}

          </h2>

          <p>

            <i class="fa fa-location-dot"></i>

            ${data.location || "No location"}

          </p>

          <h3 class="price">

            ₦${Number(
              data.price || 0
            ).toLocaleString()}

          </h3>

          <!-- RATING -->
          <div class="play-rating-row">

            <div class="play-stars">

              ${generateStars(avg)}

            </div>

            <div class="rating-value">

              ${avgDisplay}

            </div>

            <div class="rating-count">

              (${count} reviews)

            </div>

          </div>

          <p class="details-description">

            ${
              data.description ||
              "No description available"
            }

          </p>

        </div>

      </div>

    `;

  } catch (err) {

    console.log(
      "Unexpected error:",
      err
    );

    container.innerHTML = `

      <div class="form-card">

        <p>
          Something went wrong
        </p>

      </div>

    `;
  }
}


/* =========================
LOAD REVIEWS
========================= */

async function loadReviews() {

  if (!reviewsBox) return;

  reviewsBox.innerHTML = `

    <div class="loading-box">

      Loading reviews...

    </div>

  `;

  try {

    const {
      data,
      error
    } = await supabase
      .from("reviews")
      .select("*")
      .eq("hostel_id", id)
      .order("created_at", {
        ascending: false
      });

    console.log("Reviews:", data);

    if (error) {

      console.log(error);

      reviewsBox.innerHTML = `
        <p>
          Failed to load reviews
        </p>
      `;

      return;
    }

    const safeData =
      data || [];

    if (safeData.length === 0) {

      reviewsBox.innerHTML = `

        <p>
          No reviews yet
        </p>

      `;

      return;
    }

    reviewsBox.innerHTML = "";

    safeData.forEach(r => {

      reviewsBox.innerHTML += `

        <div class="review-item">

          <div class="review-top">

            <strong>

              ${
                r.user_name ||
                "Anonymous User"
              }

            </strong>

            <div class="play-stars mini-stars">

              ${generateStars(
                Number(r.rating || 0)
              )}

            </div>

            <small>

              ${formatDate(
                r.created_at
              )}

            </small>

          </div>

          <p>

            ${r.comment || ""}

          </p>

        </div>

      `;
    });

  } catch (err) {

    console.log(err);

    reviewsBox.innerHTML = `

      <p>
        Something went wrong
      </p>

    `;
  }
}


/* =========================
GENERATE STARS
========================= */

function generateStars(rating = 0) {

  let stars = "";

  const rounded =
    Math.round(
      Number(rating || 0)
    );

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
FORMAT DATE
========================= */

function formatDate(dateString) {

  if (!dateString) return "";

  const date =
    new Date(dateString);

  return date.toLocaleDateString(
    "en-NG",
    {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }
  );
}


/* =========================
SHOW REVIEW FORM
========================= */

window.showReviewForm = async () => {

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {

    alert(
      "Login required to add review"
    );

    window.location.href =
      "login.html";

    return;
  }

  const box =
    document.getElementById(
      "reviewBox"
    );

  if (!box) return;

  box.style.display = "block";

  box.scrollIntoView({
    behavior: "smooth"
  });
};


/* =========================
STAR SELECTOR
========================= */

function initStars() {

  const stars =
    document.querySelectorAll(
      "#stars i"
    );

  stars.forEach(
    (star, index) => {

      star.addEventListener(
        "click",
        () => {

          selectedRating =
            index + 1;

          stars.forEach(
            (s, i) => {

              if (
                i < selectedRating
              ) {

                s.className =
                  "fa-solid fa-star active-star";

              } else {

                s.className =
                  "fa-regular fa-star inactive-star";
              }
            }
          );
        }
      );
    }
  );
}


/* =========================
SUBMIT REVIEW
========================= */

window.submitReview = async () => {

  try {

    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {

      window.location.href =
        "login.html";

      return;
    }

    const comment =
      document
        .getElementById("comment")
        .value
        .trim();

    if (!selectedRating) {

      alert(
        "Please select a rating"
      );

      return;
    }


    /* =========================
    GET USER NAME
    ========================= */

    let userName =
      "Anonymous User";

    try {

      const {
        data: profile
      } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", user.id)
        .single();

      if (profile?.name) {

        userName =
          profile.name;
      }

    } catch (err) {

      console.log(
        "Profile fetch failed:",
        err
      );
    }


    /* =========================
    INSERT REVIEW
    ========================= */

    const { error } =
      await supabase
        .from("reviews")
        .insert([{
          hostel_id: id,
          rating: selectedRating,
          comment,
          user_id: user.id,
          user_name: userName
        }]);

    if (error) {

      console.log(
        "Review insert error:",
        error
      );

      alert(error.message);

      return;
    }

    alert(
      "Review added successfully"
    );


    /* =========================
    RESET FORM
    ========================= */

    selectedRating = 0;

    document.getElementById(
      "comment"
    ).value = "";

    document
      .querySelectorAll("#stars i")
      .forEach(star => {

        star.className =
          "fa-regular fa-star inactive-star";
      });


    /* =========================
    RELOAD DATA
    ========================= */

    loadDetails();
    loadReviews();

  } catch (err) {

    console.log(err);

    alert(
      "Something went wrong"
    );
  }
};


/* =========================
INIT
========================= */

window.addEventListener(
  "DOMContentLoaded",
  () => {

    loadDetails();
    loadReviews();
    initStars();

  }
);
