import React from 'react';
import './ButtonCenter.css';
import { AppBar, Toolbar, Typography, IconButton, Box, Button, DialogTitle, Dialog, DialogContentText, DialogContent, DialogActions, Menu, Tooltip, MenuItem, ListItemIcon, } from '@mui/material';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { useEffect, useState } from 'react';
import LockIcon from '@mui/icons-material/Lock';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import CloseIcon from '@mui/icons-material/Close';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ChangePassword from './ChangePassword';
import { BASE_URL } from './config';






const empId = localStorage.getItem('Empid');

const ButtonCenter = () => {

  const navigate = useNavigate(); // Initialize useNavigate
  const [empIdExists, setEmpIdExists] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const [isProfileCardOpen, setIsProfileCardOpen] = useState(false);
  const [userData, setUserData] = useState(null); // State to store user data
  const [registrations, setRegistrations] = useState([]);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [Empmail, setEmpmail] = useState(atob(localStorage.getItem('empmail')));
  const [selectedImage, setSelectedImage] = useState(null);


  const handleLogout = () => {

    localStorage.removeItem('token');

    navigate('/login')
  };

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
  };

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

  useEffect(() => {
    if (isProfileCardOpen) {
      fetchUserProfile();
    }
  }, [isProfileCardOpen]);





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
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    setSelectedImage(file);

    const getBase64 = (file, callback) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => callback(reader.result);
      reader.onerror = (error) => console.error('Error converting file to base64:', error);
    };

    if (file) {
      getBase64(file, (base64Image) => {
        const formData = {
          empId,
          Image: base64Image,
        };

        fetch(`${BASE_URL}/api/emp_image_upd/${empId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),

        })
          .then((response) => {
            console.log('Raw Response:', response);
            window.location.reload();
            return response.json();
          })
          .then((data) => {
            console.log('Parsed Response:', data.message);
            if (data && data.message === 'Image updated successfully') {
              console.log('Image uploaded successfully');

            } else {
              console.error('Image upload failed');
            }
          })
          .catch((error) => {
            console.error('Error uploading image:', error);
          });
      });
    }
  };





  const empid = localStorage.getItem('Empid');

  const handleViewDetailsClick = () => {
    // Handle Fill KPI Form button click
    navigate('/meview'); // Navigate to the 'mform' route
  };
  const handleFormViewDetailsClick = () => {
    // Handle Fill KPI Form button click
    navigate(`/mget/${empid}`); // Navigate to the 'mform' route
  };

  const handleFormUpdateDetailsClick = () => {
    // Handle Fill KPI Form button click
    navigate(`/mUpdate/${empid}`); // Navigate to the 'mform' route
  };

  const firstname = localStorage.getItem('firstname');
  const lastname = localStorage.getItem('lastname');
  const username = firstname + " " + lastname
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  // useEffect(() => {
  //   // Make a GET request to the specified URL
  //   fetch(`${BASE_URL}/api/manager_all_status_data/${empid}`)
  //     .then((response) => response.json())
  //     .then((data) => {
  //       if (data.status === true) {
  //         // Filter out employees with non-null Status
  //         const filteredEmployees = data.employees.filter((employee) => employee.Status !== null);
  //         console.log(filteredEmployees, "filteredEmployees");
  //         localStorage.setItem('employeeData', JSON.stringify(filteredEmployees));

  //         // Loop through filteredEmployees and check the condition
  //         filteredEmployees.forEach((employee) => {
  //           console.log(employee.Empid.toString(), "Empid", empid.toString());
  //           if (employee.Empid.toString() === empid) {
  //             const employeeDecline = employee.Status;
  //             console.log('Matching Employee Status:', employeeDecline);

  //             // Update the state to enable the button if status is "Decline"
  //             if (employeeDecline === "Decline") {
  //               setIsButtonDisabled(false);
  //             }
  //           }
  //         });
  //       }
  //     })
  //     .catch((error) => {
  //       console.error('Error fetching data:', error);
  //     });
  // }, []);
  useEffect(() => {
    // Make a GET request to the specified URL
    fetch(`${BASE_URL}/api/manager_all_status_data`)
      .then((response) => response.json())
      .then((data) => {
        if (data.status === true) {
          // Filter out employees with non-null Status
          const filteredEmployees = data.employees.filter((employee) => employee.Status !== null);
          console.log(filteredEmployees, "filteredEmployees");
          localStorage.setItem('employeeData', JSON.stringify(filteredEmployees));

          // Loop through filteredEmployees and check the condition
          filteredEmployees.forEach((employee) => {
            console.log(employee.Empid.toString(), "Empid", empid.toString());

            if (employee.Empid.toString() === empid) {
              const employeeDecline = employee.Status;
              console.log('Matching Employee Status:', employeeDecline);

              // Update the state to enable the button if status is "Decline"
              if (employeeDecline === "Decline") {
                console.log(employeeDecline === "Decline", '271');
                setIsButtonDisabled(false);
              }
            }
          });
        }
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, []);

  const mainpage = () => {
    navigate('/')
  }

  return (


    <>

      <AppBar position="fixed">
        <Toolbar className="navigation-header">
          <img style={{ width: '60px', borderRadius: '50%', cursor:'pointer' }} onClick={mainpage} src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ53srYmkaJxsUelVmnAHahYnnqjJ_dT-TiUA&usqp=CAU' alt='not found' />

          <div className="userInfo">
            <Typography variant="h6" className="welcome-text">
              Hey, Welcome
            </Typography>

            <h3 className="manager-username">{username.toUpperCase()}</h3>
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
              style={{ maxWidth: '300px', marginTop: '50px', marginLeft: '-15px' }}
            >

              <MenuItem key="Profile" onClick={handleOpenProfileCard}>
                <ListItemIcon>
                  <AccountCircleIcon />
                </ListItemIcon>
                Profile
              </MenuItem>
              <MenuItem key="ProfileChange">
                <label htmlFor="imageUpload">
                  <ListItemIcon>
                    <CameraAltIcon fontSize="small" />
                  </ListItemIcon>
                  Profile Change
                </label>
                <input
                  type="file"
                  id="imageUpload"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImageChange}
                />
              </MenuItem>

              <MenuItem key="ChangePassword" onClick={handleChangePassword}>
                <ListItemIcon>
                  <LockIcon />
                </ListItemIcon>
                Change Password
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <ExitToAppIcon />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      {showChangePassword && (
        <IconButton
          aria-label="close"
          onClick={toggleChangePassword}
          style={{ marginLeft: '56%', marginBottom: '-17%' }}
        >
          <CloseIcon style={{ color: 'red', width: '10%', height: '40%' }} />
        </IconButton>
      )}
      {showChangePassword ? (

        <ChangePassword />

      ) : (
        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#c6e2ff', textAlign: 'center' }}>
          <div className="button-center-container" style={{ flex: 1 }}>
            <div className='Paragraph-division'>

              <div style={{ textAlign: 'center' }}>
                <Tooltip title="Click to fill your KPI Form" arrow>
                  <Button
                    className="gradient-button"
                    variant="contained"
                    onClick={handleFillFormClick}
                    style={{ backgroundColor: '#0d416b', marginLeft: '20px' }}

                  >
                    <b>Fill KPI Form</b>
                  </Button>
                </Tooltip>
                <Tooltip title="Click to view your KPI Form" arrow>
                  <Button className="gradient-button" variant="contained"
                    onClick={handleFormViewDetailsClick}
                    style={{ backgroundColor: '#00aaee', marginLeft: '20px' }}>

                    <b>My KPI Details</b>
                  </Button>
                </Tooltip>
                <Tooltip title="Click to update your KPI Form" arrow>
                  <Button
                    style={{ backgroundColor: '#0d416b', marginLeft: '20px', ...(isButtonDisabled && { backgroundColor: '#7cb3de' }), }}
                    className="gradient-button"
                    variant="contained"
                    onClick={handleFormUpdateDetailsClick}
                    disabled={isButtonDisabled} // Disable the button based on the state
                  >
                    Update Details
                  </Button>
                </Tooltip>
                <Tooltip title="Click to view your Team KPI Forms" arrow>
                  <Button className="gradient-button" variant="contained"
                    onClick={handleViewDetailsClick}
                    style={{ backgroundColor: '#00aaee', marginLeft: '20px' }}
                  >
                    <b>Team KPIs</b>
                  </Button>
                </Tooltip>
              </div>
            </div>
          </div>

          <Dialog open={openDialog} onClose={() => setOpenDialog(false)} >
            {/* <DialogTitle>Form Already Submitted</DialogTitle> */}
            <DialogContent style={{ width: '420px' }}>
              {/* Include the <img> element for your image here */}
              <img
                src="https://badge-exam.miraclesoft.com/assets/ecert/Completed-test.svg"
                alt="Your Image Alt Text"
                style={{ maxWidth: '100%', maxHeight: '200px', marginLeft: '23%' }} // Adjust the styles as needed
              />
              <DialogContentText style={{ fontSize: '18px', textAlign: 'center', fontWeight: 'bold', color: 'red' }}>
                You have already submitted the form.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)} color="primary" style={{ color: 'white', backgroundColor: '#00aaee', fontWeight: 'bolder', marginBottom: '15px', marginRight: '15px' }}>
                <b>OK</b>
              </Button>
            </DialogActions>
          </Dialog>

        </div>
      )}
      <Dialog
        open={isProfileCardOpen}
        onClose={handleCloseProfileCard}
        fullWidth // Makes the dialog take up the full width of its container
      >
        <DialogTitle style={{ marginLeft: '33%', fontSize: '24px', fontWeight: 'bolder' }}>Profile Details</DialogTitle>
        <DialogContent style={{ height: '400px' }}>
          {registrations.map((registration) => (
            registration.Empid == empId && (
              <span onClick={handleToggleImagePreview}>
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
              </span>
            )
          ))}<br />
          {userData && (
            <>
              <div style={{ display: 'flex', flexDirection: 'row' }}>
                <div>
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
          <Button onClick={handleCloseProfileCard} style={{ backgroundColor: "#00aaee", color: "white ", fontWeight: 'bolder', marginBottom: '15px', marginRight: '15px' }}>
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
    </>
  );
};

export default ButtonCenter;
