import {
    Badge,
    Button,
    Card,
    CardBody,
    CardHeader,
    CardTitle,
    Col,
    FormGroup,
    Input,
    Label,
    Modal,
    ModalBody,
    Popover,
    PopoverBody,
    Row,
} from 'reactstrap';
import React, { useEffect, useRef, useState } from 'react';

import { Calendar, momentLocalizer } from 'react-big-calendar';

import Select from 'react-select';
import AppointmentModalPanel from './AppointmentModalPanel';
import LawfirmCalendarEventDTO from '../../model/agenda/LawfirmCalendarEventDTO';
import {
    approvedEvent,
    countUnapprovedAgenda,
    createEvent,
    getAgenda,
    updateEvent
} from '../../services/AgendaService';
import { useAuth0 } from '@auth0/auth0-react';
import { getCalendarEventType, getUserResponsableList } from '../../services/SearchService';
import ItemDTO from '../../model/ItemDTO';
import FilterAgendaDTO from '../../model/agenda/FilterAgendaDTO';
import * as PropTypes from 'prop-types';
import ItemEventDTO from '../../model/agenda/ItemEventDTO';
import NotificationAlert from 'react-notification-alert';
import { getOptionNotification } from '../../utils/AlertUtils';
import { registerLocale } from 'react-datepicker';
import fr from 'date-fns/locale/fr';
import en from 'date-fns/locale/en-GB';
import { getDateDetails } from '../../utils/DateUtils';
import { CircularProgress } from '@material-ui/core';
import { newEvent } from '../../utils/CalendarUtils';
import Voicerecord from '../Navbars/Voicerecord';

let moment = require( 'moment-timezone' );

moment.tz.setDefault( 'Europe/Brussels' );
registerLocale( 'fr', fr );
registerLocale( 'en', en );

const padEnd = require( 'lodash/padEnd' );
const map = require( 'lodash/map' );
const size = require( 'lodash/size' );
const isNil = require( 'lodash/isNil' );
const isEmpty = require( 'lodash/isEmpty' );
const filter = require( 'lodash/filter' );

