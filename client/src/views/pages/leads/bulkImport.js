import React, { useState, useRef } from 'react';
import { Typography, Button, Grid, CircularProgress } from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import config from '../../../config';
import { useAuthContext } from '../../../context/useAuthContext';
import Lottie from 'lottie-react';
import fileUploadAnimation from '../../../assets/lottie/file-upload.json';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const Toast = withReactContent(
  Swal.mixin({
    toast: true,
    position: 'bottom-end',
    iconColor: 'white',
    customClass: {
      popup: 'colored-toast'
    },
    showConfirmButton: false,
    timer: 5000,
    timerProgressBar: true
  })
);

const showSuccessSwal = (customerSuccessTitle) => {
  Toast.fire({
    icon: 'success',
    title: customerSuccessTitle || 'Lead Added Successfully..'
  });
};

const showErrorSwal = (customErrorTitle) => {
  Toast.fire({
    icon: 'error',
    title: customErrorTitle || 'Error Adding Lead.'
  });
};

const BulkImport = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuthContext();
  const inputFileRef = useRef(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];

    if (file) {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch(config.apiUrl + 'api/leads/bulk-import', {
          method: 'POST',
          headers: { Authorization: `Bearer ${user.token}` },
          body: formData
        });

        const data = await response.json();
        console.log('Server response:', data);

        const uploadDetails = data.bulk_upload_details;

        setTimeout(() => {
          if (uploadDetails.successfully_added_leads > 0) {
            showSuccessSwal(`Lead Added Successfully: ${uploadDetails.successfully_added_leads}`);
          }

          setTimeout(() => {
            if (uploadDetails.added_without_counselor > 0) {
              showSuccessSwal(`Leads Added Without Counselor: ${uploadDetails.added_without_counselor}`);
            }            

            setTimeout(() => {
              if (uploadDetails.existing_student_added_leads > 0) {
                showErrorSwal(`Invalid Leads: ${uploadDetails.existing_student_added_leads}`);
              }

              setTimeout(() => {
                if (uploadDetails.error_added_leads > 0) {
                  showErrorSwal(`Error Adding Lead: ${uploadDetails.error_added_leads}`);
                }
              }, 2000);
            }, 2000);
          }, 2000);
        }, 2000);
      } catch (error) {
        console.error('Error uploading file:', error);
      } finally {
        setIsSubmitting(false);
        inputFileRef.current.value = null;
      }
    }
  };

  return (
    <MainCard title="Bulk Import">
      <Grid container direction="column" alignItems="center" spacing={2}>
        <Grid item>
          <Typography variant="body">Use this feature to bulk import leads into the system.</Typography>
        </Grid>
        <div style={{ width: '100px' }}>
          <Lottie animationData={fileUploadAnimation} loop={true} />
        </div>
        <Grid item>
          <Button variant="contained" component="label" size="large" startIcon={<UploadFileIcon />} disabled={isSubmitting}>
            {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Upload File'}
            <input type="file" accept=".csv" onChange={handleFileUpload} hidden ref={inputFileRef} />
          </Button>
        </Grid>
      </Grid>
    </MainCard>
  );
};

export default BulkImport;
