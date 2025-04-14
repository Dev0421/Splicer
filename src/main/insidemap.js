var map = L.map('map').setView([36.978, -84.035], 8); // Adjusted longitude to be within -180 to 180 range
var streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap' }).addTo(map);
var earthLayer = L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', { attribution: '&copy; Google', subdomains: ['mt0', 'mt1', 'mt2', 'mt3'] });

var marker;
var selectedLat, selectedLng;

map.on('click', function(e) {
    selectedLat = e.latlng.lat.toFixed(6); // Latitude in decimal degrees
    selectedLng = e.latlng.lng.toFixed(6); // Longitude in decimal degrees

    document.getElementById("selected-coordinates").innerText = `Selected: ${selectedLat}, ${selectedLng}`;

    if (marker) map.removeLayer(marker);
    marker = L.marker([selectedLat, selectedLng]).addTo(map);
});

function setStreetMap() {
    map.removeLayer(earthLayer);
    map.addLayer(streetLayer);
}

function setEarthMap() {
    map.removeLayer(streetLayer);
    map.addLayer(earthLayer);
}

function confirmLocation() {
    if (selectedLat && selectedLng) {
        if (window.opener) {
            window.opener.setLocation(selectedLat, selectedLng); // Send data to main page
            window.close(); // Close the popup
        }
    } else {
        showCustomAlert("Please select a location.");
    }
}

function showCable(cableCoordinates) {
    var cablePolyline = L.polyline(cableCoordinates, { color: 'red' }).addTo(map);
    map.fitBounds(cablePolyline.getBounds());
}