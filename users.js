let users = [];
let currentPage = 1;
let isLoading = false;
let originalUsers = [];

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
  renderUserCards(users);
  updateURL({ sortAge: order });
}

function sortUsersByName(order) {
  users.sort((a, b) =>
    order === "asc"
      ? a.name.first.localeCompare(b.name.first)
      : b.name.first.localeCompare(a.name.first)
  );
  renderUserCards(users);
  updateURL({ sortName: order });
}

function sortUsersByRegistrationDate(order) {
  users.sort((a, b) =>
    order === "asc"
      ? new Date(a.registered.date) - new Date(b.registered.date)
      : new Date(b.registered.date) - new Date(a.registered.date)
  );
  renderUserCards(users);
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
  renderUserCards(users);
  updateURL({ sortAlphabet: order });
}

document
  .querySelector(".alphabet-section button:nth-of-type(1)")
  .addEventListener("click", () => {
    sortUsersByAlphabet("asc");
  });

document
  .querySelector(".alphabet-section button:nth-of-type(2)")
  .addEventListener("click", () => {
    sortUsersByAlphabet("desc");
  });

document
  .querySelector(".age-section button:nth-of-type(1)")
  .addEventListener("click", () => {
    sortUsersByAge("asc");
  });

document
  .querySelector(".age-section button:nth-of-type(2)")
  .addEventListener("click", () => {
    sortUsersByAge("desc");
  });

function filterUsersByAge(query) {
  const filteredUsers = originalUsers.filter((user) =>
    user.dob.age.toString().includes(query)
  );
  renderUserCards(filteredUsers);
  updateURL({ age: query });
}

function filterUsersByCountry(query) {
  const filteredUsers = originalUsers.filter((user) =>
    user.location.country.toLowerCase().includes(query.toLowerCase())
  );
  renderUserCards(filteredUsers);
  updateURL({ country: query });
}

document.querySelectorAll(".filter-input input").forEach((input) => {
  input.addEventListener("input", () => {
    const nameQuery = document.querySelector(".name-search").value.trim();
    const ageQuery = document
      .querySelector(".filter-input input:nth-of-type(1)")
      .value.trim();
    const countryQuery = document
      .querySelector(".filter-input input:nth-of-type(2)")
      .value.trim();

    if (ageQuery) filterUsersByAge(ageQuery);
    else if (countryQuery) filterUsersByCountry(countryQuery);
  });
});

document
  .querySelector(".registration-section button:nth-of-type(1)")
  .addEventListener("click", () => {
    sortUsersByRegistrationDate("asc");
  });

document
  .querySelector(".registration-section button:nth-of-type(2)")
  .addEventListener("click", () => {
    sortUsersByRegistrationDate("desc");
  });

function searchUsersByName(query) {
  const filteredUsers = users.filter((user) =>
    `${user.name.first} ${user.name.last}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );
  renderUserCards(filteredUsers);
  updateURL({ nameQuery: query });
}

document.getElementById("nameSearch").addEventListener("input", (event) => {
  const nameQuery = event.target.value.trim();
  searchUsersByName(nameQuery);
});

function sortUsersByGender(gender) {
  const filteredUsers = originalUsers.filter(
    (user) => user.gender.toLowerCase() === gender.toLowerCase()
  );
  renderUserCards(filteredUsers);
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

document.getElementById("resetBtn").addEventListener("click", resetFilters);