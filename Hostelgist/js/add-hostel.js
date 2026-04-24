import { supabase } from "./supabase.js"

const form = document.getElementById("hostelForm")

form.addEventListener("submit", async (e) => {
  e.preventDefault()

  const name = document.getElementById("name").value
  const price = document.getElementById("price").value
  const location = document.getElementById("location").value
  const description = document.getElementById("description").value
  const file = document.getElementById("image").files[0]

  if (!file) {
    alert("Please select an image")
    return
  }

  try {
    // Upload image
    const fileName = Date.now() + "-" + file.name

    const { error: uploadError } = await supabase.storage
      .from("hostel-images")
      .upload(fileName, file)

    if (uploadError) {
      console.log("UPLOAD ERROR:", uploadError)
      alert("Image upload failed")
      return
    }

    // Get public URL
    const { data } = supabase.storage
      .from("hostel-images")
      .getPublicUrl(fileName)

    const imageUrl = data.publicUrl

    // Insert into DB
    const { error: insertError } = await supabase
      .from("hostels")
      .insert([
        {
          name,
          price,
          location,
          description,
          image_url: imageUrl
        }
      ])

    if (insertError) {
      console.log("INSERT ERROR:", insertError)
      alert("Error saving hostel")
      return
    }

    alert("Hostel added successfully")
    window.location.href = "index.html"

  } catch (err) {
    console.log("GENERAL ERROR:", err)
    alert("Something went wrong")
  }
})