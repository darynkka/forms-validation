let users = [];
let currentPage = 1;
let isLoading = false;
let originalUsers = [];
let typingTimeout;

async function fetchUsers() {
  try {
    const response = await fetch(
      `https://randomuser.me/api/?page=${currentPage}&results=12`
    );
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("ERROR:", error);
    throw error;
  }
}

function renderUserCards(usersToRender) {
  const cardsContainer = document.getElementById("cardsContainer");
  cardsContainer.innerHTML = "";
  usersToRender.forEach((user) => {
    const card = createUserCard(user);
    cardsContainer.appendChild(card);
  });
}

function createUserCard(user) {
  const card = document.createElement("div");
  card.classList.add("user-card");

  const cardContent = document.createElement("div");
  cardContent.classList.add("user-card-content");

  const image = document.createElement("img");
  image.src = user.picture.medium;
  image.alt = `${user.name.first} ${user.name.last}`;

  const name = document.createElement("h3");
  name.textContent = `${user.name.first} ${user.name.last}`;

  const age = document.createElement("p");
  age.textContent = `Age: ${user.dob.age}`;

  const phone = document.createElement("p");
  phone.textContent = `${user.phone}`;

  const gender = document.createElement("p");
  gender.textContent = `${user.gender}`;
  gender.classList.add("gender");

  const registered = document.createElement("p");
  registered.textContent = `Registered: ${new Date(
    user.registered.date
  ).toLocaleDateString()}`;

  const locationContainer = document.createElement("div");
  locationContainer.classList.add("location-container");

  const location = document.createElement("p");
  location.textContent = `${user.location.country}`;
  locationContainer.appendChild(location);

  cardContent.appendChild(image);
  cardContent.appendChild(name);
  cardContent.appendChild(age);
  cardContent.appendChild(phone);
  cardContent.appendChild(gender);
  cardContent.appendChild(registered);

  card.appendChild(cardContent);
  card.appendChild(locationContainer);

  return card;
}

window.addEventListener("load", async () => {
  users = await fetchUsers();
  originalUsers = [...users];
  renderUserCards(users);
  applyFiltersFromURL();
});

window.addEventListener("scroll", async () => {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

  if (scrollTop + clientHeight >= scrollHeight - 100 && !isLoading) {
    isLoading = true;

    try {
      currentPage++;
      const newUsers = await fetchUsers();
      users = [...users, ...newUsers];
      originalUsers = [...users];
      renderUserCards(users);
    } catch (error) {
      console.error("Помилка при отриманні даних:", error);
    } finally {
      isLoading = false;
    }
  }
});

document.getElementById("logOut").addEventListener("click", () => {
  localStorage.clear();
});

function sortUsersByAge(order) {
  users.sort((a, b) =>
    order === "asc" ? a.dob.age - b.dob.age : b.dob.age - a.dob.age
  );
  if (users.length === 0) {
    showModal("No results found");
  } else {
    renderUserCards(users);
  }
  updateURL({ sortAge: order });
}

function sortUsersByName(order) {
  users.sort((a, b) =>
    order === "asc"
      ? a.name.first.localeCompare(b.name.first)
      : b.name.first.localeCompare(a.name.first)
  );
  if (users.length === 0) {
    showModal("No results found");
    
  } else {
    renderUserCards(users);
  }
  updateURL({ sortName: order });
}

function sortUsersByRegistrationDate(order) {
  users.sort((a, b) =>
    order === "asc"
      ? new Date(a.registered.date) - new Date(b.registered.date)
      : new Date(b.registered.date) - new Date(a.registered.date)
  );
  if (users.length === 0) {
    showModal("No results found");
  } else {
    renderUserCards(users);
  }
  updateURL({ sortRegistration: order });
}

function sortUsersByAlphabet(order) {
  users.sort((a, b) => {
    const nameA = `${a.name.first} ${a.name.last}`;
    const nameB = `${b.name.first} ${b.name.last}`;
    if (order === "asc") {
      return nameA.localeCompare(nameB);
    } else {
      return nameB.localeCompare(nameA);
    }
  });
  if (users.length === 0) {
    showModal("No results found");
  } else {
    renderUserCards(users);
  }
  updateURL({ sortAlphabet: order });
}

document
  .getElementById('alphAsc').addEventListener("click", () => {
    sortUsersByAlphabet("asc");
  });

document
  .getElementById('alphDesc').addEventListener("click", () => {
    sortUsersByAlphabet("desc");
  });

document
  .getElementById('ageAsc').addEventListener("click", () => {
    sortUsersByAge("asc");
  });

