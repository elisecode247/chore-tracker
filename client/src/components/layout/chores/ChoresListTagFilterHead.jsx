
import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import { filterHeadStyles as useStyles } from './styles';
import { useGetTagsQuery } from '../../../slices/tagsApiSlice';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Chip from '@material-ui/core/Chip';

export default function ChoresListTagFilterHead({ selectedTags, setSelectedTags }) {
    const classes = useStyles();
    const { data: tags, error: errorTags, isLoading: isLoadingTags } = useGetTagsQuery();
    const [view, setView] = useState(localStorage.getItem('choresListTagFilterView') === 'true');

    const handleViewChange = function() {
        setView(!view);
        localStorage.setItem('choresListTagFilterView', !view);
    };

    if (!view) {
        return (<Button className={classes.fontColor} onClick={handleViewChange}><VisibilityOffIcon />Category Filter</Button>);
    }
    const handleSelectedTagsChange = (event) => {
        const { value } = event.target;
        setSelectedTags(value);
        localStorage.setItem('choresListSelectedTags', JSON.stringify(value));
    };
    return (
        <div className={classes.root}>
            <IconButton className={classes.fontColor} onClick={handleViewChange}><VisibilityIcon /></IconButton>
            <h3 className={`${classes.inline}`}>Category Filter</h3>
            {isLoadingTags ? (<span>Loading Tags...</span>) : ((tags && tags.length) || !errorTags ? (
                <FormControl variant="outlined" className={classes.formControl}>
                    <Select
                        className={classes.fontColor}
                        id="chores-list-tag-select"
                        multiple
                        value={selectedTags}
                        onChange={handleSelectedTagsChange}
                        input={<Input id="select-multiple-chip" />}
                        renderValue={(selectedTagUuids) => (
                            <div className={classes.chips}>
                                {
                                    selectedTagUuids.map((tag) => {
                                        const selectedTag = tags.find(t => t.uuid === tag);
                                        return (
                                            <Chip key={selectedTag.uuid} label={selectedTag.name} className={classes.chip} />
                                        );
                                    })
                                }
                            </div>
                        )}
                    >
                        {tags.map((tag, index) => {
                            return (
                                <MenuItem key={index} value={tag.uuid}>
                                    {tag.name}
                                </MenuItem>
                            );
                        })}
                    </Select>
                </FormControl>
            ) : null)}
        </div>
    );
}
