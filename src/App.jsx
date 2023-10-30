import { Route, Routes } from "react-router-dom";
import MapCluster from "./pages/MapCluster";
import Layout from "./components/Layout";
import Polyline from "./pages/Polyline";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<MapCluster />} />
        <Route path="/polyline" element={<Polyline />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
