import PropTypes from 'prop-types';
import { forwardRef } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Card, CardContent, CardHeader, Divider, Typography, Button } from '@mui/material';

// constant
const headerSX = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  '& .MuiCardHeader-action': { marginLeft: 'auto' } // align button to the right
};

// ==============================|| CUSTOM MAIN CARD ||============================== //

const MainCard = forwardRef(
  (
    {
      border = true,
      boxShadow,
      children,
      content = true,
      contentClass = '',
      contentSX = {},
      darkTitle,
      shadow,
      sx = {},
      title,
      buttonLabel,
      buttonLabelImport,
      buttonLabelExport,
      buttonLabelDeleteAll,
      onButtonClick,
      onButtonClickImport,
      onButtonClickExport,
      onButtonClickDeleteAll,
      isDeleting,
      arrIds,

      ...others
    },
    ref
  ) => {
    const theme = useTheme();

    return (
      <Card
        ref={ref}
        {...others}
        sx={{
          border: border ? '1px solid' : 'none',
          borderColor: theme.palette.primary[200] + 25,
          ':hover': {
            boxShadow: boxShadow ? shadow || '0 2px 14px 0 rgb(32 40 45 / 8%)' : 'inherit'
          },
          ...sx
        }}
      >
        {/* card header and action */}
        {title && (
          <CardHeader
            sx={headerSX}
            title={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {darkTitle ? <Typography variant="h3">{title}</Typography> : title}
              </div>
            }
            action={<div > 
              {buttonLabelDeleteAll && onButtonClickDeleteAll && (
              <Button 
              variant="contained"
              color="error"
              disabled={arrIds.length <= 1 || isDeleting}
              style={{ marginRight: '5px' }}

              onClick={onButtonClickDeleteAll}>
                {buttonLabelDeleteAll}
              </Button>
            )}
            {buttonLabelExport && onButtonClickExport && (
             
             <Button variant="contained" color="primary" onClick={onButtonClickExport}
             style={{ marginRight: '5px' }}
             sx={{  padding: '8px', minWidth: 'unset', width: '38px', height: '36px', backgroundColor: '#2c1a96' }}
             
             >
               {buttonLabelExport}
             </Button>
           )}
            {buttonLabel && onButtonClick && (
              <Button variant="contained" color="primary" onClick={onButtonClick}>
                {buttonLabel}
              </Button>
            )}
            {buttonLabelImport && onButtonClickImport && (
              <Button variant="contained" color="primary" onClick={onButtonClickImport}>
                {buttonLabelImport}
              </Button>
            )}
          
            
            </div>}
          />
        )}

        {/* content & header divider */}
        {title && <Divider />}

        {/* card content */}
        {content && (
          <CardContent sx={contentSX} className={contentClass}>
            {children}
          </CardContent>
        )}
        {!content && children}
      </Card>
    );
  }
);

MainCard.propTypes = {
  border: PropTypes.bool,
  boxShadow: PropTypes.bool,
  children: PropTypes.node,
  content: PropTypes.bool,
  contentClass: PropTypes.string,
  contentSX: PropTypes.object,
  darkTitle: PropTypes.bool,
  secondary: PropTypes.oneOfType([PropTypes.node, PropTypes.string, PropTypes.object]),
  shadow: PropTypes.string,
  sx: PropTypes.object,
  title: PropTypes.oneOfType([PropTypes.node, PropTypes.string, PropTypes.object]),
  buttonLabel: PropTypes.string,
  onButtonClick: PropTypes.func,
};

export default MainCard;
