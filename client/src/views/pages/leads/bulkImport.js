import React, { useState, useRef } from 'react';
import { Typography, Button, Grid, CircularProgress } from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import config from '../../../config';
import { useAuthContext } from '../../../context/useAuthContext';
import Lottie from "lottie-react";
import fileUploadAnimation from "../../../assets/lottie/file-upload.json";


const BulkImport = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuthContext();
  const inputFileRef = useRef(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];

    if (file) {
      setIsSubmitting(true); // Set isSubmitting to true when starting the upload
      const formData = new FormData();
      formData.append('file', file);

      try {
        // Send the file to the server using Axios or Fetch
        const response = await fetch(config.apiUrl + 'api/leads/bulk-import', {
          method: 'POST',
          headers: { Authorization: `Bearer ${user.token}` },
          body: formData,
        });

        // Handle the response as needed
        const data = await response.json();
        console.log('Server response:', data);
      } catch (error) {
        console.error('Error uploading file:', error);
      } finally {
        setIsSubmitting(false); // Reset isSubmitting after the upload is completed or failed
        // Reset file input value
        inputFileRef.current.value = null;
      }
    }
  };

  return (
    <MainCard title="Bulk Import">
      <Grid container direction="column" alignItems="center" spacing={2}>
        <Grid item>
          <Typography variant="body">
            Use this feature to bulk import leads into the system.
          </Typography>
        </Grid>
        <div style={{width:'100px'}}>
        <Lottie animationData={fileUploadAnimation} loop={true} />
        </div>
        <Grid item>
          <Button
            variant="contained"
            component="label"
            size="large"
            startIcon={<UploadFileIcon />}
            disabled={isSubmitting} // Disable the button when isSubmitting is true
          >
            {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Upload File'}
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              hidden
              ref={inputFileRef}
            />
          </Button>
        </Grid>
      </Grid>
    </MainCard>
  );
};

export default BulkImport;
