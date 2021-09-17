import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { userSelector } from '../../../slices/userApiSlice';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import SaveIcon from '@material-ui/icons/Save';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import InputLabel from '@material-ui/core/InputLabel';
import Typography from '@material-ui/core/Typography';
import { updateUserSettings } from '../../../slices/userApiSlice';
import RestoreIcon from '@material-ui/icons/Restore';
import Button from '@material-ui/core/Button';
import { defaultDescription } from '../../../constants/defaultValues';
const useStyles = makeStyles((theme) => ({
    root: {
    },
    paper: {
        padding: '1rem',
        margin: '1rem auto',
        maxWidth: '700px'
    },
    setting: {
        margin: '1rem auto'
    }
}));

export default function UserSettings() {
    const classes = useStyles();
    const dispatch = useDispatch();
    const { settings, isFetching: isUserLoading, isError: isUserError } = useSelector(userSelector);
    const [journalInstructions, setJournalInstructions] = useState(settings.journalSettings.journalInstructions);
    const journalEntryEditor = useEditor({
        extensions: [
            StarterKit,
        ],
        editorProps: {
            attributes: {
                class: 'textEditorContainer'
            }
        }
    });
    const choreTemplateEditor = useEditor({
        extensions: [
            StarterKit,
        ],
        editorProps: {
            attributes: {
                class: 'textEditorContainer'
            }
        }
    });

    useEffect(() => {
        if (journalEntryEditor && !journalEntryEditor.isDestroyed) {
            journalEntryEditor.commands.setContent(settings.journalSettings.journalTemplate);
        }
    }, [journalEntryEditor, settings]);

    useEffect(() => {
        if (choreTemplateEditor && !choreTemplateEditor.isDestroyed) {
            choreTemplateEditor.commands.setContent(settings.choreSettings.choreTemplate);
        }
    }, [choreTemplateEditor, settings]);

    const handleJournalSave = function () {
        dispatch(updateUserSettings({
            ...settings,
            journalSettings: {
                journalTemplate: journalEntryEditor.getHTML(),
                journalInstructions: journalInstructions
            }
        }));
    };

    const handleChoreSave = function () {
        dispatch(updateUserSettings({
            ...settings,
            choreSettings: {
                choreTemplate: choreTemplateEditor.getHTML(),
            }
        }));
    };

    if (isUserLoading) {
        return (<>Loading...</>);
    }

    if (isUserError) {
        return (<>Error occurred</>);
    }

    return (
        <div className={classes.root}>
            <h1 className="visuallyHidden">Customizations</h1>
            <Paper
                className={classes.paper}
                elevation={3}
            >
                <Typography variant="h5" id="journalSettingTypography" component="h2">
                    Journal Settings
                    <IconButton size="small" onClick={handleJournalSave}>
                        <SaveIcon />
                    </IconButton>
                </Typography>
                <TextField
                    className={classes.setting}
                    fullWidth
                    id="journal-instructions"
                    label="Journal Instructions"
                    multiline
                    onChange={(evt) => setJournalInstructions(evt.target.value)}
                    value={journalInstructions}
                    variant="outlined"
                />
                <InputLabel htmlFor="journal-entry-template">Journal Entry Template</InputLabel>
                <EditorContent id="journal-entry-template" className={classes.entryContainer} editor={journalEntryEditor} />
            </Paper>
            <Paper className={classes.paper} elevation={3}>
                <Typography variant="h5" id="choreSettingTypography" component="h2">
                    Chore Settings
                    <IconButton size="small" onClick={handleChoreSave}>
                        <SaveIcon />
                    </IconButton>
                </Typography>
                <InputLabel className={classes.setting} htmlFor="chore-entry-template">Chore Entry Template</InputLabel>
                <EditorContent id="chore-entry-template" className={classes.entryContainer} editor={choreTemplateEditor} />
                <Button onClick={()=>{
                    choreTemplateEditor.commands.setContent(defaultDescription);
                }}><RestoreIcon/> Reset to Default</Button>
            </Paper>
        </div>
    );
}


