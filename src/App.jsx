import React, { useState } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import { MarkerMuster } from "react-leaflet-muster";

import "leaflet/dist/leaflet.css";

const icon = L.icon({
  iconSize: [25, 41],
  iconAnchor: [10, 41],
  popupAnchor: [2, -40],
  iconUrl: "https://unpkg.com/leaflet@1.6/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.6/dist/images/marker-shadow.png",
});

function MyComponent({ saveLatLng }) {
  const map = useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      saveLatLng(lat, lng); // Menyimpan kedua latitude dan longitude
    },
  });
  return null;
}

function MyMap() {
  const [markerData, setMarkerData] = useState([]); // State untuk menyimpan data marker

  const saveLatLng = (lat, lng) => {
    const newMarkerData = [...markerData, { lat, lng }]; // Menambahkan data marker baru
    setMarkerData(newMarkerData);
  };

  console.log(markerData); // Mencetak data marker ke konsol

  return (
    <div>
      <MapContainer
        className="Map"
        center={{ lat: -8.60355596857304, lng: 115.25943918278261 }}
        zoom={15}
        scrollWheelZoom={false}
        style={{ height: "100vh" }}
      >
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MyComponent saveLatLng={saveLatLng} />
        <MarkerMuster>
          {markerData.map((item, index) => (
            <Marker key={index} position={item}>
              <Popup>{`Latitude: ${item.lat}, Longitude: ${item.lng}`}</Popup>
            </Marker>
          ))}
        </MarkerMuster>
      </MapContainer>
    </div>
  );
}

export default MyMap;
