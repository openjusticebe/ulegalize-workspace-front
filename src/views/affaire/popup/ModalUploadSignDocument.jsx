import React, { useEffect, useRef, useState } from 'react';
import {
    Button,
    ButtonGroup,
    Col,
    Collapse,
    FormGroup,
    FormText,
    Input,
    Label,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Row,
    Table
} from 'reactstrap';
import { getDossierById } from '../../../services/DossierService';

import CircularProgress from '@material-ui/core/CircularProgress';
import { getDate } from '../../../utils/DateUtils';
import DatePicker from 'react-datepicker';
import { useAuth0 } from '@auth0/auth0-react';
import DossierDTO from '../../../model/affaire/DossierDTO';
import MailGenerator from '../../../components/Mail/MailGenerator';
import ClientUsignDTO from '../../../model/usign/ClientUsignDTO';
import PdfUpload from '../../../components/CustomUpload/PdfUpload';
import { fetchUsignPaymentPrice } from '../../../services/transparency/PriceServices';
import { validateEmail } from '../../../utils/Utils';
import TableUsignSequence from './TableUsignSequence';

const findIndex = require( 'lodash/findIndex' );
const isNil = require( 'lodash/isNil' );
const isEmpty = require( 'lodash/isEmpty' );
const forEach = require( 'lodash/forEach' );
const size = require( 'lodash/size' );
const orderBy = require( 'lodash/orderBy' );

