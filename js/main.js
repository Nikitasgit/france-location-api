//Selectors
const url = "https://geo.api.gouv.fr";
const regionsList = document.getElementById("select-regions");
const departementsList = document.getElementById("select-departements");
const submitBtn = document.getElementById("submit-selection");
const table = document.getElementById("table");
const userLocation = document.getElementById("user-location");

//Global variables
let regions = [];
let departements = [];
let communes = [];
let chosenDepartement = {};
let map;

//Functions
const findUserLocation = (lat, long) => {
  fetch(
    `${url}/communes?lat=${lat}&lon=${long}&fields=code,nom,codesPostaux,surface,population,centre,contour`
  )
    .then((response) => response.json())
    .then(([response]) => {
      table.innerHTML = "";
      const listHeaders = document.createElement("tr");
      const headerNames = document.createElement("th");
      const headerPopulation = document.createElement("th");
      listHeaders.appendChild(headerNames);
      listHeaders.appendChild(headerPopulation);
      headerNames.append(`Commune: ${response.nom}`);
      headerPopulation.append(`Habitants`);
      table.appendChild(listHeaders);

      const listItem = document.createElement("tr");
      const name = document.createElement("td");
      const population = document.createElement("td");
      name.append(response.nom);
      population.append(response.population);
      listItem.appendChild(name);
      listItem.appendChild(population);
      table.appendChild(listItem);
    });
};

//Geolocation of user
navigator.geolocation.getCurrentPosition((position) => {
  const { lat, lng } = {
    lat: position.coords.latitude,
    lng: position.coords.longitude,
  };
  map = L.map("map").setView([lat, lng], 13);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  findUserLocation(lat, lng);
});

//Get Regions from API
const fetchRegions = () => {
  fetch(url + "/regions")
    .then((response) => response.json())
    .then((response) => {
      regions = response;
      response.forEach((region) => {
        const option = document.createElement("option");
        option.append(region.nom);
        regionsList.appendChild(option);
      });
      const region = findSelectedRegion(regionsList.value);
      if (region) fetchDepartments(region.code);
    });
};

//Search and return current region selected from regions array
const findSelectedRegion = (value) => {
  return regions.find((region) => region.nom === value);
};

//Fetch and display departements from API
const fetchDepartments = (code) => {
  fetch(`${url}/regions/${code}/departements`)
    .then((response) => response.json())
    .then((response) => {
      departements = response;
      departementsList.innerHTML = "";
      response.forEach((departement) => {
        const option = document.createElement("option");
        option.append(departement.nom);
        departementsList.appendChild(option);
      });
    });
};

//Search and return current departement selected from departements array
const findSelectedDepartement = (value) => {
  return departements.find((departement) => departement.nom === value);
};

//Fetch and display communes from API
const findCommunes = (code) => {
  fetch(`${url}/departements/${code}/communes`)
    .then((response) => response.json())
    .then((response) => {
      response.sort((a, b) => Number(b.population) - Number(a.population));
      table.innerHTML = "";
      const listHeaders = document.createElement("tr");
      const headerNames = document.createElement("th");
      const headerPopulation = document.createElement("th");
      listHeaders.appendChild(headerNames);
      listHeaders.appendChild(headerPopulation);
      headerNames.append(`Communes du département: ${departementsList.value}`);
      headerPopulation.append(`Habitants`);
      table.appendChild(listHeaders);
      response.forEach((commune) => {
        const listItem = document.createElement("tr");
        const name = document.createElement("td");
        const population = document.createElement("td");
        name.append(commune.nom);
        population.append(commune.population);
        listItem.appendChild(name);
        listItem.appendChild(population);
        table.appendChild(listItem);
      });
    });
};

//Events
regionsList.addEventListener("change", (e) => {
  const region = findSelectedRegion(e.target.value);
  if (region) fetchDepartments(region.code);
});

departementsList.addEventListener("change", (e) => {
  chosenDepartement = findSelectedDepartement(e.target.value);
});

submitBtn.addEventListener("click", () => {
  const departement = findSelectedDepartement(departementsList.value);
  if (departement) findCommunes(departement.code);
});

//Initial fetch
fetchRegions();
