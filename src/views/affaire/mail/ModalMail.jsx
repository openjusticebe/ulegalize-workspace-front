import React, { useEffect, useRef, useState } from 'react';
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    Col,
    FormGroup,
    FormText,
    Input,
    Label,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Nav,
    NavItem,
    NavLink,
    Row,
    Spinner,
    TabContent,
    Table,
    TabPane
} from 'reactstrap';
import { useAuth0 } from '@auth0/auth0-react';
import PdfUpload from '../../../components/CustomUpload/PdfUpload';
import {
    getBPostStatus,
    getCountryCodes,
    getDocumentById,
    getStatus,
    getTotalCost,
    payDocument,
    sendTemporaryDocument,
    updateAddress,
    updateSendingOptions
} from '../../../services/PostBirdServices';
import DocumentDTO from '../../../model/postbird/DocumentDTO';
import Select from 'react-select';
import { getDate } from '../../../utils/DateUtils';
import { getStatusPostBird } from './StatusPostBird';
import ItemDTO from '../../../model/ItemDTO';
import PriceDetail from '../../../model/postbird/PriceDetail';
import ReactLoading from 'react-loading';
import { getStatusBPostPostBird } from './StatusBPostPostBird';
import MailPostBirdGenerator from './MailPostBirdGenerator';
import classnames from 'classnames';
import AsyncSelect from 'react-select/async/dist/react-select.esm';
import { getAffairesByVcUserIdAndSearchCriteria, getDossierById } from '../../../services/DossierService';
import DossierDTO from '../../../model/affaire/DossierDTO';
import { getClient, getClientById } from '../../../services/ClientService';
import ContactSummary from '../../../model/client/ContactSummary';
import AsyncCreatableSelect from 'react-select/async-creatable';
import { validatePostBe } from '../../../utils/Utils';

const isNil = require( 'lodash/isNil' );
const map = require( 'lodash/map' );
const isEmpty = require( 'lodash/isEmpty' );
const padStart = require( 'lodash/padStart' );
const upperCase = require( 'lodash/upperCase' );

