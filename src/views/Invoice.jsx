import React, { useEffect, useRef, useState } from 'react';
// reactstrap components
import {
    Button,
    ButtonGroup,
    Card,
    CardBody,
    CardHeader,
    CardTitle,
    Col,
    Form,
    FormGroup,
    Input,
    InputGroup,
    InputGroupAddon,
    InputGroupText,
    Label,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Row,
    Spinner
} from 'reactstrap';
import NotificationAlert from 'react-notification-alert';
import Select from 'react-select';
import AsyncSelect from 'react-select/async';
import { getOptionNotification } from '../utils/AlertUtils';
import InvoiceGenerator from '../components/Invoice/InvoiceGenerator';
import { getAffairesByVcUserIdAndSearchCriteria, getDossierById } from '../services/DossierService';
import ItemDTO from '../model/ItemDTO';
import { useAuth0 } from '@auth0/auth0-react';
import InvoiceDTO from '../model/invoice/InvoiceDTO';
import {
    createInvoice,
    deleteInvoiceById,
    generateInvoiceValid,
    getDefaultInvoice,
    getInvoiceById,
    updateInvoice,
    validateInvoice
} from '../services/InvoiceService';
import ReactLoading from 'react-loading';
import { getClient, getClientById } from '../services/ClientService';
import { getFactureEcheances, getFacturesTypes, getPostes, getVats } from '../services/SearchService';
import InvoiceDetailsDTO from '../model/invoice/InvoiceDetailsDTO';
import DossierDTO from '../model/affaire/DossierDTO';
import moment from 'moment';
import 'moment/locale/fr';
import DatePicker from 'react-datepicker';
import ReactBSAlert from 'react-bootstrap-sweetalert';
import { RegisterClientModal } from '../components/client/RegisterClientModal';
import ModalCheckSessionDrive from './popup/drive/ModalCheckSessionDrive';
import ModalEMailSign from './affaire/mail/recommande/ModalEMailSign';
import { checkPaymentActivated } from '../services/PaymentServices';
import ModalNoActivePayment from './affaire/popup/ModalNoActivePayment';
import { Link, withRouter } from 'react-router-dom';
import VisibilityIcon from '@material-ui/icons/Visibility';
import PrestationInvoiceTable from './invoice/PrestationInvoiceTable';
import FraisAdminInvoiceTable from './invoice/FraisAdminInvoiceTable';
import DeboursInvoiceTable from './invoice/DeboursInvoiceTable';
import FraisCollaborationInvoiceTable from './invoice/FraisCollaborationInvoiceTable';
import { b64toBlob, downloadBlob } from '../utils/TableUtils';

const maxBy = require( 'lodash/maxBy' );
const forEach = require( 'lodash/forEach' );
const map = require( 'lodash/map' );
const find = require( 'lodash/find' );
const remove = require( 'lodash/remove' );
const round = require( 'lodash/round' );
const isNil = require( 'lodash/isNil' );
const isEmpty = require( 'lodash/isEmpty' );
const size = require( 'lodash/size' );
const filter = require( 'lodash/filter' );

