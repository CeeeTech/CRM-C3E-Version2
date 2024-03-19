import React, { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import MainCard from 'ui-component/cards/MainCard';
import { Button, CardActions, Divider, InputAdornment, Typography, LinearProgress, Checkbox, FormControlLabel } from '@mui/material';
import { AccountCircle } from '@mui/icons-material';
import config from '../../../config';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useLogout } from '../../../hooks/useLogout';
import { useAuthContext } from '../../../context/useAuthContext';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

export default function UpdateProductForm() {
  const { logout } = useLogout();
  const [selectedUserType, setSelectedUserType] = useState('');
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(true);
  const { user } = useAuthContext();
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
  const showErrorSwal = () => {
    Toast.fire({
      icon: 'error',
      title: 'Error While Saving Product Group'
    });
  };

  const fetchData = async () => {
    try {
      const res = await fetch(config.apiUrl + `api/products`, {
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

  const fetchUserData = async (productsId) => {
    try {
      setLoading(true);
      const res = await fetch(config.apiUrl + `api/product/${productsId}`, {
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
  const productsId = urlParams.get('id');

  useEffect(() => {
    fetchData();
    fetchCourseData();
  }, []);

  useEffect(() => {
    if (productsId) {
      fetchUserData(productsId);
    }
  }, [productsId]);

  const userValidationSchema = Yup.object({
    groupname: Yup.string().required('Name is required'),
    selectedProductTypes: Yup.array()
  });

  const formikUserDetails = useFormik({
    initialValues: {
      groupname: userData.groupname || '',
      selectedProductTypes: selectedProductTypes || []
    },
    validationSchema: userValidationSchema,
    onSubmit: async (values) => {
      console.log('Form values:', values);

      const formData = {
        groupname: values.groupname,
        product_type: selectedProductTypes.join(', ')
      };

      console.log('Form data:', formData);

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
      groupname: userData.groupname || '',
      selectedProductTypes: selectedProductTypes || [] // Initialize as an empty array
    });

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
      <MainCard title={productsId ? 'Update Product Group' : 'Add New Product Group'}>
        {!loading ? (
          <form onSubmit={formikUserDetails.handleSubmit}>
            <Grid container direction="column" justifyContent="center">
              <Grid container spacing={2}>
                {(!productsId || (Object.keys(userData).length > 0 && !loading)) && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="h5" component="h5">
                        Name
                      </Typography>
                      <TextField
                        fullWidth
                        margin="normal"
                        name="groupname"
                        type="text"
                        value={formikUserDetails.values.groupname}
                        onChange={formikUserDetails.handleChange}
                        onBlur={formikUserDetails.handleBlur}
                        error={formikUserDetails.touched.groupname && Boolean(formikUserDetails.errors.groupname)}
                        helperText={formikUserDetails.touched.groupname && formikUserDetails.errors.groupname}
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
                  </>
                )}
              </Grid>
              <Divider sx={{ mt: 3, mb: 2 }} />
              <CardActions sx={{ justifyContent: 'flex-end' }}>
                <Button variant="contained" type="submit">
                  {productsId ? 'Update Product Group' : 'Add Product Group'}
                </Button>
              </CardActions>
            </Grid>
          </form>
        ) : (
          <LinearProgress />
        )}
      </MainCard>
    </>
  );
}
