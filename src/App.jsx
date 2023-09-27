import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

function App() {
  return (
    <>
      <MapContainer
        center={[-8.603605532873571, 115.25939476997254]}
        zoom={13}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[-8.603605532873571, 115.25939476997254]}>
          <Popup>Rumah Frans</Popup>
        </Marker>
      </MapContainer>
    </>
  );
}

export default App;
