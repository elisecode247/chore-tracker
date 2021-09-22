import React, { useRef, useState } from 'react';
import { useGetChoresQuery } from '../../../slices/choresApiSlice';
import Scheduler, { Resource, View } from 'devextreme-react/scheduler';
import 'devextreme/dist/css/dx.material.purple.light.css';
import '../../../styles/scheduler.css';
import agendaStatuses from '../../../constants/agendaStatuses';
import { useGetAllEventsQuery, useAddEventMutation, useUpdateEventMutation } from '../../../slices/eventsApiSlice';
import AppointmentTooltipLayout from './AppointmentTooltipLayout';
import subMinutes from 'date-fns/subMinutes';
import addMinutes from 'date-fns/addMinutes';
import isToday from 'date-fns/isToday';
import format from 'date-fns/format';
import set from 'date-fns/set';
import getDate from 'date-fns/getDate';
import getMonth from 'date-fns/getMonth';
import getYear from 'date-fns/getYear';
import differenceInMinutes from 'date-fns/differenceInMinutes';
import { TIME_FORMAT } from '../../../constants/dateTimeFormats';
const eventStatuses = Object.entries(agendaStatuses).map(([value, name]) => ({ name, value }));
const today = new Date();
const todayYear = getYear(today);
const todayMonth = getMonth(today);
const todayDate = getDate(today);

const getToday = () => {
    const savedDate = localStorage.getItem('agendaCurrentDate');
    if (!isToday(new Date(savedDate))) {
        localStorage.setItem('agendaCurrentDate', new Date());
        localStorage.setItem('agendaSkippedChoresToday', []);
    }
    return today;
};
export default function EventsList() {
    const [today] = useState(getToday());
    const savedSkippedChoresToday = localStorage.getItem('agendaSkippedChoresToday') && JSON.parse(localStorage.getItem('agendaSkippedChoresToday'));
    const [skippedChoresToday, setSkippedChoresToday] = useState(savedSkippedChoresToday || []);
    const [addEvent] = useAddEventMutation();
    const [updateEvent] = useUpdateEventMutation();
    const { data: chores } = useGetChoresQuery();
    const { data: events } = useGetAllEventsQuery();
    const schedulerRef = useRef(null);
    const formattedChores = chores && chores.map((chore) => {
        const startDate = new Date(chore.start_at);
        return {
            ...chore,
            text: chore.name,
            rule: chore.frequency,
            exception: getSkippedChoresToday({ chore, events, skippedChoresToday }),
            startDate,
            ...(!chore.end_at ? {} : { endDate: new Date(chore.end_at) }),
            type: 'chore',
            allDay: !chore.has_time
        };
    });

    const formattedEvents = events && events.map((event) => {
        const startDate = event.started_at ? new Date(event.started_at) : subMinutes(new Date(event.completed_at), 30);
        const endDate = event.completed_at ? new Date(event.completed_at) : addMinutes(new Date(event.started_at), 30);
        return {
            ...event,
            text: event.name,
            type: 'event',
            startDate: Math.abs(differenceInMinutes(startDate, endDate)) < 30 ? subMinutes(new Date(event.completed_at), 30) : startDate,
            endDate,
            allDay: false
        };
    });
    const allItems = [
        ...(formattedEvents ? formattedEvents : []),
        ...(formattedChores ? formattedChores : [])
    ];

    const handleAppointmentUpdated = function (schedulerEvent) {
        const data = schedulerEvent.appointmentData;
        updateEvent({
            uuid: data.uuid,
            status: data.status,
            ...(data.updatedStartDate ? { startedAt: data.updatedStartDate } : {}),
            ...(data.updatedEndDate ? { completedAt: data.updatedEndDate } : {}),
            notes: data.notes
        });
    };

    const handleChoreSkip = function (choreUuid) {
        setSkippedChoresToday([...skippedChoresToday, choreUuid]);
        localStorage.setItem('agendaSkippedChoresToday', JSON.stringify([...skippedChoresToday, choreUuid]));
        schedulerRef.current.instance.hideAppointmentTooltip();
    };

    const handleChoreDone = function (choreUuid) {
        addEvent({
            choreUuid,
            status: 'done',
            completedAt: new Date()
        });
        schedulerRef.current.instance.hideAppointmentTooltip();
    };

    const handleChoreStart = function (choreUuid) {
        addEvent({
            choreUuid,
            status: 'progress',
            startedAt: new Date()
        });
        schedulerRef.current.instance.hideAppointmentTooltip();
    };

    const handleEventDone = function (eventUuid) {
        updateEvent({
            uuid: eventUuid,
            status: 'done',
            completedAt: new Date(),
        });
        schedulerRef.current.instance.hideAppointmentTooltip();
    };

    const handleOnAppointmentTooltipRender = (e) => {
        return (
            <AppointmentTooltipLayout
                onIgnoreChoreClick={handleChoreSkip}
                onChoreDone={handleChoreDone}
                onChoreStart={handleChoreStart}
                onEventDone={handleEventDone}
                appointmentData={e.appointmentData}
            />);
    };

    return (
        <div className="dx-viewport" spacing={1}>
            <Scheduler id="scheduler"
                ref={schedulerRef}
                cellDuration={30}
                dataSource={allItems}
                defaultCurrentDate={today}
                defaultCurrentView="day"
                forceIsoDateParsing="false"
                height={600}
                startDayHour={6}
                onAppointmentFormOpening={handleAppointmentFormOpening}
                onAppointmentUpdated={handleAppointmentUpdated}
                appointmentTooltipRender={handleOnAppointmentTooltipRender}
                useDropDownViewSwitcher={false}
                recurrenceRuleExpr="rule"
                recurrenceExceptionExpr="exception"
            >
                <View
                    appointmentRender={renderAppointment}
                    name="day"
                    type="day"
                    groups={['type']}
                    groupOrientation="horizontal"
                />
                <View
                    appointmentRender={renderAppointment}
                    name="week"
                    type="week"
                />
                <View
                    appointmentRender={renderAppointment}
                    name="month"
                    type="month"
                />
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

    if (schedulerEvent.appointmentData.type === 'chore') {
        schedulerEvent.cancel = true;
        return;
    }

    // TODO add event form
    form.itemOption('mainGroup', 'items', [
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
                valueExpr: 'value',
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
    if (data.type === 'chore') {
        return (
            <>
                <b> {data.text} </b>
                <i style={{ padding: '0 0.5rem 0 0.5rem' }}>
                    {data.has_time ? format(new Date(data.start_at), TIME_FORMAT) : 'any time'}
                    {data.end_at ? (<> to {format(new Date(data.end_at), TIME_FORMAT)}</>) : null}
                </i>
            </>
        );
    }
    if (data.type === 'event') {
        return (
            <>
                <b> {data.text} </b>
                {data.started_at ? (<i style={{ padding: '0 0.5rem 0 0.5rem' }}>{format(new Date(data.started_at), TIME_FORMAT)}</i>) : null}
                {data.completed_at ? (<i style={{ padding: '0 0.5rem 0 0.5rem' }}>{format(new Date(data.completed_at), TIME_FORMAT)}</i>) : null}
                <i> {data.status} </i>
            </>
        );
    }
};

const getSkippedChoresToday = function ({ chore, events, skippedChoresToday }) {
    return skippedChoresToday.includes(chore.uuid) || (events && events.find(event => event.chore_uuid === chore.uuid && event.status === 'done' && isToday(new Date(event.completed_at)))) ?
        format(set(new Date(chore.start_at), { year: todayYear, month: todayMonth, date: todayDate }), `yyyyMMdd${'\'T\''}HHmmss`)
        : '';
};
