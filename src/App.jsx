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

          // Menyimpan informasi lengkap lokasi
          saveLocation(locationData);
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
  const [gisData, setGisData] = useState([]);

  useEffect(() => {
    // Mengambil data dari server saat komponen pertama kali dimuat
    axios
      .get("http://g_2005551020.gis.localnet/api/")
      .then((response) => {
        // Mengisi data ke dalam state gisData
        setGisData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching GIS data", error);
      });
  }, [locationData]);

  const saveLocation = async (newLocationData) => {
    setLocationData(newLocationData);
    try {
      // Mengirim data ke server menggunakan POST request
      const postResponse = await axios.post(
        "http://g_2005551020.gis.localnet/api/save",
        newLocationData
      );

      if (postResponse.data.status === 1) {
        // Jika permintaan POST berhasil, maka tambahkan data ke state gisData dengan ID yang diberikan oleh server
        newLocationData.id = postResponse.data.id; // Anggap server memberikan ID dalam respons
        setGisData([...gisData, newLocationData]);
      } else {
        console.error("Failed to save location data on the server");
      }
    } catch (error) {
      console.error("Error saving location data", error);
    }
  };

  const updateMarkerPosition = async (locationId, newPosition) => {
    const locationIdInt = parseInt(locationId, 10);
    console.log(locationIdInt);
    try {
      const response = await axios.get(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${newPosition.lat}&longitude=${newPosition.lng}&localityLanguage=en`
      );

      if (response.data.locality) {
        const newLocationName = response.data.locality;

        // Persiapan data yang akan dikirim ke server
        const updatedData = {
          lat: newPosition.lat,
          lng: newPosition.lng,
          locationName: newLocationName,
        };

        console.log(updatedData);

        // Melakukan permintaan PUT untuk memperbarui data lokasi di server
        const updateResponse = await axios.put(
          `http://g_2005551020.gis.localnet/api/${locationIdInt}/edit`,
          updatedData
        );

        console.log("Update response:", updateResponse);
        if (updateResponse.data.status === 1) {
          // Jika permintaan PUT berhasil di server, maka perbarui data lokasi di state gisData
          const updatedLocationData = gisData.map((location) => {
            if (location.id === locationId) {
              return {
                ...location,
                lat: newPosition.lat,
                lng: newPosition.lng,
                locationName: newLocationName,
              };
            }
            return location;
          });
          setGisData(updatedLocationData);
        } else {
          console.error("Failed to update location data on the server");
        }
      }
    } catch (error) {
      console.error("Error fetching location data or updating location", error);
    }
  };

  useEffect(() => {
    axios
      .get("http://g_2005551020.gis.localnet/api/gis")
      .then((response) => {
        // Mengubah string menjadi angka
        const gisDataWithNumbers = response.data.map((item) => ({
          ...item,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lng),
        }));
        setGisData(gisDataWithNumbers);
      })
      .catch((error) => {
        console.error("Error fetching GIS data", error);
      });
  }, [locationData]);

  console.log(gisData);

  const handleDeleteMarker = async (locationId) => {
    try {
      // Kirim permintaan DELETE ke server
      const deleteResponse = await axios.delete(
        `http://g_2005551020.gis.localnet/api/${locationId}/delete`
      );

      if (deleteResponse.data.status === 1) {
        // Jika penghapusan berhasil di server, perbarui state gisData
        const updatedLocationData = gisData.filter(
          (location) => location.id !== locationId
        );
        setGisData(updatedLocationData);
      } else {
        console.error("Failed to delete location data on the server");
      }
    } catch (error) {
      console.error("Error deleting location data", error);
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
          {gisData?.map((location) => (
            <Marker
              draggable={true}
              icon={icon}
              key={location.id}
              position={[location.lat, location.lng]}
              eventHandlers={{
                dragend: (e) =>
                  updateMarkerPosition(location.id, e.target.getLatLng()),
              }}
            >
              <Popup>
                {`Location: ${location.locationName}\nLatitude: ${location.lat}, Longitude: ${location.lng}`}
                <div
                  className="cursor-pointer"
                  onClick={() => handleDeleteMarker(location.id)}
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
            {gisData?.map((location) => (
              <tr key={location.id}>
                <th className="p-[16px]">{location.id}</th>
                <td className="p-[16px]">{location.locationName}</td>
                <td className="p-[16px]">{location.lat}</td>
                <td className="p-[16px]">{location.lng}</td>
                <th className="p-[16px]">
                  <div onClick={() => handleDeleteMarker(location.id)}>
                    Delete
                  </div>
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