export default function ModalMail( {
                                       label,
                                       modalPostMailDisplay,
                                       openPostMail,
                                       showMessage,
                                       updateList,
                                       documentId,
                                       dossierId,
                                       vckeySelected
                                   } ) {
    const [document, setDocument] = useState( null );
    const [countryList, setCountryList] = useState( [] );
    const [isLoading, setIsLoading] = useState( false );
    const [choice, setChoice] = useState( 'addAddressPage' );
    const [totalCost, setTotalCost] = useState( 0 );
    const [bpostStatus, setBpostStatus] = useState( 0 );
    const [horizontalTabs, setHorizontalTabs] = useState( 'document' );
    const [dossierItem, setDossierItem] = useState( null );
    const [updateDossierDisable, setUpdateDossierDisable] = useState( false );
    const dossierRef = useRef( null );
    // use for timer
    const documentIdRef = useRef( documentId );
    const clientSelected = useRef( null );

    const { getAccessTokenSilently } = useAuth0();

    useEffect( () => {
        (async () => {
            const accessToken = await getAccessTokenSilently();

            let resultCountry = await getCountryCodes( accessToken );
            let countriesCode;
            if ( resultCountry.data ) {
                countriesCode = map( resultCountry.data, country => {
                    return new ItemDTO( { value: country.iso2, label: country.name } );
                } );
                setCountryList( countriesCode );
            }

            if ( !isNil( dossierId ) ) {
                const resultDossier = await getDossierById( accessToken, dossierId, vckeySelected );
                if ( !resultDossier.error ) {
                    const dossierDTO = new DossierDTO( resultDossier.data );
                    dossierRef.current = `${dossierDTO.year}/${padStart( dossierDTO.num, 4, '0' )}/`;
                    setDossierItem( new ItemDTO( { value: dossierDTO.id, label: dossierDTO.label } ) );
                }
            }

            // read the actual document id
            if ( !isNil( documentIdRef.current ) ) {
                let resultDocument = await getDocumentById( accessToken, documentIdRef.current );
                let documentTmp = null;

                if ( resultDocument.error ) {
                    // close with message
                    showMessage( label.mail.error2, 'danger' );
                    openPostMail('BE');
                } else {
                    documentTmp = new DocumentDTO( resultDocument.data );
                    map( countriesCode, country => {
                        if ( country.value === upperCase( documentTmp.countryCode ) ) {
                            documentTmp.countryCodeItem = new ItemDTO( { value: country.name, label: country.label } );
                        }
                    } );
                    if ( !isNil( documentTmp.dossierId ) ) {
                        const resultDossier = await getDossierById( accessToken, documentTmp.dossierId, vckeySelected );
                        if ( !resultDossier.error ) {
                            const dossierDTO = new DossierDTO( resultDossier.data );
                            dossierRef.current = `${dossierDTO.year}/${padStart( dossierDTO.num, 4, '0' )}/`;
                            setDossierItem( new ItemDTO( { value: dossierDTO.id, label: dossierDTO.label } ) );
                        }

                    }
                    clientSelected.current = new ItemDTO( {
                        value: documentTmp.recipientName,
                        label:  documentTmp.recipientName,
                        isDefault: documentTmp.recipientName
                    } );
                    setDocument( documentTmp );
                }

                // get cost
                _getCost( documentTmp );
            }
        })();
    }, [getAccessTokenSilently] );

    const _getCost = async ( documentParam ) => {
        if ( !isNil( documentIdRef.current ) ) {

            const accessToken = await getAccessTokenSilently();

            let resultTotalCost = await getTotalCost( accessToken, documentIdRef.current );
            if ( !resultTotalCost.error ) {
                const costTemp = new PriceDetail( resultTotalCost.data );

                setTotalCost( costTemp );
            }

            // document sent
            if ( documentParam && documentParam.status && parseInt( documentParam.status ) >= 13 ) {
                let resultBPostStatus = await getBPostStatus( accessToken, documentIdRef.current );
                if ( !resultBPostStatus.error ) {
                    setBpostStatus( resultBPostStatus.data );
                }
            }
        }
    };
    const _refreshStatus = async () => {
        const accessToken = await getAccessTokenSilently();
        let resultStatus = await getStatus( accessToken, documentIdRef.current );

        if ( !resultStatus.error ) {

            const documentTmp = new DocumentDTO( resultStatus.data );

            // get address info
            clientSelected.current = new ItemDTO( {
                value: documentTmp.recipientName,
                label:  documentTmp.recipientName,
                isDefault: documentTmp.recipientName
            } );
            setDocument( documentTmp );

            _getCost( documentTmp );
        }

        updateList();
    };

    const _sendDocument = async () => {
        setIsLoading( true );
        const accessToken = await getAccessTokenSilently();
        document.sendMethod = choice;

        const result = await payDocument( accessToken, documentIdRef.current );

        if ( !result.error ) {
            const documentTmp = new DocumentDTO( result.data );
            clientSelected.current = new ItemDTO( {
                value: documentTmp.recipientName,
                label:  documentTmp.recipientName,
                isDefault: documentTmp.recipientName
            } );
            setDocument( documentTmp );
            showMessage( label.mail.success3, 'primary' );
        } else {
            showMessage( label.mail.error3, 'danger' );
        }
        updateList();

        setIsLoading( false );
    };
    const _updateAddress = async () => {
        setIsLoading( true );
        const accessToken = await getAccessTokenSilently();
        document.sendMethod = choice;

        const result = await updateAddress( accessToken, documentIdRef.current, document );

        if ( result.data ) {
            const documentTmp = new DocumentDTO( result.data );

            map( countryList, country => {
                if ( country.value === upperCase( documentTmp.countryCode ) ) {
                    documentTmp.countryCodeItem = new ItemDTO( { value: country.name, label: country.label } );
                }
            } );
            clientSelected.current = new ItemDTO( {
                value: documentTmp.recipientName,
                label:  documentTmp.recipientName,
                isDefault: documentTmp.recipientName
            } );
            setDocument( documentTmp );
            showMessage( label.mail.success1, 'primary' );
            _getCost( documentTmp );
        }

        setIsLoading( false );
    };
    const _updateSendingOptions = async () => {
        setIsLoading( true );
        const accessToken = await getAccessTokenSilently();

        const result = await updateSendingOptions( accessToken, documentIdRef.current, document );

        if ( result.data ) {
            const documentTmp = new DocumentDTO( result.data );
            clientSelected.current = new ItemDTO( {
                value: documentTmp.recipientName,
                label:  documentTmp.recipientName,
                isDefault: documentTmp.recipientName
            } );
            setDocument( documentTmp );
            showMessage( label.mail.success2, 'primary' );

            _getCost( documentTmp );
        }

        setIsLoading( false );
    };
    const _uploadDocument = async ( file ) => {
        setIsLoading( true );
        let data = new FormData();
        data.append( 'files', file );
        if ( !isNil( dossierItem) ) {
            data.append( 'dossierId', dossierItem.value );
        }
        if ( !isNil( dossierRef.current ) ) {
            data.append( 'dossierPath', dossierRef.current );
        }
        const accessToken = await getAccessTokenSilently();

        // check if it's ok
        // if not show document
        // or display cost
        const result = await sendTemporaryDocument( accessToken, data );

        if ( result.data ) {
            const doc = new DocumentDTO( result.data );
            documentIdRef.current = doc.documentId;
            clientSelected.current = new ItemDTO( {
                value: doc.recipientName,
                label:  doc.recipientName,
                isDefault: doc.recipientName
            } );
            setDocument( doc );
            // maybe use a timer to get the cost
            setTimeout( () => {
                    _refreshStatus();

                    setTimeout( () =>
                            _refreshStatus()
                        , 600 );
                }
                , 1000 );

            setUpdateDossierDisable( !updateDossierDisable );
        } else {
            showMessage( label.mail.error1, 'error' );
        }

        setIsLoading( false );
    };
    const changeActiveTab = async ( e, tabState, tadName ) => {
        e.preventDefault();

        if ( tabState === 'horizontalTabs' ) {
            setHorizontalTabs( tadName );
        }

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

    const _handleDossierChange = async ( newValue ) => {
        setDossierItem( newValue );

        if ( !isNil( newValue ) ) {
            const accessToken = await getAccessTokenSilently();
            const resultDossier = await getDossierById( accessToken, newValue.value, vckeySelected );
            if ( !resultDossier.error ) {
                const dossierDTO = new DossierDTO( resultDossier.data );
                dossierRef.current = `${dossierDTO.year}/${padStart( dossierDTO.num, 4, '0' )}/`;
            }
        }

    };
    const _loadClientOptions = async ( inputValue, callback ) => {
        const accessToken = await getAccessTokenSilently();
        let result = await getClient( accessToken, inputValue );

        callback( map( result.data, data => {
            if ( !isNil( data.email ) ) {
                return new ItemDTO( {
                    value: data.id,
                    label: data.fullName,
                    isDefault: data.email
                } );
            }
        } ) );
    };
    const _handleRecipientChange = async ( newValue ) => {
        clientSelected.current = newValue;

        if ( !isNil( newValue ) ) {
            let documentTmp = new DocumentDTO(document);
            const accessToken = await getAccessTokenSilently();
            let result = await getClientById( accessToken, newValue.value );
            // retrieve client
            if ( !isNil(result.data) && !isEmpty(result.data) ) {
                let clientResult = new ContactSummary( result.data, label );
                // get the existing
                if ( isEmpty( document.streetAndNumber ) ) {
                    documentTmp.streetAndNumber = clientResult.address;
                }
                if ( isEmpty( document.postalCode ) ) {
                    documentTmp.postalCode = clientResult.cp;

                }
                if ( isEmpty( document.city ) ) {
                    documentTmp.city = clientResult.city;
                }
                clientSelected.current = new ItemDTO( {
                    value: clientResult.id,
                    label:  clientResult.fullName,
                    isDefault: clientResult.email
                } );
            } else {
                clientSelected.current = newValue;
            }
            documentTmp.recipientName = newValue.label;
            setDocument( documentTmp )
        } else {
            clientSelected.current = null;
            setDocument( { ...document,
                recipientName: null
            } );
        }

    };
    return (
        <>
            <Modal size="lg" isOpen={modalPostMailDisplay} toggle={()=>openPostMail('BE')}>
                <ModalHeader toggle={()=>openPostMail('BE')}>
                    <h4 className="modal-title">{label.mail.label1}
                    </h4>
                </ModalHeader>
                <ModalBody>
                    {isNil( document ) && !isNil( documentId ) ? (
                        <ReactLoading className="loading" height={'20%'} width={'20%'}/>
                    ) : null}
                    <Row>
                        <Col md={12}>
                            {isNil( documentId ) ? (
                                <>
                                    {isNil( dossierId ) ? (
                                        <Row>
                                            <Col md={12}>
                                                {/*<!-- dossier -->*/}
                                                <Label>
                                                    {label.mail.dossier}
                                                </Label>
                                                <FormGroup row={true}>
                                                    <Col lg={7} md={7} sm={7}>
                                                        <AsyncSelect
                                                            value={dossierItem}
                                                            isClearable={true}
                                                            className="react-select info"
                                                            classNamePrefix="react-select"
                                                            cacheOptions
                                                            isDisabled={updateDossierDisable}
                                                            loadOptions={_loadDossierOptions}
                                                            defaultOptions
                                                            onChange={_handleDossierChange}
                                                            placeholder={label.mail.dossierPlaceholder}
                                                        />
                                                    </Col>
                                                </FormGroup>
                                                <FormText color="muted">
                                                    {label.common.optional}
                                                </FormText>
                                            </Col>

                                        </Row>
                                    ) : null}
                                    <PdfUpload
                                        isLoading={isLoading}
                                        saveFile={_uploadDocument}
                                        avatar={null}/>
                                </>
                            ) : null}
                            {/* display once document is uploaded */}
                            {!isNil( document ) && document.status ? (
                                <>
                                    <Row>
                                        <Col md={10}>
                                            <Nav className="nav-pills-info" pills>
                                                <NavItem>
                                                    <NavLink
                                                        data-toggle="tab"
                                                        href="#doc"
                                                        className={
                                                            horizontalTabs === 'document'
                                                                ? 'active'
                                                                : ''
                                                        }
                                                        onClick={e =>
                                                            changeActiveTab( e, 'horizontalTabs', 'document' )
                                                        }
                                                    >
                                                        {label.mail.label24}
                                                    </NavLink>
                                                </NavItem>
                                                <NavItem>
                                                    <NavLink
                                                        data-toggle="tab"
                                                        href="#opt"
                                                        className={
                                                            horizontalTabs === 'sendOptions'
                                                                ? 'active'
                                                                : ''
                                                        }
                                                        onClick={e =>
                                                            changeActiveTab( e, 'horizontalTabs', 'sendOptions' )
                                                        }
                                                    >
                                                        {label.mail.label25}
                                                    </NavLink>
                                                </NavItem>
                                                <NavItem>
                                                    <NavLink
                                                        data-toggle="tab"
                                                        href="#sm"
                                                        className={
                                                            horizontalTabs === 'showMail'
                                                                ? 'active'
                                                                : ''
                                                        }
                                                        onClick={e =>
                                                            changeActiveTab( e, 'horizontalTabs', 'showMail' )
                                                        }
                                                    >
                                                        {label.mail.label35}
                                                    </NavLink>
                                                </NavItem>
                                            </Nav>
                                        </Col>
                                    </Row>

                                    <TabContent
                                        className="tab-space no-padding"
                                        activeTab={horizontalTabs}
                                    >
                                        <TabPane tabId="document">
                                            <Row>
                                                <Col md={6}>
                                                    <Card>
                                                        <CardHeader>
                                                        </CardHeader>
                                                        <CardBody>
                                                            <ul>
                                                                <li>{label.mail.label14} <i
                                                                    className={`fa ${parseInt( document.status ) >= 3 ? 'fa-check green' : 'fa-times red'}`}/>
                                                                </li>
                                                                <li>{label.mail.label18} <i
                                                                    className={`fa ${parseInt( document.status ) >= 5 ? 'fa-check green' : 'fa-times red'}`}/>
                                                                </li>
                                                                <li>{label.mail.label15} <i
                                                                    className={`fa ${parseInt( document.status ) >= 8 ? 'fa-check green' : 'fa-times red'}`}/>
                                                                </li>
                                                                {/* PAID */}
                                                                <li>{label.mail.label31} <i
                                                                    className={`fa ${parseInt( document.status ) >= 11 ? 'fa-check green' : 'fa-times red'}`}/>
                                                                </li>
                                                                {/* PRINTED */}
                                                                <li>{label.mail.label33} <i
                                                                    className={`fa ${parseInt( document.status ) >= 12 ? 'fa-check green' : 'fa-times red'}`}/>
                                                                </li>
                                                                {/* SEND */}
                                                                <li>{label.mail.label34} <i
                                                                    className={`fa ${parseInt( document.status ) >= 13 ? 'fa-check green' : 'fa-times red'}`}/>
                                                                </li>
                                                                {/* DELIVERED */}
                                                                <li>{label.mail.label16} <i
                                                                    className={`fa ${parseInt( document.status ) >= 16 ? 'fa-check green' : 'fa-times red'}`}/>
                                                                </li>
                                                                <li>{label.mail.label17} <i
                                                                    className={`fa ${parseInt( document.status ) === 19 ? 'fa-check green' : 'fa-times red'}`}/>
                                                                </li>
                                                            </ul>
                                                        </CardBody>
                                                    </Card>
                                                </Col>

                                                <Col md={6}>
                                                    {/* GET COST */}
                                                    {!isNil( document ) && document.status
                                                    && parseInt( document.status ) >= 0 && parseInt( document.status ) < 11 ? (
                                                        <>
                                                            <h4>{label.mail.label22}</h4>
                                                            <strong>{totalCost.totalPriceExVat} € </strong>
                                                            {totalCost.totalPriceInVat ? (
                                                                <>
                                                                    <h4>{label.mail.label23}</h4>
                                                                    <strong>{totalCost.totalPriceInVat} € </strong>
                                                                </>
                                                            ) : null}
                                                        </>
                                                    ) : null}
                                                </Col>

                                                <Col md={12}>
                                                    {/* BPost DOCUMENT SENT */}
                                                    {!isNil( document ) && parseInt( document.status ) >= 13 && !isEmpty( document.trackingCode ) ? (
                                                        <>
                                                            {getStatusBPostPostBird( bpostStatus, label )} {' '}
                                                            <a
                                                                target="_blank" rel="noopener noreferrer"
                                                                href={`${process.env.REACT_APP_BPOST_TRACK}${document.trackingCode}`}>
                                                                {process.env.REACT_APP_BPOST_TRACK}{document.trackingCode}
                                                            </a>
                                                        </>
                                                    ) : null}
                                                </Col>
                                            </Row>
                                            {/* if it's not ok refresh status */}
                                            {!isNil( document ) && document.status !== '8' ? (
                                                <Row>
                                                    <Button
                                                        color="primary"
                                                        disabled={isLoading}
                                                        onClick={_refreshStatus}>
                                                        {isLoading ? (
                                                            <Spinner
                                                                size="sm"
                                                                color="secondary"
                                                            />
                                                        ) : null}
                                                        {' '}{label.payment.refresh}
                                                    </Button>
                                                </Row>
                                            ) : null}
                                            {/* display once the document is send , address ok */}
                                            {!isNil( document ) && (parseInt( document.status ) >= 6) ? (
                                                <>
                                                    {/* recipientName */}
                                                    <FormGroup row className={classnames( {
                                                        'has-danger': isEmpty( document.recipientName )
                                                    } )}>
                                                        <Label for="recipientName"
                                                               sm={4}>{label.mail.label19}</Label>
                                                        <Col sm={8} md={8} lg={8} xl={8}>
                                                            <AsyncCreatableSelect
                                                                value={clientSelected.current}
                                                                className="react-select info"
                                                                classNamePrefix="react-select"
                                                                cacheOptions
                                                                isClearable={true}
                                                                create
                                                                type="email"
                                                                placeholder={label.mail.label19}
                                                                id="recipientName"
                                                                name="recipientName"
                                                                loadOptions={_loadClientOptions}
                                                                defaultOptions
                                                                onChange={_handleRecipientChange}
                                                            />
                                                        </Col>
                                                    </FormGroup>
                                                    {/* streetAndNumber */}
                                                    <FormGroup row className={classnames( {
                                                        'has-danger': isEmpty( document.streetAndNumber )
                                                    } )}>
                                                        <Label for="streetAndNumber"
                                                               sm={4}>{label.mail.label3}</Label>
                                                        <Col sm={8} md={8} lg={8} xl={8}>
                                                            <Input
                                                                onChange={( e ) => setDocument( {
                                                                    ...document,
                                                                    streetAndNumber: e.target.value
                                                                } )}
                                                                disabled={parseInt( document.status ) >= 11}
                                                                id="streetAndNumber"
                                                                value={document.streetAndNumber}
                                                                name="streetAndNumber"
                                                                className="form-control"
                                                                type="text"
                                                                placeholder={label.mail.label3}
                                                            />
                                                        </Col>
                                                    </FormGroup>
                                                    {/* postalCode */}
                                                    <FormGroup row className={classnames( {
                                                        'has-danger': isEmpty( document.postalCode ) || !validatePostBe(document.postalCode)
                                                    } )}>
                                                        <Label for="codePostal" sm={4}>{label.mail.label4}</Label>
                                                        <Col sm={8} md={8} lg={8} xl={8}>
                                                            <Input
                                                                id="postalCode"
                                                                onChange={( e ) => setDocument( {
                                                                    ...document,
                                                                    postalCode: e.target.value
                                                                } )}
                                                                disabled={parseInt( document.status ) >= 11}
                                                                name="postalCode"
                                                                className="form-control"
                                                                type="text"
                                                                value={document.postalCode}
                                                                placeholder={label.mail.label4}
                                                            />
                                                        </Col>
                                                        <FormText>{label.mail.error6}</FormText>
                                                    </FormGroup>
                                                    {/* city */}
                                                    <FormGroup row className={classnames( {
                                                        'has-danger': isEmpty( document.city )
                                                    } )}>
                                                        <Label for="city" sm={4}>{label.mail.label5}</Label>
                                                        <Col sm={8} md={8} lg={8} xl={8}>
                                                            <Input
                                                                id="city"
                                                                onChange={( e ) => setDocument( {
                                                                    ...document,
                                                                    city: e.target.value
                                                                } )}
                                                                disabled={parseInt( document.status ) >= 11}
                                                                name="city"
                                                                className="form-control"
                                                                type="text"
                                                                value={document.city}
                                                                placeholder={label.mail.label5}
                                                            />
                                                        </Col>
                                                    </FormGroup>
                                                    {/* countryCode */}
                                                    <FormGroup row>
                                                        <Label for="country" sm={4}>{label.mail.label6}</Label>
                                                        <Col sm={8} md={8} lg={8} xl={8}>
                                                            <Select
                                                                onChange={( value ) => setDocument( {
                                                                    ...document,
                                                                    countryCode: value.value,
                                                                    countryCodeItem: value
                                                                } )}
                                                                isDisabled={parseInt( document.status ) >= 11}
                                                                value={document.countryCodeItem}
                                                                name="country"
                                                                options={countryList}
                                                            />
                                                        </Col>
                                                    </FormGroup>
                                                    {/* choice */}
                                                    <Row>
                                                        <Col md={12}>
                                                            <FormGroup check className="form-check-radio">
                                                                <Label check>
                                                                    <Input
                                                                        checked={choice === 'addAddressPage'}
                                                                        disabled={parseInt( document.status ) >= 11}
                                                                        defaultValue="option1"
                                                                        id="addAddressPage1"
                                                                        name="addAddressPage1"
                                                                        type="radio"
                                                                        onChange={( e ) => setChoice( 'addAddressPage' )}
                                                                    />
                                                                    <span className="form-check-sign"/>
                                                                    {label.mail.choice1}
                                                                </Label>
                                                            </FormGroup>

                                                        </Col>
                                                        <Col md={12}>
                                                            <FormGroup check className="form-check-radio">
                                                                <Label check>
                                                                    <Input
                                                                        checked={choice === 'overWriteAddressField'}
                                                                        disabled={parseInt( document.status ) >= 11}
                                                                        defaultValue="option2"
                                                                        id="overWriteAddressField2"
                                                                        name="overWriteAddressField2"
                                                                        type="radio"
                                                                        onChange={( e ) => setChoice( 'overWriteAddressField' )}
                                                                    />
                                                                    <span className="form-check-sign"/>
                                                                    {label.mail.choice2}
                                                                </Label>
                                                            </FormGroup>

                                                        </Col>
                                                    </Row>
                                                </>
                                            ) : null}
                                        </TabPane>
                                        <TabPane tabId="sendOptions">

                                            {/**** SENDING OPTION ****/}
                                            <Row>
                                                <Col md={6}>
                                                    {/**** color ****/}
                                                    <Row>
                                                        <Col md="12">
                                                            <FormGroup check>
                                                                <Label check>
                                                                    <Input
                                                                        disabled={parseInt( document.status ) >= 11}
                                                                        defaultChecked={document.color}
                                                                        type="checkbox"
                                                                        onChange={( e ) => {
                                                                            setDocument( {
                                                                                ...document,
                                                                                color: e.target.checked
                                                                            } );
                                                                            document.color = e.target.checked;
                                                                            _updateSendingOptions();
                                                                        }}
                                                                    />{' '}
                                                                    <span className={`form-check-sign`}>
                                                                <span
                                                                    className="check"> {label.mail.label26}</span>
                                                            </span>
                                                                </Label>
                                                            </FormGroup>
                                                        </Col>
                                                    </Row>
                                                    {/**** doubleSide ****/}
                                                    <Row>
                                                        <Col md="12">
                                                            <FormGroup check>
                                                                <Label check>
                                                                    <Input
                                                                        defaultChecked={document.twoSided}
                                                                        disabled={parseInt( document.status ) >= 11}
                                                                        type="checkbox"
                                                                        onChange={( e ) => {
                                                                            setDocument( {
                                                                                ...document,
                                                                                twoSided: e.target.checked
                                                                            } );
                                                                            document.twoSided = e.target.checked;
                                                                            _updateSendingOptions();
                                                                        }}
                                                                    />{' '}
                                                                    <span className={`form-check-sign`}>
                                                                <span
                                                                    className="check"> {label.mail.label27} </span>
                                                            </span>
                                                                </Label>
                                                            </FormGroup>
                                                        </Col>
                                                    </Row>
                                                    {/**** registered ****/}
                                                    <Row>
                                                        <Col md="12">
                                                            <FormGroup check>
                                                                <Label check>
                                                                    <Input
                                                                        defaultChecked={document.registered}
                                                                        disabled={parseInt( document.status ) >= 11}
                                                                        type="checkbox"
                                                                        onChange={( e ) => {
                                                                            setDocument( {
                                                                                ...document,
                                                                                registered: e.target.checked
                                                                            } );
                                                                            document.registered = e.target.checked;
                                                                            _updateSendingOptions();
                                                                        }}
                                                                    />{' '}
                                                                    <span className={`form-check-sign`}>
                                                                <span
                                                                    className="check"> {label.mail.label28} </span>
                                                            </span>
                                                                </Label>
                                                            </FormGroup>
                                                        </Col>
                                                    </Row>
                                                    {/**** prior ****/}
                                                    <Row>
                                                        <Col md="12">
                                                            <FormGroup check>
                                                                <Label check>
                                                                    <Input
                                                                        defaultChecked={document.prior}
                                                                        type="checkbox"
                                                                        disabled={parseInt( document.status ) >= 11}
                                                                        onChange={( e ) => {
                                                                            setDocument( {
                                                                                ...document,
                                                                                prior: e.target.checked
                                                                            } );
                                                                            document.prior = e.target.checked;
                                                                            _updateSendingOptions();
                                                                        }}
                                                                    />{' '}
                                                                    <span className={`form-check-sign`}>
                                                                <span
                                                                    className="check"> {label.mail.label29} </span>
                                                            </span>
                                                                </Label>
                                                            </FormGroup>
                                                        </Col>
                                                    </Row>

                                                </Col>
                                                <Col md={6}>
                                                    {/* GET COST */}
                                                    {!isNil( document ) && document.status
                                                    && parseInt( document.status ) >= 0 && parseInt( document.status ) < 11 ? (
                                                        <>
                                                            <h4>{label.mail.label22}</h4>
                                                            <strong>{totalCost.totalPriceExVat} € </strong>
                                                        </>
                                                    ) : null}
                                                </Col>
                                            </Row>
                                        </TabPane>

                                        <TabPane tabId="showMail">

                                            {/**** PREVIEW DOCUMENT ****/}
                                            {horizontalTabs === 'showMail' ? (
                                                <Row>
                                                    <Col>
                                                        <MailPostBirdGenerator
                                                            showMessage={showMessage}
                                                            documentId={documentIdRef.current}
                                                            label={label}
                                                        />
                                                    </Col>
                                                </Row>
                                            ) : null}
                                        </TabPane>
                                    </TabContent>
                                    <Table>
                                        <tr>
                                            <th>#</th>
                                            {/* street and number*/}
                                            <th>{label.mail.label3}</th>
                                            {/* city */}
                                            <th>{label.mail.label5}</th>
                                            {/* status */}
                                            <th>{label.mail.label7}</th>
                                            {/* date */}
                                            <th>{label.mail.label8}</th>
                                        </tr>
                                        <tbody>

                                        <tr>
                                            <td>
                                                {document.documentName}
                                            </td>
                                            <td>
                                                {document.streetAndNumber}
                                            </td>
                                            <td>
                                                {document.city}
                                            </td>
                                            <td>
                                                {getStatusPostBird( document.status, label )}
                                            </td>
                                            <td>
                                                {getDate( document.creDate )}
                                            </td>
                                        </tr>
                                        </tbody>
                                    </Table>
                                </>
                            ) : null}
                        </Col>
                    </Row>
                </ModalBody>
                <ModalFooter>
                    <Button color="default"
                            onClick={()=>openPostMail('BE')}>{label.common.close}</Button>
                    <Col>
                        {/*{ ONLY TO SEND }*/}
                        {!isNil( document )
                        && (!isNil( document.status ) && parseInt( document.status ) >= 8) ? (
                            <Button color="primary" type="button" className="float-right margin-left-10"
                                //9 = await , >= 11 payment ok
                                    disabled={(parseInt( document.status ) === 9
                                        || parseInt( document.status ) >= 11)}
                                //disabled={(isNil( document ) || parseInt( document.status ) > 12 || parseInt( document.status ) >= 8)
                                    onClick={_sendDocument}
                            >
                                {isLoading ? (
                                    <Spinner
                                        size="sm"
                                        color="secondary"
                                    />
                                ) : null}
                                {' '} {label.common.send}
                            </Button>
                        ) : null}

                        {/* display once the document is send , address ok */}
                        {/* confirm address { ONLY FOR ADDRESS}*/}
                        {!isNil( document ) && (!isNil( document.status )
                            && parseInt( document.status ) >= 6
                            && parseInt( document.status ) < 11) ? (
                            <Button color="default" type="button" className="float-right"
                                    onClick={_updateAddress}
                                    disabled={isNil( document ) || isLoading}
                            >
                                {isLoading ? (
                                    <Spinner
                                        size="sm"
                                        color="secondary"
                                    />
                                ) : null}
                                {' '}
                                {/* > 8 address is ok so update and not confirm
                                 if < 8 ? you can confirm address : update address*/}
                                {parseInt( document.status ) < 8 ? label.mail.confirmAddress : label.mail.updateAddress}
                            </Button>
                        ) : null}

                    </Col>
                </ModalFooter>
            </Modal>
        </>
    );
}

