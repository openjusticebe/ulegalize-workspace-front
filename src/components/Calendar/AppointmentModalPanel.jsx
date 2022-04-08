import React, { useEffect, useRef, useState } from 'react';

import {
    Button,
    Col,
    Form,
    FormGroup,
    FormText,
    Input,
    Label,
    ListGroupItem,
    ModalFooter,
    Row,
    Spinner
} from 'reactstrap';

import moment from 'moment';
import 'moment/locale/fr';

import DatePicker, { registerLocale } from 'react-datepicker';
import fr from 'date-fns/locale/fr';
import en from 'date-fns/locale/en-GB';
import Select from 'react-select';
import { deleteEvent, fetchLawfirmCalendar, } from '../../services/AgendaService';
import ItemDTO from '../../model/ItemDTO';
import { useAuth0 } from '@auth0/auth0-react';
import AsyncSelect from 'react-select/async/dist/react-select.esm';
import { getAffairesByVcUserIdAndSearchCriteria } from '../../services/DossierService';
import ReactBSAlert from 'react-bootstrap-sweetalert';
import AsyncCreatableSelect from 'react-select/async-creatable/dist/react-select.esm';
import { getContact } from '../../services/SearchService';
import GetApp from '@material-ui/icons/GetApp';
import { Link } from 'react-router-dom';
import VisibilityIcon from '@material-ui/icons/Visibility';
import { RegisterFraisModal } from '../Affaire/RegisterFraisModal';

const map = require( 'lodash/map' );
const isNil = require( 'lodash/isNil' );
moment.locale( 'fr' );
registerLocale( 'fr', fr );
registerLocale( 'en', en );

