const fs = require("fs");
const path = require("path");
const file_path = "src/assets/data/";
function saveFile(filePath, objectData) {
    const directory = path.dirname(filePath);
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(objectData, null, 2), "utf8");
    console.log("Data saved to:", filePath);
}

function loadFile(filePath) {
    if (!fs.existsSync(filePath)) {
        console.error("File not found:", filePath);
        return null;
    }
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
}


function loadSheet(file_src) {
    const loadedData = loadFile(file_src);
    return loadedData;
}
function updateSheet() {
    const now = new Date();
    const year = String(now.getFullYear()).slice(-2); // Get last two digits of the year
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const second = String(now.getSeconds()).padStart(2, '0');
    const formattedDateTime = `${year}-${month}-${day} ${hour}:${minute}:${second}`;

    sheet.title = document.getElementById("enclosureTitle")?.innerHTML || "";
    sheet.company = document.getElementById("company")?.value || "";
    sheet.date = now.toLocaleDateString('en-CA');
    sheet.tech = document.getElementById("tech")?.value || "";
    sheet.location_id = document.getElementById("location_id")?.value || "";
    sheet.enclosure_id = document.getElementById("enclosure_id")?.value || "";
    sheet.enclosure_type = document.getElementById("enclosure_type")?.value || "";
    sheet.road_name = document.getElementById("road_name")?.value || "";
    sheet.lat_long = document.getElementById("lat_long")?.value || "";
    sheet.notes = document.getElementById("notes")?.value || "";
    sheet.created_at = sheet.created_at || formattedDateTime; // Set created_at only if it's not already set
    sheet.updated_at = formattedDateTime; // Update the updated_at field to the current date and time

    for (let i = 0; i < sheet.tableCount; i++) {
        let container = document.querySelectorAll(`[data-cable]`)[i]; // Select [i]th element containing "data-cable" attribute
        if (container) {
            sheet.table[i].cable_id = container.querySelector("#cable_id") ? parseInt(container.querySelector("#cable_id").value) || 0 : 0;
            sheet.table[i].cable_color_id = container.querySelector("#cable_color_id")?.value || "";
            sheet.table[i].total_fiber_count = container.querySelector("#total_fiber_count")?.value || "";
            sheet.table[i].cable_footage = container.querySelector("#cable_footage")?.value || "";
            sheet.table[i].cable_type = container.querySelector("#cable_type")?.value || "";
            sheet.table[i].direction = container.querySelector("#direction")?.value || "";
            sheet.table[i].use = container.querySelector("#use")?.value || "";
            sheet.table[i].notes = container.querySelector("#notes")?.value || "";

            // Select the next sibling <div> element
            let nextDiv = container.nextElementSibling;
            if (nextDiv) {
                let table = nextDiv.querySelector("table");
                if (table) {
                    let tbody = table.querySelector("tbody");
                    if (tbody) {
                        let rows = tbody.querySelectorAll("tr");
                        rows.forEach((row, index) => {
                            sheet.table[i].connection[index].connection = row.querySelector('td:last-child').textContent.trim();
                            sheet.table[i].connection[index].notes = row.querySelector('input').value;
                        });
                    }
                }
            }
        }
    }
}

async function saveSheet() {
    const loading = document.getElementById("loading");
    loading.style.display = "flex";
    setTimeout(function() {
        loading.style.display = "none";
    }, 500);

    const now = new Date();
    const year = String(now.getFullYear()).slice(-2); // Get last two digits of the year
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed, so we add 1
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const second = String(now.getSeconds()).padStart(2, '0');
    const formattedDateTime = `${year}-${month}-${day} ${hour}:${minute}:${second}`;

    const filePath = file_path + `${year}_${month}_${day}_${hour}_${minute}_${second}_${sheet.title}.json`;
    updateSheet();
    saveFile(filePath, sheet);

    try {
        const id = localStorage.getItem("projectId");
        const token = localStorage.getItem("token");
        const formData = {
            title: sheet.title,
            company: sheet.company,
            file_src: filePath,
            date: sheet.date,
            tech: sheet.tech,
            location_id: sheet.location_id,
            enclosure_id: sheet.enclosure_id,
            enclosure_type: sheet.enclosure_type,
            road_name: sheet.road_name,
            lat_long: sheet.lat_long,
            notes: sheet.notes,
            created_at: formattedDateTime,
            updated_at: formattedDateTime,
        };
        console.log("This is formdata before update", formData);

        const response = await fetch(`${localStorage.getItem("Backend_Link")}/api/project/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `${token}`
            },
            body: JSON.stringify(formData),
        });

        const data = await response.json();
        console.log(data);
        if (data.success) {
            console.log("Project updated successfully", data.project);
        } else {
            console.log("Error saving: " + data.message);
        }
    } catch (error) {
        console.error("Error:", error);
    }

    loadSheet(filePath);
    console.log("Saved file", sheet);
}

document.getElementById("exportButton").addEventListener("click", function() {
    console.log("Exporting data with multiple tables to CSV");

    dataObjects = sheet.table;
    let csvContent = '';
    csvContent += `Title, ${sheet.title}\n`
    csvContent += `Company, ${sheet.company}, , Tech, ${sheet.tech}, , Location ID, ${sheet.location_id}\n`;
    csvContent += `Date, ${sheet.date}, , Enclosure ID, ${sheet.enclosure_id}, , Enclosure Type, ${sheet.enclosure_type}\n`;
    csvContent += `Road Name, ${sheet.road_name}, , Lat/Long, ${sheet.lat_long}\n`;
    csvContent += `Notes, ${sheet.notes}\n\n`;
    dataObjects.forEach((data, index) => {
        csvContent += `\n`;
        csvContent += `Cable ID, ${data.cable_id}, , Cable Color ID, ${data.cable_color_id}, , Total Fiber Count, ${data.total_fiber_count}\n`;
        csvContent += `Cable Footage, ${data.cable_footage}, , Cable Type, ${data.cable_type}\n`;
        csvContent += `Direction, ${data.direction}, , Use, ${data.use}\n`;
        csvContent += `Notes, ${data.notes}\n\n`;
        csvContent += `F #, BT #, Notes, Connection\n`;
        csvContent += convertToCSV(data.connection) + '\n'; // Convert table data to CSV and add a blank line between tables
    });

    // Create a Blob from the CSV data
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

    // Create a link element to trigger the download
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'table.csv'; 
    link.click();
});

function convertToCSV(data) {
    const keys = Object.keys(data[0]);
    // const header = keys.join(','); 
    const rows = data.map(row => keys.map(key => row[key]).join(','));
    return [...rows].join('\n'); 
}