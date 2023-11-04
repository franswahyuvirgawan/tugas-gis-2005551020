import React, { useRef, useEffect, useState } from "react";
import { FeatureGroup, MapContainer, TileLayer } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import osm from "./osm-providers";
import polyline from "polyline-encoded";
import L from "leaflet";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet/dist/leaflet.css";
import axios from "axios";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png",
});

const Polyline = () => {
  const featureGroupRef = useRef();

  const [encodedPolylines, setEncodedPolylines] = useState([]);

  useEffect(() => {
    // Mengambil data polyline dari endpoint GET
    axios
      .get("http://g_2005551020.gis.localnet/api/polyline.php")
      .then((response) => {
        // Menyimpan data yang diterima ke dalam state
        setEncodedPolylines(response.data);
      })
      .catch((error) => {
        console.error("Error saat mengambil data polyline:", error);
      });
  }, []);

  const onCreated = (e) => {
    const marker = e.layer;
    const coordinates = marker.getLatLngs().map((latLng) => ({
      lat: latLng.lat,
      lng: latLng.lng,
    }));

    const encodedPolyline = polyline.encode(
      coordinates.map((coord) => [coord.lat, coord.lng])
    );

    // Generate a unique id for the polyline
    const id = Date.now();

    // POST request untuk menyimpan id dan encodedPolyline
    axios
      .post("http://g_2005551020.gis.localnet/api/polyline.php", {
        id: id,
        encoded_polyline: encodedPolyline,
      })
      .then(() => {
        // Setelah permintaan POST berhasil, lakukan permintaan GET
        return axios.get("http://g_2005551020.gis.localnet/api/polyline.php");
      })
      .then((response) => {
        setEncodedPolylines(response.data);
      })
      .catch((error) => {
        console.error("Error saat mengambil data polyline:", error);
      });
  };
  const onEdited = async (e) => {
    let storedPolyline = [];
    try {
      const response = await axios.get(
        "http://g_2005551020.gis.localnet/api/polyline.php"
      );
      storedPolyline = response.data;
    } catch (error) {
      console.error("Error saat mengambil data polyline:", error);
    }
    const editedLayers = e.layers.getLayers();

    if (storedPolyline) {
      editedLayers.forEach(async (editedPolyline) => {
        const id = editedPolyline.options.id;
        const editedCoords = editedPolyline.getLatLngs().map((latLng) => ({
          lat: latLng.lat,
          lng: latLng.lng,
        }));
        const encodedPolyline = polyline.encode(
          editedCoords.map((coord) => [coord.lat, coord.lng])
        );

        // Temukan indeks polyline yang sesuai dengan ID dalam data yang ada
        const index = storedPolyline.findIndex((poly) => poly.id === id);

        if (index !== -1) {
          const updatedData = {
            id: id,
            encoded_polyline: encodedPolyline,
          };

          try {
            const response = await axios.put(
              `http://g_2005551020.gis.localnet/api/polyline.php`,
              updatedData
            );

            if (response.status === 200) {
              // Jika permintaan PUT berhasil, perbarui polyline di dalam storedPolyline
              storedPolyline[index] = {
                id: id,
                encoded_polyline: encodedPolyline,
              };
            }
          } catch (error) {
            console.error("Error saat mengirim permintaan PUT:", error);
          }
        } else {
          console.error("Polyline dengan ID tidak ditemukan:", id);
        }

        console.log("Updated Polylines:", storedPolyline);
      });

      console.log(storedPolyline);

      // Jika diperlukan, perbarui state dengan polyline yang sudah diperbarui
      // setEncodedPolylines(updatedPolylines);
    }
  };

  const onDeleted = async () => {
    await axios
      .delete("http://g_2005551020.gis.localnet/api/polyline.php")
      .then(() => {
        // Setelah berhasil menghapus polyline, perbarui data dari server
        axios
          .get("http://g_2005551020.gis.localnet/api/polyline.php")
          .then((response) => {
            setEncodedPolylines(response.data);
          })
          .catch((error) => {
            console.error("Error saat mengambil data polyline:", error);
          });
      });
  };

  useEffect(() => {
    if (featureGroupRef.current) {
      // Clear existing layers from the feature group
      featureGroupRef.current.clearLayers();
      // Add the decoded polylines back to the map
      encodedPolylines?.map((data) => {
        const decodedCoords = polyline.decode(data.encoded_polyline);
        const id = data.id;
        const polylineLayer = L.polyline(decodedCoords, {
          color: "blue",
          id, // Store the id in the options
        });
        featureGroupRef.current.addLayer(polylineLayer);
      });
    }
  }, [encodedPolylines]);

  return (
    <>
      <div className="row">
        <div className="col text-center">
          <div className="col">
            <MapContainer
              className="Map"
              center={{ lat: -8.60355596857304, lng: 115.25943918278261 }}
              zoom={15}
              scrollWheelZoom={true}
              style={{ height: "80vh", width: "1000px", borderRadius: "0px" }}
            >
              <FeatureGroup ref={featureGroupRef}>
                <EditControl
                  onCreated={onCreated}
                  onEdited={onEdited}
                  onDeleted={onDeleted}
                  position="topright"
                  draw={{
                    rectangle: false,
                    circle: false,
                    circlemarker: false,
                    marker: false,
                    polyline: true,
                    polygon: false,
                  }}
                />
              </FeatureGroup>
              <TileLayer
                url={osm.maptiler.url}
                attribution={osm.maptiler.attribution}
              />
            </MapContainer>
          </div>
        </div>
      </div>
    </>
  );
};

export default Polyline;
