import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import SaveIcon from '@material-ui/icons/Save';
import Typography from '@material-ui/core/Typography';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import {
    useGetTodayJournalEntryQuery,
    useAddJournalEntryMutation,
    useUpdateJournalEntryMutation
} from '../../../slices/journalApiSlice';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useSelector } from 'react-redux';
import { userSelector } from '../../../slices/userApiSlice';
import { defaultJournalSettings } from '../../../constants/defaultValues';
import TipTapMenu from '../../TipTapMenu';

const useStyles = makeStyles({
    root: {
        padding: '1rem'
    },
    title: {
        fontSize: '0.8rem',
    },
});

export default function Journal() {
    const classes = useStyles();
    const { data: journalEntry, error: journalEntryError, isLoading: isJournalLoading } = useGetTodayJournalEntryQuery();
    const [addJournalEntry, { isLoading: isJournalEntrySubmitLoading }] = useAddJournalEntryMutation();
    const [updateJournalEntry, { isLoading: isJournalEntryUpdateLoading }] = useUpdateJournalEntryMutation();
    const { settings } = useSelector(userSelector);
    const journalSettings = (Object.values(settings).length && settings && settings.journalSettings) || defaultJournalSettings;
    const [view, setView] = useState(localStorage.getItem('journalView') === 'true');

    const editor = useEditor({
        extensions: [
            StarterKit,
        ],
        editorProps: {
            attributes: {
                class: 'textEditorContainer'
            }
        }
    });

    useEffect(()=> {
        const text = (journalEntry && journalEntry[0] && journalEntry[0].entry) || journalSettings.journalTemplate;
        if(text && editor && !editor.isDestroyed){
            editor.commands.setContent(text);
        }
    }, [journalEntry, editor, journalSettings]);

    const handleViewChange = function() {
        setView(!view);
        localStorage.setItem('journalView', !view);
    };

    const handleSave = function() {
        if (journalEntry.length) {
            updateJournalEntry({ entry: editor.getHTML(), uuid: journalEntry[0].uuid });
        } else {
            addJournalEntry({ entry: editor.getHTML(), entryDate: new Date() });
        }
    };

    if (journalEntryError) {
        return <>Error</>;
    }
    if (isJournalEntrySubmitLoading || isJournalLoading || isJournalEntryUpdateLoading) {
        return <>Loading...</>;
    }

    return (
        <Card className={classes.root} elevation={3}>
            {!view ? (
                <CardContent>
                    <Typography variant="h5" component="h2">
                        Journal
                        <IconButton onClick={handleViewChange}><VisibilityOffIcon /></IconButton>
                    </Typography>
                </CardContent>
            ) : (
                <>
                    <CardContent>
                        <Typography variant="h5" component="h2">
                            Journal
                            <IconButton onClick={handleViewChange}><VisibilityIcon /></IconButton>
                        </Typography>
                        <Typography className={classes.title} color="textSecondary" gutterBottom>
                            {journalSettings.journalInstructions}
                        </Typography>
                        <EditorContent className={classes.entryContainer} editor={editor} />
                        <TipTapMenu editor={editor} />
                    </CardContent>
                    <CardActions className={classes.root}>
                        <Button size="small" onClick={handleSave}>
                            <SaveIcon />
                            Save
                        </Button>
                    </CardActions>
                </>
            )}
        </Card>
    );
}

