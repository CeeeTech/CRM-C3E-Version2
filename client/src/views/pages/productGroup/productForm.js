import React, { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import MainCard from 'ui-component/cards/MainCard';
import { Button, CardActions, Divider, InputAdornment, Typography, useMediaQuery, Checkbox, FormControlLabel } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { AccountCircle } from '@mui/icons-material';
import config from '../../../config';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import CircularProgress from '@mui/material/CircularProgress';
import { useAuthContext } from '../../../context/useAuthContext';
import { useLogout } from '../../../hooks/useLogout';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

export default function ProductForm() {
  const { logout } = useLogout();
  const { user } = useAuthContext();
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('md'));
  // const [selectedUserType, setSelectedUserType] = useState('');
  // const [showProductType, setShowProductType] = useState(false);
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
      title: 'Product Group Saved Successfully.'
    });
  };

  // error showErrorSwal
  const showErrorSwal = (customErrorTitle) => {
    Toast.fire({
      icon: 'error',
      title: customErrorTitle || 'Error While Saving Product Group.'
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
  const productsId = urlParams.get('id');

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        if (productsId) {
          const res = await fetch(config.apiUrl + `api/product/${productsId}`, {
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
          setProductData(data);
          console.log('Product data:', data);
        }
      } catch (error) {
        console.error('Error fetching Product data:', error);
      }
    };

    fetchProductData();
  }, [productsId]);

  const formik = useFormik({
    initialValues: {
      groupname: '',
      product_type: ''
      // Add other initial values
    },
    validationSchema: Yup.object({
      groupname: Yup.string().required('Name is required'),
      product_type: Yup.array()
      // Add other validation rules
    }),
    onSubmit: async (values) => {
      // Get an array of selected product type names
      const selectedProductTypeNames = courseData.filter((course) => selectedProductTypes.includes(course.id)).map((course) => course.id);

      const formData = {
        groupname: values.groupname,
        product_type: selectedProductTypeNames.join(', ')
      };

      try {
        const apiUrl = productsId ? config.apiUrl + `api/product-form-update/${productsId}` : config.apiUrl + 'api/product-form-add-new';

        const res = await fetch(apiUrl, {
          method: productsId ? 'PUT' : 'POST',
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
      <MainCard title={productsId ? 'Update Product Group ' : 'Add Product Group'}>
        <form onSubmit={formik.handleSubmit}>
          <Grid container direction="column" justifyContent="center">
            <Grid container sx={{ p: 3 }} spacing={matchDownSM ? 0 : 2}>
              {(!productsId || (Object.keys(userData).length > 0 && !loading)) && (
                <>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="h5" component="h5">
                      Group Name
                    </Typography>
                    <TextField
                      fullWidth
                      disabled={productsId ? true : false}
                      margin="normal"
                      name="groupname"
                      type="text"
                      value={formik.values.groupname}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.groupname && Boolean(formik.errors.groupname)}
                      helperText={formik.touched.groupname && formik.errors.groupname}
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
                {productsId ? 'Update Product ' : 'Add Product '}
              </Button>
            </CardActions>
          </Grid>
        </form>
      </MainCard>
    </>
  );
}
