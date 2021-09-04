import { useState } from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import FilterListIcon from '@material-ui/icons/FilterList';
import IconButton from '@material-ui/core/IconButton';

const useStyles = makeStyles((theme) => ({
    filterIcon: {
        '&:hover': {
            color: 'orange'
        }
    }
}));

const FilterMenu = function({ filterType, onFilterChange }) {
    const classes = useStyles();
    const [anchorEl, setAnchorEl] = useState(null);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
        onFilterChange(event);
    };

    const handleClose = (event, property) => {
        setAnchorEl(null);
        onFilterChange(event, property);
    };

    return (
        <div>
            <IconButton className={classes.filterIcon} aria-controls="simple-menu" aria-haspopup="true" onClick={handleClick}>
                <FilterListIcon />
            </IconButton>
            <Menu
                id="simple-menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >
                {filterType === 'status' ? [
                    <MenuItem key={1} onClick={(evt) => handleClose(evt, 'pending')}>Not Yet</MenuItem>,
                    <MenuItem key={2} onClick={(evt) => handleClose(evt, 'progress')}>In Progress</MenuItem>,
                    <MenuItem key={3} onClick={(evt) => handleClose(evt, 'done')}>Done</MenuItem>
                ] : filterType === 'due' ? [
                    <MenuItem key={1} onClick={(evt) => handleClose(evt, 'morning')}>Morning</MenuItem>,
                    <MenuItem key={2} onClick={(evt) => handleClose(evt, 'afternoon')}>Afternoon</MenuItem>,
                    <MenuItem key={3} onClick={(evt) => handleClose(evt, 'evening')}>Evening</MenuItem>
                ] : filterType === 'frequency' ? [
                    <MenuItem key={1} onClick={(evt) => handleClose(evt, 'daily')}>Daily</MenuItem>,
                    <MenuItem key={2} onClick={(evt) => handleClose(evt, 'weekly')}>Weekly</MenuItem>,
                    <MenuItem key={3} onClick={(evt) => handleClose(evt, 'monthly')}>Monthly</MenuItem>,
                    <MenuItem key={4} onClick={(evt) => handleClose(evt, 'yearly')}>Yearly</MenuItem>
                ] : null}
            </Menu>
        </div>
    );
};

export default FilterMenu;
