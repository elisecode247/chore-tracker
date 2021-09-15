import React from 'react';
import { useGetChoresQuery } from '../../../slices/choresApiSlice';
import { useGetAllEventsQuery } from '../../../slices/eventsApiSlice';
import Scheduler, { Resource } from 'devextreme-react/scheduler';
import subMinutes from 'date-fns/subMinutes';
import addMinutes from 'date-fns/addMinutes';
import 'devextreme/dist/css/dx.material.purple.light.css';
import '../../../styles/scheduler.css';
import agendaStatuses from '../../../constants/agendaStatuses';
import { useUpdateEventMutation } from '../../../slices/eventsApiSlice';
import isValid from 'date-fns/isValid';
import getHours from 'date-fns/getHours';
import getMinutes from 'date-fns/getMinutes';
import set from 'date-fns/set';

const eventStatuses = Object.entries(agendaStatuses).map(([value, name]) => ({ name, value }));
const today = new Date();
const views = ['day', 'week', 'workWeek', 'month'];

export default function EventsList() {
    const { data: chores } = useGetChoresQuery();
    const { data: events } = useGetAllEventsQuery();
    const formattedChores = chores && chores.map((chore) => {
        const scheduledAt = (chore.scheduled_at && new Date(chore.scheduled_at)) || null;
        const scheduledTime = isValid(scheduledAt) ? { hours: getHours(scheduledAt), minutes: getMinutes(scheduledAt) } :
            { hours: getHours(today), minutes: getMinutes(today) };
        const scheduledToday = chore.has_time ? set(today, scheduledTime) : today;

        return {
            ...chore,
            text: chore.name,
            startDate: scheduledToday,
            endDate: addMinutes(scheduledToday, 30),
            type: 'chore',
            allDay: !chore.has_time
        };
    });
    const formattedEvents = events && events.map((event) => {
        return {
            ...event,
            text: event.name,
            type: 'event',
            startDate: !event.started_at ? subMinutes(new Date(event.completed_at), 30) : new Date(event.started_at),
            endDate: !event.completed_at ? addMinutes(new Date(event.started_at), 30) : new Date(event.completed_at),
            allDay: false
        };
    });
    const allItems = [
        ...(formattedEvents ? formattedEvents : []),
        ...(formattedChores ? formattedChores : []),
    ];
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
                dataSource={allItems}
                views={views}
                defaultCurrentView="day"
                defaultCurrentDate={today}
                startDayHour={6}
                editing={true}
                onAppointmentFormOpening={handleAppointmentFormOpening}
                onAppointmentUpdated={handleAppointmentUpdated}
                appointmentRender={renderAppointment}
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
    return (
        <>
            <b> {model.appointmentData.name} </b>
            <i> {model.appointmentData.status} </i>
        </>
    );
};

