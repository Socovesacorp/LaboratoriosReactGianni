import React, { useState } from 'react';
import { IconButton, Menu, MenuItem, Tooltip, Typography ,Button} from '@mui/material';

const CustomActionButton = ({ options, onClick , textoAcciones }) => {
    const [anchorEl, setAnchorEl] = useState(null);

    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuItemClick = (actionType) => {
        setAnchorEl(null);
        onClick(actionType);
    };

    return (
        <>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height:'40px'}}>
            <Button onClick={handleMenuClick} size="small" variant="contained"
                color="primary" style={{ marginLeft: '0px' ,marginTop:"5px" ,  marginBottom:"5px"}}>
                <Typography variant="caption" >{textoAcciones}</Typography>
            </Button>
            </div>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                {options.map((option) => (
                    <MenuItem key={option.actionType} onClick={() => handleMenuItemClick(option.actionType)} style={{ padding: '2px 15px' }}>
                        <Tooltip title={option.tooltip}>
                            <img src={option.imageSrc} alt={option.altText} style={{ width: '24px', height: '24px', marginRight: '15px' }} />
                        </Tooltip>
                        <span style={{ color: '#1976d2' }}>{option.text}</span>
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
};
export default CustomActionButton;