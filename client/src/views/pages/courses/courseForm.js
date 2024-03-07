import * as React from 'react';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import MainCard from 'ui-component/cards/MainCard';
import { Button, CardActions, Divider, InputAdornment, Typography, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import AssignmentIcon from '@mui/icons-material/Assignment';
// import TextareaAutosize from '@mui/material/TextareaAutosize';
// import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import * as Yup from 'yup';
import { Formik } from 'formik';
import config from '../../../config';
import CodeIcon from '@mui/icons-material/Code';
import { Field } from 'formik';
import { useAuthContext } from '../../../context/useAuthContext';
import { useLogout } from '../../../hooks/useLogout';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import CircularProgress from '@mui/material/CircularProgress';

export default function CourseForm() {
  const { user } = useAuthContext();
  const theme = useTheme();
  const { logout } = useLogout();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('md'));
  // const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get('id');

  const [courseData, setCourseData] = useState({
    name: '',
    description: '',
    code: ''
  });

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
      title: 'Course Details Saved Successfully.'
    });
  };

  // error showErrorSwal
  const showErrorSwal = () => {
    Toast.fire({
      icon: 'error',
      title: 'Error While Saving Course Details.'
    });
  };

  // Fetch course data for update if courseId is available
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        if (courseId) {
          const res = await fetch(config.apiUrl + `api/courses/${courseId}`, {
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
          setCourseData(data);
        }
      } catch (error) {
        console.error('Error fetching course data:', error);
      }
    };

    fetchCourseData();
  }, [courseId]);

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    console.log('Submitting form with values:', values);

    const formData = {
      name: values.name,
      description: values.description,
      rate: values.rate,
      code: values.code
    };

    try {
      const url = courseId ? config.apiUrl + `api/course-form-update/${courseId}` : config.apiUrl + 'api/course-form-add-new';

      const method = courseId ? 'PUT' : 'POST';

      console.log('Submitting request to:', url);
      const res = await fetch(url, {
        method,
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
        }

        if (res.status === 500) {
          console.error('Internal Server Error.');
          logout();
          return;
        }
        return;
      }

      console.log('Request complete.');
      const response = await res.json();
      console.log('Server response:', response);

      // Display success messages
      showSuccessSwal();
    } catch (error) {
      // Set error message
      console.error('Error submitting form:', error);
      showErrorSwal();

      // Set formik errors
      setFieldError('submit', error.message);
    } finally {
      // Always set submitting to false, regardless of success or failure
      setSubmitting(false);
    }
  };

  return (
    <>
      <MainCard title={courseId ? 'Update Course' : 'Add New Course'}>
        <Formik
          initialValues={{
            name: courseData.name || '',
            description: courseData.description || '',
            rate: courseData.rate || '',
            code: courseData.code || ''
          }}
          validationSchema={Yup.object().shape({
            name: Yup.string().required('Name is required'),
            description: Yup.string().required('Description is required'),
            rate: Yup.number().required('Rate is required'),
            code: Yup.string().required('Course Code is required')
          })}
          onSubmit={handleSubmit}
        >
          {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
            <form onSubmit={handleSubmit}>
              <Grid container direction="column" justifyContent="center">
                <Grid container sx={{ p: 3 }} spacing={matchDownSM ? 0 : 2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="h5" component="h5">
                      Name
                    </Typography>
                    <TextField
                      fullWidth
                      margin="normal"
                      name="name"
                      type="text"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      value={values.name}
                      error={Boolean(touched.name && errors.name)}
                      helperText={touched.name && errors.name}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AssignmentIcon />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="h5" component="h5">
                      Course Code
                    </Typography>
                    <TextField
                      fullWidth
                      margin="normal"
                      name="code"
                      type="text"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      value={values.code}
                      error={Boolean(touched.code && errors.code)}
                      helperText={touched.code && errors.code}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CodeIcon />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="h5" component="h5">
                      Course Rate
                    </Typography>
                    <TextField
                      fullWidth
                      margin="normal"
                      name="rate"
                      type="number"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      value={values.rate}
                      error={Boolean(touched.rate && errors.rate)}
                      helperText={touched.rate && errors.rate}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CodeIcon />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={12}>
                    <Typography variant="h5" component="h5">
                      Description
                    </Typography>
                    <Field name="description">
                      {({ field, meta }) => (
                        <>
                          <TextField
                            multiline
                            minRows={8}
                            fullWidth
                            margin="normal"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            {...field}
                            value={values.description}
                            error={Boolean(touched.description && errors.description)}
                            helperText={
                              meta.touched && meta.error ? (
                                <div style={{ color: 'red', fontSize: '0.75rem', marginTop: '0.25rem' }}>{meta.error}</div>
                              ) : null
                            }
                          />
                        </>
                      )}
                    </Field>
                  </Grid>
                  <Divider />
                </Grid>
                <Divider sx={{ mt: 3, mb: 2 }} />
                <CardActions sx={{ justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    type="submit"
                    disabled={isSubmitting}
                    endIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
                  >
                    {courseId ? 'Update Course' : 'Add Course'}
                  </Button>
                </CardActions>
              </Grid>
            </form>
          )}
        </Formik>
      </MainCard>
    </>
  );
}
