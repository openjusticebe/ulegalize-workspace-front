import React, { useEffect, useState } from 'react';
import {
    Button,
    Col,
    FormGroup, FormText,
    Input,
    Label,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Row,
    Spinner
} from 'reactstrap';
import { getAffairesByVcUserIdAndSearchCriteria, getDossierById } from '../../../../services/DossierService';

import CircularProgress from '@material-ui/core/CircularProgress';
import { useAuth0 } from '@auth0/auth0-react';
import DossierDTO from '../../../../model/affaire/DossierDTO';
import ClientUsignDTO from '../../../../model/usign/ClientUsignDTO';
import { fetchEmailPaymentPrice, } from '../../../../services/transparency/PriceServices';
import PdfUpload from '../../../../components/CustomUpload/PdfUpload';
import { validateEmail } from '../../../../utils/Utils';
import EmailDTO from '../../../../model/affaire/email/EmailDTO';
import { getUserResponsableList } from '../../../../services/SearchService';
import ItemDTO from '../../../../model/ItemDTO';
import Select from 'react-select';
import { sendEmailRegistered } from '../../../../services/EmailRegisteredService';
import { getClientById } from '../../../../services/ClientService';
import AsyncSelect from 'react-select/async/dist/react-select.esm';

const isNil = require( 'lodash/isNil' );
const isEmpty = require( 'lodash/isEmpty' );
const map = require( 'lodash/map' );

