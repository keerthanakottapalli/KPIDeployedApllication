import React from 'react';
import Button from '@mui/material/Button';
import './DirectorMangersView.css';
import { AppBar, Toolbar, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { BASE_URL } from './config';


const handleLogout = () => {

  localStorage.removeItem('token');

  window.location.href = '/directorportal';
};



const empid = localStorage.getItem('Empid');

const DirectorViewManagerAndEmpDetails = () => {

  const navigate = useNavigate(); // Initialize useNavigate
  const [empIdExists, setEmpIdExists] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);

  const handleFillFormClick = async () => {
    const empIdExistsInAPI = empIdExists; // Use the value from state
    try {
      // Fetch the data from the endpoint
      const response = await fetch(`${BASE_URL}/api/manager_all_data`);
      const data = await response.json();

      // Check if empid from localStorage matches any of the Empid in the fetched data
      const isEmpidExists = data.employees.some((employee) => employee.Empid === parseInt(empid));

      if (!isEmpidExists) {
        // If empid exists, navigate to the form
        navigate('/mform');
      } else {
        // If empid does not exist, open the dialog
        setOpenDialog(true);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };



  const empid = localStorage.getItem('Empid');

  const selectedEmployeeId = localStorage.getItem('selectedEmployeeId');


  const handleManagerViewDetailsClick = () => {
    // Handle Fill KPI Form button click
    navigate(`/directormanagerdetails/${selectedEmployeeId}`);
  };



  const handleEmpViewDetailsClick = () => {
    // Handle Fill KPI Form button click
    navigate(`/directoremployeedetails`);
  };

  const firstname = localStorage.getItem('firstname');
  const lastname = localStorage.getItem('lastname');
  const username = firstname + " " + lastname

  const mainpage = () => {
    navigate('/')
  }


  return (


    <>
      <AppBar position="fixed">
        <Toolbar className="navBar-style">
          <img style={{ width: '60px', borderRadius: '50%' }} onClick={mainpage} src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ53srYmkaJxsUelVmnAHahYnnqjJ_dT-TiUA&usqp=CAU' alt='not found' />

          <div className="userInfo">
            <Typography variant="h6" className="welcome-text">
            Hey, Welcome
            </Typography>

            <h3 className="username-style">{username}</h3>
          </div>
          <Button color="inherit" onClick={handleLogout} className='buttonwrapper'>
            <span className='gobackeform'

            >
              &#8629;
            </span>&nbsp;
            <b> GoBack</b>
          </Button>
        </Toolbar>
      </AppBar>


      <div className="employee-manager-buttons">
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} >
          {/* <DialogTitle>Form Already Submitted</DialogTitle> */}
          <DialogContent style={{ width: '420px' }}>
            {/* Include the <img> element for your image here */}
            <img
              src="https://badge-exam.miraclesoft.com/assets/ecert/Completed-test.svg"
              alt="Your Image Alt Text"
              style={{ maxWidth: '100%', maxHeight: '200px', marginLeft: '23%' }}
            />
            <DialogContentText style={{ fontSize: '18px', marginLeft: '10%', fontWeight: 'bold', color: 'red' }}>
              You have already submitted the form.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)} color="primary">
             <b>OK</b> 
            </Button>
          </DialogActions>
        </Dialog>

        <Button
          className="mdetails-button"
          variant="contained"
          onClick={handleManagerViewDetailsClick}
          style={{ backgroundColor: '#0d416b', fontWeight: 'bolder', fontSize: '14px' }}
        >
          Manager KPI's Details
        </Button>&nbsp;&nbsp;&nbsp;&nbsp;
        <Button className="edetails-button" variant="contained"
          onClick={handleEmpViewDetailsClick}
          style={{ backgroundColor: '#1dbb99', fontWeight: 'bolder', fontSize: '14px' }}
        >
          Employees Under Manager Details
        </Button>

      </div>
    </>
  );
};

export default DirectorViewManagerAndEmpDetails