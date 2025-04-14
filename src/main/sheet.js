const axios = require("axios");
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const openSidebar = document.getElementById('openSidebar');
const imageButtonsContainer = document.getElementById('imageButtonsContainer');
const createCableBtn = document.getElementById('createCable');
const autoSave = 60; // Autosaving per 3000s
let flg_connection = false;
let flg_status = false;

function formatDateToYYMMDDHHMMSS(date) {
    const pad = (num) => num.toString().padStart(2, '0');
    return `${date.getFullYear().toString().slice(-2)}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

let sheet = {
    "title": "",
    "company": "",
    "file_src": "",
    "date" : "",
    "tech"  : "",
    "location_id" : "",
    "enclosure_id" : "",
    "enclosure_type" : "",
    "road_name" : "",
    "lat_long" : "",
    "notes" : "",
    "tableCount" : 0,
    "table" : [],
    "created_at": "", // Ensure created_at remains constant
    "updated_at": ""  // Format updated_at
}
let selectedImage = null;
let elementSelected = null;
let colorOrder = ["BLUE", "ORANGE", "GREEN", "BROWN", "SLATE","WHITE", "RED", "BLACK", "YELLOW", "VIOLET", "ROSE", "AQUA" ]
let file_src = "";
let selectTable = 
[
    {
        "name": "432CT-36BT-12FPBT",
        "total_counts": 432,
        "count_per_tube": 12
    },
    {
        "name": "288CT-24BT-12FPBT",
        "total_counts": 288,
        "count_per_tube": 12
    },
    {
        "name": "144CT-12BT-12FPBT",
        "total_counts": 144,
        "count_per_tube": 12
    },
    {
        "name": "096CT-08BT-12FPBT",
        "total_counts": 96,
        "count_per_tube": 12
    },
    {
        "name": "072CT-06BT-12FPBT",
        "total_counts": 72,
        "count_per_tube": 12
    },
    {
        "name": "060CT-05BT-12FPBT",
        "total_counts": 60,
        "count_per_tube": 12
    },
    {
        "name": "048CT-04BT-12FPBT",
        "total_counts": 48,
        "count_per_tube": 12
    },
    {
        "name": "036CT-03BT-12FPBT",
        "total_counts": 36,
        "count_per_tube": 12
    },
    {
        "name": "024CT-02BT-12FPBT",
        "total_counts": 24,
        "count_per_tube": 12
    },
    {
        "name": "024CT-04BT-06FPBT",
        "total_counts": 24,
        "count_per_tube": 6
    },
    {
        "name": "012CT-01BT-12FPBT",
        "total_counts": 12,
        "count_per_tube": 12
    },
    {
        "name": "006CT-01BT-06FPBT",
        "total_counts": 6,
        "count_per_tube": 6
    },
    {
        "name": "002CT-01BT-02FPBT",
        "total_counts": 2,
        "count_per_tube": 2
    },
    {
        "name": "001CT-01BT-01FPBT",
        "total_counts": 1,
        "count_per_tube": 1
    }
]
const fileUpload = document.getElementById('fileUpload');
const fileList = document.getElementById('fileList');
const enclosureIdInput = document.getElementById('enclosure_id'); // Assuming enclosure_id input exists
const userId = localStorage.getItem("userId"); // Get userId from localStorage

fileUpload.addEventListener('change', async () => {
    const file = fileUpload.files[0]; // Get the first file
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) { // 10 MB size limit
        showCustomAlert('File size exceeds 10 MB.');
        return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
        console.error("No token found! Please log in.");
        return;
    }
    const related_enclosure_id = localStorage.getItem("projectId");
    const formData = new FormData();
    formData.append('file', file);
    formData.append('enclosure_id', related_enclosure_id); // Add enclosure_id
    formData.append('userId', userId); // Add userId

    try {
        const response = await axios.post(`${localStorage.getItem("Backend_Link")}/api/files/upload`, formData, {
            headers: { Authorization: token, 'Content-Type': 'multipart/form-data' }
        });

        const result = response.data; // Axios automatically parses JSON responses
        console.log("result", result);
        console.log("file", file);
        const listItem = document.createElement('li');
        listItem.setAttribute('data-id', result.fileId || file.id); // Add data attribute for file name
        listItem.innerHTML = `
            <div class="flex justify-between space-x-2">
                <span>${file.name}</span>
                <div >
                <button class="p-2 bg-gray-100 text-gray-400 rounded-lg hover:bg-gray-300 focus:outline-none" onclick="downloadFile('${result.fileId}', '${result.fileName || file.name}')">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 3v12M12 15l-4-4 4-4M19 15h-2v4a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-4H5"></path>
                    </svg>
                </button>
                <button class="p-2 bg-gray-100 text-gray-400 rounded-lg hover:bg-gray-300 focus:outline-none" onclick="deleteFile('${result.fileId}')">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6m5 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1-2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                </button>
                </div>
            </div>
        `;
        fileList.appendChild(listItem);
        showCustomAlert('File uploaded successfully.');
    } catch (error) {
        console.error('Error uploading file:', error);
        showCustomAlert('An error occurred while uploading the file.');
    }

    fileUpload.value = ''; // Reset the input
});
//============================= Functions ====================================//

function showCable(){
    console.log("Showing tables...");
    document.getElementById("table_add").innerHTML = "";
    console.log("sheet.tableCount", sheet.tableCount);
    if (sheet.tableCount > 0) {
        console.log("Displaying...", sheet);
        sheet.table.forEach((cable, index) => {
            let addtext =`
            <div class="bg-gray-200 px-16 py-10 my-16 shadow-md rounded-md" data-cable="${cable.id}">
                <div class="absolute" style = "right: 113px; margin-top:-24px; gap: 10px; display: flex;">
                <button class="p-2 bg-gray-100 text-gray-400 rounded-full hover:bg-gray-300 focus:outline-none w-[80%]" onclick="toggleEditCable(this)">
                    <span class="grayscale filter grayscale-[100%]" style="width: 20px; height: 20px;">✏️</span>
                </button>
                <button class="p-2 bg-gray-100 text-gray-400 rounded-full hover:bg-gray-300 focus:outline-none w-[80%]" onclick="deletecable(this)">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6m5 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1-2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                    </button>
                </div>
                <div class="flex gap-[32px]">
                    <div class="flex items-center gap-2 py-4 w-full md:w-[20%]">
                        <label class="font-bold uppercase text-gray-800 whitespace-nowrap">Cable #:</label>
                        <input type="text" class="border-b border-gray-400 bg-gray-200 focus:outline-none focus:border-black text-center w-full text-gray-500" id="cable_id" value="${cable.cable_id ?? ''}" readonly="true"/>
                    </div>
                    <div class="flex items-center gap-2 py-4 w-full md:w-[30%]">
                        <label class="font-bold uppercase text-gray-800 whitespace-nowrap">Cable Color id:</label>
                        <input type="text" class="border-b border-gray-400 bg-gray-200 focus:outline-none focus:border-black text-center w-full text-gray-500" id="cable_color_id" value="${cable.cable_color_id ?? ''}" readonly="true">
                    </div>
                    <div class="flex items-center gap-2 py-4 w-full md:w-[30%]">
                        <label class="font-bold uppercase text-gray-800 whitespace-nowrap">Total Fiber Count:</label>
                        <input type="text" class="border-b border-gray-400 bg-gray-200 focus:outline-none focus:border-black text-center w-full text-gray-500" id="total_fiber_count" value="${cable.total_fiber_count ?? ''}" readonly="true">
                    </div>
                    <div class="flex items-center gap-2 py-4 w-full md:w-[20%]">
                        <label class="font-bold uppercase text-gray-800 whitespace-nowrap">Cable Footage:</label>
                        <input type="text" class="border-b border-gray-400 bg-gray-200 focus:outline-none focus:border-black text-center w-full text-gray-500" id="cable_footage" value="${cable.cable_footage ?? ''}" readonly="true">
                    </div>
                </div>
                <div class="flex gap-[32px]">
                    <div class="flex items-center gap-2 py-4 w-full md:w-[50%]">
                        <label class="font-bold uppercase text-gray-800 whitespace-nowrap">Cable Type:</label>
                        <input type="text" class="border-b border-gray-400 bg-gray-200 focus:outline-none focus:border-black text-center w-full text-gray-500" id="cable_type" value="${cable.cable_type ?? ''}" readonly="true">
                    </div>
                    <div class="flex items-center gap-2 py-4 w-full md:w-1/4">
                        <label class="font-bold uppercase text-gray-800 whitespace-nowrap">Direction:</label>
                        <input type="text" class="border-b border-gray-400 bg-gray-200 focus:outline-none focus:border-black text-center w-full text-gray-500" id="direction" value ="${cable.direction ?? ''}" readonly="true">
                    </div>
                    <div class="flex items-center gap-2 py-4 w-full md:w-1/4">
                        <label class="font-bold uppercase text-gray-800 whitespace-nowrap">USE:</label>
                        <input type="text" class="border-b border-gray-400 bg-gray-200 focus:outline-none focus:border-black text-center w-full text-gray-500" id="use" value="${cable.use ?? ''}" readonly="true">
                    </div>
                </div>
                <div class="flex items-center gap-2 py-4 w-full">
                    <label class="font-bold uppercase text-gray-800 whitespace-nowrap mr-3">Notes:</label>
                    <input type="text" class="border-b border-gray-400 bg-gray-200 focus:outline-none focus:border-black text-center w-full text-gray-500 item-center" id="notes" value = "${cable.notes ?? ''}" readonly="true">
                </div>
            </div>
            <div class="border border-black-600 rounded-lg overflow-hidden">
                <table class="min-w-full table-auto border border-2 border-gray-500" data-table="${cable.id ?? ''}">
                    <thead>
                        <tr class="border-b-3 border-gray-500">
                            <th class="px-4 py-2 text-center text-gray-100 font-semibold w-[5%] border-r border-gray-500 bg-gray-600 border-b">F #</th>
                            <th class="px-4 py-2 text-center text-gray-100 font-semibold w-[10%] border-r border-gray-500 bg-gray-600 border-b">F-COLOR</th>
                            <th class="px-4 py-2 text-center text-gray-100 font-semibold w-[5%] border-r border-gray-500 bg-gray-600 border-b">BT #</th>
                            <th class="px-4 py-2 text-center text-gray-100 font-semibold w-[10%] border-r border-gray-500 bg-gray-600 border-b">BT-COLOR</th>
                            <th class="px-4 py-2 text-center text-gray-100 font-semibold border-r border-gray-500 bg-gray-600 border-b">NOTES</th>
                            <th class="px-4 py-2 text-center text-gray-100 font-semibold w-[20%] border-gray-500 bg-gray-600 border-b">CONNECTION</th>
                        </tr>
                    </thead>
                    <tbody>
                     `
                let lastElement = sheet.table[index].connection[sheet.table[index].connection.length - 1];
                total_counts = lastElement.fiber_id;
                count_per_tube = lastElement.fiber_id / lastElement.buffer_tube_id;
                sheet.table[index].connection.forEach((fiber, index2)=>{
                    const F_COLOR = colorOrder[(index2)%count_per_tube];
                    const BT_NUM = fiber.buffer_tube_id;
                    const BT_COLOR = colorOrder[(BT_NUM - 1) % count_per_tube];
                    let BT_COLOR_ADD_TEXT = ""; // Changed from const to let
                    if(index2 >= 288) BT_COLOR_ADD_TEXT = "-DT";
                    else if(index2 >= 144) BT_COLOR_ADD_TEXT = "-ST";
                    addtext += `
                    <tr class="border border-gray-400">
                        <td class="px-4 pt-1 text-center text-gray-600 border-r border-gray-400">${index2+1}</td>
                        <td class="px-4 pt-1 text-center color-box font-semibold border-r border-gray-400">${F_COLOR}<div class="underline ${F_COLOR} bg-opacity-50 rounded-sm"></div></td>
                        <td class="px-4 pt-1 text-center text-gray-600 border-r border-gray-400">${BT_NUM}</td>
                        <td class="px-4 pt-1 text-center color-box font-semibold border-r border-gray-400">${BT_COLOR}${BT_COLOR_ADD_TEXT}<div class="underline ${BT_COLOR} bg-opacity-50 rounded-sm"></div></td>
                            <td class="px-4 pt-1 text-center text-gray-600 border-r border-gray-400">
                            <input 
                                type="text" 
                                class="w-full px-4 pt-1 text-center text-gray-600 bg-transparent border-none outline-none" 
                                oninput="handleInputFiberNote(event, ${index}, ${index2})" 
                                value="${sheet.table[index].connection[index2].notes}"/>
                        </td>
                        <td class="clickable text-center cursor-pointer px-4 pt-1 text-gray-600 border-r border-gray-400" data-fiber = "${index2}" data-content="B${BT_NUM}F${index2 + 1}" value="">${sheet.table[index].connection[index2].connection}</td>
                    </tr>           
                `;
                })
            document.getElementById("table_add").innerHTML += addtext;
        });
    }
    console.log("Tables was created.");
}

function openModal(id) {
    document.getElementById('deleteModal').dataset.cableId = id;
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
    const cableId = document.getElementById('deleteModal').dataset.cableId;
    deleteCableById(cableId);
});
function getConnectionInfo(str){
    const lastCIndex = str.lastIndexOf('C');
    const subStr = str.slice(lastCIndex); 

    const numbers = subStr.match(/\d+/g)?.map(Number) || [];
    return numbers;
}

function deleteMatchingCells(connection) {
    if (connection) {
        console.log("Deleting matching cells...", connection);
        const matchingInfo = getConnectionInfo(connection);
        const matchingCable = sheet.table.find(cable => cable.cable_id == matchingInfo[0]);
        if (matchingCable && matchingCable.connection[matchingInfo[2] - 1]) {
            matchingCable.connection[matchingInfo[2] - 1].connection = "";
            matchingCable.connection[matchingInfo[2] - 1].notes = "";
        }
        console.log("Deleting", connection);
    }
}

function deleteConnectionById(cableId) {
    console.log("delete connection");
    const cable = sheet.table.find(cable => cable.id == cableId);
    if (cable) {
        cable.connection.forEach(conn => {
            deleteMatchingCells(conn.connection);
            conn.connection = "";
            conn.notes = "";
        });
    }
}

function deleteCableById(cableId) {
    updateSheet();
    deleteConnectionById(cableId);
    sheet.tableCount -= 1;
    sheet.table = sheet.table.filter(cable => cable.id != cableId);
    console.log("Sheet after deleting... ", sheet);
    showCable();
    closeModal();
}

function deletecable(event) {
    console.log("Delete Cable");
    const contentDiv = event.closest('div')?.parentElement;
    if (!contentDiv) {
        console.error("Content div not found.");
        return;
    }
    const cable_num = contentDiv.getAttribute("data-cable");
    openModal(cable_num);
}

async function getProjectById(id) {
    const token = localStorage.getItem("token");
    if (!token) {
        console.error("No token found! Please log in.");
        return null;
    }
    try {
        const response = await axios.get(`${localStorage.getItem("Backend_Link")}/api/project/${id}`, {
            headers: { Authorization: token }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching project data:", error.response ? error.response.data : error.message);
        return null;
    }
}
async function getProjectByEnclosureId(id) {
    const token = localStorage.getItem("token");
    if (!token) {
        console.error("No token found! Please log in.");
        return null;
    }
    
    const formData = {
        userId: localStorage.getItem("userId"), 
        enclosure_id: id, // Ensure `sheet.enclosure_id` is defined
        created_at: sheet.created_at, // Include created_at
        updated_at: sheet.updated_at  // Include updated_at
    };
    try {
        const response = await axios.post(`${localStorage.getItem("Backend_Link")}/api/files/getnames`, formData, {
            headers: { Authorization: token, 'Content-Type': 'application/json' }
        });
        const result = response.data;
        return result.files;
    } catch (error) {
        console.error('Error fetching file names:', error.response ? error.response.data : error.message);
    }
}

function updateFormFields(){
    console.log("Updating Enclosure information...");
    const fieldMapping = {
        title:"enclosureTitle",
        company: "company",
        tech: "tech",
        location_id: "location_id",
        enclosure_id: "enclosure_id",
        date: "date",
        enclosure_type: "enclosure_type",
        road_name: "road_name",
        lat_long: "lat_long",
        notes: "notes",
    };
    console.log("Sheet", sheet);
    Object.keys(fieldMapping).forEach((key) => {
        const element = document.getElementById(fieldMapping[key]);
        if (element && sheet[key]) {
            if(key === "title" ){
                document.getElementById(fieldMapping[key]).innerHTML = sheet.title;
            }else{
                document.getElementById(fieldMapping[key]).value = sheet[key];
            }                                                       
        }
    });
    console.log("Enclosure information is newly Updated");
    showCable();
}

function createNavbar(){
    console.log("Creating Navbar...");
    for (let i = 0; i < 14; i++) {
        let btn = document.createElement('button');
        btn.className = 'w-full grid items-center justify-center border-b transition duration-200 ';
        btn.setAttribute('data-id', `img-${i}`);
        btn.setAttribute('data-title', `Image ${i}`);
        btn.innerHTML = `<div class="flex justify-center text-center mb-3 mt-3"><div class="p-6 pb-0 pt-2"><img src="../src/assets/images/background2.jpg" alt="Button ${i}" class=""></div></div>`;
        btn.innerHTML += `<div class="mt-1 mb-1 text-sm font-large text-black text-center">${selectTable[i].name}<div>`
        btn.addEventListener('click', () => {
            document.querySelectorAll('#imageButtonsContainer button').forEach(b => {
                b.classList.remove('bg-gray-500');
            });
            btn.classList.add('bg-gray-500');
            selectedImage = {
                id: btn.getAttribute('data-id'),
                title: btn.getAttribute('data-title')
            };
        });
        imageButtonsContainer.appendChild(btn);
    }
    console.log("Navbar created");
}

function maxCableId() {
    // This function get the id of new cable.
    if (sheet.table.length === 0) {
        return 0;
    }
    let max_id = 0;
    sheet.table.forEach(tb => {
        if (max_id < tb.cable_id) {
            max_id = tb.cable_id;
        }
    });
    console.log("max_id", max_id);
    return max_id;
}

async function downloadFile(fileId, fileName) {
    const token = localStorage.getItem("token");
    if (!token) {
        console.error("No token found! Please log in.");
        return;
    }

    try {
        console.log("Download", fileId, fileName);
        const response = await axios.get(`${localStorage.getItem("Backend_Link")}/api/files/download/${fileId}`, {
            headers: { Authorization: token },
            responseType: 'blob' // Ensure the response is treated as a file
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName); // Use the correct fileName
        document.body.appendChild(link);
        link.click();
        link.remove();
    } catch (error) {
        console.error('Error downloading file:', error.response ? error.response.data : error.message);
        showCustomAlert('An error occurred while downloading the file.');
    }
}

async function deleteFile(fileId) {
    const token = localStorage.getItem("token");
    if (!token) {
        console.error("No token found! Please log in.");
        return;
    }

    try {
        await axios.delete(`${localStorage.getItem("Backend_Link")}/api/files/delete/${fileId}`, {
            headers: { Authorization: token }
        });

        // Remove the file from the DOM
        const fileItem = document.querySelector(`li[data-id="${fileId}"]`);
        if (fileItem) {
            fileItem.remove();
        }

        showCustomAlert('File deleted successfully.');
    } catch (error) {
        console.error('Error deleting file:', error.response ? error.response.data : error.message);
        showCustomAlert('An error occurred while deleting the file.');
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    const titleText = document.getElementById("enclosureTitle");
    const titleInput = document.getElementById("titleInput");
    const editTitleBtn = document.getElementById("editTitleBtn");
    const id = localStorage.getItem("projectId");
    if (!id) {
        console.error("No projectId found in localStorage.");
        return;
    }
    const toggleTitleEdit = () => {
        if (titleText.classList.contains("hidden")) {
            titleText.textContent = titleInput.value;
            titleText.classList.remove("hidden");
            titleInput.classList.add("hidden");
        } else {
            titleInput.value = titleText.textContent;
            titleText.classList.add("hidden");
            titleInput.classList.remove("hidden");
            titleInput.focus();
        }
    };

    const handleTitleInputKeyPress = (event) => {
        if (event.key === "Enter") {
            titleText.textContent = titleInput.value;
            titleText.classList.remove("hidden");
            titleInput.classList.add("hidden");
        }
    };

    editTitleBtn.addEventListener("click", toggleTitleEdit);
    titleInput.addEventListener("keypress", handleTitleInputKeyPress);

    createNavbar();

    setTimeout(() => {
        saveSheet();
        setInterval(saveSheet, autoSave * 1000);
    }, autoSave * 1000); // Start running saveSheet after autoSave * 1000 ms and then continuously every autoSave * 1000 ms
    try {
        const enclosureInfo = await getProjectById(id);
        if (enclosureInfo && Object.keys(enclosureInfo).length > 0) {
            const file_src = enclosureInfo.project.file_src;
            sheet = loadSheet(file_src);
            console.log("Sheet newly updated is ", sheet);
            updateFormFields();
        } else {
            console.error("No valid enclosure info found.");
        }
    } catch (error) {
        console.error("Error fetching project data:", error);
    }
    const files = await getProjectByEnclosureId(id); // Ensure this is awaited
    const attach_files = document.getElementById("fileList");
    if (files && Array.isArray(files)) {
        files.forEach(file => {
            console.log("File", file);
            const listItem = document.createElement("li");
            listItem.setAttribute("data-id", file.id);
            listItem.innerHTML = `
                <div class="flex justify-between space-x-2">
                <span>${file.name}</span>
                <div >
                <button class="p-2 bg-gray-100 text-gray-400 rounded-lg hover:bg-gray-300 focus:outline-none" onclick="downloadFile('${file.id}', '${file.name}')">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 3v12M12 15l-4-4 4-4M19 15h-2v4a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-4H5"></path>
                    </svg>
                </button>
                <button class="p-2 bg-gray-100 text-gray-400 rounded-lg hover:bg-gray-300 focus:outline-none" onclick="deleteFile('${file.id}')">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6m5 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1-2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                </button>
                </div>
            </div>

            `;
            attach_files.appendChild(listItem);
        });
    } else {
        console.error("No files found or files is not an array.");
    }
});

createCableBtn.addEventListener('click', () => {
    console.log("Before Creating Sheet", sheet);
    if (selectedImage) {
        img_id = selectedImage.id.split("-")[1];

        let addtext ="";
        sheet.table.push({
            "id": Array.isArray(sheet.table) && sheet.table.length > 0 ? sheet.table.at(-1).id + 1 : 0,
            "cable_id": maxCableId() + 1,
            "cable_color_id": "",
            "total_fiber_count": "",
            "cable_footage": "",
            "cable_type": "",
            "direction": "",
            "use": "",
            "notes": "",
            "connection": []
        });
        sheet.tableCount += 1;
        addtext +=`
            <div class="bg-gray-200 px-16 py-10 my-16 shadow-md rounded-md" data-cable="${sheet.table.at(-1).id}">
                <div class="absolute" style = "right: 113px; margin-top:-24px; gap: 10px; display: flex;">
                    <button class="p-2 bg-gray-100 text-gray-400 rounded-full hover:bg-gray-300 focus:outline-none w-[80%]" onclick="toggleEditCable(this)">
                        <span class="grayscale filter grayscale-[100%]" style="width: 20px; height: 20px;">✏️</span>
                    </button>
                    <button class="p-2 bg-gray-100 text-gray-400 rounded-full hover:bg-gray-300 focus:outline-none w-[80%]" onclick="deletecable(this)">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6m5 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1-2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                    </button>
                </div>
                <div class="flex gap-[32px]">
                    <div class="flex items-center gap-2 py-4 w-full md:w-[20%]">
                        <label class="font-bold uppercase text-gray-800 whitespace-nowrap">Cable #:</label>
                        <input type="text" class="border-b border-gray-400 bg-gray-200 focus:outline-none focus:border-black text-center w-full text-gray-500" id="cable_id" value="${sheet.table.at(-1).cable_id}" readonly="true"/>
                    </div>
                    <div class="flex items-center gap-2 py-4 w-full md:w-[30%]">
                        <label class="font-bold uppercase text-gray-800 whitespace-nowrap">Cable Color id:</label>
                        <input type="text" class="border-b border-gray-400 bg-gray-200 focus:outline-none focus:border-black text-center w-full text-gray-500" id="cable_color_id" readonly="true"/>
                    </div>
                    <div class="flex items-center gap-2 py-4 w-full md:w-[30%]">
                        <label class="font-bold uppercase text-gray-800 whitespace-nowrap">Total Fiber Count:</label>
                        <input type="text" class="border-b border-gray-400 bg-gray-200 focus:outline-none focus:border-black text-center w-full text-gray-500" id="total_fiber_count" readonly="true"/>
                    </div>
                    <div class="flex items-center gap-2 py-4 w-full md:w-[20%]">
                        <label class="font-bold uppercase text-gray-800 whitespace-nowrap">Cable Footage:</label>
                        <input type="text" class="border-b border-gray-400 bg-gray-200 focus:outline-none focus:border-black text-center w-full text-gray-500" id="cable_footage" readonly="true"/>
                    </div>
                </div>
                <div class="flex gap-[32px]">
                    <div class="flex items-center gap-2 py-4 w-full md:w-[50%]">
                        <label class="font-bold uppercase text-gray-800 whitespace-nowrap">Cable Type:</label>
                        <input type="text" class="border-b border-gray-400 bg-gray-200 focus:outline-none focus:border-black text-center w-full text-gray-500" id="cable_type" readonly="true"/>
                    </div>
                    <div class="flex items-center gap-2 py-4 w-full md:w-1/4">
                        <label class="font-bold uppercase text-gray-800 whitespace-nowrap">Direction:</label>
                        <input type="text" class="border-b border-gray-400 bg-gray-200 focus:outline-none focus:border-black text-center w-full text-gray-500" id="direction" readonly="true"/>
                    </div>
                    <div class="flex items-center gap-2 py-4 w-full md:w-1/4">
                        <label class="font-bold uppercase text-gray-800 whitespace-nowrap">USE:</label>
                        <input type="text" class="border-b border-gray-400 bg-gray-200 focus:outline-none focus:border-black text-center w-full text-gray-500" id="use" readonly="true"/>
                    </div>
                </div>
                <div class="flex items-center gap-2 py-4 w-full">
                    <label class="font-bold uppercase text-gray-800 whitespace-nowrap mr-3">Notes:</label>
                    <input type="text" class="border-b border-gray-400 bg-gray-200 focus:outline-none focus:border-black text-center w-full text-gray-500 item-center" id="notes" readonly="true"/>
                </div>
            </div>
            <div class="border border-black-600 rounded-lg overflow-hidden">
                <table class="min-w-full table-auto border border-2 border-gray-500" data-table="${sheet.table.at(-1).id}">
                    <thead>
                        <tr class="border-b-3 border-gray-500">
                            <th class="px-4 py-2 text-center text-gray-100 font-semibold w-[5%] border-r border-gray-500 bg-gray-600 border-b">F #</th>
                            <th class="px-4 py-2 text-center text-gray-100 font-semibold w-[10%] border-r border-gray-500 bg-gray-600 border-b">F-COLOR</th>
                            <th class="px-4 py-2 text-center text-gray-100 font-semibold w-[5%] border-r border-gray-500 bg-gray-600 border-b">BT #</th>
                            <th class="px-4 py-2 text-center text-gray-100 font-semibold w-[10%] border-r border-gray-500 bg-gray-600 border-b">BT-COLOR</th>
                            <th class="px-4 py-2 text-center text-gray-100 font-semibold border-r border-gray-500 bg-gray-600 border-b">NOTES</th>
                            <th class="px-4 py-2 text-center text-gray-100 font-semibold w-[20%] border-gray-500 bg-gray-600 border-b">CONNECTION</th>
                        </tr>
                    </thead>
                    <tbody>
                    `
            for (let i = 0; i < selectTable[img_id].total_counts; i++) {
                const F_COLOR = colorOrder[i % selectTable[img_id].count_per_tube];
                const BT_NUM = Math.floor(i / selectTable[img_id].count_per_tube);
                const BT_COLOR = colorOrder[BT_NUM % selectTable[img_id].count_per_tube];
                let BT_COLOR_ADD_TEXT = ""; // Changed from const to let
                if(i >= 288) BT_COLOR_ADD_TEXT = "-DT";
                else if(i >= 144) BT_COLOR_ADD_TEXT = "-ST";
                addtext += `
                    <tr class="border border-gray-400">
                        <td class="px-4 pt-1 text-center text-gray-600 border-r border-gray-400">${i + 1}</td>
                        <td class="px-4 pt-1 text-center color-box font-semibold  border-r border-gray-400">${F_COLOR}<div class="underline ${F_COLOR} bg-opacity-50 rounded-sm"></div></td>
                        <td class="px-4 pt-1 text-center text-gray-600 border-r border-gray-400" >${BT_NUM + 1}</td>
                        <td class="px-4 pt-1 text-center color-box font-semibold  border-r border-gray-400">${BT_COLOR}${BT_COLOR_ADD_TEXT}<div class="underline ${BT_COLOR} bg-opacity-50 rounded-sm"></div></td>
                         <td class="px-4 pt-1 text-center text-gray-600 border-r border-gray-400">
                            <input 
                                type="text" 
                                class="w-full px-4 pt-1 text-center text-gray-600 bg-transparent border-none outline-none" 
                                oninput="handleInputFiberNote(event, ${sheet.table.at(-1).id}, ${i})" 
                                value=""/>
                        </td>
                        <td class="clickable text-center cursor-pointer px-4 pt-1 text-gray-600 border-r border-gray-400" data-fiber = "${i}" data-content="B${BT_NUM + 1}F${i + 1}"></td>
                    </tr>
                `;
            
                sheet.table.at(-1).connection.push({
                    "fiber_id": i + 1,
                    "buffer_tube_id": BT_NUM + 1,
                    "notes": "",
                    "connection": ""
                });
            }
            addtext += `</tbody>
                </table>
                </div>`
        console.log("After Creating Sheet", sheet);
        console.log("addtext", addtext);
        document.getElementById("table_add").insertAdjacentHTML('beforeend', addtext);
        setClickableElements()
    } else {
        showCustomAlert("Please select an image first!");
    }
});

function handleInputFiberNote(event, tableIndex, fiberIndex) {
    sheet.table[tableIndex].connection[fiberIndex].notes = event.target.value;
}



function toggleConnection() {
    const btn = document.getElementById("toggleConnection");
    const circle = document.getElementById("grayConnection");
    
    if (flg_connection) {
        // Turn off connection (Red for off)
        flg_connection = false;
        btn.classList.replace("bg-green-500", "bg-red-500");
        // circle.classList.replace("bg-green-500", "bg-white");
        circle.classList.replace("translate-x-6", "translate-x-0");
    } else {
        // Turn on connection (Green for on)
        flg_connection = true;
        if (flg_status) {
            toggleStatus();
        }
        btn.classList.replace("bg-red-500", "bg-green-500");
        // circle.classList.replace("bg-white", "bg-green-500");
        circle.classList.replace("translate-x-0", "translate-x-6");
    }
    setClickableElements();
}

function toggleStatus() {
    const btn = document.getElementById("toggleStatus");
    const circle = document.getElementById("grayStatus");

    if (flg_status) {
        flg_status = false;
        document.querySelectorAll("td").forEach(td => {
            if (td.classList.contains("bg-yellow-300")) {
                td.classList.remove("bg-yellow-300");
            }
        });
        btn.classList.replace("bg-green-500", "bg-red-500");
        circle.classList.replace("translate-x-6", "translate-x-0");
    } else {
        flg_status = true;
        if (flg_connection) {
            toggleConnection();
        }
        btn.classList.replace("bg-red-500", "bg-green-500");
        circle.classList.replace("translate-x-0", "translate-x-6");
    }

    setClickableElements();
}
function setClickableElements() {
    if(flg_connection || flg_status) {
        document.querySelectorAll(".non-clickable.cursor-default").forEach(el => {
            el.classList.remove("non-clickable");
            el.classList.remove("cursor-default");
            el.classList.add("clickable");
            el.classList.add("cursor-pointer");
        });
    }
    else {
        document.querySelectorAll(".clickable.cursor-pointer").forEach(el => {
            el.classList.remove("clickable");
            el.classList.remove("cursor-pointer");
            el.classList.add("non-clickable");
            el.classList.add("cursor-default");
        });
    }
}
function createTableRows(tableId) {
    const table = document.getElementById(tableId).getElementsByTagName('tbody')[0];
    for (let i = 0; i < 24; i++) {
        let row = table.insertRow();
        for (let j = 0; j < 6; j++) {
            let cell = row.insertCell();
            if (j !== 5) {
                cell.textContent = `(${i + 1},${j + 1})`;
            }
            if (j === 5) {
                cell.classList.add('clickable.cursor-pointer');
            }
        }
    }
}

function deleteCellContent(table_id, rowNum, colNum) {
    var table = document.getAttribute(table_id);
    var cell = table.rows[rowNum].cells[colNum];
    cell.innerHTML = '';
}
function extractStandaloneNumbers(str) {
    let matches = str.match(/\d+[A-Z]/g);

    return matches ? matches.map(match => parseInt(match.match(/\d+/)[0])) : [];
}
function findKeyWithValue(obj, value) {
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            if (typeof obj[key] === 'object' && obj[key] !== null) {
                const result = findKeyWithValue(obj[key], value);
                if (result) {
                    return `${key}.${result}`;
                }
            } else if (obj[key] === value) {
                return key;
            }
        }
    }
    return null;
}

document.addEventListener("click", function (event) {
    if (flg_connection) {
        const cell = event.target.closest(".clickable.cursor-pointer");
        if (!cell || cell === elementSelected) return;
        else {
            if (!elementSelected) {
                document.querySelectorAll(".selected").forEach(c => c.classList.remove("selected"));
                cell.classList.add("selected");
                elementSelected = cell;
            } else {
                const table1 = cell.closest("table");
                const cableId1 = table1.parentElement.previousElementSibling ? parseInt(table1.parentElement.previousElementSibling.querySelector("#cable_id").value) : null;
                const table2 = elementSelected.closest("table");
                const cableId2 = table2.parentElement.previousElementSibling ? parseInt(table2.parentElement.previousElementSibling.querySelector("#cable_id").value) : null;
                elementSelected.classList.remove("selected");
                const connection1 = `${sheet.location_id}${sheet.enclosure_id}C${cableId2}${elementSelected.getAttribute("data-content")}`;
                const connection2 = `${sheet.location_id}${sheet.enclosure_id}C${cableId1}${cell.getAttribute("data-content")}`;
                
                document.querySelectorAll("td").forEach(td => {
                    if (td.textContent.trim() === connection1 || td.textContent.trim() === connection2) {
                        const table_id = parseInt(td.closest("table").parentElement.previousElementSibling.querySelector("#cable_id").value);
                        const rowNum = td.closest("tr").rowIndex - 1;
                        if (sheet.table[table_id] && sheet.table[table_id].connection[rowNum]) {
                            sheet.table[table_id].connection[rowNum].connection = "";
                        }
                        td.textContent = "";
                    }
                });
                // sheet.table[tableData1].connection[cell.closest("tr").rowIndex - 1].connection = connection1;
                cell.textContent = connection1;
                // sheet.table[tableData2].connection[elementSelected.closest("tr").rowIndex - 1].connection = connection2;
                elementSelected.textContent = connection2;
                elementSelected = null;
            }
        }
    }
    if (flg_status) {
        const cell = event.target.closest(".clickable.cursor-pointer");
        if (!cell) return;
        document.querySelectorAll("td").forEach(td => {
            if (td.classList.contains("bg-yellow-300")) {
                td.classList.remove("bg-yellow-300");
            }
        });
        cell.classList.add("bg-yellow-300");
        const table = cell.closest("table");
        const tableData = table ? parseInt(table.parentElement.previousElementSibling.querySelector("#cable_id").value) : null;
        const matchingCells = Array.from(document.querySelectorAll("td")).filter(td => 
            td.textContent.trim().endsWith(`C${tableData}${cell.getAttribute("data-content")}`)
        );
        matchingCells.forEach(td => {
            td.classList.add("bg-yellow-300");
        });
    }
});

document.addEventListener("keydown", function(event) {
    if (event.key === "Delete" && flg_status) {
        const highlightedCells = document.querySelectorAll(".bg-yellow-300");
        highlightedCells.forEach(cell => {
            const connection = cell.textContent.trim();
            cell.textContent = "";
            cell.classList.remove("bg-yellow-300");
        });
        updateSheet();
        console.log(sheet);
    }
});

function toggleEditCable(button) {
    const contentDiv = button.closest('div')?.parentElement;
    if (!contentDiv) {
        console.error("Content div not found.");
        return;
    }
    const inputs = contentDiv.querySelectorAll('input');
    const isEditable = inputs[0].hasAttribute('readonly');
    inputs.forEach(input => {
        input.toggleAttribute('readonly');
        if(input.id != 'cable_id'){
            input.classList.toggle('text-gray-500', !isEditable);
            if (isEditable) {
                input.classList.remove('bg-gray-200');
                input.classList.add('bg-gray-100');
            } else {
                input.classList.remove('bg-gray-100');
                input.classList.add('bg-gray-200');
            }
        }
    });
    const icon = button.querySelector('span');
    if (isEditable) {
        icon.style.color = 'green';
        button.classList.add('bg-gray-500');
    } else {
        icon.style.color = '';
        button.classList.remove('bg-gray-500');
    }
    if (!isEditable) {
        updateSheet();
    }
}

if (!sheet.created_at) {
    sheet.created_at = new Date().toISOString(); // Set created_at only if not already defined
}
sheet.updated_at = new Date().toISOString(); // Always update updated_at