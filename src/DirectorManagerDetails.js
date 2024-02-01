import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DirectorManagerDetails.css';
import { IconButton, Box, DialogTitle, Dialog, DialogContentText, DialogContent, DialogActions, Menu, Tooltip, MenuItem, ListItemIcon, } from '@mui/material';
import Button from '@mui/material/Button';
import { useParams } from 'react-router-dom';
import { AppBar, Toolbar, Typography } from '@mui/material';
import { BASE_URL } from './config';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Logout } from '@mui/icons-material';



function CollapsibleSection({ icon, title, items, isExpanded, onItemClick, redItems, toggleExpanded }) {
    const handleTitleClick = () => {
        if (items.length > 0) {
            onItemClick(items[0]);
        }
    };

    return (
        <div className="collapsible-section">
            <div className={`sidenav-item ${isExpanded ? 'expanded' : ''}`} onClick={handleTitleClick}>

                {title}
            </div>
            {isExpanded && (
                <ul className="sub-items">
                    {items.map((item, index) => (
                        <li key={index} onClick={() => onItemClick(item)}>{item}</li>
                    ))}
                </ul>
            )}
        </div>
    );
}





function DirectorUpdateManagerData() {
    const [sections, setSections] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [tableData, setTableData] = useState([]);
    //   const empId = localStorage.getItem('Empid');
    const firstname = localStorage.getItem('firstname');
    const [loading, setLoading] = useState(true);
    const [anchorElNav, setAnchorElNav] = React.useState(null);
    const [anchorElUser, setAnchorElUser] = React.useState(null);
    const [isProfileCardOpen, setIsProfileCardOpen] = useState(false);
    const [userData, setUserData] = useState(null); // State to store user data
    const [registrations, setRegistrations] = useState([]);
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [showImagePreview, setShowImagePreview] = useState(false);
    const [noDataErrorMessage, setNoDataErrorMessage] = useState();


    const [employeesData, setEmployeesData] = useState([]);
    const [reportingManagers, setReportingManagers] = useState({});

    const navigate = useNavigate();


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
        fetch(`${BASE_URL}/api/manager_all_data`)
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


    const { empId } = useParams();


    const [selectedSectionIndex, setSelectedSectionIndex] = useState(0); // Initialize with the first section

    useEffect(() => {
        if (sections.length > 0) {
            const selectedSection = sections[selectedSectionIndex];
            if (selectedSection && selectedSection.items.length > 0) {
                handleItemClick(selectedSection.items[0]);
            }
        }
    }, [sections, selectedSectionIndex]);


    useEffect(() => {
        fetchInitialSections();
    }, []);



    const fetchInitialSections = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/admin/manager_data`);
            const apiData = response.data;

            const formattedData = Object.keys(apiData).map(sectionTitle => ({
                title: sectionTitle,
                items: apiData[sectionTitle].map(subItem => subItem.Name),
                // questions: apiData[sectionTitle].map(subItem => subItem.Questions),
                questions: apiData[sectionTitle][0].Questions,
                quantityTargets: apiData[sectionTitle][0].QuantityTarget,
                isExpanded: false
            }));

            formattedData[0].isExpanded = true;

            setSections(formattedData);
        } catch (error) {
            console.error(error);
            setSections([]);
        }
    };





    const handleSectionClick = async (index) => {



        setSelectedSectionIndex(index); // Set the selected section index
        const selectedSection = sections[index];

        const updatedSections = sections.map((section, i) => ({
            ...section,
            isExpanded: i === index ? !section.isExpanded : false,
        }));
        setSections(updatedSections);

        // Find the first item in the expanded section and trigger its click
        const firstItem = sections[index].items[0];
        setSelectedItem(firstItem);
        handleItemClick(firstItem);
    };






    //   const firstname = localStorage.getItem('firstname');
    const lastname = localStorage.getItem('lastname');
    const username = firstname + " " + lastname
    const handleLogout = () => {
        // localStorage.removeItem('form_data');
        localStorage.removeItem('practices');
        // Redirect to the login page (replace '/login' with your login route)
        navigate('/login')
    };


    const selectedTitle = sections.find((section) => section.isExpanded)?.title || '';




    const [metricInputData, setMetricInputData] = useState({});
    const [itemInputData, setItemInputData] = useState({});

    const [itemMetricInputData, setItemMetricInputData] = useState({});
    const [isSubmitEnabled, setIsSubmitEnabled] = useState(false);

    const areAllItemsFilled = () => {
        for (const section of sections) {
            for (const item of section.items) {
                const itemData = itemMetricInputData[item];
                if (!itemData) {
                    return false; // If data for this item doesn't exist, it's not filled
                }
                for (const metricKey of Object.keys(itemData)) {
                    const metricData = itemData[metricKey];
                    if (
                        metricData.DRating === null ||
                        metricData.PrasadKComments.trim() === ''
                    ) {
                        return false; // If any field is not filled, it's not filled
                    }
                }
            }
        }
        return true; // All items are filled
    };

    useEffect(() => {
        const isSubmitEnabled = areAllItemsFilled();
        setIsSubmitEnabled(isSubmitEnabled);
    }, [itemMetricInputData]);


    const handleItemClick = async (item) => {


        setLoading(true);
        setSelectedItem(item);
        try {
            const response = await axios.get(`${BASE_URL}/api/manager_director_data/${empId}/${selectedTitle}/${item}`);
            const responseData = response.data.data[0]; // Assuming there's only one item in the array



            if (responseData) {
                // Handle existing data from EmployeeManagerDataKPIGet
                const newItemMetricInputData = { ...itemMetricInputData };
                if (!newItemMetricInputData[item]) {
                    newItemMetricInputData[item] = {};
                }

                responseData.Data.forEach(metricData => {
                    if (!newItemMetricInputData[item][metricData.Metric]) {
                        newItemMetricInputData[item][metricData.Metric] = {
                            DRating: metricData.DirectorRating,
                            PrasadKComments: metricData.DirectorComments,
                            QuantityTarget: metricData.QuantityTarget || 0,
                            QuantityAchieved: metricData.QuantityAchieved || 0,
                            IndexKpi: metricData.IndexKpi || 0,
                            Comments: metricData.Comments || '',
                        };
                    }
                });

                setItemMetricInputData(newItemMetricInputData);
                setTableData(responseData.Data);
            } else {
                // Data doesn't exist in EmployeeManagerDataKPIGet, fetch from EmployeeDataKPIGet
                try {
                    const newDataResponse = await axios.get(`${BASE_URL}/api/manager_data/${empId}/${selectedTitle}/${item}`);
                    const newData = newDataResponse.data.data[0]; // Assuming there's only one item in the array

                    if (newData) {
                        // Handle data from EmployeeDataKPIGet
                        const newItemMetricInputData = { ...itemMetricInputData };
                        if (!newItemMetricInputData[item]) {
                            newItemMetricInputData[item] = {};
                        }

                        newData.Data.forEach(metricData => {
                            if (!newItemMetricInputData[item][metricData.Metric]) {
                                newItemMetricInputData[item][metricData.Metric] = {
                                    DRating: '',
                                    PrasadKComments: '',
                                    QuantityTarget: metricData.QuantityTarget || 0,
                                    QuantityAchieved: metricData.QuantityAchieved || 0,
                                    IndexKpi: metricData.IndexKpi || 0,
                                    Comments: metricData.Comments || '',
                                };
                            }
                        });

                        setItemMetricInputData(newItemMetricInputData);
                        setTableData(newData.Data);
                    } else {
                        setTableData([]);
                    }
                } catch (error) {
                    console.error(error);
                    setTableData([]);
                }
            }
        } catch (error) {
            console.error(error);
            setTableData([]);
        }
        finally {
            // Delay setting loading to false by 3 seconds
            setTimeout(() => {
                setLoading(false);
            });
        }
    };





    const itemHasMissingValues = (item) => {
        const itemData = itemMetricInputData[item];
        if (!itemData) {
            return true; // If data for this item doesn't exist, it's missing
        }

        const missingItems = [];

        for (const metricKey of Object.keys(itemData)) {
            const metricData = itemData[metricKey];
            if (metricData.DRating === null || metricData.PrasadKComments.trim() === '') {
                missingItems.push({
                    childTab: item,
                    childTabDetails: itemData,
                    chilTabInputFields: metricData,
                });
            }
        }

        if (missingItems.length > 0) {
            console.log(missingItems, "Items with missing data");
            return true; // If any item has missing data, return true
        }

        return false; // All values are filled for this item
    };




    useEffect(() => {
        fetchData();
    }, [selectedItem]);





    const fetchData = async () => {

        if (!empId) return; // No need to fetch data if empId is not available

        try {
            let response;
            let responseData;
            try {
                response = await axios.get(`${BASE_URL}/api/manager_director_data/${empId}/${selectedTitle}/${selectedItem}`);
                responseData = response.data.data[0];
            } catch (error) {
                try {
                    response = await axios.get(`${BASE_URL}/api/manager_data/${empId}/${selectedTitle}/${selectedItem}`);
                    responseData = response.data.data[0];
                } catch (error) {
                    responseData = null;
                }
            }

            if (responseData) {
                const newItemMetricInputData = { ...itemMetricInputData };
                if (!newItemMetricInputData[selectedItem]) {
                    newItemMetricInputData[selectedItem] = {};
                }

                responseData.Data.forEach(metricData => {
                    if (!newItemMetricInputData[selectedItem][metricData.Metric]) {
                        newItemMetricInputData[selectedItem][metricData.Metric] = {
                            DRating: metricData.DirectorRating !== 0 ? metricData.DirectorRating : 0,
                            PrasadKComments: metricData.DirectorComments || '',
                            QuantityTarget: metricData.QuantityTarget || 0,
                            QuantityAchieved: metricData.QuantityAchieved || 0,
                            IndexKpi: metricData.IndexKpi || 0,
                            Comments: metricData.Comments || '',
                        };
                    }
                });

                setItemMetricInputData(newItemMetricInputData);
                setTableData(responseData.Data);
                console.log(responseData.Data, 'responseData.Data');
            } else {
                setTableData([]);
            }
        } catch (error) {
            console.error(error);
            setTableData([]);
        }
    };


    const handleMRatingChange = (item, metric, value) => {

        setItemMetricInputData(prevData => ({
            ...prevData,
            [item]: {
                ...prevData[item],
                [metric]: {
                    ...prevData[item]?.[metric],
                    DRating: value,
                }
            }
        }));

        // Update tableData with the new MRating value
        setTableData(prevTableData => {
            const updatedTableData = prevTableData.map(row => {
                if (row.Metric === metric) {
                    return {
                        ...row,
                        DirectorRating: value,
                    };
                }
                return row;
            });
            return updatedTableData;
        });
    };

    const handleCommentsChange = (item, metric, value) => {
        // if (!value) {
        //     setError('Comments cannot be empty');
        // } else {
        //     setError(null); // Reset the error if the comment is not empty.
        // }
        setItemMetricInputData(prevData => ({
            ...prevData,
            [item]: {
                ...prevData[item],
                [metric]: {
                    ...prevData[item]?.[metric],
                    PrasadKComments: value,
                }
            }
        }));

        // Update tableData with the new Comments value
        setTableData(prevTableData => {
            const updatedTableData = prevTableData.map(row => {
                if (row.Metric === metric) {
                    return {
                        ...row,
                        DirectorComments: value,
                    };
                }
                return row;
            });
            return updatedTableData;
        });
    };


    const [isConfirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
    const [isSuccessDialogOpen, setSuccessDialogOpen] = useState(false);

    const openConfirmationDialog = () => {
        setConfirmationDialogOpen(true);
    };
    const closeConfirmationDialog = () => {
        setConfirmationDialogOpen(false);
    };
    const closeSuccessDialog = () => {
        setSuccessDialogOpen(false);
        window.location.reload();
    };

    const handleSubmit = async () => {
        // Close the confirmation dialog
        setConfirmationDialogOpen(false);

        if (selectedItem) {
            const postData = [{
                Empid: empId,
                Empname: firstname, // You can replace this with the actual employee name
                data: sections.map((section) => ({
                    Value: section.title,
                    valuecreater: section.items.map((item) => ({
                        name: item,
                        questions: Object.entries(itemMetricInputData[item] || {}).map(([metricKey, metricData]) => ({
                            Metric: metricKey,
                            QuantityTarget: metricData.QuantityTarget || 0,
                            QuantityAchieved: metricData.QuantityAchieved || 0,
                            IndexKpi: metricData.IndexKpi || 0,
                            Comments: metricData.Comments || '',
                            DirectorRating: metricData.DRating || 0,
                            DirectorComments: metricData.PrasadKComments || '',
                        })),
                    })),
                })),
            }];

            try {
                const response = await axios.post(`${BASE_URL}/api/manager_director_insrt`, JSON.stringify(postData), {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                console.log('Data successfully posted:', response.data);
                // You can handle success messages or other actions here
                closeConfirmationDialog();
                // You can handle success messages or other actions here
                setSuccessDialogOpen(true); // Open the success dialog
            } catch (error) {
                console.error('Error posting data:', error);
                // Handle error messages or other actions here
            }
        }
    };

    const [isNavVisible, setNavVisible] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth <= 768) {
                setNavVisible(false);
            } else {
                setNavVisible(true);
            }
        };

        window.addEventListener('resize', handleResize);

        // Initial check
        handleResize();

        // Clean up the event listener
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const toggleNav = () => {
        console.log('Toggle button clicked');
        setNavVisible(!isNavVisible);
    };


    const goBack = () => {
        navigate('/directorportal')
    }

    const [relatedEmpmail, setRelatedEmpmail] = useState('');

    useEffect(() => {
        // Define the API endpoint URL
        const apiUrl = `${BASE_URL}/api/emp_data`;

        // Make the API request
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                // Assuming the response is an object with a "message" array
                const employeeData = data.message;

                // Extract EmpId and Empmail from each employee object
                const empIds = employeeData.map(employee => employee.Empid);
                const empmails = employeeData.map(employee => atob(employee.Empmail));

                console.log(empIds, '229');
                console.log(empmails, '230');

                // Get the value from local storage
                const storedEmployeeId = localStorage.getItem('EmployeeId');

                // Check if the storedEmployeeId exists in the empIds array
                const index = empIds.indexOf(parseInt(storedEmployeeId, 10));

                if (index !== -1) {
                    const relatedEmpmail = `"${empmails[index]}"`;
                    setRelatedEmpmail(relatedEmpmail);
                    console.log('Related Empmail:', relatedEmpmail);
                } else {
                    console.log('EmployeeId not found in the empIds array.');
                }
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }, []);



    const [openDialog, setOpenDialog] = useState(false);



    function handleOpenDialog() {
        setOpenDialog(true);
    }

    function handleCloseDialog() {
        setOpenDialog(false);
    }

    function handleDeclineWithConfirmation() {
        handleOpenDialog();
    }


    function handleDeclineClick() {
        // Define the request payload
        const requestData = {
            Status: "Decline",
            Email: relatedEmpmail, // Use the relatedEmpmail value obtained from the useEffect
        };

        // Send a PUT request to the API endpoint
        axios
            .put(`${BASE_URL}/api/manager_status_upd/${empId}`, requestData)
            .then((response) => {
                // Handle a successful response here
                console.log('API response:', response.data);
                handleCloseDialog(); // Close the dialog on success
            })
            .catch((error) => {
                // Handle errors here
                console.error('API request error:', error);
            });

        navigate('/directorportal');
    }

    setTimeout(() => {
        setNoDataErrorMessage("No data available for the selected User.")
    }, 3000);

    const mainpage = () => {
        navigate('/')
      }

    return (
        <>
            <AppBar position="fixed">
                <Toolbar className="navBar-style">
                    <img className='images' onClick={mainpage} src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ53srYmkaJxsUelVmnAHahYnnqjJ_dT-TiUA&usqp=CAU' alt='not found' />
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
                            style={{ maxWidth: '300px', marginTop: '50px', marginLeft: '-15px' }}
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


            <div className="manager-sidenav" style={{ position: 'fixed', height: '100%', overflowY: 'auto' }}>
                {sections.map((section, index) => (
                    <CollapsibleSection
                        key={index}
                        title={section.title}
                        items={section.items}
                        isExpanded={section.isExpanded}
                        onItemClick={section.isExpanded ? handleItemClick : () => handleSectionClick(index)}
                        style={{ color: 'white', fontWeight: 'bolder', fontSize: '40px' }}
                    />
                ))}
            </div>
            <br /><br /><br /><br />
            <ListItemIcon style={{ marginLeft: '18vw', marginTop: '20px', cursor: 'pointer', color: 'black' }} onClick={goBack}>
                <ArrowBackIcon />&nbsp; <span><b>Go Back</b></span>
            </ListItemIcon>
            <div className='employeetable'>
                {loading ? (
                    <div className="loading-container">
                        <div className="loading-text">Loading...</div>
                        <div className="loading-spinner"></div>
                    </div>

                ) : (selectedItem && tableData.length > 0 ? (
                    <>
                        <div><br />
                            <TableContainer component={Paper} style={{ width: '1250px', overflow: 'auto', marginLeft: '50px' }}>
                                <Table >
                                    <TableHead>
                                        <TableRow style={{ backgroundColor: '#d0e6f5' }}>
                                            <TableCell style={{ fontSize: "100%", fontWeight: "bold", fontFamily: 'Open Sans,sans-serif!important' }}>Metric</TableCell>
                                            <TableCell style={{ fontSize: "100%", textAlign: 'center', fontWeight: "bold", fontFamily: 'Open Sans,sans-serif!important', }}>Quantity Target</TableCell>
                                            <TableCell style={{ fontSize: "100%", textAlign: 'center', fontWeight: "bold", fontFamily: 'Open Sans,sans-serif!important', }}>Quantity Achieved</TableCell>
                                            <TableCell style={{ fontSize: "100%", textAlign: 'center', fontWeight: "bold", fontFamily: 'Open Sans,sans-serif!important', }}>Index KPI</TableCell>
                                            <TableCell style={{ fontSize: "100%", textAlign: 'center', fontWeight: "bold", fontFamily: 'Open Sans,sans-serif!important', }}>Comments</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {tableData.map((row, index) => (
                                            <TableRow key={index}>
                                                <TableCell >{row.Metric}</TableCell>
                                                <TableCell style={{ textAlign: 'center' }}>{row.QuantityTarget}</TableCell>
                                                <TableCell style={{ textAlign: 'center' }}>{row.QuantityAchieved}</TableCell>
                                                <TableCell style={{ textAlign: 'center' }}>{row.IndexKpi}</TableCell>
                                                <TableCell style={{ textAlign: 'center' }}>{row.Comments}</TableCell>

                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <div className="button-container" style={{ textAlign: 'left' }}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleDeclineWithConfirmation}
                                    style={{ marginRight: '10px', backgroundColor: '#1dbb99' }}
                                >
                                    <b>Decline</b>
                                </Button>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    component={Link}
                                    to={`/directorManagerUpdateDetails/${empId}`}
                                    style={{ backgroundColor: '#1dbb99' }}
                                >
                                    <b>Director Ratings</b>
                                </Button>
                            </div>

                        </div>
                        <Dialog open={openDialog} onClose={handleCloseDialog}>
                            <DialogTitle>Confirm Decline</DialogTitle>
                            <DialogContent>
                                <DialogContentText style={{ color: 'black' }}>
                                    Are you sure you want to Decline?
                                </DialogContentText>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={handleCloseDialog} color="primary" variant="contained">
                                    <b>Cancel</b>
                                </Button>
                                <Button onClick={handleDeclineClick} color="primary" variant="contained">
                                    <b>Confirm</b>
                                </Button>
                            </DialogActions>
                        </Dialog>

                    </>

                ) : (
                    <div className="no-data-messages" style={{ color: '#0d4166' }}>
                        {noDataErrorMessage}
                    </div>
                )
                )}
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



        </>
    );
}

export default DirectorUpdateManagerData;