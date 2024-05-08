const container = document.querySelector(".tabs-container");

container.addEventListener("click", (e) => {
  const target = e.target;

  if (target.classList.contains("tab-btn")) {
    const forms = container.querySelectorAll(".form");
    forms.forEach((form) => {
      form.style.display = "none";
    });

    const tabButtons = container.querySelectorAll(".tab-btn");
    tabButtons.forEach((btn) => {
      btn.classList.remove("active");
    });

    const index = Array.from(tabButtons).indexOf(target);
    forms[index].style.display = "flex";
    target.classList.add("active");
  }
});

let signUpForm = document.getElementById("signUp");
let signInForm = document.getElementById("login");

let registerFormData = new FormData(signUpForm);
let loginFormData = new FormData(signInForm);

function togglePasswordVisibility(passwordInput, icon) {
  const closedEyeIcon = "/closed-eye.png";
  const openedEyeIcon = "/opened-eye.png";

  icon.addEventListener("click", () => {
    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      icon.src = openedEyeIcon;
    } else {
      passwordInput.type = "password";
      icon.src = closedEyeIcon;
    }
  });
}

const registerPasswordInput = document.getElementById("userPassword");
const confirmRegisterPassword = document.getElementById("confirmPassword");
const loginPassword = document.getElementById("loginPassword");

const registerPasswordIcon = document.getElementById("passwordIcon");
const confirmPasswordIcon = document.getElementById("confirmIcon");
const loginPasswordIcon = document.getElementById("loginIcon");

togglePasswordVisibility(registerPasswordInput, registerPasswordIcon);
togglePasswordVisibility(confirmRegisterPassword, confirmPasswordIcon);
togglePasswordVisibility(loginPassword, loginPasswordIcon);

const loader = document.querySelector(".loader");

function startLoading() {
  loader.classList.add("spinning");
  loader.style.opacity = 1;
  loader.style.visibility = "visible";
}

function stopLoading() {
  loader.classList.remove("spinning");
  loader.style.opacity = 0;
  loader.style.visibility = "hidden";
}

const emailRegex = /^\S+@\S+\.\S+$/;

function validateForm(form, formType) {
  const errors = {};

  const inputs = form.querySelectorAll("input");
  inputs.forEach((input) => {
    const inputName = input.name;
    const inputValue = input.value.trim();

    if (formType === "signUp") {
      if (inputName === "username") {
        if (inputValue.length < 3 || inputValue.length > 15) {
          errors.username =
            "Please create a username between 3 and 15 characters";
        }
      } else if (inputName === "email") {
        if (!emailRegex.test(inputValue)) {
          errors.email = "Please enter a valid email address";
        }
      } else if (inputName === "password") {
        if (inputValue.length > 6) {
          errors.password = "Password must be at least 6 characters long";
        }
      } else if (inputName === "confirmPassword") {
        const password = form.querySelector('[name="password"]').value;
        if (inputValue !== password) {
          errors.confirmPassword = "Passwords do not match";
        }
      }
    }

    if (formType === "signIn") {
      if (inputName === "username" && !inputValue) {
        errors.username = "This field is required";
      } else if (inputName === "password" && inputValue.length < 6) {
        errors.password = "Password must be at least 6 characters long";
      }
    }
  });

  return errors;
}

function displayValidationMessage(input, error) {
  const validationMessage = input.nextElementSibling;
  const isRequired = !error && input.value.trim() === '';
  validationMessage.textContent = isRequired ? 'This field is required' : error || 'Great job';
  validationMessage.classList.remove("validation-message", "success-message");
  validationMessage.classList.add(error || isRequired ? "validation-message" : "success-message");
  input.classList.remove("invalid-input", "valid-input", "invalid-input");
  input.classList.add(error ? "invalid-input" : isRequired ? "invalid-input" : "valid-input");
}

function clearValidationMessages(form) {
  const inputs = form.querySelectorAll('input');
  inputs.forEach(input => {
    const validationMessage = input.nextElementSibling;
    validationMessage.textContent = '';
    validationMessage.classList.remove('success-message');
    input.classList.remove('valid-input');
  });
}


signUpForm.querySelectorAll("input").forEach((input) => {
  input.addEventListener("blur", () => {
    const errors = validateForm(signUpForm, "signUp");
    const error = errors[input.name];
    displayValidationMessage(input, error);
  });
});

signInForm.querySelectorAll("input").forEach((input) => {
  input.addEventListener("blur", () => {
    const errors = validateForm(signInForm, "signIn");
    const error = errors[input.name];
    displayValidationMessage(input, error);
  });
});

signUpForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(signUpForm);
  try {
    const response = await sendData(formData);
    console.log(response);
    signUpForm.reset();
    clearValidationMessages(signUpForm);
  } catch (error) {
    console.error(error);
  }
});

signInForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(signInForm);
  hideMessages();
  try {
    const response = await sendData(formData);
    console.log(response);
    signInForm.reset();
    clearValidationMessages(signInForm);
  } catch (error) {
    console.error(error);
  }
});

function sendData(formData) {
  startLoading();
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const success = Math.random() > 0.2; // 20% шансів на помилку
      stopLoading();
      if (success) {
        resolve("Registration successful");
      } else {
        reject("Server error");
      }
    }, 1500);
  });
}
