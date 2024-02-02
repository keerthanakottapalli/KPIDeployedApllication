import React, { useState } from 'react';
import { Button } from '@mui/material';
import './AdminView.css'; // Import your CSS file for styling
import { AppBar, Toolbar, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EmployeeKPIsComponent from './EmployeeKPIsComponent'; // Import your Employee KPI's component
import ManagerKPIsComponent from './ManagerKPIsComponent';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import DirectorKPIsComponent from './DirectorKPIsComponent';

const AdminView = () => {
  const [selectedComponent, setSelectedComponent] = useState(
    <img
      src="https://desktime.com/blog/wp-content/uploads/2022/10/KPI.png" // Replace with the URL of your default image
      alt="Default Image"
      style={{ width: '100%', height: '90%' }}
    />
  ); const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/')
  };

  const username = localStorage.getItem('adminName');
  console.log(username);

  const handleButton1Click = () => {
    setSelectedComponent(<EmployeeKPIsComponent />);
  };

  const handleButton2Click = () => {
    setSelectedComponent(<ManagerKPIsComponent />);
  };
  const handleButton3Click = () => {
    setSelectedComponent(<DirectorKPIsComponent />);
  };

  const [selectedOption, setSelectedOption] = useState('');

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
    if (event.target.value === 'Employee KPIs') {
      handleButton1Click();
    } else if (event.target.value === 'Manager KPIs') {
      handleButton2Click();
    }
    else if (event.target.value === 'Director KPIs') {
      handleButton3Click();
    }
  };


  const mainpage = () => {
    navigate('/')
  }

  return (
    <>
      <AppBar position="fixed" className='adminadmin-view-container'>
        <Toolbar className="navBar-style">
        <img style={{ width: '60px', borderRadius: '50%', cursor:'pointer' }} onClick={mainpage} src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ53srYmkaJxsUelVmnAHahYnnqjJ_dT-TiUA&usqp=CAU' alt='not found' />

          <div className="userInfo">
            <Typography variant="h6" className="welcome-text">
              Hey, Welcome
            </Typography>

            <h3 className="username-style">{username.toUpperCase()}</h3>
          </div>
          <Button onClick={handleLogout} style={{color:'white', fontWeight:'bold', fontSize:'18px'}}>
            <span 

            >
              &#8629;
            </span>&nbsp;
            <b>Logout</b>
          </Button>
        </Toolbar>
      </AppBar>

      <div style={{ display: 'flex' }}>
        <div style={{ width: '20%', backgroundColor: '#2d2d32' }}>
          <Select
            value={selectedOption}
            onChange={handleOptionChange}
            className='drop-down-in-sidebar'
            displayEmpty
          >
            <MenuItem value="" disabled>
              Select One
            </MenuItem>
            <MenuItem value="Employee KPIs">Employee KPI's</MenuItem>
            <MenuItem value="Manager KPIs">Manager KPI's</MenuItem>
            <MenuItem value="Director KPIs">Director KPI's</MenuItem>
          </Select>
        </div>

        <div className='back-container'>
          <h3>Content</h3>
          {selectedComponent}
        </div>
      </div>
    </>
  );
};

export default AdminView;
