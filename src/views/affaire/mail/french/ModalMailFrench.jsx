import React, { useEffect, useRef, useState } from 'react';
import {
    Button,
    Col,
    FormGroup,
    FormText,
    Input,
    Label,
    ListGroup,
    ListGroupItem,
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
    TabPane
} from 'reactstrap';
import { useAuth0 } from '@auth0/auth0-react';
import Select from 'react-select';
import ItemDTO from '../../../../model/ItemDTO';
import PriceDetail from '../../../../model/postbird/PriceDetail';
import ReactLoading from 'react-loading';
import classnames from 'classnames';
import { getAffairesByVcUserIdAndSearchCriteria, getDossierById } from '../../../../services/DossierService';
import DossierDTO from '../../../../model/affaire/DossierDTO';
import { getClient, getClientById } from '../../../../services/ClientService';
import ContactSummary from '../../../../model/client/ContactSummary';
import AsyncCreatableSelect from 'react-select/async-creatable';
import DocumentFrenchDTO from '../../../../model/postbird/DocumentFrenchDTO';
import {
    addDocument,
    createDraft,
    getAddressRecipient,
    getAllDocument,
    getCountryCodes,
    getDocumentByDefault,
    getTotalCost,
    payDocument,
    saveAddressEnvelope,
    updateAddressEnvelope,
    updateEnvelope
} from '../../../../services/LaPosteFrenchService';
import PdfUpload from '../../../../components/CustomUpload/PdfUpload';
import AddressRecipientDTO from '../../../../model/postbird/AddressRecipientDTO';
import { validatePostFrench } from '../../../../utils/Utils';
import MailLaPosteGenerator from './MailLaPosteGenerator';
import AsyncSelect from 'react-select/async';

const isNil = require( 'lodash/isNil' );
const map = require( 'lodash/map' );
const isEmpty = require( 'lodash/isEmpty' );
const padStart = require( 'lodash/padStart' );
const upperCase = require( 'lodash/upperCase' );

