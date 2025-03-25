function openMapPopup() {
    if (!navigator.onLine) {
        showCustomAlert("You are currently offline. Please enter latitude and longitude manually.");
    }else{
        const popup = window.open(
            "map.html",
            "MapWindow",
            "width=1200,height=768,top=100,left=100"
        );
        if (!popup || popup.closed || typeof popup.closed === "undefined") {
            showCustomAlert("Popup blocked! Please allow popups for this site.");
        }
    }
}

function setLocation(lat, lng) {
    document.getElementById("lat_long").value = `${lat}, ${lng}`;
}