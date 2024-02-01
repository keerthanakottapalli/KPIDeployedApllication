import React, { useState, useEffect, } from 'react';
import { TextField, Tabs, Tab, Box, Table, TableBody, TableCell, Button, TableContainer, TableHead, TableRow, Paper, Select, MenuItem, Menu, ListItemIcon } from '@mui/material';
import './Etabs.css';
import {
    AppBar, Toolbar, Typography
} from '@mui/material';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import { IconButton } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from './config';
import CloseIcon from '@mui/icons-material/Close';
import { AccountCircle, ArrowBack, CameraAlt, ExitToApp, Lock } from '@material-ui/icons';
import ChangePassword from './ChangePassword';
import { Logout } from '@mui/icons-material';


const SubTabs = ({ subTabData, selectedTab, selectedSubTab, updateSelectedTabs, tabLabels, subTabsData }) => {
    const token = localStorage.getItem('token');

    const navigate = useNavigate();
    const initialMainTabRatings = tabLabels.map((tabLabel) =>
        subTabsData[tabLabel].map((subTab) =>
            subTab.questions.map((question) => ({
                quantityAchieved: null,
                indexKpi: null,
                comments: '',
            }))
        )
    );
    const [openDialog, setOpenDialog] = useState(false);
    const [mainTabRatings, setMainTabRatings] = useState(initialMainTabRatings);
    const [showErrorDialog, setShowErrorDialog] = useState(false);
    const [incompleteFields, setIncompleteFields] = useState([]);
   


    // Function to check if there are incomplete fields in the current subtab
    const checkSubTabCompletion = () => {
        const subTabData = subTabsData[tabLabels[selectedTab]][selectedSubTab];
        const incompleteFields = [];

        // Iterate through questions and check for incomplete fields
        subTabData.questions.forEach((question, questionIndex) => {
            const ratingData = mainTabRatings[selectedTab][selectedSubTab][questionIndex];
            if (ratingData.quantityAchieved === null || ratingData.indexKpi === null || ratingData.comments === "") {
                incompleteFields.push(question);
            }
        });

        setIncompleteFields(incompleteFields);

        return incompleteFields;
    };


    const [isConfirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
    const [isSuccessDialogOpen, setSuccessDialogOpen] = useState(false);
    const [isDownloadDialogOpen, setDownloadDialogOpen] = useState(false);
    const [isDownloadButtonVisible, setDownloadButtonVisible] = useState(false);
    const [isSubmitButtonVisible, setSubmitButtonVisible] = useState(true); // Initially visible



    const openConfirmationDialog = () => {
        setConfirmationDialogOpen(true);
    };

    const closeConfirmationDialog = () => {
        setConfirmationDialogOpen(false);
    };

    const openSuccessDialog = () => {
        setSuccessDialogOpen(true);
    };

    const openDownloadDialog = () => {
        setDownloadDialogOpen(true);
    };

    const closeDownloadDialog = () => {
        setDownloadDialogOpen(false);
        navigate('/eview')
    };
    const cancelDownloadToExcel = () =>
    {
        setDownloadDialogOpen(false);
    }

    const selectedTabData = subTabsData[tabLabels[selectedTab]];
    // console.log('selectedTabData:', selectedTabData);
    // console.log('tabLabels-79', tabLabels)

    const handleChange = (event, newValue) => {
        updateSelectedTabs(selectedTab, newValue);
    };

    const handleRatingChange = (event, questionIndex, column) => {
        const newRating = parseInt(event.target.value, 10);
        const newMainTabRatings = [...mainTabRatings];
        newMainTabRatings[selectedTab][selectedSubTab][questionIndex][column] = newRating;
        setMainTabRatings(newMainTabRatings);
    };

    const handleCommentChange = (event, questionIndex) => {
        const newComment = event.target.value;
        const newMainTabRatings = [...mainTabRatings];
        newMainTabRatings[selectedTab][selectedSubTab][questionIndex].comments = newComment;
        setMainTabRatings(newMainTabRatings);
    };


    
    const handleClose = () => {
        setOpenDialog(false);
        setSuccessDialogOpen(false);
        setDownloadButtonVisible(true);
        setSubmitButtonVisible(false);
    };

    const handleSubmit = async () => {

        const token = localStorage.getItem('token');

        const parseJWT = (token) => {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const decodedData = JSON.parse(atob(base64));
            return decodedData;
        };

        const tokenData = parseJWT(token);
        const empId = tokenData.Empid;
        const empName1 = tokenData.Firstname;
        const empName2 = tokenData.Lastname;
        const fullName = empName1 + " " + empName2;

        const formattedData = [
            {
                Empid: empId,
                Empname: fullName,
                data: [], // Initialize an empty array for data
            },
        ];

        for (const tabIdx in mainTabRatings) {
            const subTabRatings = mainTabRatings[tabIdx];
            const tabData = {
                Empid: empId,
                Empname: fullName,
                Value: tabLabels[tabIdx],
                valuecreater: [],
            };

            for (const subTabIdx in subTabRatings) {
                const subTab = subTabsData[tabLabels[tabIdx]][subTabIdx];
                const subTabData = {
                    name: subTab.name,
                    questions: [],
                };

                for (let questionIndex = 0; questionIndex < subTab.questions.length; questionIndex++) {
                    const question = subTab.questions[questionIndex];
                    const quantityTarget = subTab.quantityTargets[questionIndex];
                    const ratingData = subTabRatings[subTabIdx][questionIndex];

                    const quantityAchieved = ratingData.quantityAchieved || 0;
                    const indexKpi = ratingData.indexKpi || 0;
                    const comments = ratingData.comments || '';

                    const formattedQuestion = {
                        Metric: question,
                        QuantityTarget: quantityTarget,
                        QuantityAchieved: quantityAchieved,
                        IndexKpi: indexKpi,
                        Comments: comments,
                    };

                    subTabData.questions.push(formattedQuestion);
                }

                // Add the formatted subTab data to the valuecreater array
                tabData.valuecreater.push(subTabData);
            }

            formattedData[0].data.push(tabData);
        }
        setOpenDialog(true);
        // console.log('Formatted data:', formattedData);

        try {
            const response = await fetch(`${BASE_URL}/api/emp_insrt`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formattedData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Failed to post data:', errorData);
            } else {
                const responseData = await response.json();
                console.log('Data posted successfully:', responseData);
            }
        } catch (error) {
            console.error('An error occurred:', error);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        const parseJWT = (token) => {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            return JSON.parse(atob(base64));
        };
        const tokenData = parseJWT(token);
        const empId = tokenData.Empid;
        const empName = tokenData.Firstname;

        const getApiUrl = `${BASE_URL}/save/emp_data/${empId}`;

        fetch(getApiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then((response) => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('Failed to fetch data');
                }
            })
            .then((data) => {

                const updatedMainTabRatings = [];

                // Loop through the tabLabels and subTabsData to populate the ratings
                tabLabels.forEach((tabLabel, tabIdx) => {
                    const subTabRatings = subTabsData[tabLabel].map((subTab) => {
                        return subTab.questions.map((question, questionIndex) => {
                            const metricItem = data?.employee?.ratings?.find((item) => item.Metric === question);
                            return {
                                quantityAchieved: metricItem ? metricItem.QuantityAchieved : 0,
                                indexKpi: metricItem ? metricItem.IndexKpi : 0,
                                comments: metricItem ? metricItem.Comments : '',
                            };
                        });
                    });
                    updatedMainTabRatings.push(subTabRatings);
                });

                // Set the updated ratings to the state
                setMainTabRatings(updatedMainTabRatings);
            })
            .catch((error) => {
                console.error('An error occurred while fetching data:', error);
                // Handle the error here if needed
            });
    }, []);

    const [isSaveDialogOpen, setSaveDialogOpen] = useState(false);

    const handleSaveData = async () => {
        setSaveDialogOpen(false);
    };

    const handleSave = async () => {
        const token = localStorage.getItem('token');
        const parseJWT = (token) => {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const decodedData = JSON.parse(atob(base64));
            return decodedData;
        };
        const tokenData = parseJWT(token);
        const empId = tokenData.Empid;
        const empName = tokenData.Firstname;

        // Construct the GET URL to check if data already exists
        const getApiUrl = `${BASE_URL}/save/emp_data/${empId}`;

        try {
            const checkResponse = await fetch(getApiUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (checkResponse.ok) {
                // If the GET request is successful, fetch and handle the existing data
                const existingData = await checkResponse.json();
                console.log('Existing data:', existingData);

                // Merge the existing data with the new data to update all fields


                const updatedData =
                {
                    Data: [],
                }
                // Iterate through your data and populate the 'updatedData' array
                for (const tabIdx in mainTabRatings) {
                    const subTabRatings = mainTabRatings[tabIdx];


                    for (const subTabIdx in subTabRatings) {
                        const subTab = subTabsData[tabLabels[tabIdx]][subTabIdx];

                        for (let questionIndex = 0; questionIndex < subTab.questions.length; questionIndex++) {
                            const question = subTab.questions[questionIndex];
                            const quantityTarget = subTab.quantityTargets[questionIndex];
                            const ratingData = subTabRatings[subTabIdx][questionIndex];

                            const quantityAchieved = ratingData.quantityAchieved || 0;
                            const indexKpi = ratingData.indexKpi || 0;
                            const comments = ratingData.comments || '';

                            // Create the formatted question object
                            const formattedQuestion = {
                                Value: tabLabels[tabIdx],
                                Name: subTab.name,
                                Metric: question,
                                QuantityTarget: quantityTarget,
                                QuantityAchieved: quantityAchieved,
                                IndexKpi: indexKpi,
                                Comments: comments,
                            };

                            updatedData.Data.push(formattedQuestion);
                        }
                    }
                }

                console.log("Updated Data", updatedData);

                const updateApiUrl = `${BASE_URL}/save/emp_upd/${empId}`;
                console.log("updateApiUrl", updateApiUrl);

                const updateResponse = await fetch(updateApiUrl, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updatedData),
                });
                console.log('Update Response Status:', updateResponse.status);
                const updateResponseData = await updateResponse.json();
                console.log('Update Response Data:', updateResponseData);

                if (updateResponse.ok) {
                    console.log('Data updated successfully.');
                    console.log('Response Status:', checkResponse.status);
                    const checkResponseData = await checkResponse.json();
                    console.log('Response Data:', checkResponseData);

                    // After successful update, close the save dialog
                    setSaveDialogOpen(false);
                } else {
                    const errorData = await updateResponse.json();
                    console.error('Failed to update data:', errorData);
                }

            } else if (checkResponse.status === 404) {

                const formattedData = [
                    {
                        Empid: empId,
                        Empname: empName,
                        data: [], // Initialize an empty array for data
                    },
                ];

                for (const tabIdx in mainTabRatings) {
                    const subTabRatings = mainTabRatings[tabIdx];
                    const tabData = {
                        Empid: empId,
                        Empname: empName,
                        Value: tabLabels[tabIdx],
                        valuecreater: [],
                    };

                    for (const subTabIdx in subTabRatings) {
                        const subTab = subTabsData[tabLabels[tabIdx]][subTabIdx];
                        const subTabData = {
                            name: subTab.name,
                            questions: [],
                        };

                        for (let questionIndex = 0; questionIndex < subTab.questions.length; questionIndex++) {
                            const question = subTab.questions[questionIndex];
                            const quantityTarget = subTab.quantityTargets[questionIndex];
                            const ratingData = subTabRatings[subTabIdx][questionIndex];

                            const quantityAchieved = ratingData.quantityAchieved === undefined ? 0 : ratingData.quantityAchieved;
                            const indexKpi = ratingData.indexKpi === undefined ? 0 : ratingData.indexKpi;
                            const comments = ratingData.comments || '';


                            const formattedQuestion = {
                                Metric: question,
                                QuantityTarget: quantityTarget,
                                QuantityAchieved: quantityAchieved,
                                IndexKpi: indexKpi,
                                Comments: comments,
                            };

                            subTabData.questions.push(formattedQuestion);
                        }

                        // Add the formatted subTab data to the valuecreater array
                        tabData.valuecreater.push(subTabData);
                    }

                    formattedData[0].data.push(tabData);
                }


                const postApiUrl = `${BASE_URL}/save/emp_insrt`;

                const response = await fetch(postApiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formattedData),
                });
                console.log('Post Response Status:', response.status);
                const responseData = await response.json();
                console.log('Post Response Data:', responseData);

                if (response.ok) {
                    const responseData = await response.json();
                    console.log('Data posted successfully:', responseData);
                    // Perform any additional actions or show a success message
                    alert('Data posted successfully.');
                } else {
                    const errorData = await response.json();
                    console.error('Failed to post data:', errorData);
                    // Handle the error here if needed
                }
            } else {
                const errorData = await checkResponse.json();
                console.error('Failed to check data:', errorData);
                // Handle the error here if needed
            }
        } catch (error) {
            console.error('An error occurred while checking, updating, or posting data:', error);
            // Handle the error here if needed
        }

        setSaveDialogOpen(true);
    };
    const [isClearConfirmationDialogOpen, setIsClearConfirmationDialogOpen] = useState(false);

    const handleOpenClearConfirmationDialog = () => {
        setIsClearConfirmationDialogOpen(true);
    };

    const handleCloseClearConfirmationDialog = () => {
        setIsClearConfirmationDialogOpen(false);
    };
    const clearDataAndCloseDialog = async () => {
        await clearData(); // Call the clearData function
        handleCloseClearConfirmationDialog(); // Close the dialog
    };



    const clearData = async () => {
        const token = localStorage.getItem('token');

        const parseJWT = (token) => {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const decodedData = JSON.parse(atob(base64));
            return decodedData;
        };

        const tokenData = parseJWT(token);
        const empId = tokenData.Empid;

        try {
            // Construct the DELETE API URL
            const deleteApiUrl = `${BASE_URL}/save/emp_del/${empId}`;
            console.log("deleteApiUrl", deleteApiUrl);

            // Send a DELETE request to delete data for the specified empId
            const deleteResponse = await fetch(deleteApiUrl, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            console.log('Delete Response Status:', deleteResponse.status);

            if (deleteResponse.ok) {
                // Data deleted successfully
                console.log('Data deleted successfully.');

                window.location.reload();
            } else {
                const errorData = await deleteResponse.json();
                console.error('Failed to delete data:', errorData);
                // Handle the error here with specific error messages
            }
        } catch (error) {
            console.error('An error occurred while deleting data:', error);
            // Handle the error here if needed
        }
    };



    const [isFormComplete, setIsFormComplete] = useState(false);
    const checkFormCompletion = () => {
        for (let i = 0; i < mainTabRatings.length; i++) {
            const mainTab = mainTabRatings[i];
            for (let j = 0; j < mainTab.length; j++) {
                const subTab = mainTab[j];
                for (let k = 0; k < subTab.length; k++) {
                    const ratingData = subTab[k];
                    if (ratingData.quantityAchieved === null || ratingData.indexKpi === null || ratingData.comments === '') {
                        return false;
                    }
                }
            }
        }
        return true;
    };


    useEffect(() => {
        const isComplete = checkFormCompletion();
        console.log('isFormComplete:', isComplete);
        setIsFormComplete(isComplete);
    }, [selectedTab, selectedSubTab, mainTabRatings]);





    const exportToExcel = () => {
        const firstname = localStorage.getItem('firstname');
        const id = localStorage.getItem('Empid');
        const formattedData = [
            ['', 'Metric', 'Quantity Target', 'Quantity Achieved', 'Comments', 'Index KPI'],
        ];
        for (const tabIdx in mainTabRatings) {
            const subTabRatings = mainTabRatings[tabIdx];
            const tabLabel = tabLabels[tabIdx];
            let isFirstSubTab = true;
            formattedData.push([tabLabel]);

            for (const subTabIdx in subTabRatings) {
                const subTab = subTabsData[tabLabel][subTabIdx];


                if (!isFirstSubTab) {
                    formattedData.push(['']);
                }


                formattedData.push([subTab.name]);

                for (let questionIndex = 0; questionIndex < subTab.questions.length; questionIndex++) {
                    const question = subTab.questions[questionIndex];
                    const ratingData = subTabRatings[subTabIdx][questionIndex];


                    formattedData.push([
                        '',
                        question,
                        subTab.quantityTargets[questionIndex],
                        ratingData.quantityAchieved || 0,
                        ratingData.comments || '',
                        ratingData.indexKpi || 0,
                    ]);
                }
                isFirstSubTab = false;
            }
        }


        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(formattedData);
        XLSX.utils.book_append_sheet(wb, ws, 'KPI Data');


        const fileName = `${id}_${firstname}_KPI_Data.xlsx`;

        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], { type: 'application/octet-stream' });
        saveAs(blob, fileName);
    };


    // const [selectedTabs, setSelectedTabs] = useState(0);

    return (

        <div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                    className='getSaveButton'
                    variant="contained"
                    style={{ backgroundColor: '#1dbb99' }}
                    onClick={handleSave}
                >
                    <b>Save</b>
                </Button>&nbsp;
                <Button
                    className='getClearButton'
                    variant="contained"
                    style={{ backgroundColor: '#1dbb99' }}
                    onClick={handleOpenClearConfirmationDialog}
                >
                    <b>Clear</b>
                </Button>
            </div>

            <Tabs
                value={selectedSubTab}
                onChange={handleChange}
                centered variant="scrollable" scrollButtons="auto"
                sx={{
                }}
            >
                {subTabData.map((subTab, index) => (
                    <Tab
                        className='empformSub-tab'
                        style={{ fontWeight: 'bold' }}
                        key={index}
                        label={subTab.name}
                        sx={{ backgroundColor: 'inherit' }}
                        variant="scrollable"
                        scrollButtons="auto"
                        onClick={() => updateSelectedTabs(selectedTab, index)}
                    />
                ))}

            </Tabs>
            <Box>
                <TableContainer component={Paper} className='empformTablecontaner'>
                    <Table style={{maxHeight:'50vh'}}>
                        <TableHead>
                            <TableRow>
                                <TableCell style={{ fontSize: "100%", fontWeight: "bold", fontFamily: 'Open Sans,sans-serif!important' }}>Metric</TableCell>
                                <TableCell style={{ fontSize: "100%", fontWeight: "bold", fontFamily: 'Open Sans,sans-serif!important' }}>Quantity Target</TableCell>
                                <TableCell style={{ fontSize: "100%", fontWeight: "bold", fontFamily: 'Open Sans,sans-serif!important' }}>Quantity Achieved</TableCell>
                                <TableCell style={{ fontSize: "100%", fontWeight: "bold", fontFamily: 'Open Sans,sans-serif!important' }}>Comments</TableCell>
                                <TableCell style={{ fontSize: "100%", fontWeight: "bold", fontFamily: 'Open Sans,sans-serif!important' }}>Index KPI</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {subTabData[selectedSubTab]?.questions.map((question, questionIndex) => (
                                <TableRow key={questionIndex}>
                                    <TableCell>{question}</TableCell>
                                    <TableCell>{subTabData[selectedSubTab]?.quantityTargets[questionIndex]}</TableCell>
                                    <TableCell>
                                        <Select
                                            value={mainTabRatings[selectedTab][selectedSubTab][questionIndex]?.quantityAchieved === null ? '' : mainTabRatings[selectedTab][selectedSubTab][questionIndex]?.quantityAchieved}
                                            onChange={(event) => handleRatingChange(event, questionIndex, 'quantityAchieved')}
                                            sx={{ minWidth: '120px' }}
                                            // className={incompleteFields.includes(question) ? 'incomplete-field' : ''}
                                            MenuProps={{
                                                PaperProps: {
                                                    style: {
                                                        maxHeight: 200, // Set the maximum height for the dropdown
                                                    },
                                                },
                                            }}
                                        >
                                            <MenuItem value={null}> </MenuItem>
                                            {Array.from({ length: 11 }, (_, i) => (
                                                <MenuItem key={i} value={i}>{i}</MenuItem>
                                            ))}
                                        </Select>
                                    </TableCell>

                                    <TableCell>
                                        <Tooltip title={mainTabRatings[selectedTab][selectedSubTab][questionIndex]?.comments === null ? '' : mainTabRatings[selectedTab][selectedSubTab][questionIndex]?.comments} classes={{ tooltip: 'custom-tooltip' }}>
                                            <TextField
                                                value={mainTabRatings[selectedTab][selectedSubTab][questionIndex]?.comments === null ? '' : mainTabRatings[selectedTab][selectedSubTab][questionIndex]?.comments}
                                                multiline
                                                rows={1}
                                                onChange={(event) => handleCommentChange(event, questionIndex)}
                                                label="Comments"
                                                // className={incompleteFields.includes(question) ? 'incomplete-field' : ''}
                                            />
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell>
                                        <Select
                                            value={mainTabRatings[selectedTab][selectedSubTab][questionIndex]?.indexKpi === null ? '' : mainTabRatings[selectedTab][selectedSubTab][questionIndex]?.indexKpi}
                                            onChange={(event) => handleRatingChange(event, questionIndex, 'indexKpi')}
                                            sx={{ minWidth: '120px' }}
                                            // className={incompleteFields.includes(question) ? 'incomplete-field' : ''}
                                            MenuProps={{
                                                PaperProps: {
                                                    style: {
                                                        maxHeight: 200, // Set the maximum height for the dropdown
                                                    },
                                                },
                                            }}
                                        >
                                            {Array.from({ length: 11 }, (_, i) => i).map((rating) => (
                                                <MenuItem key={rating} value={rating}>{rating}</MenuItem>
                                            ))}
                                        </Select>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>

                    </Table>
                </TableContainer>
                <div className="navigationbuttons">

                    <Dialog
                        open={isSaveDialogOpen}
                        onClose={() => setSaveDialogOpen(false)} // Close the dialog when needed
                    >
                        <DialogTitle>Save Data</DialogTitle>
                        <DialogContent>
                            {/* Add content for the save dialog here */}
                            <DialogContentText>
                                Are you sure you want to save the data?
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setSaveDialogOpen(false)} variant='contained' style={{ backgroundColor: "#00aaee", color: "white " }}>
                                <b>Cancel</b>
                            </Button>
                            <Button onClick={handleSaveData} variant='contained' style={{ backgroundColor: "#00aaee", color: "white " }}>
                                <b>Save</b>
                            </Button>
                        </DialogActions>
                    </Dialog>


                    <Dialog
                        open={isClearConfirmationDialogOpen}
                        onClose={handleCloseClearConfirmationDialog}
                    >
                        <DialogTitle>Clear Confirmation</DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                Are you sure you want to clear the data? This action cannot be undone.
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseClearConfirmationDialog} variant='contained' style={{ backgroundColor: "#00aaee", color: "white " }}>
                                <b>Cancel</b>
                            </Button>
                            <Button onClick={clearDataAndCloseDialog} variant='contained' style={{ backgroundColor: "#00aaee", color: "white " }}>
                                <b>Clear</b>
                            </Button>
                        </DialogActions>
                    </Dialog>



                    <button
                        className={`navigation-button${selectedTab === 0 && selectedSubTab === 0 ? ' disabled' : ''}`}
                        onClick={() => {
                            if (selectedSubTab > 0) {
                                // If there's a previous subtab, go to it
                                updateSelectedTabs(selectedTab, selectedSubTab - 1);
                            } else if (selectedTab > 0) {
                                // If no previous subtab, check if there's a previous main tab
                                const newSelectedTab = selectedTab - 1;
                                updateSelectedTabs(newSelectedTab, subTabsData[tabLabels[newSelectedTab]].length - 1);
                            } else {
                                // If no previous main tab, stay on the first main tab and subtab
                                updateSelectedTabs(0, 0);
                            }
                        }}
                        disabled={selectedTab === 0 && selectedSubTab === 0}
                    >
                        &lt; Previous
                    </button>



                    <button
                        className={`navigation-button${selectedTab === tabLabels.length - 1 && selectedSubTab === subTabData.length - 1 ? ' disabled' : ''}`}
                        style={{ width: '100px', height: '50px' }}
                        onClick={() => {
                            const incompleteFields = checkSubTabCompletion();
                            if (incompleteFields.length === 0) {
                                if (selectedSubTab < subTabData.length - 1) {
                                    // If there's a next subtab, go to it
                                    updateSelectedTabs(selectedTab, selectedSubTab + 1);
                                } else if (selectedTab < tabLabels.length - 1) {
                                    // If no next subtab, check if there's a next main tab
                                    const newSelectedTab = selectedTab + 1;
                                    updateSelectedTabs(newSelectedTab, 0);
                                } else {
                                    // If no next main tab, stay on the last main tab and subtab
                                    updateSelectedTabs(tabLabels.length - 1, subTabsData[tabLabels[tabLabels.length - 1]].length - 1);
                                }
                            } else {
                                setIncompleteFields(incompleteFields);
                                console.log(tabLabels,"subTabData");
                                // Show the error dialog or take other actions
                                setShowErrorDialog(true);
                            }
                        }}
                        
                        disabled={selectedTab === tabLabels.length - 1 && selectedSubTab === subTabData.length - 1}
                    >
                        Next &gt;
                    </button>



                    {incompleteFields.length > 0 && (

                        <Dialog open={showErrorDialog} onClose={() => setShowErrorDialog(false)}>
                            <DialogTitle>
                                Error: Incomplete fields
                                <IconButton
                                    edge="end"
                                    color="inherit"
                                    onClick={() => setShowErrorDialog(false)}
                                    aria-label="close"
                                    style={{ position: 'absolute', right: '15px', top: '8px' }}
                                >
                                    <CloseIcon />
                                </IconButton>
                            </DialogTitle>
                            <DialogContent style={{ height: '120px' }}>
                                <DialogContentText style={{ fontSize: '18px', marginLeft: '10%', fontWeight: 'bold', color: 'red' }}>
                                    Please complete the following fields in the current subtab: {incompleteFields.join(', ')}
                                </DialogContentText>
                            </DialogContent>
                        </Dialog>


                    )}
                    &nbsp;&nbsp;&nbsp;


                    <Dialog open={isSuccessDialogOpen} onClose={handleClose}>
                        <DialogContent style={{ width: '420px' }}>
                            {/* Include the <img> element for your image here */}
                            <img
                                src="https://badge-exam.miraclesoft.com/assets/ecert/Completed-test.svg"
                                alt="not found"
                                style={{ maxWidth: '100%', maxHeight: '200px', marginLeft: '23%' }}
                            />
                            <DialogContentText style={{ fontSize: '18px', marginLeft: '10%', fontWeight: 'bold', color: 'black' }}>
                                Successfully submitted the form.
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleClose} open={openDownloadDialog} style={{ backgroundColor: "#00aaee", color: "white " }}>
                                <b>OK</b>
                            </Button>
                        </DialogActions>
                    </Dialog>

                    {isSubmitButtonVisible && isFormComplete && selectedTab === tabLabels.length - 1 && selectedSubTab === subTabsData[tabLabels[selectedTab]].length - 1 && (
                        <button
                            className={`submit - button ${isFormComplete ? '' : 'disabled-button'}`}
                            onClick={openConfirmationDialog} // Open the confirmation dialog
                            style={{ height: '50px', width: '100px', marginTop: '-0.1%', backgroundColor: '#00aaee', border: 'none', borderRadius: '5px', color: 'white' }}
                        >
                            Submit
                        </button>
                    )}

                    <Dialog open={isConfirmationDialogOpen} onClose={closeConfirmationDialog}>
                        <DialogTitle>Confirmation</DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                Are you sure you want to submit the form? This action cannot be undone.
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={closeConfirmationDialog} style={{ backgroundColor: "#00aaee", color: "white " }}>
                                <b>Cancel</b>
                            </Button>
                            <Button onClick={() => {
                                handleSubmit();
                                // exportToExcel();
                                closeConfirmationDialog();
                                openSuccessDialog();
                            }} style={{ backgroundColor: "#00aaee", color: "white " }}>
                                <b>OK</b>
                            </Button>
                        </DialogActions>
                    </Dialog>



                    {isDownloadButtonVisible && (
                        <Button onClick={openDownloadDialog} style={{ backgroundColor: "#00aaee", color: "white " }}>
                            <b>Download To Excel</b>
                        </Button>
                    )}
                    <Dialog open={isDownloadDialogOpen} onClose={closeDownloadDialog}>
                        <DialogTitle>Confirmation</DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                Are you sure you want to Download this form to Excel Sheet?
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={cancelDownloadToExcel} style={{ backgroundColor: "#00aaee", color: "white " }}>
                                <b>Cancel</b>
                            </Button>
                            <Button onClick={() => {
                                exportToExcel(); // Call exportToExcel directly when the download button is clicked
                                closeDownloadDialog();
                            }} style={{ backgroundColor: "#00aaee", color: "white " }}><b>OK</b>
                                
                            </Button>
                        </DialogActions>
                    </Dialog>



                </div>



            </Box >
        </div >
    );
};


