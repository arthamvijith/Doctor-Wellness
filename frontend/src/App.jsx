import Home from './pages/Home.jsx';
import DoctorRegistration from './pages/DoctorRegistration.jsx';
import Register from './pages/Register.jsx';
import SignIn from './pages/SignIn.jsx';
import Dashboard from './pages/Dashboard.jsx';

function App() {
  if (window.location.pathname === '/signin') {
    return <SignIn />;
  }

  if (window.location.pathname === '/register') {
    return <Register />;
  }

  if (window.location.pathname === '/register/doctor') {
    return <DoctorRegistration />;
  }

  if (window.location.pathname === '/dashboard') {
    return <Dashboard />;
  }

  return <Home />;
}

export default App;
