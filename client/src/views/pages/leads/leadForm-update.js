import * as React from 'react';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import MainCard from 'ui-component/cards/MainCard';
import { Button, CardActions, InputAdornment, Typography, useMediaQuery, LinearProgress } from '@mui/material';
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
import { Box } from '@mui/system';
import AddIcon from '@mui/icons-material/Add';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import config from '../../../config';
import { useAuthContext } from '../../../context/useAuthContext';
import PersonIcon from '@mui/icons-material/Person';
import WidthFullIcon from '@mui/icons-material/WidthFull';
import LeadfollowUp from './leadFollowUp';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { useLogout } from '../../../hooks/useLogout';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import CircularProgress from '@mui/material/CircularProgress';

export default function LeadForm() {
  const [sid, setSid] = useState('');
  const { logout } = useLogout();
  const date = new Date();
  const formattedDate = date.toISOString().split('T')[0];
  const theme = useTheme();
  const { user } = useAuthContext();

  const matchDownSM = useMediaQuery(theme.breakpoints.down('md'));

  // State variables for selected IDs

  const [branches, setBranches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [statuses, setStatuses] = useState([]);

  const [loading, setLoading] = useState(true); // Loading state

  const [statusForm, setStatusForm] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);
  const leadId = urlParams.get('id');

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
      title: 'Lead Updated Successfully.'
    });
  };

  // error showErrorSwal
  const showErrorSwal = () => {
    Toast.fire({
      icon: 'error',
      title: 'Error Updating Lead.'
    });
  };

  // show successFollowupSwal
  const showSuccessFollowupSwal = () => {
    Toast.fire({
      icon: 'success',
      title: 'Followup Added Successfully.'
    });
  };

  // error showErrorSwal for followup
  const showErrorFollowupSwal = () => {
    Toast.fire({
      icon: 'error',
      title: 'Error Adding Followup.'
    });
  };

  const [values, setValues] = useState({
    name: '',
    dob: '',
    email: '',
    nic: '',
    contact_no: '',
    address: '',
    date: formattedDate,
    scheduled_to: '',
    course: 'Select Course',
    branch: 'Select Branch',
    status: 'Select Status',
    comment: '',
    // updateDate: formattedDate,
    followupId: ''
  });

  const fetchLeadData = async () => {
    try {
      const response = await fetch(config.apiUrl + `api/leads/${leadId}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${user.token}` }
      });

      if (response.ok) {
        const json = await response.json();
        // Initialize Formik values with lead data
        setValues(json);
        setSid(json.student_id);
        console.log(json.name);

        console.log('Lead data:', json);
      } else {
        if (response.status === 401) {
          console.error('Unauthorized access. Logging out.');
          logout();
        } else if (response.status === 500) {
          console.error('Internal Server Error.');
          logout();
          return;
        } else {
          console.error('Error fetching lead data:', response.statusText);
        }
        return;
      }
    } catch (error) {
      console.error('Error fetching lead data:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch(config.apiUrl + 'api/courses', {
        method: 'GET',
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (response.ok) {
        const json = await response.json();
        setCourses(json);
        console.log(json);
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
        console.log(json);
      } else {
        if (res.status === 401) {
          console.error('Unauthorized access. Logging out.');
          logout();
        } else if (res.status === 500) {
          console.error('Internal Server Error.');
          logout();
          return;
        } else {
          console.error('Error fetching branches:', response.statusText);
        }
        return;
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

        // remove the "new" status from the list of statuses (status.name)
        const json1 = json.filter((status) => status.name !== 'New');
        console.log(json1);

        console.log(json1);
        setStatuses(json1);
      } else {
        if (res.status === 401) {
          console.error('Unauthorized access. Logging out.');
          logout();
        } else if (res.status === 500) {
          console.error('Internal Server Error.');
          logout();
          return;
        } else {
          console.error('Error fetching  status:', response.statusText);
        }
        return;
      }
    } catch (error) {
      console.error('Error fetching status:', error.message);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchBranches();
    fetchStatuses();
    if (leadId) {
      setLoading(true);
      fetchLeadData();
    }
  }, []);

  const handleUpdate = async (values, { setSubmitting, setFieldError }) => {
    console.log(values);

    try {
      const updateStudentData = {
        name: values.name,
        dob: values.dob,
        email: values.email,
        nic: values.nic,
        contact_no: values.contact_no,
        address: values.address
      };

      console.log(updateStudentData);
      console.log(sid);
      const updatestudent = await fetch(config.apiUrl + `api/students/${sid}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify(updateStudentData)
      });

      if (!updatestudent.ok) {
        if (updatestudent.status === 401) {
          console.error('Unauthorized access. Logging out.');
          logout();
        } else if (updatestudent.status === 500) {
          console.error('Internal Server Error.');
          logout();
          return;
        } else {
          console.error('Error updating student:', updatestudent.statusText);
          showErrorSwal();
        }
        return;
      }
      console.log('only student updated');

      const course_id = courses.find((course) => course.name === values.course)._id;
      const branch_id = branches.find((branch) => branch.name === values.branch)._id;

      //update lead data
      const updateLeadData = {
        user_id: user?._id,
        student_id: sid,
        course_id: course_id,
        branch_id: branch_id,
        scheduled_to: values.scheduled_to == 'NaN-NaN-NaN'? '' : values.scheduled_to
      };

      const updateLead = await fetch(config.apiUrl + `api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify(updateLeadData)
      });
      if (!updateLead.ok) {
        if (updateLead.status === 401) {
          console.error('Unauthorized access. Logging out.');
          logout();
        } else if (updateLead.status === 500) {
          console.error('Internal Server Error.');
          logout();
          return;
        } else {
          console.error('Error updating lead:', updateLead.statusText);
          showErrorSwal();
        }
        return;
      }
      console.log('only lead updated');
      if (values.status == undefined && !values.status) {
        showSuccessSwal();
      }
      //followup add
      if (statusForm == true && values.status != undefined && values.status) {
        const updateFollowupData = {
          user_id: user?._id,
          lead_id: leadId,
          status: values.status,
          comment: values.comment
        };

        const addFollowup = await fetch(config.apiUrl + `api/followUps`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
          body: JSON.stringify(updateFollowupData)
        });

        if (!addFollowup.ok) {
          if (addFollowup.status === 401) {
            console.error('Unauthorized access. Logging out.');
            logout();
          } else if (addFollowup.status === 500) {
            console.error('Internal Server Error.');
            logout();
            return;
          } else {
            console.error('Error adding followup:', addFollowup.statusText);
            showErrorFollowupSwal();
          }
          return;
        }
        console.log('update followup');
        showSuccessFollowupSwal();
      }

      console.log('Data updated successfully!');
      setValues({
        name: '',
        dob: '',
        email: '',
        contact_no: '',
        address: '',
        date: formattedDate,
        scheduled_to: '',
        course: '',
        branch: '',
        status: '',
        comment: '',
        updateDate: formattedDate,
        followupId: ''
      });
    } catch (error) {
      console.error('Error during lead update:', error.message);
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
      <MainCard title="Update Lead">
        {!loading ? (
          <Formik
            initialValues={{
              name: values?.name || '',
              nic: values?.nic || '',
              address: values?.address || '',
              contact_no: values?.contact_no || '',
              email: values?.email || '',
              course: values?.course || '',
              date: values?.date || '',
              branch: values?.branch || '',
              dob: values?.dob || '',
              scheduled_to: values?.scheduled_to || ''
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
              address: Yup.string().required('Address is required'),
              course: Yup.string().required('Course is required'),
              branch: Yup.string().required('Branch is required')
            })}
            onSubmit={handleUpdate}
          >
            {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
              <div>
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
                          onBlur={handleBlur}
                          onChange={handleChange}
                          value={values.dob}
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
                          onBlur={handleBlur}
                          value={values.address}
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
                          onBlur={handleBlur}
                          error={Boolean(touched.date && errors.date)}
                          helperText={touched.date && errors.date}
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
                          onBlur={handleBlur}
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

                      {leadId ? (
                        <Grid item xs={12} sm={12}>
                          <Box sx={{ textAlign: 'center', mt: 2, mb: 2 }}>
                            <Button
                              style={{ borderColor: 'gray' }}
                              onClick={() => {
                                setStatusForm(true);
                              }}
                              variant="outlined"
                            >
                              <AddIcon style={{ color: 'black' }} />
                            </Button>
                          </Box>
                        </Grid>
                      ) : (
                        <></>
                      )}
                      {statusForm == true ? (
                        <>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="h5" component="h5">
                              Select Status
                            </Typography>
                            <TextField
                              fullWidth
                              // label="First Name"
                              margin="normal"
                              name="status"
                              select
                              value={values.status}
                              SelectProps={{ native: true }}
                              onChange={handleChange}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <HourglassTopIcon />
                                  </InputAdornment>
                                )
                              }}
                            >
                              {values.status == '' ? (
                                <option value="" disabled>
                                  Select status
                                </option>
                              ) : (
                                <></>
                              )}
                              {statuses && statuses.length > 0 ? (
                                statuses.map((option) => (
                                  <option key={option._id} value={option._id}>
                                    {option.name}
                                  </option>
                                ))
                              ) : (
                                <option value="" disabled>
                                  No statuses available
                                </option>
                              )}
                            </TextField>
                          </Grid>

                          <Grid item xs={12} sm={12}>
                            <Typography variant="h5" component="h5">
                              Comment
                            </Typography>
                            <TextField
                              fullWidth
                              // label="First Name"
                              margin="normal"
                              name="comment"
                              type="text"
                              value={values.comment}
                              onChange={handleChange}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <ChatBubbleIcon />
                                  </InputAdornment>
                                )
                              }}
                            />
                          </Grid>
                        </>
                      ) : (
                        <></>
                      )}
                    </Grid>
                    <CardActions sx={{ justifyContent: 'flex-end' }}>
                      <Button variant="contained" type="submit" 
                      disabled={isSubmitting}
                      endIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}>
                        Update Lead
                      </Button>
                    </CardActions>
                  </Grid>
                </form>
                {leadId ? (
                  <>
                    <LeadfollowUp selectedLeadId={leadId} />
                  </>
                ) : (
                  <></>
                )}
              </div>
            )}
          </Formik>
        ) : (
          <LinearProgress />
        )}
      </MainCard>
    </>
  );
}
