import React, { useEffect, useRef, useState } from 'react';

import {
    Button,
    Col,
    Form,
    FormGroup,
    FormText,
    Input,
    Label,
    Modal,
    ModalBody,
    ModalFooter,
    Row,
    Spinner,
    UncontrolledTooltip
} from 'reactstrap';

import moment from 'moment';
import 'moment/locale/fr';

import DatePicker, { registerLocale } from 'react-datepicker';
import fr from 'date-fns/locale/fr';
import en from 'date-fns/locale/en-GB';
import Select, { components } from 'react-select';
import {
    approvedEvent,
    createEvent,
    deleteEvent,
    fetchLawfirmCalendar,
    updateEvent
} from '../../services/AgendaService';
import ItemDTO from '../../model/ItemDTO';
import { useAuth0 } from '@auth0/auth0-react';
import AsyncSelect from 'react-select/async/dist/react-select.esm';
import { getClient } from '../../services/ClientService';
import { getAffairesByVcUserIdAndSearchCriteria } from '../../services/DossierService';
import ReactBSAlert from 'react-bootstrap-sweetalert';
import AsyncCreatableSelect from 'react-select/async-creatable/dist/react-select.esm';
import { getFullUserList } from '../../services/SearchService';

const map = require( 'lodash/map' );
const isNil = require( 'lodash/isNil' );
const isEmpty = require( 'lodash/isEmpty' );
moment.locale( 'fr' );
registerLocale( 'fr', fr );
registerLocale( 'en', en );

