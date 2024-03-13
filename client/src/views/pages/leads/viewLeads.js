import * as React from 'react';
import Grid from '@mui/material/Grid';
import MainCard from 'ui-component/cards/MainCard';
import { InputAdornment, TextField, useMediaQuery, Typography, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import FacebookIcon from '@mui/icons-material/Facebook';
import WorkspacesIcon from '@mui/icons-material/Workspaces';
import TimelineIcon from '@mui/icons-material/Timeline';
import MonitorIcon from '@mui/icons-material/Monitor';
import ModeIcon from '@mui/icons-material/Mode';
import DeleteIcon from '@mui/icons-material/Delete';
import Autocomplete from '@mui/material/Autocomplete';
import AssignmentIcon from '@mui/icons-material/Assignment';
import InsertLinkIcon from '@mui/icons-material/InsertLink';
import AddIcon from '@mui/icons-material/Add';
import GetAppIcon from '@mui/icons-material/GetApp';
import SearchIcon from '@mui/icons-material/Search';
import Diversity3Icon from '@mui/icons-material/Diversity3';
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
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import PersonIcon from '@mui/icons-material/Person';

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
    Facebook: <FacebookIcon color="primary" style={{ color: 'blue' }} />,
    Manual: <MonitorIcon color="primary" style={{ color: 'green' }} />,
    Internal: <TimelineIcon color="primary" style={{ color: 'orange' }} />,
    Referral: <Diversity3Icon color="primary" style={{ color: 'green' }} />,
    'Bulk Upload': <WorkspacesIcon color="primary" style={{ color: 'orange' }} />
  };
  const [courses, setCourses] = useState([]);
  const [source, setSources] = useState([]);
  const [allLeads, setAllLeads] = useState([]);

  const [selectedCourse, setselectedCourse] = useState('');
  const [selectedSource, setselectedSource] = useState('');
  const [selectedCounselor, setselectedCounselor] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sname, setSname] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [status, setStatus] = useState([]);
  const [arrIds, setArrIds] = useState([]);
  const [data, setData] = useState([]);

  const [isDeleting, setIsDeleting] = useState(false);

  const [counselors, setCounselors] = useState([]);
  const [adminCounselors, setAdminCounselors] = useState([]);

  const isAdminOrSupervisor = ['admin', 'sup_admin', 'gen_supervisor', 'admin_counselor'].includes(userType?.name);

  const restorePrevious = async (leadID) => {
    try {
      console.log('my lead id', leadID);
      const res = await fetch(config.apiUrl + 'api/lead-restore/', {
        method: 'POST',
        headers: { Authorization: `Bearer ${user.token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: leadID })
      });
      if (res.ok) {
        const json = await res.json();
        console.log(json);
        setLoading(true);
        showStatusRevesedSwal();
        fetchLeads();
      } else {
        if (res.status === 401) {
          console.error('Unauthorized access. Logging out.');
          logout();
        } else if (res.status === 500) {
          console.error('Internal Server Error.');
          logout();
          return;
        } else {
          showErrorSwal2();
          console.error('Error fetching sources:', res.statusText);
        }
        return;
      }
    } catch (error) {
      showErrorSwal2();
      console.error('Error fetching sources:', error.message);
    }
  };

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
  const showStatusRevesedSwal = () => {
    Toast.fire({
      icon: 'success',
      title: 'Status Reversed Successfully.'
    });
  };
  // error showErrorSwal
  const showErrorSwal = () => {
    Toast.fire({
      icon: 'error',
      title: 'Error While Assigning.'
    });
  };

  const showErrorSwal2 = () => {
    Toast.fire({
      icon: 'error',
      title: 'Error Occured.'
    });
  };

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
    {
      field: 'source',
      headerName: '',
      width: 10,
      align: 'center',
      renderCell: (params) => (
        <Tooltip title={params.row.source} arrow>
          {iconComponentMap[params.row.source]}
        </Tooltip>
      )
    },
    { field: 'reference_number', headerName: '#', align: 'center', width: 55, headerAlign: 'center' },

    { field: 'date', headerName: 'Date', flex: 0, width: 100, minWidth: 50 },
    { field: 'name', headerName: 'Student Name', flex: 0.5, width: 100, minWidth: 150 },
    { field: 'contact_no', headerName: 'Contact No', flex: 1, width: 100, minWidth: 150 },
    { field: 'status', headerName: 'Status', flex: 1, width: 100, minWidth: 150 },
    {
      field: 'course_code',
      headerName: 'Course',
      flex: 0.5,
      width: 100,
      minWidth: 50
    },
    {
      field: 'counsellor',
      headerName: 'Assign To',
      description: 'This column has a value getter and is not sortable.',
      sortable: false,
      flex: 1,
      width: 100,
      minWidth: 150,
      align: 'left',
      renderCell: (params) => {
        if (isAdminOrSupervisor) {
          return (
            <>
              <Autocomplete
                disablePortal
                id="combo-box-demo"
                options={counselors.concat(adminCounselors)}
                sx={{ width: 200, my: 2 }}
                renderInput={(params) => <TextField {...params} variant="standard" />}
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
                        if (updateLead.status === 401) {
                          console.error('Unauthorized access. Logging out.');
                          logout();
                        } else if (updateLead.status === 500) {
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

  const shortenCourseName = (courseName) => {
    // Check if the course name is "Other"
    if (courseName.toLowerCase() === 'other') {
      return 'Other'; // Return 'Other' as is
    }

    // Split the course name by spaces to get individual words
    const words = courseName.split(' ');

    // Map over each word and extract the first letter while excluding parentheses
    const shortenedName = words
      .map((word) => {
        // Remove parentheses from the word
        const wordWithoutParentheses = word.replace(/[()]/g, '');
        // Take the first letter of the word
        return wordWithoutParentheses.charAt(0).toUpperCase();
      })
      .join(''); // Join the first letters together

    return shortenedName; // Return the shortened course name
  };

  function updateLead(leadId) {
    console.log('clicked lead id', leadId);
    navigate('/app/leads/update?id=' + leadId);
  }

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

      leads = leads.map((lead) => {
        const student = lead.student_id || {};

        return {
          reference_number: lead.reference_number,
          id: lead._id,
          date: lead.date,
          scheduled_at: lead.scheduled_at || null,
          scheduled_to: lead.scheduled_to || null,
          name: student.name || null,
          contact_no: student.contact_no || null,
          address: student.address || null,
          dob: student.dob || null,
          email: student.email || null,
          nic: student.nic || null,
          course: lead.course_id.name,
          course_code: shortenCourseName(lead.course_id.name),
          branch: lead.branch_id.name,
          source: lead.source_id ? lead.source_id.name : null,
          counsellor: lead.counsellor_id ? lead.counsellor_id.name : null,
          counsellor_id: lead.counsellor_id ? lead.counsellor_id._id : null,
          assigned_at: lead.counsellorAssignment ? lead.counsellorAssignment.assigned_at : null,
          user_id: lead.user_id || null,
          status: lead.status_id ? lead.status_id.name : null
        };
      });

      if (permissions?.lead?.includes('read-all')) {
        setData(leads);
        setAllLeads(leads);
        setLoading(false);
        return;
      } else if (permissions?.lead?.includes('read') && userType?.name === 'counselor') {
        const filteredLeads = leads.filter((lead) => lead.counsellor_id === user._id);
        setData(filteredLeads);
        setAllLeads(filteredLeads);
        setLoading(false);
        return;
      } else if (permissions?.lead?.includes('read') && userType?.name === 'user') {
        const filteredLeads = leads.filter((lead) => lead.user_id === user._id);
        setData(filteredLeads);
        setAllLeads(filteredLeads);
        setLoading(false);
        return;
      }
    } catch (error) {
      console.log('Error fetching leads:', error);
    }
  }

  useEffect(() => {
    fetchLeads();
    const fetchCourses = async () => {
      try {
        const res = await fetch(config.apiUrl + 'api/courses', {
          method: 'GET',
          headers: { Authorization: `Bearer ${user.token}` }
        });
        if (res.ok) {
          const json = await res.json();
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
            console.error('Error fetching courses:', res.statusText);
          }
          return;
        }
      } catch (error) {
        console.error('Error fetching courses:', error.message);
      }
    };
    fetchCourses();
    const fetchSources = async () => {
      try {
        const res = await fetch(config.apiUrl + 'api/source', {
          method: 'GET',
          headers: { Authorization: `Bearer ${user.token}` }
        });
        if (res.ok) {
          const json = await res.json();
          setSources(json);
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
          }
          return;
        }
      } catch (error) {
        console.error('Error fetching sources:', error.message);
      }
    };
    fetchSources();
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

    async function getAdminCounselors() {
      try {
        const res = await fetch(config.apiUrl + 'api/getAdminCounselors', {
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
        setAdminCounselors(data);
      } catch (error) {
        console.log('Error fetching counselors:', error);
      }
    }
    getAdminCounselors();
  }, []);

  async function fetchStatus() {
    try {
      const res = await fetch(config.apiUrl + 'api/status', {
        method: 'GET',
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setStatus(json);
      } else {
        if (res.status === 401) {
          console.error('Unauthorized access. Logging out.');
          logout();
        } else if (res.status === 500) {
          console.error('Internal Server Error.');
          logout();
          return;
        } else {
          console.error('Error fetching status:', res.statusText);
        }
        return;
      }
    } catch (error) {
      console.error('Error fetching status:', error.message);
    }
  }

  useEffect(() => {
    fetchStatus();
  }, []);

  const sortLeads = () => {
    const filteredLeads = allLeads.filter((lead) => {
      const matchesCourse = checkMatch(lead.course, selectedCourse);
      const matchesSource = checkMatch(lead.source, selectedSource);
      const matchesStatus = checkMatch(lead.status, selectedStatus);
      const matchesDateRange = filterByDateRange(lead.date);
      const matchesCounselor = checkMatch(lead.counsellor, selectedCounselor);

      return matchesCourse && matchesSource && matchesStatus && matchesDateRange && matchesCounselor;
    });

    setData(filteredLeads);
  };

  const checkMatch = (leadProperty, selectedProperty) => {
    return selectedProperty ? leadProperty === selectedProperty : true;
  };

  const filterByDateRange = (leadDate) => {
    if (!dateFrom && !dateTo) {
      return true;
    }

    const leadDateObj = new Date(leadDate);
    const fromDateObj = dateFrom ? new Date(dateFrom) : null;
    const toDateObj = dateTo ? new Date(dateTo) : null;

    if (fromDateObj && toDateObj) {
      return leadDateObj >= fromDateObj && leadDateObj <= toDateObj;
    } else if (fromDateObj) {
      return leadDateObj >= fromDateObj;
    } else if (toDateObj) {
      return leadDateObj <= toDateObj;
    } else {
      return true;
    }
  };

  // Call sortLeads whenever any filtering criteria changes
  useEffect(() => {
    sortLeads();
  }, [selectedCourse, selectedSource, selectedStatus, dateFrom, dateTo, selectedCounselor]);

  const sortDateRange = (fromDate, toDate) => {
    const sortedLeads = allLeads.filter((lead) => {
      const leadDate = new Date(lead.date);
      const fromDateObj = fromDate ? new Date(fromDate) : null;
      const toDateObj = toDate ? new Date(toDate) : null;

      if (fromDate && toDate) {
        return leadDate >= fromDateObj && leadDate <= toDateObj;
      } else if (fromDate) {
        return leadDate >= fromDateObj;
      } else if (toDate) {
        return leadDate <= toDateObj;
      } else {
        return true;
      }
    });
    setData(sortedLeads);
    console.log(sortedLeads);
  };

  const sortSources = (source) => {
    const sortedLeads = allLeads.filter((lead) => lead.source === source);
    setData(sortedLeads);
    console.log(sortedLeads);
  };

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
    console.log(sortedLeads);
  };

  const sortCourses = (course) => {
    const sortedLeads = allLeads.filter((lead) => lead.course === course);
    setData(sortedLeads);
    console.log(sortedLeads);
  };

  const sortStatus = (status) => {
    const sortedLeads = allLeads.filter((lead) => lead.status === status);
    setData(sortedLeads);
    console.log(sortedLeads);
  };

  const sortCounselors = (counselor) => {
    const sortedLeads = allLeads.filter((lead) => lead.counsellor === counselor);
    setData(sortedLeads);
    console.log(sortedLeads);
  };

  const handleRowClick = (params) => {
    setSelectedLead(params.row);
    console.log(params.row);
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

  async function addToArchivedLeads() {
    setIsDeleting(true);
    try {
      const res = await fetch(config.apiUrl + 'api/leads-archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({ ids: arrIds })
      });

      if (res.ok) {
        const json = await res.json();
        console.log(json);
        setLoading(true);
        setArrIds([]);
        fetchLeads();
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
        fetchLeads();
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
    // need to export column data to excel
    // console.log(data);
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
        title="View Leads"
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
                <Grid item xs={12} sm={1.5}>
                  <Typography variant="h6" component="h6" style={{ marginBottom: '-10px' }}>
                    Course
                  </Typography>
                  <TextField
                    fullWidth
                    // label="First Name"
                    margin="normal"
                    name="course"
                    size="small"
                    select
                    SelectProps={{ native: true }}
                    value={selectedCourse}
                    onChange={(event) => {
                      setselectedCourse(event.target.value);
                      console.log(event.target.value);
                      sortCourses(event.target.value);
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AssignmentIcon />
                        </InputAdornment>
                      )
                    }}
                  >
                    <option value="" disabled></option>
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
                <Grid item xs={12} sm={1.5}>
                  <Typography variant="h6" component="h6" style={{ marginBottom: '-10px' }}>
                    Source
                  </Typography>
                  <TextField
                    fullWidth
                    // label="First Name"
                    margin="normal"
                    name="media"
                    size="small"
                    select
                    SelectProps={{ native: true }}
                    value={selectedSource}
                    onChange={(event) => {
                      setselectedSource(event.target.value);
                      sortSources(event.target.value);
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <InsertLinkIcon />
                        </InputAdornment>
                      )
                    }}
                  >
                    <option value="" disabled></option>
                    {source && source.length > 0 ? (
                      source.map((option) => (
                        <option key={option._id} value={option.name}>
                          {option.name}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        No Sources available
                      </option>
                    )}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={1.5}>
                  <Typography variant="h6" component="h6" style={{ marginBottom: '-10px' }}>
                    Status
                  </Typography>
                  <TextField
                    fullWidth
                    // label="First Name"
                    margin="normal"
                    name="status"
                    size="small"
                    select
                    SelectProps={{ native: true }}
                    value={selectedStatus}
                    onChange={(event) => {
                      setSelectedStatus(event.target.value);
                      sortStatus(event.target.value);
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <TimelineIcon />
                        </InputAdornment>
                      )
                    }}
                  >
                    <option value="" disabled></option>
                    {status && status.length > 0 ? (
                      status.map((option) => (
                        <option key={option._id} value={option.name}>
                          {option.name}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        No Status available
                      </option>
                    )}
                    {/* <option value="New">New</option>
                    <option value="Registered">Registered</option>
                    <option value="Dropped">Dropped</option>
                    <option value="Next Intake">Next Intake</option>
                    <option value="Send Mail">Send Mail</option>
                    <option value="Ring No Answer">Ring No Answer</option>
                    <option value="Shedule Meeting">Shedule Meeting</option>
                    <option value="Fake">Fake</option>
                    <option value="Duplicate">Duplicate</option>
                    <option value="Course Details sent">Course Details sent</option>
                    <option value="WhatsApp & SMS">WhatsApp & SMS</option> */}
                  </TextField>
                </Grid>
                {permissions?.lead?.includes('read-all') && (
                  <Grid item xs={12} sm={1.5}>
                    <Typography variant="h6" component="h6" style={{ marginBottom: '-10px' }}>
                      Counselor
                    </Typography>
                    <TextField
                      fullWidth
                      // label="First Name"
                      margin="normal"
                      name="counselor"
                      size="small"
                      select
                      SelectProps={{ native: true }}
                      value={selectedCounselor}
                      onChange={(event) => {
                        setselectedCounselor(event.target.value);
                        console.log(event.target.value);
                        sortCounselors(event.target.value);
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon />
                          </InputAdornment>
                        )
                      }}
                    >
                      <option value="" disabled></option>
                      {counselors.concat(adminCounselors) && counselors.concat(adminCounselors).length > 0 ? (
                        counselors.concat(adminCounselors).map((option) => (
                          <option key={option.id} value={option.label}>
                            {option.label}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>
                          No Counselors available
                        </option>
                      )}
                    </TextField>
                  </Grid>
                )}
                <Grid item xs={12} sm={1.5}>
                  <Typography variant="h6" component="h6" style={{ marginBottom: '-10px' }}>
                    Date From
                  </Typography>
                  <TextField
                    fullWidth
                    margin="normal"
                    name="date"
                    type="date"
                    size="small"
                    value={dateFrom}
                    onChange={(event) => {
                      const selectedDate = event.target.value;
                      setDateFrom(selectedDate);
                      sortDateRange(selectedDate, dateTo);
                    }}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={1.5}>
                  <Typography variant="h6" component="h6" style={{ marginBottom: '-10px' }}>
                    Date To
                  </Typography>
                  <TextField
                    fullWidth
                    margin="normal"
                    name="date"
                    type="date"
                    size="small"
                    value={dateTo}
                    onChange={(event) => {
                      const selectedDate = event.target.value;
                      setDateTo(selectedDate);
                      sortDateRange(dateFrom, selectedDate);
                    }}
                  />
                </Grid>
                <Grid style={{ marginTop: '30px' }} item xs={12} sm={0.5}>
                  <Button
                    variant="contained"
                    color="error"
                    sx={{ borderRadius: '50%', padding: '8px', minWidth: 'unset', width: '32px', height: '32px' }}
                    onClick={() => {
                      setselectedCourse('');
                      setselectedSource('');
                      setselectedCounselor('');
                      setDateFrom('');
                      setDateTo('');
                      setSname('');
                      setSelectedStatus('');
                      setData(allLeads);
                    }}
                  >
                    <HighlightOffIcon sx={{ fontSize: '18px' }} />
                  </Button>
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
