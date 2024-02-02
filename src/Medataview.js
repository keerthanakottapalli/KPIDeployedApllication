
import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  AppBar,
  Toolbar
} from '@mui/material';
import { IconButton, Box, DialogTitle, Dialog, DialogContentText, DialogContent, DialogActions, Menu, Tooltip, MenuItem, ListItemIcon, } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link } from 'react-router-dom';
import './Medataview.css';
import { BASE_URL } from './config';
import { Logout } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const ManagerPortal = () => {
  const [employeesData, setEmployeesData] = useState([]);
  const [reportingManagers, setReportingManagers] = useState({});
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const [isProfileCardOpen, setIsProfileCardOpen] = useState(false);
  const [userData, setUserData] = useState(null); // State to store user data
  const [registrations, setRegistrations] = useState([]);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [loading, setLoading] = useState(true);


  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  }

  const handleOpenProfileCard = async () => {
    const empid = localStorage.getItem('Empid'); // Make sure this contains the correct Empid
    try {
      // Fetch the user data based on empid
      const response = await fetch(`${BASE_URL}/api/emp_data/${empid}`);
      const userData = await response.json();

      if (userData.message.length > 0) {
        // Assuming the API returns an array of users, use the first one
        setUserData(userData.message[0]);
        setIsProfileCardOpen(true); // Open the profile card
        handleCloseUserMenu(); // Close the settings menu
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };
  // Function to toggle the Change Password component
  const toggleChangePassword = () => {
    setShowChangePassword(!showChangePassword);
  };




  const handleCloseProfileCard = () => {
    setIsProfileCardOpen(false); // Close the profile card
  };
  const fetchUserProfile = async () => {
    try {
      const empid = localStorage.getItem('Empid');
      const response = await fetch(`${BASE_URL}/api/emp_data?Empid=${empid}`);
      const data = await response.json();

      // Filter the data to find the user with the matching Empid
      const userData = data.message.find(user => user.Empid === parseInt(empid, 10));

      if (userData) {
        // Now you have the user data
        console.log(userData);
        // setUserData(userData); // Set the user data in your state if needed
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleToggleImagePreview = () => {
    setShowImagePreview(!showImagePreview);
  };

  const [empIdExists, setEmpIdExists] = useState(true);
  useEffect(() => {
    if (isProfileCardOpen) {
      fetchUserProfile();
    }
  }, [isProfileCardOpen]);


  useEffect(() => {
    // Fetch the registration data from the server when the component mounts
    const fetchRegistrations = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/emp_data`); // Replace with the correct URL for your backend
        if (!response.ok) {
          throw new Error('Network response was not ok.');
        }
        const data = await response.json();
        setRegistrations(data.message);

        // Extract Firstname from the API response
        const firstnames = data.message.map(item => item.Firstname);

      } catch (error) {
        console.error('Error:', error.message);
      }
    };

    fetchRegistrations();
  }, []);

  useEffect(() => {
    // Fetch employee details
    fetch(`${BASE_URL}/api/emp_all_data`)
      .then((response) => response.json())
      .then((data) => {
        const employeesWithPractices = data.employees;
        localStorage.setItem('practices', JSON.stringify(employeesWithPractices));

        // Set the state with the employee data
        setEmployeesData(employeesWithPractices);
      })
      .catch((error) => console.error('Error fetching data:', error));

    // Fetch reporting manager details
    fetch(`${BASE_URL}/api/emp_data`)

      .then((response) => response.json())
      .then((data) => {
        const reportingData = data.message.reduce((acc, manager) => {
          acc[manager.Empid] = manager.Reportingmanager;
          return acc;
        }, {});
        setReportingManagers(reportingData);
      })
      .catch((error) => console.error('Error fetching reporting managers:', error));
  }, []);



  const handleLogout = () => {
    navigate('/login')
  };

  const navigate = useNavigate();
  const goBack = () => {
    navigate('/mview')
  }

  const empId = localStorage.getItem('Empid');
  const firstname = localStorage.getItem('firstname');
  const lastname = localStorage.getItem('lastname');
  const username = firstname + "" + " " + lastname
  console.log(username);


  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);


  const [employeeData, setEmployeeData] = useState([]);

  useEffect(() => {

    // Replace this with your actual API call
    fetch(`${BASE_URL}/api/emp_all_status_data`)
      .then((response) => response.json())
      .then((data) => setEmployeeData(data.employees))
      .catch((error) => console.error(error));
  }, []);


  const mainpage = () => {
    navigate('/')
  }

  return (
    <>

      <AppBar position="fixed">
        <Toolbar className="navBar-style">
          <img className='images' style={{cursor:'pointer'}} onClick={mainpage} src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ53srYmkaJxsUelVmnAHahYnnqjJ_dT-TiUA&usqp=CAU' alt='not found' />
          <div className="userInfo">
            <Typography variant="h6" className="welcome-text">
              Hey, Welcome
            </Typography>
            <h3 className="username">{username.toUpperCase()}</h3>
          </div>
          <Box>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenUserMenu}
              color="inherit"
            >

              {registrations.map((registration) => (
                registration.Empid == empId && (
                  <td>
                    {registration.Image && (
                      <img
                        src={registration.Image}
                        alt="Profile"
                        style={{
                          width: '60px',
                          height: '60px',
                          borderRadius: '50%',
                          marginRight: '8px',
                        }}

                      />
                    )}
                  </td>
                )
              ))}
            </IconButton>
            <Menu
              id="user-menu"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
              style={{maxWidth: '300px', marginTop:'50px', marginLeft:'-15px' }}
            >

              <MenuItem key="Profile" onClick={handleOpenProfileCard}>
                <ListItemIcon>
                  <AccountCircleIcon />
                </ListItemIcon>
                Profile
              </MenuItem>



              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <Logout />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Box>

        </Toolbar>

      </AppBar>
      <div className='bg-container'>
        <ListItemIcon style={{ marginLeft: '10vw', marginTop: '90px', cursor:'pointer' }} onClick={goBack}>
          <ArrowBackIcon />&nbsp; <span><b>Go Back</b></span>
        </ListItemIcon>

        <div style={{ width: '80%', margin: '0 auto' }}>
          {loading ? (
            <div className="loading-container" style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
            }}>
              <div className="loading-text">Loading...</div>
              <div className="loading-spinner"></div>
            </div>
          ) : (
            <TableContainer component={Paper} style={{ marginTop: '20px' }}>
              {employeesData.some((employee) => reportingManagers[employee.Empid] === username) ? (
                <Table>
                  <TableHead >
                    <TableRow style={{ backgroundColor: '#d0e6f5' }}>
                      <TableCell style={{ fontWeight: 'bold', fontSize: '16px', color: '#222', textAlign: 'center' }}>Employee ID</TableCell>
                      <TableCell style={{ fontWeight: 'bold', fontSize: '16px', color: '#333', textAlign: 'center' }}>Employee Name</TableCell>
                      <TableCell style={{ fontWeight: 'bold', fontSize: '16px', color: '#333', textAlign: 'center' }}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody style={{ marginLeft: '40%' }}>
                    {employeeData.map((employee) => {
                      const empReportingManager = reportingManagers[employee.Empid] || "";
                      console.log(empReportingManager, 'empReportingManager');
                      console.log(username, 'username');
                      console.log(employeeData, 'employeeData');
                      console.log(employee, '316')
                      if (empReportingManager === username) {
                        return (
                          <TableRow key={employee.Empid} style={{ fontWeight: 'bold', color: '#333', paddingLeft: '10%' }}>
                            <TableCell style={{ fontSize: '16px', color: '#333', textAlign: 'center' }}>{employee.Empid}</TableCell>

                            {employeesData.map((employees) => {
                              // Find the corresponding employee data based on EmpId
                              console.log(employees, '318');
                              console.log(employee.Empid, '319');
                              if (employees.Empid === employee.Empid) {
                                return (

                                  <TableCell key={employee.EmployeeID} style={{ fontSize: '16px', color: '#333', textAlign: 'center' }}>
                                    {employees.Empname}
                                  </TableCell>

                                );
                              }
                            })}
                            <TableCell style={{ color: '#333', textAlign: 'center', }}>
                              {employee.Status === 'Decline' && (

                                <Button
                                  variant="contained"
                                  style={{ backgroundColor: '#d12a2a', width: "35%", height: '50px', fontWeight: 'bold' }}>
                                  Declined
                                </Button>
                              )}
                              {employee.Status !== 'Decline' && (
                                <div>
                                  <Button
                                    variant="contained"
                                    color="primary"
                                    component={Link}
                                    to={`/mcomments/${employee.Empid}`}
                                    style={{  backgroundColor: '#00aaee', width: "35%", height: '50px' }}
                                    onClick={() => {
                                      // Store the Empid in local storage
                                      localStorage.setItem('EmployeeId', employee.Empid);
                                    }}
                                  >
                                    <b>View Details</b>
                                  </Button>
                                  

                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      } else {
                        return null;
                      }
                    })}
                  </TableBody>
                </Table>
              ) : (
                <Typography
                  variant="h6"
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    textAlign: "center",
                  }}
                >
                  No Employee Found Here.
                </Typography>
              )}
            </TableContainer>)}



        </div>
        <Dialog
          open={isProfileCardOpen}
          onClose={handleCloseProfileCard}
          fullWidth // Makes the dialog take up the full width of its container
          maxWidth="sm" // Sets the maximum width of the dialog
        >
          <DialogTitle style={{ marginLeft: '33%', fontSize: '24px', fontWeight: 'bolder' }}>Profile Details</DialogTitle>
          <DialogContent style={{ height: '400px' }}>
            {/* Display user profile information */}
            {registrations.map((registration) => (
              registration.Empid == empId && (
                <div onClick={handleToggleImagePreview}>
                  {registration.Image && (
                    <img
                      src={registration.Image}
                      alt="Profile"
                      style={{
                        borderRadius: "50%",
                        cursor: 'pointer',
                        height: '120px',
                        width: '120px'
                      }}
                    />
                  )}
                </div>
              )
            ))}<br />
            {userData && (
              <>


                <div style={{ display: 'flex', flexDirection: 'row', marginLeft: '5%' }}>
                  <div style={{ marginRight: '20px' }}>
                    <p style={{ fontSize: '18px', fontFamily: 'sans-serif', fontStyle: 'initial' }}>
                      <span style={{ fontWeight: 'bold', color: 'Black' }}>Empid:</span> {userData.Empid}
                    </p>
                    <p style={{ fontSize: '18px', fontFamily: 'sans-serif', fontStyle: 'initial' }}>
                      <span style={{ fontWeight: 'bold', color: 'Black' }}>First Name:</span> {userData.Firstname}
                    </p>
                    <p style={{ fontSize: '18px', fontFamily: 'sans-serif', fontStyle: 'initial' }}>
                      <span style={{ fontWeight: 'bold', color: 'Black' }}>Last Name:</span> {userData.Lastname}
                    </p>
                    <p style={{ fontSize: '18px', fontFamily: 'sans-serif', fontStyle: 'initial' }}>
                      <span style={{ fontWeight: 'bold', color: 'Black' }}>Email:</span> {atob(userData.Empmail)}
                    </p>
                    <p style={{ fontSize: '18px', fontFamily: 'sans-serif', fontStyle: 'initial' }}>
                      <span style={{ fontWeight: 'bold', color: 'Black' }}>Role:</span> {userData.Role}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '18px', fontFamily: 'sans-serif', fontStyle: 'initial' }}>
                      <span style={{ fontWeight: 'bold', color: 'Black' }}>Practice:</span> {userData.Practies}
                    </p>
                    <p style={{ fontSize: '18px', fontFamily: 'sans-serif', fontStyle: 'initial' }}>
                      <span style={{ fontWeight: 'bold', color: 'Black' }}>Reporting Manager:</span> {userData.Reportingmanager}
                    </p>
                    <p style={{ fontSize: '18px', fontFamily: 'sans-serif', fontStyle: 'initial' }}>
                      <span style={{ fontWeight: 'bold', color: 'Black' }}>Reporting HR:</span> {userData.Reportinghr}
                    </p>
                    <p style={{ fontSize: '18px', fontFamily: 'sans-serif', fontStyle: 'initial' }}>
                      <span style={{ fontWeight: 'bold', color: 'Black' }}>Location:</span> {userData.Location}
                    </p>

                  </div>
                </div>


              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseProfileCard} style={{ backgroundColor: "#00aaee", color: "white ", marginBottom: '15px', marginRight: '15px' }}>
              <b>Close</b>
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog open={showImagePreview} onClose={handleToggleImagePreview}>
          <DialogContent>
            {registrations.map((registration) => (
              registration.Empid == empId && (
                <div>
                  {registration.Image && (
                    <img
                      src={registration.Image}
                      alt="Profile Preview"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                      }}
                    />
                  )}
                </div>
              )
            ))}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default ManagerPortal;
