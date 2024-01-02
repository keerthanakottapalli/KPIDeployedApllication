import React from 'react';
import { Button, Typography, Container, Card, CardContent } from '@material-ui/core';
import './Main.css'; // Import the custom CSS file
import { useNavigate } from 'react-router-dom';

const Main = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login'); 
  };

  const handleRegister = () => {
    navigate('/register'); 
  };

  const handleAdmin = () => {
    navigate('/adminLogin'); 
  };


  return (
    <div className="card-container">
      <Container maxWidth="sm">
        <Typography variant="h5" component="h5" gutterBottom style={{ color: 'white', textAlign: 'center', marginBottom: '20px' }}>
          WELCOME TO EMPLOYEE KPI REVIEWS!
        </Typography>
        <Card className="card" style={{ minHeight: '400px', paddingTop: '20px' }}>
          <CardContent>
            <div className="button-container">
              <Button variant="contained" color="primary" onClick={handleLogin} className="button" style={{ paddingLeft: '28px', paddingRight: '28px' }}>
                Login
              </Button>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <Button variant="contained" color="secondary" onClick={handleRegister} className="button">
                Register
              </Button>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <Button variant="contained" color="secondary" onClick={handleAdmin} className="button" style={{ paddingLeft: '28px', paddingRight: '28px' }}>
                Administrator
              </Button>
            </div>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
  
};

export default Main;
