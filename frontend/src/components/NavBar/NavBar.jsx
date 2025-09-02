import { useContext } from "react";
import { Link } from "react-router-dom";

import { UserContext } from "../../contexts/UserContext";

const NavBar = () => {
  const { user, setUser } = useContext(UserContext);

  const handleSignOut = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <nav>
      {user ? (
        <ul>
          <li><strong>Playlistr</strong></li>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/playlists">Your Playlists</Link></li>
          <li>
            <button type="button" onClick={handleSignOut} aria-label="Sign Out">
              Sign Out
            </button>
          </li>
        </ul>
      ) : (
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/sign-in">Sign In</Link></li>
          <li><Link to="/sign-up">Sign Up</Link></li>
        </ul>
      )}
    </nav>
  );
};

export default NavBar;