export default function Agenda( {
                                    auth0,
                                    label,
                                    history,
                                    vckeySelected,
                                    userId,
                                    language,
                                    fullName,
                                    currency,
                                    onlyDossier,
                                    dossierItem,
                                    dossierId,
                                    enumRights,
                                } ) {
    // write calendar
    const right = [0, 34, 35];

    let rightsFound;
    if ( enumRights ) {
        rightsFound = enumRights.filter( element => right.includes( element ) );
    }
    if ( !isNil( rightsFound ) && isEmpty( rightsFound ) ) {
        return (
            <p className="blockquote blockquote-primary">
                {label.unauthorized.label10}
            </p>);
    }

    const notificationAlert = useRef( null );
    const isCreatedEvent = useRef( false );
    const localizer = useRef( momentLocalizer( moment ) );
    const startAgenda = useRef( moment().hours( 0 ).minutes( 0 ).toDate() );
    const endAgenda = useRef( moment().add( 7, 'days' ).toDate() );
    const selectedEventState = useRef( [] );
    const approvedRef = useRef( false );
    const savedEventRef = useRef( false );
    const [loading, setLoading] = useState( false );
    const [modalAppointment, setModalAppointment] = useState( false );
    const [events, setEvents] = useState( [] );
    const [eventsUnapprovedCount, setEventsUnapprovedCount] = useState( 0 );
    const [eventsUnapproved, setEventsUnapproved] = useState( 0 );
    const [filterAgenda, setFilter] = useState( new FilterAgendaDTO() );
    const [userResponsableList, setUserResponsableList] = useState( [] );
    const { getAccessTokenSilently } = useAuth0();
    const [calendarTypeList, setCalendarTypeList] = useState( [] );
    const [isPopverConfirmedOpen, setIsPopverConfirmedOpen] = useState( false );

    useEffect( () => {
        (async () => {
            const accessToken = await getAccessTokenSilently();

            let resultUser = await getUserResponsableList( accessToken, vckeySelected );
            let profiles = map( resultUser.data, data => {
                if ( userId === data.value ) {
                    filterAgenda.userIdItem = new ItemDTO( data );
                    filterAgenda.userId = data.value;
                }
                return new ItemDTO( data );
            } );
            // add vc key 0 , vckey
            profiles.push( new ItemDTO( { value: 0, label: vckeySelected } ) );
            setUserResponsableList( profiles );

            let resultType = await getCalendarEventType( accessToken );
            if ( resultType.data ) {
                const calendarTypeListTemp = filter( resultType.data, type => {
                    // select all calendar type
                    filterAgenda.eventTypesSelected.push( type.value );

                    return new ItemEventDTO( type );
                } );
                setCalendarTypeList( calendarTypeListTemp );
            }

            if ( onlyDossier === true ) {
                filterAgenda.dossierId = dossierId;
            }

            const resultApproved = await countUnapprovedAgenda( accessToken, filterAgenda, vckeySelected );
            if ( !resultApproved.error ) {
                setEventsUnapprovedCount( resultApproved.data.totalElements );
                setEventsUnapproved( resultApproved.data.content );
            }

            const result = await getAgenda( accessToken, startAgenda.current, endAgenda.current, filterAgenda );
            if ( !result.error ) {
                const eventsAgenda = map( result.data, event => {
                    return new LawfirmCalendarEventDTO( event );
                } );

                setEvents( eventsAgenda );
            }
            setLoading( false );
        })();
    }, [getAccessTokenSilently, savedEventRef.current] );

    /*************/
    /* CALENDAR */
    /*************/
    const selectedEvent = event => {
        isCreatedEvent.current = false;
        setModalAppointment( true );
        selectedEventState.current = new LawfirmCalendarEventDTO( event );
    };
    const _onRangeChange = async ( event ) => {
        const accessToken = await getAccessTokenSilently();
        //alert( `THE onRangeChange ${event.start} and ${event.end}` );

        const start = event.start ? moment( event.start ) : moment( event[ 0 ] );
        let end;
        // this is single day
        if ( size( event ) === 1 ) {
            end = moment( event[ 0 ] ).add( 24, 'hours' );
        } else {
            end = event.end ? moment( event.end ) : moment( event[ size( event ) > 0 ? size( event ) - 1 : 0 ] );
        }

        startAgenda.current = start.toDate();
        endAgenda.current = end.toDate();
        event.start = start.toDate();
        event.end = end.toDate();

        const result = await getAgenda( accessToken, startAgenda.current, endAgenda.current, filterAgenda );
        if ( !result.error ) {
            const eventsAgenda = map( result.data, event => {
                event.start = new Date( event.start );
                event.end = new Date( event.end );
                return event;
            } );
            setEvents( eventsAgenda );
        }

        return event;
    };

    const addNewEventAlert = slotInfo => {
        // write calendar
        const right = [0, 35];

        let rightsFound;
        if ( enumRights ) {
            rightsFound = enumRights.filter( element => right.includes( element ) );
        }
        if ( !isNil( rightsFound ) && isEmpty( rightsFound ) ) {
            notificationAlert.current.notificationAlert( getOptionNotification( label.unauthorized.label9, 'danger' ) );
            return;
        }
        let newEv = newEvent( new LawfirmCalendarEventDTO(), slotInfo.start, slotInfo.end, userId, calendarTypeList, userResponsableList, dossierItem );
        selectedEventState.current = newEv;
        isCreatedEvent.current = true;

        setModalAppointment( true );
    };
    const onClickAddNewEventAlert = () => {
        // write calendar
        const right = [0, 35];

        let rightsFound;
        if ( enumRights ) {
            rightsFound = enumRights.filter( element => right.includes( element ) );
        }
        if ( !isNil( rightsFound ) && isEmpty( rightsFound ) ) {
            notificationAlert.current.notificationAlert( getOptionNotification( label.unauthorized.label9, 'danger' ) );
            return;
        }

        const now = moment();
        // nearest 30 minutes to the start date
        const remainder = 30 - (now.minute() % 30);
        const start = now.add( remainder, 'minutes' );

        let newEv = newEvent( new LawfirmCalendarEventDTO(), start.toDate(), start.add( 30, 'minutes' ).toDate(), userId, calendarTypeList, userResponsableList, dossierItem );
        selectedEventState.current = newEv;
        isCreatedEvent.current = true;
        setModalAppointment( true );
    };
    const toggleAppointment = async ( success ) => {
        setModalAppointment( !modalAppointment );
        approvedRef.current = false;

        if ( success === true ) {
            const accessToken = await getAccessTokenSilently();
            setLoading( true );

            const result = await getAgenda( accessToken, startAgenda.current, endAgenda.current, filterAgenda );
            if ( !result.error ) {
                const eventsAgenda = map( result.data, event => {
                    return new LawfirmCalendarEventDTO( event );
                } );

                setEvents( eventsAgenda );
            }
            setLoading( false );
        }
    };

    const eventColors = ( event ) => {
        var backgroundColor = 'event-';
        event.color
            ? (backgroundColor = backgroundColor + event.color)
            : (backgroundColor = backgroundColor + 'default');
        return {
            className: backgroundColor
        };
    };
    const onChangeCalendarType = async ( e, typeCode ) => {
        if ( e.target.checked === true ) {
            filterAgenda.eventTypesSelected = [typeCode, ...filterAgenda.eventTypesSelected];
            setFilter( { ...filterAgenda, eventTypesSelected: [typeCode, ...filterAgenda.eventTypesSelected] } );

        } else {
            let eventsTypesCodes = filterAgenda.eventTypesSelected.filter( fileObject => fileObject !== typeCode );
            filterAgenda.eventTypesSelected = eventsTypesCodes;
            setFilter( { ...filterAgenda, eventTypesSelected: eventsTypesCodes } );
        }
        const accessToken = await getAccessTokenSilently();
        setLoading( true );

        const result = await getAgenda( accessToken, startAgenda.current, endAgenda.current, filterAgenda );
        if ( !result.error ) {
            const eventsAgenda = map( result.data, event => {
                event.start = new Date( event.start );
                event.end = new Date( event.end );
                return event;
            } );
            setEvents( eventsAgenda );
        }
        setLoading( false );
    };

    const onChangeAgenda = async ( value ) => {
        const accessToken = await getAccessTokenSilently();
        filterAgenda.userId = value.value;
        setFilter( {
            ...filterAgenda,
            userIdItem: value,
            userId: value.value
        } );
        setLoading( true );
        const result = await getAgenda( accessToken, startAgenda.current, endAgenda.current, filterAgenda );
        if ( !result.error ) {
            const eventsAgenda = map( result.data, event => {
                event.start = new Date( event.start );
                event.end = new Date( event.end );
                return event;
            } );
            setEvents( eventsAgenda );
        }
        setLoading( false );
    };

    const showMessageFromPopup = ( message, type, savedEvent ) => {
        notificationAlert.current.notificationAlert( getOptionNotification( message, type ) );
        if ( savedEvent ) {
            savedEventRef.current = !savedEventRef.current;
        }
    };
    const _saveEvent = async ( selectedEvent ) => {
        // if UPDATE
        if ( !isNil( selectedEvent.id ) ) {
            const accessToken = await getAccessTokenSilently();

            // save without approval
            const result = await updateEvent( accessToken, selectedEvent.id, selectedEvent );

            if ( approvedRef.current === true ) {
                const resultApproved = await approvedEvent( accessToken, selectedEvent.id );

                if ( !resultApproved.error ) {
                    showMessageFromPopup( label.agenda.success2, 'success', true );
                    toggleAppointment( true );
                } else {
                    showMessageFromPopup( label.agenda.error11, 'danger' );
                    return;
                }
            } else {
                if ( !result.error ) {
                    showMessageFromPopup( label.agenda.success2, 'success', true );
                    toggleAppointment( true );
                } else {
                    showMessageFromPopup( label.agenda.error8, 'danger' );
                }
            }

        } else {
            const accessToken = await getAccessTokenSilently();

            const result = await createEvent( accessToken, selectedEvent );

            if ( !result.error ) {
                showMessageFromPopup( label.agenda.success1, 'success', true );
                toggleAppointment( true );
            } else {
                showMessageFromPopup( label.agenda.error9, 'danger' );
            }
        }
    };

    function EventOtherAgenda( { event } ) {
        return EventAgenda(
            event, event.color
        );
    }

    function EventDayAgenda( { event } ) {
        return EventAgenda(
            event, 'white'
        );
    }

    function EventMonthAgenda( { event } ) {
        return (
            <div onClick={() => selectedEvent( event )}>
                <em className={'white'}>{event.eventTypeItem.label}</em>
                <p>{moment( event.start ).locale( language ).format( 'LT' )} {event.title && event.title !== '' ? event.title : event.note}</p>
            </div>
        );
    }

    function EventAgenda( event, color ) {
        return (
            <div onClick={() => selectedEvent( event )}>
                <em className={color}>{event.eventTypeItem.label}</em>
                {event.eventType === 'RDV' ? (
                    <p>{event.title && event.title !== '' ? event.title : event.note}</p>
                ) : (
                    <>
                        {event.note ? (<p>{event.note}</p>) : null}
                        {event.dossier ? (<p>{label.appointmentmodalpanel.label11} : {event.dossier.label}</p>) : null}
                        {event.location ? (<p>{label.appointmentmodalpanel.label9} : {event.location}</p>) : ''}
                    </>
                )}
            </div>
        );
    }

    function TimeAgenda( { event } ) {
        const end = event.eventType !== 'TASK' ? ' - ' + moment( event.end ).locale( language ).format( 'LT' ) : '';
        return (
            <span>
              <p>{moment( event.start ).locale( language ).format( 'LT' )} {end}</p>
            </span>
        );
    }

    const _toggleRecord = () => {
        this.setState( {
            recordVisible: !this.state.recordVisible
        } );
    };
    const _toggleUnPaid = () => {
        this.setState( {
            modalNotPaidSignDocument: !this.state.modalNotPaidSignDocument
        } );
    };

    // remove record from the list
    const calendarTypeListTemp = filter( calendarTypeList, type => {
        if ( type.value !== 'RECORD' ) {
            return new ItemEventDTO( type );
        }
    } );

    return (
        <>
            {modalAppointment ? (
                <Modal size="md" isOpen={modalAppointment} toggle={toggleAppointment}>

                    <ModalBody>
                        {/* if it's a task record */}
                        {!isCreatedEvent.current && selectedEventState.current.eventType === 'RECORD' ? (
                            <Voicerecord
                                toggleUnPaid={_toggleUnPaid}
                                toggleRecord={_toggleRecord}
                                language={language}
                                label={label}
                                userId={userId}
                                fullName={fullName}
                                currency={currency}
                                history={history}
                                isCreated={isCreatedEvent.current}
                                vckeySelected={vckeySelected}
                                showMessage={showMessageFromPopup}
                                calendarTypeList={calendarTypeList}
                                selectedEventProps={selectedEventState.current}/>
                        ) : (
                            <AppointmentModalPanel toggleAppointment={toggleAppointment}
                                                   saveEvent={_saveEvent}
                                                   isLoadingSave={false}
                                                   isModal={true}
                                                   showMessageFromPopup={showMessageFromPopup}
                                                   userResponsableList={userResponsableList}
                                                   label={label}
                                                   userId={userId}
                                                   dossierId={dossierId}
                                                   language={language}
                                                   fullName={fullName}
                                                   currency={currency}
                                                   vckeySelected={vckeySelected}
                                                   history={history}
                                                   approved={approvedRef.current}
                                                   isCreated={isCreatedEvent.current}
                                                   calendarTypeList={calendarTypeListTemp}
                                                   selectedEventProps={selectedEventState.current}/>
                        )}

                    </ModalBody>

                </Modal>
            ) : null}
            <div className="rna-container">
                <NotificationAlert ref={notificationAlert}/>
            </div>

            <Card className="card-calendar">
                <CardHeader>
                    <CardTitle>
                        <h4>{label.agenda.label1}
                            <Button
                                onClick={event => onClickAddNewEventAlert( event )}
                                className="btn-icon btn-round float-right"
                                color="danger"
                                data-placement="bottom"
                                id="tooltip811118930"
                                type="button"
                            >
                                <i className="fa fa-plus color-white "/>
                            </Button>
                            <>

                                <Button
                                    className="btn-round float-right"
                                    color="primary"
                                    onClick={() => setIsPopverConfirmedOpen( !isPopverConfirmedOpen )}
                                    id="PopoverFocus"
                                    type="button"
                                >
                                    {label.agenda.label5} <Badge className="display-inline"
                                                                 color="secondary">{eventsUnapprovedCount}</Badge>
                                </Button>
                                <Popover
                                    isOpen={isPopverConfirmedOpen}
                                    trigger="legacy"
                                    toggle={() => setIsPopverConfirmedOpen( false )}
                                    placement="left" target="PopoverFocus">
                                    <PopoverBody>
                                        {map( eventsUnapproved, event => {
                                            if ( event.eventType === 'RDV' && event.approved === false ) {
                                                return (
                                                    <div
                                                        onClick={() => {
                                                            setIsPopverConfirmedOpen( !isPopverConfirmedOpen );
                                                            approvedRef.current = true;
                                                            selectedEvent( event );
                                                        }}
                                                        className="rbc-agenda-event-cell">

                                                        <div>
                                                            <p className={event.color}>{getDateDetails( event.start ) + ' - ' + getDateDetails( event.end )}</p>
                                                            <em className={event.color}>{event.eventTypeItem.label}</em>
                                                            <p>{!isNil( event.note ) ? padEnd( event.note, 20, ' ' ) : padEnd( '', 20, ' ' )}</p>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        } )}

                                    </PopoverBody>
                                </Popover>
                            </>
                        </h4>
                    </CardTitle>
                </CardHeader>
                <CardBody>
                    <Row>
                        <Col lg={9} sm={12}>
                            <Calendar
                                messages={{ noEventsInRange: label.agenda.label2 }}
                                selectable
                                localizer={localizer.current}
                                events={events}
                                defaultView="agenda"
                                culture={language}
                                scrollToTime={new Date( 2010, 1, 1, 7 )}
                                onRangeChange={event => _onRangeChange( event )}
                                onSelectEvent={event => selectedEvent( event )}
                                onSelectSlot={slotInfo => addNewEventAlert( slotInfo )}
                                eventPropGetter={eventColors}
                                style={{ height: 500 }}
                                components={{
                                    agenda: {
                                        time: TimeAgenda,
                                        event: EventOtherAgenda,
                                    },
                                    day: {
                                        time: TimeAgenda,
                                        event: EventDayAgenda,
                                    },
                                    week: {
                                        event: EventDayAgenda,
                                    },
                                    month: {
                                        event: EventMonthAgenda,
                                    },
                                }}
                            />
                        </Col>
                        {/* agenda content */}
                        {loading ? (
                            <CircularProgress color="primary" size={35}/>
                        ) : null}
                        {/* agenda filter */}
                        <Col lg={3} sm={12}>
                            <Row>
                                <Col md="12">
                                    <FormGroup>
                                        <Select
                                            menuPlacement="top"
                                            value={filterAgenda.userIdItem}
                                            className="react-select info"
                                            classNamePrefix="react-select"
                                            name="singleSelect"
                                            onChange={onChangeAgenda}
                                            options={userResponsableList}
                                            placeholder={label.wizardFrais.label17}
                                        />
                                    </FormGroup>
                                </Col>
                            </Row>
                            {map( calendarTypeList, type => {
                                return (
                                    <Row key={type.value}>
                                        <Col md="12">
                                            <FormGroup check>
                                                <Label check>
                                                    <Input
                                                        defaultChecked={true}
                                                        type="checkbox"
                                                        onChange={( e ) => onChangeCalendarType( e, type.value )}
                                                    />{' '}
                                                    <span className={`form-check-sign form-check-sign-${type.color}`}>
                                                                <span className="check">{type.label}</span>
                                                            </span>
                                                </Label>
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                );
                            } )}
                        </Col>

                    </Row>

                </CardBody>
            </Card>
        </>);
};
Agenda.propTypes = {
    userId: PropTypes.number,
    label: PropTypes.object.isRequired
};