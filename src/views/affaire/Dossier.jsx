import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

// reactstrap components
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    CardTitle,
    Col,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    FormGroup,
    Label,
    Nav,
    NavItem,
    NavLink,
    Row,
    TabContent,
    TabPane,
    UncontrolledDropdown,
    UncontrolledTooltip
} from 'reactstrap';
import NotificationAlert from 'react-notification-alert';
import { getOptionInfoNotification, getOptionNotification } from '../../utils/AlertUtils';
import { useAuth0 } from '@auth0/auth0-react';
import { getDossierById } from '../../services/DossierService';
import DossierDTO from '../../model/affaire/DossierDTO';
import InvoiceAffaireTable from './table/InvoiceAffaireTable';
import PrestationAffaireTable from './table/PrestationAffaireTable';
import FraisAffaireTable from './table/FraisAffaireTable';
import { getClientById, getClientListByIds } from '../../services/ClientService';
import ContactSummary from '../../model/client/ContactSummary';
import { RegisterClientModal } from '../../components/client/RegisterClientModal';
import ItemDTO from '../../model/ItemDTO';
import Finance from '../../components/Affaire/Finance';
import CircularProgress from '@material-ui/core/CircularProgress';
import { RegisterFraisModal } from '../../components/Affaire/RegisterFraisModal';
import {
    attachEsignDocument,
    attachFileCase,
    downloadFileAttached,
    getChannelsByDossierId,
    getPartiesByDossierId
} from '../../services/transparency/CaseService';
import { downloadWithName } from '../../utils/TableUtils';
import labelData from '../../data/label';
import { ShareModal } from '../../components/Affaire/ShareModal';
import DeboursAffaireTable from './table/DeboursAffaireTable';
import FraiCollaborationAffaireTable from './table/FraisCollaborationAffaireTable';
import ReactLoading from 'react-loading';
import HonoraireAffaireTable from './table/HonoraireAffaireTable';
import TiersAffaireTable from './table/TiersAffaireTable';
import { TemplateModal } from '../../components/Affaire/TemplateModal';
import { ReportEtatHonoraireModal } from '../../components/Affaire/ReportEtatHonoraireModal';
import { CommunicateWithModal } from '../../components/Affaire/CommunicateWithModal';
import Agenda from '../../components/Calendar/Agenda';
import { ConseilModal } from './popup/ConseilModal';
import ChannelDTO from '../../model/affaire/ChannelDTO';
import Drive from '../Drive';
import Mail from './mail/Mail';
import { validateEmail } from '../../utils/Utils';
import CasJuridiqueForm from './CasJuridiqueForm';
import Channels from './Channels';
import ModalReportPrestation from '../popup/reports/ModalReportPrestation';

const isEmpty = require( 'lodash/isEmpty' );
const isNil = require( 'lodash/isNil' );
const map = require( 'lodash/map' );
const some = require( 'lodash/some' );
const size = require( 'lodash/size' );
const padStart = require( 'lodash/padStart' );
const forEach = require( 'lodash/forEach' );
const reverse = require( 'lodash/reverse' );

const MAX_HEIGHT_CARD = 700;

