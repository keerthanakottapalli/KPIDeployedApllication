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
import { Link, useNavigate } from 'react-router-dom';
import './Medataview.css';
import { BASE_URL } from './config';
import { Login, Logout } from '@mui/icons-material';

const DirectorViewEmpDetails = () => {
  const [employeesData, setEmployeesData] = useState([]);
  const [reportingManagers, setReportingManagers] = useState({});
  const [employeeData, setEmployeeData] = useState([]);
  const [reportingManager, setReportingManager] = useState({});
  const [employeeRoles, setEmployeeRoles] = useState([]);
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const [isProfileCardOpen, setIsProfileCardOpen] = useState(false);
  const [userData, setUserData] = useState(null); // State to store user data
  const [registrations, setRegistrations] = useState([]);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [loading, setLoading] = useState(true);


  // Simulate data loading with a setTimeout
  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    });
  }, []); // Empty dependency array means this effect runs once after initial render

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };
  const handleChangePassword = () => {
    setShowChangePassword(true);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
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
        localStorage.setItem('practice', JSON.stringify(employeesWithPractices));
        console.log(employeesWithPractices, "employeesWithPractices");

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

        // Determine the role of each employee
        const employeeRoles = data.message.reduce((acc, employee) => {
          if (employee.Role) {
            acc[employee.Empid] = employee.Role;
          }
          return acc;
        }, {});

        // Set the reporting managers and employee roles in your state
        setReportingManagers(reportingData);
        setEmployeeRoles(employeeRoles);

        console.log(reportingData, '2222');
      })
      .catch((error) => console.error('Error fetching reporting managers:', error));
  }, []);




  const handleLogout = () => {

    localStorage.removeItem('practices');
    localStorage.removeItem('managerempname');
    navigate('/login')
  };

  const empId = localStorage.getItem('Empid');
  const firstname = localStorage.getItem('firstname');
  const lastname = localStorage.getItem('lastname');
  const username = firstname + "" + " " + lastname
  console.log(username);

  const navigate = useNavigate()
  const goBack = () => {
    navigate('/directorportal')
  }

  const selectedEmployeeName = localStorage.getItem('selectedEmployeeName')

  useEffect(() => {
    // const managerempname1 = localStorage.getItem('managerempname')
    // Fetch employee details
    fetch(`${BASE_URL}/api/manager_all_data`)
      .then((response) => response.json())
      .then((data) => {
        const employeesWithPractices = data.employees;
        localStorage.setItem('practices', JSON.stringify(employeesWithPractices));
        setEmployeeData(employeesWithPractices);
      })
      .catch((error) => console.error('Error fetching data:', error));

    fetch(`${BASE_URL}/api/emp_data`)
      .then((response) => response.json())
      .then((data) => {
        const reportingData = data.message.reduce((acc, manager) => {
          acc[manager.Empid] = manager.Reportingmanager;
          return acc;
        }, {});
        setReportingManager(reportingData);

      })
      .catch((error) => console.error('Error fetching reporting managers:', error));
  }, []);


  const storedData = localStorage.getItem('practices');
  let managerempid;
  let managerempName;
  if (storedData) {
    const employeesWithPractices = JSON.parse(storedData);

    managerempid = employeesWithPractices[0].Empid;
    managerempName = employeesWithPractices[0].Empname;
    console.log('Empid:', managerempName);
  } else {
    console.error('No data found in local storage');
  }
  const hasUsers = employeesData.length > 0;

  const mainpage = () => {
    navigate('/')
  }


  return (
    <>
      <AppBar position="fixed">
        <Toolbar className="navBar-style">
          <img style={{ width: '60px', borderRadius: '50%', cursor:'pointer' }} onClick={mainpage} src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ53srYmkaJxsUelVmnAHahYnnqjJ_dT-TiUA&usqp=CAU' alt='not found' />

          <div className="userInfo">
            <Typography variant="h6" className="Hey, Welcome-text">
            Hey, Welcome
            </Typography>

            <h3 className="username-style">{username.toUpperCase()}</h3>
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
                            width: '60px', // Set the desired width
                            height: '60px', // Set the desired height
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
      <div className='login-background'>
        <div style={{ width: '80%', height: '100vh', marginLeft: '10vw' }}>
          <ListItemIcon style={{ marginTop: '13vh', }} onClick={goBack}>
            <ArrowBackIcon />&nbsp; <span><b>Go Back</b></span>
          </ListItemIcon>
          <br />
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
            <TableContainer component={Paper}>
              {employeesData.some((employee) => selectedEmployeeName === reportingManagers[employee.Empid]) ? (
                <Table style={{ minWidth: 850 }}>
                  <TableHead >
                    <TableRow style={{ backgroundColor: '#d0e6f5' }}>
                      <TableCell style={{ fontWeight: 'bold', fontSize: '16px', color: '#222', paddingLeft: "10%" }}>Employee ID</TableCell>
                      <TableCell style={{ fontWeight: 'bold', fontSize: '16px', color: '#333', paddingLeft: "10%" }}>Employee Name</TableCell>
                      <TableCell style={{ fontWeight: 'bold', fontSize: '16px', color: '#333', paddingLeft: "18%" }}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody style={{ marginLeft: '40%' }}>
                    {employeesData.map((employee) => {
                      const empReportingManager = reportingManagers[employee.Empid] || '';
                      if (selectedEmployeeName === empReportingManager) {
                        return (
                          <TableRow key={employee.Empid} style={{ fontWeight: 'bold', color: '#333', paddingLeft: '10%' }}>
                            <TableCell style={{ fontSize: '16px', color: '#333', paddingLeft: '10%' }}>{employee.Empid}</TableCell>
                            <TableCell style={{ fontSize: '16px', color: '#333', paddingLeft: '10%' }}>{employee.Empname}</TableCell>
                            <TableCell style={{ color: '#333', paddingLeft: '10%' }}>
                              <Button
                                variant="contained"
                                color="primary"
                                component={Link}
                                to={`/directormngempdetails/${employee.Empid}`}
                                style={{ fontWeight: 'bold', textDecoration: 'none', backgroundColor: '#00aaee', width: "45%" }}
                              >
                                View Details
                              </Button>&nbsp;&nbsp;&nbsp;
                              {/* <Button
                    variant="contained"
                    color="primary"
                    component={Link}
                    to={`/directormngempdetails/${employee.Empid}`}
                    style={{ fontWeight: 'bold', textDecoration: 'none', backgroundColor: '#00aaee', width:"35%"}}
                  >
                    Decline
                  </Button> */}
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
                    textAlign: "center"
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
             <b>Close</b> Close
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

export default DirectorViewEmpDetails;