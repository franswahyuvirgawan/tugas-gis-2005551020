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
          `https://geocode.maps.co/reverse?lat=${lat}&lon=${lng}`
        );
        const locationName = response.data.address.village;
        const locationData = {
          lat,
          lng,
          locationName,
        };
        // Menyimpan informasi lengkap lokasi
        saveLocation(locationData);
      } catch (error) {
        console.error("Error fetching location data", error);
      }
    },
  });
  return null;
}

function MapCluster() {
  const [locationData, setLocationData] = useState([]);
  const [gisData, setGisData] = useState([]);
  const [testDelete, setTestDelete] = useState("");

  useEffect(() => {
    // Mengambil data dari server saat komponen pertama kali dimuat
    axios
      .get("http://g_2005551020.gis.localnet/api/index.php")
      .then((response) => {
        // Mengisi data ke dalam state gisData
        setGisData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching GIS data", error);
      });
  }, [locationData, testDelete]);

  const saveLocation = async (newLocationData) => {
    setLocationData(newLocationData);
    try {
      // Mengirim data ke server menggunakan POST request
      const postResponse = await axios.post(
        "http://g_2005551020.gis.localnet/api/index.php",
        newLocationData
      );
      newLocationData.id = postResponse.data.id; // Anggap server memberikan ID dalam respons
      setGisData([...gisData, newLocationData]);
    } catch (error) {
      console.error("Error saving location data", error);
    }
  };

  const updateMarkerPosition = async (locationId, newPosition) => {
    try {
      const response = await axios.get(
        `https://geocode.maps.co/reverse?lat=${newPosition.lat}&lon=${newPosition.lng}`
      );

      console.log(response);

      if (response.data.address.village) {
        const newLocationName = response.data.address.village;

        // Persiapan data yang akan dikirim ke server
        const updatedData = {
          id: locationId,
          lat: newPosition.lat,
          lng: newPosition.lng,
          locationName: newLocationName,
        };

        await axios.put(
          `http://g_2005551020.gis.localnet/api/index.php`,
          updatedData
        );
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
      }
    } catch (error) {
      console.error("Error fetching location data or updating location", error);
    }
  };

  useEffect(() => {
    axios
      .get("http://g_2005551020.gis.localnet/api/index.php")
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
      // Data yang ingin Anda kirim dalam body request
      const requestData = { locationId };

      // Kirim permintaan DELETE ke server dengan data dalam body
      const deleteResponse = await axios.delete(
        `http://g_2005551020.gis.localnet/api/index.php`,
        {
          data: requestData, // Menyertakan data dalam body request
          headers: {
            "Content-Type": "application/json", // Set header content type sesuai kebutuhan
          },
        }
      );

      setTestDelete(deleteResponse);

      if (deleteResponse.data.status === 1) {
        // Jika penghapusan berhasil di server, perbarui state gisData
        const updatedLocationData = gisData.filter(
          (location) => location.id !== locationId
        );
        setTest(updatedLocationData);
      } else {
        console.error("Failed to delete location data on the server");
      }
    } catch (error) {
      console.error("Error deleting location data", error);
    }
  };

  console.log(gisData);

  return (
    <div className="flex justify-center items-center py-[40px] flex-col font-martian text-white gap-[50px]">
      <h1 className="text-4xl font-bold">Geographic Information System</h1>
      <MapContainer
        className="Map"
        center={{ lat: -8.60355596857304, lng: 115.25943918278261 }}
        zoom={15}
        scrollWheelZoom={true}
        style={{ height: "600px", width: "1000px", borderRadius: "0px" }}
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
                <div className="flex flex-col gap-6 py-2 items-center">
                  <h1 className="font-bold text-2xl">
                    {location.locationName}
                  </h1>
                  <table className="flex flex-col gap-4">
                    <tr className="flex flex-row gap-4 items-center w-full">
                      <td className="w-[70px]">Latitude</td>
                      <td>:</td>
                      <td>{location.lat}</td>
                    </tr>
                    <tr className="flex flex-row gap-4 items-center w-full">
                      <td className="w-[70px]">Longitude</td>
                      <td>:</td>
                      <td>{location.lng}</td>
                    </tr>
                  </table>
                  <button
                    className="btn btn-xs p-4 btn-outline btn-error flex flex-col items-center lg:btn-base w-full"
                    onClick={() => handleDeleteMarker(location.id)}
                  >
                    Delete
                  </button>
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
          <tbody className="w-full">
            {gisData.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <div className="w-full flex flex-row justify-center py-20">
                    Silahkan pilih lokasi.
                  </div>
                </td>
              </tr>
            ) : (
              <>
                {gisData?.map((location, key) => (
                  <tr key={key}>
                    <th className="p-[16px]">{key + 1}</th>
                    <td className="p-[16px]">{location.locationName}</td>
                    <td className="p-[16px]">{location.lat}</td>
                    <td className="p-[16px]">{location.lng}</td>
                    <th className="p-[16px]">
                      <div
                        className="cursor-pointer"
                        onClick={() => handleDeleteMarker(location.id)}
                      >
                        Delete
                      </div>
                    </th>
                  </tr>
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MapCluster;
