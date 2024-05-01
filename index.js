const tabButtons = document.querySelectorAll(".tab-btn");
const forms = document.querySelectorAll(".form");

// Show the registration form by default
forms[0].style.display = "flex";

tabButtons.forEach((btn, index) => {
  btn.addEventListener("click", () => {
    // Hide all forms
    forms.forEach((form) => {
      form.style.display = "none";
    });

    // Remove the "active" class from all buttons
    tabButtons.forEach((btn) => {
      btn.classList.remove("active");
    });

    // Show the corresponding form and add the "active" class to the clicked button
    forms[index].style.display = "flex";
    btn.classList.add("active");
  });
});