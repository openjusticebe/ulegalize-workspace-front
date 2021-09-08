import React, { useEffect, useRef, useState } from 'react';

import { Button, Col, Form, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, Row } from 'reactstrap';

import moment from 'moment';
import 'moment/locale/fr';
import { registerLocale } from 'react-datepicker';
import fr from 'date-fns/locale/fr';
import Select from 'react-select';
import ContactSummary from '../../model/client/ContactSummary';
import { useAuth0 } from '@auth0/auth0-react';
import { createClient, getClientById, updateClient } from '../../services/ClientService';
import titleClient from '../../model/affaire/TitleClient';
import { getCountryList, getLanguageList } from '../../services/SearchService';
import ItemDTO from '../../model/ItemDTO';
import typeClient from '../../model/affaire/TypeClient';
import { getOptionNotification } from '../../utils/AlertUtils';
import NotificationAlert from 'react-notification-alert';
import ReactDatetime from 'react-datetime';
import ReactLoading from 'react-loading';
import { validateEmail } from '../../utils/Utils';

const map = require( 'lodash/map' );
const isNil = require( 'lodash/isNil' );
const lowerCase = require( 'lodash/lowerCase' );
moment.locale( 'fr' );
registerLocale( 'fr', fr );

export const RegisterClientModal = ( props ) => {
    const {
        modal,
        toggleClient,
        clientUpdated,
        clientCreated,
        userId,
        label,
        idClient,
        isCreate,
        vckeySelected,
    } = props;

    const { getAccessTokenSilently } = useAuth0();
    const [languageSelect, setLanguageSelect] = useState( [] );
    const [countrySelect, setCountrySelect] = useState( [] );
    const [isLoading, setIsLoading] = useState( true );
    const notificationAlert = useRef( null );

    const [client, setClient] = useState( new ContactSummary( null, label ) );

    useEffect( () => {
        (async () => {
            const accessToken = await getAccessTokenSilently();

            let clientData = client;
            if ( !isNil( idClient ) ) {
                let clientResult = await getClientById( accessToken, idClient );
                if ( !clientResult.error ) {
                    clientData = new ContactSummary( clientResult.data, label );
                }
            }

            let resultLang = await getLanguageList( accessToken );
            let lang = map( resultLang.data, data => {

                if ( lowerCase( clientData.language ) === data.value ) {
                    clientData.languageItem = new ItemDTO( data );
                }
                if ( isNil( clientData.language ) && data.value === 'fr' ) {
                    clientData.language = data.value;
                    clientData.languageItem = new ItemDTO( data );
                }
                return new ItemDTO( data );
            } );
            setLanguageSelect( lang );

            let resultCountry = await getCountryList( accessToken );
            let countr = map( resultCountry.data, data => {

                //hardcoded must be fill in related to the country cab
                if ( clientData.country === data.value ) {
                    clientData.countryItem = new ItemDTO( data );
                }
                return new ItemDTO( data );
            } );
            setCountrySelect( countr );

            clientData.userId = userId;
            clientData.vcKey = vckeySelected;

            setIsLoading( false );
            setClient( clientData );
        })();
    }, [idClient, getAccessTokenSilently] );

    const _saveClient = async () => {
        const accessToken = await getAccessTokenSilently();

        if ( isNil( client.firstname ) ) {
            notificationAlert.current.notificationAlert( getOptionNotification( label.ajout_client.error4, 'danger' ) );
            return;
        }
        if ( isNil( client.lastname ) ) {
            notificationAlert.current.notificationAlert( getOptionNotification( label.ajout_client.error5, 'danger' ) );
            return;
        }
        if ( isNil( client.title ) ) {
            notificationAlert.current.notificationAlert( getOptionNotification( label.ajout_client.error6, 'danger' ) );
            return;
        }
        if ( client.email && !validateEmail( client.email ) ) {
            notificationAlert.current.notificationAlert( getOptionNotification( label.affaire.error18, 'danger' ) );

            return;
        }
        let result = await createClient( accessToken, client );

        if ( !result.error ) {
            clientCreated( result.data );

        }
    };

    const _updateClient = async () => {
        const accessToken = await getAccessTokenSilently();
        if ( client.email && !validateEmail( client.email ) ) {
            notificationAlert.current.notificationAlert( getOptionNotification( label.affaire.error18, 'danger' ) );

            return;
        }

        await updateClient( accessToken, client );

        clientUpdated(client.id);
    };

    return (
        <Modal size="lg" isOpen={modal} toggle={toggleClient}>
            <div className="rna-container">
                <NotificationAlert ref={notificationAlert}/>
            </div>
            <ModalBody>
                {isLoading === true ? (
                    <ReactLoading className="loading" height={'20%'} width={'20%'}/>
                ) : (
                    <Form>
                        <Row>
                            <Col md="4">
                                <Label>{label.ajout_client.ctype1}</Label>
                                <FormGroup>
                                    <Select
                                        className="react-select info"
                                        classNamePrefix="react-select"
                                        name="singleSelect"
                                        value={client.typeItem}
                                        onChange={value => setClient( {
                                            ...client,
                                            type: value.value,
                                            typeItem: new ItemDTO( value )
                                        } )
                                        }
                                        options={typeClient( label )}
                                    />
                                </FormGroup>
                            </Col>
                            {client.type === 2 ? (
                                <Col md="4">
                                    <Label>{label.ajout_client.companyInput.placeholder}</Label>
                                    <FormGroup>
                                        <Input
                                            value={client.company}
                                            type="text"
                                            onChange={e => setClient( { ...client, company: e.target.value } )}
                                            placeholder={label.ajout_client.companyInput.placeholder}
                                        />
                                    </FormGroup>
                                </Col>
                            ) : null}
                        </Row>
                        <Row>
                            <Col md="8">
                                <Label>{label.ajout_client.lbl_email}</Label>
                                <FormGroup>
                                    <Input
                                        value={client.email}
                                        type="email"
                                        onChange={e =>
                                            setClient( { ...client, email: e.target.value } )
                                        }
                                        placeholder={label.ajout_client.lbl_email}
                                    />
                                </FormGroup>
                            </Col>
                            <Col md="4">
                                <Label>{label.ajout_client.lbl_birthdate}</Label>
                                <FormGroup>
                                    <FormGroup>
                                        <ReactDatetime
                                            value={client.birthdate ? moment( client.birthdate ).toDate() : null}
                                            dateFormat="YYYY-MM-DD"
                                            inputProps={{
                                                className: 'form-control',
                                                placeholder: label.ajout_client.lbl_birthdate
                                            }}
                                            onChange={date => {
                                                // new value e.target.value
                                                setClient( {
                                                    ...client,
                                                    birthdate: date
                                                } );
                                            }
                                            }
                                            timeFormat={false}
                                            initialViewDate={moment().year( 1980 )}
                                            initialViewMode={'years'}
                                        />
                                    </FormGroup>
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col md="4">
                                <Label>{label.ajout_client.f_titre}</Label>
                                <FormGroup>
                                    <Select
                                        className="react-select info"
                                        classNamePrefix="react-select"
                                        name="singleSelect"
                                        value={client.titleItem}
                                        onChange={value => setClient( {
                                            ...client,
                                            title: value.value,
                                            titleItem: new ItemDTO( value )
                                        } )
                                        }
                                        options={titleClient}
                                    />
                                </FormGroup>
                            </Col>
                            <Col md="4">
                                <Label>{label.ajout_client.lbl_prenom}</Label>
                                <FormGroup>
                                    <Input
                                        value={client.firstname}
                                        type="text"
                                        onChange={e => setClient( { ...client, firstname: e.target.value } )}
                                        placeholder={label.ajout_client.lbl_prenom}
                                    />
                                </FormGroup>
                            </Col>
                            <Col md="4">
                                <Label>{label.ajout_client.lbl_nom}</Label>
                                <FormGroup>
                                    <Input
                                        value={client.lastname}
                                        type="text"
                                        onChange={e => setClient( { ...client, lastname: e.target.value } )}
                                        placeholder={label.ajout_client.lbl_nom}
                                    />
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col md="4">
                                <Label>{label.ajout_client.lbl_lang}</Label>
                                <FormGroup>
                                    <Select
                                        value={client.languageItem}
                                        className="react-select info"
                                        classNamePrefix="react-select"
                                        name="singleSelect"
                                        onChange={value => setClient( {
                                            ...client,
                                            languageItem: value,
                                            language: value.value
                                        } )}
                                        options={languageSelect}
                                    />
                                </FormGroup>
                            </Col>
                            <Col md="8">
                                <Label>{label.ajout_client.lbl_address}</Label>
                                <FormGroup>
                                    <Input
                                        value={client.address}
                                        type="text"
                                        onChange={e => setClient( { ...client, address: e.target.value } )}
                                        placeholder={label.ajout_client.lbl_address}
                                    />
                                </FormGroup>
                            </Col>

                        </Row>
                        <Row>
                            <Col md="4">
                                <Label>{label.ajout_client.lbl_country}</Label>
                                <FormGroup>
                                    <Select
                                        value={client.countryItem}
                                        className="react-select info"
                                        classNamePrefix="react-select"
                                        name="singleSelect"
                                        onChange={value => setClient( {
                                            ...client,
                                            countryItem: value,
                                            country: value.value
                                        } )}
                                        options={countrySelect}
                                    />
                                </FormGroup>
                            </Col>
                            <Col md="4">
                                <Label>{label.ajout_client.lbl_cp}</Label>
                                <FormGroup>
                                    <Input
                                        value={client.cp}
                                        type="text"
                                        onChange={e => setClient( { ...client, cp: e.target.value } )}
                                        placeholder={label.ajout_client.lbl_cp}
                                    />
                                </FormGroup>
                            </Col>
                            <Col md="4">
                                <Label>{label.ajout_client.lbl_city}</Label>
                                <FormGroup>
                                    <Input
                                        value={client.city}
                                        type="text"
                                        onChange={e => setClient( { ...client, city: e.target.value } )}
                                        placeholder={label.ajout_client.lbl_city}
                                    />
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col md="4">
                                <Label>{label.ajout_client.lbl_tel}</Label>
                                <FormGroup>
                                    <Input
                                        value={client.tel}
                                        type="text"
                                        onChange={e => setClient( { ...client, tel: e.target.value } )}
                                        placeholder={label.ajout_client.lbl_tel}
                                    />
                                </FormGroup>
                            </Col>
                            <Col md="4">
                                <Label>{label.ajout_client.lbl_mobile}</Label>
                                <FormGroup>
                                    <Input
                                        value={client.mobile}
                                        type="text"
                                        onChange={e => setClient( { ...client, mobile: e.target.value } )}
                                        placeholder={label.ajout_client.lbl_mobile}
                                    />
                                </FormGroup>
                            </Col>
                            <Col md="4">
                                <Label>{label.ajout_client.lbl_fax}</Label>
                                <FormGroup>
                                    <Input
                                        value={client.fax}
                                        type="text"
                                        onChange={e => setClient( { ...client, fax: e.target.value } )}
                                        placeholder={label.ajout_client.lbl_fax}
                                    />
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col md="4">
                                <Label>{label.ajout_client.lbl_nNat}</Label>
                                <FormGroup>
                                    <Input
                                        value={client.nrnat}
                                        type="text"
                                        onChange={e => setClient( { ...client, nrnat: e.target.value } )}
                                        placeholder={label.ajout_client.lbl_nNat}
                                    />
                                </FormGroup>
                            </Col>
                            <Col md="4">
                                <Label>{label.ajout_client.lbl_etr}</Label>
                                <FormGroup>
                                    <Input
                                        value={client.etr}
                                        type="text"
                                        onChange={e => setClient( { ...client, etr: e.target.value } )}
                                        placeholder={label.ajout_client.lbl_etr}
                                    />
                                </FormGroup>
                            </Col>
                            <Col md="4">
                                <Label>{label.ajout_client.lbl_tva}</Label>
                                <FormGroup>
                                    <Input
                                        value={client.tva}
                                        type="text"
                                        onChange={e => setClient( { ...client, tva: e.target.value } )}
                                        placeholder={label.ajout_client.lbl_tva}
                                    />
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col md="4">
                                <Label>{label.ajout_client.lbl_ibanBankAccount}</Label>
                                <FormGroup>
                                    <Input
                                        value={client.iban}
                                        type="text"
                                        maxLength={34}
                                        onChange={e => setClient( { ...client, iban: e.target.value } )}
                                        placeholder={label.ajout_client.lbl_ibanBankAccount}
                                    />
                                </FormGroup>
                            </Col>
                            <Col md="4">
                                <Label>{label.ajout_client.lbl_bicBankAccount}</Label>
                                <FormGroup>
                                    <Input
                                        value={client.bic}
                                        maxLength={6}
                                        type="text"
                                        onChange={e => setClient( { ...client, bic: e.target.value } )}
                                        placeholder={label.ajout_client.lbl_bicBankAccount}
                                    />
                                </FormGroup>
                            </Col>
                        </Row>
                    </Form>
                )}
            </ModalBody>

            {isLoading === false ? (
                <ModalFooter>
                    <Button variant="secondary" onClick={toggleClient}><i
                        className="fa fa-time"/> {label.common.cancel}</Button>
                    {isCreate ? (
                        <Button variant="primary" onClick={_saveClient}><i
                            className="fa fa-check"/> {label.ajout_client.input_submit}</Button>
                    ) : (
                        <Button variant="primary" onClick={_updateClient}><i
                            className="fa fa-check"/> {label.ajout_client.input_submit}</Button>
                    )}
                </ModalFooter>
            ) : null}
        </Modal>
    );
};