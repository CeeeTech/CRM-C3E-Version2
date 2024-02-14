import React, { useState, useRef } from 'react';
import { Typography, Button, Grid, CircularProgress, Alert } from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import config from '../../../config';
import { useAuthContext } from '../../../context/useAuthContext';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const BulkImport = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuthContext();
  const inputFileRef = useRef(null);

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

        let message = '';

        if (uploadDetails.successfully_added_leads > 0) {
          message += `Lead Added Successfully: ${uploadDetails.successfully_added_leads}\n`;
        }

        if (uploadDetails.added_without_counselor > 0) {
          message += `Leads Added Without Counselor: ${uploadDetails.added_without_counselor}\n`;
        }

        if (uploadDetails.existing_student_added_leads > 0) {
          message += `Invalid Leads: ${uploadDetails.existing_student_added_leads}\n`;
        }

        if (uploadDetails.error_added_leads > 0) {
          message += `Error Adding Lead: ${uploadDetails.error_added_leads}\n`;
        }

        if (message) {
          Toast.fire({
            icon: 'info',
            title: 'Upload Details',
            html: message
          });
        }
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
        {isSubmitting && (
          <Grid item>
            <Alert severity="info">Please wait. It may take around 1 minute to upload 100 data.</Alert>
          </Grid>
        )}
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
