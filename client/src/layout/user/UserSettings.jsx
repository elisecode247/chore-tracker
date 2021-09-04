import { useEffect, useState } from 'react';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { useDispatch, useSelector } from 'react-redux';
import { userSelector } from '../../slices/userApiSlice';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import SaveIcon from '@material-ui/icons/Save';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import InputLabel from '@material-ui/core/InputLabel';
import Typography from '@material-ui/core/Typography';
import { updateUserSettings } from '../../slices/userApiSlice';
import { defaultJournalSettings } from '../../constants/defaultValues';
const useStyles = makeStyles((theme) => ({
    card: {
        margin: '1rem',
        padding: '1rem',
        '&> *': {
            margin: '1rem 0'
        }
    }
}));

export default function UserSettings() {
    const classes = useStyles();
    const dispatch = useDispatch();
    const { settings, isFetching: isUserLoading, isError: isUserError } = useSelector(userSelector);
    const journalSettings = (Object.values(settings).length && settings) || defaultJournalSettings;
    const [journalInstructions, setJournalInstructions] = useState(journalSettings.journalInstructions);
    const editor = useEditor({
        extensions: [
            StarterKit,
        ],
        editorProps: {
            attributes: {
                class: 'journalContainer'
            }
        }
    });

    useEffect(() => {
        if(editor && !editor.isDestroyed){
            editor.commands.setContent(journalSettings.journalTemplate);
        }
    }, [journalSettings, editor]);

    const handleSave = function() {
        dispatch(updateUserSettings({
            journalTemplate: editor.getHTML(),
            journalInstructions: journalInstructions
        }));

    };

    if (isUserLoading) {
        return (<>Loading...</>);
    }

    if (isUserError) {
        return (<>Error occurred</>);
    }

    return (
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <Typography variant="h4" id="settingsTitle" component="h1">
                Customizations
            </Typography>
            <Card elevation={3}>
                <CardContent>
                    <form className={classes.card} noValidate autoComplete="off">
                        <Typography variant="h5" id="settingsTitle" component="h2">
                            Journal Settings
                        </Typography>
                        <TextField
                            fullWidth
                            id="journal-instructions"
                            label="Journal Instructions"
                            multiline
                            onChange={(evt) => setJournalInstructions(evt.target.value)}
                            value={journalInstructions}
                            variant="outlined"
                        />
                        <InputLabel htmlFor="journal-entry-template">Journal Entry Template</InputLabel>
                        <EditorContent id="journal-entry-template" className={classes.entryContainer} editor={editor} />
                    </form>
                </CardContent>
                <CardActions className={classes.root}>
                    <Button size="small" onClick={handleSave}>
                        <SaveIcon />
                        Save
                    </Button>
                </CardActions>
            </Card>
        </MuiPickersUtilsProvider>
    );
}


