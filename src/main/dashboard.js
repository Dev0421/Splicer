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
  
  // Check and update online status from localStorage
  if (localStorage.getItem("Backend_Link") === 'http://147.93.118.209:5000') {
    document.getElementById("offline_sync").style.display = 'none';
    document.getElementById("online_sync").style.display = 'block';
  } else {
    document.getElementById("offline_sync").style.display = 'block';
    document.getElementById("online_sync").style.display = 'none';
  }
  getProjects();
};

async function getProjects() {
  const token = localStorage.getItem("token");
  if (!token) {
    console.error("No token found! Please log in.");
    return;
  }

  const userId = localStorage.getItem("userId"); // Retrieve userID from localStorage
  try {
    const response = await axios.get(`${localStorage.getItem("Backend_Link")}/api/projects?userId=${userId}`, {
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
    const response = await axios.get(`${localStorage.getItem("Backend_Link")}/api/project/${id}`, {
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
  const formattedDateTime = now.toISOString().replace('T', ' ').slice(0, 19).replace(/-/g, '-'); // Format as YY-MM-DD HH:MM:SS
  const fileName = `${file_path}${formattedDateTime.replace(/:/g, '_')}_${document.getElementById("title").value}.json`;

  const formData = {
      title: document.getElementById("title").value.trim(),
      company: document.getElementById("company").value.trim(),
      file_src: fileName,
      date: now.toLocaleDateString('en-CA'),
      tech: document.getElementById("tech").value.trim(),
      location_id: document.getElementById("location_id").value,
      enclosure_id: document.getElementById("enclosure_id").value,
      enclosure_type: document.getElementById("enclosure_type").value,
      road_name: document.getElementById("road_name").value.trim(),
      lat_long: document.getElementById("lat_long").value.trim(),
      notes: document.getElementById("notes").value.trim(),
      tableCount: 0,
      table: [],
      created_at: formattedDateTime, // Assign formattedDateTime directly
      updated_at: formattedDateTime // Update updated_at to the current time
  };

  saveFile(fileName, formData);  // Assuming saveFile is a function that correctly saves the file
  console.log("Token:", token);

  try {
      console.log("Creating Project...", );
      const response = await fetch(`${localStorage.getItem("Backend_Link")}/api/project/create`, {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
              "Authorization": token,  // No need for template literals unless dynamically modifying
          },
          body: JSON.stringify({
              ...formData,
              created_at: formData.created_at || formattedDateTime // Ensure created_at is only set if not already defined
          }),
      });

      const data = await response.json(); // Await the JSON response

      if (response.ok && data.success) { // Ensuring the request was successful
          console.log("Project Created:", data.project);
          displayEnclosure(data.project);

          projectModal.classList.add('opacity-0', 'scale-95');
          setTimeout(() => {
              projectModal.classList.add('hidden');
          }, 300);
      } else {
          console.error("Error saving:", data.message || "Unknown error from server");
      }
  } catch (error) {
      console.error("Request failed:", error);
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

  axios.delete(`${localStorage.getItem("Backend_Link")}/api/project/${cardId}`, {
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
  ['username', 'email', 'token', 'isOnline', 'Data', 'Backend_Link', 'offline_token', 'offline_userId', 'username', 'projectId', 'userId', 'userdata', 'userid'].forEach(key => localStorage.removeItem(key));
  setTimeout(() => {
      window.location.href = 'index.html';
  }, 1000);
});


function updateStatus() {
  const statusIndicator = document.getElementById('statusIndicator');
  const isOnline = navigator.onLine; // Check online status
  statusIndicator.style.backgroundColor = isOnline ? 'green' : 'red';
}

setInterval(updateStatus, 3000);
updateStatus();
function parseDateTime(dateTimeString) {
  // Check if the format is "YYYY-MM-DD HH:mm:ss"
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(dateTimeString)) {
      // Convert "YYYY-MM-DD HH:mm:ss" to Date
      return new Date(dateTimeString.replace(' ', 'T'));
  }
  
  // Check if the format is "DD-MM-DD HH:mm:ss"
  else if (/^\d{2}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(dateTimeString)) {
      // Convert "DD-MM-DD HH:mm:ss" to Date
      const [datePart, timePart] = dateTimeString.split(' ');
      const [day, month, year] = datePart.split('-');
      const fullYear = `20${year}`; // Assuming 20xx for two-digit years
      return new Date(`${fullYear}-${month}-${day}T${timePart}`);
  }
  
  // Invalid format
  throw new Error("Invalid date format");
}
function compareDateTimes(dateString1, dateString2) {
  // Convert the datetime strings to Date objects
  const date1 = parseDateTime(dateString1); // Replace '-' with '/' for compatibility and space with 'T'
  const date2 = parseDateTime(dateString2); 
  // Compare the two Date objects
  if (date1 > date2) {
      return 1;
  } else if (date1 < date2) {
      return -1;
  } else {
      return 0; // Dates are equal
  }
}

async function syncProjects() {
  const online_token = localStorage.getItem("token");
  const online_userId = localStorage.getItem("userId");
  const offline_token = localStorage.getItem("offline_token");
  const offline_userId = localStorage.getItem("offline_userId");

  if (!online_token || !online_userId) {
    console.error("No online token or userId found! Please log in to the online system.");
    return;
  }
  if (!offline_token || !offline_userId) {
    console.error("No offline token or userId found! Please log in to the offline system.");
    return;
  }

  let onProjects = [];
  let offProjects = [];

  try {
    const onlineResponse = await axios.get(`http://147.93.118.209:5000/api/projects?userId=${online_userId}`, {
      headers: { Authorization: online_token }
    });
    onProjects = onlineResponse.data;
  } catch (error) {
    console.error("Error fetching online projects:", error.response ? error.response.data : error.message);
  }

  try {
    const offlineResponse = await axios.get(`http://localhost:3000/api/projects?userId=${offline_userId}`, {
      headers: { Authorization: offline_token }
    });
    offProjects = offlineResponse.data;
  } catch (error) {
    console.error("Error fetching offline projects:", error.response ? error.response.data : error.message);
  }

  // Helper function to update a project
  async function updateProject(url, project, token, direction) {
    try {
      const response = await axios.put(url, project, {
        headers: { Authorization: token }
      });
      console.log(`Updated project ${direction}:`, response.data);
    } catch (error) {
      console.error(`Error updating project ${direction}:`, error.response ? error.response.data : error.message);
    }
  }

  // Helper function to synchronize files
  async function syncFiles(enclosureId, new_enclosureId, userId, new_userId, sourceLink, targetLink, sourceToken, targetToken, direction) {
    if (!new_enclosureId) {
      console.error(`Error: new_enclosureId is undefined for direction: ${direction}`);
      return;
    }
    try {
      // Fetch files from the source server
      
      const delete_response = await axios.get(`${targetLink}/api/files/getids/${new_enclosureId}/${new_userId}`, {
        headers: { Authorization: targetToken }
      });
      const deletefileIds = delete_response.data.fileIds; // Correctly access fileIds from response data
      for (const deletefileId of deletefileIds) {
        try {
          await axios.delete(`${targetLink}/api/files/delete/${deletefileId}`, {
            headers: { Authorization: targetToken }
          });
          console.log(`Deleted file ${direction}:`, deletefileId);
        } catch (error) {
          console.error(`Error deleting file ${direction}:`, error.response ? error.response.data : error.message);
        }
      }
      const response = await axios.get(`${sourceLink}/api/files/getids/${enclosureId}/${userId}`, {
        headers: { Authorization: sourceToken }
      });
      const fileIds = response.data.fileIds; // Correctly access fileIds from response data

      // Upload each file to the target server
      for (const fileId of fileIds) {
        try {
          // Download the file from the source server
          const fileResponse = await axios.get(`${sourceLink}/api/files/download/${fileId}`, {
            headers: { Authorization: sourceToken },
            responseType: 'blob' // Ensure the response is treated as a binary file
          });

          // Create a new FormData object to upload the file to the target server
          const formData = new FormData();
          formData.append('file', new Blob([fileResponse.data]), fileId); // Attach the file blob
          formData.append('enclosure_id', new_enclosureId); // Add enclosure_id
          formData.append('userId', new_userId); // Add userId

          // Upload the file to the target server
          const uploadResponse = await axios.post(`${targetLink}/api/files/upload`, formData, {
            headers: {
              Authorization: targetToken,
              'Content-Type': 'multipart/form-data' // Ensure correct content type for file upload
            }
          });
          console.log(`File synchronized ${direction}:`, uploadResponse.data);
        } catch (error) {
          console.error(`Error uploading file ${direction}:`, error.response ? error.response.data : error.message);
        }
      }
    } catch (error) {
      console.error(`Error fetching files ${direction}:`, error.response ? error.response.data : error.message);
    }
  }

  // Synchronize projects
  for (const offProject of offProjects) {
    const matchingOnlineProject = onProjects.find(onProject => compareDateTimes(onProject.created_at, offProject.created_at) === 0);

    if (matchingOnlineProject) {
      // Compare updated_at timestamps
      if (compareDateTimes(offProject.updated_at, matchingOnlineProject.updated_at) > 0) {
        console.log("Offline project is newer than online project. Updating online project...");
        await updateProject(`http://147.93.118.209:5000/api/project/${matchingOnlineProject.id}`, offProject, online_token, "online");
        await syncFiles(offProject.id, matchingOnlineProject.id, offline_userId, online_userId, 'http://localhost:3000', 'http://147.93.118.209:5000', offline_token, online_token, "to online");
      } else if (compareDateTimes(offProject.updated_at, matchingOnlineProject.updated_at) < 0) {
        console.log("Online project is newer than offline project. Updating offline project...");
        await updateProject(`http://localhost:3000/api/project/${offProject.id}`, matchingOnlineProject, offline_token, "offline");
        await syncFiles(matchingOnlineProject.id, offProject.id, online_userId, offline_userId, 'http://147.93.118.209:5000', 'http://localhost:3000', online_token, offline_token, "to offline");
      }
    } else {
      // Offline project does not exist online, create it online
      try {
        const createResponse = await axios.post(`http://147.93.118.209:5000/api/project/create`, offProject, {
          headers: { Authorization: online_token }
        });
        console.log("Created project online:", createResponse.data);
        await syncFiles(offProject.id, createResponse.data.id, offline_userId, online_userId, 'http://localhost:3000', 'http://147.93.118.209:5000', offline_token, online_token, "to online");
      } catch (error) {
        console.error("Error creating project online:", error.response ? error.response.data : error.message);
      }
    }
  }

  for (const onProject of onProjects) {
    const matchingOfflineProject = offProjects.find(offProject => compareDateTimes(onProject.created_at, offProject.created_at) === 0);

    if (!matchingOfflineProject) {
      // Online project does not exist offline, create it offline
      try {
        const createResponse = await axios.post(`http://localhost:3000/api/project/create`, onProject, {
          headers: { Authorization: offline_token }
        });
        console.log("Created project offline:", createResponse.data);
        await syncFiles(onProject.id, createResponse.data.id, online_userId, offline_userId, 'http://147.93.118.209:5000', 'http://localhost:3000', online_token, offline_token, "to offline");
      } catch (error) {
        console.error("Error creating project offline:", error.response ? error.response.data : error.message);
      }
    }
  }

  // Reload the page after synchronization
  window.location.reload();
}
