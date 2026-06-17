// =========================================
// START: TERMS SCROLL VALIDATION
// =========================================
document.addEventListener("DOMContentLoaded", () => {

  const btn = document.querySelector(".agree");
  const box = document.querySelector(".terms-box");

  console.log("btn =", btn);
  console.log("box =", box);

  // Disable agree button initially until user scrolls to bottom
  btn.disabled = true;

  box.addEventListener("scroll", () => {

    const bottom =
      Math.ceil(box.scrollTop + box.clientHeight) >=
      box.scrollHeight - 5;

    if (bottom) {
      btn.disabled = false;

      // Attach acceptTerms function when user reaches bottom
      btn.onclick = acceptTerms;
    }

  });

});
// =========================================
// END: TERMS SCROLL VALIDATION
// =========================================


// =========================================
// START: DECLINE TERMS FUNCTION
// =========================================
function declineTerms() {

  // Clear stored booking data
  localStorage.removeItem("bookingData");
  localStorage.removeItem("bookingId");

  // Redirect user back to booking page
  window.location.href = "picklehaus.html";
}
// =========================================
// END: DECLINE TERMS FUNCTION
// =========================================


// =========================================
// START: ACCEPT TERMS AND SUBMIT BOOKING
// =========================================
async function acceptTerms() {

  // Get pending booking data from localStorage
  const payload = JSON.parse(localStorage.getItem("pendingBooking"));

  if (!payload) {
    alert("Missing booking data");
    return;
  }

  try {

    // Show loading spinner
    document.getElementById("loadingSpinner").style.display = "block";

    // Disable buttons to prevent multiple submissions
    document.querySelector(".agree").disabled = true;
    document.querySelector(".decline").disabled = true;

    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Get payment screenshot from sessionStorage
    const dataURL = sessionStorage.getItem("paymentScreenshot");

    // Convert base64 dataURL to File object
    const dataURLtoFile = (dataurl, filename) => {
      const arr = dataurl.split(',');
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);

      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }

      return new File([u8arr], filename, { type: mime });
    };

    // Create file object if screenshot exists
    const file = dataURL ? dataURLtoFile(dataURL, "payment.jpg") : null;

    // Create FormData for backend request
    const formData = new FormData();

    formData.append("name", payload.name);
    formData.append("email", payload.email);
    formData.append("phone", payload.phone);
    formData.append("date", payload.date);
    formData.append("slots", JSON.stringify(payload.slots));

    // Attach screenshot file if available
    if (file) {
      formData.append("screenshot", file);
    }

    // Send booking request to backend
    const res = await fetch("https://pickleball-court-backend.onrender.com/book", {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    // Handle backend failure response
    if (!data.success) {
      throw new Error(data.message);
    }

    // Generate booking ID for UI display only
    const bookingId =
      "BK-" +
      Math.floor(100000 + Math.random() * 900000);

    // Store booking ID locally
    localStorage.setItem("bookingId", bookingId);

    // Clear payment screenshot after successful booking
    sessionStorage.removeItem("paymentScreenshot");

    // Redirect to success page
    window.location.href = "submitted.html";

  } catch (err) {

    console.error(err);

    // Hide loading spinner on error
    document.getElementById("loadingSpinner").style.display = "none";

    // Re-enable buttons
    document.querySelector(".agree").disabled = false;
    document.querySelector(".decline").disabled = false;

    alert("Server error or booking failed");
  }
}
// =========================================
// END: ACCEPT TERMS AND SUBMIT BOOKING
// =========================================