export default function ModalEMailSign( {
                                            showMessagePopup,
                                            dossierId,
                                            toggleModalDetails,
                                            modalDisplay,
                                            vckeySelected,
                                            label,
                                            userId,
                                            email,
                                            updateList,
                                            attachedFile,
                                            clientId
                                        } ) {

    const [isLoading, setIsLoading] = useState( true );
    const [btnIsLoading, setbtnIsLoading] = useState( false );
    const [client, setClient] = useState( new ClientUsignDTO( null ) );
    const [mailFrom, setMailFrom] = useState( new ItemDTO( { value: userId, label: email } ) );
    const [files, setFiles] = useState( [] );
    const [userResponsableList, setUserResponsableList] = useState( [] );

    const [dossierItem, setDossierItem] = useState( null );
    const [subject, setSubject] = useState( '' );
    const [emailContent, setEmailContent] = useState( '' );
    const [priceUsign, setPriceUsign] = useState( 0 );
    const { getAccessTokenSilently } = useAuth0();

    // transparency
    useEffect( () => {
        (async () => {
            const accessToken = await getAccessTokenSilently();
            const dossierId = !isNil( dossierId ) ? dossierId : null;
            // if dossier does not exist get the user email
            if ( !isNil( dossierId ) ) {
                const resultDossier = await getDossierById( accessToken, dossierId, vckeySelected );
                if ( !resultDossier.error ) {
                    const dossier = new DossierDTO( resultDossier.data );
                    let clientTemp = new ClientUsignDTO( null );
                    clientTemp.email = dossier.client ? dossier.client.isDefault : null;

                    if ( !isNil( clientTemp.email ) ) {
                        setClient( clientTemp );
                    }
                }

            } else if ( !isNil( clientId ) ) {
                let clientResult = await getClientById( accessToken, clientId );
                let clientTemp = new ClientUsignDTO( null );

                if ( clientResult.data ) {
                    clientTemp.email = clientResult.data.email;
                }

                setClient( clientTemp );
            }
            setIsLoading( false );

            fetchEmailPaymentPrice( accessToken, ( price ) => {
                setPriceUsign( price.toFixed( 2 ) );
            } );
            let resultUser = await getUserResponsableList( accessToken, vckeySelected );
            let profiles = map( resultUser.data, data => {
                return new ItemDTO( data );
            } );
            setUserResponsableList( profiles );
        })();
    }, [getAccessTokenSilently] );
    // transparency
    useEffect( () => {
        (async () => {
            if ( !isNil( attachedFile ) ) {
                setFiles( [attachedFile] );
            }
        })();
    }, [attachedFile] );

    const _sendEmailRecommande = async () => {
        const accessToken = await getAccessTokenSilently();
        setbtnIsLoading( true );

        if ( isNil( client.email ) || isEmpty( client.email ) ) {
            showMessagePopup( label.etat.error5, 'danger' );
            setbtnIsLoading( false );
            return;
        }
        if ( !validateEmail( client.email ) ) {
            showMessagePopup( label.affaire.error18, 'danger' );
            setbtnIsLoading( false );
            return;
        }

        // used for list , out of the dossier
        var formData = new FormData();
        Object.entries( files ).forEach( ( [key, value] ) => {
            formData.append( 'files', value );
        } );
        const emailDto = new EmailDTO();
        emailDto.dossierId = isNil(dossierId) && !isNil(dossierItem)? dossierItem.value : dossierId;
        emailDto.message_body = emailContent;
        emailDto.sender_email = mailFrom.label;
        emailDto.recipient_email = client.email;
        emailDto.subject = subject;
        emailDto.sender_real_name = client.email;
        emailDto.recipient_language = 'fr';

        formData.append( 'emailDto', JSON.stringify( emailDto ) );

        const result = await sendEmailRegistered( accessToken, formData );

        if ( result.error ) {
            showMessagePopup( label.mail.error4, 'danger' );
        } else {
            showMessagePopup( label.mail.success4, 'primary' );

        }
        updateList();
        setbtnIsLoading( false );

        toggle();
    };

    const toggle = () => {
        toggleModalDetails();
    };

    const _uploadDocument = ( file ) => {
        setFiles( [...files, file] );
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

    const _handleDossierChange = ( newValue ) => {
        setDossierItem( newValue );

    };
    return (
        <Modal size="lg" isOpen={modalDisplay} toggle={toggle}>
            <ModalHeader toggle={toggle}
                         className="justify-content-center"
                         tag={`h4`}>
                {label.mail.label32} {' '}
                <strong className="text-muted">{priceUsign}€</strong>

            </ModalHeader>
            <ModalBody>
                {isLoading ? (
                    <CircularProgress size={50}/>
                ) : (
                    <>
                        {/*<!-- message from client -->*/}
                        <Row>
                            <Label md="3">
                                {label.mail.mailFrom}
                            </Label>
                            <Col md="9">
                                <FormGroup>
                                    <Select
                                        value={mailFrom}
                                        className="react-select info"
                                        classNamePrefix="react-select"
                                        placeholder={label.common.label14}
                                        name="singleSelect"
                                        onChange={value => setMailFrom( value )}
                                        options={userResponsableList}
                                    />
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            {/*<!-- email client -->*/}
                            <Label md="3">
                                {label.etat.emailUploadTo}
                            </Label>
                            <Col lg={9} md={9} sm={9}>
                                <FormGroup>
                                    <Input
                                        type="email"
                                        name="emailTo"
                                        component="textarea"
                                        className="form-control"
                                        placeholder={label.etat.emailUploadTo}
                                        value={client.email}
                                        onChange={( e ) => setClient( { ...client, email: e.target.value } )}
                                    />
                                </FormGroup>
                            </Col>
                        </Row>
                        {isNil( dossierId ) ? (
                            <Row>
                                {/*<!-- dossier -->*/}
                                <Label md="3">
                                    {label.mail.dossier}
                                </Label>
                                    <Col lg={9} md={9} sm={9}>
                                <FormGroup>
                                        <AsyncSelect
                                            value={dossierItem}
                                            isClearable={true}
                                            className="react-select info"
                                            classNamePrefix="react-select"
                                            cacheOptions
                                            loadOptions={_loadDossierOptions}
                                            defaultOptions
                                            onChange={_handleDossierChange}
                                            placeholder={label.mail.dossierPlaceholder}
                                        />
                                    <FormText color="muted">
                                        {label.common.optional}
                                    </FormText>
                                </FormGroup>
                                    </Col>
                            </Row>
                        ) : null}

                        {!isNil( client.email ) && !isEmpty( client.email ) ? (
                                <>
                                    <Row>
                                        {/*<!-- subject -->*/}
                                        <Label md="3">
                                            {label.mail.subject}
                                        </Label>
                                        <Col lg={9} md={9} sm={9}>
                                            <FormGroup>
                                                <Input
                                                    name="subject"
                                                    component="textarea"
                                                    className="form-control"
                                                    placeholder={label.mail.subject}
                                                    value={subject}
                                                    onChange={( e ) => setSubject( e.target.value )}

                                                />
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    {/*<!-- message to client -->*/}
                                    <Row>
                                        <Label md="3">
                                            {label.mail.emailContent}
                                        </Label>
                                        <Col lg={9} md={9} sm={9}>
                                            <FormGroup>
                                                <Input
                                                    rows={3}
                                                    type="textarea"
                                                    name="content"
                                                    componentClass="textarea"
                                                    className="form-control"
                                                    placeholder={label.mail.emailContent}
                                                    value={emailContent}
                                                    onChange={( e ) => setEmailContent( e.target.value )}
                                                />
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    {/*<!-- attachment -->*/}
                                    <Row>
                                        <Label md="3">
                                            {label.mail.attachment}
                                        </Label>
                                        <Col lg={9} md={9} sm={9}>
                                            <FormGroup>
                                                <PdfUpload
                                                    saveFile={_uploadDocument}
                                                    avatar={null}/>
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    {/*<!-- files -->*/}
                                    {!isEmpty( files ) ? (
                                        <Row>
                                            <Label md="3">
                                                {label.mail.attachment}
                                            </Label>
                                            <Col lg={9} md={9} sm={9}>
                                                <FormGroup>
                                                    {map( files, file => {
                                                        return (
                                                            <p>{file.name}</p>
                                                        );
                                                    } )}
                                                </FormGroup>
                                            </Col>
                                        </Row>
                                    ) : null}
                                </>
                            )
                            : null}
                    </>
                )
                }
            </ModalBody>
            <ModalFooter>
                <Button color="default" onClick={toggle}>{label.common.close}</Button>
                {!isNil( client.email ) && !isEmpty( client.email ) ? (
                    <Button color="primary" type="button"
                            disabled={btnIsLoading}
                            onClick={!btnIsLoading ? _sendEmailRecommande : null}
                    >
                        {isLoading ? (
                            <Spinner
                                size="sm"
                                color="secondary"
                            />
                        ) : null}
                        {' '} {label.common.send} ({priceUsign}€)
                    </Button>
                ) : null}
            </ModalFooter>
        </Modal>
    );
}

