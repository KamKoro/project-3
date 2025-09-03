import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { signUp } from '../../services/authService';
import { UserContext } from '../../contexts/UserContext';
import "../../AuthForm.css"; // fine to keep if you want extra rules, but not required for centring

const SignUpForm = () => {
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({ username: '', password: '', passwordConf: '' });
  const { username, password, passwordConf } = formData;

  const handleChange = (e) => {
    setMessage('');
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newUser = await signUp(formData);
      setUser(newUser);
      navigate('/');
    } catch (err) {
      setMessage(err.message);
    }
  };

  const isFormInvalid = () => !(username && password && password === passwordConf);

  return (
    <main className="auth-page">{/* was auth-container */}
      <div className="auth-card">
        <h1>Sign Up</h1>
        {message && <p className="auth-message">{message}</p>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div>
            <label htmlFor="username">Username:</label>
            <input
              type="text" id="username" name="username"
              value={username} onChange={handleChange} required
            />
          </div>
          <div>
            <label htmlFor="password">Password:</label>
            <input
              type="password" id="password" name="password"
              value={password} onChange={handleChange} required
            />
          </div>
          <div>
            <label htmlFor="passwordConf">Confirm Password:</label>
            <input
              type="password" id="passwordConf" name="passwordConf"
              value={passwordConf} onChange={handleChange} required
            />
          </div>
          <div className="auth-buttons">{/* was auth-actions */}
            <button disabled={isFormInvalid()}>Sign Up</button>
            <button type="button" className="btn-outline" onClick={() => navigate('/')}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default SignUpForm;
