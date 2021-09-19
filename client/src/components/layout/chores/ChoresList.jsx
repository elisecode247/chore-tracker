import { useEffect, useState } from 'react';
import { useGetTagsQuery } from '../../../slices/tagsApiSlice';
import { useGetChoresQuery } from '../../../slices/choresApiSlice';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import ChoreListRow from './ChoreListRow';
import { choresListStyles as useStyles } from './styles';
import ChoresListTagFilterHead from './ChoresListTagFilterHead';

export default function ChoresList() {
    const classes = useStyles();
    const { data: tags } = useGetTagsQuery();
    const { data: choresFromServer, error, isLoading } = useGetChoresQuery();
    const [selectedTags, setSelectedTags] = useState((
        localStorage.getItem('choresListSelectedTags') && JSON.parse(localStorage.getItem('choresListSelectedTags'))) || []
    );
    const [chores, setChores] = useState(filterChoresBySelectedTags(choresFromServer, selectedTags));

    useEffect(() => {
        if (choresFromServer) {
            setChores(filterChoresBySelectedTags(choresFromServer, selectedTags));
        }
    }, [choresFromServer, selectedTags, tags]);

    if (error) {
        return (<div>Error</div>);
    }

    if (isLoading) {
        return (<div>Loading...</div>);
    }

    return (
        <div className={classes.root}>
            <AppBar className={classes.appBar} position="static">
                <Toolbar>
                    <ChoresListTagFilterHead selectedTags={selectedTags} setSelectedTags={setSelectedTags}/>
                </Toolbar>
            </AppBar>
            <TableContainer component={Paper}>
                <Table aria-label="collapsible table">
                    <TableHead>
                        <TableRow>
                            <TableCell className={classes.borderRight}>Active</TableCell>
                            <TableCell className={classes.borderRight}>Name</TableCell>
                            <TableCell className={classes.borderRight}>When</TableCell>
                            <TableCell className={classes.borderRight}>Categories</TableCell>
                            <TableCell>Details</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {chores.map((chore)=>(<ChoreListRow key={chore.uuid} chore={chore} tags={tags} />))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
}

function filterChoresBySelectedTags(chores, selectedTags) {
    if (!chores) return [];
    if (!selectedTags || (selectedTags && !selectedTags.length)) return chores;
    const filteredChores = chores.filter(row => {
        let matchesAllTags = true;
        if(row.tags && !row.tags.length) {
            matchesAllTags = false;
        } else {
            const itemTags = (row.tags && row.tags.map(t => t.uuid)) || [];
            selectedTags.forEach(t => {
                if (!itemTags.includes(t)) {
                    matchesAllTags = false;
                }
            });
        }
        return matchesAllTags;
    });

    return filteredChores;
}
