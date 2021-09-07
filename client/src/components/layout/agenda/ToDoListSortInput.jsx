import React from 'react';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import DeleteIcon from '@material-ui/icons/Delete';
import IconButton from '@material-ui/core/IconButton';
import { FormControl } from '@material-ui/core';
import { sortHeadStyles as useStyles, dragUpHoverStyles, dragDownHoverStyles, isDraggingStyles } from './styles';
import { useDispatch } from 'react-redux';
import { deleteSort, updateSort } from '../../../slices/agendaSlice';
import TextField from '@material-ui/core/TextField';
import { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';

export default function SortInput({ index, moveItem, sort, headCells }) {
    const classes = useStyles();
    const dispatch = useDispatch();
    const ref = useRef(null);
    const [{ isDraggingUp, isDraggingDown, canDrop, isOver, handlerId }, drop] = useDrop({
        accept: 'item',
        collect(monitor) {
            return {
                handlerId: monitor.getHandlerId(),
                isOver: monitor.isOver(),
                canDrop: monitor.canDrop(),
                isDraggingDown: monitor.isDraggingDown,
                isDraggingUp: monitor.isDraggingUp
            };
        },
        hover(item, monitor) {
            if (!ref.current) {
                return;
            }
            const dragIndex = item.index;
            const hoverIndex = index;
            // Determine rectangle on screen
            const hoverBoundingRect = ref.current?.getBoundingClientRect();
            // Get vertical middle
            const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
            // Determine mouse position
            const clientOffset = monitor.getClientOffset();
            // Get pixels to the top
            const hoverClientY = clientOffset.y - hoverBoundingRect.top;

            if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
                monitor.isDraggingDown = true;
            } else {
                monitor.isDraggingDown = false;
            }

            if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
                monitor.isDraggingUp = true;
            } else {
                monitor.isDraggingUp = false;
            }
        },
        drop(item, monitor) {
            if (!ref.current) {
                return;
            }
            const dragIndex = item.id;
            const hoverIndex = index;
            // Don't replace items with themselves
            if (dragIndex === hoverIndex) {
                return;
            }
            moveItem(dragIndex, hoverIndex);
            item.index = hoverIndex;
        },
    });
    const [{ isDragging }, drag] = useDrag({
        type: 'item',
        item: () => {
            return { id: sort.id, index };
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });


    drag(drop(ref));

    const handleDeleteClick = function (id) {
        dispatch(deleteSort(id));
    };

    const handleNameChange = (evt) => {
        dispatch(updateSort({ id: sort.id, name: 'name', value: evt.target.value }));
    };

    const handleDirectionChange = (evt) => {
        dispatch(updateSort({ id: sort.id, name: 'direction', value: evt.target.value }));
    };
    const isActive = canDrop && isOver;
    const droppable = isActive ? isDraggingUp ? dragUpHoverStyles : (isDraggingDown ? dragDownHoverStyles : {}) : {};
    const dragging = isDragging ? isDraggingStyles : {};

    return (
        <div ref={ref} data-handler-id={handlerId} className={`${classes.sortContainer}`} style={{ ...dragging, ...droppable }}>
            <FormControl className={classes.formControlNumber}>
                <TextField label="Order" id={`sort-id-select-${sort.id}`} readOnly value={sort.id + 1} />
            </FormControl>
            <FormControl className={classes.formControl}>
                <InputLabel id="sort-name-label">Column</InputLabel>
                <Select
                    labelId="sort-name-label"
                    id="sort-name-select"
                    value={sort.name}
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
                <InputLabel id={`sort-direction-label-${sort.id}`}>Direction</InputLabel>
                <Select
                    labelId="sort-direction-label"
                    labelWidth={45}
                    id={`sort-direction-select-${sort.id}`}
                    value={sort.direction}
                    onChange={handleDirectionChange}
                >
                    [
                    <MenuItem key={0} value="asc">Ascending</MenuItem>,
                    <MenuItem key={1} value="desc">Descending</MenuItem>
                    ]
                </Select>
            </FormControl>
            <IconButton onClick={() => handleDeleteClick(sort.id)}><DeleteIcon /></IconButton>
        </div>
    );
}
