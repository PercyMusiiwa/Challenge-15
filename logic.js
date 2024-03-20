// Define the URL for the GeoJSON earthquake data
const earthquakeDataURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Create the map
const map = L.map("map", {
    center: [37.09, -95.71],
    zoom: 5
});

// Add a tile layer to the map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Retrieve and add the earthquake data to the map
d3.json(earthquakeDataURL).then(function (data) {
    // Define the style for map features
    function mapStyle(feature) {
        return {
            opacity: 1,
            fillOpacity: 1,
            fillColor: getColorForDepth(feature.geometry.coordinates[2]),
            color: "black",
            radius: getRadiusForMagnitude(feature.properties.mag),
            stroke: true,
            weight: 0.5
        };
    }

    // Determine color based on depth
    function getColorForDepth(depth) {
        return depth > 90 ? "red" :
               depth > 70 ? "orangered" :
               depth > 50 ? "orange" :
               depth > 30 ? "gold" :
               depth > 10 ? "yellow" :
                            "lightgreen";
    }

    // Determine radius based on magnitude
    function getRadiusForMagnitude(magnitude) {
        return magnitude === 0 ? 1 : magnitude * 4;
    }

    // Add earthquake data to the map
    L.geoJson(data, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng);
        },
        style: mapStyle,
        // Activate pop-up data when circles are clicked
        onEachFeature: function (feature, layer) {
            layer.bindPopup(`Magnitude: ${feature.properties.mag}<br>Location: ${feature.properties.place}<br>Depth: ${feature.geometry.coordinates[2]}`);
        }
    }).addTo(map);

    // Add the legend with colors to correlate with depth
    const legend = L.control({position: "bottomright"});
    legend.onAdd = function() {
        const div = L.DomUtil.create("div", "info legend");
        const depthRanges = [-10, 10, 30, 50, 70, 90];

        for (let i = 0; i < depthRanges.length; i++) {
            div.innerHTML += `<i style="background:${getColorForDepth(depthRanges[i] + 1)}"></i> ${depthRanges[i]}${depthRanges[i + 1] ? `&ndash;${depthRanges[i + 1]}<br>` : '+'}`;
        }
        return div;
    };
    legend.addTo(map);
});
