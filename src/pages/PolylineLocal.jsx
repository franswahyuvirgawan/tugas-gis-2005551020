import React, { useRef, useEffect, useState } from "react";
import { FeatureGroup, MapContainer, TileLayer } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import osm from "./osm-providers";
import polyline from "polyline-encoded";
import L from "leaflet";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png",
});

const PolylineLocal = () => {
  const featureGroupRef = useRef();

  const [encodedPolylines, setEncodedPolylines] = useState([]);

  useEffect(() => {
    const storedPolyline = localStorage.getItem("polylineCoordinates");
    if (storedPolyline) {
      setEncodedPolylines(JSON.parse(storedPolyline));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "polylineCoordinates",
      JSON.stringify(encodedPolylines)
    );
  }, [encodedPolylines]);

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

    setEncodedPolylines((prevPolylines) => [
      ...prevPolylines,
      { id, encodedPolyline },
    ]);
  };

  const onEdited = (e) => {
    const storedPolyline = localStorage.getItem("polylineCoordinates");
    const editedLayers = e.layers.getLayers();

    // Add debugging logs
    console.log("Edited Layers:", editedLayers);

    if (storedPolyline) {
      let updatedPolylines = JSON.parse(storedPolyline);

      editedLayers.forEach((editedPolyline) => {
        const id = editedPolyline.options.id;

        // Add more debugging logs
        console.log("Editing polyline with ID:", id);

        const editedCoords = editedPolyline.getLatLngs().map((latLng) => ({
          lat: latLng.lat,
          lng: latLng.lng,
        }));
        const encodedPolyline = polyline.encode(
          editedCoords.map((coord) => [coord.lat, coord.lng])
        );

        // Find and update the polyline with the new encoded coordinates
        updatedPolylines = updatedPolylines.map((poly) => {
          if (poly.id === id) {
            return { id, encodedPolyline };
          }
          return poly;
        });

        // Add more debugging logs
        console.log("Updated Polylines:", updatedPolylines);
      });

      // Store the updated polylines back in local storage
      localStorage.setItem(
        "polylineCoordinates",
        JSON.stringify(updatedPolylines)
      );
      console.log(updatedPolylines);

      // If needed, update the state with the updated polylines
      setEncodedPolylines(updatedPolylines);
    }
  };

  const onDeleted = (e) => {
    e.layers.eachLayer((layer) => {
      const id = layer.options.id;

      // Remove the polyline with the matching id from the state
      setEncodedPolylines((prevPolylines) =>
        prevPolylines.filter((polyline) => polyline.id !== id)
      );
    });
  };

  useEffect(() => {
    if (featureGroupRef.current) {
      // Clear existing layers from the feature group
      featureGroupRef.current.clearLayers();
      // Add the decoded polylines back to the map
      encodedPolylines.forEach((data) => {
        const decodedCoords = polyline.decode(data.encodedPolyline);
        const id = data.id;
        const polylineLayer = L.polyline(decodedCoords, {
          color: "blue",
          id, // Store the id in the options
        });
        featureGroupRef.current.addLayer(polylineLayer);
      });
    }
  }, [encodedPolylines]);

  console.log(encodedPolylines);

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
              style={{ height: "400px", width: "1000px", borderRadius: "0px" }}
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

export default PolylineLocal;
