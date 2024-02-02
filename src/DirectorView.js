import React from 'react';
import './DirectorView.css'; // Create a CSS file for styling
import { AppBar, Toolbar, Typography, IconButton, Box, Button, DialogTitle, Dialog, DialogContentText, DialogContent, DialogActions, Menu, Tooltip, MenuItem, ListItemIcon, } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import CloseIcon from '@mui/icons-material/Close';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { useEffect, useState } from 'react';
import ChangePassword from './ChangePassword';
import { BASE_URL } from './config';





// const empid = localStorage.getItem('Empid');

const Dview = () => {

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
  

  const handleFillFormClick = async () => {
    const empIdExistsInAPI = empIdExists; // Use the value from state
    try {
      // Fetch the data from the endpoint
      const response = await fetch(`${BASE_URL}/api/director_all_data`);
      const data = await response.json();

      // Check if empid from localStorage matches any of the Empid in the fetched data
      const isEmpidExists = data.employees.some((employee) => employee.Empid === parseInt(empid));

      if (!isEmpidExists) {
        // If empid exists, navigate to the form
        navigate('/directorForm');
      } else {
        // If empid does not exist, open the dialog
        setOpenDialog(true);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  const handleGetFormClick = () => {

    navigate(`/directorFormDetails/${empid}`)
  }

  const handleFormUpdateDetailsClick = () => {
    // Handle Fill KPI Form button click
    navigate(`/directorUpdateDetails/${empid}`); // Navigate to the 'mform' route
  };
  useEffect(() => {
    // Make a GET request to the specified URL
    fetch(`${BASE_URL}/api/director_all_status_data`)
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
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);



  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };
  const handleChangePassword = () => {
    setShowChangePassword(true);
    handleCloseUserMenu();
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
        console.log(userData);
        // setUserData(userData); 
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

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    setSelectedImage(file);

    if (file) {
      // Create a FormData object to send the file and Empmail
      const formData = new FormData();
      formData.append('Empmail', Empmail); // Use the key 'Empmail'
      formData.append('Image', file); // Use the key 'Image'

      try {
        const response = await fetch(`${BASE_URL}/api/emp_image_upd/${firstname}/${lastname}`, {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          // Image uploaded successfully, you can show a success message
          console.log('Image uploaded successfully');
          window.location.reload();
          // You may want to refresh the user's profile image
        } else {
          // Handle the error (show an error message, etc.)
          console.error('Image upload failed');
        }
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }
  };




  const empid = localStorage.getItem('Empid');

  const handleViewDetailsClick = () => {
    // Handle Fill KPI Form button click
    navigate('/meview'); // Navigate to the 'mform' route
  };
  const handleFormViewDetailsClick = () => {
    // Handle Fill KPI Form button click
    navigate(`/directorportal`); // Navigate to the 'mform' route
  };

  const empId = localStorage.getItem('Empid');
  const firstname = localStorage.getItem('firstname');
  const lastname = localStorage.getItem('lastname');
  const username = firstname + " " + lastname
  const firstnames = registrations.map((registration) => registration.Firstname);


  const mainpage = () => {
    window.location.href = 'http://172.17.15.253:3002';
  }

  return (


    <>

      <AppBar position="fixed">
        <Toolbar className="director-Navbar">
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
                    style={{ marginLeft: '63%', marginBottom: '-22%', }}
                >
                    <CloseIcon style={{ color: 'red', }} />
                </IconButton>
            )}
            {showChangePassword ? (

                <ChangePassword />

            ) : (
          <div style={{ display: 'flex' }}>
            <div style={{
              flex: '70%',
              backgroundColor: '#00aaee',
              backgroundImage: `url('https://hubble.miraclesoft.com/assets/img/bg-login.jpg')`,
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat',
              opacity: '0.85',
              height: '100vh'

            }}>
              <p style={{ color: 'white', marginTop: '48%', fontFamily: 'sans-serif', marginLeft: '18px', fontSize: '30px' }}>Metrics -  Director Portal for </p>
              <p style={{ color: 'white', fontFamily: 'sans-serif', marginLeft: '18px', fontSize: '28px', marginTop: '-2%' }}>Key Performance Indicator </p>
              <p style={{ color: 'white', fontFamily: 'sans-serif', marginLeft: '18px', fontSize: '28px', marginTop: '-2%' }}>Management System </p>
              <footer>
                <p class="text-center" style={{ color: '#ffffff', fontSize: '13px', lineHeight: '20px', marginLeft: '1.5%', marginTop: '-1%' }} >&copy; 2024 Miracle Software Systems, Inc.</p>
              </footer>
            </div>
            <div style={{ flex: '30%' }}>
              <img
                src="https://static.vecteezy.com/system/resources/thumbnails/010/235/686/small/shaking-hands-of-business-partners-illustration-template-for-banner-or-infographics-illustration-free-vector.jpg"
                alt="Your Image Alt Text"
                style={{ height: '50%', alignItems: 'center', marginLeft: '70px', marginTop: '20%' }}
              />

              <div style={{marginLeft:'80px'}}>
                <Button
                  className="gradient-button"
                  variant="contained"
                  onClick={handleFillFormClick}
                  style={{ backgroundColor: '#0d416b', marginRight: '50px', flex: 1, width: '40%' }}
                >
                  <b>Fill KPI Form</b>
                </Button>
                <Button
                  className="gradient-button"
                  variant="contained"
                  onClick={handleGetFormClick}
                  style={{ backgroundColor: '#1dbb99', flex: 1, width: '40%' }}
                >
                  <b>My KPI Details</b>
                </Button>
              </div>
              <div style={{ marginBottom: '25px' }}></div>
              <div style={{marginLeft:'80px'}}>
                <Button
                  style={{ backgroundColor: '#1dbb99', marginRight: '50px', flex: 1, width: '40%', ...(isButtonDisabled && { backgroundColor: '#b4d6cf' }), }}
                  className="view-details"
                  variant="contained"
                  onClick={handleFormUpdateDetailsClick}
                  disabled={isButtonDisabled}
                >
                  <b>Update Details</b>
                </Button>
                <Button
                  style={{ backgroundColor: '#0d416b', flex: 1, width: '40%' }}
                  className="view-details"
                  variant="contained"
                  onClick={handleFormViewDetailsClick}
                >
                  <b>Manager Details</b>
                </Button>
              </div>



            </div>
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} >
              <DialogContent style={{ width: '420px' }}>
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
                <Button onClick={() => setOpenDialog(false)} style={{backgroundColor:"#00aaee",color:"white ", marginBottom:'10px', marginRight:'10px'}}>
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
        maxWidth="sm" // Sets the maximum width of the dialog
      >
        <DialogTitle style={{ marginLeft: '33%', fontSize: '24px', fontWeight: 'bolder' }}>Profile Details</DialogTitle>
        <DialogContent style={{ height: '400px' }}>
          {/* Display user profile information */}
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
          <Button onClick={handleCloseProfileCard} style={{backgroundColor:"#00aaee",color:"white ", marginBottom:'15px', marginRight:'15px'}}>
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

export default Dview;