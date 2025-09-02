import { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import NavBar from "./components/NavBar/NavBar.jsx";
import SignUpForm from "./components/SignUpForm/SignUpForm.jsx";
import SignInForm from "./components/SignInForm/SignInForm.jsx";
import Landing from "./components/Landing/Landing.jsx";
import Dashboard from "./components/Dashboard/Dashboard.jsx";
import PlaylistsPage from "./components/Playlists/PlaylistsPage.jsx";
import PlaylistDetail from "./components/PlaylistDetail/PlaylistDetail.jsx"; // ✅ add this

import { UserContext } from "./contexts/UserContext.jsx";

function Protected({ children }) {
  const { user } = useContext(UserContext);
  return user ? children : <Navigate to="/sign-in" replace />;
}

export default function App() {
  const { user } = useContext(UserContext);

  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={user ? <Dashboard /> : <Landing />} />

        <Route
          path="/playlists"
          element={
            <Protected>
              <PlaylistsPage />
            </Protected>
          }
        />

        {/* playlist detail route */}
        <Route
          path="/playlists/:id"
          element={
            <Protected>
              <PlaylistDetail />
            </Protected>
          }
        />

        <Route path="/sign-up" element={<SignUpForm />} />
        <Route path="/sign-in" element={<SignInForm />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
