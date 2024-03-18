import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Grid, Avatar, Divider, TextField } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SendIcon from '@mui/icons-material/Send';

const SendSMSPopup = ({ isOpen, onClose, leadDetails }) => {
  const [contactNo, setContactNo] = useState('');
  const [message, setMessage] = useState('');

  const handleClose = () => {
    onClose();
  };

  const handleSend = () => {
    // Add functionality to send SMS with contactNo and message
    console.log('Sending SMS to:', contactNo, 'Message:', message);
    // Clear the fields after sending
    setContactNo('');
    setMessage('');
  };

  if (!leadDetails) {
    return null;
  }

  return (
    <Dialog open={isOpen} onClose={handleClose} fullWidth maxWidth="md">
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
              value={contactNo}
              onChange={(e) => setContactNo(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Message"
              variant="outlined"
              fullWidth
              multiline
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <Divider sx={{ mt: 3, mb: 2 }} />
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSend} color="primary" startIcon={<SendIcon />}>
          Send
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SendSMSPopup;
