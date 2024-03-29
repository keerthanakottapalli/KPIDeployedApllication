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
    window.location.href = '/';
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


  return (
    <>
      <AppBar position="fixed" className='adminadmin-view-container'>
        <Toolbar className="navBar-style">
          <img style={{ width: '60px', borderRadius: '50%' }} src='data:image/jpeg;base64,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' alt='not found' />

          <div className="userInfo">
            <Typography variant="h6" className="welcome-text">
              Welcome
            </Typography>

            <h3 className="username-style">{username.toUpperCase()}</h3>
          </div>
          <Button onClick={handleLogout} style={{color:'white', fontWeight:'bold', fontSize:'18px'}}>
            <span 

            >
              &#8629;
            </span>&nbsp;
            <b>GoBack</b>
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
