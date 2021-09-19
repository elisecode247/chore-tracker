import React, { useRef, useState } from 'react';
import { useGetChoresQuery } from '../../../slices/choresApiSlice';
import Scheduler, { Resource } from 'devextreme-react/scheduler';
import 'devextreme/dist/css/dx.material.purple.light.css';
import '../../../styles/scheduler.css';
import agendaStatuses from '../../../constants/agendaStatuses';
import { useGetAllEventsQuery, useUpdateEventMutation } from '../../../slices/eventsApiSlice';
import AppointmentTooltipLayout from './AppointmentTooltipLayout';
import subMinutes from 'date-fns/subMinutes';
import addMinutes from 'date-fns/addMinutes';
import isToday from 'date-fns/isToday';
import format from 'date-fns/format';
import set from 'date-fns/set';
import getDate from 'date-fns/getDate';
import getMonth from 'date-fns/getMonth';
import getYear from 'date-fns/getYear';
const eventStatuses = Object.entries(agendaStatuses).map(([value, name]) => ({ name, value }));
const views = ['agenda', 'day', 'week', 'month'];
const today = new Date();
const todayYear = getYear(today);
const todayMonth = getMonth(today);
const todayDate = getDate(today);

const getToday = () => {
    const savedDate = localStorage.getItem('agendaCurrentDate');
    if(!isToday(new Date(savedDate))) {
        localStorage.setItem('agendaCurrentDate', new Date());
        localStorage.setItem('agendaSkippedChoresToday', []);
    }
    return today;
};
export default function EventsList() {
    const [today] = useState(getToday());
    const savedSkippedChoresToday = localStorage.getItem('agendaSkippedChoresToday') && JSON.parse(localStorage.getItem('agendaSkippedChoresToday'));
    const [skippedChoresToday, setSkippedChoresToday] = useState(savedSkippedChoresToday || []);
    const { data: chores } = useGetChoresQuery();
    const { data: events } = useGetAllEventsQuery();
    const schedulerRef = useRef(null);
    const formattedChores = chores && chores.map((chore) => {
        const startDate = new Date(chore.start_at);
        return {
            ...chore,
            text: chore.name,
            rule: chore.frequency,
            exception: skippedChoresToday.includes(chore.uuid) ? format(set(startDate, { year: todayYear, month: todayMonth, date: todayDate }), `yyyyMMdd${'\'T\''}HHmmss`) : '',
            startDate,
            ...(chore.frequency ? {} : { endDate: new Date(chore.end_at) }),
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
        ...(formattedChores ? formattedChores : [])
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

    const handleChoreSkip = function(choreUuid) {
        setSkippedChoresToday([...skippedChoresToday, choreUuid]);
        localStorage.setItem('agendaSkippedChoresToday', JSON.stringify([...skippedChoresToday, choreUuid]));
        schedulerRef.current.instance.hideAppointmentTooltip();
    };

    const handleOnAppointmentTooltipRender = (e) => {
        return (
            <AppointmentTooltipLayout
                onIgnoreChoreClick={handleChoreSkip}
                appointmentData={e.appointmentData}
            />);
    };

    return (
        <div className="dx-viewport" spacing={1}>
            <Scheduler id="scheduler"
                ref={schedulerRef}
                cellDuration={30}
                dataSource={allItems}
                views={views}
                defaultCurrentDate={today}
                defaultCurrentView="agenda"
                forceIsoDateParsing="false"
                height={600}
                startDayHour={6}
                onAppointmentFormOpening={handleAppointmentFormOpening}
                onAppointmentUpdated={handleAppointmentUpdated}
                appointmentRender={renderAppointment}
                appointmentTooltipRender={handleOnAppointmentTooltipRender}
                useDropDownViewSwitcher={false}
                recurrenceRuleExpr="rule"
                recurrenceExceptionExpr="exception"
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

    if (schedulerEvent.appointmentData.type === 'chore') {
        schedulerEvent.cancel = true;
        return;
    }

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
            <b> {data.text} </b>
        </>
    );
};