document
  .getElementById('ageDesc').addEventListener("click", () => {
    sortUsersByAge("desc");
  });

function filterUsersByAge(query) {
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    const filteredUsers = originalUsers.filter((user) =>
      user.dob.age.toString().includes(query)
    );
    if (filteredUsers.length === 0) {
      showModal("No results found");
    } else {
      renderUserCards(filteredUsers);
    }
    updateURL({ age: query });
  }, 500);
}

function filterUsersByCountry(query) {
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    const filteredUsers = originalUsers.filter((user) =>
      user.location.country.toLowerCase().includes(query.toLowerCase())
    );
    if (filteredUsers.length === 0) {
      showModal("No results found");
    } else {
      renderUserCards(filteredUsers);
    }
    updateURL({ country: query });
  }, 500);
}

document.querySelectorAll(".filter-input input").forEach((input) => {
  input.addEventListener("input", () => {
    const nameQuery = document.querySelector(".name-search").value.trim();
    const ageQuery = document.getElementById('ageFilter').value.trim();
    const countryQuery = document.getElementById('countryFilter').value.trim();
    if (ageQuery) filterUsersByAge(ageQuery);
    if (countryQuery) filterUsersByCountry(countryQuery);
  });
});

document
  .getElementById('dateAsc').addEventListener("click", () => {
    sortUsersByRegistrationDate("asc");
  });

document
  .getElementById('dateDesc').addEventListener("click", () => {
    sortUsersByRegistrationDate("desc");
  });

function searchUsersByName(query) {
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    const filteredUsers = users.filter((user) =>
      `${user.name.first} ${user.name.last}`
        .toLowerCase()
        .includes(query.toLowerCase())
    );
    if (filteredUsers.length === 0) {
      showModal("No results found");
    } else {
      renderUserCards(filteredUsers);
    }
    updateURL({ nameQuery: query });
  }, 500);
}

document.getElementById("nameSearch").addEventListener("input", (event) => {
  const nameQuery = event.target.value.trim();
  searchUsersByName(nameQuery);
});

function sortUsersByGender(gender) {
  const filteredUsers = originalUsers.filter(
    (user) => user.gender.toLowerCase() === gender.toLowerCase()
  );
  if (filteredUsers.length === 0) {
    showModal("No results found");
  } else {
    renderUserCards(filteredUsers);
  }
  updateURL({ gender: gender });
}

document.querySelectorAll(".gender-filter input").forEach((input) => {
  input.addEventListener("change", (event) => {
    const selectedGender = event.target.id;
    sortUsersByGender(selectedGender);
  });
});

function updateURL(params) {
  const url = new URL(window.location.href);
  url.search = new URLSearchParams(params).toString();
  window.history.pushState({}, '', url.toString());
}

function applyFiltersFromURL() {
  const url = new URL(window.location.href);
  const params = new URLSearchParams(url.search);

  if (params.has('age')) {
    const ageQuery = params.get('age');
    filterUsersByAge(ageQuery);
  }

  if (params.has('country')) {
    const countryQuery = params.get('country');
    filterUsersByCountry(countryQuery);
  }

  if (params.has('sortAge')) {
    const sortOrder = params.get('sortAge');
    sortUsersByAge(sortOrder);
  }

  if (params.has('sortName')) {
    const sortOrder = params.get('sortName');
    sortUsersByName(sortOrder);
  }

  if (params.has('sortRegistration')) {
    const sortOrder = params.get('sortRegistration');
    sortUsersByRegistrationDate(sortOrder);
  }

  if (params.has('sortAlphabet')) {
    const sortOrder = params.get('sortAlphabet');
    sortUsersByAlphabet(sortOrder);
  }

  if (params.has('nameQuery')) {
    const nameQuery = params.get('name');
    searchUsersByName(nameQuery);
  }

  if (params.has('gender')) {
    const gender = params.get('gender');
    sortUsersByGender(gender);
  }
}

window.addEventListener('popstate', applyFiltersFromURL);

function resetFilters() {
  users = [...originalUsers];
  renderUserCards(users);
  updateURL({});
}

function showModal(message) {
  const modal = document.getElementById('successModal');
  const title = document.getElementById('title');
  title.textContent = message;
  modal.classList.remove('success-modal-hidden');
  modal.classList.add('show');

  setTimeout(() => {
    hideModal();  
  }, 2000);
  renderUserCards(originalUsers);
}

function hideModal() {
  const modal = document.getElementById('successModal');
  modal.classList.remove('show');
  modal.classList.add('success-modal-hidden');
}

document.getElementById("resetBtn").addEventListener("click", resetFilters);
