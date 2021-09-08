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
    Popover,
    PopoverBody,
    Row,
} from 'reactstrap';
import React, { useEffect, useRef, useState } from 'react';

import { Calendar, momentLocalizer } from 'react-big-calendar';

import Select from 'react-select';
import AppointmentModalPanel from './AppointmentModalPanel';
import LawfirmCalendarEventDTO from '../../model/agenda/LawfirmCalendarEventDTO';
import { countUnapprovedAgenda, getAgenda } from '../../services/AgendaService';
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

let moment = require( 'moment-timezone' );

moment.tz.setDefault( 'Europe/Brussels' );
registerLocale( 'fr', fr );
registerLocale( 'en', en );

const padEnd = require( 'lodash/padEnd' );
const map = require( 'lodash/map' );
const size = require( 'lodash/size' );
const isNil = require( 'lodash/isNil' );
const isEmpty = require( 'lodash/isEmpty' );

export default function Agenda( {
                                    auth0,
                                    label,
                                    vckeySelected,
                                    userId,
                                    language,
                                    onlyDossier,
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
    //const localizer = useRef( momentLocalizer( moment.locale(language) ) );
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
    const [filter, setFilter] = useState( new FilterAgendaDTO() );
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
                    filter.userIdItem = new ItemDTO( data );
                    filter.userId = data.value;
                }
                return new ItemDTO( data );
            } );
            // add vc key 0 , vckey
            profiles.push( new ItemDTO( { value: 0, label: vckeySelected } ) );
            setUserResponsableList( profiles );

            let resultType = await getCalendarEventType( accessToken, onlyDossier );
            if ( resultType.data ) {
                const calendarTypeListTemp = map( resultType.data, type => {
                    // select all calendar type
                    filter.eventTypesSelected.push( type.value );

                    return new ItemEventDTO( type );
                } );
                setCalendarTypeList( calendarTypeListTemp );
            }

            if ( onlyDossier === true ) {
                filter.dossierId = dossierId;
            }

            const resultApproved = await countUnapprovedAgenda( accessToken, filter , vckeySelected);
            if ( !resultApproved.error ) {
                setEventsUnapprovedCount( resultApproved.data.totalElements );
                setEventsUnapproved( resultApproved.data.content );
            }

            const result = await getAgenda( accessToken, startAgenda.current, endAgenda.current, filter );
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

        const result = await getAgenda( accessToken, startAgenda.current, endAgenda.current, filter );
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
        let event = new LawfirmCalendarEventDTO();
        event.start = slotInfo.start;
        event.end = slotInfo.end;
        event.user_id = userId;
        selectedEventState.current = event;
        isCreatedEvent.current = true;
        event.userItem = userResponsableList.find( user => user.value === event.user_id );
        event.eventTypeItem = calendarTypeList[ 0 ];
        event.eventType = calendarTypeList[ 0 ].value;

        setModalAppointment( true );
    };
    const onClickAddNewEventAlert = slotInfo => {
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
        let event = new LawfirmCalendarEventDTO();
        const now = moment();
        // nearest 30 minutes to the start date
        const remainder = 30 - (now.minute() % 30);
        const start = now.add( remainder, 'minutes' );

        event.start = start.toDate();
        event.end = start.add( 30, 'minutes' ).toDate();
        event.user_id = userId;
        event.eventTypeItem = calendarTypeList[ 0 ];
        event.eventType = calendarTypeList[ 0 ].value;

        event.userItem = userResponsableList.find( user => user.value === event.user_id );
        selectedEventState.current = event;
        isCreatedEvent.current = true;
        setModalAppointment( true );
    };
    const toggleAppointment = async ( success ) => {
        setModalAppointment( !modalAppointment );
        approvedRef.current = false;

        if ( success === true ) {
            const accessToken = await getAccessTokenSilently();
            setLoading( true );

            const result = await getAgenda( accessToken, startAgenda.current, endAgenda.current, filter );
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
            filter.eventTypesSelected = [typeCode, ...filter.eventTypesSelected];
            setFilter( { ...filter, eventTypesSelected: [typeCode, ...filter.eventTypesSelected] } );

        } else {
            let eventsTypesCodes = filter.eventTypesSelected.filter( fileObject => fileObject !== typeCode );
            filter.eventTypesSelected = eventsTypesCodes;
            setFilter( { ...filter, eventTypesSelected: eventsTypesCodes } );
        }
        const accessToken = await getAccessTokenSilently();
        setLoading( true );

        const result = await getAgenda( accessToken, startAgenda.current, endAgenda.current, filter );
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
        filter.userId = value.value;
        setFilter( {
            ...filter,
            userIdItem: value,
            userId: value.value
        } );
        setLoading( true );
        const result = await getAgenda( accessToken, startAgenda.current, endAgenda.current, filter );
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
        if(savedEvent) {
            savedEventRef.current = !savedEventRef.current;
        }
    };

    function EventAgenda( { event } ) {
        return (
            <div onClick={() => selectedEvent( event )}>
                <em className={event.color}>{event.eventTypeItem.label}</em>
                {event.eventType === 'RDV' ? (
                    <p>{event.title && event.title !== '' ? event.title : event.note}</p>
                ) : (
                    <p>{event.note}</p>
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

    function EventWeekAgenda( { event } ) {
        return (
            <div onClick={() => selectedEvent( event )}>
                <em className={`white`}>{event.eventTypeItem.label}</em>
                {event.eventType === 'RDV' ? (
                    <p>{event.title && event.title !== '' ? event.title : event.note}</p>
                ) : (
                    <p>{event.note}</p>
                )}
            </div>
        );
    }

    return (
        <>
            {modalAppointment ? (
                <AppointmentModalPanel toggleAppointment={toggleAppointment}
                                       modal={modalAppointment}
                                       showMessageFromPopup={showMessageFromPopup}
                                       userResponsableList={userResponsableList}
                                       auth0={auth0}
                                       label={label}
                                       userId={userId}
                                       language={language}
                                       vckeySelected={vckeySelected}
                                       approved={approvedRef.current}
                                       isCreated={isCreatedEvent.current}
                                       calendarTypeList={calendarTypeList}
                                       selectedEvent={selectedEventState.current}/>) : null}
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
                            <Col lg={onlyDossier ? 12 : 9} sm={12}>
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
                                            event: EventAgenda,
                                        },
                                        week: {
                                            event: EventWeekAgenda,
                                        },
                                    }}
                                />
                            </Col>
                        {/* agenda content */}
                        {loading ? (
                            <CircularProgress color="primary" size={35}/>
                        ) : null}
                        {/* agenda filter */}
                        <Col lg={onlyDossier ? 5 : 3} sm={12}>
                            <Row>
                                <Col md="12">
                                    <FormGroup>
                                        <Select
                                            menuPlacement="top"
                                            value={filter.userIdItem}
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
                            {!onlyDossier ? map( calendarTypeList, type => {
                                return (
                                    <Row>
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
                            } ) : null}
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