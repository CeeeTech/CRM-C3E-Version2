import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Avatar,
  Divider,
  TextField,
  CircularProgress
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SendIcon from '@mui/icons-material/Send';
import * as Yup from 'yup';
import { Formik } from 'formik';
import config from '../../config';
import { useAuthContext } from '../../context/useAuthContext';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const SendSMSPopup = ({ isOpen, onClose, leadDetails }) => {
  
  // const [message, setMessage] = useState('');

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

  const showMessageSuccessSwal = () => {
    Toast.fire({
      icon: 'success',
      title: 'Message Sent Successfully.'
    });
  };
  const showMessageErrorSwal = () => {
    Toast.fire({
      icon: 'error',
      title: 'Error sending message.'
    });
  };

  const { user } = useAuthContext();

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    const formData = {
      contact_no: values.contact_no,
      message: values.message
    };
    console.log('formData:', formData);
    try {
      const res = await fetch(config.apiUrl + 'api/sendCustomSMS', {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'application/json' // Specify content type
        },
        body: JSON.stringify(formData)
      });
      console.log('res:', res);
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
      // setLoading(false);
      console.log('SMS sent successfully');
      showMessageSuccessSwal();
    } catch (error) {
      console.error(error);
      setSubmitting(false);
      showMessageErrorSwal();
    }
    // setMessage('');
    console.log('SMS sent successfully');
    setSubmitting(false);
};

  if (!leadDetails) {
    return null;
  }

  return (
    <Dialog open={isOpen} onClose={handleClose} fullWidth maxWidth="md">
      <Formik
        initialValues={{
          contact_no: leadDetails?.contact_no || '',
          message: ''
        }}
        validationSchema={Yup.object().shape({
          contact_no: Yup.string()
            .matches(/^\+?\d{10,12}$/, 'Contact No should be 10 to 12 digits with an optional leading + sign')
            .required('Contact No is required'),
          message: Yup.string().required('Message is required')
        })}
        onSubmit={handleSubmit}
      >
        {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
          <form onSubmit={handleSubmit}>
            <DialogTitle>
              <Grid container alignItems="center" spacing={2}>
                <Grid item>
                  <Avatar>
                    <PersonIcon />
                  </Avatar>
                </Grid>
                <Grid item>
                  <Typography variant="h3">Send SMS</Typography>
                  <Typography variant="h5" color="textSecondary">
                    {leadDetails.name} | {leadDetails.course}
                  </Typography>
                </Grid>
              </Grid>
            </DialogTitle>
            <Divider sx={{ mt: 3, mb: 2 }} />
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Contact Number"
                    variant="outlined"
                    fullWidth
                    name="contact_no"
                    value={values.contact_no}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    error={Boolean(touched.contact_no && errors.contact_no)}
                    helperText={touched.contact_no && errors.contact_no}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Message"
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={4}
                    name="message"
                    value={values.message}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    error={Boolean(touched.message && errors.message)}
                    helperText={touched.message && errors.message}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <Divider sx={{ mt: 3, mb: 2 }} />
            <DialogActions>
              <Button onClick={handleClose} color="primary">
                Cancel
              </Button>
              <Button endIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />} type="submit" color="primary">
                Send
              </Button>
            </DialogActions>
          </form>
        )}
      </Formik>
    </Dialog>
  );
};

export default SendSMSPopup;
