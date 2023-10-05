import React, { useEffect, useState } from "react";
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
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;

      try {
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
  const [locationData, setLocationData] = useState([]);

  const saveLocation = (newLocationData) => {
    setLocationData([...locationData, newLocationData]);
  };

  const handleDeleteMarker = (e, index) => {
    e.preventDefault(); // Mencegah perilaku default klik kanan
    const updatedLocationData = [...locationData];
    updatedLocationData.splice(index, 1);
    setLocationData(updatedLocationData);
  };

  const updateMarkerPosition = async (index, newPosition) => {
    try {
      const response = await axios.get(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${newPosition.lat}&longitude=${newPosition.lng}&localityLanguage=en`
      );

      if (response.data.locality) {
        const newLocationName = response.data.locality;
        const updatedLocationData = [...locationData];
        updatedLocationData[index] = {
          ...updatedLocationData[index],
          lat: newPosition.lat,
          lng: newPosition.lng,
          locationName: newLocationName,
        };
        setLocationData(updatedLocationData);
      }
    } catch (error) {
      console.error("Error fetching location data", error);
    }
  };

  return (
    <div className="flex justify-center items-center py-[80px] flex-col font-martian text-white gap-[50px]">
      <h1 className="text-4xl">Geographic Information System</h1>
      <MapContainer
        className="Map"
        center={{ lat: -8.60355596857304, lng: 115.25943918278261 }}
        zoom={15}
        scrollWheelZoom={true}
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
              draggable={true}
              icon={icon}
              key={index}
              position={[location.lat, location.lng]}
              eventHandlers={{
                dragend: (e) =>
                  updateMarkerPosition(index, e.target.getLatLng()),
              }}
            >
              <Popup>
                {`Location: ${location.locationName}\nLatitude: ${location.lat}, Longitude: ${location.lng}`}
                <div
                  className="cursor-pointer"
                  onContextMenu={(e) => handleDeleteMarker(e, index)}
                >
                  Delete
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerMuster>
      </MapContainer>
      <div className="overflow-x-auto h-[400px] w-[800px] font-[300]">
        <table className="table table-xs table-pin-rows table-pin-cols table-zebra">
          <thead>
            <tr>
              <th className="p-[16px]"></th>
              <td className="p-[16px]">Location Name</td>
              <td className="p-[16px]">Latitude</td>
              <td className="p-[16px]">Longitude</td>
              <th className="p-[16px]"></th>
            </tr>
          </thead>
          <tbody>
            {locationData.map((location, index) => (
              <tr key={index}>
                <th className="p-[16px]">{index + 1}</th>
                <td className="p-[16px]">{location.locationName}</td>
                <td className="p-[16px]">{location.lat}</td>
                <td className="p-[16px]">{location.lng}</td>
                <th className="p-[16px]">
                  <div onClick={() => handleDeleteMarker(index)}>Delete</div>
                </th>
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
  );
}

export default MyMap;
