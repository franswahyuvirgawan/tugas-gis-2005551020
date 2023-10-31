import React, { useState, useRef, useEffect } from "react";
import L from "leaflet";
import {
  TileLayer,
  FeatureGroup,
  MapContainer,
  Marker,
  Popup,
} from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import osm from "./osm-providers";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import polyline from "polyline-encoded";
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
  const ZOOM_LEVEL = 12;
  const mapRef = useRef();
  const featureGroupRef = useRef();

  console.log(featureGroupRef);

  // Initialize state to store drawn polylines and the selected polyline for editing
  const [test, setTest] = useState([]);

  const fetchPolylines = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8888/apiencode/index.php"
      );
      const fetchedPolylines = response.data; // Assuming the response is an array of polylines
      setTest(fetchedPolylines);
    } catch (error) {
      console.error("Error fetching polylines:", error);
    }
  };

  console.log(test);

  const _created = async (e) => {
    const { layerType, layer } = e;
    if (layerType === "polyline") {
      const coordinates = layer.getLatLngs();
      console.log("halo" + coordinates);

      // Generate a unique ID for the new polyline
      const id = Date.now().toString();

      // Add the ID property to the polyline
      layer.id = id;

      // Encode the polyline
      const encodedPolyline = polyline.encode(
        coordinates.map((coord) => [coord.lat, coord.lng])
      );

      // Make a POST request to save the encoded polyline in the database
      try {
        const response = await axios.post(
          "http://localhost:8888/apiencode/index.php",
          {
            gis_encode: encodedPolyline,
          }
        );
        console.log("Polyline saved:", response.data);

        // Fetch updated polylines after successfully saving
        fetchPolylines();
      } catch (error) {
        console.error("Error saving polyline:", error);
      }
    }
  };

  const _edited = (e) => {};

  useEffect(() => {
    // Fetch initial data when the component mounts
    fetchPolylines();
  }, []);

  return (
    <>
      <div className="row">
        <div className="col text-center">
          <div className="col">
            <MapContainer
              className="Map"
              center={{ lat: -8.60355596857304, lng: 115.25943918278261 }}
              scrollWheelZoom={true}
              style={{ height: "500px", width: "1000px", borderRadius: "0px" }}
              zoom={ZOOM_LEVEL}
              ref={mapRef}
            >
              <FeatureGroup ref={featureGroupRef}>
                <EditControl
                  position="topright"
                  onCreated={_created}
                  onEdited={_edited}
                  draw={{
                    rectangle: false,
                    circle: false,
                    circlemarker: false,
                    marker: false,
                    polyline: true,
                    polygon: false,
                  }}
                />
                {/* {test.map((encodedPolyline) => (
                  <div className="py-2" key={encodedPolyline.id}>
                    {polyline
                      .decode(encodedPolyline.gis_encode)
                      .map((coord, i) => (
                        <div key={i}>
                          Latitude: {coord[0]}, Longitude: {coord[1]}
                        </div>
                      ))}
                  </div>
                ))} */}
                {test.map((encodedPolyline) => {
                  polyline
                    .decode(encodedPolyline.gis_encode)
                    .map((coord, i) => (
                      <Marker key={i} position={[coord[0], coord[1]]}>
                        <Popup>
                          Latitude: {coord[0]}, Longitude: {coord[1]}
                        </Popup>
                      </Marker>
                    ));
                })}
                {test.map((encodedPolyline) => (
                  <div className="py-2" key={encodedPolyline.id}>
                    {polyline
                      .decode(encodedPolyline.gis_encode)
                      .map((coord, i) => (
                        <Marker key={i} position={[coord[0], coord[1]]}>
                          <Popup>
                            Latitude: {coord[0]}, Longitude: {coord[1]}
                          </Popup>
                        </Marker>
                      ))}
                  </div>
                ))}
              </FeatureGroup>
              <TileLayer
                url={osm.maptiler.url}
                attribution={osm.maptiler.attribution}
              />
            </MapContainer>
          </div>
        </div>
      </div>
      <div>
        <h3>Decoded Polylines</h3>
        {test.map((encodedPolyline) => (
          <div className="py-2" key={encodedPolyline.id}>
            {polyline.decode(encodedPolyline.gis_encode).map((coord, i) => (
              <div key={i}>
                Latitude: {coord[0]}, Longitude: {coord[1]}
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
};

export default Polyline;
