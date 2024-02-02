
import React, { useState } from 'react';
import axios from 'axios';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import GroupsIcon from '@mui/icons-material/Groups';

import PasswordIcon from '@mui/icons-material/Password';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import { Link, useNavigate } from 'react-router-dom';
import './RegistrationForm.css';
import { BASE_URL } from './config';

const RegistrationForm = () => {
  const navigate = useNavigate();
  const inputWidth = '20vw';
  const inputHeight = '48px';

  const roles = ['Employee', 'HR', 'Manager', 'Director', 'Vice President'];
  const practices = ['Digital Practice', 'Innovations', 'B2B', 'Integrations', 'Spring Boot', 'Cloud and DevOps'];
  const managers = ['John Vesli Chitri', 'Vinod Marupu', 'Ravi Ijju', 'Venkata Ram Prasad Kandregula', 'Santosh Soni', 'Prasad Venkat Lokam'];
  const hr = ['Divya Abburi', 'Sruthi Kolli', 'Lohitha Bandi', 'Ajay Duvvu', 'PadmaPriya Kamsu', 'Vasu Varupula', 'Chandini Sigireddy'];
  const location = ['Miracle City', 'Miracle Heights', 'Miracle Valley', 'Novi USA'];

  const [formData, setFormData] = useState({
    Empid: '',
    Empmail: '',
    Firstname: '',
    Lastname: '',
    Role: '',
    Practies: '',
    Reportingmanager: '',
    Password: '',
    Reportinghr: '',
    Location: '',
    Image: null,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [apiError, setApiError] = useState('');

  const handleClose = () => {
    setOpenDialog(false);
    navigate('/login');
  };


  const validateEmpId = (empId) => {
    return empId.trim() !== '';
  };

  const validateEmpEmail = (empEmail) => {
    const emailPattern = /^[^\s][a-zA-Z][\w-]*(\.[\w-]+)*@[\w-]+(\.[\w-]+)+[^\s]$/;

    return emailPattern.test(empEmail) && empEmail.endsWith('miraclesoft.com');
  };


  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'Empid' && value.trim() !== '' && !validateInteger(value)) {
      setValidationErrors((prevErrors) => ({
        ...prevErrors,
        [name]: 'Please enter integer values.',
      }));
    } else {
      setValidationErrors((prevErrors) => ({
        ...prevErrors,
        [name]: '',
      }));
    }

   // Validation logic for email input
if (name === 'Empmail') {
  if (/\s/.test(value)) {
    // If there is any space in the email address
    setValidationErrors((prevErrors) => ({
      ...prevErrors,
      [name]: 'Spaces are not allowed in the email address.',
    }));
  } else if (!/^[a-zA-Z][\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/.test(value)) {
    setValidationErrors((prevErrors) => ({
      ...prevErrors,
      [name]: 'Please enter a valid email address. Ex: abc@miraclesoft.com',
    }));
  } else if (!value.endsWith('@miraclesoft.com')) {
    setValidationErrors((prevErrors) => ({
      ...prevErrors,
      [name]: 'Email must end with @miraclesoft.com',
    }));
  } else if (value.split('@').length - 1 > 1) {
    setValidationErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "Only one '@' is allowed",
    }));
  } else {
    setValidationErrors((prevErrors) => ({
      ...prevErrors,
      [name]: '', // Clear the error when the format is correct
    }));
  }
}


    if (name === 'Password') {
      if (value.length < 8) {
        setValidationErrors((prevErrors) => ({
          ...prevErrors,
          [name]: 'Password must be at least 8 characters long',
        }));
      } else if (!/\d/.test(value)) {
        setValidationErrors((prevErrors) => ({
          ...prevErrors,
          [name]: 'Password must contain at least one digit (0-9)',
        }));
      } else if (!/[!@#$%^&*]/.test(value)) {
        setValidationErrors((prevErrors) => ({
          ...prevErrors,
          [name]: 'Password must contain at least one special character (!@#$%^&*)',
        }));
      } else if (!/[A-Z]/.test(value)) {
        setValidationErrors((prevErrors) => ({
          ...prevErrors,
          [name]: 'Password must contain at least one uppercase letter',
        }));
      } else {
        setValidationErrors((prevErrors) => ({
          ...prevErrors,
          [name]: '',
        }));
      }
    }

    if (name === 'Firstname' || name === 'Lastname') {
      if (!/^[A-Za-z\s]+$/.test(value)) {
        setValidationErrors((prevErrors) => ({
          ...prevErrors,
          [name]: 'Please enter only letters and spaces',
        }));
      } else {
        setValidationErrors((prevErrors) => ({
          ...prevErrors,
          [name]: '', // Clear the error when the input contains only letters
        }));
      }
    }

    if (name === 'Image' && type === 'file') {
      if (!value) {
        setValidationErrors((prevErrors) => ({
          ...prevErrors,
          [name]: 'Profile image is required',
        }));
      } else {
        setValidationErrors((prevErrors) => ({
          ...prevErrors,
          [name]: '',
        }));
      }
    }

  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      getBase64(file, (base64Image) => {
        setFormData({ ...formData, Image: base64Image });
      });
    }
  };

  const getBase64 = (file, callback) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => callback(reader.result);
    reader.onerror = (error) => console.error('Error converting file to base64:', error);
  };

  const validateInteger = (value) => {
    return /^\d+$/.test(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = {};
    if (!validateEmpId(formData.Empid)) {
      errors.Empid = 'Please enter a valid Emp Id';
    }

    if (!validateEmpEmail(formData.Empmail)) {
      errors.Empmail = 'Please enter a valid Emp Email';
    }
    if (!formData.Image) {
      errors.Image = 'Profile image is required';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {

      const encodedPassword = btoa(formData.Password);
      const encodedEmpmail = btoa(formData.Empmail);

      const displayPayload = {
        Empid: formData.Empid,
        Empmail: encodedEmpmail,
        Firstname: formData.Firstname,
        Lastname: formData.Lastname,
        Role: formData.Role,
        Practies: formData.Practies,
        Reportingmanager: formData.Reportingmanager,
        Password: encodedPassword,
        Reportinghr: formData.Reportinghr,
        Location: formData.Location,
        Image: formData.Image, // Make sure this is a base64 string
      };



      const response = await axios.post(`${BASE_URL}/api/emp_register`, displayPayload);
      if (response.status === 200) {
        console.log('Registration successful');
        setFormData({
          Empid: '',
          Empmail: '',
          Firstname: '',
          Lastname: '',
          Role: '',
          Practies: '',
          Reportingmanager: '',
          Password: '',
          Image: '', // Clear the image data after successful upload
        });

        setOpenDialog(true);
      } else {
        console.log('Registration failed');
      }
    } catch (error) {
      console.error('Error registering employee:', error);

      if (error.response && error.response.data && error.response.data.error) {
        // Set the specific API error message
        setApiError(error.response.data.error);
      } else {
        // Set a generic error message
        setApiError('An error occurred while communicating with the server.');
      }
    }
    {
      apiError && (
        <div style={{ color: 'red', marginTop: '10px' }}>
          {apiError}
        </div>
      )
    }
  };

  return (
    <div className="login-form">
      <fieldset style={{ backgroundColor: 'white' }}>
        <center>
          <h2 style={{ textAlign: 'center', textTransform: 'uppercase' }}>Registration Form</h2>
        </center>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <TextField
              label="Employee ID"
              variant="outlined"
              type="text"
              name="Empid"
              required
              // placeholder='Enter Your ID'
              value={formData.Empid}
              onChange={handleInputChange}
              error={!!validationErrors.Empid}
              helperText={validationErrors.Empid}
              style={{ width: inputWidth, height: inputHeight }}
              className="form-field-custom-input"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Email"
              variant="outlined"
              type="email"
              name="Empmail"
              required
              value={formData.Empmail}
              onChange={handleInputChange}
              style={{ width: inputWidth, height: inputHeight }}
              error={!!validationErrors.Empmail}
              helperText={validationErrors.Empmail}
              className="form-field-custom-input"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon />
                  </InputAdornment>
                ),
              }}
              InputLabelProps={{
                style: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
              }}
            />

          </div>
          <div style={{ marginBottom: '30px' }}></div>
          <div className="form-row">
            <TextField
              label="First Name"
              variant="outlined"
              type="text"
              // placeholder='Enter Your Firstname'
              name="Firstname"
              error={!!validationErrors.Firstname}
              helperText={validationErrors.Firstname}
              value={formData.Firstname}
              onChange={handleInputChange}
              required
              className="form-field-custom-input"
              style={{ width: inputWidth, height: inputHeight }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Last Name"
              variant="outlined"
              type="text"
              name="Lastname"
              required
              value={formData.Lastname}
              onChange={handleInputChange}
              style={{ width: inputWidth, height: inputHeight }}
              error={!!validationErrors.Lastname}
              helperText={validationErrors.Lastname}
              className="form-field-custom-input"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon />
                  </InputAdornment>
                ),
              }}
            />
          </div>
          <div style={{ marginBottom: '30px' }}></div>
          <div className="form-row">
            <TextField
              select
              label="Role"
              variant="outlined"
              name="Role"
              // placeholder='Select Your Role'
              value={formData.Role || ''}
              onChange={handleInputChange}
              style={{ width: inputWidth, height: inputHeight }}
              error={!!validationErrors.Role}
              helperText={validationErrors.Role}
              className="form-field-custom-dropdown"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SupervisorAccountIcon />
                  </InputAdornment>
                ),
              }}
            >
              {/* <MenuItem value="" disabled>
                Select a role
              </MenuItem> */}
              {roles.map((role) => (
                <MenuItem key={role} value={role}>
                  {role}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Practices"
              variant="outlined"

              name="Practies"
              value={formData.Practies || ''}
              onChange={handleInputChange}
              required
              error={!!validationErrors.Practies}
              helperText={validationErrors.Practies}
              style={{ width: inputWidth, height: inputHeight }}

              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <GroupsIcon />
                  </InputAdornment>
                ),
              }}
            >
              {/* <MenuItem value="" disabled>
                Select a practice
              </MenuItem> */}
              {practices.map((practice) => (
                <MenuItem key={practice} value={practice}>
                  {practice}
                </MenuItem>
              ))}
            </TextField>
          </div>
          <div style={{ marginBottom: '30px' }}></div>
          <div className="form-row">
            <TextField
              label="Reporting Manager"
              variant="outlined"
              select
              name="Reportingmanager"
              value={formData.Reportingmanager || ''}
              onChange={handleInputChange}
              style={{ width: inputWidth, height: inputHeight }}
              error={!!validationErrors.Reportingmanager}
              helperText={validationErrors.Reportingmanager}
              className="form-field-custom-dropdown"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon />
                  </InputAdornment>
                ),
              }}
            >
              {/* <MenuItem value="" disabled>
                Select a manager
              </MenuItem> */}
              {managers.map((manager) => (
                <MenuItem key={manager} value={manager}>
                  {manager}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Password"
              variant="outlined"
              type={showPassword ? "text" : "password"}
              name="Password"
              // placeholder='Enter Your Password'
              value={formData.Password}
              onChange={handleInputChange}
              style={{ width: inputWidth, height: inputHeight }}
              error={!!validationErrors.Password}
              helperText={validationErrors.Password}
              className="form-field-custom-input"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PasswordIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                      style={{ width: '1px', height: '1px', background: '#a9a7a7', marginRight: '0px', marginBottom: '15px' }}
                    >
                      {showPassword ? <VisibilityIcon style={{ color: 'black' }} /> : <VisibilityOffIcon style={{ color: 'black' }} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </div>
          <div style={{ marginBottom: '30px' }}></div>
          <div className="form-row">
            <TextField
              label="Reporting HR"
              variant="outlined"
              select
              name="Reportinghr"
              value={formData.Reportinghr || ''}
              onChange={handleInputChange}
              style={{ width: inputWidth, height: inputHeight }}
              error={!!validationErrors.Reportinghr}
              helperText={validationErrors.Reportinghr}
              className="form-field-custom-dropdown"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon />
                  </InputAdornment>
                ),
              }}
            >
              {/* <MenuItem value="" disabled>
                Select Hr
              </MenuItem> */}
              {hr.map((hr) => (
                <MenuItem key={hr} value={hr}>
                  {hr}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Location"
              variant="outlined"
              select
              name="Location"
              value={formData.Location || ''}
              required
              onChange={handleInputChange}
              style={{ width: inputWidth, height: inputHeight }}
              error={!!validationErrors.Location}
              helperText={validationErrors.Location}
              className="form-field-custom-dropdown"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOnIcon />
                  </InputAdornment>
                ),
              }}
            >
              {/* <MenuItem value="" disabled>
                Select Location
              </MenuItem> */}
              {location.map((location) => (
                <MenuItem key={location} value={location}>
                  {location}
                </MenuItem>
              ))}
            </TextField>
          </div>
          <div></div>
          <div>
            <p><b >Choose your Profile :</b></p>
            <TextField
              variant="outlined"
              type="file"
              name="Image"
              accept="image/*"
              onChange={handleImageUpload}
              error={!!validationErrors.Image}
              helperText={validationErrors.Image}
              style={{ width: inputWidth, height: inputHeight }}

            />
          </div>
          <Dialog open={openDialog} onClose={handleClose}>
            <DialogContent style={{ width: '420px' }}>
              <img
                src="https://badge-exam.miraclesoft.com/assets/ecert/Completed-test.svg"
                alt="Your Image Alt Text"
                style={{ maxWidth: '100%', maxHeight: '200px', display: 'block', margin: 'auto' }}
              />

              <DialogContentText style={{ fontSize: '18px', textAlign: 'center', fontWeight: 'bold', color: '#1dbb99' }}>
                Successfully Registered. Click OK to Login
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose} color="primary" style={{ color: 'white', backgroundColor: '#00aaee', fontWeight: 'bolder', marginBottom: '15px', marginRight: '15px' }}>
                OK
              </Button>
            </DialogActions>
          </Dialog>
          <Button type="submit" className='register-button' variant="contained" color="primary" style={{ width: inputWidth, height: inputHeight }}>
            <b>Register</b>
          </Button>
          <h5>Already have an account? Please <Link to="/login">LOGIN!</Link></h5>
        </form>
      </fieldset>
    </div>
  );
};

export default RegistrationForm;




// const EmployeeDetails = () => {
//   const [employeeData, setEmployeeData] = useState(null);
//   console.log(employeeData, "employeedata");
//   const empId = 8760; // Replace with the desired empid

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const response = await fetch(`http://172.17.15.150:4000/GetKPI/${empId}`);
//         const data = await response.json();
//         console.log(data, "data");

//         // Access the first element of the array
//         if (data && data.message && data.message.length > 0) {
//           setEmployeeData(data.message[0]);
//         } else {
//           console.error('Empty or invalid data received from the API');
//         }
//       } catch (error) {
//         console.error('Error fetching employee data:', error);
//       }
//     };

//     fetchData();
//   }, [empId]);

//   return (
//     <div>
//       {employeeData && (
//         <div>
//           <h2>{`${employeeData.Firstname} ${employeeData.Lastname}`}</h2>
//           {/* <p>Email: {atob(employeeData.Empmail)}</p> */}
//           <p>Role: {employeeData.Role}</p>
//           <p>Practice: {employeeData.Practies}</p>
//           {/* Add other details as needed */}
//           <img src={employeeData.Image} alt="Employee" />
//         </div>
//       )}
//     </div>
//   );
// };

// export default EmployeeDetails;
