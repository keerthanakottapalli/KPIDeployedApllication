import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DirectorManagerDetails.css';

import { IconButton, Box, DialogTitle, Dialog, DialogContentText, DialogContent, DialogActions, Menu, Tooltip, MenuItem, ListItemIcon, Table, TableBody, TableCell, TableRow, TableHead } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { useNavigate, useParams } from 'react-router-dom';
import { AppBar, Toolbar, Typography } from '@mui/material';
import { BASE_URL } from './config';
import { CameraAlt, Lock } from '@material-ui/icons';
import { Logout } from '@mui/icons-material';
import { Paper, TableContainer } from '@material-ui/core';



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
    const [selectedImage, setSelectedImage] = useState(null);
    const [Empmail, setEmpmail] = useState(atob(localStorage.getItem('empmail')));
    const [employeesData, setEmployeesData] = useState([]);
    const [reportingManagers, setReportingManagers] = useState({});
    const [noDataErrorMessage, setNoDataErrorMessage] = useState();

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

    // Use useEffect to validate incomplete items when moving to the next title section
    const [incompleteItems, setIncompleteItems] = useState([]);
    const [incompleteItemsDialogOpen, setIncompleteItemsDialogOpen] = useState(false);



    const handleSectionClick = async (index) => {
        // Validate incomplete items when moving to the next title section
        const incompleteItems = getIncompleteItems(index);
        setIncompleteItems(incompleteItems);

        if (incompleteItems.length > 0) {
            // Display an error message with the names of incomplete items
            setIncompleteItemsDialogOpen(true);
            return; // Prevent moving to the next section
        }


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

    const getIncompleteItems = () => {

        const incompleteItems = [];
        console.log(sections[selectedSectionIndex], "130");
        // console.log(sections[selectedSectionIndex].items,'130');
        for (const item of sections[selectedSectionIndex].items) {
            if (itemHasMissingValues(item)) {
                incompleteItems.push(item);
            }
        }
        // console.log(incompleteItems,'134');
        console.log(selectedItem, '128', itemMetricInputData);
        return incompleteItems;
    };




    //   const firstname = localStorage.getItem('firstname');
    const lastname = localStorage.getItem('lastname');
    const username = firstname + " " + lastname

    const navigate = useNavigate()
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

    const [isFetchingData, setIsFetchingData] = useState(false);

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
                setIsFetchingData(true); // Set loading state to true when the request starts
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
            }, 1000);
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
        if (!value) {
            setError('Comments cannot be empty');
        } else {
            setError(null); // Reset the error if the comment is not empty.
        }
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




    const updateApiData = async (newData) => {
        try {
            const response = await axios.put(
                `${BASE_URL}/api/manager_director_upd/${empId}/${selectedTitle}/${selectedItem}`,
                {
                    Data: newData,
                }
            );
            if (response.ok) {
                setOpenDialog(true);
            }
            else {
                console.log("not updated");
            }
            console.log('Data successfully updated:', response.data);
            // Optionally, you can show a success message or perform other actions after successful update.
        } catch (error) {
            console.error('Error updating data:', error);
            // Handle error, show error message, etc.
        }
        setTableData(newData);
    };


    const [openDialog, setOpenDialog] = useState(false);
    const [updatedData, setUpdatedData] = useState(''); // Initialize with your data





    const isCommentFieldEmpty = (data) => {
        for (const row of data) {
            if (!row.DirectorComments) {
                return true;
            }
        }
        return false;
    };


    const handleUpdateButtonClick = () => {
        // Close the dialog

        if (isCommentFieldEmpty(tableData)) {
            setError('Empty fields cannot be updated');
        } else {
            setError(null); // Reset the error if there are no empty fields.
            updateApiData(tableData);
            setOpenDialog(true);
        }
    };
    // Function to reset the error message
    const resetError = () => {
        setError('');
    };

    // Add this state for managing the error message
    const [error, setError] = useState('');

    // Function to close the dialog
    const handleClose = () => {
        setOpenDialog(false);
    };

    setTimeout(() => {
        setNoDataErrorMessage("No data available for the selected User.")
    }, 3000);
    const goBack = () => {
        navigate('/meview')
    }

    const mainpage = () => {
        window.location.href = 'http://172.17.15.253:3002';
      }

    return (
        <>
            <AppBar position="fixed">
                <Toolbar className="navBar-style">
                    <img style={{ width: '60px', borderRadius: '50%', cursor: 'pointer' }} onClick={mainpage} src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ53srYmkaJxsUelVmnAHahYnnqjJ_dT-TiUA&usqp=CAU' alt='not found' />

                    <div className="userInfo">
                        <Typography variant="h6" className="welcome-text">
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
                                        <CameraAlt fontSize="small" /> {/* Add the CameraAltIcon */}
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
                                    <Lock />
                                </ListItemIcon>
                                Change Password
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

            <div className="page-container">
               
                <div className={'Dmanager-sidenav'}>
                    {sections.map((section, index) => (
                        <CollapsibleSection
                            key={index}
                            title={section.title}
                            items={section.items}
                            isExpanded={section.isExpanded}
                            onItemClick={section.isExpanded ? handleItemClick : () => handleSectionClick(index)}
                        />
                    ))}
                </div>
                <div className="dmanager-table-container" >
                    <ListItemIcon style={{ cursor: 'pointer', marginTop:'-40px' }} onClick={goBack}>
                        <ArrowBackIcon />&nbsp; <span><b>Go Back</b></span>
                    </ListItemIcon><br /><br />
                    {loading ? (
                        <div className="loading-container">
                            <div className="loading-text">Loading...</div>
                            <div className="loading-spinner"></div>
                        </div>

                    ) : (selectedTitle && tableData.length > 0 ? ( // Check if data is available
                        <>
                            <TableContainer component={Paper} style={{ overflow: 'auto' }}>
                                <Table style={{ width: '75vw' }}>
                                    <TableHead>
                                        <TableRow style={{ backgroundColor: '#d0e6f5' }}>
                                            <TableCell style={{ fontWeight: 'bold', fontSize: '16px' }}>Metric</TableCell>
                                            <TableCell style={{ fontWeight: 'bold', textAlign: 'center', fontSize: '16px' }}>Quantity Target</TableCell>
                                            <TableCell style={{ fontWeight: 'bold', textAlign: 'center', fontSize: '16px' }}>Quantity Achieved</TableCell>
                                            <TableCell style={{ fontWeight: 'bold', textAlign: 'center', fontSize: '16px' }}>Index KPI</TableCell>
                                            <TableCell style={{ fontWeight: 'bold', textAlign: 'center', fontSize: '16px' }}>Comments</TableCell>
                                            <TableCell style={{ fontWeight: 'bold', textAlign: 'center', fontSize: '16px' }}>Director-Rating</TableCell>
                                            <TableCell style={{ fontWeight: 'bold', textAlign: 'center', fontSize: '16px' }}>Director-Comments</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {tableData.map((row, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{row.Metric}</TableCell>
                                                <TableCell style={{ textAlign: 'center' }}>{row.QuantityTarget}</TableCell>
                                                <TableCell style={{ textAlign: 'center' }}>{row.QuantityAchieved}</TableCell>
                                                <TableCell style={{ textAlign: 'center' }}>{row.IndexKpi}</TableCell>
                                                <TableCell style={{ textAlign: 'center' }}>{row.Comments}</TableCell>
                                                <TableCell style={{ textAlign: 'center' }}>
                                                    <Select
                                                        value={itemMetricInputData[selectedItem]?.[row.Metric]?.DRating === undefined ? '' : itemMetricInputData[selectedItem]?.[row.Metric]?.DRating}
                                                        onChange={(e) => {
                                                            handleMRatingChange(selectedItem, row.Metric, e.target.value);
                                                        }}
                                                        style={{ width: '100px' }}
                                                        MenuProps={{
                                                            PaperProps: {
                                                                style: {
                                                                    maxHeight: 200,
                                                                },
                                                            },
                                                        }}
                                                    >
                                                        {Array.from({ length: 11 }, (_, i) => i).map((number) => (
                                                            <MenuItem key={number} value={number}>
                                                                {number}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </TableCell>
                                                <TableCell style={{ textAlign: 'center' }}>
                                                    <Tooltip title={itemMetricInputData[selectedItem]?.[row.Metric]?.PrasadKComments || ''} classes={{ tooltip: 'custom-tooltip' }} style={{ width: '100%' }}>
                                                        <TextField
                                                            id="outlined-multiline-static"
                                                            multiline
                                                            rows={1}
                                                            value={itemMetricInputData[selectedItem]?.[row.Metric]?.PrasadKComments || ''}
                                                            onChange={(e) => handleCommentsChange(selectedItem, row.Metric, e.target.value)}
                                                        />
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                {error && (
                                    <Dialog open={error} onClose={() => setError(false)}>
                                        <DialogContent style={{ width: '420px' }}>
                                            <DialogContentText style={{ fontSize: '18px', marginLeft: '10%', fontWeight: 'bold', color: 'black' }}>
                                                {error}
                                            </DialogContentText>
                                        </DialogContent>
                                        <DialogActions>
                                            <Button onClick={() => setError(false)} color="primary">
                                                <b>OK</b>
                                            </Button>
                                        </DialogActions>
                                    </Dialog>
                                )}

                                <Dialog open={incompleteItemsDialogOpen} onClose={() => setIncompleteItemsDialogOpen(false)}>
                                    <DialogContent>
                                        <DialogContentText>
                                            Please fill in Director Rating and Director Comments for the following items: {incompleteItems.join(', ')}
                                        </DialogContentText>
                                    </DialogContent>
                                    <DialogActions>
                                        <Button onClick={() => setIncompleteItemsDialogOpen(false)} color="primary">
                                            <b>OK</b>
                                        </Button>
                                    </DialogActions>
                                </Dialog>
                            </TableContainer>

                            <div className="Dmanager-button" style={{ marginTop: '20px' }}>
                                <Button
                                    variant="contained"
                                    onClick={handleUpdateButtonClick}
                                    style={{ backgroundColor: '#1dbb99' }}
                                >
                                    <b>Update</b>
                                </Button>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={openConfirmationDialog}
                                    style={{ marginLeft: '20px', color: 'white', }}
                                    disabled={!isSubmitEnabled || isFetchingData}
                                >
                                    <b>Submit</b>
                                </Button>
                                <Dialog
                                    open={isConfirmationDialogOpen}
                                    onClose={closeConfirmationDialog}
                                    aria-labelledby="alert-dialog-title"
                                    aria-describedby="alert-dialog-description"
                                >
                                    <DialogTitle id="alert-dialog-title">Confirm Submission</DialogTitle>
                                    <DialogContent>
                                        <DialogContentText id="alert-dialog-description">
                                            Are you sure you want to submit the form?
                                        </DialogContentText>
                                    </DialogContent>
                                    <DialogActions>
                                        <Button onClick={closeConfirmationDialog} color="primary">
                                            <b>Cancel</b>
                                        </Button>
                                        <Button onClick={handleSubmit} color="primary" autoFocus>
                                            <b>Confirm</b>
                                        </Button>
                                    </DialogActions>
                                </Dialog>
                                <Dialog
                                    open={isSuccessDialogOpen}
                                    onClose={closeSuccessDialog}
                                >
                                    <DialogContent>
                                        <DialogContentText>
                                            Your form has been successfully submitted!
                                        </DialogContentText>

                                    </DialogContent>

                                    <DialogActions>
                                        <Button onClick={closeSuccessDialog} color="primary">
                                            <b>OK</b>
                                        </Button>
                                    </DialogActions>
                                </Dialog>

                                <Dialog open={openDialog} onClose={handleClose}>
                                    <DialogContent style={{ width: '420px' }}>
                                        {/* {error && <div style={{ color: 'red' }}>{error}</div>} */}
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
                        </>
                    ) : (
                        <div className="no-data-messages" style={{ color: '#0d4166' }}>
                            <h4>{noDataErrorMessage}</h4>
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
                            registration.Firstname === firstname && (
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

            </div>
            <Dialog open={showImagePreview} onClose={handleToggleImagePreview}>
                <DialogContent>
                    {registrations.map((registration) => (
                        registration.Firstname === firstname && (
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
        </>
    );
}

export default DirectorUpdateManagerData;