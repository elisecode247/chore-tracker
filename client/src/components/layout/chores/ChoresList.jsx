import { useGetChoresQuery } from '../../../slices/choresApiSlice';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import ChoreListRow from './ChoreListRow';
import { formatChores } from '../../../utilities/chores';

export default function ChoresList() {
    const { data: chores, error, isLoading } = useGetChoresQuery();
    const formattedChores = Object.values(formatChores(chores));

    if (error) {
        return (<div>Error</div>);
    }

    if (isLoading) {
        return (<div>Loading...</div>);
    }

    return (
        <TableContainer component={Paper}>
            <Table aria-label="collapsible table">
                <TableHead>
                    <TableRow>
                        <TableCell />
                        <TableCell>Active</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>When</TableCell>
                        <TableCell>Categories</TableCell>
                        <TableCell></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {formattedChores.map((chore, idx) => {
                        return (<ChoreListRow key={idx} chore={chore} />);
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
