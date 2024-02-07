import * as React from 'react';
import Grid from '@mui/material/Grid';
import MainCard from 'ui-component/cards/MainCard';
import { TextField, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { GridToolbarContainer, GridToolbarExport } from '@mui/x-data-grid-premium';
import FacebookIcon from '@mui/icons-material/Facebook';
import TimelineIcon from '@mui/icons-material/Timeline';
import MonitorIcon from '@mui/icons-material/Monitor';
import ModeIcon from '@mui/icons-material/Mode';
import DeleteIcon from '@mui/icons-material/Delete';
import Autocomplete from '@mui/material/Autocomplete';
import { useState } from 'react';
import Button from '@mui/material/Button';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../../context/useAuthContext';
import LinearProgress from '@mui/material/LinearProgress';
import config from '../../../config';
import { useLogout } from '../../../hooks/useLogout';
import LeadDetailsPopup from '../../../ui-component/popups/LeadDetailsPopup';
import { Tooltip } from '@mui/material';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { alpha, styled } from '@mui/material/styles';
import { DataGrid, gridClasses } from '@mui/x-data-grid';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestore';

function CustomToolbar() {
  return (
    <GridToolbarContainer>
      <GridToolbarExport />
    </GridToolbarContainer>
  );
}

const ODD_OPACITY = 0.2;

const StripedDataGrid = styled(DataGrid)(({ theme }) => ({
  [`& .${gridClasses.row}.even`]: {
    backgroundColor: theme.palette.grey[200],
    '&:hover, &.Mui-hovered': {
      backgroundColor: alpha(theme.palette.primary.main, ODD_OPACITY),
      '@media (hover: none)': {
        backgroundColor: 'transparent'
      }
    },
    '&.Mui-selected': {
      backgroundColor: alpha(theme.palette.primary.main, ODD_OPACITY + theme.palette.action.selectedOpacity),
      '&:hover, &.Mui-hovered': {
        backgroundColor: alpha(
          theme.palette.primary.main,
          ODD_OPACITY + theme.palette.action.selectedOpacity + theme.palette.action.hoverOpacity
        ),
        // Reset on touch devices, it doesn't add specificity
        '@media (hover: none)': {
          backgroundColor: alpha(theme.palette.primary.main, ODD_OPACITY + theme.palette.action.selectedOpacity)
        }
      }
    }
  }
}));

export default function ViewLeads() {
  const { logout } = useLogout();
  const { user } = useAuthContext();
  const { permissions } = user || {};
  const { userType } = user || {};
  const navigate = useNavigate();
  // const { id } = useParams();
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('md'));
  const iconComponentMap = {
    facebook: <FacebookIcon color="primary" style={{ color: 'blue' }} />,
    manual: <MonitorIcon color="primary" style={{ color: 'green' }} />,
    internal: <TimelineIcon color="primary" style={{ color: 'orange' }} />
  };
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState(null);

  const [counselors, setCounselors] = useState([]);

  const isAdminOrSupervisor = ['admin', 'sup_admin', 'gen_supervisor'].includes(userType?.name);

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
      title: 'Assignment Successfull.'
    });
  };

  // error showErrorSwal
  const showErrorSwal = () => {
    Toast.fire({
      icon: 'error',
      title: 'Error While Assigning.'
    });
  };

  const urlParams = new URLSearchParams(window.location.search);
  const StatusUrl = urlParams.get('status');

  const columns = [
    {
      field: 'source',
      headerName: 'Source',
      width: 70,
      renderCell: (params) => (
        <Tooltip title={params.row.source} arrow>
          {iconComponentMap[params.row.source]}
        </Tooltip>
      )
    },
    { field: 'date', headerName: 'Date Added', width: 150 },
    { field: 'name', headerName: 'Student Name', width: 150 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'contact_no', headerName: 'Contact No', width: 100 },
    { field: 'status', headerName: 'Status', width: 150 },
    {
      field: 'course',
      headerName: 'Course',
      width: 250
    },
    {
      field: 'counsellor',
      headerName: 'Assign To',
      description: 'This column has a value getter and is not sortable.',
      sortable: false,
      width: 170,
      align: 'left',
      renderCell: (params) => {
        if (isAdminOrSupervisor) {
          return (
            <>
              <Autocomplete
                disablePortal
                id="combo-box-demo"
                options={counselors}
                sx={{ width: 200, my: 2 }}
                renderInput={(params) => <TextField {...params} label="Choose a counsellor" variant="standard" />}
                value={params.row.counsellor}
                onChange={(event, newValue) => {
                  // Handle the selection here
                  console.log('cid1', params.row.counsellor);
                  console.log('cid', newValue.label);
                  console.log('lid', params.row.id);
                  const lid = params.row.id;
                  const cid = newValue.id;
                  params.row.counsellor = newValue.label;

                  const updateLead = async () => {
                    try {
                      const updateLead = await fetch(config.apiUrl + 'api/counsellorAssignment', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                        body: JSON.stringify({
                          counsellor_id: cid,
                          lead_id: lid
                        })
                      });
                      if (!updateLead.ok) {
                        if (res.status === 401) {
                          console.error('Unauthorized access. Logging out.');
                          logout();
                        } else if (res.status === 500) {
                          console.error('Internal Server Error.');
                          logout();
                          return;
                        } else {
                          console.error('Error updating lead data', updateLead.statusText);
                        }
                        return;
                      } else {
                        console.log(newValue.label);
                        console.log('Successfully assigned');
                        showSuccessSwal();
                      }
                    } catch (error) {
                      console.log(error);
                      showErrorSwal();
                    }
                  };
                  updateLead();
                }}
              />
            </>
          );
        } else {
          // For other users, display "Assigned to Me" or relevant content
          return <>{params.row.counsellor ? `Assigned to ${params.row.counsellor}` : 'Pending'}</>;
        }
      }
    },
    // { field: 'assigned_at', headerName: 'Assigned At', width: 150 },
    {
      field: 'edit',
      headerName: '',
      description: 'This column has a value getter and is not sortable.',
      sortable: false,
      width: 230,
      align: 'right',
      renderCell: (params) => (
        <>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              updateLead(params.row.id);
            }}
            sx={{ borderRadius: '100px', padding: '10px' }}
          >
            <ModeIcon />
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              // Handle delete logic here
            }}
            style={{ marginLeft: '5px' }}
            sx={{ borderRadius: '100px', padding: '10px' }}
          >
            <DeleteIcon />
          </Button>
          {params.row.status != 'Registered' &&
            params.row.status != 'Fake' &&
            params.row.status != 'Duplicate' &&
            params.row.status != 'Dropped' && (
              <Button
                variant="contained"
                color="success"
                onClick={() => {
                  navigate('/app/leads/addfollowup?id=' + params.row.id);
                }}
                style={{ marginLeft: '5px' }}
                sx={{ borderRadius: '100px', padding: '10px', backgroundColor: '#039116' }}
              >
                <AddCircleOutlineIcon sx={{ color: 'white' }} />
              </Button>
            )}

          {(params.row.status == 'Registered' ||
            params.row.status == 'Fake' ||
            params.row.status == 'Duplicate' ||
            params.row.status == 'Dropped') && (
            <Button
              variant="contained"
              color="success"
              onClick={() => {
                restorePrevious(params.row.id);
                //navigate('/app/leads/addfollowup?id=' + params.row.id);
              }}
              style={{ marginLeft: '5px' }}
              sx={{ borderRadius: '100px', padding: '10px', backgroundColor: '#d1bd0a' }}
            >
              <SettingsBackupRestoreIcon sx={{ color: 'white' }} />
            </Button>
          )}
        </>
      )
    }
  ];

  function updateLead(leadId) {
    console.log('clicked lead id', leadId);
    navigate('/app/leads/update?id=' + leadId);
  }

  useEffect(() => {
    console.log(StatusUrl);
    async function fetchLeads() {
      try {
        const apiUrl = config.apiUrl + 'api/leads-details';
        const res = await fetch(apiUrl, {
          method: 'GET',
          headers: { Authorization: `Bearer ${user.token}` }
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
            console.error('Error fetching leads data', res.statusText);
          }
          return;
        }

        let leads = await res.json();

        console.log(leads);

        leads = leads.map((lead) => ({
          id: lead._id,
          date: lead.date,
          scheduled_at: lead.scheduled_at ? lead.scheduled_at : null,
          scheduled_to: lead.scheduled_to ? lead.scheduled_to : null,
          name: lead.student_id.name,
          contact_no: lead.student_id.contact_no,
          address: lead.student_id.address,
          dob: lead.student_id.dob,
          email: lead.student_id.email,
          nic: lead.student_id.nic,
          course: lead.course_id.name,
          branch: lead.branch_id.name,
          source: lead.source_id ? lead.source_id.name : null,
          counsellor: lead.assignment_id ? lead.assignment_id.counsellor_id.name : null,
          counsellor_id: lead.assignment_id ? lead.assignment_id.counsellor_id._id : null,
          assigned_at: lead.counsellorAssignment ? lead.counsellorAssignment.assigned_at : null,
          user_id: lead.user_id ? lead.user_id : null,
          status: lead.status_id ? lead.status_id.name : null
        }));

        console.log(leads);

        // Assuming that the backend res is an array of leads
        // Filter leads based on the counselor ID from the backend res
        if (permissions?.lead?.includes('read-all')) {
          if (StatusUrl) {
            const filtered = leads.filter((lead) => lead.status === StatusUrl);
            setData(filtered);
            setLoading(false);
          }
          setAllLeads(leads);
          setLoading(false);
          return;
        } else if (permissions?.lead?.includes('read') && userType?.name === 'counselor') {
          const filteredLeads = leads.filter((lead) => lead.counsellor_id === user._id);
          if (StatusUrl) {
            const filtered = filteredLeads.filter((lead) => lead.status === StatusUrl);
            setData(filtered);
            setLoading(false);
          }
          setAllLeads(filteredLeads);
          setLoading(false);
          console.log(filteredLeads); // Log the filtered leads
          return;
        } else if (permissions?.lead?.includes('read') && userType?.name === 'user') {
          const filteredLeads = leads.filter((lead) => lead.user_id === user._id);
          if (StatusUrl) {
            const filtered = filteredLeads.filter((lead) => lead.status === StatusUrl);
            setData(filtered);
            setLoading(false);
          }
          setAllLeads(filteredLeads);
          setLoading(false);
          console.log(filteredLeads);
          return;
        }
        setLoading(false);
      } catch (error) {
        console.log('Error fetching leads:', error);
      }
    }

    fetchLeads();
    async function getCounselors() {
      try {
        const res = await fetch(config.apiUrl + 'api/getCounsellors', {
          method: 'GET',
          headers: { Authorization: `Bearer ${user.token}` }
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
            console.error('Error fetching counselors:', res.statusText);
          }
          return;
        }
        const data = await res.json();
        setCounselors(data);
      } catch (error) {
        console.log('Error fetching counselors:', error);
      }
    }
    getCounselors();
  }, []);

  const [data, setData] = useState([]);

  const handleRowClick = (params) => {
    setSelectedLead(params.row);
    console.log(params.row);
  };

  return (
    <>
      <MainCard title={StatusUrl + ' leads'}>
        {loading && <LinearProgress />}
        <Grid container direction="column" justifyContent="center">
          <Grid container sx={{ p: 3 }} spacing={matchDownSM ? 0 : 2}>
            <Grid item xs={12} sm={12}>
              <div style={{ height: 710, width: '100%' }}>
                <StripedDataGrid
                  rows={data}
                  columns={columns}
                  getRowClassName={(params) => (params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd')}
                  // handle row click should trigger for the row but except for the edit and delete buttons and assign to dropdown
                  onRowClick={(params, event) => {
                    const field = event.target.closest('.MuiDataGrid-cell').getAttribute('data-field');

                    console.log(params);
                    console.log(field);

                    if (!(field == 'counsellor' || field == 'edit')) {
                      handleRowClick(params);
                    }
                  }}
                  initialState={{
                    pagination: {
                      paginationModel: { page: 0, pageSize: 10 }
                    }
                  }}
                  slots={{
                    toolbar: CustomToolbar
                  }}
                  getRowId={(row) => row.id}
                  getRowStyle={(params) => ({
                    backgroundColor: params.index % 2 === 0 ? '#fff' : '#f0f8ff'
                  })}
                  pageSizeOptions={[10, 25, 100]}
                  checkboxSelection
                />
              </div>
            </Grid>
          </Grid>
          <LeadDetailsPopup isOpen={!!selectedLead} onClose={() => setSelectedLead(null)} leadDetails={selectedLead} />
        </Grid>
      </MainCard>
    </>
  );
}
