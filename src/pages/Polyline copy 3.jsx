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

const Polyline = () => {
  const featureGroupRef = useRef();

  const [encodeGis, setEncodeGis] = useState([]);

  useEffect(() => {
    const storedPolyline = localStorage.getItem("polylineCoordinates");
    if (storedPolyline) {
      setEncodeGis(JSON.parse(storedPolyline));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("polylineCoordinates", JSON.stringify(encodeGis));
  }, [encodeGis]);

  const onCreated = (e) => {
    const marker = e.layer;
    const coordinates = marker.getLatLngs().map((latLng) => ({
      lat: latLng.lat,
      lng: latLng.lng,
    }));

    const encodedPolyline = polyline.encode(
      coordinates.map((coord) => [coord.lat, coord.lng])
    );
    setEncodeGis((preGisEncode) => [...preGisEncode, encodedPolyline]);
  };

  const decodedPolylines = encodeGis.map((encodedPolyline) => {
    return polyline.decode(encodedPolyline);
  });

  const onEdited = (e) => {
    const editedLayers = e.layers.getLayers();
    const storedPolyline = localStorage.getItem("polylineCoordinates");

    console.log(editedLayers);

    const test = JSON.parse(storedPolyline);
    const updatedCoordinates = test;

    editedLayers.forEach((editedPolyline) => {
      const editedCoords = editedPolyline.getLatLngs().map((latLng) => ({
        lat: latLng.lat,
        lng: latLng.lng,
      }));
      const encodedPolyline = polyline.encode(
        editedCoords.map((coord) => [coord.lat, coord.lng])
      );
      console.log(encodedPolyline);
      updatedCoordinates.push(encodedPolyline);
    });
    console.log(updatedCoordinates);

    // setEncodeGis(updatedCoordinates);
  };

  console.log(encodeGis);

  const onDeleted = (e) => {
    e.layers.eachLayer((layer) => {
      const encodedPolyline = polyline.encode(
        layer.getLatLngs().map((latLng) => [latLng.lat, latLng.lng])
      );

      // Hapus polyline yang sesuai dari state atau array yang digunakan untuk menyimpan data polyline
      const updatedEncodeGis = encodeGis.filter(
        (poly) => poly !== encodedPolyline
      );
      setEncodeGis(updatedEncodeGis);
    });
  };

  useEffect(() => {
    if (featureGroupRef.current && decodedPolylines.length > 0) {
      decodedPolylines.forEach((coordSet) => {
        const polyline = L.polyline(coordSet, {
          color: "blue",
        });
        featureGroupRef.current.addLayer(polyline);
      });
    }
  }, [decodedPolylines, encodeGis]);

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
              style={{ height: "600px", width: "1000px", borderRadius: "0px" }}
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
