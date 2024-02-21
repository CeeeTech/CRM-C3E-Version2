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
  useMediaQuery,
  MenuItem,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { AccountCircle, Lock as LockIcon, Email as EmailIcon, MergeType as MergeTypeIcon } from '@mui/icons-material';
import config from '../../../config';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import CircularProgress from '@mui/material/CircularProgress';
import { useAuthContext } from '../../../context/useAuthContext';
import { useLogout } from '../../../hooks/useLogout';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

export default function UserForm() {
  const { logout } = useLogout();
  const { user } = useAuthContext();
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('md'));
  const [userTypes, setUserTypes] = useState([]);
  // const [selectedUserType, setSelectedUserType] = useState('');
  const [showProductType, setShowProductType] = useState(false);
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(false);
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
  const showErrorSwal = (customErrorTitle) => {
    Toast.fire({
      icon: 'error',
      title: customErrorTitle || 'Error While Saving Uesr Details.'
    });
  };

  useEffect(() => {
    fetchCourseDetails();
  }, []);

  async function fetchCourseDetails() {
    try {
      const response = await fetch(config.apiUrl + 'api/courses', {
        method: 'GET',
        headers: { Authorization: `Bearer ${user.token}` }
      });

      if (!response.ok) {
        if (response.status === 401) {
          logout();
        } else if (response.status === 500) {
          console.error('Internal Server Error.');
          logout();
          return;
        } else {
          console.log('Error fetching courses');
        }
        retun;
      }

      const allCourses = await response.json();

      // Filter courses where status is true
      const filteredCourses = allCourses.filter((course) => course.status === true);

      // Apply transformation to each course in filteredCourses
      const formattedData = filteredCourses.map((course) => ({ id: course._id, ...course }));

      setCourseData(formattedData);
    } catch (error) {
      console.error('Error fetching data:', error.message);
    }
  }

  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get('id');

  const fetchData = async () => {
    try {
      const res = await fetch(config.apiUrl + `api/user_types`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (!res.ok) {
        if (res.status === 401) {
          console.error('Unauthorized access. Logging out.');
          logout();
        }
        if (res.status === 500) {
          console.error('Internal Server Error.');
          logout();
          return;
        }
        return;
      }
      const data = await res.json();
      setUserTypes(data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchUserData = async (userId) => {
    try {
      setLoading(true);
      const res = await fetch(config.apiUrl + `api/users/${userId}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${user.token}` }
      });

      if (!res.ok) {
        if (res.status === 401) {
          console.error('Unauthorized access. Logging out.');
          logout();
        }
        if (res.status === 500) {
          console.error('Internal Server Error.');
          logout();
          return;
        }
        return;
      }

      const userData = await res.json();

      // Set user data in the state
      setUserData(userData);

      // Set selected user type using the mapping
      setSelectedUserType(userData.user_type);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    if (userId) {
      fetchUserData(userId);
    }
    // Reset success and error messages when the component mounts
  }, [userId]);

  const formik = useFormik({
    initialValues: {
      name: '',
      password: '',
      email: '',
      userType: ''
      // Add other initial values
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Name is required'),
      password: Yup.string().min(5, 'Password must be at least 5 characters').required('Password is required'),
      email: Yup.string().email('Invalid email address').required('Email is required'),
      userType: Yup.string().required('User Type is required'),
      selectedProductTypes: Yup.array()
      // Add other validation rules
    }),
    onSubmit: async (values) => {
      // Map selectedUserType from ID to Name
      const mappedUserType = userTypes.find((userType) => userType._id === values.userType)?.name || '';

      // Get an array of selected product type names
      const selectedProductTypeNames = courseData.filter((course) => selectedProductTypes.includes(course.id)).map((course) => course.id);

      const formData = {
        name: values.name,
        password: values.password,
        email: values.email,
        user_type: mappedUserType,
        product_type: selectedProductTypeNames.join(', ')
      };

      try {
        const apiUrl = userId ? config.apiUrl + `api/users/${userId}` : config.apiUrl + 'api/users/add-new';

        const res = await fetch(apiUrl, {
          method: userId ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`
          },
          body: JSON.stringify(formData)
        });

        // Check for success or error and set messages accordingly
        if (res.ok) {
          showSuccessSwal();
        } else {
          if (res.status === 401) {
            console.error('Unauthorized access. Logging out.');
            logout();
          } else if (res.status === 500) {
            console.error('Internal Server Error.');
            logout();
            return;
          } else if (res.status === 400) {
            showErrorSwal('Email already exists');
            showErrorSwal();
          } else {
            showErrorSwal();
          }
          return;
        } 
      } catch (error) {
        console.error('Error submitting form:', error);
        // Set error message
        console.log('Server response:', response);
        if (res.status === 400) {
          showErrorSwal(res.message);
        } else {
          showErrorSwal();
        }
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
    formik.setFieldValue('selectedProductTypes', selectedProductTypes);
  };

  return (
    <>
      <MainCard title={userId ? 'Update User' : 'Add New User'}>
        <form onSubmit={formik.handleSubmit}>
          <Grid container direction="column" justifyContent="center">
            <Grid container sx={{ p: 3 }} spacing={matchDownSM ? 0 : 2}>
              {(!userId || (Object.keys(userData).length > 0 && !loading)) && (
                <>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="h5" component="h5">
                      Name
                    </Typography>
                    <TextField
                      fullWidth
                      disabled={userId ? true : false}
                      margin="normal"
                      name="name"
                      type="text"
                      value={formik.values.name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.name && Boolean(formik.errors.name)}
                      helperText={formik.touched.name && formik.errors.name}
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
                      Password
                    </Typography>
                    <TextField
                      fullWidth
                      margin="normal"
                      name="password"
                      type="password"
                      disabled={userId ? true : false}
                      value={formik.values.password}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.password && Boolean(formik.errors.password)}
                      helperText={formik.touched.password && formik.errors.password}
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
                      Email
                    </Typography>
                    <TextField
                      fullWidth
                      margin="normal"
                      name="email"
                      type="email"
                      disabled={userId ? true : false}
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.email && Boolean(formik.errors.email)}
                      helperText={formik.touched.email && formik.errors.email}
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
                      value={formik.values.userType}
                      onChange={(event) => {
                        formik.handleChange(event);
                        const counselorUserType = userTypes.find((userType) => userType.name === 'counselor');
                        const admin_counselorUserType = userTypes.find((userType) => userType.name === 'admin_counselor');
                        console.log('Selected User Type ID:', event.target.value);
                        console.log('Counselor User Type ID:', counselorUserType?._id);
                        const shouldShowProductType = event.target.value === counselorUserType?._id || event.target.value === admin_counselorUserType?._id;
                        setShowProductType(shouldShowProductType);
                      }}
                      onBlur={formik.handleBlur}
                      error={formik.touched.userType && Boolean(formik.errors.userType)}
                      helperText={formik.touched.userType && formik.errors.userType}
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
                          key={course.id}
                          control={
                            <Checkbox
                              checked={selectedProductTypes.includes(course.id)}
                              onChange={handleProductTypeChange}
                              value={course.id}
                            />
                          }
                          label={course.name}
                          sx={{
                            marginBottom: '10px',
                            display: 'block'
                          }}
                        />
                      ))}
                      {/* Display error for Product Type checkboxes */}
                      {formik.touched.selectedProductTypes && formik.errors.selectedProductTypes && (
                        <Typography color="error">{formik.errors.selectedProductTypes}</Typography>
                      )}
                    </Grid>
                  )}
                </>
              )}
            </Grid>
            <Divider sx={{ mt: 3, mb: 2 }} />
            <CardActions sx={{ justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                type="submit"
                disabled={formik.isSubmitting}
                endIcon={formik.isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {userId ? 'Update User' : 'Add User'}
              </Button>
            </CardActions>
          </Grid>
        </form>
      </MainCard>
    </>
  );
}
