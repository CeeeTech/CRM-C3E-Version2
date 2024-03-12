import * as React from 'react';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import MainCard from 'ui-component/cards/MainCard';
import { Button, CardActions, Divider, InputAdornment, Typography, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DateRangeIcon from '@mui/icons-material/DateRange';
import EmailIcon from '@mui/icons-material/Email';
import HomeIcon from '@mui/icons-material/Home';
import CallIcon from '@mui/icons-material/Call';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BroadcastOnPersonalIcon from '@mui/icons-material/BroadcastOnPersonal';
import { useEffect } from 'react';
import { useState } from 'react';
import config from '../../../config';
import { useAuthContext } from '../../../context/useAuthContext';
import PersonIcon from '@mui/icons-material/Person';
import WidthFullIcon from '@mui/icons-material/WidthFull';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { useLogout } from '../../../hooks/useLogout';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import CircularProgress from '@mui/material/CircularProgress';

export default function LeadForm() {
  const theme = useTheme();
  const { user } = useAuthContext();
  const { logout } = useLogout();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('md'));

  const [branches, setBranches] = useState([]);
  const [courses, setCourses] = useState([]);
  // const [statuses, setStatuses] = useState([]);

  const date = new Date();
  const formattedDate = date.toISOString().split('T')[0];

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
      title: 'Lead Added Successfully.'
    });
  };

  // error showErrorSwal
  const showErrorSwal = (customErrorTitle) => {
    Toast.fire({
      icon: 'error',
      title: customErrorTitle || 'Error Adding Lead.'
    });
  };

  const [leadData, setLeadData] = useState({
    name: '',
    nic: '',
    dob: '',
    email: '',
    contact_no: '',
    address: '',
    date: formattedDate,
    scheduled_to: '',
    course: '',
    branch: ''
  });

  const fetchCourses = async () => {
    try {
      const response = await fetch(config.apiUrl + 'api/courses', {
        method: 'GET',
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (response.ok) {
        const json = await response.json();
        setCourses(json);
      } else {
        if (res.status === 401) {
          console.error('Unauthorized access. Logging out.');
          logout();
        } else if (res.status === 500) {
          console.error('Internal Server Error.');
          logout();
          return;
        } else {
          console.error('Error fetching courses:', response.statusText);
        }
        return;
      }
    } catch (error) {
      console.error('Error fetching courses:', error.message);
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await fetch(config.apiUrl + 'api/branches', {
        method: 'GET',
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (response.ok) {
        const json = await response.json();
        setBranches(json);
      } else {
        if (response.status === 401) {
          console.error('Unauthorized access. Logging out.');
          logout();
        } else if (response.status === 500) {
          console.error('Internal Server Error.');
          logout();
          return;
        } else {
          console.error('Error fetching branches:', response.statusText);
        }
      }
    } catch (error) {
      console.error('Error fetching branches:', error.message);
    }
  };

  const fetchStatuses = async () => {
    try {
      const response = await fetch(config.apiUrl + 'api/status', {
        method: 'GET',
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (response.ok) {
        const json = await response.json();
        setStatuses(json);
      } else {
        if (response.status === 401) {
          console.error('Unauthorized access. Logging out.');
          logout();
        } else if (response.status === 500) {
          console.error('Internal Server Error.');
          logout();
          return;
        } else {
          console.error('Error fetching statuses:', response.statusText);
        }
      }
    } catch (error) {
      console.error('Error fetching statuses:', error.message);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchBranches();
    fetchStatuses();
    console.log(formattedDate);
  }, []);

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    console.log('Submitting form with values:', values);
    // let student_id = '';

    try {
      // Check duplicate lead
      const checkDuplicate = await fetch(
        config.apiUrl + `api/checkLead?courseName=${values.course}&branchName=${values.branch}&studentNIC=${values.nic}`,
        {
          method: 'GET',
          headers: { Authorization: `Bearer ${user.token}` }
        }
      );

      if (!checkDuplicate.ok) {
        console.error('Error checking duplicates', checkDuplicate.statusText);
        return;
      }

      const duplicateLead = await checkDuplicate.json();

      console.log('Check', duplicateLead.isDuplicate);

      if (duplicateLead.isDuplicate) {
        console.log('Lead already exists');
        showErrorSwal("Lead with the same student's NIC, course and branch already exists.");
        return;
      }

      // Check if student already exists by NIC or email
      const checkStudent = await fetch(config.apiUrl + `api/students?nic=${values.nic}&email=${values.email}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${user.token}` }
      });

      if (!checkStudent.ok) {
        console.error('Error checking existing student', checkStudent.statusText);
        return;
      }

      const existingStudents = await checkStudent.json();

      // Filter the array to get only the matched student
      const matchedStudent = existingStudents.find((student) => student.nic === values.nic || student.email === values.email);

      if (matchedStudent) {
        console.log('Matched Student:', matchedStudent);
        const { isConfirmed } = await Swal.fire({
          title: 'Student already exists',
          text: `Student ${matchedStudent.name} already exists. Do you want to proceed with the existing student?`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes',
          cancelButtonText: 'No'
        });

        if (!isConfirmed) {
          console.log('User chose not to add lead to existing student');
          return;
        } else {
          //add lead
          const leadResponse = await fetch(config.apiUrl + 'api/leadswithstudent', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${user.token}`
            },
            body: JSON.stringify({
              date: values.date,
              scheduled_to: values.scheduled_to,
              course_name: values.course,
              branch_name: values.branch,
              student_id: matchedStudent._id,
              user_id: user?._id,
            })
          });

          if (!leadResponse.ok) {
            console.error('Error inserting data to the lead table', leadResponse.statusText);
            return;
          }
          console.log('Data inserted successfully!');
          showSuccessSwal();
        }
      } else {

        const leadResponse = await fetch(config.apiUrl + 'api/leads', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`
          },
          body: JSON.stringify({
            date: values.date,
            scheduled_to: values.scheduled_to,
            course_name: values.course,
            branch_name: values.branch,
            // student_id: student_id,
            user_id: user?._id,
            name: values.name,
            dob: values.dob,
            contact_no: values.contact_no,
            email: values.email,
            address: values.address,
            nic: values.nic
          })
        });

        if (!leadResponse.ok) {
          console.error('Error inserting data to the lead table', leadResponse.statusText);
          return;
        }

        console.log('Data inserted successfully!');
        showSuccessSwal();

      }

      setLeadData({
        name: '',
        dob: '',
        email: '',
        contact_no: '',
        address: '',
        date: formattedDate,
        scheduled_to: '',
        course: 'Computer Science',
        branch: 'Colombo'
      });
    } catch (error) {
      console.error('Error during data insertion:', error.message);
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
      <MainCard title="Add Lead">
        <Formik
          initialValues={{
            name: leadData.name || '',
            nic: leadData.nic || '',
            address: leadData.address || '',
            contact_no: leadData.contact_no || '',
            email: leadData.email || '',
            course: leadData.course || '',
            date: leadData.date || '',
            branch: leadData.branch || '',
            dob: leadData.dob || '',
            scheduled_to: leadData.scheduled_to || ''
          }}
          validationSchema={Yup.object().shape({
            name: Yup.string().required('Name is required'),
            nic: Yup.string()
              .matches(
                /^(?:\d{9}[vVxX]|\d{12})$/,
                'NIC should either contain 9 digits with an optional last character as a letter (v/V/x/X) or have exactly 12 digits'
              )
              .required('NIC is required'),
            dob: Yup.string().required('Date of birth is required'),
            contact_no: Yup.string()
              .matches(/^\+?\d{10,12}$/, 'Contact No should be 10 to 12 digits with an optional leading + sign')
              .required('Contact No is required'),
            email: Yup.string().email('Invalid email format').required('Email is required'),
            course: Yup.string().required('Course is required'),
            branch: Yup.string().required('Branch is required')
          })}
          onSubmit={handleSubmit}
        >
          {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
            <form autoComplete="off" noValidate onSubmit={handleSubmit}>
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
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.name}
                      error={Boolean(touched.name && errors.name)}
                      helperText={touched.name && errors.name}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="h5" component="h5">
                      NIC
                    </Typography>
                    <TextField
                      fullWidth
                      margin="normal"
                      name="nic"
                      type="text"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.nic}
                      error={Boolean(touched.nic && errors.nic)}
                      helperText={touched.nic && errors.nic}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <WidthFullIcon />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="h5" component="h5">
                      Date of birth
                    </Typography>
                    <TextField
                      fullWidth
                      // label="First Name"
                      margin="normal"
                      name="dob"
                      type="date"
                      onChange={handleChange}
                      value={values.dob}
                      onBlur={handleBlur}
                      error={Boolean(touched.dob && errors.dob)}
                      helperText={touched.dob && errors.dob}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <DateRangeIcon />
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
                      // label="First Name"
                      margin="normal"
                      name="email"
                      type="email"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      value={values.email}
                      error={Boolean(touched.email && errors.email)}
                      helperText={touched.email && errors.email}
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
                      Contact Number
                    </Typography>
                    <TextField
                      fullWidth
                      // label="First Name"
                      margin="normal"
                      name="contact_no"
                      type="text"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.contact_no}
                      error={Boolean(touched.contact_no && errors.contact_no)}
                      helperText={touched.contact_no && errors.contact_no}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CallIcon />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={12}>
                    <Typography variant="h5" component="h5">
                      Address
                    </Typography>
                    <TextField
                      fullWidth
                      // label="First Name"
                      margin="normal"
                      name="address"
                      type="text"
                      onChange={handleChange}
                      value={values.address}
                      onBlur={handleBlur}
                      error={Boolean(touched.address && errors.address)}
                      helperText={touched.address && errors.address}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <HomeIcon />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="h5" component="h5">
                      Date
                    </Typography>
                    <TextField
                      fullWidth
                      // label="First Name"
                      margin="normal"
                      name="date"
                      type="text"
                      disabled
                      onChange={handleChange}
                      value={values.date}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <DateRangeIcon />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="h5" component="h5">
                      Scheduled To
                    </Typography>
                    <TextField
                      fullWidth
                      // label="First Name"
                      margin="normal"
                      name="scheduled_to"
                      type="date"
                      onChange={handleChange}
                      value={values.scheduled_to}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EventAvailableIcon />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="h5" component="h5">
                      Select Course
                    </Typography>
                    <TextField
                      fullWidth
                      // label="First Name"
                      margin="normal"
                      name="course"
                      select
                      onChange={handleChange}
                      onBlur={handleBlur}
                      SelectProps={{ native: true }}
                      value={values.course}
                      error={Boolean(touched.course && errors.course)}
                      helperText={touched.course && errors.course}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AssignmentIcon />
                          </InputAdornment>
                        )
                      }}
                    >
                      {values.course == '' ? (
                        <option value="" disabled>
                          Select Course
                        </option>
                      ) : (
                        <></>
                      )}
                      {courses && courses.length > 0 ? (
                        courses.map((option) => (
                          <option key={option._id} value={option.name}>
                            {option.name}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>
                          No Courses available
                        </option>
                      )}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="h5" component="h5">
                      Select Branch
                    </Typography>
                    <TextField
                      fullWidth
                      // label="First Name"
                      margin="normal"
                      name="branch"
                      select
                      SelectProps={{ native: true }}
                      value={values.branch}
                      onBlur={handleBlur}
                      onChange={handleChange}
                      error={Boolean(touched.branch && errors.branch)}
                      helperText={touched.branch && errors.branch}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <BroadcastOnPersonalIcon />
                          </InputAdornment>
                        )
                      }}
                    >
                      {values.branch == '' ? (
                        <option value="" disabled>
                          Select Branch
                        </option>
                      ) : (
                        <></>
                      )}
                      {branches && branches.length > 0 ? (
                        branches.map((option) => (
                          <option key={option._id} value={option.name}>
                            {option.name}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>
                          No Branches available
                        </option>
                      )}
                    </TextField>
                  </Grid>
                </Grid>
                <Divider sx={{ mt: 3, mb: 2 }} />
                <CardActions sx={{ justifyContent: 'flex-end' }}>
                  <Button variant="contained" type="submit" 
                  disabled={isSubmitting} 
                  endIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}>
                    Add Lead
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
