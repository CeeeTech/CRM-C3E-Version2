import React, { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import MainCard from 'ui-component/cards/MainCard';
import {
  Button,
  CardActions,
  Divider,
  InputAdornment,
  Typography,
  MenuItem,
  LinearProgress,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import { AccountCircle, Lock as LockIcon, Email as EmailIcon, MergeType as MergeTypeIcon } from '@mui/icons-material';
import config from '../../../config';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useLogout } from '../../../hooks/useLogout';
import { useAuthContext } from '../../../context/useAuthContext';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

export default function UpdateForm() {
  const { logout } = useLogout();
  const [userTypes, setUserTypes] = useState([]);
  const [selectedUserType, setSelectedUserType] = useState('');
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(true);
  const { user } = useAuthContext();
  const [showProductType, setShowProductType] = useState(false);
  const [selectedProductTypes, setSelectedProductTypes] = useState([]);

  const [courseData, setCourseData] = useState([]);

  const Toast = withReactContent(
    Swal.mixin({
      toast: true,
      position: 'bottom-end',
      iconColor: 'white',
      customClass: {
        popup: 'colored-toast'
      },
      showConfirmButton: false,
      timer: 3500,
      timerProgressBar: true
    })
  );

  const showSuccessSwal = () => {
    Toast.fire({
      icon: 'success',
      title: 'User Details Saved Successfully.'
    });
  };

  // error showErrorSwal
  const showErrorSwal = () => {
    Toast.fire({
      icon: 'error',
      title: 'Error While Saving Uesr Details.'
    });
  };

  const showPasswordSuccessSwal = () => {
    Toast.fire({
      icon: 'success',
      title: 'User Password Saved Successfully.'
    });
  };

  // error showErrorSwal
  const showPasswordErrorSwal = () => {
    Toast.fire({
      icon: 'error',
      title: 'Error While Saving Uesr Password.'
    });
  };

  const fetchData = async () => {
    try {
      const res = await fetch(config.apiUrl + `api/user_types`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const data = await res.json();
      setUserTypes(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchCourseData = async () => {
    try {
      const res = await fetch(config.apiUrl + `api/courses`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const data = await res.json();
      setCourseData(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchUserData = async (userId) => {
    try {
      setLoading(true);
      const res = await fetch(config.apiUrl + `api/users/${userId}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const userData = await res.json();

      setUserData(userData);
      setSelectedUserType(userData.user_type);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get('id');

  useEffect(() => {
    fetchData();
    fetchCourseData();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchUserData(userId);
    }
  }, [userId]);

  const userValidationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    email: Yup.string().email('Invalid email address').required('Email is required'),
    userType: Yup.string().required('User Type is required'),
    selectedProductTypes: Yup.array()
  });

  const passwordValidationSchema = Yup.object({
    new_password: Yup.string().min(5, 'Password must be at least 5 characters').required('Password is required'),
    conform_password: Yup.string()
      .oneOf([Yup.ref('new_password'), null], 'Passwords must match')
      .required('Confirm Password is required')
  });

  const formikUserDetails = useFormik({
    initialValues: {
      name: userData.name || '',
      email: userData.email || '',
      userType: selectedUserType || '',
      selectedProductTypes: selectedProductTypes || []
    },
    validationSchema: userValidationSchema,
    onSubmit: async (values) => {
      console.log('Form values:', values);

      const formData = {
        name: values.name,
        email: values.email,
        userType: values.userType,
        product_type: selectedProductTypes.join(', ')
      };

      console.log('Form data:', formData);

      try {
        const apiUrl = userId ? config.apiUrl + `api/update-user-byadmin/${userId}` : config.apiUrl + 'api/users/add-new';

        const res = await fetch(apiUrl, {
          method: userId ? 'PATCH' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`
          },
          body: JSON.stringify(formData)
        });

        if (!res.ok) {
          if (res.status === 401) {
            console.error('Unauthorized access. Logging out.');
            logout();
          } else if (res.status === 500) {
            console.error('Internal Server Error.');
            logout();
            return;
          } else {
            showErrorSwal();
          }
          return;
        } else {
          showSuccessSwal();
        }

        console.log('Server response:', await res.json());
      } catch (error) {
        console.error('Error submitting user details form:', error);
        showErrorSwal();
      }
    }
  });

  const formikPassword = useFormik({
    initialValues: {
      new_password: '',
      conform_password: ''
    },
    validationSchema: passwordValidationSchema,
    onSubmit: async (values) => {
      // Check if both passwords are present
      if (!values.new_password || !values.conform_password) {
        console.error('Both new password and confirm password are required.');
        return;
      }

      // Check if passwords match
      if (values.new_password !== values.conform_password) {
        console.error('Passwords do not match.');
        return;
      }

      const formData = {
        password: values.new_password
      };

      try {
        const apiUrl = userId ? config.apiUrl + `api/update-user-password/${userId}` : config.apiUrl + 'api/users/add-new';

        const res = await fetch(apiUrl, {
          method: userId ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`
          },
          body: JSON.stringify(formData)
        });

        if (!res.ok) {
          if (res.status === 401) {
            console.error('Unauthorized access. Logging out.');
            logout();
          } else if (res.status === 500) {
            console.error('Internal Server Error.');
            logout();
            return;
          } else {
            showPasswordErrorSwal();
          }
          return;
        } else {
          showPasswordSuccessSwal();
        }

        console.log('Server response:', await res.json());
      } catch (error) {
        console.error('Error submitting password form:', error);
        showPasswordErrorSwal();
      }
    }
  });

  const handleProductTypeChange = (event) => {
    const { value } = event.target;
    setSelectedProductTypes((prevSelectedProductTypes) => {
      if (prevSelectedProductTypes.includes(value)) {
        return prevSelectedProductTypes.filter((type) => type !== value);
      } else {
        return [...prevSelectedProductTypes, value];
      }
    });

    // Update formik state to use comma-separated string
    formikUserDetails.setValues((prevValues) => ({
      ...prevValues,
      selectedProductTypes: prevSelectedProductTypes.includes(value)
        ? prevSelectedProductTypes.filter((type) => type !== value)
        : [...prevSelectedProductTypes, value]
    }));
  };

  useEffect(() => {
    // Initialize formik values when userData changes for user details form
    formikUserDetails.setValues({
      name: userData.name || '',
      email: userData.email || '',
      userType: selectedUserType || '',
      selectedProductTypes: selectedProductTypes || [] // Initialize as an empty array
    });

    // Set the initial value for showProductType
    const counselorUserType = userTypes.find((userType) => userType.name === 'counselor');
    const admin_counselorUserType = userTypes.find((userType) => userType.name === 'admin_counselor');
    const shouldShowProductType = selectedUserType === counselorUserType?._id || selectedUserType === admin_counselorUserType?._id;
    setShowProductType(shouldShowProductType);

    // Check if product type exists in userData, and set the selectedProductTypes state
    if (userData.product_type) {
      const productTypeIds = userData.product_type.split(',').map((id) => id.trim());
      setSelectedProductTypes(productTypeIds);
    } else {
      // If no product type in userData, set an empty array for selectedProductTypes
      setSelectedProductTypes([]);
    }
  }, [userData, selectedUserType]);

  return (
    <>
      <MainCard title={userId ? 'Update User' : 'Add New User'}>
        {!loading ? (
          <form onSubmit={formikUserDetails.handleSubmit}>
            <Grid container direction="column" justifyContent="center">
              <Grid container spacing={2}>
                {(!userId || (Object.keys(userData).length > 0 && !loading)) && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="h5" component="h5">
                        Name
                      </Typography>
                      <TextField
                        fullWidth
                        margin="normal"
                        name="name"
                        type="text"
                        value={formikUserDetails.values.name}
                        onChange={formikUserDetails.handleChange}
                        onBlur={formikUserDetails.handleBlur}
                        error={formikUserDetails.touched.name && Boolean(formikUserDetails.errors.name)}
                        helperText={formikUserDetails.touched.name && formikUserDetails.errors.name}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <AccountCircle />
                            </InputAdornment>
                          )
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="h5" component="h5">
                        Email
                      </Typography>
                      <TextField
                        fullWidth
                        margin="normal"
                        name="email"
                        type="email"
                        value={formikUserDetails.values.email}
                        onChange={formikUserDetails.handleChange}
                        onBlur={formikUserDetails.handleBlur}
                        error={formikUserDetails.touched.email && Boolean(formikUserDetails.errors.email)}
                        helperText={formikUserDetails.touched.email && formikUserDetails.errors.email}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <EmailIcon />
                            </InputAdornment>
                          )
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="h5" component="h5">
                        User Type
                      </Typography>
                      <TextField
                        fullWidth
                        margin="normal"
                        name="userType"
                        select
                        value={formikUserDetails.values.userType}
                        onChange={(event) => {
                          formikUserDetails.handleChange(event);
                          const counselorUserType = userTypes.find((userType) => userType.name === 'counselor');
                          const admin_counselorUserType = userTypes.find((userType) => userType.name === 'admin_counselor');
                          console.log('Selected User Type ID:', event.target.value);
                          console.log('Counselor User Type ID:', counselorUserType?._id);
                          const shouldShowProductType = event.target.value === counselorUserType?._id || event.target.value === admin_counselorUserType?._id;
                          setShowProductType(shouldShowProductType);
                        }}
                        onBlur={formikUserDetails.handleBlur}
                        error={formikUserDetails.touched.userType && Boolean(formikUserDetails.errors.userType)}
                        helperText={formikUserDetails.touched.userType && formikUserDetails.errors.userType}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <MergeTypeIcon />
                            </InputAdornment>
                          )
                        }}
                      >
                        <MenuItem value="">Select User Type</MenuItem>
                        {userTypes.map((userType) => (
                          <MenuItem key={userType._id} value={userType._id}>
                            {userType.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    {showProductType && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="h5" component="h5">
                          Product Type
                        </Typography>
                        {courseData.map((course) => (
                          <FormControlLabel
                            key={course._id}
                            control={
                              <Checkbox
                                checked={selectedProductTypes.includes(course._id)}
                                onChange={handleProductTypeChange}
                                value={course._id}
                              />
                            }
                            label={course.name}
                            sx={{
                              marginBottom: '10px',
                              display: 'block'
                            }}
                          />
                        ))}
                      </Grid>
                    )}
                  </>
                )}
              </Grid>
              <Divider sx={{ mt: 3, mb: 2 }} />
              <CardActions sx={{ justifyContent: 'flex-end' }}>
                <Button variant="contained" type="submit">
                  {userId ? 'Update User' : 'Add User'}
                </Button>
              </CardActions>
            </Grid>
          </form>
        ) : (
          <LinearProgress />
        )}
      </MainCard>
      <div style={{ marginTop: '20px' }}></div>
      <MainCard title={userId ? 'Update Password' : 'Add New User'}>
        <form onSubmit={formikPassword.handleSubmit}>
          <Grid container direction="column" justifyContent="center">
            <Grid container spacing={2}>
              {(!userId || (Object.keys(userData).length > 0 && !loading)) && (
                <>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="h5" component="h5">
                      New Password
                    </Typography>
                    <TextField
                      fullWidth
                      margin="normal"
                      name="new_password"
                      type="password"
                      value={formikPassword.values.new_password}
                      onChange={formikPassword.handleChange}
                      onBlur={formikPassword.handleBlur}
                      error={formikPassword.touched.new_password && Boolean(formikPassword.errors.new_password)}
                      helperText={formikPassword.touched.new_password && formikPassword.errors.new_password}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="h5" component="h5">
                      Confirm Password
                    </Typography>
                    <TextField
                      fullWidth
                      margin="normal"
                      name="conform_password"
                      type="password"
                      value={formikPassword.values.conform_password}
                      onChange={formikPassword.handleChange}
                      onBlur={formikPassword.handleBlur}
                      error={formikPassword.touched.conform_password && Boolean(formikPassword.errors.conform_password)}
                      helperText={formikPassword.touched.conform_password && formikPassword.errors.conform_password}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>
                </>
              )}
            </Grid>
            <Divider sx={{ mt: 3, mb: 2 }} />
            <CardActions sx={{ justifyContent: 'flex-end' }}>
              <Button variant="contained" type="submit">
                {userId ? 'Update Password' : 'Add User'}
              </Button>
            </CardActions>
          </Grid>
        </form>
      </MainCard>
    </>
  );
}