export default function ModalMailFrench( {
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
    const [addressRecipient, setAddressRecipient] = useState( null );
    const [countryList, setCountryList] = useState( [] );
    const [isLoading, setIsLoading] = useState( false );
    const [totalCost, setTotalCost] = useState( 0 );
    const [horizontalTabs, setHorizontalTabs] = useState( 'addressSender' );
    const [dossierItem, setDossierItem] = useState( null );
    const [updateDossierDisable, setUpdateDossierDisable] = useState( false );
    const dossierRef = useRef( null );
    // use for timer
    const documentIdRef = useRef( documentId );
    const clientSelectedSender = useRef( null );
    const clientSelectedRecipent = useRef( null );

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
                let documentTmp = null;
                getAllDocument( accessToken, documentIdRef.current, async ( dataDocument ) => {
                        documentTmp = new DocumentFrenchDTO( dataDocument );
                        map( countriesCode, country => {
                            if ( country.value === upperCase( documentTmp.countryCode ) ) {
                                documentTmp.senderCountryCode = new ItemDTO( {
                                    value: country.name,
                                    label: country.label
                                } );
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
                        clientSelectedSender.current = new ItemDTO( {
                            value: documentTmp.companySender,
                            label: documentTmp.companySender,
                            isDefault: documentTmp.companySender
                        } );
                        setDocument( documentTmp );

                        _getCost( documentTmp );

                    },
                    ( dataAddress ) => {
                        setAddressRecipient( dataAddress );
                    } );
            } else {
                let resultDocumentByDefault = await getDocumentByDefault( accessToken );
                if ( resultDocumentByDefault.data ) {
                    setDocument( new DocumentFrenchDTO( resultDocumentByDefault.data ) );
                }
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

        }
    };

    const _payEnvelope = async () => {
        setIsLoading( true );
        const accessToken = await getAccessTokenSilently();

        const result = await payDocument( accessToken, documentIdRef.current );

        if ( !result.error ) {
            const documentTmp = new DocumentFrenchDTO( result.data );
            clientSelectedRecipent.current = new ItemDTO( {
                value: documentTmp.recipientName,
                label: documentTmp.recipientName,
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
    const _saveEnvelope = async () => {
        setIsLoading( true );
        const accessToken = await getAccessTokenSilently();

        if ( !validatePostFrench( document.postalCodeSender ) ) {
            showMessage( label.mail.error5, 'danger' );
            setIsLoading( false );
            return;
        }

        let documentTmp;

        if ( !isNil( dossierItem) ) {
            document.dossierId = dossierItem.value;
        }

        if ( !isNil( dossierRef.current ) ) {
            document.dossierPath = dossierRef.current ;
        }

        // create draft
        if ( isNil( documentId ) ) {
            const resultDraft = await createDraft( accessToken, document );

            if ( resultDraft.data ) {
                showMessage( label.mail.success1, 'primary' );
                documentTmp = new DocumentFrenchDTO( resultDraft.data );

                documentIdRef.current = documentTmp.documentId;
                setDocument( documentTmp );
            }
        } else {
            const resultUpdate = await updateEnvelope( accessToken, documentIdRef.current, document );

            if ( resultUpdate.data ) {
                showMessage( label.mail.success1, 'primary' );
                documentTmp = new DocumentFrenchDTO( resultUpdate.data );
                setDocument( documentTmp );
            }
        }
        _getCost( documentTmp );
        updateList();

        setIsLoading( false );
    };

    const _updateAddressRecipientEnvelope = async () => {
        setIsLoading( true );
        const accessToken = await getAccessTokenSilently();

        if ( !validatePostFrench( document.postalCodeSender ) ) {
            showMessage( label.mail.error5, 'error' );
            setIsLoading( false );
            return;
        }

        // create draft
        if ( isNil( addressRecipient ) || isNil( addressRecipient.recipientId ) ) {
            const resultAdded = await saveAddressEnvelope( accessToken, documentIdRef.current, addressRecipient );

            if ( resultAdded.data ) {
                showMessage( label.mail.success1, 'primary' );
                setAddressRecipient( new AddressRecipientDTO( resultAdded.data ) );
            }
        } else {
            const resultUpdate = await updateAddressEnvelope( accessToken, documentIdRef.current, addressRecipient.recipientId, addressRecipient );

            if ( resultUpdate.data ) {
                showMessage( label.mail.success1, 'primary' );
                setAddressRecipient( new AddressRecipientDTO( resultUpdate.data ) );
            }
        }

        setIsLoading( false );
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
        clientSelectedRecipent.current = newValue;

        if ( !isNil( newValue ) ) {
            let addressTmp = new AddressRecipientDTO( addressRecipient );
            const accessToken = await getAccessTokenSilently();
            let result = await getClientById( accessToken, newValue.value );
            // retrieve client
            if ( !isNil( result.data ) && !isEmpty( result.data ) ) {
                let clientResult = new ContactSummary( result.data, label );
                // get the existing
                if ( isEmpty( document.streetAndNumberRecipient ) ) {
                    addressTmp.streetAndNumberRecipient = clientResult.address;
                }
                if ( isEmpty( document.postalCodeRecipient ) ) {
                    addressTmp.postalCodeRecipient = clientResult.cp;
                }
                if ( isEmpty( document.cityRecipient ) ) {
                    addressTmp.cityRecipient = clientResult.city;
                }
                clientSelectedRecipent.current = new ItemDTO( {
                    value: clientResult.id,
                    label: clientResult.fullName,
                    isDefault: clientResult.email
                } );
                addressTmp.addressLine2 = `${!isNil( clientResult.titleItem ) ? clientResult.titleItem.label : ''} ${clientResult.firstname} ${clientResult.lastname}`;
            } else {
                clientSelectedRecipent.current = newValue;
            }
            addressTmp.companyRecipient = newValue.label;
            setAddressRecipient( addressTmp );
        } else {
            clientSelectedRecipent.current = null;
            setDocument( {
                ...document,
                companyRecipient: null
            } );
        }

    };
    const _handleSenderChange = async ( newValue ) => {
        clientSelectedSender.current = newValue;

        if ( !isNil( newValue ) ) {
            let documentTmp = new DocumentFrenchDTO( document );
            const accessToken = await getAccessTokenSilently();
            let result = await getClientById( accessToken, newValue.value );
            // retrieve client
            if ( !isNil( result.data ) && !isEmpty( result.data ) ) {
                let clientResult = new ContactSummary( result.data, label );
                // get the existing
                if ( isEmpty( document.streetAndNumberSender ) ) {
                    documentTmp.streetAndNumberSender = clientResult.address;
                }
                if ( isEmpty( document.postalCodeSender ) ) {
                    documentTmp.postalCodeSender = clientResult.cp;

                }
                if ( isEmpty( document.citySender ) ) {
                    documentTmp.citySender = clientResult.city;
                }
                clientSelectedSender.current = new ItemDTO( {
                    value: clientResult.id,
                    label: clientResult.fullName,
                    isDefault: clientResult.email
                } );
            } else {
                clientSelectedSender.current = newValue;
            }
            documentTmp.companySender = newValue.label;
            setDocument( documentTmp );
        } else {
            clientSelectedSender.current = null;
            setDocument( {
                ...document,
                companySender: null
            } );
        }

    };
    const changeActiveTab = async ( e, tabState, tadName ) => {
        if ( !isNil( e ) ) {
            e.preventDefault();
        }

        if ( tadName === 'addressRecipient' ) {
            const accessToken = await getAccessTokenSilently();
            let result = await getAddressRecipient( accessToken, documentIdRef.current );

            if ( result.data ) {
                const addressRecipientDTO = new AddressRecipientDTO( result.data );
                clientSelectedRecipent.current = new ItemDTO( {
                    value: addressRecipientDTO.companyRecipient,
                    label: addressRecipientDTO.companyRecipient,
                    isDefault: addressRecipientDTO.companyRecipient
                } );
                setAddressRecipient( addressRecipientDTO );
            }
        }
        if ( tabState === 'horizontalTabs' ) {
            setHorizontalTabs( tadName );
        }
    };

    const _uploadDocument = async ( file ) => {
        setIsLoading( true );
        let data = new FormData();
        data.append( 'files', file );
        if ( !isNil( dossierItem ) ) {
            data.append( 'dossierId', dossierItem.value );
        }
        if ( !isNil( dossierRef.current ) ) {
            data.append( 'dossierPath', dossierRef.current );
        }
        const accessToken = await getAccessTokenSilently();

        changeActiveTab( null, 'horizontalTabs', 'addressSender' );
        // check if it's ok
        // if not show document
        // or display cost
        const result = await addDocument( accessToken, documentIdRef.current, data );

        if ( result.data ) {
            showMessage( label.mail.french.success1, 'primary' );

            const doc = new DocumentFrenchDTO( result.data );
            setDocument( doc );
            setUpdateDossierDisable( !updateDossierDisable );
            updateList();
        } else {
            showMessage( label.mail.french.error1, 'danger' );

        }

        setIsLoading( false );
    };
    return (
        <>
            <Modal size="lg" isOpen={modalPostMailDisplay} toggle={() => openPostMail( 'FR' )}>
                <ModalHeader tag={'h4'} toggle={() => openPostMail( 'FR' )}>
                    {label.mail.french.title}
                </ModalHeader>
                <ModalBody>
                    {isNil( document ) && !isNil( documentId ) ? (
                        <ReactLoading className="loading" height={'20%'} width={'20%'}/>
                    ) : (
                        <>
                            {isNil( dossierId ) ? (
                                <Row>
                                    <Col md={12}>
                                        {/*<!-- dossier , once registered not updatable -->*/}
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
                                                    isDisabled={!isNil(document) && !isNil(document.status)}
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
                            <Row>
                                <Col md={6}>
                                    <ListGroup>
                                        <ListGroupItem className="justify-content-between padding-list">
                                            {!isNil( document ) && !isNil( document.documentId ) ? (
                                                <i className="tim-icons icon-check-2 green"/>
                                            ) : (
                                                <i className="tim-icons icon-simple-remove red"/>
                                            )}{' '}
                                            {label.mail.french.check1}
                                        </ListGroupItem>
                                        <ListGroupItem className="justify-content-between padding-list">
                                            {!isNil( document ) && !isNil( document.documentAttachmentId ) ? (
                                                <i className="tim-icons icon-check-2 green"/>
                                            ) : (
                                                <i className="tim-icons icon-simple-remove red"/>
                                            )}{' '}
                                            {label.mail.french.check2}
                                        </ListGroupItem>
                                        <ListGroupItem className="justify-content-between padding-list">
                                            { !isNil( addressRecipient ) && !isEmpty( addressRecipient.cityRecipient ) ? (
                                                <i className="tim-icons icon-check-2 green"/>
                                            ) : (
                                                <i className="tim-icons icon-simple-remove red"/>
                                            )}{' '}
                                            {label.mail.french.check3}{' '}
                                        </ListGroupItem>
                                    </ListGroup>
                                </Col>
                                <Col md={6}>
                                    {/* GET COST */}
                                    {!isNil( document ) && !isNil( totalCost ) ? (
                                        <>
                                            <h4>{label.mail.label22}</h4>
                                            <strong>{totalCost.totalPriceExVat} € </strong>
                                        </>
                                    ) : null}
                                </Col>
                            </Row>
                            <Row>
                                <Col md={10}>
                                    <Nav className="nav-pills-info" pills>
                                        <NavItem>
                                            <NavLink
                                                data-toggle="tab"
                                                href="#opt"
                                                className={
                                                    horizontalTabs === 'addressSender'
                                                        ? 'active'
                                                        : ''
                                                }
                                                onClick={e =>
                                                    changeActiveTab( e, 'horizontalTabs', 'addressSender' )
                                                }
                                            >
                                                {label.mail.french.address}
                                            </NavLink>
                                        </NavItem>
                                        <NavItem>
                                            <NavLink
                                                data-toggle="tab"
                                                href="#doc"
                                                disabled={!isNil( document ) && isNil( document.status )}
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
                                                href="#doc"
                                                disabled={!isNil( document ) && isNil( document.status )}
                                                className={
                                                    horizontalTabs === 'document'
                                                        ? 'active'
                                                        : ''
                                                }
                                                onClick={e =>
                                                    changeActiveTab( e, 'horizontalTabs', 'document' )
                                                }
                                            >
                                                {!isNil( document ) && !isNil( document.documentAttachmentId ) ?
                                                    // preview
                                                    label.mail.label35 :
                                                    // upload
                                                    label.mail.french.document
                                                }
                                                {}
                                            </NavLink>
                                        </NavItem>
                                        <NavItem>
                                            <NavLink
                                                data-toggle="tab"
                                                href="#sm"
                                                disabled={!isNil( document ) && isNil( document.status )}
                                                className={
                                                    horizontalTabs === 'addressRecipient'
                                                        ? 'active'
                                                        : ''
                                                }
                                                onClick={e =>
                                                    changeActiveTab( e, 'horizontalTabs', 'addressRecipient' )
                                                }
                                            >
                                                {label.mail.french.addressRecipient}
                                            </NavLink>
                                        </NavItem>
                                    </Nav>
                                </Col>
                            </Row>
                            {!isNil( document ) ? (
                                <TabContent
                                    className="tab-space no-padding"
                                    activeTab={horizontalTabs}
                                >
                                    <TabPane tabId="addressSender">
                                        <Row>
                                            <Col>
                                                {!isNil( document )
                                                && ((!isNil( document.status ) && document.status === 'DRAFT') || isNil( document.status )) ? (
                                                    <Button color="primary" type="button"
                                                            className="float-right margin-left-10"
                                                            onClick={_saveEnvelope}
                                                    >
                                                        {isLoading ? (
                                                            <Spinner
                                                                size="sm"
                                                                color="secondary"
                                                            />
                                                        ) : null}
                                                        {' '} {label.common.save}
                                                    </Button>
                                                ) : null}

                                            </Col>
                                            <Col md={12}>
                                                <>
                                                    {/* recipientName */}
                                                    <FormGroup row className={classnames( {
                                                        'has-danger': isEmpty( document.companySender )
                                                    } )}>
                                                        <Label for="companySender"
                                                               sm={4}>{label.mail.french.label1}</Label>
                                                        <Col sm={8} md={8} lg={8} xl={8}>
                                                            <AsyncCreatableSelect
                                                                value={clientSelectedSender.current}
                                                                className="react-select info"
                                                                classNamePrefix="react-select"
                                                                cacheOptions
                                                                isClearable={true}
                                                                create
                                                                type="email"
                                                                placeholder={label.mail.french.label1}
                                                                id="companySender"
                                                                name="companySender"
                                                                loadOptions={_loadClientOptions}
                                                                defaultOptions
                                                                onChange={_handleSenderChange}
                                                            />
                                                        </Col>
                                                    </FormGroup>
                                                    {/* streetAndNumber */}
                                                    <FormGroup row className={classnames( {
                                                        'has-danger': isEmpty( document.streetAndNumberSender )
                                                    } )}>
                                                        <Label for="streetAndNumberSender"
                                                               sm={4}>{label.mail.label3}</Label>
                                                        <Col sm={8} md={8} lg={8} xl={8}>
                                                            <Input
                                                                onChange={( e ) => setDocument( {
                                                                    ...document,
                                                                    streetAndNumberSender: e.target.value
                                                                } )}
                                                                disabled={(!isNil( document.status ) && document.status !== 'DRAFT')}
                                                                id="streetAndNumberSender"
                                                                value={document.streetAndNumberSender}
                                                                name="streetAndNumberSender"
                                                                className="form-control"
                                                                type="text"
                                                                placeholder={label.mail.label3}
                                                            />
                                                        </Col>
                                                    </FormGroup>
                                                    {/* postalCode */}
                                                    <FormGroup row className={classnames( {
                                                        'has-danger': isEmpty( document.postalCodeSender ) || !validatePostFrench( document.postalCodeSender )
                                                    } )}>
                                                        <Label for="postalCodeSender" sm={4}>{label.mail.label4}</Label>
                                                        <Col sm={8} md={8} lg={8} xl={8}>
                                                            <Input
                                                                maxLength={5}
                                                                pattern="/^\d{5}$/"
                                                                id="postalCodeSender"
                                                                onChange={( e ) => setDocument( {
                                                                    ...document,
                                                                    postalCodeSender: e.target.value
                                                                } )}
                                                                disabled={(!isNil( document.status ) && document.status !== 'DRAFT')}
                                                                name="postalCodeSender"
                                                                className="form-control"
                                                                type="text"
                                                                value={document.postalCodeSender}
                                                                placeholder={label.mail.label4}
                                                            />
                                                            <FormText>{label.mail.error5}</FormText>
                                                        </Col>
                                                    </FormGroup>
                                                    {/* city */}
                                                    <FormGroup row className={classnames( {
                                                        'has-danger': isEmpty( document.citySender )
                                                    } )}>
                                                        <Label for="citySender" sm={4}>{label.mail.label5}</Label>
                                                        <Col sm={8} md={8} lg={8} xl={8}>
                                                            <Input
                                                                id="citySender"
                                                                onChange={( e ) => setDocument( {
                                                                    ...document,
                                                                    citySender: e.target.value
                                                                } )}
                                                                disabled={(!isNil( document.status ) && document.status !== 'DRAFT')}
                                                                name="citySender"
                                                                className="form-control"
                                                                type="text"
                                                                value={document.citySender}
                                                                placeholder={label.mail.label5}
                                                            />
                                                        </Col>
                                                    </FormGroup>
                                                    {/* countryCode */}
                                                    <FormGroup row>
                                                        <Label for="countryCodeItemSender"
                                                               sm={4}>{label.mail.label6}</Label>
                                                        <Col sm={8} md={8} lg={8} xl={8}>
                                                            <Select
                                                                onChange={( value ) => setDocument( {
                                                                    ...document,
                                                                    senderCountryCodeSender: value.value,
                                                                    countryCodeItemSender: value
                                                                } )}
                                                                disabled={(!isNil( document.status ) && document.status !== 'DRAFT')}
                                                                value={document.countryCodeItemSender}
                                                                name="countryCodeItemSender"
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
                                                                        checked={document.optionalAddressSheet === true}
                                                                        disabled={(!isNil( document.status ) && document.status !== 'DRAFT')}
                                                                        defaultValue="option1"
                                                                        id="addAddressPage1"
                                                                        name="addAddressPage1"
                                                                        type="radio"
                                                                        onChange={( e ) => setDocument( {
                                                                            ...document,
                                                                            optionalAddressSheet: true
                                                                        } )}
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
                                                                        checked={document.optionalAddressSheet === false}
                                                                        disabled={(!isNil( document.status ) && document.status !== 'DRAFT')}
                                                                        defaultValue="option2"
                                                                        id="overWriteAddressField2"
                                                                        name="overWriteAddressField2"
                                                                        type="radio"
                                                                        onChange={( e ) => setDocument( {
                                                                            ...document,
                                                                            optionalAddressSheet: false
                                                                        } )}
                                                                    />
                                                                    <span className="form-check-sign"/>
                                                                    {label.mail.choice2}
                                                                </Label>
                                                            </FormGroup>

                                                        </Col>
                                                    </Row>
                                                </>
                                            </Col>
                                        </Row>
                                    </TabPane>
                                    {/**** SENDING OPTION ****/}
                                    <TabPane tabId="sendOptions">
                                        {horizontalTabs === 'sendOptions' ? (
                                            <Row>
                                                <Col md={6}>
                                                    {/**** color ****/}
                                                    <Row>
                                                        <Col md="12">
                                                            <FormGroup check>
                                                                <Label check>
                                                                    <Input
                                                                        disabled={document.status !== 'DRAFT'}
                                                                        defaultChecked={document.color}
                                                                        type="checkbox"
                                                                        onChange={( e ) => {
                                                                            setDocument( {
                                                                                ...document,
                                                                                color: e.target.checked
                                                                            } );
                                                                            document.color = e.target.checked;
                                                                            _saveEnvelope();
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
                                                                        disabled={document.status !== 'DRAFT'}
                                                                        type="checkbox"
                                                                        onChange={( e ) => {
                                                                            setDocument( {
                                                                                ...document,
                                                                                twoSided: e.target.checked
                                                                            } );
                                                                            document.twoSided = e.target.checked;
                                                                            _saveEnvelope();
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
                                                    {/**** prior ****/}
                                                    <Row>
                                                        <Col md="12">
                                                            <FormGroup check>
                                                                <Label check>
                                                                    <Input
                                                                        defaultChecked={document.prior}
                                                                        type="checkbox"
                                                                        disabled={document.status !== 'DRAFT'}
                                                                        onChange={( e ) => {
                                                                            setDocument( {
                                                                                ...document,
                                                                                prior: e.target.checked
                                                                            } );
                                                                            document.prior = e.target.checked;
                                                                            _saveEnvelope();
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

                                            </Row>
                                        ) : null}

                                    </TabPane>
                                    <TabPane tabId="document">
                                        {horizontalTabs === 'document' ? (
                                            <Row>
                                                <Col>
                                                    {isNil( document.documentAttachmentId ) ? (
                                                        <Row>
                                                            <PdfUpload
                                                                isLoading={isLoading}
                                                                saveFile={_uploadDocument}
                                                                avatar={null}/>
                                                        </Row>
                                                    ) : (
                                                        <Row>
                                                            {/**** PREVIEW DOCUMENT ****/}
                                                            <Col>
                                                                <MailLaPosteGenerator
                                                                    showMessage={showMessage}
                                                                    documentId={documentIdRef.current}
                                                                    label={label}
                                                                />
                                                            </Col>
                                                        </Row>
                                                    )}
                                                </Col>
                                            </Row>
                                        ) : null}
                                    </TabPane>
                                    <TabPane tabId="addressRecipient">
                                        {horizontalTabs === 'addressRecipient' ? (
                                            <Row>
                                                <Col>
                                                    {!isNil( document )
                                                    && ((!isNil( document.status ) && document.status === 'DRAFT') || isNil( document.status )) ? (
                                                        <Button color="primary" type="button"
                                                                className="float-right margin-left-10"
                                                                onClick={_updateAddressRecipientEnvelope}
                                                        >
                                                            {isLoading ? (
                                                                <Spinner
                                                                    size="sm"
                                                                    color="secondary"
                                                                />
                                                            ) : null}
                                                            {' '} {label.common.save}
                                                        </Button>
                                                    ) : null}

                                                </Col>
                                                <Col md={12}>
                                                    <>
                                                        {/* recipientName */}
                                                        <FormGroup row className={classnames( {
                                                            'has-danger': isEmpty( addressRecipient.companyRecipient )
                                                        } )}>
                                                            <Label for="companyRecipient"
                                                                   sm={4}>{label.mail.french.label1}</Label>
                                                            <Col sm={8} md={8} lg={8} xl={8}>
                                                                <AsyncCreatableSelect
                                                                    value={clientSelectedRecipent.current}
                                                                    className="react-select info"
                                                                    classNamePrefix="react-select"
                                                                    cacheOptions
                                                                    isClearable={true}
                                                                    create
                                                                    type="email"
                                                                    placeholder={label.mail.french.label1}
                                                                    id="companyRecipient"
                                                                    name="companyRecipient"
                                                                    loadOptions={_loadClientOptions}
                                                                    defaultOptions
                                                                    onChange={_handleRecipientChange}
                                                                />
                                                            </Col>
                                                        </FormGroup>
                                                        {/* addressLine2 */}
                                                        <FormGroup row className={classnames( {
                                                            'has-danger': isEmpty( addressRecipient.addressLine2 )
                                                        } )}>
                                                            <Label for="addressLine2"
                                                                   sm={4}>{label.mail.french.label2}</Label>
                                                            <Col sm={8} md={8} lg={8} xl={8}>
                                                                <Input
                                                                    onChange={( e ) => setAddressRecipient( {
                                                                        ...addressRecipient,
                                                                        addressLine2: e.target.value
                                                                    } )}
                                                                    disabled={document.status !== 'DRAFT'}
                                                                    id="addressLine2"
                                                                    value={addressRecipient.addressLine2}
                                                                    name="addressLine2"
                                                                    className="form-control"
                                                                    type="text"
                                                                    placeholder={label.mail.french.label2}
                                                                />
                                                            </Col>
                                                        </FormGroup>
                                                        {/* streetAndNumber */}
                                                        <FormGroup row className={classnames( {
                                                            'has-danger': isEmpty( addressRecipient.streetAndNumberRecipient )
                                                        } )}>
                                                            <Label for="streetAndNumberSender"
                                                                   sm={4}>{label.mail.label3}</Label>
                                                            <Col sm={8} md={8} lg={8} xl={8}>
                                                                <Input
                                                                    onChange={( e ) => setAddressRecipient( {
                                                                        ...addressRecipient,
                                                                        streetAndNumberRecipient: e.target.value
                                                                    } )}
                                                                    disabled={document.status !== 'DRAFT'}
                                                                    id="streetAndNumberSender"
                                                                    value={addressRecipient.streetAndNumberRecipient}
                                                                    name="streetAndNumberSender"
                                                                    className="form-control"
                                                                    type="text"
                                                                    placeholder={label.mail.label3}
                                                                />
                                                            </Col>
                                                        </FormGroup>
                                                        {/* postalCode */}
                                                        <FormGroup row className={classnames( {
                                                            'has-danger': isEmpty( addressRecipient.postalCodeRecipient ) || !validatePostFrench( addressRecipient.postalCodeRecipient )
                                                        } )}>
                                                            <Label for="postalCodeRecipient"
                                                                   sm={4}>{label.mail.label4}</Label>
                                                            <Col sm={8} md={8} lg={8} xl={8}>
                                                                <Input
                                                                    maxLength={5}
                                                                    pattern="/^\d{5}$/"
                                                                    id="postalCodeRecipient"
                                                                    onChange={( e ) => setAddressRecipient( {
                                                                        ...addressRecipient,
                                                                        postalCodeRecipient: e.target.value
                                                                    } )}
                                                                    disabled={document.status !== 'DRAFT'}
                                                                    name="postalCodeRecipient"
                                                                    className="form-control"
                                                                    type="text"
                                                                    value={addressRecipient.postalCodeRecipient}
                                                                    placeholder={label.mail.label4}
                                                                />
                                                                <FormText>{label.mail.error5}</FormText>
                                                            </Col>
                                                        </FormGroup>
                                                        {/* city */}
                                                        <FormGroup row className={classnames( {
                                                            'has-danger': isEmpty( addressRecipient.cityRecipient )
                                                        } )}>
                                                            <Label for="cityRecipient"
                                                                   sm={4}>{label.mail.label5}</Label>
                                                            <Col sm={8} md={8} lg={8} xl={8}>
                                                                <Input
                                                                    id="cityRecipient"
                                                                    onChange={( e ) => setAddressRecipient( {
                                                                        ...addressRecipient,
                                                                        cityRecipient: e.target.value
                                                                    } )}
                                                                    disabled={document.status !== 'DRAFT'}
                                                                    name="cityRecipient"
                                                                    className="form-control"
                                                                    type="text"
                                                                    value={addressRecipient.cityRecipient}
                                                                    placeholder={label.mail.label5}
                                                                />
                                                            </Col>
                                                        </FormGroup>
                                                        {/* countryCode */}
                                                        <FormGroup row>
                                                            <Label for="senderCountryCodeRecipient"
                                                                   sm={4}>{label.mail.label6}</Label>
                                                            <Col sm={8} md={8} lg={8} xl={8}>
                                                                <Select
                                                                    onChange={( value ) => setAddressRecipient( {
                                                                        ...addressRecipient,
                                                                        senderCountryCodeRecipient: value.value,
                                                                        countryCodeItemRecipient: value
                                                                    } )}
                                                                    isDisabled={document.status !== 'DRAFT'}
                                                                    value={addressRecipient.countryCodeItemRecipient}
                                                                    name="senderCountryCodeRecipient"
                                                                    options={countryList}
                                                                />
                                                            </Col>
                                                        </FormGroup>
                                                    </>

                                                </Col>
                                            </Row>
                                        ) : null}
                                    </TabPane>
                                </TabContent>
                            ) : null}
                        </>
                    )}

                </ModalBody>
                <ModalFooter className="text-align-right">
                    <Button color="default" className="float-right margin-left-10"
                            onClick={() => openPostMail( 'FR' )}>{label.common.close}</Button>
                    {/*{ ONLY TO SEND }*/}
                    {!isNil( document )
                    && !isNil( document.status ) && document.status === 'DRAFT' && !isNil( document.documentAttachmentId ) && !isNil( addressRecipient ) && !isNil( addressRecipient.cityRecipient ) ? (
                        <Button color="primary" type="button" className="float-right margin-left-10"
                                onClick={_payEnvelope}
                        >
                            {isLoading ? (
                                <Spinner
                                    size="sm"
                                    color="secondary"
                                />
                            ) : null}
                            {' '} {label.common.send}
                        </Button>
                    ) : (
                        <FormGroup>
                            <Button color="primary" type="button"
                                    disabled={true}
                            >
                                {' '} {label.common.send}
                            </Button>
                            <FormText
                            >{label.mail.french.condition}</FormText>
                        </FormGroup>
                    )
                    }

                </ModalFooter>
            </Modal>
        </>
    );
}

