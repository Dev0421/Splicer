const axios = require("axios");

const fs = require("fs");
const path = require("path");

const openDialogBtn = document.getElementById('openDialogBtn');
const projectModal = document.getElementById('projectModal');
const cancelBtn = document.getElementById('cancelBtn');
const searchInput = document.getElementById('searchInput');
const file_path = "src/assets/data/";
function saveFile(filePath, objectData) {
  const directory = path.dirname(filePath);
  if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(objectData, null, 2), "utf8");
  console.log("Data saved to:", filePath);
}
openDialogBtn.addEventListener('click', () => {
  projectModal.classList.remove('hidden');
  setTimeout(() => {
    projectModal.classList.remove('opacity-0', 'scale-95');
  }, 10);
});

cancelBtn.addEventListener('click', () => {
  projectModal.classList.add('opacity-0', 'scale-95');
  setTimeout(() => {
    projectModal.classList.add('hidden');
  }, 300);
});

window.addEventListener('click', (e) => {
  if (e.target === projectModal) {
    projectModal.classList.add('opacity-0', 'scale-95');
    setTimeout(() => {
      projectModal.classList.add('hidden');
    }, 300);
  }
});

function storeProject(id){
    localStorage.setItem("projectId", id);
    redirectToPage('sheet.html');
}

window.onload = () => {
  document.getElementById("user").innerHTML = localStorage.getItem("username");
  document.getElementById("email").innerHTML = localStorage.getItem("email");
  getProjects();
};

async function getProjects() {
  const token = localStorage.getItem("token");
  if (!token) {
    console.error("No token found! Please log in.");
    return;
  }

  try {
    const response = await axios.get("http://localhost:3000/api/projects", {
      headers: { Authorization: token }
    });
    let str = "";
    for (let i = 0; i < response.data.length; i++) {
        const data = response.data[i];
        str += `
          <div class="bg-white shadow-md rounded-lg w-full text-left hover:bg-gray-100 focus:outline-none">
            <div class="flex justify-between p-4 pb-0 items-center">
                <h2 class="text-lg font-semibold w-[180px] overflow-hidden whitespace-nowrap text-ellipsis" data-search="${data.title}">${data.title}</h2>
                <svg onclick="openModal(${data.id})" class="w-6 h-6 text-gray-500 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </div>
            <button onclick="storeProject(${data.id})" class="p-4 w-full text-left">
                <p class="text-sm text-gray-500">${data.company}</p>
                <p class="text-sm text-gray-500">${data.tech}</p>
                <p class="text-sm text-gray-500">${data.enclosure_id}</p>
                <p class="text-xs text-gray-400">${data.date}</p>
              </button>
          </div>
            `;
    }
    document.getElementById("data-container").innerHTML = str;
  } catch (error) {
    console.error("Error:", error.response ? error.response.data : error.message);
  }
}

async function getProjectById(id) {
  const token = localStorage.getItem("token");
  if (!token) {
    console.error("No token found! Please log in.");
    return;
  }

  try {
    const response = await axios.get(`http://localhost:3000/api/project/${id}`, {
      headers: { Authorization: token }
    });
    localStorage.setItem("enclosure_info", response.data);
  } catch (error) {
    console.error("Error:", error.response ? error.response.data : error.message);
  }
}

function redirectToMap() {
  localStorage.setItem("prevPage", window.location.href);
  redirectToPage('map.html');
}
document.getElementById("searchInput").addEventListener("input", function () {
  let searchValue = this.value.trim().toLowerCase();

  document.querySelectorAll("h2").forEach(h2 => {
      let searchAttr = h2.dataset.search ? h2.dataset.search.toLowerCase() : "";

      if (searchValue === "" || searchAttr.includes(searchValue)) {
          h2.parentElement?.parentElement?.classList.remove("hidden"); // Show matching elements
      } else {
          h2.parentElement?.parentElement?.classList.add("hidden"); // Hide non-matching elements
      }
  });
});