export default function AppointmentModalPanel( props ) {
    const {
        toggleAppointment, modal,
        userResponsableList,
        label,
        userId,
        calendarTypeList,
        vckeySelected,
        approved
    } = props;

    const userResponsableRef = useRef( userResponsableList );

    const [selectedEvent, setSelectedEvent] = useState( props.selectedEvent );
    const [optionsUsers, setOptionsUsers] = useState( userResponsableRef.current );
    const [isLoading, setIsLoading] = useState( false );
    const [deleteAlert, setDeleteAlert] = useState( null );
    const { getAccessTokenSilently } = useAuth0();

    useEffect( () => {
        (async () => {
            const accessToken = await getAccessTokenSilently();

            fetchLawfirmCalendar( accessToken, vckeySelected, ( contacts ) => {
//build user option list
                if ( props.selectedEvent.eventType === 'TASK' ) {
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

    const handleSaveEvent = async ( form ) => {
        form.preventDefault();
        setIsLoading( true );

        if ( isNil( selectedEvent.start ) ) {
            props.showMessageFromPopup( label.agenda.error1, 'danger' );
            setIsLoading( false );

            return;
        }

        if ( selectedEvent.eventType !== 'TASK' ) {
            if ( isNil( selectedEvent.end ) ) {
                props.showMessageFromPopup( label.agenda.error4, 'danger' );
                setIsLoading( false );

                return;
            }
            if ( moment( selectedEvent.end ).isBefore( selectedEvent.start ) ) {
                props.showMessageFromPopup( label.agenda.error3, 'danger' );
                setIsLoading( false );

                return;
            }
        }

        // if UPDATE
        if ( !isNil( selectedEvent.id ) ) {
            const accessToken = await getAccessTokenSilently();

            // save without approval
            const result = await updateEvent( accessToken, selectedEvent.id, selectedEvent );

            if ( approved === true ) {
                const resultApproved = await approvedEvent( accessToken, selectedEvent.id );

                if ( !resultApproved.error ) {
                    setIsLoading( false );
                    props.showMessageFromPopup( label.agenda.success2, 'success', true );
                    props.toggleAppointment( true );
                } else {
                    props.showMessageFromPopup( label.agenda.error11, 'danger' );
                    setIsLoading( false );
                    return;
                }
            } else {
                if ( !result.error ) {
                    setIsLoading( false );
                    props.showMessageFromPopup( label.agenda.success2, 'success', true );
                    props.toggleAppointment( true );
                } else {
                    setIsLoading( false );
                    props.showMessageFromPopup( label.agenda.error8, 'danger' );
                }
            }

        } else {
            const accessToken = await getAccessTokenSilently();

            const result = await createEvent( accessToken, selectedEvent );

            if ( !result.error ) {
                setIsLoading( false );
                props.showMessageFromPopup( label.agenda.success1, 'success', true );
                props.toggleAppointment( true );
            } else {
                setIsLoading( false );
                props.showMessageFromPopup( label.agenda.error9, 'danger' );
            }
        }
    };

    const handleDatePickerChange = ( date ) => {
        setSelectedEvent( { ...selectedEvent, start: date } );
    };
    const handleEventTypeChange = ( event ) => {
        let selectedUser;
        if ( event.value === 'TASK' ) {
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
    const _loadClientOptions = async ( inputValue, callback ) => {
        const accessToken = await getAccessTokenSilently();
        let result = await getClient( accessToken, inputValue, vckeySelected );

        callback( map( result.data, data => {
            return new ItemDTO( { value: data.id, label: data.fullName, isDefault: data.email } );
        } ) );
    };

    const { Option, SingleValue } = components;

    const CustomSelectOption = props => (
        <Option {...props}>
            {props.data.label} {' '}
            {isNil( props.data.isDefault ) || isEmpty( props.data.isDefault ) ? (
                <>
                    <i data-placement="right"
                       id={'Tooltip-' + props.data.value}
                       className={`fa fa-exclamation-triangle yellow`}/>
                    <UncontrolledTooltip
                        delay={0}
                        placement="bottom"
                        target={'Tooltip-' + props.data.value}
                    >
                        No email
                    </UncontrolledTooltip>
                </>
            ) : null}
        </Option>
    );
    const CustomSelectValue = props => (
        <SingleValue {...props}>
            {props.data.label} {' '}
            {isNil( props.data.isDefault ) || isEmpty( props.data.isDefault ) ? (
                <>
                    <i data-placement="right"
                       id="tooltip811118934"
                       className={`fa fa-exclamation-triangle yellow`}/>
                    <UncontrolledTooltip
                        delay={0}
                        placement="bottom"
                        target="tooltip811118934"
                    >
                        No email
                    </UncontrolledTooltip>
                </>) : null}
        </SingleValue>
    );
    const handleEventLocationChange = ( event ) => {
        setSelectedEvent( { ...selectedEvent, location: event.target.value } );
    };
    const handleEventTitleChange = ( event ) => {
        setSelectedEvent( { ...selectedEvent, title: event.target.value } );
    };

    const handleSelectContact = ( event ) => {
        setSelectedEvent( { ...selectedEvent, contact_id: event.value, contactItem: event } );
    };

    const handleParticipants = ( users ) => {
        setSelectedEvent( {
            ...selectedEvent,
            participantsEmailItem: users,
            participantsEmail: map(users , val=>{
            return val.label;
        })
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
            props.showMessageFromPopup( label.agenda.success3, 'success' );
            props.toggleAppointment( true );
        } else {
            setIsLoading( false );
            props.showMessageFromPopup( label.agenda.error10, 'danger' );
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


    const handleEndDatePickerChange = ( date ) => {
        setSelectedEvent( { ...selectedEvent, end: date } );
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
        let result = await getFullUserList( accessToken, inputValue );

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
                {/* REMARKS */}
                <Row>
                    <Col lg="12">
                        <Label>{label.appointmentmodalpanel.label1}</Label>
                        <FormGroup>
                            <Input type="textarea" rows="5"
                                   value={selectedEvent.note} onChange={handleEventNoteChange}
                                   placeholder={`${label.appointmentmodalpanel.label1}...`}/>
                            <FormText>{label.appointmentmodalpanel.label14}</FormText>

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
                <Row>
                    <Col lg="12">
                        <Label>{label.appointmentmodalpanel.label2}</Label>
                        <FormGroup>
                            <AsyncSelect
                                value={selectedEvent.contactItem}
                                className="react-select info"
                                classNamePrefix="react-select"
                                cacheOptions
                                loadOptions={_loadClientOptions}
                                defaultOptions
                                onChange={handleSelectContact}
                                components={{
                                    Option: CustomSelectOption,
                                    SingleValue: CustomSelectValue
                                }}
                                placeholder={`${label.appointmentmodalpanel.label2}...`}/>

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
                <Row>
                    <Col lg="12">
                        <Label>{label.appointmentmodalpanel.label1}</Label>
                        <FormGroup>
                            <Input type="textarea" rows="5"
                                   value={selectedEvent.note} onChange={handleEventNoteChange}
                                   placeholder={`${label.appointmentmodalpanel.label1}...`}/>
                            <FormText>{label.appointmentmodalpanel.label14}</FormText>

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
                <Row>
                    <Col lg="12">
                        <Label>{label.appointmentmodalpanel.label1}</Label>
                        <FormGroup>
                            <Input type="textarea" rows="5"
                                   value={selectedEvent.note} onChange={handleEventNoteChange}
                                   placeholder={`${label.appointmentmodalpanel.label1}...`}/>
                            <FormText>{label.appointmentmodalpanel.label14}</FormText>

                        </FormGroup>
                    </Col>
                </Row>
            </div>
        );
    };

    return (
        <Modal size="md" isOpen={modal} toggle={toggleAppointment}>

            <ModalBody>
                {!props.isCreated ? (
                    <Row>
                        <Col lg={{ size: 1, offset: 10 }}>
                            <Button color="danger" size="sm" disabled={isLoading} onClick={deleteMessageModal}><i
                                className="fa fa-trash"/> </Button>
                        </Col>
                        {deleteAlert}
                    </Row>
                ) : null}

                <Form>
                    <Row>
                        <Col lg="12">
                            <Label>{label.appointmentmodalpanel.label5}</Label>
                            <FormGroup>
                                <Select
                                    isDisabled={approved === true}
                                    onChange={handleEventTypeChange}
                                    className="basic-single color-primary"
                                    classNamePrefix="react-select"
                                    value={selectedEvent.eventTypeItem}
                                    name="formEventType"
                                    options={calendarTypeList}
                                />
                            </FormGroup>
                        </Col>
                    </Row>
                    {selectedEvent.start ?
                        <Row>
                            <Col lg="12">
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
                        </Row>
                        : ''}
                    {selectedEvent.end && selectedEvent.eventType !== 'TASK' ?
                        <Row>
                            <Col lg="12">
                                <Label>{label.appointmentmodalpanel.label7}</Label>
                                <FormGroup>
                                    <DatePicker
                                        selected={new Date( selectedEvent.end )}
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
                        </Row>
                        : ''}
                    {selectedEvent.eventType === 'AUD' ? panelAudience() : ''}
                    {selectedEvent.eventType === 'PERM' ? panelOnduty() : ''}
                    {selectedEvent.eventType === 'RDV' ? panelRendezVous() : ''}
                    {selectedEvent.eventType === 'OTH' ? panelOther() : ''}
                    {selectedEvent.eventType === 'TASK' ? panelOnduty() : ''}
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
                    <Row>
                        <Col lg="12">
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
                </Form>
            </ModalBody>

            <ModalFooter>
                <Button color="default" disabled={isLoading} onClick={toggleAppointment}><i
                    className="fa fa-times"/> {label.common.cancel}</Button>
                <Button color="primary" type="button" disabled={isLoading}
                        id="invoiceLabelId1"
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
        </Modal>
    );

}