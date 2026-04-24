import { supabase } from "./supabase.js"

const map = L.map("map").setView([6.5244, 3.3792], 12)

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map)

async function load() {
  const { data } = await supabase.from("hostels").select("*")

  data.forEach(h => {
    if (h.lat && h.lng) {
      L.marker([h.lat, h.lng])
        .addTo(map)
        .bindPopup(`<b>${h.name}</b><br>₦${h.price}`)
    }
  })
}

load()