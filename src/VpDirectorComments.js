import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ManagerCommentsPost.css';
import { useNavigate, useParams } from 'react-router-dom';
import { AppBar, Paper, Toolbar, Typography } from '@mui/material';
import { Table, TableHead, TableBody, TableRow, TableCell, Button, Select, MenuItem, TextField, TableContainer } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import { BASE_URL } from './config';
import { AccountCircle, ArrowBack, CameraAlt, ExitToApp, Lock } from '@material-ui/icons';
import ChangePassword from './ChangePassword';
import { Box, IconButton, ListItemIcon, Menu } from '@material-ui/core';
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


function ManagerUpdateEmpData() {
    const [sections, setSections] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [tableData, setTableData] = useState([]);
    //   const empId = localStorage.getItem('Empid');
    const firstname = localStorage.getItem('firstname');
    const [loading, setLoading] = useState(true);
    const [registrations, setRegistrations] = useState([]);
    const [anchorElUser, setAnchorElUser] = React.useState(null);

    const [anchorElNav, setAnchorElNav] = React.useState(null);

    const [isProfileCardOpen, setIsProfileCardOpen] = useState(false);
    const [userData, setUserData] = useState(null); // State to store user data
    const [selectedImage, setSelectedImage] = useState(null);
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [showImagePreview, setShowImagePreview] = useState(false);
    const [noDataErrorMessage, setNoDataErrorMessage] = useState();

    const { empId } = useParams();


    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
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
    const handleOpenNavMenu = (event) => {
        setAnchorElNav(event.currentTarget);
    };

    const handleChangePassword = () => {
        setShowChangePassword(true);
    };
    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
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
            const response = await axios.get(`${BASE_URL}/admin/director_data`);
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
                        metricData.MRating === null ||
                        metricData.JohnVesliChComments.trim() === ''
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
            const response = await axios.get(`${BASE_URL}/api/director_manager_data/${empId}/${selectedTitle}/${item}`);
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
                            MRating: metricData.VpRating,
                            JohnVesliChComments: metricData.VpComments,
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
                    const newDataResponse = await axios.get(`${BASE_URL}/api/director_data/${empId}/${selectedTitle}/${item}`);
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
                                    MRating: '',
                                    JohnVesliChComments: '',
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
            if (metricData.MRating === null || metricData.JohnVesliChComments.trim() === '') {
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
        if (!empId) return;

        try {
            let response;
            let responseData;

            try {

                response = await axios.get(`${BASE_URL}/api/director_manager_data/${empId}/${selectedTitle}/${selectedItem}`);
                responseData = response.data.data[0];

            } catch (error) {

                try {
                    response = await axios.get(`${BASE_URL}/api/director_data/${empId}/${selectedTitle}/${selectedItem}`);
                    responseData = response.data.data[0];
                    console.log(responseData, '333');
                } catch (error) {
                    responseData = null;
                }
            }
            console.log(responseData, "3256");
            if (responseData) {
                const newItemMetricInputData = { ...itemMetricInputData };
                if (!newItemMetricInputData[selectedItem]) {
                    newItemMetricInputData[selectedItem] = {};
                }

                responseData.Data.forEach(metricData => {
                    if (!newItemMetricInputData[selectedItem][metricData.Metric]) {
                        newItemMetricInputData[selectedItem][metricData.Metric] = {
                            MRating: metricData.VpRating || 0,
                            JohnVesliChComments: metricData.VpComments || '',
                            QuantityTarget: metricData.QuantityTarget || 0,
                            QuantityAchieved: metricData.QuantityAchieved || 0,
                            IndexKpi: metricData.IndexKpi || 0,
                            Comments: metricData.Comments || '',
                        };
                    }
                });

                setItemMetricInputData(newItemMetricInputData);
                setTableData(responseData.Data);
                console.log(tableData, "347");
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
                    MRating: value,
                }
            }
        }));

        // Update tableData with the new MRating value
        setTableData(prevTableData => {
            const updatedTableData = prevTableData.map(row => {
                if (row.Metric === metric) {
                    return {
                        ...row,
                        VpRating: value,
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
                    JohnVesliChComments: value,
                }
            }
        }));

        // Update tableData with the new Comments value
        setTableData(prevTableData => {
            const updatedTableData = prevTableData.map(row => {
                if (row.Metric === metric) {
                    return {
                        ...row,
                        VpComments: value,
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
                            VpRating: metricData.MRating || 0,
                            VpComments: metricData.JohnVesliChComments || '',
                        })),
                    })),
                })),
            }];

            try {
                const response = await axios.post(`${BASE_URL}/api/director_manager_insrt`, JSON.stringify(postData), {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                console.log('Data successfully posted:', response.data);
                closeConfirmationDialog(); // Open the confirmation dialog

                // You can handle success messages or other actions here
                setSuccessDialogOpen(true); // Open the success dialog
            } catch (error) {
                console.error('Error posting data:', error);
                // Handle error messages or other actions here
            }
        }

    };


    const updateApiData = async (newData) => {
        try {
            const response = await axios.put(
                `${BASE_URL}/api/director_manager_upd/${empId}/${selectedTitle}/${selectedItem}`,
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
            if (!row.VpComments) {
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


    const goBack = () => {
        navigate(`/VPView/${empId}`)
    }

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


    const mainpage = () => {
        window.location.href = 'http://172.17.15.253:3002';
      }



    return (
        <>
            <AppBar position="fixed">
                <Toolbar className="navigation-header">
                    <img style={{ width: '60px', borderRadius: '50%', cursor: 'pointer' }} onClick={mainpage} src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ53srYmkaJxsUelVmnAHahYnnqjJ_dT-TiUA&usqp=CAU' alt='not found' />

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
                                    <AccountCircle />
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
                                ResetPassword
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
                <div className="sidebar">
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
                <ListItemIcon style={{ marginLeft: '18vw', marginTop: '14vh', cursor: 'pointer' }} onClick={goBack}>
                    <ArrowBack />&nbsp; <span><b>Go Back</b></span>
                </ListItemIcon>
                <div className="employeetable">
                    {loading ? (
                        <div className="loading-container">
                            <div className="loading-text">Loading...</div>
                            <div className="loading-spinner"></div>
                        </div>


                    ) : (selectedItem && tableData.length > 0 ? (
                        <>
                            <TableContainer component={Paper} style={{ width: '1250px', overflow: 'auto', marginTop: '20vh', marginLeft:'-20vw' }}>

                                <Table >
                                    <TableHead>
                                        <TableRow style={{ backgroundColor: '#d0e6f5' }}>
                                            <TableCell style={{ fontSize: "16px", fontWeight: "bold", fontFamily: 'Open Sans,sans-serif!important' }}>Metric</TableCell>
                                            <TableCell style={{ textAlign: 'center' }}><b>Quantity Target</b></TableCell>
                                            <TableCell style={{ textAlign: 'center' }}><b>Quantity Achieved</b></TableCell>
                                            <TableCell style={{ textAlign: 'center' }}><b>Index KPI</b></TableCell>
                                            <TableCell style={{ textAlign: 'center' }}><b>Comments</b></TableCell>
                                            <TableCell style={{ textAlign: 'center' }}><b>Vice President-Rating</b></TableCell>
                                            <TableCell style={{ textAlign: 'center' }}><b>Vice President-Comments</b></TableCell>
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
                                                        value={itemMetricInputData[selectedItem]?.[row.Metric]?.MRating === undefined ? '' : itemMetricInputData[selectedItem]?.[row.Metric]?.MRating}

                                                        // value={
                                                        //     itemMetricInputData[selectedItem]?.[row.Metric]?.MRating || ''}
                                                        onChange={(e) => {
                                                            handleMRatingChange(selectedItem, row.Metric, e.target.value);

                                                        }

                                                        }
                                                        style={{ width: '100px' }}
                                                        MenuProps={{
                                                            PaperProps: {
                                                                style: {
                                                                    maxHeight: 200, // Set the maximum height for the dropdown
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
                                                    <Tooltip title={itemMetricInputData[selectedItem]?.[row.Metric]?.JohnVesliChComments || ''} classes={{ tooltip: 'custom-tooltip' }} style={{ width: '100%' }}>
                                                        <TextField
                                                            id="outlined-multiline-static"
                                                            multiline
                                                            rows={1}
                                                            value={itemMetricInputData[selectedItem]?.[row.Metric]?.JohnVesliChComments || ''}
                                                            onChange={(e) => {
                                                                handleCommentsChange(selectedItem, row.Metric, e.target.value);
                                                            }}
                                                        />
                                                    </Tooltip>

                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
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
                                                Please fill in Manager Rating and Manager Comments for the following items: {incompleteItems.join(', ')}
                                            </DialogContentText>
                                        </DialogContent>
                                        <DialogActions>
                                            <Button onClick={() => setIncompleteItemsDialogOpen(false)} color="primary">
                                                <b>OK</b>
                                            </Button>
                                        </DialogActions>
                                    </Dialog>

                                </Table>

                            </TableContainer>
                            <div className="mcomments-buttons">
                                    <Button
                                        variant="contained"

                                        onClick={handleUpdateButtonClick}
                                        style={{ backgroundColor: '#1dbb99' }}
                                    >
                                        <b>Update</b>
                                    </Button>
                                    <Button
                                        variant="contained"

                                        onClick={openConfirmationDialog}
                                        style={{ marginLeft: '20px',  color: 'white', backgroundColor:'#00aaee' }}
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
                            {noDataErrorMessage}
                        </div>
                    )
                    )}
                </div>
                </div>
                <Dialog
                    open={isProfileCardOpen}
                    onClose={handleCloseProfileCard}
                    fullWidth // Makes the dialog take up the full width of its container
                    maxWidth="sm" // Sets the maximum width of the dialog
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
                        <Button onClick={handleCloseProfileCard} style={{ backgroundColor: "#00aaee", color: "white ", fontWeight: 'bold', marginBottom: '15px', marginRight: '15px' }}>
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

export default ManagerUpdateEmpData;