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
  let hasErrors = false;

  const inputs = form.querySelectorAll("input");
  inputs.forEach((input) => {
    const inputName = input.name;
    const inputValue = input.value.trim();

    if (formType === "signUp") {
      if (inputName === "username") {
        if (inputValue.length < 3 || inputValue.length > 15) {
          errors.username =
            "Please create a username between 3 and 15 characters";
          hasErrors = true;
        } else if (!inputValue) {
          errors.username = "This field is required";
          hasErrors = true;
        }
      } else if (inputName === "email") {
        if (!emailRegex.test(inputValue)) {
          errors.email = "Please enter a valid email address";
          hasErrors = true;
        } else if (!inputValue) {
          errors.email = "This field is required";
          hasErrors = true;
        }
      } else if (inputName === "password") {
        if (inputValue.length < 6) {
          errors.password = "Password must be at least 6 characters long";
          hasErrors = true;
        } else if (!inputValue) {
          errors.password = "This field is required";
          hasErrors = true;
        }
      } else if (inputName === "confirmPassword") {
        const password = form.querySelector('[name="password"]').value;
        if (inputValue !== password) {
          errors.confirmPassword = "Passwords do not match";
          hasErrors = true;
        } else if (!inputValue) {
          errors.confirmPassword = "This field is required";
          hasErrors = true;
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

  return { errors, hasErrors };
}

function displayValidationMessage(input, error) {
  const validationMessage = input.nextElementSibling;
  const isRequired = !error && input.value.trim() === "";
  validationMessage.textContent = isRequired
    ? "This field is required"
    : error || "Great job";
  validationMessage.classList.remove("validation-message", "success-message");
  validationMessage.classList.add(
    error || isRequired ? "validation-message" : "success-message"
  );
  input.classList.remove("valid-input", "invalid-input");
  input.classList.add(
    error ? "invalid-input" : isRequired ? "invalid-input" : "valid-input"
  );
}

function clearValidationMessages(form) {
  const inputs = form.querySelectorAll("input");
  inputs.forEach((input) => {
    const validationMessage = input.nextElementSibling;
    validationMessage.textContent = "";
    validationMessage.classList.remove("success-message");
    input.classList.remove("valid-input");
  });
}

function createUser(formData) {
  const user = {
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
  };

  localStorage.setItem("user", JSON.stringify(user));
}

function isUserExist(username, password) {
  const storedUser = JSON.parse(localStorage.getItem("user"));

  if (
    storedUser &&
    storedUser.username === username &&
    storedUser.password === password
  ) {
    return true;
  }

  return false;
}

// function deleteUser() {
//   localStorage.removeItem("user");
// }
signUpForm.querySelectorAll("input").forEach((input) => {
  input.addEventListener("blur", () => {
    const errors = validateForm(signUpForm, "signUp");
    const error = errors[input.name];
    displayValidationMessage(input, error);
  });
});
let logout = document.getElementById("logOut");
// logout.addEventListener("click", () => {
//   deleteUser();
// });
signInForm.querySelectorAll("input").forEach((input) => {
  input.addEventListener("blur", () => {
    const errors = validateForm(signInForm, "signIn");
    const error = errors[input.name];
    displayValidationMessage(input, error);
  });
});

signUpForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(signUpForm);
  const { errors, hasErrors } = validateForm(signUpForm, "signUp");

  if (!hasErrors) {
    try {
      const response = await sendData(formData);
      console.log(response);
      signUpForm.reset();
      createUser(formData);
      clearValidationMessages(signUpForm);
    } catch (error) {
      console.error(error);
    }
  } else {
    Object.entries(errors).forEach(([inputName, errorMessage]) => {
      const input = signUpForm.querySelector(`[name="${inputName}"]`);
      displayValidationMessage(input, errorMessage);
    });
  }
});

signInForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(signInForm);
  const { errors, hasErrors } = validateForm(signInForm, "signIn");

  if (!hasErrors) {
    const username = formData.get("username");
    const password = formData.get("password");

    if (isUserExist(username, password)) {
      try {
        const response = await sendData(formData);
        console.log(response);
        signInForm.reset();
        clearValidationMessages(signInForm);
        window.location.href = "user.html";
      } catch (error) {
        console.error(error);
      }
    } else {
      const errorMessage = "Invalid username or password";
      successModal.querySelector("#title").textContent = errorMessage;
      successModal.classList.add("show");
      setTimeout(() => {
        successModal.classList.remove("show");
      }, 3000);
    }
  } else {
    Object.entries(errors).forEach(([inputName, errorMessage]) => {
      const input = signInForm.querySelector(`[name="${inputName}"]`);
      displayValidationMessage(input, errorMessage);
    });
  }
});

const successModal = document.getElementById("successModal");
const successMessage = document.getElementById("title");

function sendData(formData) {
  startLoading();

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const result = { success: true, message: "Registration was successful" };
      stopLoading();

      if (result.success) {
        resolve(result.message);
      } else {
        reject(result.message);
      }
    }, 1500);
  })
    .then((successMessage) => {
      successModal.querySelector("#title").textContent = successMessage;
      successModal.classList.add("show");
      setTimeout(() => {
        successModal.classList.remove("show");
      }, 3000);
    })
    .catch((errorMessage) => {
      successModal.querySelector("#title").textContent = errorMessage;
      successModal.classList.add("show");
      setTimeout(() => {
        successModal.classList.remove("show");
      }, 3000);
    });
}