document.getElementById("enclosureForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      showCustomAlert("No token found! Please log in.");
        return;
    }
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');  // Months are 0-indexed, so we add 1
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const second = String(now.getSeconds()).padStart(2, '0');
    const formattedDateTime = `${year}_${month}_${day}_${hour}_${minute}_${second}`;
    const formData = {
        title: document.getElementById("title").value,
        company: document.getElementById("company").value,
        file_src: file_path+formattedDateTime+document.getElementById("title").value+".json",
        date: now.toLocaleDateString('en-CA'),
        tech: document.getElementById("tech").value,
        location_id: document.getElementById("location_id").value,
        enclosure_id: document.getElementById("enclosure_id").value,
        enclosure_type: document.getElementById("enclosure_type").value,
        road_name: document.getElementById("road_name").value,
        lat_long: document.getElementById("lat_long").value,
        notes: document.getElementById("notes").value,
        tableCount: 0,
        table: [],
    };
    saveFile(file_path+formattedDateTime+document.getElementById("title").value+".json", formData);
    try {
        const response = await fetch("http://localhost:3000/api/project/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `${token}` 
            },
            body: JSON.stringify(formData),
        });

        const data = await response.json();
        if (data.success) {
          console.log(data.project);
            displayEnclosure(data.project);
            projectModal.classList.add('opacity-0', 'scale-95');
            setTimeout(() => {
                projectModal.classList.add('hidden');
            }, 300);
        } else {
            console.log("Error saving: " + data.message);
        }
    } catch (error) {
        console.error("Error:", error);
    }
});

function displayEnclosure(data) {
  const container = document.getElementById("data-container");

  if (container) {
    const newButton = document.createElement("div");
    newButton.className = "bg-white shadow-md rounded-lg w-full text-left hover:bg-gray-100 focus:outline-none";
    newButton.innerHTML = `
            <div class="flex justify-between p-4 pb-0 items-center">
                <h2 class="text-lg font-semibold w-[180px] overflow-hidden whitespace-nowrap text-ellipsis" data-search="${data.title}">${data.title}</h2>
                  <svg onclick="openModal(${data.id})" class="w-6 h-6 text-gray-500 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
            </div>
            <button onclick="storeProject(${data.id})" class="p-4 w-full text-left">
                <p class="text-sm text-gray-500">${data.company}</p>
                <p class="text-sm text-gray-500">${data.tech}</p>
                <p class="text-sm text-gray-500">${data.enclosure_id}</p>
                <p class="text-xs text-gray-400">${data.date}</p>
              </button>
    `;
    container.appendChild(newButton);
  } else {
    console.error("Container with id 'data-container' not found.");
  }
}

function openModal(id) {
  document.getElementById('deleteModal').dataset.cardId = id;
  const modal = document.getElementById('deleteModal');
  modal.classList.remove('hidden'); 
  setTimeout(() => {
    modal.classList.remove('opacity-0', 'scale-95'); 
    modal.classList.add('opacity-100', 'scale-100'); 
  }, 10); 
}

function closeModal() {
  const modal = document.getElementById('deleteModal');
  modal.classList.remove('opacity-100', 'scale-100');
  modal.classList.add('opacity-0', 'scale-95');
  setTimeout(() => {
    modal.classList.add('hidden');
  }, 300); 
}

document.getElementById('deleteYes').addEventListener('click', function() {
  const cardId = document.getElementById('deleteModal').dataset.cardId;
  deleteCard(cardId);
});

function deleteCard(cardId) {
  const token = localStorage.getItem('token');

  if (!token) {
    showCustomAlert('Authorization token not found. Please log in again.');
    return;
  }

  axios.delete(`http://localhost:3000/api/project/${cardId}`, {
    headers: {
      'Authorization': `${token}`
    }
  })
    .then(response => {
      if (response.status === 200) {
        window.location.reload();
      } else {
        showCustomAlert('Failed to delete the card');
      }
    })
    .catch(error => {
      console.error('Error deleting card:', error);
      showCustomAlert('An error occurred while deleting the card');
    });
}
// Get references to the elements
const toggleArrow = document.getElementById('toggleArrow');
const extraInfo = document.getElementById('extraInfo');
const logoutButton = document.getElementById('logoutButton');

// Add event listener to toggle the visibility of extra info
toggleArrow.addEventListener('click', () => {
    extraInfo.classList.toggle('hidden');
    const arrow = toggleArrow.querySelector('svg');
    arrow.classList.toggle('rotate-180');
});
logoutButton.addEventListener('click', () => {
  showCustomAlert("Logging out...");
  ['username', 'email', 'token'].forEach(key => localStorage.removeItem(key));
  setTimeout(() => {
      window.location.href = 'index.html';
  }, 1000);
});
