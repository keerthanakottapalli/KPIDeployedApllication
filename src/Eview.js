import React from 'react';
import './ButtonCenter.css'; // Create a CSS file for styling
import { AppBar, Toolbar, Typography, IconButton, Box, Button, DialogTitle, Dialog, DialogContentText, DialogContent, DialogActions, Menu, Tooltip, MenuItem, ListItemIcon, } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import CloseIcon from '@mui/icons-material/Close';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import ChangePassword from './ChangePassword';
import { BASE_URL } from './config';


const ButtonCenter = () => {

  const navigate = useNavigate(); // Initialize useNavigate
  const [empIdExists, setEmpIdExists] = useState(false);
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

  const [isHovering, setIsHovering] = useState(false);
  const [isHovering1, setIsHovering1] = useState(false);
  const [isHovering2, setIsHovering2] = useState(false);
  const empId = localStorage.getItem('Empid');
  console.log(empId, "44");


  const handleLogout = () => {

    localStorage.removeItem('token');

    navigate('/login')
  };


  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  const handleMouseEnter1 = () => {
    setIsHovering1(true);

  };
  const handleMouseLeave1 = () => {
    setIsHovering1(false);
  };

  const handleMouseEnter2 = () => {
    setIsHovering2(true);

  };
  const handleMouseLeave2 = () => {
    setIsHovering2(false);
  };
  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleChangePassword = () => {
    setShowChangePassword(true);
    handleCloseUserMenu();
  };
  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleOpenProfileCard = async () => {
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
      const response = await fetch(`${BASE_URL}/api/emp_all_data`);
      const data = await response.json();

      // Check if empid from localStorage matches any of the Empid in the fetched data
      const isEmpidExists = data.employees.some((employee) => employee.Empid === parseInt(empid));

      if (!isEmpidExists) {
        // If empid exists, navigate to the form
        navigate('/eform');
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
        const firstnames = data.message.map(item => item.Empid);

      } catch (error) {
        console.error('Error:', error.message);
      }
    };

    fetchRegistrations();
  }, []);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    setSelectedImage(file);
    handleCloseUserMenu();
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

  const handleViewDetailsClick = () => {
    // Handle Fill KPI Form button click
    navigate(`/eget/${empid}`); // Navigate to the 'mform' route
  };

  const handleUpdateDetailsClick = () => {
    // Handle Fill KPI Form button click
    navigate(`/eUpdate/${empid}`);
  };

  const firstname = localStorage.getItem('firstname');
  const lastname = localStorage.getItem('lastname');
  const username = firstname + " " + lastname
  const empid = localStorage.getItem('Empid');

  const [isButtonDisabled, setIsButtonDisabled] = useState(true);


  useEffect(() => {
    // Make a GET request to the specified URL
    fetch(`${BASE_URL}/api/emp_all_status_data`)
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

          <img style={{ width: '60px', borderRadius: '50%', height: '60px' }} onClick={mainpage} src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ53srYmkaJxsUelVmnAHahYnnqjJ_dT-TiUA&usqp=CAU' alt='not found' />

          <div className="userInfo">
            <Typography variant="h6" className="welcome-text">
              Hey, Welcome
            </Typography>
            <h3 className="userName-Style">{username.toUpperCase()}</h3>
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


              {registrations.map((registration) => {
                if (registration.Empid == empId) {
                  console.log(registrations, "registrations");
                  console.log('Registration found for Empid:', empId);
                  return (
                    <td key={registration.Empid}>
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
                  );
                } else {
                  console.log('No registration found for Empid:', empId);
                  return null;
                }
              })}


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
                    <CameraAltIcon fontSize="small" /> {/* Add the CameraAltIcon */}
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
                ResetPassword
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
          style={{ position: 'absolute', right: '34vw', bottom: '73vh', margin: '8px' }}
        >
          <CloseIcon style={{ color: 'red' }} />
        </IconButton>
      )}

      {showChangePassword ? (

        <ChangePassword />

      ) : (

        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#c6e2ff', textAlign: 'center' }}>
          <div className="image-container" style={{ flex: 1 }}>
            <img
              src="https://empxtrack.com/wp-content/uploads/2021/03/employee-performance-appraisal-software.png"
              alt="Your Image Alt Text"
              style={{ height: '50%', width: '100%' }}
            />
          </div>
          <div className="button-center-container" style={{ flex: 1 }}>
            <div className='Paragraph-division'>
              <div style={{ textAlign: 'center' }}>
                <Tooltip   title="Click to fill KPI Form" arrow>
                  <Button
                    style={{ backgroundColor: isHovering ? '#db764f' : '#d95623' }}
                    className="kpi-form"
                    variant="contained"
                    onClick={handleFillFormClick}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  >
                    <b>Fill KPI Form</b>
                  </Button>
                </Tooltip>
                <Tooltip title="Click to view your KPI Details" arrow>
                <Button style={{ backgroundColor: isHovering1 ? '#db764f' : '#d95623', marginLeft: '20px' }}
                  className="view-details" variant="contained"
                  onClick={handleViewDetailsClick}
                  onMouseEnter={handleMouseEnter1}
                  onMouseLeave={handleMouseLeave1}
                >
                  <b>My KPI Details</b>
                </Button>
                </Tooltip>
                <Tooltip title="Click to update your KPI Details" arrow>
                <Button
                  style={{
                    backgroundColor: isHovering2 ? '#db764f' : '#d95623',
                    marginLeft: '20px',
                    ...(isButtonDisabled && { backgroundColor: '#e8a287' }),
                  }}
                  className="view-details"
                  variant="contained"
                  onClick={handleUpdateDetailsClick}
                  onMouseEnter={handleMouseEnter2}
                  onMouseLeave={handleMouseLeave2}
                  disabled={isButtonDisabled}
                >
                  <b>Update Details</b>
                </Button>
                </Tooltip>
              </div>
            </div>
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} >
              <DialogContent style={{ width: '420px' }}>
                <img
                  src="https://badge-exam.miraclesoft.com/assets/ecert/Completed-test.svg"
                  alt="Your Image Alt Text"
                  style={{ maxWidth: '100%', maxHeight: '200px', display: 'block', margin: 'auto' }}
                />
                <DialogContentText style={{ fontSize: '18px', textAlign: 'center', fontWeight: 'bold', color: 'red' }}>
                  You have already submitted the form.
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button variant='contained' onClick={() => setOpenDialog(false)} style={{ backgroundColor: '#00aaee', marginBottom: '10px', marginRight: '10px' }}>
                  <b>OK</b>
                </Button>
              </DialogActions>
            </Dialog>
          </div>



        </div>
      )}
      <Dialog
        open={isProfileCardOpen}
        onClose={handleCloseProfileCard}

      >
        <DialogTitle style={{ textAlign: 'center', fontSize: '24px', fontWeight: 'bolder' }}>Profile Details</DialogTitle>
        <DialogContent style={{ height: '400px', }}>
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
          ))}<br /><br />
          {userData && (
            <>
              <div style={{ display: 'flex', flexDirection: 'row' }}>
                <div style={{}}>
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
          <Button variant='contained' onClick={handleCloseProfileCard} style={{ backgroundColor: "#00aaee", color: "white", marginBottom: '15px', marginRight: '15px' }}>
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
