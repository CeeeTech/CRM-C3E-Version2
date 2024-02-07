import * as React from 'react';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import MainCard from 'ui-component/cards/MainCard';
import { Button, CardActions, InputAdornment, Typography, useMediaQuery, LinearProgress, Avatar, MenuItem} from '@mui/material';
import { useTheme } from '@mui/material/styles';

import { useEffect } from 'react';
import { useState,useCallback } from 'react';
import { Box } from '@mui/system';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import config from '../../../config';
import { useAuthContext } from '../../../context/useAuthContext';
import PersonIcon from '@mui/icons-material/Person';
import { Formik } from 'formik';
import { useLogout } from '../../../hooks/useLogout';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useNavigate } from 'react-router-dom';
import CustomNode from './customNode';

import 'reactflow/dist/style.css';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from 'reactflow';

const nodeTypes = {
  customNode: CustomNode,
};
export default function LeadForm() {
  let mappedFollowupDetails = []
  let mappedInitialEdges = []
  const [selectedStatus, setSelectedStatus] = useState('');
  const [nodes, setNodes, onNodesChange] = useNodesState(mappedFollowupDetails);
  const [edges, setEdges, onEdgesChange] = useEdgesState([mappedInitialEdges]);
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );


  const { logout } = useLogout();
  const date = new Date();
  const formattedDate = date.toISOString().split('T')[0];
  const theme = useTheme();
  const { user } = useAuthContext();

  const matchDownSM = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  // State variables for selected IDs

  const [statuses, setStatuses] = useState([]);

  const [loading, setLoading] = useState(true); // Loading state


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

        console.log(json.status);

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

  const fetchFollowups = async () => {

      try {
        const response = await fetch(config.apiUrl + `api/followups/by-lead/${leadId}`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${user.token}` }
        });

        if (response.ok) {
          const followups = await response.json();
          console.log('followup data', followups);
          const mappedFollowupDetails = followups.map((followup, index) => {
            let xVal
            let yVal
            let sPosition
            let tPosition
            if(index%4==0){
              xVal= 150
              yVal= ((index)/4)*150
              sPosition="right"
              tPosition="top"
            }
            if(index%4==1){
              xVal= 450
              yVal= ((index-1)/4)*150
              sPosition="right"
              tPosition="left"
            }
            if(index%4==2){
              xVal= 750
              yVal= ((index-2)/4)*150
              sPosition="right"
              tPosition="left"
            }
            if(index%4==3){
              xVal= 1050
              yVal= ((index-3)/4)*150
              sPosition="bottom"
              tPosition="left"
            }
       
              yVal = yVal+50
            let cusColor = "#e6e3e3";
            if(followup.status=="New"){
              cusColor = "#c7dbff"
            }
            if(followup.status=="Dropped" || followup.status=="Fake"){
              cusColor = "#ffc7d0"
            }
            if(followup.status=="Duplicate"){
              cusColor = "#fcbca7"
            }
            if(followup.status=="Registered"){
              cusColor = "#c4ffc2"
            }
            if(followup.status=="Next intake"){
              cusColor = "#fff2d1"
            }

            
            
            return {
              id: index.toString(),
              sourcePosition: sPosition,
              targetPosition: tPosition,
              position: { x: xVal, y: yVal },
              type:'customNode',
              data: { label: followup.status , comment:followup.date,color:cusColor},
              handle: {
                x: 0.5, // Adjust the handle x-position as needed
                y: 1,   // Adjust the handle y-position as needed
              },
            };
          });

          const mappedInitialEdges = followups.map((followup, index) => {
            return {
              id: `e${index}-${index + 1}`,
              source: index.toString(),
              type: 'smoothstep',
              animated: true,
              target: (index + 1).toString()
            };
          });
          setNodes(mappedFollowupDetails);
          setEdges(mappedInitialEdges);

        } else {
          console.error('Error fetching followup:', response.statusText);
          if (res.status === 401) {
            console.error('Unauthorized access. Logging out.');
            logout();
          } else if (res.status === 500) {
            console.error('Internal Server Error.');
            logout();
            return;
          } else {
            console.error('Error fetching lead data:', response.statusText);
          }
          return;
        }
      } catch (error) {
        console.error('Error fetching followup:', error.message);
      }
  
  }

  useEffect(() => {
    fetchStatuses();
    fetchFollowups();
    if (leadId) {
      setLoading(true);
      fetchLeadData();
    }
  }, []);

  const handleUpdate = async (values, { setSubmitting, setFieldError }) => {
    console.log(values);

    try {
      //followup add
      if (values.status != undefined && values.status) {
        const updateFollowupData = {
          user_id: user?._id,
          lead_id: leadId,
          status: selectedStatus,
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
        navigate('/app/leads');
      }

      setValues({
        status: '',
        comment: '',
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
      <MainCard title="Add Followup">
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
              scheduled_to: values?.scheduled_to || '',
              status: values?.status || ''
            }}
            onSubmit={handleUpdate}
          >
            {({ handleChange, handleSubmit, isSubmitting, values }) => (
              <div>
                <form autoComplete="off" noValidate onSubmit={handleSubmit}>
                  <Grid container direction="column" justifyContent="center">
                    <Grid container sx={{ p: 3 }} spacing={matchDownSM ? 0 : 2}>

                      <Grid item xs={12} sm={12} >
                        <Grid container alignItems="center" spacing={2}>
                          <Grid item >
                            <Avatar>
                              <PersonIcon />
                            </Avatar>
                          </Grid>
                          <Grid item  xs={2} sm={2}>
                            <Typography variant="h3">{values.name}</Typography>
                            <Typography variant="h5" color="textSecondary">
                             {values.course}
                            </Typography>
                          </Grid>


                          <Grid item xs={6} sm={1.5} >
                          <Box sx={{ mt: 3, mb: 2 }} ></Box>
                          </Grid>
                          {leadId ? (
                        <>
                          <Grid sx={{ ml: 10 }} item xs={6} sm={2} >
                            <Typography variant="h5" component="h5">
                              Select Status
                            </Typography>
                       

                            <TextField
                fullWidth
                margin="normal"
                name="userType"
                select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                      <HourglassTopIcon />
                    </InputAdornment>
                  )
                }}
              >
                <MenuItem value="">Select a Status</MenuItem>
                {statuses.map((status) => (
                  <MenuItem key={status._id} value={status._id}>
                    {status.name}
                  </MenuItem>
                ))}
              </TextField>















                         


                          </Grid>

                          <Grid item xs={12} sm={3}>
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
                              
                            />
                          </Grid>

                          <Grid item xs={12} sm={2}>
                          <CardActions  sx={{  mt: 3 }}>
                      <Button variant="contained" type="submit" disabled={isSubmitting}>
                        Add follow up
                      </Button>
                    </CardActions>
                          </Grid>
                          
                        </>
                      ) : (
                        <></>
                      )}



                        </Grid>


                        
                      </Grid>


                     
                    </Grid>
                    
                  </Grid>
                </form>

                <div style={{ width: '100%', height: '100vh' }}>
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  nodeTypes={nodeTypes}
                >
                  <Controls />
                  <MiniMap />
                  <Background variant="dots" gap={12} size={1} />
                </ReactFlow>      
             </div>


             
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
