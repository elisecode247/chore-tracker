import React from 'react';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import DeleteIcon from '@material-ui/icons/Delete';
import IconButton from '@material-ui/core/IconButton';
import { FormControl } from '@material-ui/core';
import { filterHeadStyles as useStyles } from './styles';
import { useDispatch } from 'react-redux';
import agenda from '../../../slices/agendaSlice';
import agendaStatuses from '../../../constants/agendaStatuses';

export default function FilterInput({ filter, headCells }) {
    const classes = useStyles();
    const { deleteFilter, updateFilter } = agenda.actions;
    const dispatch = useDispatch();

    const handleDeleteClick = function(id) {
        dispatch(deleteFilter(id));
    };

    const handleNameChange = (evt) => {
        dispatch(updateFilter({ id: filter.id, name: 'name', value: evt.target.value }));
    };
    const handleOperatorChange = (evt) => {
        dispatch(updateFilter({ id: filter.id, name: 'operator', value: evt.target.value }));
    };
    const handleValueChange = (evt) => {
        dispatch(updateFilter({ id: filter.id, name: 'value', value: evt.target.value }));
    };

    return (
        <div className={classes.filterContainer}>
            <FormControl className={classes.formControl}>
                <InputLabel id="filter-name-label">Column</InputLabel>
                <Select
                    labelId="filter-name-label"
                    id="filter-name-select"
                    value={filter.name}
                    onChange={handleNameChange}
                >
                    {headCells.map((m, key) => {
                        return (
                            <MenuItem key={key} value={m.id}>{m.label}</MenuItem>
                        );
                    })}
                </Select>
            </FormControl>
            <FormControl className={classes.formControl}>
                <InputLabel id="filter-operator-label">Operator</InputLabel>
                <Select
                    labelId="filter-operator-label"
                    labelWidth={45}
                    id="filter-operator-select"
                    value={filter.operator}
                    onChange={handleOperatorChange}
                >
                    {filter.name === 'status' ? (
                        [
                            <MenuItem key={0} value="includes">Is</MenuItem>,
                            <MenuItem key={1} value="!includes">Is Not</MenuItem>
                        ]
                    ) : headCells.map((m,key) => {
                        return (
                            <MenuItem key={key} value={m.id}>{m.label}</MenuItem>
                        );
                    })}
                </Select>
            </FormControl>
            <FormControl className={classes.formControl}>
                <InputLabel id="filter-value-select-label">Value</InputLabel>
                <Select
                    multiple={filter.name === 'status'}
                    labelId="filter-value-select-label"
                    id="filter-value-select"
                    value={filter.value}
                    onChange={handleValueChange}
                >
                    {filter.name === 'status' ? Object.entries(agendaStatuses).map(([value, label], key) => (
                        <MenuItem key={key} value={value}>{label}</MenuItem>
                    )) : headCells.map((m,key) => {
                        return (
                            <MenuItem key={key} value={m.id}>{m.label}</MenuItem>
                        );
                    })}
                </Select>
            </FormControl>
            <IconButton onClick={() => handleDeleteClick(filter.id)}><DeleteIcon /></IconButton>
        </div>
    );
}
