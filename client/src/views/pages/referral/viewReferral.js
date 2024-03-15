import * as React from 'react';
import Grid from '@mui/material/Grid';
import MainCard from 'ui-component/cards/MainCard';
import { InputAdornment, TextField, useMediaQuery, Typography, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ModeIcon from '@mui/icons-material/Mode';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import GetAppIcon from '@mui/icons-material/GetApp';
import SearchIcon from '@mui/icons-material/Search';
import { useState } from 'react';
import Button from '@mui/material/Button';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../../context/useAuthContext';
import LinearProgress from '@mui/material/LinearProgress';
import config from '../../../config';
import { useLogout } from '../../../hooks/useLogout';
import LeadDetailsPopup from '../../../ui-component/popups/LeadDetailsPopup';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { alpha, styled } from '@mui/material/styles';
import { DataGrid, gridClasses } from '@mui/x-data-grid';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestore';

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
  // const { userType } = user || {};
  const navigate = useNavigate();
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('md'));

  // const [allLeads, setAllLeads] = useState([]);
  const [sname, setSname] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState(null);
  const [arrIds, setArrIds] = useState([]);
  const [data, setData] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [referrals, setReferrals] = useState([]);

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

  const showSuccessSwalBulk = () => {
    Toast.fire({
      icon: 'success',
      title: 'Leads Deleted Successfully.'
    });
  };

  const showErrorSwalBulk = () => {
    Toast.fire({
      icon: 'error',
      title: 'Error Occured While Deleting Leads.'
    });
  };

  const showErrorSwalNoLead = () => {
    Toast.fire({
      icon: 'error',
      title: 'No Lead Selected.'
    });
  };

  const columns = [
    { field: 'reference_number', headerName: '#', align: 'center', width: 55, headerAlign: 'center' },
    { field: 'name', headerName: 'Student Name', flex: 0.5, width: 100, minWidth: 150 },
    { field: 'contact_no', headerName: 'Student Contact No', flex: 1, width: 100, minWidth: 150 },
    { field: 'course_code', headerName: 'Course', flex: 0.5, width: 100, minWidth: 100 },
    { field: 'status', headerName: 'Status', flex: 1, width: 100, minWidth: 150 },
    { field: 'agent_name', headerName: 'Agent Name', flex: 1, width: 100, minWidth: 150 },
    { field: 'agent_con', headerName: 'Agent Contact num', flex: 1, width: 100, minWidth: 150 },
    { field: 'comment', headerName: 'Comment', flex: 1, width: 100, minWidth: 150 },

    {
      field: 'edit',
      headerName: '',
      description: 'This column has a value getter and is not sortable.',
      sortable: false,
      width: 135,
      align: 'right',
      renderCell: (params) => (
        <>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              updateLead(params.row.id);
            }}
            sx={{ borderRadius: '50%', padding: '8px', minWidth: 'unset', width: '32px', height: '32px' }}
          >
            <ModeIcon sx={{ fontSize: '18px' }} />
          </Button>
          {permissions?.lead?.includes('delete') && (
            <Button
              variant="contained"
              color="error"
              // when onclick is called, it should open a dialog to confirm the deletion of the lead. so here should pass the lead id to the handle delete
              onClick={() => {
                handleSingleDelete(params.row.id);
              }}
              style={{ marginLeft: '5px' }}
              sx={{ borderRadius: '50%', padding: '8px', minWidth: 'unset', width: '32px', height: '32px' }}
            >
              <DeleteIcon sx={{ fontSize: '18px' }} />
            </Button>
          )}
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
                sx={{ borderRadius: '50%', padding: '8px', minWidth: 'unset', width: '32px', height: '32px', backgroundColor: '#039116' }}
              >
                <AddCircleOutlineIcon sx={{ fontSize: '18px', color: 'white' }} />
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
              }}
              style={{ marginLeft: '5px' }}
              sx={{ borderRadius: '50%', padding: '8px', minWidth: 'unset', width: '32px', height: '32px', backgroundColor: '#d1bd0a' }}
            >
              <SettingsBackupRestoreIcon sx={{ fontSize: '18px', color: 'white' }} />
            </Button>
          )}
        </>
      )
    }
  ];

  // const shortenCourseName = (courseName) => {
  //   // Check if the course name is "Other"
  //   if (courseName.toLowerCase() === 'other') {
  //     return 'Other'; // Return 'Other' as is
  //   }

  //   // Split the course name by spaces to get individual words
  //   const words = courseName.split(' ');

  //   // Map over each word and extract the first letter while excluding parentheses
  //   const shortenedName = words
  //     .map((word) => {
  //       // Remove parentheses from the word
  //       const wordWithoutParentheses = word.replace(/[()]/g, '');
  //       // Take the first letter of the word
  //       return wordWithoutParentheses.charAt(0).toUpperCase();
  //     })
  //     .join(''); // Join the first letters together

  //   return shortenedName; // Return the shortened course name
  // };

  function updateLead(leadId) {
    console.log('clicked lead id', leadId);
    navigate('/app/leads/update?id=' + leadId);
  }

  // async function fetchLeads() {
  //   try {
  //     const apiUrl = config.apiUrl + 'api/leads-details';
  //     const res = await fetch(apiUrl, {
  //       method: 'GET',
  //       headers: { Authorization: `Bearer ${user.token}` }
  //     });

  //     if (!res.ok) {
  //       if (res.status === 401) {
  //         console.error('Unauthorized access. Logging out.');
  //         logout();
  //       } else if (res.status === 500) {
  //         console.error('Internal Server Error.');
  //         logout();
  //         return;
  //       } else {
  //         console.error('Error fetching leads data', res.statusText);
  //       }
  //       return;
  //     }

  //     let leads = await res.json();

  //     leads = leads.map((lead) => {
  //       const student = lead.student_id || {};

  //       return {
  //         reference_number: lead.reference_number,
  //         id: lead._id,
  //         name: student.name || null,
  //         contact_no: student.contact_no || null,
  //         course: lead.course_id.name,
  //         course_code: shortenCourseName(lead.course_id.name),
  //         status: lead.status_id ? lead.status_id.name : null
  //       };
  //     });

  //     if (permissions?.lead?.includes('read-all')) {
  //       setData(leads);
  //       setAllLeads(leads);
  //       setLoading(false);
  //       return;
  //     } else if (permissions?.lead?.includes('read') && userType?.name === 'counselor') {
  //       const filteredLeads = leads.filter((lead) => lead.counsellor_id === user._id);
  //       setData(filteredLeads);
  //       setAllLeads(filteredLeads);
  //       setLoading(false);
  //       return;
  //     } else if (permissions?.lead?.includes('read') && userType?.name === 'user') {
  //       const filteredLeads = leads.filter((lead) => lead.user_id === user._id);
  //       setData(filteredLeads);
  //       setAllLeads(filteredLeads);
  //       setLoading(false);

  //       return;
  //     }
  //   } catch (error) {
  //     console.log('Error fetching leads:', error);
  //   }
  // }
  //-------------------------------------------------------------newly added----------------------------------------------------------

  async function fetchReferrals() {
    try {
      const response = await fetch(config.apiUrl + 'api/getReferrals');
      if (!response.ok) {
        throw new Error('Failed to fetch referrals');
      }
      const data = await response.json();

      setReferrals(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching referrals:', error);
      setLoading(false);
    }
  }

  console.log(referrals);
  //---------------------------------------------------------------------------------------------------------------------------------
  // useEffect(() => {
  //   fetchLeads();
  // }, []);

  useEffect(() => {
    fetchReferrals();
  }, []);

  const sortLeadsByField = (value) => {
    const sortedLeads = allLeads.filter((lead) => {
      const searchTerm = value.toLowerCase();
      return (
        (lead.name && lead.name.toLowerCase().includes(searchTerm)) ||
        (lead.nic && lead.nic.toLowerCase().includes(searchTerm)) ||
        (lead.email && lead.email.toLowerCase().includes(searchTerm)) ||
        (lead.contact_no && lead.contact_no.toLowerCase().includes(searchTerm))
      );
    });
    setData(sortedLeads);
    //console.log(sortedLeads);
  };

  function handleButtonClick() {
    navigate('/app/leads/add');
  }

  const handleDelete = () => {
    if (arrIds.length > 1) {
      Swal.fire({
        title: 'Are you sure?',
        text: 'You will not be able to recover this file!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, keep it'
      }).then((result) => {
        if (result.isConfirmed) {
          addToArchivedLeads();
        }
      });
    } else {
      showErrorSwalNoLead();
    }
  };

  async function addToSingleArchivedLead(ids) {
    setIsDeleting(true);
    try {
      const res = await fetch(config.apiUrl + 'api/leads-archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({ ids })
      });

      if (res.ok) {
        const json = await res.json();
        console.log(json);
        setLoading(true);
        showSuccessSwalBulk();
      } else {
        if (res.status === 401) {
          console.error('Unauthorized access. Logging out.');
          logout();
        } else if (res.status === 500) {
          console.error('Internal Server Error.');
          logout();
          return;
        } else {
          console.error('Error fetching sources:', res.statusText);
          showErrorSwalBulk();
        }
        return;
      }
    } catch (error) {
      console.error('Error fetching sources:', error.message);
      showErrorSwalBulk();
    } finally {
      setIsDeleting(false);
    }
  }

  const handleSingleDelete = (leadId) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this file!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it'
    }).then((result) => {
      if (result.isConfirmed) {
        addToSingleArchivedLead([leadId]);
      }
    });
  };

  const handleExport = () => {
    const csvRows = [];
    const headers = Object.keys(data[0]);
    csvRows.push(headers.join(','));
    for (const row of data) {
      const values = headers.map((header) => {
        const escaped = ('' + row[header]).replace(/"/g, '\\"');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }
    const csvData = csvRows.join('\n');
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'leads.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <>
      <MainCard
        title="View Referrals"
        isDeleting={isDeleting}
        arrIds={arrIds}
        buttonLabel={
          permissions?.lead?.includes('create') ? (
            <>
              Add New Lead
              <AddIcon style={{ marginLeft: '5px' }} /> {/* Adjust styling as needed */}
            </>
          ) : undefined
        }
        onButtonClick={handleButtonClick}
        buttonLabelExport={
          permissions?.lead?.includes('read-all') ? (
            <>
              <GetAppIcon style={{ fontSize: '25px' }} /> {/* Adjust styling as needed */}
            </>
          ) : undefined
        }
        buttonLabelDeleteAll={
          arrIds.length > 1 &&
          permissions?.lead?.includes('delete-all') && (
            <>
              <DeleteIcon sx={{ fontSize: '20px' }} />
              {isDeleting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                <span style={{ marginLeft: '8px', fontWeight: 'bold' }}>Delete Leads</span>
              )}
            </>
          )
        }
        onButtonClickDeleteAll={handleDelete}
        onButtonClickExport={handleExport}
      >
        {loading && <LinearProgress style={{ marginBottom: '30px' }} />}
        <Grid style={{ marginTop: '-30px' }} container direction="column" justifyContent="left">
          <Grid container sx={{ p: 3, marginTop: '4px' }} spacing={matchDownSM ? 0 : 2}>
            <Grid container direction="column">
              <Grid container spacing={matchDownSM ? 0 : 2}>
                <Grid item xs={12} sm={2.5}>
                  <Typography variant="h6" component="h6" style={{ marginBottom: '-10px' }}>
                    Search
                  </Typography>
                  <TextField
                    fullWidth
                    margin="normal"
                    name="search"
                    type="text"
                    size="small"
                    SelectProps={{ native: true }}
                    value={sname}
                    onChange={(event) => {
                      const { value } = event.target;
                      setSname(value);
                      sortLeadsByField(value);
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid container sx={{ marginTop: '2px' }} alignItems="flex-start" spacing={matchDownSM ? 0 : 2}>
              <Grid alignItems="flex-start" item xs={12} sm={12}>
                {!loading && (
                  <StripedDataGrid
                    rows={data}
                    rowHeight={40}
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
                        paginationModel: { page: 0, pageSize: 25 }
                      }
                    }}
                    getRowId={(row) => row.id}
                    getRowStyle={(params) => ({
                      backgroundColor: params.index % 2 === 0 ? '#fff' : '#f0f8ff'
                    })}
                    pageSizeOptions={[10, 25, 100]}
                    checkboxSelection
                    onRowSelectionModelChange={(ids) => {
                      setArrIds(ids);
                    }}
                  />
                )}
              </Grid>
            </Grid>
          </Grid>
          <LeadDetailsPopup isOpen={!!selectedLead} onClose={() => setSelectedLead(null)} leadDetails={selectedLead} />
        </Grid>
      </MainCard>
    </>
  );
}
//new update