export default function ModalUploadSignDocument( {
                                                     cas,
                                                     affaireId,
                                                     vckeySelected,
                                                     attachEsignDocument,
                                                     toggleModalDetails,
                                                     modalDisplay,
                                                     showMessagePopup,
                                                     payment,
                                                     label,
                                                 } ) {

    const [isLoading, setIsLoading] = useState( true );
    const [btnIsLoading, setbtnIsLoading] = useState( false );
    const [client, setClient] = useState( new ClientUsignDTO( null ) );
    const [toRecipientEmail, setToRecipientEmail] = useState( [] );
    const nbtoRecipientEmail = useRef( 0 );

    const [documentName, setDocumentName] = useState( '' );
    const [emailContent, setEmailContent] = useState( '' );
    const [files, setFiles] = useState( null );
    const [openCollapse, setOpenCollapse] = useState( true );
    const [priceUsign, setPriceUsign] = useState( 0 );
    const { getAccessTokenSilently } = useAuth0();
    const [sequenceMethod, setSequenceMethod] = useState( 'parallel' );

    // transparency
    useEffect( () => {
        (async () => {
            const accessToken = await getAccessTokenSilently();
            const dossierId = !isNil( affaireId ) ? affaireId : null;
            // if dossier does not exist get the user email
            if ( !isNil( dossierId ) ) {
                const resultDossier = await getDossierById( accessToken, dossierId, vckeySelected );
                if ( !resultDossier.error ) {
                    const dossier = new DossierDTO( resultDossier.data );
                    let clientTemp = new ClientUsignDTO( null );
                    clientTemp.email = dossier.emailClient;
                    clientTemp.firstname = dossier.firstnameClient;
                    clientTemp.lastname = dossier.lastnameClient;
                    clientTemp.birthdate = dossier.birthdateClient;

                    setClient( clientTemp );
                }

            } else if ( cas && cas.username ) {
                let clientTemp = new ClientUsignDTO( null, label );
                clientTemp.email = cas.username.email;
                setClient( clientTemp );
            }
            setIsLoading( false );

            fetchUsignPaymentPrice( accessToken, ( price ) => {
                setPriceUsign( price.toFixed( 2 ) );
            } );

        })();
    }, [getAccessTokenSilently] );

    const _esignDocument = async () => {
        setbtnIsLoading( true );
        files.append( 'sequence', sequenceMethod );
        files.append( 'content', emailContent );
        files.append( 'contact', JSON.stringify( toRecipientEmail ) );
        // if exists
        if ( cas ) {
            files.append( 'casId', cas.id );
        }

        // used for list , out of the dossier
        await attachEsignDocument( files, affaireId );

        setbtnIsLoading( false );

        toggle();
    };

    const toggle = () => {
        toggleModalDetails();
    };

    const modifyIndexRecepient = (index, indexHover) => {
        let recipientTmp = toRecipientEmail;
        // become the hover
        let sequenceToChange = recipientTmp[index].sequence;
        recipientTmp[index].sequence = recipientTmp[indexHover].sequence;
        //become
        recipientTmp[indexHover].sequence = sequenceToChange;
        let recipientTmpOrdered = orderBy( recipientTmp, ['sequence'] );

        setToRecipientEmail( [...recipientTmpOrdered] );
    };

    const removeRecipient = ( seq ) => {
        let toRecipientEmailTemp = toRecipientEmail;
        var index = findIndex( toRecipientEmailTemp, { 'sequence': seq } );
        if ( index === 0 ) {
            toRecipientEmailTemp.splice( index, 1 );

        } else {
            toRecipientEmailTemp.splice( index, index );
        }
        const recipientTmp = [...toRecipientEmail];

        let sequence = 1;
        forEach(recipientTmp, recipient =>{
            recipient.sequence = sequence ;
            sequence++;
        })
        setToRecipientEmail( recipientTmp );
    };

    const handleBirthDatePickerChange = ( date, e ) => {
        //e.persist(); e.stopPropagation();
        const dateString = getDate( date );
        //compute the original
        setClient( { ...client, birthdate: dateString } );
    };

    const _addRecipient = ( e ) => {
        e.preventDefault();

        if ( isNil( client.email ) || isEmpty( client.email ) ) {
            showMessagePopup( label.etat.error5, 'danger' );
            return;
        }
        if ( !validateEmail( client.email ) ) {
            showMessagePopup( label.affaire.error18, 'danger' );
            return;
        }

        if ( isNil( client.firstname ) || isEmpty( client.firstname ) ) {
            showMessagePopup( label.etat.error3, 'danger' );
            return;
        }
        if ( isNil( client.lastname ) || isEmpty( client.lastname ) ) {
            showMessagePopup( label.etat.error4, 'danger' );
            return;
        }

        const nb = nbtoRecipientEmail.current + 1;
        client.id = nb;
        nbtoRecipientEmail.current = nb;
        const recipientTmp = [...toRecipientEmail, client];

        let sequence = 1;
        forEach(recipientTmp, recipient =>{
            recipient.sequence = sequence ;
            sequence++;
        })
        setToRecipientEmail( recipientTmp );
        setClient( new ClientUsignDTO( null, label ) );
    };

    const _toggleCollapse = () => {
        setOpenCollapse( !openCollapse );
    };
    const _setCoordinate = ( id, left, top, pageNumber ) => {
        const index = findIndex( toRecipientEmail, { 'id': id } );
        let toRecipientEmailTemp = toRecipientEmail;
        toRecipientEmailTemp[ index ].left = left;
        toRecipientEmailTemp[ index ].top = top;
        toRecipientEmailTemp[ index ].pageNumber = pageNumber;

        setToRecipientEmail( [...toRecipientEmailTemp] );

    };
    const _uploadDocument = ( file ) => {
        //e.preventDefault();

        //const filesTemp = [...e.target.files];
        //const file = filesTemp[ 0 ];
        let data = new FormData();
        const extension = file.name.split( '.' ).pop();

        const newFileName = !isNil( documentName ) && !isEmpty( documentName ) ? documentName + '.' + extension : file.name;

        data.append( 'files', file, newFileName );

        setOpenCollapse( false );
        setFiles( data );
    };

    return (
        <Modal size="lg" isOpen={modalDisplay} toggle={toggle}>
            <ModalHeader toggle={toggle}
                         className="justify-content-center"
                         tag={`h4`}>
                {label.etat.usignModalLabel} {' '}
                <strong className="text-muted">{priceUsign}€</strong>

            </ModalHeader>
            <ModalBody>
                {isLoading ? (
                    <CircularProgress size={50}/>
                ) : (
                    <>
                        {files ? (
                            <Button color="primary" onClick={_toggleCollapse}
                                    style={{ marginBottom: '1rem' }}>Toggle</Button>
                        ) : null}

                        <Collapse isOpen={openCollapse}>
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
                                            placeholder={label.etat.fillinEmailUploadTo}
                                            value={client.email}
                                            onChange={( e ) => setClient( { ...client, email: e.target.value } )}
                                        />
                                    </FormGroup>
                                </Col>
                            </Row>
                            <Row>
                                {/*<!-- first name client -->*/}
                                <Label md="3">
                                    {label.etat.firstUploadToLbl}
                                </Label>
                                <Col lg={9} md={9} sm={9}>
                                    <FormGroup>
                                        <Input
                                            type="text"
                                            name="firstname"
                                            component="textarea"
                                            className="form-control"
                                            placeholder={label.etat.firstUploadToLbl}
                                            value={client.firstname}
                                            onChange={( e ) => setClient( { ...client, firstname: e.target.value } )}
                                        />
                                    </FormGroup>
                                </Col>
                            </Row>
                            <Row>
                                {/*<!-- last name client -->*/}
                                <Label md="3">
                                    {label.etat.lastUploadToLbl}
                                </Label>
                                <Col lg={9} md={9} sm={9}>
                                    <FormGroup>
                                        <Input
                                            type="text"
                                            name="lastname"
                                            component="textarea"
                                            className="form-control"
                                            placeholder={label.etat.lastUploadToLbl}
                                            value={client.lastname}
                                            onChange={( e ) => setClient( { ...client, lastname: e.target.value } )}
                                        />
                                    </FormGroup>
                                </Col>
                            </Row>
                            <Row>
                                {/*<!-- Birth date client -->*/}
                                <Label md={3} sm={4}>
                                    <Row>
                                        <Col lg={9} md={9} sm={8}>
                                            {label.etat.birthUploadToLbl}
                                        </Col>
                                        <Col lg={3} md={3} sm={4}>
                                            <a className="btn btn-info btn-sm"
                                               target="_blank" rel="noopener noreferrer"
                                               href="https://economie.fgov.be/fr/themes/line/commerce-electronique/signature-electronique-et">
                                                <i className="fa fa-question"/></a>
                                        </Col>
                                    </Row>
                                </Label>

                                <Col lg={9} md={9} sm={8}>
                                    <FormGroup>
                                        <DatePicker
                                            selected={client.birthdate ? new Date( client.birthdate ) : null}
                                            onChange={handleBirthDatePickerChange}
                                            locale="fr"
                                            timeCaption="date"
                                            dateFormat="yyyy-MM-dd"
                                            placeholderText="yyyy-mm-dd"
                                            className="form-control color-primary"
                                        />
                                        <FormText>{label.etat.smallBirthDateInfo}</FormText>

                                    </FormGroup>
                                </Col>
                            </Row>
                            <Row>
                                {/*<!-- add client to list recipient -->*/}
                                <Col lg={{ offset: 8, size: 4 }} md={{ offset: 9, size: 3 }} sm={3}>
                                    <Button color="primary"
                                            onClick={_addRecipient}>{label.etat.btnAddToEmail}</Button>{' '}
                                </Col>
                            </Row>
                            <Row>
                                {/*<!-- add client to list recipient -->*/}
                                {!isNil( toRecipientEmail ) && !isEmpty( toRecipientEmail ) ? (
                                        <>
                                            <Col className="text-align-center" lg={12} md={12} sm={12}>
                                                <ButtonGroup>
                                                    <Button color={sequenceMethod === 'parallel' ? 'primary': 'default'} onClick={() => setSequenceMethod( 'parallel' )}
                                                            active={sequenceMethod === 'parallel'}>{label.usign.label1}</Button>
                                                    <Button color={sequenceMethod === 'sequence' ? 'primary': 'default'} onClick={() => setSequenceMethod( 'sequence' )}
                                                            active={sequenceMethod === 'sequence'}>{label.usign.label2}</Button>
                                                </ButtonGroup>
                                            </Col>
                                            <Col lg={12} md={12} sm={12}>
                                                <TableUsignSequence
                                                    removeRecipient={removeRecipient}
                                                    modifyIndexRecepient={modifyIndexRecepient}
                                                    sequenceMethod={sequenceMethod}
                                                    data={toRecipientEmail}
                                                    count={size(toRecipientEmail)}
                                                    label={label}
                                                    />
                                            </Col>
                                        </>
                                    )
                                    : null}
                            </Row>
                            {!isNil( toRecipientEmail ) && !isEmpty( toRecipientEmail ) ? (
                                    <>
                                        <Row>
                                            {/*<!-- document name -->*/}
                                            <Label md="3">
                                                {label.etat.documentName}
                                            </Label>
                                            <Col lg={9} md={9} sm={9}>
                                                <FormGroup>
                                                    <Input
                                                        name="documentname"
                                                        component="textarea"
                                                        className="form-control"
                                                        placeholder={label.etat.documentName}
                                                        value={documentName}
                                                        onChange={( e ) => setDocumentName( e.target.value )}

                                                    />
                                                </FormGroup>
                                            </Col>
                                        </Row>
                                        {/*<!-- message to client -->*/}

                                        <Row>
                                            <Label md="3">
                                                {label.etat.emailContent}
                                            </Label>
                                            <Col lg={9} md={9} sm={9}>
                                                <FormGroup>
                                                    <Input
                                                        rows={3}
                                                        type="textarea"
                                                        name="content"
                                                        componentClass="textarea"
                                                        className="form-control"
                                                        placeholder={label.etat.emailContent}
                                                        value={emailContent}
                                                        onChange={( e ) => setEmailContent( e.target.value )}
                                                    />
                                                </FormGroup>
                                            </Col>
                                        </Row>
                                        <Row>
                                            {/*<!-- document to sign -->*/}
                                            <Col lg={12} md={12} sm={12}>
                                                <FormGroup>
                                                    <PdfUpload
                                                        saveFile={_uploadDocument}
                                                        avatar={null}/>
                                                </FormGroup>
                                            </Col>
                                        </Row>
                                    </>
                                )
                                : null}
                        </Collapse>
                        {openCollapse === false ? (
                            <MailGenerator
                                coordinate={_setCoordinate}
                                toRecipientEmail={toRecipientEmail}
                                file={files}/>
                        ) : null}
                    </>
                )
                }
            </ModalBody>
            <ModalFooter className="text-align-right">
                <Button color="default" onClick={toggle}>{label.common.close}</Button>
                {!isNil( toRecipientEmail ) && !isEmpty( toRecipientEmail )
                && !isNil( payment ) && payment === true ? (
                    <FormGroup>
                        <Button
                            disabled={btnIsLoading}
                            color="primary"
                            onClick={!btnIsLoading ? _esignDocument : null}>{label.etat.send} ({(size( toRecipientEmail ) * priceUsign).toFixed( 2 )}€)</Button>
                        <FormText color="muted">
                            {label.etat.label1} {' '} {priceUsign}€
                        </FormText>
                        <FormText color="muted">
                            {label.etat.label2}
                        </FormText>
                    </FormGroup>
                ) : null}
            </ModalFooter>
        </Modal>
    );
}

