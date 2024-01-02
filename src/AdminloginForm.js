import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import { TextField, Button, Container, Typography, Grid } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import './AdminloginForm.css'
import { BASE_URL } from './config';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const Navigate = useNavigate();



  function parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const decodedToken = JSON.parse(atob(base64));
    return decodedToken;
  }


  const handleLogin = async (e) => {
    e.preventDefault();
    console.log('Email:', email);
    console.log('Password:', password);
    try {
      // Prepare the request body with email and password
      const requestBody = JSON.stringify({ adminEmail: email, adminPassword: password });

      // Make a POST request to the login API
      const response = await fetch(`${BASE_URL}/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: requestBody,
      });
      console.log(requestBody);
      const data = await response.json();

      if (response.ok) {
        // Check if the login was successful
        const { token } = data;
        localStorage.setItem('token', token);

        // Extract the role from the token and store it in localStorage
        const decodedToken = parseJwt(token);
        const adminEmail = decodedToken.adminEmail;
        const adminID = decodedToken.adminID;
        const adminName = decodedToken.adminName;

        console.log('Decoded adminEmail:', adminEmail); // Check the value of Empid before storing


        localStorage.setItem('adminID', adminID);
        localStorage.setItem('adminName', adminName);
        localStorage.setItem('adminEmail', adminEmail);

        if (data.message === 'Admin Login successful') {
          // Set adminId in state

          // Navigate to the main component
          Navigate('/adminview');
        } else {
          // Handle unsuccessful login
        }
      } else {
        // Handle other errors
      }
    } catch (error) {
      // Handle network or other errors
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-form">
      <fieldset className='login-fieldset'>
        <div>
          <img
            className="miracleLogo"
            src={'https://hubble.miraclesoft.com/assets/img/miracle-logo-white.svg'}
            alt="Image Description"
          />
          <p className="loginText">Enter Your Details to Continue</p>
        </div>
        <form onSubmit={handleLogin}>
          <div className="loginform-group">
            <TextField
              className="textfield"
              placeholder="Enter your email"
              variant="outlined"
              style={{ width: '100%', maxWidth: '355px', height: '45px' }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <span className="material-icons" style={{ color: 'black' }}>email</span>
                  </InputAdornment>
                ),
              }}
            />
          </div>
          <br />
          <div className="loginform-group">

          <TextField
            className="textfield"
            placeholder="Enter your password"
            variant="outlined"
            type={showPassword ? 'text' : 'password'}
          
            style={{ width: '100%', maxWidth: '355px', height: '45px' }}
             
             
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <span className="material-icons" style={{ color: 'black' }}>lock</span>
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                      style={{ width: '1px', height: '1px', background: '#a9a7a7', marginRight: '0px', marginBottom:'15px' }}
                    >
                      {showPassword ? <VisibilityIcon style={{ color: 'black' }} /> : <VisibilityOffIcon style={{ color: 'black' }} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </div>



          <Button type="submit" variant="contained" color="primary" fullWidth style={{ marginTop: '20px' }}>
            Login
          </Button>
        </form>
        <footer>
          <p className="footer-stmt">&copy; 2023 Miracle Software Systems, Inc.</p>
        </footer>
      </fieldset>

    </div>
  );
};









export default AdminLogin;