export default function AppointmentModalPanel( {
                                                   toggleAppointment, isModal,
                                                   isCreated,
                                                   userResponsableList,
                                                   label,
                                                   userId,
                                                   saveEvent,
                                                   currency,
                                                   fullName,
                                                   language,
                                                   history,
                                                   isLoadingSave,
                                                   dossierId,
                                                   calendarTypeList,
                                                   selectedEventProps,
                                                   showMessageFromPopup,
                                                   vckeySelected,
                                                   approved,
                                               } ) {
    const userResponsableRef = useRef( userResponsableList );

    const [selectedEvent, setSelectedEvent] = useState( selectedEventProps );
    const [optionsUsers, setOptionsUsers] = useState( userResponsableRef.current );
    const [isLoading, setIsLoading] = useState( isLoadingSave );
    const [deleteAlert, setDeleteAlert] = useState( null );
    const [togglePopupCreatePrest, settogglePopupCreatePrest] = useState( false );
    const { getAccessTokenSilently } = useAuth0();

    useEffect( () => {
        (async () => {
            const accessToken = await getAccessTokenSilently();

            fetchLawfirmCalendar( accessToken, vckeySelected, ( contacts ) => {
//build user option list
                if ( selectedEventProps.eventType === 'TASK' || selectedEventProps.eventType === 'RECORD' ) {
                    const selectedUser = new ItemDTO( { value: null, label: label.common.label1 } );
                    // ADD all members
                    userResponsableRef.current = [...userResponsableList, (selectedUser)];
                    setSelectedEvent( {
                        ...selectedEvent,
                        user_id: selectedUser.value,
                        userItem: selectedUser
                    } );
                }

                setOptionsUsers( userResponsableRef.current );
            } );

        })();
    }, [getAccessTokenSilently] );

    useEffect( () => {
        if ( !isNil( selectedEventProps ) ) {
            setSelectedEvent( {
                ...selectedEvent,
                id: selectedEventProps.id,
                microText: selectedEventProps.microText,
                audioText: selectedEventProps.audioText,
                pathFile: selectedEventProps.pathFile,
                speechToTextActivated: selectedEventProps.speechToTextActivated,
            } );
        }

    }, [selectedEventProps] );
    useEffect( () => {
        setIsLoading( isLoadingSave );

    }, [isLoadingSave] );

    const handleSaveEvent = async ( form ) => {
        form.preventDefault();
        setIsLoading( true );

        if ( isNil( selectedEvent.start ) ) {
            showMessageFromPopup( label.agenda.error1, 'danger' );
            setIsLoading( false );

            return;
        }

        if ( selectedEvent.eventType !== 'TASK' ) {
            if ( isNil( selectedEvent.end ) ) {
                showMessageFromPopup( label.agenda.error4, 'danger' );
                setIsLoading( false );

                return;
            }
            if ( moment( selectedEvent.end ).isBefore( selectedEvent.start ) ) {
                showMessageFromPopup( label.agenda.error3, 'danger' );
                setIsLoading( false );

                return;
            }
        }

        saveEvent( selectedEvent );

        setIsLoading( false );

    };

    const handleDatePickerChange = ( date ) => {
        // if the end date is before start date => add 30 min to end date
        if ( moment( date ).isAfter( selectedEvent.end )
            || moment( date ).isSame( selectedEvent.end ) ) {
            const end = moment( date ).add( 30, 'minutes' );
            setSelectedEvent( { ...selectedEvent, start: date, end: end } );
        } else {
            setSelectedEvent( { ...selectedEvent, start: date } );

        }

    };

    const handleEndDatePickerChange = ( date ) => {
        setSelectedEvent( { ...selectedEvent, end: date } );
    };

    const handleEventTypeChange = ( event ) => {
        let selectedUser;
        if ( event.value === 'TASK' || event.value === 'RECORD' ) {
            selectedUser = new ItemDTO( { value: null, label: label.common.label1 } );
            // ADD all members
            userResponsableRef.current = [...optionsUsers, (selectedUser)];
        } else {
            selectedUser = userResponsableList.find( user => user.value === userId );
            userResponsableRef.current = userResponsableList;
        }
        setSelectedEvent( {
            ...selectedEvent,
            user_id: selectedUser.value,
            userItem: selectedUser,
            eventType: event.value,
            eventTypeItem: event,
        } );

        setOptionsUsers( userResponsableRef.current );
    };

    const handleEventLocationChange = ( event ) => {
        setSelectedEvent( { ...selectedEvent, location: event.target.value } );
    };
    const handleEventTitleChange = ( event ) => {
        setSelectedEvent( { ...selectedEvent, title: event.target.value } );
    };

    const handleParticipants = ( users ) => {
        setSelectedEvent( {
            ...selectedEvent,
            participantsEmailItem: users,
            participantsEmail: map( users, val => {
                return val.value;
            } )
        } );
    };

    const handleSelectUser = ( user ) => {
        setSelectedEvent( {
            ...selectedEvent,
            user_id: user.value,
            userItem: user,
        } );
    };

    const handleDeleteEvent = async () => {
        setIsLoading( true );
        setDeleteAlert( null );
        const accessToken = await getAccessTokenSilently();
        const result = await deleteEvent( accessToken, selectedEvent.id );

        if ( !result.error ) {
            setIsLoading( false );
            showMessageFromPopup( label.agenda.success3, 'success' );
            toggleAppointment( true );
        } else {
            setIsLoading( false );
            showMessageFromPopup( label.agenda.error10, 'danger' );
        }
    };

    const deleteMessageModal = () => {
        setDeleteAlert( (
            <ReactBSAlert
                warning
                style={{ display: 'block', marginTop: '100px' }}
                title={label.appointmentmodalpanel.label17}
                onConfirm={handleDeleteEvent}
                onCancel={() => { setDeleteAlert( null ); }}
                confirmBtnBsStyle="success"
                cancelBtnBsStyle="danger"
                confirmBtnText={label.appointmentmodalpanel.label18}
                cancelBtnText={label.common.cancel}
                showCancel
                btnSize=""
            >
                {label.appointmentmodalpanel.label19}
            </ReactBSAlert>
        ) );
    };

    const handleEventNoteChange = ( event ) => {
        setSelectedEvent( { ...selectedEvent, note: event.target.value } );
    };

    const _loadDossierOptions = async ( inputValue, callback ) => {
        const accessToken = await getAccessTokenSilently();
        let result = await getAffairesByVcUserIdAndSearchCriteria( accessToken, inputValue );

        if ( !isNil( result ) ) {
            if ( !isNil( result.data ) ) {

                callback(
                    map( result.data, dossier => {
                        return new ItemDTO( dossier );
                    } ) );

            } else if ( result.error ) {
                // no data
            }
        }
    };

    const _loadUsersOptions = async ( inputValue, callback ) => {
        const accessToken = await getAccessTokenSilently();
        let result = await getContact( accessToken, inputValue );

        callback( map( result.data, data => {
            return new ItemDTO( data );
        } ) );
    };

    const _handleDossierChange = ( newValue ) => {
        setSelectedEvent( { ...selectedEvent, dossier_id: newValue.value, dossierItem: newValue } );
    };

    const startLabel = selectedEvent.eventType !== 'TASK' ? label.appointmentmodalpanel.label6 : label.appointmentmodalpanel.label15;

    const panelAudience = () => {
        return (
            <div>
                <Row>
                    <Col lg="12">
                        <Label>{label.appointmentmodalpanel.label11}</Label>
                        <FormGroup>
                            <AsyncSelect
                                value={selectedEvent.dossierItem}
                                className="react-select info"
                                classNamePrefix="react-select"
                                cacheOptions
                                loadOptions={_loadDossierOptions}
                                defaultOptions
                                onChange={_handleDossierChange}
                                placeholder={label.appointmentmodalpanel.label16}
                            />
                        </FormGroup>
                    </Col>
                </Row>
                <Row>
                    <Col lg="12">
                        <Label>{label.appointmentmodalpanel.label9}</Label>
                        <FormGroup>
                            <Input type="input"
                                   value={selectedEvent.location} onChange={handleEventLocationChange}
                                   placeholder={label.appointmentmodalpanel.label10}
                                   aria-label="Lieu"
                                   aria-describedby="basic-addon2"/>
                        </FormGroup>
                    </Col>
                </Row>
            </div>
        );
    };

    const panelRendezVous = () => {
        return (
            <div>
                {/* title with note */}
                <Row>
                    <Col lg="12">
                        <Label>{label.appointmentmodalpanel.label3}</Label>
                        <FormGroup>
                            <Input type="text"
                                   value={selectedEvent.title} onChange={handleEventTitleChange}
                                   placeholder={`${label.appointmentmodalpanel.label3}...`}/>
                        </FormGroup>
                    </Col>
                </Row>
                <Row>
                    <Col lg="12">
                        <Label>{label.appointmentmodalpanel.label9}</Label>
                        <FormGroup>
                            <Input type="input"
                                   value={selectedEvent.location} onChange={handleEventLocationChange}
                                   placeholder={label.appointmentmodalpanel.label10}
                                   aria-label="Lieu"
                                   aria-describedby="basic-addon2"/>
                        </FormGroup>
                    </Col>
                </Row>
                {/* dossier */}
                <Row>
                    <Col lg="12">
                        <Label>{label.appointmentmodalpanel.label11}</Label>
                        <FormGroup>
                            <AsyncSelect
                                value={selectedEvent.dossierItem}
                                className="react-select info"
                                classNamePrefix="react-select"
                                cacheOptions
                                loadOptions={_loadDossierOptions}
                                defaultOptions
                                onChange={_handleDossierChange}
                                placeholder={label.appointmentmodalpanel.label16}
                            />
                        </FormGroup>
                    </Col>
                </Row>
            </div>
        );
    };

    const panelOther = () => {
        return (
            <div>
                <Row>
                    <Col lg="12">
                        <Label>{label.appointmentmodalpanel.label3}</Label>
                        <FormGroup>
                            <Input placeholder={label.appointmentmodalpanel.label4}
                                   value={selectedEvent.title}
                                   onChange={handleEventTitleChange}/>
                        </FormGroup>
                    </Col>
                </Row>
            </div>
        );
    };

    const panelOnduty = () => {
        return (
            <div>
                <Row>
                    <Col lg="12">
                        <Label>{label.appointmentmodalpanel.label11}</Label>
                        <FormGroup>
                            <AsyncSelect
                                value={selectedEvent.dossierItem}
                                className="react-select info"
                                classNamePrefix="react-select"
                                cacheOptions
                                loadOptions={_loadDossierOptions}
                                defaultOptions
                                onChange={_handleDossierChange}
                                placeholder={label.appointmentmodalpanel.label16}
                            />
                        </FormGroup>
                    </Col>
                </Row>
            </div>
        );
    };

    const panelTask = () => {
        return (
            <div>
                {/* title with note */}
                <Row>
                    <Col lg="12">
                        <Label>{label.appointmentmodalpanel.label3}</Label>
                        <FormGroup>
                            <Input type="text"
                                   value={selectedEvent.title} onChange={handleEventTitleChange}
                                   placeholder={`${label.appointmentmodalpanel.label3}...`}/>
                        </FormGroup>
                    </Col>
                </Row>
                {!isNil( selectedEvent.pathFile ) && isCreated === false ? (
                    <Row>
                        <Col lg="12">
                            <ListGroupItem>
                                <Col sm={{ size: 8, offset: 1 }} md={{ size: 8, offset: 1 }}>
                                    {selectedEvent.pathFile}
                                </Col>
                                <Col sm={1} md={1}>
                                    <Button
                                        size="sm"
                                        color="primary"
                                        className="btn-icon"
                                    >
                                        <GetApp/>
                                    </Button>
                                </Col>
                            </ListGroupItem>
                        </Col>
                    </Row>
                ) : null}
                <Row>
                    <Col lg="12">
                        <Label>{selectedEvent.dossierItem ? (
                                <Link
                                    to={`/admin/affaire/${selectedEvent.dossierItem.value}`}>{label.appointmentmodalpanel.label11} {' '}
                                    <VisibilityIcon/></Link>
                            ) :
                            label.appointmentmodalpanel.label11}</Label>
                        <FormGroup>
                            <AsyncSelect
                                value={selectedEvent.dossierItem}
                                className="react-select info"
                                classNamePrefix="react-select"
                                cacheOptions
                                loadOptions={_loadDossierOptions}
                                defaultOptions
                                onChange={_handleDossierChange}
                                placeholder={label.appointmentmodalpanel.label16}
                            />
                        </FormGroup>
                    </Col>
                </Row>
            </div>
        );
    };
    const _togglePopupCreatePrestation = ( e, message, type ) => {
        settogglePopupCreatePrest( !togglePopupCreatePrest );
        if ( message && type ) {
            showMessageFromPopup( message, type );
        }
    };
    return (
        <>
            {isCreated === false ? (
                <>
                    <Row>
                        <Col lg={{ size: 2 }}>
                            <Button color="primary" size="sm"
                                    disabled={isLoading} onClick={_togglePopupCreatePrestation}>
                                <i className="tim-icons icon-simple-add padding-icon-text"/>
                                {label.appointmentmodalpanel.label21}
                            </Button>
                        </Col>
                        {deleteAlert}
                        <Col lg={{ size: 1, offset: 8 }}>
                            <Button color="danger" size="sm" disabled={isLoading} onClick={deleteMessageModal}><i
                                className="fa fa-trash"/> </Button>
                        </Col>
                        {deleteAlert}
                    </Row>
                </>
            ) : null}

            <Form>

                {/* if it's record don't show the type */}
                {selectedEvent.eventType !== 'RECORD' ? (
                    <Row>
                        <Col lg="6">
                            <Label>{label.appointmentmodalpanel.label5}</Label>
                            <FormGroup>
                                <Select
                                    isDisabled={!isCreated}
                                    onChange={handleEventTypeChange}
                                    className="basic-single color-primary"
                                    classNamePrefix="react-select"
                                    value={selectedEvent.eventTypeItem}
                                    name="formEventType"
                                    options={calendarTypeList}
                                />
                            </FormGroup>
                        </Col>
                        <Col lg="6">
                            <Label>{label.appointmentmodalpanel.label20}</Label>
                            <FormGroup>
                                <Select value={selectedEvent.userItem}
                                        options={optionsUsers}
                                        placeholder={`${label.appointmentmodalpanel.label20}...`}
                                        onChange={handleSelectUser}
                                        backspaceRemovesValue
                                        isSearchable
                                />
                            </FormGroup>
                        </Col>
                    </Row>
                ) : null}
                {selectedEvent.start ?
                    <Row>
                        <Col
                            lg={selectedEvent.end && selectedEvent.eventType !== 'TASK' && selectedEvent.eventType !== 'RECORD' ? 6 : 12}>
                            <Label>{startLabel}</Label>
                            <FormGroup>
                                <DatePicker
                                    selected={selectedEvent.start}
                                    onChange={handleDatePickerChange}
                                    showTimeSelect
                                    locale="fr"
                                    timeFormat="HH:mm"
                                    timeIntervals={30}
                                    timeCaption="time"
                                    dateFormat="dd MMMM yyyy, HH:mm"
                                    className="form-control color-primary"
                                />
                            </FormGroup>
                        </Col>
                        {selectedEvent.end && selectedEvent.eventType !== 'TASK' && selectedEvent.eventType !== 'RECORD' ?
                            <Col lg="6">
                                <Label>{label.appointmentmodalpanel.label7}</Label>
                                <FormGroup>
                                    <DatePicker
                                        selected={new Date( selectedEvent.end )}
                                        minDate={selectedEvent.start}
                                        onChange={handleEndDatePickerChange}
                                        showTimeSelect
                                        locale="fr"
                                        timeFormat="HH:mm"
                                        timeIntervals={30}
                                        timeCaption="time"
                                        dateFormat="dd MMMM yyyy, HH:mm"
                                        className="form-control color-primary"
                                    />
                                </FormGroup>
                            </Col>
                            : ''}
                    </Row>
                    : ''}

                {selectedEvent.eventType === 'AUD' ? panelAudience() : ''}
                {selectedEvent.eventType === 'PERM' ? panelOnduty() : ''}
                {selectedEvent.eventType === 'RDV' ? panelRendezVous() : ''}
                {selectedEvent.eventType === 'OTH' ? panelOther() : ''}
                {selectedEvent.eventType === 'TASK' || selectedEvent.eventType === 'RECORD' ? panelTask() : ''}

                {/* REMARKS */}
                <Row>
                    <Col lg="12">
                        <Label>{label.appointmentmodalpanel.label1}</Label>
                        <FormGroup>
                            <Input type="textarea" rows="5" maxLength={2000}
                                   value={selectedEvent.note} onChange={handleEventNoteChange}
                                   placeholder={`${label.appointmentmodalpanel.label1}...`}/>
                            <FormText>{label.appointmentmodalpanel.label14}</FormText>

                        </FormGroup>
                    </Col>
                </Row>
                <Row>
                    <Col xs={{ size: 11, offset: 1 }}>
                        <hr/>
                    </Col>
                </Row>
                <Row>
                    <Col lg="12">
                        <Label>{label.appointmentmodalpanel.label8}</Label>
                        <FormGroup>
                            <AsyncCreatableSelect
                                value={selectedEvent.participantsEmailItem}
                                className="react-select info"
                                classNamePrefix="react-select"
                                cacheOptions
                                loadOptions={_loadUsersOptions}
                                defaultOptions
                                isMulti
                                onChange={handleParticipants}
                                placeholder={label.common.label14}
                            />
                        </FormGroup>
                    </Col>
                </Row>
            </Form>
            {isModal ? (
                    <ModalFooter>
                        <Button color="default" disabled={isLoading} onClick={toggleAppointment}><i
                            className="fa fa-times"/> {label.common.cancel}</Button>
                        <Button color="primary" type="button" disabled={isLoading}
                                id="saveEvent1"
                                onClick={handleSaveEvent}
                        >
                            {isLoading ? (
                                <Spinner
                                    size="sm"
                                    color="secondary"
                                />
                            ) : null}
                            {' '} {label.common.save}
                        </Button>
                    </ModalFooter>
                ) :
                (
                    <Row>
                        <Col md={{ size: 12 }} sm={{ size: 12 }}>
                            {/* DISABLE : is loading OR record type with no file added or Uspeech not activated */}
                            <Button
                                block={true}
                                color="primary" type="button"
                                disabled={isLoading || (selectedEvent.eventType === 'RECORD' && isNil( selectedEvent.pathFile ) && selectedEvent.speechToTextActivated === false)}
                                id="saveEvent1"
                                onClick={handleSaveEvent}
                            >
                                {isLoading ? (
                                    <Spinner
                                        size="sm"
                                        color="secondary"
                                    />
                                ) : null}
                                {' '} {label.common.save}
                            </Button>
                        </Col>
                    </Row>
                )}
            {togglePopupCreatePrest ?
                (
                    <RegisterFraisModal
                        isFrais={null}
                        history={history}
                        isCreated={true}
                        label={label}
                        currency={currency}
                        affaireId={null}
                        vckeySelected={vckeySelected}
                        fullName={fullName}
                        language={language}
                        clientUpdated={_togglePopupCreatePrestation}
                        showMessagePopupFrais={showMessageFromPopup}
                        toggleFraisModal={_togglePopupCreatePrestation}
                        toggleClientFrais={_togglePopupCreatePrestation}
                        modal={togglePopupCreatePrest}
                    />
                ) : null}
        </>
    );

}