function Invoice( props ) {

    const notificationAlert = useRef( null );

    const [loadingSave, setLoadingSave] = useState( false );
    const [loadingAnnexe, setLoadingAnnexe] = useState( true );
    const {
        match: { params },
        location: { query },
        label, currency, location, enumRights, userId, history, email,
        fullName,
        language,
        vckeySelected, driveType
    } = props;
    const [deleteAlert, setDeleteAlert] = useState( null );
    const [showInvoice, setShowInvoice] = useState( false );
    const [data, setData] = useState( new InvoiceDTO() );
    const { getAccessTokenSilently } = useAuth0();
    const [openclientModal, setOpenclientModal] = useState( false );
    const [clientModal, setClientModal] = useState( null );
    const [postes, setPostes] = useState( [] );
    const [facturesTypes, setFacturesTypes] = useState( [] );
    const [facturesEcheances, setFacturesEcheances] = useState( [] );
    const [checkTokenDrive, setCheckTokenDrive] = useState( false );
    const [vats, setVats] = useState( [] );
    const [modalEmailDisplay, setModalEmailDisplay] = useState( false );
    const [modalNotPaidSignDocument, setModalNotPaidSignDocument] = useState( false );
    const [sendModal, setSendModal] = useState( false );
    const [invoicePdf, setInvoicePdf] = useState( [] );

    // Annexes
    const [prestationListVisible, setprestationListVisible] = useState( false );
    const [fraisAdminListVisible, setfraisAdminListVisible] = useState( false );
    const [deboursListVisible, setdeboursListVisible] = useState( false );
    const [fraisCollListVisible, setfraisCollListVisible] = useState( false );
    const prestations = useRef( [] );
    const fraisAdmin = useRef( [] );
    const debours = useRef( [] );
    const fraisColl = useRef( [] );

    const isCreated = useRef( !isNil( params.invoiceid ) ? false : true );
    const affaireid = useRef( !isNil( query ) && !isNil( query.affaireId ) ? query.affaireId : null );
    let totalAmount = useRef( 0 );
    let invoiceIdRef = useRef( !isNil( params.invoiceid ) ? params.invoiceid : 0 );

    useEffect( () => {
        (async () => {
            invoiceIdRef.current = !isNil( params.invoiceid ) ? params.invoiceid : 0;
        })();
    }, [params.invoiceid] );

    useEffect( () => {
        (async () => {
            try {
                const accessToken = await getAccessTokenSilently();

                let result;
                if ( !isNil( params.invoiceid ) ) {
                    result = await getInvoiceById( accessToken, params.invoiceid, vckeySelected );
                } else {
                    result = await getDefaultInvoice( accessToken );
                }

                let invoiceSummary;

                if ( !isNil( result ) ) {
                    if ( !isNil( result.data ) && !isEmpty( result.data ) ) {
                        invoiceSummary = new InvoiceDTO( result.data );
                        if ( invoiceSummary.invoiceDetailsDTOList[ 0 ] != null ) {
                            invoiceSummary.invoiceDetailsDTOList[ 0 ].index = size( invoiceSummary.invoiceDetailsDTOList );
                        }
                    } else {
                        props.history.push( { pathname: `/auth/unauthorized/` } );
                    }
                }

                let resltPoste = await getPostes( accessToken, null, null, true );
                let posteData = map( resltPoste.data, poste => {
                    if ( invoiceSummary.posteId === poste.value ) {
                        invoiceSummary.posteItem = new ItemDTO( poste );
                    }
                    return new ItemDTO( poste );
                } );
                setPostes( posteData );

                let resultFacturesTypes = await getFacturesTypes( accessToken, isCreated.current || invoiceSummary.valid !== true );
                let facturesTypesData = map( resultFacturesTypes.data, type => {
                    if ( invoiceSummary.typeId === type.value ) {
                        invoiceSummary.typeItem = new ItemDTO( type );
                    }
                    return new ItemDTO( type );
                } );
                setFacturesTypes( facturesTypesData );

                let resultFacturesEcheances = await getFactureEcheances( accessToken );
                let factureEcheanceData = map( resultFacturesEcheances.data, echeance => {
                    if ( invoiceSummary.echeanceId === echeance.value ) {
                        invoiceSummary.echeanceItem = new ItemDTO( echeance );
                    }
                    return new ItemDTO( echeance );
                } );
                setFacturesEcheances( factureEcheanceData );

                let resultVats = await getVats( accessToken );
                let vatsData = map( resultVats.data, vat => {
                    if ( invoiceSummary.invoiceDetailsDTOList[ 0 ].tva === vat.value ) {
                        invoiceSummary.invoiceDetailsDTOList[ 0 ].tvaItem = new ItemDTO( vat );
                    }
                    return new ItemDTO( vat );
                } );
                setVats( vatsData );

                // get dossier because it's in the url
                if ( !isNil( affaireid.current ) ) {
                    let resultDossier = await getDossierById( accessToken, affaireid.current, vckeySelected );
                    if ( !resultDossier.error && !isNil( resultDossier.data ) && !isEmpty( resultDossier.data ) ) {
                        const dossierDefault = new DossierDTO( resultDossier.data );

                        invoiceSummary.clientId = dossierDefault.idClient;
                        invoiceSummary.clientItem = dossierDefault.client;

                        invoiceSummary.dossierId = dossierDefault.id;
                        invoiceSummary.dossierItem = new ItemDTO( {
                            value: dossierDefault.id,
                            label: dossierDefault.fullnameDossier
                        } );
                    }
                }

                // if no dossier id attached , remove loading because the components are called after dossier id != null
                if ( isNil( invoiceSummary.dossierId ) ) {
                    setLoadingAnnexe( false );
                }

                setData( invoiceSummary );

                // display from creation
                if ( location && location.state && !isNil( location.state.message ) ) {
                    notificationAlert.current.notificationAlert( getOptionNotification( location.state.message, 'primary' ) );
                    props.history.replace( { ...props.history, state: {} } );
                }
                if ( !isNil( driveType ) && driveType === 'dropbox' ) {
                    setCheckTokenDrive( true );
                }
            } catch ( e ) {
                // doesn't work
            }
        })();
    }, [getAccessTokenSilently, params.invoiceid] );

    useEffect( () => {
        (async () => {
            if ( !isNil( data.dossierId ) ) {
                setLoadingAnnexe( true );
            }
        })();
    }, [data.dossierId] );

    const prestationListFunction = ( list ) => {
        if ( size( list ) > 0 ) {
            setprestationListVisible( true );
        } else {
            setprestationListVisible( false );
        }
        prestations.current = list;
        setLoadingAnnexe( false );
    };

    const fraisAdminListFunction = ( list ) => {
        if ( size( list ) > 0 ) {
            setfraisAdminListVisible( true );
        } else {
            setfraisAdminListVisible( false );
        }
        fraisAdmin.current = list;
        setLoadingAnnexe( false );
    };

    const deboursListFunction = ( list ) => {
        if ( size( list ) > 0 ) {
            setdeboursListVisible( true );
        } else {
            setdeboursListVisible( false );
        }
        debours.current = list;
        setLoadingAnnexe( false );
    };

    const fraisCollListFunction = ( list ) => {
        if ( size( list ) > 0 ) {
            setfraisCollListVisible( true );
        } else {
            setfraisCollListVisible( false );
        }
        fraisColl.current = list;
        setLoadingAnnexe( false );
    };

    const _togglePopupCheckSession = ( message, type ) => {
        if ( !isNil( message ) && !isNil( type ) ) {
            notificationAlert.current.notificationAlert( getOptionNotification( message, type ) );
        }
        setCheckTokenDrive( !checkTokenDrive );
    };

    const handleAddDetailClick = () => {
        let detail = new InvoiceDetailsDTO();

        if ( !isNil( data ) && !isNil( data.invoiceDetailsDTOList ) && data.invoiceDetailsDTOList.length !== 0 ) {
            const invoiceDet = maxBy( data.invoiceDetailsDTOList, invoiceDetail => { return invoiceDetail.index; } );
            detail.index = invoiceDet.index + 1;
        } else {
            detail.index = 1;
        }

        let maxVat = size( vats ) - 1;
        detail.tva = vats[ maxVat ].value;
        detail.tvaItem = vats[ maxVat ];

        data.invoiceDetailsDTOList.push( detail );

        setData( {
            ...data,
            invoiceDetailsDTOList: data.invoiceDetailsDTOList
        } );
    };

    const handlesubTotal = ( subTotal ) => {
        let detail = new InvoiceDetailsDTO();

        if ( !isNil( data ) && !isNil( data.invoiceDetailsDTOList ) && data.invoiceDetailsDTOList.length !== 0 ) {
            const invoiceDet = maxBy( data.invoiceDetailsDTOList, invoiceDetail => { return invoiceDetail.index; } );
            detail.index = invoiceDet.index + 1;
        } else {
            detail.index = 1;
        }

        detail.description = subTotal.description;
        detail.montant = subTotal.amount;
        detail.montantHt = subTotal.amount;
        detail.tva = 0;
        detail.tvaItem = vats[ 0 ];

        return detail;

    };

    const handlesubTotalAddDetailClick = ( subTotal, type ) => {
        const detail = handlesubTotal( subTotal );

        // if the first record is empty fill in with details
        if ( size( data.invoiceDetailsDTOList ) === 1 && (isNil( data.invoiceDetailsDTOList[ 0 ].description ) || isEmpty( data.invoiceDetailsDTOList[ 0 ].description )) ) {
            data.invoiceDetailsDTOList[ 0 ] = detail;
        } else {

            data.invoiceDetailsDTOList.push( detail );
        }

        setData( {
            ...data,
            invoiceDetailsDTOList: data.invoiceDetailsDTOList
        } );
    };

    const handleDeleteDetailClick = ( detail ) => {

        if ( isNil( detail.id ) ) {
            remove( data.invoiceDetailsDTOList, det => {
                return det.index === detail.index;
            } );
        } else {
            remove( data.invoiceDetailsDTOList, det => {
                return det.id === detail.id;
            } );
        }
        setData( {
                ...data,
                invoiceDetailsDTOList: data.invoiceDetailsDTOList
            }
        );
    };

    const handleDeleteInvoice = async () => {
        if ( !data.valid ) {
            const accessToken = await getAccessTokenSilently();

            if ( !isNil( data.id ) ) {

                let result = await deleteInvoiceById( accessToken, data.id );
                if ( !result.error ) {

                    notificationAlert.current.notificationAlert( getOptionNotification( label.invoice.success103, 'primary' ) );
                    props.history.push( {
                        pathname: `/admin/list/invoices`,
                        state: {
                            message: label.invoice.success103
                        }
                    } );

                } else {
                    notificationAlert.current.notificationAlert( getOptionNotification( label.invoice.error100, 'danger' ) );
                }
            }
        }
    };

    const _saveInvoice = async () => {
        // write calendar
        const right = [0, 27];

        let rightsFound;
        if ( enumRights ) {
            rightsFound = enumRights.filter( element => right.includes( element ) );
        }
        if ( !isNil( rightsFound ) && isEmpty( rightsFound ) ) {
            notificationAlert.current.notificationAlert( getOptionNotification( label.unauthorized.label9, 'danger' ) );
            return;
        }
        setLoadingSave( true );

        const accessToken = await getAccessTokenSilently();

        if ( isNil( data.clientItem ) ) {
            setLoadingSave( false );
            notificationAlert.current.notificationAlert( getOptionNotification( props.label.invoice.alert100, 'danger' ) );
            return;
        }
        if ( isNil( totalAmount.current ) || parseFloat( totalAmount.current ) === parseFloat( 0 ) ) {
            setLoadingSave( false );
            notificationAlert.current.notificationAlert( getOptionNotification( props.label.invoice.alert104, 'danger' ) );
            return;
        }

        data.montant = totalAmount.current;

        data.prestationIdList = filter( map( prestations.current, prestation => {
            return prestation.invoiceChecked === true ? prestation.id : null;
        } ), prest => { return !isNil( prest );} );

        data.fraisAdminIdList = filter( map( fraisAdmin.current, prestation => {
            return prestation.invoiceChecked === true ? prestation.id : null;
        } ), prest => { return !isNil( prest );} );

        data.deboursIdList = filter( map( debours.current, prestation => {
            return prestation.invoiceChecked === true ? prestation.id : null;
        } ), prest => { return !isNil( prest );} );

        data.fraisCollaborationIdList = filter( map( fraisColl.current, prestation => {
            return prestation.invoiceChecked === true ? prestation.id : null;
        } ), prest => { return !isNil( prest );} );

        let result = await createInvoice( accessToken, data );

        if ( !result.error ) {
            props.history.push( {
                pathname: `/admin/invoice/${result.data}`,
                state: {
                    message: label.invoice.success101
                }
            } );

        } else {
            notificationAlert.current.notificationAlert( getOptionNotification( 'error invoice not saved', 'danger' ) );
            setLoadingSave( false );
        }
    };

    const _updateInvoice = async () => {
        // update invoice
        const right = [0, 27];

        let rightsFound;
        if ( enumRights ) {
            rightsFound = enumRights.filter( element => right.includes( element ) );
        }
        if ( !isNil( rightsFound ) && isEmpty( rightsFound ) ) {
            notificationAlert.current.notificationAlert( getOptionNotification( label.unauthorized.label9, 'danger' ) );
            return;
        }
        setLoadingSave( true );
        const accessToken = await getAccessTokenSilently();

        if ( isNil( data.clientItem ) ) {
            setLoadingSave( false );
            notificationAlert.current.notificationAlert( getOptionNotification( props.label.invoice.alert100, 'danger' ) );
            return;
        }
        if ( isNil( totalAmount.current ) || parseFloat( totalAmount.current ) === parseFloat( 0 ) ) {
            setLoadingSave( false );
            notificationAlert.current.notificationAlert( getOptionNotification( props.label.invoice.alert104, 'danger' ) );
            return;
        }

        data.montant = totalAmount.current;

        data.prestationIdList = filter( map( prestations.current, prestation => {
            return prestation.invoiceChecked === true ? prestation.id : null;
        } ), prest => { return !isNil( prest );} );

        data.fraisAdminIdList = filter( map( fraisAdmin.current, prestation => {
            return prestation.invoiceChecked === true ? prestation.id : null;
        } ), prest => { return !isNil( prest );} );

        data.deboursIdList = filter( map( debours.current, prestation => {
            return prestation.invoiceChecked === true ? prestation.id : null;
        } ), prest => { return !isNil( prest );} );

        data.fraisCollaborationIdList = filter( map( fraisColl.current, prestation => {
            return prestation.invoiceChecked === true ? prestation.id : null;
        } ), prest => { return !isNil( prest );} );

        let result = await updateInvoice( accessToken, data );
        if ( !result.error ) {
            notificationAlert.current.notificationAlert( getOptionNotification( props.label.invoice.success100, 'info' ) );
        }
        setLoadingSave( false );
    };

    const _openSendModal = async () => {
        // double check only if it's valid
        if(data &&  data.valid ) {
            setSendModal( !sendModal );
        }

    };
    const _openRegisteredInvoice = async () => {
        const accessToken = await getAccessTokenSilently();

        let resultPayment = await checkPaymentActivated( accessToken );
        if ( !isNil( resultPayment ) && resultPayment.data === true ) {
            _toggleRegisteredEmail();
            // get pdf file
            const result = await generateInvoiceValid( accessToken, invoiceIdRef.current );
            if ( !result.error ) {
                let pdf = new File( [result.data.binary], data.reference, {
                    type: result.data.contentType,
                } );
                setInvoicePdf( pdf );
            } else {
                showMessage( label.invoice.alert103, 'danger' );
            }
        } else {
            _toggleUnPaid();
        }
        _openSendModal();
    };

    const _download = async() => {
        let result;
        if ( data.valid === true ) {
            const accessToken = await getAccessTokenSilently();
            result = await generateInvoiceValid( accessToken, data.id );
            if ( !result.error ) {
                let pdf = b64toBlob( result.data.binary, result.data.contentType );
                downloadBlob( pdf, 'report' + moment().format( 'yyyyMMDDhmmss' ) + '.pdf' );
            } else {
                showMessage( label.invoice.alert103, 'danger' );
            }
        }
    };

    const _toggleUnPaid = () => {
        setModalNotPaidSignDocument( !modalNotPaidSignDocument );
    };
    const _toggleRegisteredEmail = () => {
        setModalEmailDisplay( !modalEmailDisplay );
    };
    const _validateInvoice = async () => {
        // validate invoice
        const right = [0, 28];

        let rightsFound;
        if ( enumRights ) {
            rightsFound = enumRights.filter( element => right.includes( element ) );
        }
        if ( !isNil( rightsFound ) && isEmpty( rightsFound ) ) {
            notificationAlert.current.notificationAlert( getOptionNotification( label.unauthorized.label9, 'danger' ) );
            return;
        }
        const accessToken = await getAccessTokenSilently();

        if ( data.valid === true ) {
            notificationAlert.current.notificationAlert( getOptionNotification( props.label.invoice.alert101, 'danger' ) );
        } else {

            let result = await validateInvoice( accessToken, data.id );

            if ( !result.error ) {
                setData( { ...result.data } );
                notificationAlert.current.notificationAlert( getOptionNotification( props.label.invoice.success102, 'info' ) );
            } else {
                notificationAlert.current.notificationAlert( getOptionNotification( props.label.invoice.alert102, 'danger' ) );
            }
        }
    };

    const loadClientOptions = async ( inputValue, callback ) => {
        const accessToken = await getAccessTokenSilently();
        let result = await getClient( accessToken, inputValue );

        callback( map( result.data, client => {
                return new ItemDTO( { value: client.id, label: client.fullName, isDefault: client.email } );
            }
        ) );
    };

    const handleClientChange = ( newValue ) => {
        setData( { ...data, clientId: newValue.value, clientItem: newValue } );
        setOpenclientModal( false );

    };

    const _clientUpdated = async () => {
        const accessToken = await getAccessTokenSilently();

        if ( !isNil( data.clientId ) || !isEmpty( data.clientId ) ) {
            let clientResult = await getClientById( accessToken, data.clientId );

            data.clientItem = new ItemDTO(
                {
                    value: clientResult.data.id,
                    label: clientResult.data.fullName,
                    isDefault: clientResult.data.email
                } );
        }

        setData( { ...data } );
        setClientModal( null );
        setOpenclientModal( false );
        notificationAlert.current.notificationAlert( getOptionNotification( label.ajout_client.toastrSuccessPUpdate, 'primary' ) );
    };
    const _clientCreated = async ( client ) => {
        const accessToken = await getAccessTokenSilently();

        let clientResult = await getClientById( accessToken, client.id );

        data.clientId = client.id;
        data.clientItem = new ItemDTO(
            {
                value: clientResult.data.id,
                label: clientResult.data.fullName,
                isDefault: clientResult.data.email
            } );
        setData( { ...data } );
        setClientModal( null );
        setOpenclientModal( false );
        notificationAlert.current.notificationAlert( getOptionNotification( label.ajout_client.toastrSuccessPUpdate, 'primary' ) );
    };

    const _toggleClient = () => {
        setClientModal( null );
        setOpenclientModal( false );
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
        const accessToken = await getAccessTokenSilently();
        if ( !isNil( newValue ) ) {
            let resultDossier = await getDossierById( accessToken, newValue.value, vckeySelected );

            if ( !resultDossier.error && !isNil( resultDossier.data ) && !isEmpty( resultDossier.data ) ) {
                const dossierDefault = new DossierDTO( resultDossier.data );
                setData( {
                    ...data,
                    dossierId: newValue.value,
                    dossierItem: newValue,
                    clientId: isNil( data.clientId ) ? dossierDefault.idClient : data.clientId,
                    clientItem: isNil( data.clientItem ) ? dossierDefault.client : data.clientItem
                } );
            }
        } else {
            setData( {
                ...data,
                dossierId: null,
                dossierItem: null,
            } );
        }
    };

    const showInvoiceFun = () => {
        setShowInvoice( !showInvoice );
    };
    const showMessage = ( message, type ) => {
        if ( message && type ) {
            notificationAlert.current.notificationAlert( getOptionNotification( message, type ) );
        }
    };

    const details = data && data.invoiceDetailsDTOList ? map( data.invoiceDetailsDTOList, detail => {
        return (
            <Row key={detail.index}>
                <Col md="5" sm={3}>
                    <label>{label.invoice.label118}</label>
                    <FormGroup>
                        <Input type="textarea"
                               disabled={data.valid}
                               onChange={( event ) => {
                                   detail.description = event.target.value;

                                   //update(data.invoiceDetailsDTOList,  {description: {$set: 'updated field name'}}); // ['x', 'y']
                                   //let detFound = find( data.invoiceDetailsDTOList, det => {return det.id === detail.id;} );
                                   //detFound.description = event.target.value;
                                   setData( {
                                       ...data,
                                       invoiceDetailsDTOList: data.invoiceDetailsDTOList
                                   } );
                               }}
                               value={detail.description}/>
                    </FormGroup>
                </Col>
                {/* HTVA AMOUNT*/}
                <Col md="2" sm={3}>
                    <label>{label.invoice.label100}</label>
                    <InputGroup>
                        <InputGroupAddon disabled={data.valid} addonType="prepend">
                            <InputGroupText>
                                <span className="currency-input-text">{props.currency}</span>
                            </InputGroupText>
                        </InputGroupAddon>
                        <Input type="number"
                               disabled={data.valid}
                               onChange={( event ) => {
                                   detail.montantHt = event.target.value;

                                   let montantTVA = parseFloat( detail.montantHt ) + (parseFloat( detail.montantHt ) * (parseFloat( detail.tvaItem.value ) / 100));
                                   detail.montant = round( montantTVA, 2 ).toFixed( 2 );

                                   setData( {
                                       ...data,
                                       invoiceDetailsDTOList: data.invoiceDetailsDTOList
                                   } );
                               }}
                               value={detail.montantHt}/>
                    </InputGroup>
                </Col>
                {/* TVA CHOICE */}
                <Col md="2" sm={3}>
                    <label>{label.invoice.label101}</label>
                    <FormGroup>
                        <Select
                            isDisabled={data.valid}
                            className="react-select info"
                            classNamePrefix="react-select"
                            name="singleSelect"
                            value={detail.tvaItem}
                            onChange={
                                value => {
                                    let detFound = find( data.invoiceDetailsDTOList, det => {return det.index === detail.index;} );
                                    detFound.tvaItem = value;
                                    detFound.tva = value.value;
                                    let montantTVA = parseFloat( detail.montantHt ) + (parseFloat( detail.montantHt ) * (parseFloat( detail.tvaItem.value ) / 100));
                                    detail.montant = round( montantTVA, 2 ).toFixed( 2 );

                                    setData( {
                                        ...data,
                                        invoiceDetailsDTOList: data.invoiceDetailsDTOList
                                    } );
                                }
                            }
                            options={vats}
                            placeholder="Taxe"
                        />
                    </FormGroup>
                </Col>
                {/* TVA AMOUNT */}
                <Col lg="2">
                    <Label>{label.invoice.label102}</Label>
                    <InputGroup
                    >
                        <InputGroupAddon disabled={data.valid} addonType="prepend">
                            <InputGroupText>
                                <span className="currency-input-text">{props.currency}</span>
                            </InputGroupText>
                        </InputGroupAddon>
                        <Input disabled={data.valid}
                               type="number"
                               value={detail.montant}
                               onChange={( event ) => {
                                   detail.montant = event.target.value;

                                   let montantHTVA = parseFloat( detail.montant ) / (1 + (parseFloat( detail.tvaItem.value ) / 100));
                                   detail.montantHt = round( montantHTVA, 2 ).toFixed( 2 );

                                   setData( {
                                       ...data,
                                       invoiceDetailsDTOList: data.invoiceDetailsDTOList
                                   } );
                               }}
                        />
                    </InputGroup>
                </Col>
                <Col md="1" sm={1}>
                    <label></label>
                    <FormGroup>
                        <Button className="btn-icon float-right" size="md"
                                disabled={data.valid}
                                onClick={() => handleDeleteDetailClick( detail )}
                                color="danger">
                            <i className="tim-icons icon-simple-remove"/>
                        </Button>
                    </FormGroup>
                </Col>
            </Row>
        );
    } ) : null;

    const totalTVAComponent = () => {

        let totalTVA = 0;
        let totalHTVA = 0;
        let totalTTC = 0;
        let totalDetailTVA = 0;

        return map( vats, vat => {

            /* FACTURE DETAILS */
            let detailTVA = 0;
            totalDetailTVA = 0;
            totalHTVA = 0;
            totalTTC = 0;

            forEach( data.invoiceDetailsDTOList, detail => {
                detailTVA = 0;
                if ( detail.tva === vat.value ) {
                    detailTVA = ((isNaN( parseFloat( detail.montant ) ) ? 0 : parseFloat( detail.montant )) - (isNaN( parseFloat( detail.montantHt ) ) ? 0 : parseFloat( detail.montantHt ))).toFixed( 2 );
                    totalDetailTVA = (parseFloat( totalDetailTVA ) + parseFloat( detailTVA )).toFixed( 2 );
                    totalDetailTVA = (round( totalDetailTVA, 2 ).toFixed( 2 ));
                }
                totalHTVA = (parseFloat( totalHTVA ) + (isNaN( parseFloat( detail.montantHt ) ) ? 0 : parseFloat( detail.montantHt ))).toFixed( 2 );
                totalTTC = (parseFloat( totalTTC ) + (isNaN( parseFloat( detail.montant ) ) ? 0 : parseFloat( detail.montant ))).toFixed( 2 );
            } );

            totalTVA = (parseFloat( totalTVA ) + parseFloat( totalDetailTVA )).toFixed( 2 );

            return totalDetailTVA !== 0 && vat.value !== 0 ? (
                <Col sm={3}>
                    <Label>{label.invoice.label103} {vat.value}%</Label>
                    <br/>
                    <FormGroup>
                        <p>{totalDetailTVA} {props.currency}</p>
                    </FormGroup>
                </Col>
            ) : null;

        } );
    };

    const totalComponent = () => {

        let totalTVA = 0;
        let totalHTVA = 0;
        let totalTTC = 0;
        let totalDetailTVA = 0;

        forEach( vats, vat => {

            let detailTVA = 0;
            totalDetailTVA = 0;
            totalHTVA = 0;
            totalTTC = 0;

            /* FACTURE DETAILS */
            forEach( data.invoiceDetailsDTOList, detail => {
                detailTVA = 0;
                if ( detail.tva === vat.value ) {
                    detailTVA = ((isNaN( parseFloat( detail.montant ) ) ? 0 : parseFloat( detail.montant )) - (isNaN( parseFloat( detail.montantHt ) ) ? 0 : parseFloat( detail.montantHt ))).toFixed( 2 );
                    totalDetailTVA = (parseFloat( totalDetailTVA ) + parseFloat( detailTVA )).toFixed( 2 );
                    totalDetailTVA = (round( totalDetailTVA, 2 ).toFixed( 2 ));
                }
                totalHTVA = (parseFloat( totalHTVA ) + (isNaN( parseFloat( detail.montantHt ) ) ? 0 : parseFloat( detail.montantHt ))).toFixed( 2 );
                totalTTC = (parseFloat( totalTTC ) + (isNaN( parseFloat( detail.montant ) ) ? 0 : parseFloat( detail.montant ))).toFixed( 2 );
            } );

            totalTVA = (parseFloat( totalTVA ) + parseFloat( totalDetailTVA )).toFixed( 2 );

        } );
        totalAmount.current = totalTTC;

        return totalTVA !== 0 ? (
            <>
                <Row>
                    <Col md={4}>
                        <Label>{label.invoice.label103}</Label>
                        <FormGroup>
                            <p>{totalTVA} {props.currency}</p>
                        </FormGroup>
                    </Col>
                    <br/>
                    <Col md={4}>
                        <Label>{label.invoice.label104}</Label>
                        <FormGroup>
                            <p>{totalHTVA} {props.currency}</p>
                        </FormGroup>
                    </Col>

                    <br/>
                    <Col md={4}>
                        <Label>{label.invoice.label105}</Label>
                        <FormGroup>
                            <p>{totalTTC} {props.currency}</p>
                        </FormGroup>
                    </Col>
                </Row>
            </>

        ) : null;
    };

    /* not NC */
    const notVisible = data.typeId !== 2;

    return (
        <>
            <div className="content">
                <div className="rna-container">
                    <NotificationAlert ref={notificationAlert}/>
                </div>
                <Form action="#">
                    <fieldset>
                        <Row>
                            <Col md={7} sm={6}>
                                <Link className="btn btn-link btn-primary padding-left-25" to={`/admin/list/invoices`}>
                                    <i className="fas fa-arrow-left"/>{' '}{label.common.list}</Link>
                            </Col>
                            <Col className="margin-bottom-15" md={{ size: 5 }} sm={{ size: 6 }}>
                                <ButtonGroup>
                                    {/* DISPLAY CREATE BUTTON */}
                                    {isCreated.current ? (
                                        <Button color="primary" type="button" disabled={loadingSave}
                                                id="invoiceLabelId1"
                                                onClick={_saveInvoice}
                                        >
                                            {loadingSave ? (
                                                <Spinner
                                                    size="sm"
                                                    color="secondary"
                                                />
                                            ) : null}
                                            {' '} {label.common.save}
                                        </Button>
                                    ) : null}
                                    {/* DISPLAY UPDATE BUTTON */}
                                    {!isCreated.current && data.valid === false ? (
                                        <Button color="primary" type="button" disabled={loadingSave}
                                                onClick={_updateInvoice}
                                        >
                                            {label.common.save}
                                        </Button>
                                    ) : null}
                                    {(isCreated.current === false ? (

                                        <Button color="info" type="button" onClick={showInvoiceFun}>
                                            {label.invoice.label106}
                                        </Button>
                                    ) : null)}
                                    {(isCreated.current === false && data.valid === false ? (
                                        <Button color="green" type="button" onClick={_validateInvoice}>
                                            {label.invoice.label119}
                                        </Button>
                                    ) : null)}
                                    {(isCreated.current === false && data.valid === false ? (
                                        <Button color="danger" type="button" onClick={() => {
                                            setDeleteAlert( <ReactBSAlert
                                                warning
                                                style={{ display: 'block', marginTop: '100px' }}
                                                title={label.ajout_client.label1}
                                                onConfirm={() => {
                                                    handleDeleteInvoice();
                                                    setDeleteAlert( null );
                                                }}
                                                onCancel={() => { setDeleteAlert( null ); }}
                                                confirmBtnBsStyle="success"
                                                cancelBtnBsStyle="danger"
                                                confirmBtnText={label.ajout_client.label2}
                                                cancelBtnText={label.common.cancel}
                                                showCancel
                                                btnSize=""
                                            >
                                                {label.ajout_client.label3}
                                            </ReactBSAlert> );

                                        }}>
                                            {label.common.delete}
                                        </Button>
                                    ) : null)}

                                    {/*  SEND REGISTERED EMAIL BUTTON */}
                                    {!isCreated.current && data.valid === true ? (
                                        <Button color="primary" type="button" disabled={loadingSave}
                                                onClick={_openSendModal}
                                        >
                                            {label.common.send}
                                        </Button>
                                    ) : null}
                                </ButtonGroup>
                            </Col>
                        </Row>
                        {/* info*/}
                        <Row>
                            <Col className="ml-auto mr-auto " md="8" sm={12}>
                                <Card>
                                    <CardHeader>
                                        <CardTitle tag="h4">{label.invoice.label107} {data.reference}</CardTitle>
                                    </CardHeader>
                                    <CardBody>
                                        {isNil( data ) ? (
                                                <ReactLoading className="loading" height={'20%'} width={'20%'}/>
                                            ) :
                                            (
                                                <>
                                                    <Row>
                                                        <Col md="3">
                                                            <label>{label.invoice.label108}</label>
                                                            <FormGroup>
                                                                <Select
                                                                    isDisabled={data.valid}
                                                                    className="react-select info"
                                                                    classNamePrefix="react-select"
                                                                    name="infoType"
                                                                    value={data.typeItem}
                                                                    onChange={value => {
                                                                        //remove type rules
                                                                        // close date
                                                                        setData( {
                                                                            ...data,
                                                                            typeId: value.value,
                                                                            typeItem: value
                                                                        } );
                                                                    }
                                                                    }
                                                                    options={facturesTypes}
                                                                    placeholder="Type"
                                                                />
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md="3">
                                                            <label>{label.invoice.label109}</label>
                                                            <FormGroup>
                                                                <Select
                                                                    isDisabled={data.valid}
                                                                    className="react-select info"
                                                                    classNamePrefix="react-select"
                                                                    name="infoposte"
                                                                    value={data.posteItem}
                                                                    onChange={value =>
                                                                        setData( {
                                                                            ...data,
                                                                            posteId: value.value,
                                                                            posteItem: value
                                                                        } )
                                                                    }
                                                                    options={postes}
                                                                    placeholder="Poste"
                                                                />
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md="3">
                                                            <Label>{data.dossierItem ? (
                                                                    <Link
                                                                        to={`/admin/affaire/${data.dossierItem.value}`}>{label.invoice.label110} {' '}
                                                                        <VisibilityIcon/></Link>
                                                                ) :
                                                                label.invoice.label110}</Label>
                                                            <FormGroup>
                                                                <AsyncSelect
                                                                    isDisabled={data.valid}
                                                                    value={data.dossierItem}
                                                                    className="react-select info"
                                                                    classNamePrefix="react-select"
                                                                    cacheOptions
                                                                    loadOptions={_loadDossierOptions}
                                                                    defaultOptions
                                                                    onChange={_handleDossierChange}
                                                                    isClearable={true}
                                                                    placeholder={label.affaire.filterDossier}
                                                                />
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md="3">
                                                            {notVisible === true ? (
                                                                <>
                                                                    <label>{label.invoice.label111}</label>
                                                                    <FormGroup>
                                                                        <Select
                                                                            isDisabled={data.valid}
                                                                            className="react-select info"
                                                                            classNamePrefix="react-select"
                                                                            name="inforules"
                                                                            value={data.echeanceItem}
                                                                            onChange={
                                                                                value => {
                                                                                    let echeance = 0;
                                                                                    switch ( value.value ) {
                                                                                        case 1 :
                                                                                            echeance = 7;
                                                                                            break;
                                                                                        case 3 :
                                                                                            echeance = 30;
                                                                                            break;
                                                                                        default:
                                                                                            echeance = 0;
                                                                                            break;
                                                                                    }
                                                                                    setData( {
                                                                                        ...data,
                                                                                        dateEcheance: moment( data.dateValue ).add( echeance, 'days' ),
                                                                                        echeanceId: value.value,
                                                                                        echeanceItem: value
                                                                                    } );
                                                                                }
                                                                            }
                                                                            options={facturesEcheances}
                                                                            placeholder="Poste"
                                                                        />
                                                                    </FormGroup>
                                                                </>
                                                            ) : null}
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col md="3">
                                                            <label>{label.invoice.label112}</label>
                                                            <FormGroup>
                                                                <DatePicker
                                                                    disabled={data.valid}
                                                                    selected={data.dateValue ? moment( data.dateValue ).toDate() : null}
                                                                    onChange={date => {
                                                                        let echeance = 0;
                                                                        switch ( data.echeanceItem.value ) {
                                                                            case 1 :
                                                                                echeance = 7;
                                                                                break;
                                                                            case 3 :
                                                                                echeance = 30;
                                                                                break;
                                                                            default:
                                                                                echeance = 0;
                                                                                break;
                                                                        }
                                                                        setData( {
                                                                            ...data,
                                                                            dateValue: date,
                                                                            dateEcheance: moment( date ).add( echeance, 'days' ),
                                                                        } );
                                                                    }
                                                                    }
                                                                    locale="fr"
                                                                    timeCaption="date"
                                                                    dateFormat="yyyy-MM-dd"
                                                                    placeholderText="yyyy-mm-dd"
                                                                    className="form-control color-primary"
                                                                    name="date_facture"
                                                                    id="dateFacture"
                                                                />
                                                            </FormGroup>

                                                        </Col>
                                                        <Col md="3">
                                                            {notVisible === true ? (
                                                                <>
                                                                    <label>{label.invoice.label113}</label>
                                                                    <FormGroup>
                                                                        <DatePicker
                                                                            disabled={data.valid}
                                                                            selected={data.dateEcheance ? moment( data.dateEcheance ).toDate() : null}
                                                                            onChange={date => {
                                                                                // new value e.target.value
                                                                                setData( {
                                                                                    ...data,
                                                                                    dateEcheance: date
                                                                                } );
                                                                            }
                                                                            }
                                                                            locale="fr"
                                                                            timeCaption="date"
                                                                            dateFormat="yyyy-MM-dd"
                                                                            placeholderText="yyyy-mm-dd"
                                                                            className="form-control color-primary"
                                                                            name="date_echeance"
                                                                            id="dateEcheance"
                                                                        />
                                                                    </FormGroup>
                                                                </>
                                                            ) : null}
                                                        </Col>
                                                        <Col md="3">
                                                            <label>{label.invoice.label114}</label>
                                                            <FormGroup row>
                                                                <Col md="10">
                                                                    <AsyncSelect
                                                                        isDisabled={data.valid}
                                                                        value={data.clientItem}
                                                                        className="react-select info"
                                                                        classNamePrefix="react-select"
                                                                        cacheOptions
                                                                        loadOptions={loadClientOptions}
                                                                        defaultOptions
                                                                        onChange={handleClientChange}
                                                                    />

                                                                </Col>
                                                                <Col md="2">
                                                                    {data.clientId ? (
                                                                        <Button
                                                                            disabled={data.valid}
                                                                            className="btn-icon float-right"
                                                                            color="primary"
                                                                            type="button"
                                                                            size="sm"
                                                                            onClick={() => {
                                                                                // write client
                                                                                const right = [0, 22];

                                                                                let rightsFound;
                                                                                if ( enumRights ) {
                                                                                    rightsFound = enumRights.filter( element => right.includes( element ) );
                                                                                }
                                                                                if ( !isNil( rightsFound ) && isEmpty( rightsFound ) ) {
                                                                                    notificationAlert.current.notificationAlert( getOptionNotification( label.unauthorized.label9, 'danger' ) );
                                                                                    return;
                                                                                }
                                                                                setClientModal( data.clientId );
                                                                                setOpenclientModal( !openclientModal );
                                                                            }}
                                                                        >
                                                                            <i className="tim-icons icon-pencil"/>
                                                                        </Button>
                                                                    ) : (
                                                                        <Button
                                                                            disabled={data.valid}
                                                                            className="btn-icon float-right"
                                                                            color="primary"
                                                                            type="button"
                                                                            size="sm"
                                                                            onClick={() => {
                                                                                // write client
                                                                                const right = [0, 22];

                                                                                let rightsFound;
                                                                                if ( enumRights ) {
                                                                                    rightsFound = enumRights.filter( element => right.includes( element ) );
                                                                                }
                                                                                if ( !isNil( rightsFound ) && isEmpty( rightsFound ) ) {
                                                                                    notificationAlert.current.notificationAlert( getOptionNotification( label.unauthorized.label9, 'danger' ) );
                                                                                    return;
                                                                                }

                                                                                setClientModal( data.clientId );
                                                                                setOpenclientModal( !openclientModal );
                                                                            }}
                                                                        >
                                                                            <i className="tim-icons icon-simple-add"/>
                                                                        </Button>
                                                                    )}
                                                                </Col>
                                                            </FormGroup>
                                                        </Col>
                                                    </Row>
                                                </>
                                            )
                                        }
                                    </CardBody>
                                </Card>
                            </Col>
                            <Col md="4" sm={12}>
                                <Card style={{ Height: 224 }}>
                                    <CardHeader>
                                        <CardTitle>
                                            <h4> {label.invoice.label115} </h4>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardBody>
                                        <Row>
                                            {totalTVAComponent()}
                                        </Row>
                                        {totalComponent()}

                                    </CardBody>
                                </Card>
                            </Col>
                        </Row>
                        {/* details*/}
                        <Row>
                            <Col md="12" sm={12}>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>
                                            <h4> {label.invoice.label116}
                                                <Button disabled={data.valid}
                                                        className="btn-icon float-right" size="md" color="primary"
                                                        onClick={() => handleAddDetailClick()}
                                                >
                                                    <i className="tim-icons icon-simple-add"/>
                                                </Button>
                                            </h4>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardBody>
                                        {details}
                                    </CardBody>
                                </Card>
                            </Col>

                        </Row>

                        {/* ANNEXE */}
                        <Row>
                            <Col md="12" sm={12}>
                                {loadingAnnexe === false ? (
                                    <>
                                        {(prestationListVisible === true
                                            || fraisAdminListVisible === true
                                            || deboursListVisible === true
                                            || fraisCollListVisible === true) ? (
                                            <Card>
                                                <CardHeader>
                                                    <Row>
                                                        <Col md={8}>
                                                            <CardTitle>
                                                                <h4>{label.invoice.label131}
                                                                </h4>
                                                            </CardTitle>
                                                        </Col>
                                                    </Row>
                                                </CardHeader>

                                            </Card>
                                        ) : null}
                                    </>
                                ) : (
                                    <ReactLoading className="loading" height={'20%'} width={'20%'}/>
                                )}
                            </Col>
                        </Row>
                        <div
                            aria-multiselectable={true}
                            className="card-collapse"
                            id="accordion"
                            role="tablist"
                        >
                            {/* prestations*/}
                            {!isNil( data.dossierId ) ? (
                                <PrestationInvoiceTable
                                    currency={currency}
                                    prestationListFunction={prestationListFunction}
                                    invoiceId={invoiceIdRef.current}
                                    dossierId={data.dossierId}
                                    prestations={prestations.current}
                                    label={label}
                                    handlesubTotalAddDetail={handlesubTotalAddDetailClick}
                                />
                            ) : null
                            }


                            {/* frais admin */}
                            {!isNil( data.dossierId ) ? (
                                <FraisAdminInvoiceTable
                                    currency={currency}
                                    fraisAdminListFunction={fraisAdminListFunction}
                                    invoiceId={invoiceIdRef.current}
                                    dossierId={data.dossierId}
                                    fraisAdmin={fraisAdmin.current}
                                    label={label}
                                    handlesubTotalAddDetailClick={handlesubTotalAddDetailClick}
                                />
                            ) : null
                            }
                            {/* debours */}
                            {!isNil( data.dossierId ) ? (
                                <DeboursInvoiceTable
                                    currency={currency}
                                    deboursListFunction={deboursListFunction}
                                    invoiceId={invoiceIdRef.current}
                                    dossierId={data.dossierId}
                                    debours={debours.current}
                                    label={label}
                                    handlesubTotalAddDetailClick={handlesubTotalAddDetailClick}
                                />
                            ) : null
                            }

                            {/* frais colla */}
                            {!isNil( data.dossierId ) ? (
                                <FraisCollaborationInvoiceTable
                                    currency={currency}
                                    fraisCollListFunction={fraisCollListFunction}
                                    invoiceId={invoiceIdRef.current}
                                    dossierId={data.dossierId}
                                    fraisColl={fraisColl.current}
                                    label={label}
                                    handlesubTotalAddDetailClick={handlesubTotalAddDetailClick}
                                />
                            ) : null
                            }
                        </div>

                    </fieldset>
                </Form>
            </div>
            {deleteAlert}
            <Modal size="lg" style={{ width: 'fit-content' }} isOpen={showInvoice} toggle={showInvoiceFun}>
                <ModalHeader>
                    <button type="button" className="close" data-dismiss="modal" aria-label="Close"
                            onClick={showInvoiceFun}>
                        <i className="tim-icons icon-simple-remove"></i>
                    </button>
                    <h4 className="modal-title">{label.invoice.label106}</h4>
                </ModalHeader>
                <ModalBody>
                    <InvoiceGenerator
                        isValid={data.valid}
                        invoiceId={data.id}
                        label={label}
                        showMessage={showMessage}/>
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={showInvoiceFun}>
                        {label.common.close}
                    </Button>
                </ModalFooter>
            </Modal>
            {openclientModal ? (
                <RegisterClientModal
                    isCreate={isNil( clientModal )}
                    userId={userId}
                    label={label}
                    history={history}
                    idClient={clientModal}
                    vckeySelected={vckeySelected}
                    fullName={fullName}
                    language={language}
                    clientUpdated={_clientUpdated}
                    clientCreated={_clientCreated}
                    toggleClient={_toggleClient}
                    modal={openclientModal}
                    emailUserConnected={email}
                    enumRights={enumRights}
                />
            ) : null}

            {checkTokenDrive ?
                (
                    <ModalCheckSessionDrive
                        label={label}
                        toggle={_togglePopupCheckSession}
                        checkTokenDrive={checkTokenDrive}/>
                ) : null}

            {modalEmailDisplay ? (
                <ModalEMailSign
                    attachedFile={invoicePdf}
                    dossierId={data.dossierId}
                    label={label}
                    userId={userId}
                    vckeySelected={vckeySelected}
                    email={email}
                    clientId={data.clientId}
                    showMessage={showMessage}
                    updateList={() => {}}
                    showMessagePopup={showMessage}
                    toggleModalDetails={_toggleRegisteredEmail}
                    modalDisplay={modalEmailDisplay}/>
            ) : null}

            {modalNotPaidSignDocument ? (
                <ModalNoActivePayment
                    label={label}
                    toggleModalDetails={_toggleUnPaid}
                    modalDisplay={modalNotPaidSignDocument}/>
            ) : null}

            {/*  SEND INVOICE MODAL  */}
            {sendModal ? (
                <Modal isOpen={sendModal} toggle={_openSendModal}
                       size="sm" >
                    <ModalHeader className="justify-content-center" toggle={_openSendModal}>
                        {label.invoice.label134}
                    </ModalHeader>
                    <ModalBody>
                        <Card>
                            <CardHeader>
                            </CardHeader>
                            <CardBody>
                                <Row>
                                    <Col lg={12} md={12} sm={12} xs={12}>
                                        <Button size={`md`}
                                                className="very-big-btn"
                                                color={`info`}
                                                onClick={_openRegisteredInvoice}
                                                block>{label.mail.label32}</Button>
                                    </Col>
                                    <Col lg={12} md={12} sm={12} xs={12}>
                                        <Button size={`md`}
                                                color={`info`}
                                                className="very-big-btn"
                                                onClick={_download}
                                                block>{label.common.download}</Button>
                                    </Col>
                                </Row>

                            </CardBody>
                        </Card>
                    </ModalBody>
                </Modal>
            ) : null}

        </>
    );
};

export default withRouter( Invoice );