export default function Dossier( props ) {
    const notificationAlert = useRef( null );

    const {
        match: { params }, label, currency, location,
        history,
        userId,
        language, email, enumRights,
        vckeySelected
    } = props;

    const [clientModal, setClientModal] = useState( null );
    const [clientList, setClientList] = useState( [] );
    const isValidClientEmail = useRef( false );

    const [verticalTabsIcons, setVerticalTabsIcons] = useState( 'cas' );
    const [horizontalTabs, setHorizontalTabs] = useState( 'invoice' );
    const [partiesCas, setPartiesCas] = useState( [] );
    const [horizontalPrestationTabs, setHorizontalPrestationTabs] = useState( 'prestation' );
    const [isLoadingSave, setisLoadingSave] = useState( false );
    const [openModalFrais, setOpenModalFrais] = useState( false );
    const [communicateWithPopup, setCommunicateWithPopup] = useState( false );
    const [openModalShare, setOpenModalShare] = useState( false );
    const [openModalTemplate, setOpenModalTemplate] = useState( false );
    const [openModalReportEtat, setOpenModalReportEtat] = useState( false );
    const [openModalConseil, setOpenModalConseil] = useState( false );
    const [affaireId] = useState( params.affaireid );
    const [dossier, setDossier] = useState( new DossierDTO() );
    const [vTabs, setvTabs] = useState( 'vt1' );
    const [channels, setChannels] = useState( [] );
    // force update within composant
    const [updatePrestation, setUpdatePrestation] = useState( false );
    const [updateFrais, setUpdateFrais] = useState( false );
    const updateCase = useRef( false );
    const casNotExist = useRef( true );
    const isLoadingDossier = useRef( true );
    const [openDialogPrestation, setOpenDialogPrestation] = useState( false );

    //notificationAlert.notificationAlert( getOptionInfoNotification( params.affaireid ) );
    const { getAccessTokenSilently, user } = useAuth0();

    //const { name } = useParams();
    useEffect( () => {
        (async () => {
            if ( location.state && location.state.isCreate === true ) {
                notificationAlert.current.notificationAlert( getOptionInfoNotification( label.etat.success3 ) );
                //use the state via location.state
                //and replace the state via
                history.replace();
            } else if ( location.state && location.state.stripe === true ) {
                notificationAlert.current.notificationAlert( getOptionInfoNotification( label.etat.success4 ) );
                history.replace();
            }
            let paramsLocation = new URLSearchParams( location.search );
            if ( paramsLocation && paramsLocation.get( 'successstripe' ) === 'success' ) {
                // redirct
                props.history.push( { pathname: `/admin/affaire/${affaireId}`, state: { stripe: true } } );
            }

        })();
    }, [location.state] );

    // transparency
    useEffect( () => {
        (async () => {
            const accessToken = await getAccessTokenSilently();
            let resultDossier = await getDossierById( accessToken, params.affaireid );
            let doss;
            if ( !resultDossier.error && !isNil( resultDossier.data ) && !isEmpty( resultDossier.data ) ) {
                doss = new DossierDTO( resultDossier.data );
            } else {
                props.history.push( {
                        pathname: `/auth/unauthorized/`, state: {
                            label: label,
                            email: user.email,
                            message: labelData.fr.affaire.error3,
                            messageEn: labelData.en.affaire.error3,
                            messageNl: labelData.nl.affaire.error3,
                        }
                    }
                );
                return;
            }
            let clientData = [];
            if ( doss.type !== 'MD' ) {
                let clientResult = await getClientById( accessToken, doss.idClient );
                if ( !clientResult.error ) {
                    clientData.push( new ContactSummary( clientResult.data, label ) );
                }
            } else {
                const clientIds = map( doss.clientList, clientTmp => clientTmp.value );
                const clientResult = await getClientListByIds( accessToken, clientIds );
                if ( !clientResult.error ) {
                    clientData = map( clientResult.data, data => {
                        return new ContactSummary( data, label );
                    } );
                }
            }

            // stop after true
            isValidClientEmail.current = some( clientData, client => { return !isEmpty( client.email ) && validateEmail( client.email ); } );

            setClientList( clientData );

            let partieResult = await getPartiesByDossierId( accessToken, doss.id );
            if ( !partieResult.error && !isEmpty( partieResult.data ) ) {
                setPartiesCas( partieResult.data );
            }
            const resultChannel = await getChannelsByDossierId( accessToken, affaireId );
            if ( (isNil( resultChannel.error ) || !resultChannel.error) && !isNil( resultChannel.data ) ) {
                if ( !isEmpty( resultChannel.data ) ) {
                    const channelTemp = map( resultChannel.data, data => {
                        return new ChannelDTO( data );
                    } );
                    setChannels( channelTemp );

                    setvTabs( channelTemp[ 0 ].id );
                }
            } else {
                setChannels( null );
            }

            casNotExist.current = (!isNil( doss ) && doss.isDigital === false) && !isNil( clientData );
            isLoadingDossier.current = false;

            // set dossier
            setDossier( doss );

        })();
    }, [getAccessTokenSilently, updateCase.current] );

    const changeActiveTab = async ( e, tabState, tadName ) => {
        e.preventDefault();

        if ( tabState === 'horizontalTabs' ) {
            setHorizontalTabs( tadName );
        } else if ( tabState === 'horizontalPrestationTabs' ) {
            setHorizontalPrestationTabs( tadName );
        }

    };

    const _openModalFrais = ( e, message, type ) => {
        // update/create timesheet
        const right = [0, 18];

        let rightsFound;
        if ( enumRights ) {
            rightsFound = enumRights.filter( element => right.includes( element ) );
        }
        if ( !isNil( rightsFound ) && isEmpty( rightsFound ) ) {
            notificationAlert.current.notificationAlert( getOptionNotification( label.unauthorized.label9, 'danger' ) );
            return;
        }
        setOpenModalFrais( !openModalFrais );

        showMessagePopupFrais( message, type );
    };

// with this function we change the active tab for all the tabs in this page
    const showMessagePopupFrais = ( message, type ) => {
        if ( message && type ) {
            setUpdatePrestation( !updatePrestation );
            notificationAlert.current.notificationAlert( getOptionNotification( message, type ) );
        }
    };
// with this function we change the active tab for all the tabs in this page
    const showMessagePopupFraisAdmin = ( message, type ) => {
        if ( message && type ) {
            setUpdateFrais( !updateFrais );
            notificationAlert.current.notificationAlert( getOptionNotification( message, type ) );
        }
    };
    const showMessagePopup = ( message, type ) => {
        if ( message && type ) {
            notificationAlert.current.notificationAlert( getOptionNotification( message, type ) );
        }
    };
// with this function we change the active tab for all the tabs in this page
    const _doneFrais = ( e, message, type ) => {
        setOpenModalFrais( !openModalFrais );

        if ( message && type ) {
            setUpdateFrais( !updateFrais );
            notificationAlert.current.notificationAlert( getOptionNotification( message, type ) );
        }

    };

    const _clientUpdated = async () => {
        const accessToken = await getAccessTokenSilently();

        if ( !isNil( dossier.idClient ) || !isEmpty( dossier.idClient ) ) {
            let clientResult = await getClientById( accessToken, dossier.idClient );

            dossier.client = new ItemDTO(
                {
                    value: clientResult.data.id,
                    label: clientResult.data.fullName,
                    isDefault: clientResult.data.email
                } );
        } else if ( !isNil( dossier.idAdverseClient ) || !isEmpty( dossier.idAdverseClient ) ) {
            let clientResult = await getClientById( accessToken, dossier.idAdverseClient );

            dossier.adverseClient = new ItemDTO(
                {
                    value: clientResult.data.id,
                    label: clientResult.data.fullName,
                    isDefault: clientResult.data.email
                } );
        }

        setDossier( dossier );
        setClientModal( null );
        notificationAlert.current.notificationAlert( getOptionNotification( label.ajout_client.toastrSuccessPUpdate, 'primary' ) );
    };
    const _toggleClient = () => {
        setClientModal( null );
    };

    const _downloadFile = async ( caseId, file ) => {
        setisLoadingSave( true );
        const accessToken = await getAccessTokenSilently();

        const result = await downloadFileAttached( accessToken, caseId, file.value );
        //const name = fileContent.name;
        //const arrn = name.split( '/' );
        if ( result.error ) {
            notificationAlert.current.notificationAlert( getOptionNotification( label.affaire.error1, 'danger' ) );
        } else {
            downloadWithName( result.data, file.value );
        }
        setisLoadingSave( false );

    };
    const _attachFileCase = async ( file ) => {
        setisLoadingSave( true );
        const accessToken = await getAccessTokenSilently();

        if ( isNil( file ) ) {
            notificationAlert.current.notificationAlert( getOptionNotification( label.affaire.error2, 'danger' ) );

            return;
        }
        const result = await attachFileCase( accessToken, file );
        if ( result.error ) {
            notificationAlert.current.notificationAlert( getOptionNotification( label.affaire.error2, 'danger' ) );
        } else {
            notificationAlert.current.notificationAlert( getOptionNotification( label.affaire.success1, 'success' ) );
        }
        updateCase.current = !updateCase.current;

        // only if its different than null
        setisLoadingSave( false );

    };

    const _attachEsignDocument = async ( file ) => {
        setisLoadingSave( true );
        const accessToken = await getAccessTokenSilently();

        if ( isNil( file ) ) {
            notificationAlert.current.notificationAlert( getOptionNotification( label.affaire.error2, 'danger' ) );
            return;
        }
        notificationAlert.current.notificationAlert( getOptionNotification( label.affaire.label9, 'warning' ) );

        const result = await attachEsignDocument( accessToken, affaireId, file );

        if ( !result.error ) {
            notificationAlert.current.notificationAlert( getOptionNotification( label.affaire.success1, 'success' ) );
        }

        updateCase.current = !updateCase.current;
        setisLoadingSave( false );

    };
    const _communicateWithPopup = async () => {

        // true it become false
        if ( communicateWithPopup === true ) {
            updateCase.current = !updateCase.current;
        }

        if ( isValidClientEmail.current ) {
            setCommunicateWithPopup( !communicateWithPopup );
        }
    };
    const _openShare = async () => {
        setOpenModalShare( !openModalShare );
    };
    const _openTemplate = async () => {
        setOpenModalTemplate( !openModalTemplate );
    };
    const _generateEtatHonoraire = async () => {
        setOpenModalReportEtat( !openModalReportEtat );
    };

    const _toggleCreateConseil = async () => {
        setOpenModalConseil( !openModalConseil );
    };

    const _createPartie = async ( newName ) => {
        setisLoadingSave( true );
        //const item = new ItemDTO( { value: 0, label: newName.label + ' - ' + newName.function } );
        //const parties = partiesCas.push( item );
        //setPartiesCas( [...partiesCas] );

        updateCase.current = !updateCase.current;
        setisLoadingSave( false );
    };

    const _updatePartie = async ( newItem ) => {
        setisLoadingSave( true );
        //const item = new ItemDTO( { value: 0, label: newName.label + ' - ' + newName.function } );
        //const parties = partiesCas.push( item );
        //setPartiesCas( [...partiesCas] );

        updateCase.current = !updateCase.current;
        setisLoadingSave( false );
    };

    const changeCasOrAgendaTab = ( e, tadName ) => {
        e.preventDefault();
        setVerticalTabsIcons( tadName );
    };

    const toggleModalLargePrestation = () => {
        setOpenDialogPrestation( !openDialogPrestation );
    };
    // parties size iss equal to 1 and > 1 if correspondant added
    const channelSize = channels ? size( channels ) : 0;

    // only creator must add correspondence
    let addCorrespondenceIsVisible = false;

    if ( !casNotExist.current ) {
        forEach( partiesCas, partie => {
            if ( partie.label === vckeySelected && partie.type === 'creator' ) {
                addCorrespondenceIsVisible = true;
            }
        } );
    }

    return (
        <>
            <div className="content">
                <div className="rna-container">
                    <NotificationAlert ref={notificationAlert}/>
                </div>
                <Row>
                    {/* CAS JURIDIQUE OR AGENDA */}
                    {/* TIITLE DOSSIER  */}
                    <Col className="text-left " md={{ size: 6 }} sm={{ size: 12 }}>
                        <Card>
                            <CardHeader>
                                <CardTitle tag="h4">{dossier.label}</CardTitle>

                            </CardHeader>
                        </Card>
                    </Col>
                    {/* ACTION BUTTON */}
                    <Col className="text-left margin-bottom-15" md={{ size: 6 }} sm={{ size: 12 }}>
                        <UncontrolledDropdown block={true}>
                            <DropdownToggle block color="primary" caret data-toggle="dropdown">
                                {label.affaire.label10}
                            </DropdownToggle>
                            <DropdownMenu className="dropdown-toggle-block">
                                <DropdownItem tag={Link}
                                              to={`/admin/update/affaire/${affaireId}`}>{label.affaire.label11}</DropdownItem>

                                <DropdownItem onClick={_openShare}>{label.affaire.label14}</DropdownItem>
                                <DropdownItem
                                    onClick={_generateEtatHonoraire}>{label.affaire.label12}</DropdownItem>
                                <DropdownItem onClick={_openTemplate}>{label.affaire.label21}</DropdownItem>
                            </DropdownMenu>
                        </UncontrolledDropdown>
                    </Col>
                    {/* NAVBAR SELECTION */}
                    <Col lg="1" md={2} sm={2}>
                        {/* color-classes: "nav-pills-primary", "nav-pills-info", "nav-pills-success", "nav-pills-warning","nav-pills-danger" */}
                        <Nav
                            className="nav-pills-info nav-pills-icons flex-column"
                            pills
                        >
                            <NavItem>
                                <NavLink
                                    data-toggle="tab"
                                    className={
                                        verticalTabsIcons === 'cas'
                                            ? 'active'
                                            : ''
                                    }
                                    onClick={
                                        e => changeCasOrAgendaTab( e, 'cas' )
                                    }
                                >
                                    <i className="tim-icons icon-badge"/>
                                    {label.casJuridiqueForm.label105}
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink
                                    data-toggle="tab"
                                    className={
                                        verticalTabsIcons === 'agenda'
                                            ? 'active'
                                            : ''
                                    }
                                    onClick={e =>
                                        changeCasOrAgendaTab( e, 'agenda' )

                                    }
                                >
                                    <i className="tim-icons icon-lock-circle"/>
                                    {label.agenda.label1}
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink
                                    data-toggle="tab"
                                    className={
                                        verticalTabsIcons === 'driveTab'
                                            ? 'active'
                                            : ''
                                    }
                                    onClick={e =>
                                        changeCasOrAgendaTab( e, 'driveTab' )

                                    }
                                >
                                    <i className="tim-icons icon-app"/>
                                    {label.drive.title}
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink
                                    data-toggle="tab"
                                    className={
                                        verticalTabsIcons === 'dev1'
                                            ? 'active'
                                            : ''
                                    }
                                    onClick={e =>
                                        changeCasOrAgendaTab( e, 'dev1' )

                                    }
                                >
                                    <i className="tim-icons icon-email-85"/>
                                    {label.agenda.label8}
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink
                                    data-toggle="tab"
                                    className={
                                        verticalTabsIcons === 'dev2'
                                            ? 'active'
                                            : ''
                                    }
                                    onClick={e =>
                                        changeCasOrAgendaTab( e, 'dev2' )

                                    }
                                >
                                    <i className="tim-icons icon-bank"/>
                                    {label.agenda.label7}
                                </NavLink>
                            </NavItem>
                        </Nav>
                    </Col>
                    {/* CONTENT CAS JURIDIQUE OR CONTENT AGENDA */}
                    <Col lg={11} md={10} sm={10}>
                        <TabContent activeTab={verticalTabsIcons}>
                            {/* CAS JURIDIQUE */}
                            <TabPane tabId="cas">
                                {isLoadingDossier.current ? (
                                        <ReactLoading className="loading" height={'20%'} width={'20%'}/>
                                    ) :
                                    /* if it is not loading dossier */
                                    casNotExist.current ?
                                        (
                                            <Col md={12}>
                                                {map( clientList, client => {
                                                    return (
                                                        <Row>
                                                            <Label md="2">{label.casJuridiqueForm.label101}</Label>
                                                            <Col md="9">
                                                                <FormGroup>
                                                                    <input className="form-control" disabled={true}
                                                                           value={client.email} type="email"/>
                                                                </FormGroup>
                                                            </Col>
                                                            <Col md="1">
                                                                <Button
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
                                                                        setClientModal( client.id );
                                                                    }}
                                                                >
                                                                    <i className="tim-icons icon-pencil"/>
                                                                </Button>
                                                            </Col>
                                                        </Row>
                                                    );
                                                } )}

                                                <Row>
                                                    <Col md={{ offset: 2, size: 6 }}>
                                                        <FormGroup>
                                                            <Button
                                                                className="btn-block"
                                                                color="primary"
                                                                disabled={isNil( clientList ) || !isValidClientEmail.current}
                                                                onClick={_communicateWithPopup}
                                                            >
                                                                {label.etat.communicateWith}
                                                            </Button>
                                                        </FormGroup>
                                                    </Col>
                                                </Row>
                                            </Col>
                                        ) :
                                        (
                                            <Row>
                                                <Col>
                                                    {/**  CAS JURIDIQUE ***/}
                                                    <Card
                                                        style={{ minHeight: casNotExist.current ? 200 : MAX_HEIGHT_CARD }}>
                                                        <CardHeader>
                                                            <Row>
                                                                {/* SELECT CONSEIL */}
                                                                <Col md={9} sm={8}>
                                                                    <CardTitle>{label.affaire.label36}</CardTitle>
                                                                </Col>

                                                                {/* ADD CONSEIL IF PARTIES are Hidden */}
                                                                {channelSize !== 0 ? null : (
                                                                    <Col md={2} sm={4}>
                                                                        <Button color="primary"
                                                                                onClick={( e ) => {
                                                                                    _toggleCreateConseil();
                                                                                }}>
                                                                            <i
                                                                                className="tim-icons icon-simple-add color-white padding-right-7"/> {` `} {label.casJuridiqueForm.label110}
                                                                        </Button>
                                                                    </Col>
                                                                )}
                                                            </Row>
                                                        </CardHeader>
                                                        <CardBody>
                                                            <CasJuridiqueForm
                                                                vckeySelected={vckeySelected}
                                                                userId={userId}
                                                                showSaveButton={false}
                                                                history={history}
                                                                updatePartie={_updatePartie}
                                                                dossierType={dossier.type}
                                                                enumRights={enumRights}
                                                                updateCaseRef={updateCase.current}
                                                                emailPayUser={email}
                                                                clientId={dossier.idClient}
                                                                partie={null}
                                                                affaireId={affaireId}
                                                                label={label}
                                                                lg={12} md={12}
                                                                showMessagePopup={showMessagePopup}
                                                                isLoadingSave={isLoadingSave}
                                                                downloadFile={_downloadFile}
                                                                attachEsignDocument={_attachEsignDocument}
                                                                attachFileCase={_attachFileCase}
                                                            />
                                                        </CardBody>
                                                    </Card>

                                                </Col>
                                                {/**  CHANNELS ***/}
                                                {channelSize !== 0 ? (
                                                    <Col>

                                                        <Card
                                                            style={{ minHeight: casNotExist ? 200 : MAX_HEIGHT_CARD }}>
                                                            <CardHeader>
                                                                <Row>
                                                                    <Col md={{ size: 6 }} sm={6}>
                                                                        <CardTitle>{label.affaire.label37}</CardTitle>
                                                                    </Col>
                                                                    {/* ADD CORRESPONDENCE */}
                                                                    <Col md={{ size: 6 }} sm={6}>
                                                                        {addCorrespondenceIsVisible ? (
                                                                            <Button color="primary"
                                                                                    onClick={( e ) => {
                                                                                        _toggleCreateConseil();
                                                                                    }}>
                                                                                <i
                                                                                    className="tim-icons icon-simple-add color-white padding-right-7"/> {` `} {label.casJuridiqueForm.label110}
                                                                            </Button>
                                                                        ) : null}
                                                                    </Col>
                                                                    {/* SELECT correspondence */}
                                                                    <Col md={12} sm={12}>
                                                                        <Nav className="nav-pills-info" pills>
                                                                            {channels ? map( channels, channel => {
                                                                                const partieLabel = map( reverse( channel.parties ), part => {
                                                                                    return part.label;
                                                                                } ).filter( element => !isNil( element ) ).join();

                                                                                // reverse again to have original order
                                                                                reverse( channel.parties );

                                                                                const uniqueIdTooltip = `topTooltip-${channel.id}-`;

                                                                                return (
                                                                                    <NavItem id={uniqueIdTooltip}>
                                                                                        <NavLink
                                                                                            href="#"
                                                                                            className={vTabs === channel.id ? 'active' : ''}
                                                                                            onClick={() => setvTabs( channel.id )}
                                                                                        >
                                                                                            {size( partieLabel ) > 12 ? partieLabel.substring( 0, 12 ) + '...' : partieLabel}
                                                                                            <UncontrolledTooltip
                                                                                                defaultOpen={false}
                                                                                                placement="top"
                                                                                                target={uniqueIdTooltip}
                                                                                                delay={0}>
                                                                                                {partieLabel}
                                                                                            </UncontrolledTooltip>
                                                                                        </NavLink>
                                                                                    </NavItem>
                                                                                );
                                                                            } ) : null}

                                                                        </Nav>
                                                                    </Col>

                                                                </Row>
                                                            </CardHeader>
                                                            <CardBody>
                                                                <TabContent
                                                                    className="tab-space"
                                                                    activeTab={vTabs}
                                                                >
                                                                    {channelSize !== 0 ? map( channels, channel => {

                                                                        return (
                                                                            <TabPane tabId={channel.id}>
                                                                                {vTabs === channel.id ? (
                                                                                        <Channels
                                                                                            dossierType={dossier.type}
                                                                                            partieEmail={null}
                                                                                            showCreator={true}
                                                                                            vckeySelected={vckeySelected}
                                                                                            history={history}
                                                                                            enumRights={enumRights}
                                                                                            emailPayUser={email}
                                                                                            showMessagePopup={showMessagePopup}
                                                                                            isLoadingSave={isLoadingSave}
                                                                                            label={label}
                                                                                            affaireId={affaireId}
                                                                                            channelUpdated={_updatePartie}
                                                                                            channelProp={channel}/>
                                                                                    ) :
                                                                                    <ReactLoading className="loading"
                                                                                                  height={'20%'}
                                                                                                  width={'20%'}/>
                                                                                }
                                                                            </TabPane>
                                                                        );
                                                                    } ) : null}
                                                                </TabContent>
                                                            </CardBody>
                                                        </Card>
                                                    </Col>
                                                ) : null}
                                            </Row>
                                        )
                                }

                            </TabPane>
                            <TabPane tabId="agenda">
                                {verticalTabsIcons === 'agenda' ? (
                                    <Card className="card-chart" style={{ minHeight: MAX_HEIGHT_CARD }}>
                                        <CardBody>
                                            <Agenda
                                                onlyDossier={true}
                                                auth0={props.auth0}
                                                dossierId={affaireId}
                                                history={history}
                                                userId={userId}
                                                vckeySelected={vckeySelected}
                                                language={language}
                                                enumRights={enumRights}
                                                email={email}
                                                label={label}/>
                                        </CardBody>
                                    </Card>
                                ) : null}
                            </TabPane>
                            <TabPane tabId="driveTab">
                                {verticalTabsIcons === 'driveTab' ? (
                                    <Card className="card-chart" style={{ minHeight: MAX_HEIGHT_CARD }}>
                                        <CardBody>
                                            <Drive
                                                currentPath={`dossiers/${dossier.year}/${padStart( dossier.num, 4, '0' )}/`}
                                                {...props}
                                            />
                                        </CardBody>
                                    </Card>
                                ) : null}
                            </TabPane>
                            <TabPane tabId="dev1">
                                {verticalTabsIcons === 'dev1' ? (
                                    <Card className="card-chart" style={{ minHeight: MAX_HEIGHT_CARD }}>
                                        <CardBody>
                                            <Mail
                                                userId={userId}
                                                email={email}
                                                dossierId={affaireId}
                                                vckeySelected={vckeySelected}
                                                showMessage={showMessagePopup}
                                                label={label}/>
                                        </CardBody>
                                    </Card>
                                ) : null}
                            </TabPane>
                            <TabPane tabId="dev2">
                                <Card className="card-chart" style={{ minHeight: MAX_HEIGHT_CARD }}>
                                    <CardBody>
                                        <Row>

                                            <Col lg={6} md={6} sm={12} xs={12}>
                                                <Button size={`lg`}
                                                        className="very-big-btn"
                                                        disabled={true}
                                                        block>Envoi en ligne de conclusion</Button>
                                            </Col>
                                            <Col lg={6} md={6} sm={12} xs={12}>
                                                <Button size={`lg`}
                                                        className="very-big-btn"
                                                        disabled={true}
                                                        block>Envoi en ligne de pièces</Button>
                                            </Col>

                                            <Col lg={6} md={6} sm={12} xs={12}>
                                                <Button size={`lg`}
                                                        className="very-big-btn"
                                                        disabled={true}
                                                        block>Envoi en ligne de requêtes</Button>
                                            </Col>
                                            <Col lg={6} md={6} sm={12} xs={12}>
                                                <Button size={`lg`}
                                                        className="very-big-btn"
                                                        disabled={true}
                                                        block>Envoi physique</Button>
                                            </Col>

                                            <Col lg={6} md={6} sm={12} xs={12}>
                                                <Button size={`lg`}
                                                        className="very-big-btn"
                                                        disabled={true}
                                                        block>Envoi en ligne de lettres</Button>
                                            </Col>
                                        </Row>
                                    </CardBody>
                                </Card>
                            </TabPane>
                        </TabContent>
                    </Col>
                </Row>
                <Row>
                    {/* INVOICE, COMPTA */}
                    <Col md="4" sm={6}>
                        <Card>
                            <CardHeader>
                                <Row>
                                    <Col md={10}>
                                        <Nav className="nav-pills-info" pills>
                                            <NavItem>
                                                <NavLink
                                                    data-toggle="tab"
                                                    href="#pablo"
                                                    className={
                                                        horizontalTabs === 'invoice'
                                                            ? 'active'
                                                            : ''
                                                    }
                                                    onClick={e =>
                                                        changeActiveTab( e, 'horizontalTabs', 'invoice' )
                                                    }
                                                >
                                                    {label.affaire.label17}

                                                </NavLink>
                                            </NavItem>

                                            <NavItem>
                                                <NavLink
                                                    data-toggle="tab"
                                                    href="#pablo"
                                                    className={
                                                        horizontalTabs === 'honoraires'
                                                            ? 'active'
                                                            : ''
                                                    }
                                                    onClick={e =>
                                                        changeActiveTab( e, 'horizontalTabs', 'honoraires' )
                                                    }
                                                >
                                                    {label.affaire.label19}
                                                </NavLink>
                                            </NavItem>
                                            <NavItem>
                                                <NavLink
                                                    data-toggle="tab"
                                                    href="#pablo"
                                                    className={
                                                        horizontalTabs === 'tiers'
                                                            ? 'active'
                                                            : ''
                                                    }
                                                    onClick={e =>
                                                        changeActiveTab( e, 'horizontalTabs', 'tiers' )
                                                    }
                                                >
                                                    {label.affaire.label20}
                                                </NavLink>
                                            </NavItem>
                                        </Nav>
                                    </Col>
                                    <Col md={2}>
                                        {horizontalTabs === 'invoice' ? (
                                            <Link
                                                className="btn btn-primary btn-icon float-right"
                                                to={{
                                                    pathname: `/admin/create/invoice`,
                                                    query: {
                                                        affaireId: affaireId
                                                    }
                                                }}
                                            >
                                                <i className="tim-icons icon-simple-add"/>
                                            </Link>
                                        ) : null}
                                        {horizontalTabs === 'honoraires' ? (
                                            <Link
                                                className="btn btn-primary btn-icon float-right"
                                                to={{
                                                    pathname: `/admin/create/compta`,
                                                    query: {
                                                        affaireId: affaireId,
                                                        honoraires: true
                                                    }
                                                }}
                                            >
                                                <i className="tim-icons icon-simple-add"/>
                                            </Link>
                                        ) : null}
                                        {horizontalTabs === 'tiers' ? (
                                            <Link
                                                className="btn btn-primary btn-icon float-right"
                                                to={{
                                                    pathname: `/admin/create/compta`,
                                                    query: {
                                                        affaireId: affaireId,
                                                        tiers: true
                                                    }
                                                }}
                                            >
                                                <i className="tim-icons icon-simple-add"/>
                                            </Link>
                                        ) : null}
                                    </Col>
                                </Row>
                            </CardHeader>
                            <CardBody>
                                <TabContent
                                    className="tab-space"
                                    activeTab={horizontalTabs}
                                >
                                    <TabPane tabId="invoice">
                                        <InvoiceAffaireTable
                                            vckeySelected={vckeySelected}
                                            label={label}
                                            affaireid={affaireId}/>
                                    </TabPane>
                                    <TabPane tabId="honoraires">
                                        {horizontalTabs === 'honoraires' ? (
                                                <HonoraireAffaireTable
                                                    history={props.history}
                                                    showMessagePopupFrais={showMessagePopupFraisAdmin}
                                                    currency={currency}
                                                    label={label}
                                                    updateFrais={updateFrais}
                                                    affaireid={affaireId}/>
                                            ) :
                                            <ReactLoading className="loading" height={'20%'} width={'20%'}/>
                                        }
                                    </TabPane>
                                    <TabPane tabId="tiers">
                                        {horizontalTabs === 'tiers' ? (
                                                <TiersAffaireTable
                                                    history={props.history}
                                                    showMessagePopupFrais={showMessagePopupFraisAdmin}
                                                    currency={currency}
                                                    label={label}
                                                    updateFrais={updateFrais}
                                                    affaireid={affaireId}/>
                                            ) :
                                            <ReactLoading className="loading" height={'20%'} width={'20%'}/>
                                        }
                                    </TabPane>
                                </TabContent>
                            </CardBody>
                        </Card>
                    </Col>
                    {/* PRESTATION, FRAIS ADMIN */}
                    <Col md="5" sm={6}>
                        <Card>
                            <CardTitle>
                                <Button
                                    onClick={toggleModalLargePrestation}
                                    className="btn-icon float-right"
                                    color="primary"
                                    data-placement="bottom"
                                    id="tooltip811118932"
                                    type="button"
                                    size="sm"
                                >
                                    <i className="tim-icons icon-paper"/>
                                </Button>
                                <UncontrolledTooltip
                                    delay={0}
                                    placement="bottom"
                                    target="tooltip811118932"
                                >
                                    {label.dashboard.label6}
                                </UncontrolledTooltip>
                            </CardTitle>
                            <CardHeader>
                                <Row>
                                    <Col md={10}>
                                        <Nav className="nav-pills-info" pills>
                                            <NavItem>
                                                <NavLink
                                                    data-toggle="tab"
                                                    href="#pablo"
                                                    className={
                                                        horizontalPrestationTabs === 'prestation'
                                                            ? 'active'
                                                            : ''
                                                    }
                                                    onClick={e =>
                                                        changeActiveTab( e, 'horizontalPrestationTabs', 'prestation' )
                                                    }
                                                >
                                                    {label.affaire.label3}
                                                </NavLink>
                                            </NavItem>
                                            <NavItem>
                                                <NavLink
                                                    data-toggle="tab"
                                                    href="#pablo"
                                                    className={
                                                        horizontalPrestationTabs === 'frais'
                                                            ? 'active'
                                                            : ''
                                                    }
                                                    onClick={e =>
                                                        changeActiveTab( e, 'horizontalPrestationTabs', 'frais' )
                                                    }
                                                >
                                                    {label.affaire.label4}
                                                </NavLink>
                                            </NavItem>
                                            <NavItem>
                                                <NavLink
                                                    data-toggle="tab"
                                                    href="#pablo"
                                                    className={
                                                        horizontalPrestationTabs === 'debours'
                                                            ? 'active'
                                                            : ''
                                                    }
                                                    onClick={e =>
                                                        changeActiveTab( e, 'horizontalPrestationTabs', 'debours' )
                                                    }
                                                >
                                                    {label.affaire.label15}
                                                </NavLink>
                                            </NavItem>
                                            <NavItem>
                                                <NavLink
                                                    data-toggle="tab"
                                                    href="#pablo"
                                                    className={
                                                        horizontalPrestationTabs === 'fraisCollaboration'
                                                            ? 'active'
                                                            : ''
                                                    }
                                                    onClick={e =>
                                                        changeActiveTab( e, 'horizontalPrestationTabs', 'fraisCollaboration' )
                                                    }
                                                >
                                                    {label.affaire.label16}
                                                </NavLink>
                                            </NavItem>
                                        </Nav>
                                    </Col>
                                    <Col md={2}>
                                        {horizontalPrestationTabs === 'debours' ? (
                                            <Link
                                                className="btn btn-primary btn-icon float-right"
                                                to={{
                                                    pathname: `/admin/create/compta`,
                                                    query: {
                                                        affaireId: affaireId,
                                                        debours: true
                                                    }
                                                }}
                                            >
                                                <i className="tim-icons icon-simple-add"/>
                                            </Link>
                                        ) : null}
                                        {horizontalPrestationTabs === 'fraisCollaboration' ? (
                                            <Link
                                                className="btn btn-primary btn-icon float-right"
                                                to={{
                                                    pathname: `/admin/create/compta`,
                                                    query: {
                                                        affaireId: affaireId,
                                                        frais: true
                                                    }
                                                }}
                                            >
                                                <i className="tim-icons icon-simple-add"/>
                                            </Link>
                                        ) : null}
                                        {horizontalPrestationTabs === 'frais' || horizontalPrestationTabs === 'prestation' ? (
                                            <Button
                                                className="btn-icon float-right"
                                                color="primary"
                                                type="button"
                                                onClick={_openModalFrais}
                                            >
                                                <i className="tim-icons icon-simple-add"/>
                                            </Button>
                                        ) : null}
                                    </Col>
                                </Row>
                            </CardHeader>
                            <CardBody>
                                <TabContent
                                    className="tab-space"
                                    activeTab={horizontalPrestationTabs}
                                >
                                    <TabPane tabId="prestation">
                                        <PrestationAffaireTable
                                            history={props.history}
                                            updatePrestation={updatePrestation}
                                            showMessagePopupFrais={showMessagePopupFrais}
                                            currency={currency}
                                            label={label}
                                            vckeySelected={vckeySelected}
                                            affaireid={affaireId}/>

                                    </TabPane>
                                    <TabPane tabId="frais">
                                        {horizontalPrestationTabs === 'frais' ? (
                                                <FraisAffaireTable
                                                    history={props.history}
                                                    showMessagePopupFrais={showMessagePopupFraisAdmin}
                                                    currency={currency}
                                                    label={label}
                                                    updateFrais={updateFrais}
                                                    affaireid={affaireId}/>
                                            ) :
                                            <ReactLoading className="loading" height={'20%'} width={'20%'}/>
                                        }

                                    </TabPane>
                                    <TabPane tabId="debours">
                                        {horizontalPrestationTabs === 'debours' ? (
                                                <DeboursAffaireTable
                                                    history={props.history}
                                                    showMessagePopupFrais={showMessagePopupFraisAdmin}
                                                    currency={currency}
                                                    label={label}
                                                    updateFrais={updateFrais}
                                                    affaireid={affaireId}/>
                                            ) :
                                            <ReactLoading className="loading" height={'20%'} width={'20%'}/>
                                        }
                                    </TabPane>
                                    <TabPane tabId="fraisCollaboration">
                                        {horizontalPrestationTabs === 'fraisCollaboration' ? (
                                                <FraiCollaborationAffaireTable
                                                    history={props.history}
                                                    showMessagePopupFrais={showMessagePopupFraisAdmin}
                                                    currency={currency}
                                                    label={label}
                                                    updateFrais={updateFrais}
                                                    affaireid={affaireId}/>
                                            ) :
                                            <ReactLoading className="loading" height={'20%'} width={'20%'}/>
                                        }
                                    </TabPane>
                                </TabContent>
                            </CardBody>
                        </Card>
                    </Col>
                    {/* FINANCE */}
                    <Col md={3} sm={6}>
                        <Card>
                            <CardHeader>
                                <CardTitle tag="h4">Financier</CardTitle>
                            </CardHeader>
                            <CardBody>
                                {affaireId ? (
                                    <Finance
                                        label={label}
                                        currency={currency}
                                        vckeySelected={vckeySelected}
                                        affaireid={affaireId}/>
                                ) : (
                                    <CircularProgress size={50}/>
                                )}
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
                {/* UPDATE MODAL CLIENT */}
                {!isNil( clientModal ) ? (
                    <RegisterClientModal
                        history={props.history}
                        isCreate={false}
                        userId={props.userId}
                        label={label}
                        idClient={clientModal}
                        vckeySelected={vckeySelected}
                        fullName={props.fullName}
                        language={props.language}
                        clientUpdated={_clientUpdated}
                        toggleClient={_toggleClient}
                        modal={!isNil( clientModal )}
                    />
                ) : null}

                {/* REGISTER FRAIS OR PRESTATION */}
                {openModalFrais ?
                    (
                        <RegisterFraisModal
                            history={props.history}
                            isCreated={true}
                            profile={props.profile}
                            label={label}
                            currency={currency}
                            affaireId={affaireId}
                            idClient={clientModal}
                            vckeySelected={vckeySelected}
                            fullName={props.fullName}
                            language={props.language}
                            clientUpdated={_clientUpdated}
                            showMessagePopupFrais={showMessagePopupFraisAdmin}
                            toggleFraisModal={_openModalFrais}
                            toggleClientFrais={_doneFrais}
                            modal={openModalFrais}
                        />
                    ) : null}
                {/* SHARE DOSSIER ON ACTION */}
                {openModalShare ?
                    (
                        <ShareModal
                            history={props.history}
                            profile={props.profile}
                            label={label}
                            currency={currency}
                            affaireId={affaireId}
                            vckeySelected={vckeySelected}
                            fullName={props.fullName}
                            language={props.language}
                            modal={openModalShare}
                            toggleModal={_openShare}
                            showMessagePopup={showMessagePopup}
                        />
                    ) : null}
                {/* TEMPLATE */}
                {openModalTemplate ?
                    (
                        <TemplateModal
                            history={props.history}
                            profile={props.profile}
                            label={label}
                            currency={currency}
                            affaireId={affaireId}
                            vckeySelected={vckeySelected}
                            fullName={props.fullName}
                            language={props.language}
                            modal={openModalTemplate}
                            toggleModal={_openTemplate}
                            showMessagePopup={showMessagePopup}
                        />
                    ) : null}
                {/* OPEN REPORT */}
                {openModalReportEtat ?
                    (
                        <ReportEtatHonoraireModal
                            history={props.history}
                            profile={props.profile}
                            label={label}
                            currency={currency}
                            affaireId={affaireId}
                            vckeySelected={vckeySelected}
                            fullName={props.fullName}
                            language={props.language}
                            modal={openModalReportEtat}
                            toggleModal={_generateEtatHonoraire}
                            showMessage={showMessagePopup}
                        />
                    ) : null}
                {/* COMUNICATE WITH IF THERE IS NO CASE  */}
                {communicateWithPopup ?
                    (
                        <CommunicateWithModal
                            history={props.history}
                            profile={props.profile}
                            label={label}
                            currency={currency}
                            email={email}
                            affaireId={affaireId}
                            vckeySelected={vckeySelected}
                            clientList={clientList}
                            language={props.language}
                            modal={communicateWithPopup}
                            toggleModal={_communicateWithPopup}
                            showMessage={showMessagePopup}
                        />
                    ) : null}
                {/* OPEN TO CREATE A CONSEIL  */}
                {openModalConseil ?
                    (
                        <ConseilModal
                            isCreate={true}
                            partie={null}
                            dossierType={dossier.type}
                            partiesCas={partiesCas}
                            createPartie={_createPartie}
                            label={label}
                            affaireId={affaireId}
                            modal={openModalConseil}
                            toggleModal={_toggleCreateConseil}
                            showMessage={showMessagePopup}
                        />
                    ) : null}
                {openDialogPrestation ? (
                    <ModalReportPrestation
                        vckeySelected={vckeySelected}
                        dossierId={affaireId}
                        showMessage={showMessagePopup}
                        label={label}
                        openDialog={openDialogPrestation}
                        toggle={toggleModalLargePrestation}/>
                ) : null}
            </div>
        </>
    );
}
