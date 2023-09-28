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
import axios from "axios";

const icon = L.icon({
  iconSize: [25, 41],
  iconAnchor: [10, 41],
  popupAnchor: [2, -40],
  iconUrl: "https://unpkg.com/leaflet@1.6/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.6/dist/images/marker-shadow.png",
});

function MyComponent({ saveLocation }) {
  const map = useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;

      try {
        // Mengirim permintaan ke endpoint untuk mendapatkan informasi nama daerah
        const response = await axios.get(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
        );

        if (response.data.locality) {
          const locationName = response.data.locality;
          const locationData = {
            lat,
            lng,
            locationName,
          };
          saveLocation(locationData); // Menyimpan informasi lengkap lokasi
        }
      } catch (error) {
        console.error("Error fetching location data", error);
      }
    },
  });
  return null;
}

function MyMap() {
  const [locationData, setLocationData] = useState([]); // State untuk menyimpan data lokasi

  const saveLocation = (newLocationData) => {
    const newLocationArray = [...locationData, newLocationData]; // Menambahkan data lokasi baru ke dalam array
    setLocationData(newLocationArray);
  };

  console.log(locationData); // Mencetak data lokasi ke konsol

  return (
    <div>
      <div className="flex justify-center items-center py-[80px] flex-col font-martian text-white gap-[50px]">
        <h1 className="text-4xl">Geographic Information System</h1>
        <MapContainer
          className="Map"
          center={{ lat: -8.60355596857304, lng: 115.25943918278261 }}
          zoom={15}
          scrollWheelZoom={false}
          style={{ height: "400px", width: "1000px", borderRadius: "0px" }}
        >
          <TileLayer
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MyComponent saveLocation={saveLocation} />
          <MarkerMuster>
            {locationData.map((location, index) => (
              <Marker
                icon={icon}
                key={index}
                position={[location.lat, location.lng]}
              >
                <Popup>{`Location: ${location.locationName}\nLatitude: ${location.lat}, Longitude: ${location.lng}`}</Popup>
              </Marker>
            ))}
          </MarkerMuster>
        </MapContainer>
        <div className="overflow-x-auto h-[400px] w-[800px]">
          <table className="table table-base table-pin-rows table-pin-cols table-zebra">
            <thead>
              <tr>
                <th></th>
                <td>Location Name</td>
                <td>Latitude</td>
                <td>Longitude</td>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {locationData.toReversed().map((location, index) => (
                <tr>
                  <th>{index + 1}</th>
                  <td>{location.locationName}</td>
                  <td>{location.lat}</td>
                  <td>{location.lng}</td>
                  <th>{index + 1}</th>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th></th>
                <td>Location Name</td>
                <td>Latitude</td>
                <td>Longitude</td>
                <th></th>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

export default MyMap;
