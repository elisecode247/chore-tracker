import React from 'react';
import { useGetChoresQuery } from '../../../slices/choresApiSlice';
import Scheduler, { Resource } from 'devextreme-react/scheduler';
import 'devextreme/dist/css/dx.material.purple.light.css';
import '../../../styles/scheduler.css';
import agendaStatuses from '../../../constants/agendaStatuses';
import { useUpdateEventMutation } from '../../../slices/eventsApiSlice';
import format from 'date-fns/format';
import { TIME_FORMAT } from '../../../constants/dateTimeFormats';
import ScheduleIcon from '@material-ui/icons/Schedule';
import EventIcon from '@material-ui/icons/Event';
const eventStatuses = Object.entries(agendaStatuses).map(([value, name]) => ({ name, value }));
const today = new Date();
const views = ['agenda', 'day', 'week', 'workWeek', 'month'];

export default function EventsList() {
    const { data: chores } = useGetChoresQuery();
    // const { data: events } = useGetAllEventsQuery();
    const formattedChores = chores && chores.map((chore) => {
        return {
            ...chore,
            text: chore.name,
            rule: chore.frequency,
            startDate: new Date(chore.start_at),
            ...(chore.frequency ? {} : { endDate: new Date(chore.end_at) }),
            type: 'chore',
            allDay: false
        };
    });
    // const formattedEvents = events && events.map((event) => {
    //     return {
    //         ...event,
    //         text: event.name,
    //         type: 'event',
    //         startDate: !event.started_at ? subMinutes(new Date(event.completed_at), 30) : new Date(event.started_at),
    //         endDate: !event.completed_at ? addMinutes(new Date(event.started_at), 30) : new Date(event.completed_at),
    //         allDay: false
    //     };
    // });
    // const allItems = [
    //     ...(formattedEvents ? formattedEvents : []),
    //     ...(formattedChores ? formattedChores : []),
    // ];
    const [updateEvent] = useUpdateEventMutation();

    const handleAppointmentUpdated = function (schedulerEvent) {
        const data = schedulerEvent.appointmentData;
        updateEvent({
            uuid: data.uuid,
            status: data.status,
            ...(data.updatedStartedAt ? { startedAt: data.updatedStartedAt } : {}),
            ...(data.updatedEndDate ? { completedAt: data.updatedEndDate } : {}),
            notes: data.notes
        });
    };

    return (
        <div className="dx-viewport" spacing={1}>
            <Scheduler id="scheduler"
                adaptivityEnabled={true}
                cellDuration={60}
                dataSource={formattedChores}
                views={views}
                defaultCurrentView="month"
                defaultCurrentDate={today}
                startDayHour={6}
                editing={true}
                isCompact={false}
                onAppointmentFormOpening={handleAppointmentFormOpening}
                onAppointmentUpdated={handleAppointmentUpdated}
                appointmentRender={renderAppointment}
                recurrenceRuleExpr="rule"
            >
                <Resource
                    dataSource={[
                        {
                            text: 'Chore',
                            id: 'chore',
                            color: '#cc5c53'
                        },
                        {
                            text: 'Event',
                            id: 'event',
                            color: '#ff9747'
                        }
                    ]}
                    fieldExpr="type"
                    label="Type"
                />
            </Scheduler>
        </div>
    );
}


const handleAppointmentFormOpening = function (schedulerEvent) {
    let form = schedulerEvent.form;
    schedulerEvent.popup.option('showTitle', true);
    schedulerEvent.popup.option('title', schedulerEvent.appointmentData.text ?
        schedulerEvent.appointmentData.text :
        'Create a new event'
    );

    // TODO add event form
    form.itemOption('mainGroup','items', [
        {
            dataField: 'started_at',
            editorType: 'dxDateBox',
            editorOptions: {
                type: 'datetime',
                onValueChanged: function (args) {
                    form.updateData('startDate', args.value);
                    form.updateData('updatedStartDate', args.value);
                }
            }
        },
        {
            dataField: 'completed_at',
            editorType: 'dxDateBox',
            editorOptions: {
                type: 'datetime',
                onValueChanged: function (args) {
                    form.updateData('endDate', args.value);
                    form.updateData('updatedEndDate', args.value);
                }
            }
        },
        {
            colSpan: 2,
            dataField: 'status',
            editorType: 'dxSelectBox',
            editorOptions: {
                value: schedulerEvent.appointmentData.status,
                dataSource: eventStatuses,
                valueExpr:'value',
                displayExpr: 'name'
            }
        },
        {
            colSpan: 2,
            dataField: 'notes',
            editorType: 'dxTextArea',
            editorOptions: {
                value: schedulerEvent.appointmentData.notes
            }
        }
    ]);
};

const renderAppointment = (model) => {
    const data = model.appointmentData;
    return (
        <>
            {data.type === 'chore' ? (<ScheduleIcon />) : (<EventIcon />)}
            <b> {data.name} </b>
            <i> {format(data.startDate, TIME_FORMAT)}</i>
        </>
    );
};

