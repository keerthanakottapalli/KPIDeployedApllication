import React, { useState, useEffect } from 'react';
import './Sidebar.css';
import { AppBar, Toolbar, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { IconButton, Box, DialogTitle, Dialog, DialogContentText, DialogContent, DialogActions, Menu, Tooltip, MenuItem, ListItemIcon, } from '@mui/material';
import { Tabs, Tab } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import { BASE_URL } from './config';
import { Logout } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
    // const tabs = [
    //     'Value Creator',
    //     'People Developer',
    //     'Business Operator',
    //     'Management Activities',
    //     'Digital Practices'
    // ];


    let xhr = new XMLHttpRequest();
    let data;

    xhr.open("GET", `${BASE_URL}/admin/manager_data`, false);
    xhr.send();

    if (xhr.status === 200) {
        data = JSON.parse(xhr.responseText);
    } else {
        console.error("There was a problem with the request");
    }

    // Create an object to hold the transformed data
    const subTabsData = {};

    // Iterate through the fetched data
    for (const key in data) {
        if (Object.hasOwnProperty.call(data, key)) {
            const originalArray = data[key];

            // Create an array to hold the sub-tab data
            const subTabArray = [];

            for (const item of originalArray) {
                const subTabData = {
                    name: item.Name,
                    questions: item.Questions,
                    quantityTargets: item.QuantityTarget,
                };

                subTabArray.push(subTabData);
            }

            // Assign the sub-tab data to the corresponding key in subTabsData
            subTabsData[key] = subTabArray;
        }
    }

    console.log(subTabsData);
    let tabs = Object.keys(subTabsData)


    // const [tabsData, setTabsData] = useState({});
    const [activeTab, setActiveTab] = useState(tabs[0]);
    const [subTabKeys, setSubTabKeys] = useState([]); // New state for sub-tab keys
    // const [activeSubTab, setActiveSubTab] = useState('');

    const [tabsData, setTabsData] = useState([]);
    const [activeSubTab, setActiveSubTab] = useState('');
    const [loading, setLoading] = useState(true);
    const [anchorElNav, setAnchorElNav] = React.useState(null);
    const [anchorElUser, setAnchorElUser] = React.useState(null);
    const [isProfileCardOpen, setIsProfileCardOpen] = useState(false);
    const [userData, setUserData] = useState(null); // State to store user data
    const [registrations, setRegistrations] = useState([]);
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [showImagePreview, setShowImagePreview] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [error, setError] = useState(false);

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

    const navigate = useNavigate()
const goBack = ()=>{
    navigate('/mview')
}


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
        const fetchData = async () => {
            const token = localStorage.getItem('token');

            const parseJWT = (token) => {
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const decodedData = JSON.parse(atob(base64));
                return decodedData;
            };

            if (token) {
                const tokenData = parseJWT(token);
                const empId = tokenData.Empid;

                try {
                    const response = await fetch(`${BASE_URL}/api/manager_data/${empId}/${activeTab}`);
                    const data = await response.json();
                    setTabsData(data.data);
                    const savedTabsData = localStorage.getItem('tabsData');

                    if (savedTabsData) {
                        setTabsData(JSON.parse(savedTabsData));
                    }

                    // Extract sub-tab keys from the data response
                    if (data.data) {
                        const subTabKeys = data.data.map(item => item.Name); // Use "Name" field as sub-tab key
                        console.log('Sub Tab Keys:', subTabKeys);
                        setSubTabKeys(subTabKeys);
                        setActiveSubTab(subTabKeys[0]); // Set the first sub-tab as active by default
                        handleSubTabClick(subTabKeys[0]); // Fetch and display data for the first sub-tab
                    }
                } catch (error) {
                    console.error('Error fetching data:', error);
                }
            }
        };

        fetchData();
    }, [activeTab]);

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    const handleSubTabClick = async (subTab) => {
        setLoading(true);
        const token = localStorage.getItem('token');

        console.log('Active Tab:', activeTab);
        console.log('Active Sub-Tab:', subTab);

        setActiveSubTab(subTab);
        const parseJWT = (token) => {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const decodedData = JSON.parse(atob(base64));
            return decodedData;
        };

        if (token) {
            const tokenData = parseJWT(token);
            const empId = tokenData.Empid;

            try {
                const response = await fetch(`${BASE_URL}/api/manager_data/${empId}/${activeTab}/${subTab}`);
                const data = await response.json();

                if (data.data && data.data.length > 0) {
                    // Use the first item's "Data" array as the tabsData
                    const mappedData = data.data[0].Data;
                    console.log('Mapped Data:', mappedData);
                    setTabsData(mappedData);
                } else {
                    console.error('Data for sub-tab not found:', subTab);
                    setTabsData([]); // Handle empty data or show an error message
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                // Delay setting loading to false by 3 seconds
                
                    setLoading(false);
               
            }
        }
    };


    const handleClose = () => {
        setOpenDialog(false);

    };

    const hasEmptyFields = () => {
        return tabsData.some((item) =>
            !item.Metric || item.QuantityAchieved === '' || !item.Comments || item.IndexKpi === ''
        );
    };
    // Event handler for input fields to update error state
    const handleFieldChange = () => {
        setError(hasEmptyFields());
    };

    const handleSubTabUpdate = async () => {
        const token = localStorage.getItem('token');

        if (hasEmptyFields()) { // Invoke the function with ()
            setError(true); // Set the error state to true
            return; // Do not proceed with the update if there are empty fields.
        }

        const parseJWT = (token) => {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const decodedData = JSON.parse(atob(base64));
            return decodedData;
        };

        if (token) {
            const tokenData = parseJWT(token);
            const empId = tokenData.Empid;
            try {
                const updatedData = {
                    Data: tabsData.map(item => ({
                        Metric: item.Metric,
                        QuantityTarget: item.QuantityTarget,
                        QuantityAchieved: item.QuantityAchieved,
                        IndexKpi: item.IndexKpi,
                        Comments: item.Comments,
                        ManagerRating: item.ManagerRating,
                        ManagerComments: item.ManagerComments,
                    })),
                };

                const response = await fetch(`${BASE_URL}/api/manager_upd/${empId}/${activeTab}/${activeSubTab}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updatedData),
                });

                if (response.ok) {
                    setOpenDialog(true);
                    console.log('Data updated successfully');
                } else {
                    console.error('Failed to update data');
                }
            } catch (error) {
                console.error('Error updating data:', error);
            }
        }
    };



    const handleLogout = () => {

        navigate('/login')
    };

    const empId = localStorage.getItem('Empid');
    const firstname = localStorage.getItem('firstname');
    const lastname = localStorage.getItem('lastname');
    const username = firstname + " " + lastname


    const ratings = Array.from({ length: 11 }, (_, i) => i);

    const handleQuantityAchievedChange = (index, newValue) => {
        const updatedTabsData = [...tabsData];
        updatedTabsData[index].QuantityAchieved = newValue;
        setTabsData(updatedTabsData);

        // Save the updated state in localStorage
        localStorage.setItem('tabsData', JSON.stringify(updatedTabsData));
    };
    const handleIndexKpiChange = (index, newValue) => {
        const updatedTabsData = [...tabsData];
        updatedTabsData[index].IndexKpi = newValue;
        setTabsData(updatedTabsData);

        // Save the updated state in localStorage
        localStorage.setItem('tabsData', JSON.stringify(updatedTabsData));
    };

    const handleCommentsChange = (index, newValue) => {
        const updatedTabsData = [...tabsData];
        updatedTabsData[index].Comments = newValue;
        setTabsData(updatedTabsData);
    };

    const mainpage = () => {
        navigate('/')
      }

    return (
        <>
            <div className="page-container">
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

                <div className="content-container">

                    <div className="sidebar ">
                        <div className="tabs">
                            {tabs.map((tab) => (
                                <div
                                    key={tab}
                                    className={`tab ${activeTab === tab ? 'active' : ''}`}
                                    onClick={() => handleTabClick(tab)}
                                >
                                    <br />
                                    {/* <span className="star-icon">&#9733;</span> */}
                                    {tab}
                                </div>
                            ))}
                        </div>
                    </div>


                    <div className="sub-tabs" >
                        
                    <ListItemIcon style={{marginLeft:'15vw', marginTop:'35px', cursor:'pointer'}} onClick={goBack}>
                                    <ArrowBackIcon />&nbsp; <span><b>Go Back</b></span>   
                                </ListItemIcon>
                                GoBack
                        <Tabs className='subtabs-adjust'
                            value={activeSubTab}
                            onChange={(event, newValue) => handleSubTabClick(newValue)} centered
                            variant="scrollable" scrollButtons="auto"
                        >
                            {subTabKeys.map((subTab, index) => (
                                !loading && (
                                    <Tab className='subtabs-tabs'
                                        key={index}
                                        label={subTab}
                                        value={subTab}
                                        style={{ fontWeight: 'bold', fontSize: '100%', marginRight: '20px' }} variant="scrollable" scrollButtons="auto"
                                    />
                                )
                            ))}
                        </Tabs>
                       
                            
                          
                        <div className='employeetable' style={{marginTop:'60px'}}>
                            {loading ? (
                                <div className="loading-container">
                                    <div className="loading-text">Loading...</div>
                                    <div className="loading-spinner"></div>
                                </div>


                            ) : activeSubTab && tabsData.length > 0 ? (

                                <TableContainer component={Paper} style={{ width: '1250px', overflow: 'auto' }} >
                                    <Table>
                                        <TableHead>
                                            <TableRow style={{ backgroundColor: '#d0e6f5' }}>
                                                <TableCell className='tablecell-style' style={{  fontWeight: "bold", fontFamily: 'Open Sans,sans-serif!important', fontSize:'16px'  }}>Metric</TableCell>
                                                <TableCell className='tablecell-style1' style={{ fontWeight: "bold", fontFamily: 'Open Sans,sans-serif!important', textAlign: 'center', fontSize:'16px'  }}>Quantity Target</TableCell>
                                                <TableCell className='tablecell-style2' style={{ fontWeight: "bold", fontFamily: 'Open Sans,sans-serif!important', textAlign: 'center',fontSize:'16px'  }}>Quantity Achieved</TableCell>
                                                <TableCell className='tablecell-style3' style={{ fontWeight: "bold", fontFamily: 'Open Sans,sans-serif!important', textAlign: 'center',fontSize:'16px'  }}>Comments</TableCell>
                                                <TableCell className='tablecell-style4' style={{ fontWeight: "bold", fontFamily: 'Open Sans,sans-serif!important', textAlign: 'center', fontSize:'16px'  }}>Index KPI</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {tabsData.map((item, index) => (
                                                <TableRow key={index}>
                                                    <TableCell style={{fontFamily: 'Open Sans,sans-serif!important' }}>{item.Metric}</TableCell>
                                                    <TableCell style={{ textAlign: 'center' }}>{item.QuantityTarget}</TableCell>
                                                    <TableCell style={{ textAlign: 'center' }}> {item.QuantityAchieved}</TableCell>
                                                    <TableCell style={{ textAlign: 'center' }}> {item.Comments} </TableCell>
                                                    <TableCell style={{ textAlign: 'center' }}>{item.IndexKpi} </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>

                                    </Table>

                                </TableContainer>

                            ) : (
                                <div className="message-box">
                                    <div className="no-data-message">
                                        No data available.
                                    </div>
                                </div>
                            )}



                        </div>
                        <Dialog open={error} onClose={() => setError(false)}>
                            <DialogContent style={{ width: '420px' }}>
                                <DialogContentText style={{ fontSize: '18px', marginLeft: '10%', fontWeight: 'bold', color: 'black' }}>
                                    Empty fields can't be updated.
                                </DialogContentText>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={() => setError(false)} style={{ backgroundColor: "#00aaee", color: "white " }}>
                                  <b>OK</b>  
                                </Button>
                            </DialogActions>
                        </Dialog>
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
                        <div style={{ marginLeft: "114%", }}>
                            <Dialog open={openDialog} onClose={handleClose}>
                                <DialogContent style={{ width: '420px' }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <img src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQei9oRhpKFTpI-R1V4z01fnLWzuZRA58w2Xw&usqp=CAU' alt='not found' />
                                    </div>

                                    <DialogContentText style={{ fontSize: '18px', textAlign: 'center', fontWeight: 'bold', color: 'black' }}>
                                        Fields Updated Successfully.
                                    </DialogContentText>
                                </DialogContent>
                                <DialogActions>
                                    <Button onClick={handleClose} color="primary">
                                       <b>OK</b> 
                                    </Button>
                                </DialogActions>
                            </Dialog>

                        </div>
                    </div>
                </div>
            </div>
        </>

    );
};

export default Sidebar;