const TabsView = () => {

    const navigate = useNavigate();
    const [selectedTab, setSelectedTab] = useState(0);
    const [selectedSubTab, setSelectedSubTab] = useState(0);
    const [registrations, setRegistrations] = useState([]);
    const [anchorElUser, setAnchorElUser] = React.useState(null);

    const [anchorElNav, setAnchorElNav] = React.useState(null);

    const [isProfileCardOpen, setIsProfileCardOpen] = useState(false);
    const [userData, setUserData] = useState(null); // State to store user data
    const [selectedImage, setSelectedImage] = useState(null);
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [showImagePreview, setShowImagePreview] = useState(false);



    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const handleChange = (event, newValue) => {
        setSelectedTab(newValue);
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
        handleCloseUserMenu();
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


    const updateSelectedTabs = (newSelectedTab, newSelectedSubTab) => {
        setSelectedTab(newSelectedTab);
        setSelectedSubTab(newSelectedSubTab);
    };

    let xhr = new XMLHttpRequest();
    let data;

    xhr.open("GET", `${BASE_URL}/admin/emp_data`, false);
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
    let tabLabels = Object.keys(subTabsData)



    const initialMainTabRatings = tabLabels.map((tabLabel) =>
        subTabsData[tabLabel].map((subTab) =>
            subTab.questions.map((question) => ({
                quantityAchieved: 0,
                indexKpi: 0,
                comments: '',
            }))
        )
    );

    const handleLogout = () => {
        navigate('/login')
    };

    const [mainTabRatings, setMainTabRatings] = useState(initialMainTabRatings);

    const empId = localStorage.getItem('Empid');
    const firstname = localStorage.getItem('firstname');
    const lastname = localStorage.getItem('lastname');
    const username = firstname + " " + lastname

    const goBack = ()=>{
        navigate('/eview')
    }

    const mainpage = () => {
        navigate('/')
      }

    return (
        <>
            <AppBar position="fixed">
                <Toolbar className="navigation-header">
                    <img style={{ width: '60px', borderRadius: '50%' }} onClick={mainpage} src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ53srYmkaJxsUelVmnAHahYnnqjJ_dT-TiUA&usqp=CAU' alt='not found' />

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
                            style={{  maxWidth: '300px', marginTop:'50px', marginLeft:'-15px'  }}
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
                <>
                    <br /><br/><br /><br/>
                    <div style={{marginTop:'-5px', cursor:'pointer' }}>
                    <ListItemIcon  onClick={goBack}>
                                    <ArrowBack />&nbsp; <span><b>Go Back</b></span>   
                                </ListItemIcon>
                    </div>
                                
                    <div className="tabs-view">
                        
                        <div className="main-tabs-container">
                            <Tabs value={selectedTab} onChange={handleChange} centered variant="scrollable" scrollButtons="auto">
                                {tabLabels.map((label, index) => (
                                    <Tab
                                        style={{ fontWeight: 'bold', color: 'white' }}
                                        key={label}
                                        label={label}
                                    />
                                )
                                )}
                            </Tabs>
                        </div>
                        <div className="sub-tabs-container">
                            {selectedTab >= 0 && (
                                <SubTabs
                                    subTabData={subTabsData[tabLabels[selectedTab]]}
                                    selectedTab={selectedTab}
                                    selectedSubTab={selectedSubTab}
                                    mainTabRatings={mainTabRatings}
                                    setMainTabRatings={setMainTabRatings}
                                    updateSelectedTabs={updateSelectedTabs}
                                    tabLabels={tabLabels}
                                    subTabsData={subTabsData}
                                />
                            )}
                        </div>
                    </div>
                </>
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
                    <Button onClick={handleCloseProfileCard} style={{ backgroundColor: "#00aaee", color: "white", marginBottom: '15px', marginRight: '15px' }}>
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

function App() {
    return (
        <div className="App" style={{ backgroundColor: '#e9ecef' }}>
            <TabsView />
        </div>
    );
}

export default App;