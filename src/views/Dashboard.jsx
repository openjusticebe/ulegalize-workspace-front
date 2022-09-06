import React, { useEffect, useRef, useState } from 'react';
// reactstrap components
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    CardTitle,
    Col,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Nav,
    NavItem,
    NavLink,
    PopoverBody,
    PopoverHeader,
    Row,
    TabContent,
    TabPane,
    UncontrolledPopover,
} from 'reactstrap';
import ReactLoading from 'react-loading';
// nodejs library that concatenates classes
import { Link } from 'react-router-dom';
import { getDate, getDateDetails } from '../utils/DateUtils';
import NotificationAlert from 'react-notification-alert';
import Agenda from '../components/Calendar/Agenda';
import { getAllRecent } from '../services/DashboardService';
import ModalReportInvoice from './popup/reports/ModalReportInvoice';
import { useAuth0 } from '@auth0/auth0-react';
import ReactTableLocal from '../components/ReactTableLocal';
import ModalCheckSessionDrive from './popup/drive/ModalCheckSessionDrive';
import { getOptionNotification } from '../utils/AlertUtils';
import { getStatusEmailRegistered } from './affaire/mail/recommande/StatusEmailRegistered';
import ReactBSAlert from 'react-bootstrap-sweetalert';
import EmailDTO from '../model/affaire/email/EmailDTO';
import DocumentDTO from '../model/postbird/DocumentDTO';
import { getFrenchStatus, getStatusPostBird } from './affaire/mail/StatusPostBird';
import MailPostBirdGenerator from './affaire/mail/MailPostBirdGenerator';
import { checkPaymentActivated } from '../services/PaymentServices';
import ModalNoActivePayment from './affaire/popup/ModalNoActivePayment';
import { getDocumentsMail } from '../services/PostBirdServices';
import ModalEMailSign from './affaire/mail/recommande/ModalEMailSign';
import { getEMailRegisteredList } from '../services/EmailRegisteredService';
import SignatureDTO from '../model/usign/SignatureDTO';
import ModalUploadSignDocument from './affaire/popup/ModalUploadSignDocument';
import { attachFileCase, downloadFileAttached } from '../services/transparency/CaseService';
import { attachEsignDocumentByVcKey, getUsignByVcKey } from '../services/transparency/UsignService';
import ErrorOutlineOutlinedIcon from '@material-ui/icons/ErrorOutlineOutlined';
import { CustomPopover } from './affaire/StatusQuestionPopup';
import CreateIcon from '@material-ui/icons/Create';
import { downloadWithName } from '../utils/TableUtils';
import ModalUpdateCase from './popup/cases/ModalUpdateCase';
import ModalEMailRegistered from './affaire/mail/recommande/ModalEMailRegistered';
import ChannelDTO from '../model/affaire/ChannelDTO';
import ModalEMailRegisteredStatus from './affaire/mail/recommande/ModalEMailRegisteredStatus';
import ModalUploadSignDocumentReadOnly from './affaire/popup/ModalUploadSignDocumentReadOnly';
import ModalDetectMail from './affaire/mail/ModalDetectMail';

const isNil = require( 'lodash/isNil' );
const isEmpty = require( 'lodash/isEmpty' );
const map = require( 'lodash/map' );
const join = require( 'lodash/join' );

export const Dashboard = ( props ) => {
    const {
        label, userId, language, email, history, currency, fullName,
        enumRights, auth0, vckeySelected, driveType
    } = props;
    const notificationAlert = useRef( null );

    const [isLoading, setIsLoading] = useState( false );
    const [modalDetails, setModalDetails] = useState( false );
    const [casesModal, setCasesModal] = useState( [] );
    const [openDialogInvoice, setOpenDialogInvoice] = useState( false );
    const [checkTokenDrive, setCheckTokenDrive] = useState( false );
    const [dataDossiers, setDataDossiers] = useState( null );
    const [dataEmailRegistered, setDataEmailRegistered] = useState( null );
    const [dataMail, setDataMail] = useState( null );
    const [dataUsign, setDataUsign] = useState( null );
    const [dataCorresp, setDatacorresp] = useState( null );
    const [dataSharedAffaires, setDataSharedAffaires] = useState( null );
    const [horizontalTabs, setHorizontalTabs] = useState( 'affaire' );
    const { getAccessTokenSilently } = useAuth0();
    const [deleteAlert, setDeleteAlert] = useState( null );
    const mailSelected = useRef( null );
    const [showMail, setShowMail] = useState( false );
    const [showEMail, setShowEMail] = useState( false );
    const [showEMailStatus, setShowEMailStatus] = useState( false );
    const emailRef = useRef( true );
    const countryCodeRef = useRef( true );
    const documentIdRef = useRef( true );
    const payment = useRef( false );
    const usignIdRef = useRef( null );
    const [modalEmailDisplay, setModalEmailDisplay] = useState( false );
    const [modalDetectMail, setModalDetectMail] = useState( false );
    const [modalUsignlDisplay, setModalUsignlDisplay] = useState( false );
    const [modalUsignlDisplayReadOnly, setModalUsignlDisplayReadOnly] = useState( false );
    const [modalNotPaidSignDocument, setModalNotPaidSignDocument] = useState( false );

    const toggleModalLargeInvoice = () => {
        setOpenDialogInvoice( !setOpenDialogInvoice );
    };

    const _showMessagePopup = ( message, type ) => {
        notificationAlert.current.notificationAlert(
            getOptionNotification( message, type )
        );
    };
    const _downloadFile = async ( caseId, file ) => {
        const accessToken = await getAccessTokenSilently();

        const result = await downloadFileAttached( accessToken, caseId, file.value );
        //const name = fileContent.name;
        //const arrn = name.split( '/' );
        if ( result.error ) {
            notificationAlert.current.notificationAlert( getOptionNotification( label.affaire.error1, 'danger' ) );
        } else {
            downloadWithName( result.data, file.value );
        }

    };
    const _attachFileCase = async ( file ) => {
        setIsLoading( true );
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

        // only if its different than null
        setIsLoading( false );

    };

    const _togglePopupCheckSession = ( message, type ) => {
        if ( !isNil( message ) && !isNil( type ) ) {
            _showMessage( message, type );
        }
        setCheckTokenDrive( !checkTokenDrive );
    };

    const toggleUpdateCase = ( caseId ) => {
        setCasesModal( caseId );
        setModalDetails( !modalDetails );
    };

    useEffect( () => {
        (async () => {
            try {
                const accessToken = await getAccessTokenSilently();

                getAllRecent( accessToken, vckeySelected, ( affaires ) => {
                    const dataDossiersTmp = affaires ? affaires.map( ( affaire ) => {
                        return {
                            label: (<Link to={`/admin/affaire/${affaire.id}`}>{affaire.label}</Link>),
                            year: (affaire.year)
                        };
                    } ) : [];
                    setDataDossiers( dataDossiersTmp );

                }, ( sharedAffaires ) => {
                    const dataSharedAffairesTmp = sharedAffaires ? sharedAffaires.map( ( shared ) => {
                        return {
                            label: (<Link to={`/admin/affaire/${shared.id}`}>{shared.label}</Link>),
                            year: (shared.year)
                        };
                    } ) : [];

                    setDataSharedAffaires( dataSharedAffairesTmp );

                }, ( emailRegistered ) => {
                    const dataemailRegisteredTmp = emailRegistered ? emailRegistered.map( ( registered ) => {
                        return new EmailDTO( registered );
                    } ) : [];

                    setDataEmailRegistered( dataemailRegisteredTmp );

                }, ( mail ) => {
                    const dataMailTmp = mail ? mail.map( ( registered ) => {
                        return new DocumentDTO( registered );
                    } ) : [];

                    setDataMail( dataMailTmp );

                }, ( usign ) => {
                    const dataMailTmp = usign ? usign.map( ( sign ) => {
                        return new SignatureDTO( sign );
                    } ) : [];

                    setDataUsign( dataMailTmp );

                }, ( corresp ) => {
                    const dataCorrTmp = corresp ? corresp.map( ( sign ) => {
                        return new ChannelDTO( sign );
                    } ) : [];

                    setDatacorresp( dataCorrTmp );

                } );
                if ( !isNil( driveType ) && driveType === 'dropbox' ) {
                    setCheckTokenDrive( true );
                }
            } catch ( e ) {
                //logout( { returnTo: process.env.REACT_APP_MAIN_URL } );

            }
        })();
    }, [getAccessTokenSilently] );

    const columnsDossier = React.useMemo(
        () => [
            {
                Header: label.affaireList.label1,
                accessor: 'label',
                width: 300

            },
            {
                Header: label.affaireList.label2,
                accessor: 'year',
                width: 50

            }
        ] );
    const columnsSharedAffaire = React.useMemo(
        () => [
            {
                Header: label.affaireList.label1,
                accessor: 'label',
                width: 300

            },
            {
                Header: label.affaireList.label2,
                accessor: 'year',
                width: 50

            }
        ] );
    const columnsEmailRegistered = React.useMemo(
        () => [
            {
                Header: '#',
                accessor: 'id',
                Cell: row => {
                    return <div>
                        <Button
                            className="btn-icon btn-link margin-left-10"
                            onClick={() => {
                                openEMailRegistered( row.value );
                            }}
                            color="primary" size="sm">
                            <i className="fa fa-eye "/>
                        </Button>
                        {/* delivered ok => cannot be deleted */}
                        {parseInt( row.row.original.status ) <= 60 ? (
                            <Button
                                disabled={true}
                                className="btn-icon btn-link margin-left-10"
                                onClick={() => {
                                    deleteEMailRegistered( row.value );
                                }}
                                color="primary" size="sm">
                                <i className="fa fa-trash"/>
                            </Button>
                        ) : null}
                        {` `}
                    </div>;
                }
            },
            {
                Header: label.mail.subject,
                accessor: 'subject'
            },
            {
                Header: label.mail.dossier,
                accessor: 'dossierId',
                Cell: row => {
                    if ( !isNil( row.value ) ) {
                        return (
                            <div>
                                <Link to={`/admin/affaire/${row.value}`}>{label.mail.dossier}</Link>
                            </div>
                        );
                    } else {
                        return (
                            <div>
                                <p>N/A</p>
                            </div>
                        );
                    }
                }
            },
            {
                Header: label.mail.label11,
                accessor: 'statusCode',
                Cell: row => {
                    return (
                        <Button
                            style={{ whiteSpace: 'break-spaces', width: '160px', textAlign: 'left' }}
                            className="btn-link"
                            size="sm"
                            onClick={() => {
                                openEMailRegisteredStatus( row.row.original.id );
                            }}
                            color="primary">
                            {getStatusEmailRegistered( row.value, label )}
                        </Button>
                    );
                }
            },
            {
                Header: label.mail.label12,
                accessor: 'creDate',
                Cell: row => {
                    return getDateDetails( row.value );
                }
            }
        ] );

    const columnsMail = React.useMemo(
        () => [
            {
                Header: '#',
                accessor: 'documentId',
                Cell: row => {
                    return <div style={{ display: 'flex' }}>
                        <Button
                            className="btn-icon btn-link margin-left-10"
                            onClick={() => {
                                mailSelected.current = row.value;
                                setShowMail( !showMail );
                            }}
                            color="primary" size="sm">
                            <i className="fa fa-eye "/>
                        </Button>
                        <Button
                            className="btn-icon btn-link margin-left-10"
                            onClick={() => {
                                _toggleMail( row.row.original.countryPost, row.value );
                            }}
                            color="primary" size="sm">
                            <i className="fa fa-paper-plane "/>
                        </Button>
                        {` `}
                    </div>;
                }
            },
            {
                Header: label.mail.label10,
                accessor: 'documentName',
                Cell: row => {
                    const docName = row.value;

                    return docName.length > 12 ? docName.substring( 0, 12 ) + '...'
                        : docName;

                }
            },
            {
                Header: label.mail.label36,
                accessor: 'countryPost'
            },
            {
                Header: label.mail.label11,
                accessor: 'status',
                Cell: row => {
                    if ( row.row.original.countryPost === 'FR' ) {
                        return getFrenchStatus( row.value, label );

                    } else {
                        return getStatusPostBird( row.value, label );

                    }
                }
            },
            {
                Header: label.mail.label12,
                accessor: 'creDate',
                Cell: row => {
                    return getDateDetails( row.value );
                }
            }
        ],

        [] );

    const columnsCorresp = React.useMemo(
        () => [
            {
                accessor: 'caseId',
                Header: '#',
                width: 150,
                Cell: row => {
                    return (<div>
                        <Button
                            className="btn-icon btn-link margin-left-10"
                            onClick={() => toggleUpdateCase( row.value )}
                            color="primary" size="sm">
                            <i className="fa fa-eye "/>
                        </Button>
                    </div>);
                }
            },
            {
                accessor: '_id',
                Header: label.affaire.label22,
                width: 140,
                resizable: true,
                Cell: row => {
                    return isNil( row.row.original.affaireItem ) ? null : (
                        <Link
                            to={`/admin/affaire/${row.row.original.affaireItem.value}`}>{row.row.original.affaireItem.label}</Link>
                    );
                }
            },
            {
                accessor: 'parties',
                Header: label.affaire.label44,
                Cell: row => {

                    return map( row.value, part => {
                        return (<p>
                                {part.email}
                            </p>
                        );
                    } );
                }
            },
            {
                accessor: 'lastComments',
                Header: label.affaire.label28,
                Cell: row => {

                    return (
                        <p>{row.value}</p>
                    );
                }
            },
            {
                accessor: 'createDate',
                Header: label.affaire.label30,
                Cell: row => {
                    return (
                        <>{getDate( row.value )}</>
                    );
                },
                width: 120

            }
        ],

        [] );
    const columnsUsign = React.useMemo(
        () => [
            {
                Header: '#',
                accessor: 'usignId',
                Cell: row => {
                    let statusGlyph = (<Col sm={6} md={6}>
                        <Button
                            color="primary"
                            className="btn-icon btn-link margin-left-10"
                            type="button"
                            id={`PopoverNormal-${row.value}`}>
                            <ErrorOutlineOutlinedIcon/>
                        </Button>
                        <UncontrolledPopover trigger="focus" placement="left" target={`PopoverNormal-${row.value}`}>
                            <PopoverHeader>{label.casJuridiqueForm.status}</PopoverHeader>
                            <PopoverBody>
                                <CustomPopover label={label}/>
                            </PopoverBody>
                        </UncontrolledPopover>
                    </Col>);
                    if ( row.row.original.status === 'SIGN' ) {
                        statusGlyph = (<Col sm={6} md={6}>
                            <Button
                                type="button"
                                color="primary"
                                className="btn-icon btn-link margin-left-10"
                                id={`PopoverSign-${row.value}`}>
                                <CreateIcon className="green"/>
                            </Button>
                            <UncontrolledPopover trigger="focus" placement="left" target={`PopoverSign-${row.value}`}>
                                <PopoverHeader>{label.casJuridiqueForm.status}</PopoverHeader>
                                <PopoverBody>
                                    <CustomPopover label={label}/>
                                </PopoverBody>
                            </UncontrolledPopover>
                        </Col>);
                    } else if ( row.row.original.status === 'WAITING' ) {
                        statusGlyph = (<Col sm={6} md={6}>
                            <Button
                                type="button"
                                id={`PopoverStart-${row.value}`}
                                color="primary"
                                className="btn-icon btn-link margin-left-10">
                                <CreateIcon className="red glyphicon-ring"/>
                            </Button>
                            <UncontrolledPopover trigger="focus" placement="left" target={`PopoverStart-${row.value}`}>
                                <PopoverHeader>{label.casJuridiqueForm.status}</PopoverHeader>
                                <PopoverBody>
                                    <CustomPopover label={label}/>
                                </PopoverBody>
                            </UncontrolledPopover>
                        </Col>);
                    } else if ( row.row.original.status === 'START' ) {
                        statusGlyph = (<Col sm={6} md={6}>
                            <Button
                                type="button"
                                id={`PopoverStart-${row.value}`}
                                color="primary"
                                className="btn-icon btn-link margin-left-10">
                                <CreateIcon className="red glyphicon-ring"/>
                            </Button>
                            <UncontrolledPopover trigger="focus" placement="left" target={`PopoverStart-${row.value}`}>
                                <PopoverHeader>{label.casJuridiqueForm.status}</PopoverHeader>
                                <PopoverBody>
                                    <CustomPopover label={label}/>
                                </PopoverBody>
                            </UncontrolledPopover>
                        </Col>);
                    } else if ( row.row.original.status === 'NORMAL' ) {
                        statusGlyph = (<Col sm={6} md={6}>
                            <Button
                                type="button"
                                id={`PopoverNormal-${row.value}`}
                                size="sm"
                                color="primary"
                                className="btn-icon btn-link margin-left-10">
                                <ErrorOutlineOutlinedIcon/>
                            </Button>
                            <UncontrolledPopover trigger="focus" placement="left" target={`PopoverNormal-${row.value}`}>
                                <PopoverHeader>{label.casJuridiqueForm.status}</PopoverHeader>
                                <PopoverBody>
                                    <CustomPopover label={label}/>
                                </PopoverBody>
                            </UncontrolledPopover>
                        </Col>);
                    }
                    return <Row>
                        {statusGlyph}

                        <Button
                            className="btn-icon btn-link margin-left-10"
                            onClick={() => {
                                _openUsignReadOnly( row.value );
                            }}
                            color="primary" size="sm">
                            <i className="fa fa-paper-plane "/>
                        </Button>
                        {` `}
                    </Row>;
                }
            },
            {
                Header: label.mail.label10,
                accessor: 'documentName'
            },
            {
                Header: label.mail.label12,
                accessor: 'createDate',
                Cell: row => {
                    return getDateDetails( row.value );
                }
            }
        ],

        [] );

    const _toggleMail = async ( country, documentId ) => {
        documentIdRef.current = documentId;
        countryCodeRef.current = country;
        setModalDetectMail( !modalDetectMail );
    };

    const _openUsign = async () => {
        const accessToken = await getAccessTokenSilently();

        let resultPayment = await checkPaymentActivated( accessToken );
        if ( !isNil( resultPayment ) ) {
            payment.current = resultPayment.data;
            if ( payment.current === true ) {
                setModalUsignlDisplay( !modalUsignlDisplay );
            } else {
                setModalNotPaidSignDocument( !modalNotPaidSignDocument );
            }
        }
    };
    const _openUsignReadOnly = async ( usignId ) => {
        usignIdRef.current = usignId;
        const accessToken = await getAccessTokenSilently();

        let resultPayment = await checkPaymentActivated( accessToken );
        if ( !isNil( resultPayment ) ) {
            payment.current = resultPayment.data;
            if ( payment.current === true ) {
                setModalUsignlDisplayReadOnly( !modalUsignlDisplayReadOnly );
            } else {
                setModalNotPaidSignDocument( !modalNotPaidSignDocument );
            }
        }
    };

    const _openEmail = async () => {
        const accessToken = await getAccessTokenSilently();

        let resultPayment = await checkPaymentActivated( accessToken );
        if ( !isNil( resultPayment ) ) {
            payment.current = resultPayment.data;
            if ( payment.current === true ) {
                setModalEmailDisplay( !modalEmailDisplay );
            } else {
                setModalNotPaidSignDocument( !modalNotPaidSignDocument );
            }
        }
    };

    const _attachEsignDocument = async ( file ) => {
        const accessToken = await getAccessTokenSilently();

        if ( isNil( file ) ) {
            notificationAlert.current.notificationAlert( getOptionNotification( label.affaire.error2, 'danger' ) );
            return;
        }
        notificationAlert.current.notificationAlert( getOptionNotification( label.affaire.label9, 'warning' ) );

        const result = await attachEsignDocumentByVcKey( accessToken, file );

        if ( !result.error ) {
            notificationAlert.current.notificationAlert( getOptionNotification( label.affaire.success1, 'success' ) );
        }
        const resultUsign = await getUsignByVcKey( accessToken, 0, 5 );

        if ( !resultUsign.error && resultUsign.data.content ) {
            const dataUsignTmp = resultUsign.data.content ? resultUsign.data.content.map( ( sign ) => {
                return new SignatureDTO( sign );
            } ) : [];

            setDataUsign( dataUsignTmp );
        }
    };

    const showMailFun = () => {
        setShowMail( !showMail );
    };

    const openEMailRegistered = ( id ) => {
        emailRef.current = id;
        setShowEMail( !showEMail );
    };

    const openEMailRegisteredStatus = ( id ) => {
        emailRef.current = id;
        setShowEMailStatus( !showEMailStatus );
    };

    const deleteEMailRegistered = ( ticketToken ) => {
        setDeleteAlert( <ReactBSAlert
            warning
            style={{ display: 'block', marginTop: '30px' }}
            title={label.common.label10}
            onConfirm={() => {
                _deleteEMailRegistered( ticketToken );
            }}
            onCancel={() => { setDeleteAlert( null ); }}
            confirmBtnBsStyle="success"
            cancelBtnBsStyle="danger"
            confirmBtnText={label.common.label11}
            cancelBtnText={label.common.cancel}
            showCancel
            btnSize=""
        >
            {label.common.label12}
        </ReactBSAlert> );
    };

    const _deleteEMailRegistered = async ( ticketTokens ) => {
        notificationAlert.current.notificationAlert( getOptionNotification( label.common.success2, 'primary' ) );

    };
    const changeActiveTab = async ( e, tabState, tadName ) => {
        e.preventDefault();

        if ( tabState === 'horizontalTabs' ) {
            setHorizontalTabs( tadName );
        }

    };
    const _showMessage = async ( message, type ) => {
        if ( message && type ) {
            notificationAlert.current.notificationAlert( getOptionNotification( message, type ) );
        }
    };
    const _toggleUnPaid = () => {
        setModalNotPaidSignDocument( !modalNotPaidSignDocument );
    };
    const _updateMailList = async () => {
        const accessToken = await getAccessTokenSilently();
        const result = await getDocumentsMail( accessToken, 0, 5, null );

        if ( !result.error && result.data.content ) {
            const dataMailTmp = result.data.content ? result.data.content.map( ( registered ) => {
                return new DocumentDTO( registered );
            } ) : [];

            setDataMail( dataMailTmp );
        }
    };

    const _updateEmailList = async () => {
        const accessToken = await getAccessTokenSilently();
        const result = await getEMailRegisteredList( accessToken, 0, 5, null );

        if ( !result.error && result.data.content ) {
            const dataMailTmp = result.data.content ? result.data.content.map( ( registered ) => {
                return new EmailDTO( registered );
            } ) : [];

            setDataEmailRegistered( dataMailTmp );
        }
    };
    return (
        <>
            <div className="content">
                <div className="rna-container">
                    <NotificationAlert ref={notificationAlert}/>
                </div>

                {deleteAlert}

                <Row>
                    {/* RECENT AFFAIRE */}
                    <Col lg="4" sm={6}>
                        <Card style={{ height: '400px', overflow: 'auto' }}>
                            <CardHeader>
                                <Row>
                                    <Col md={10}>
                                        <Nav className="nav-pills-info" pills>
                                            <NavItem>
                                                <NavLink
                                                    data-toggle="tab"
                                                    href="#pablo"
                                                    className={
                                                        horizontalTabs === 'affaire'
                                                            ? 'active'
                                                            : ''
                                                    }
                                                    onClick={e =>
                                                        changeActiveTab( e, 'horizontalTabs', 'affaire' )
                                                    }
                                                >
                                                    {label.dashboard.label3}
                                                </NavLink>
                                            </NavItem>
                                            <NavItem>
                                                <NavLink
                                                    disabled={!(dataSharedAffaires && !isEmpty( dataSharedAffaires ))}
                                                    data-toggle="tab"
                                                    href="#pablo"
                                                    className={
                                                        horizontalTabs === 'sharedAffaire'
                                                            ? 'active'
                                                            : ''
                                                    }
                                                    onClick={e =>
                                                        changeActiveTab( e, 'horizontalTabs', 'sharedAffaire' )
                                                    }
                                                >
                                                    {label.dashboard.label5}
                                                </NavLink>
                                            </NavItem>
                                        </Nav>
                                    </Col>
                                    <Col md={2}>
                                        <h4>
                                            <Link className="btn btn-primary float-right btn-sm"
                                                  to="/admin/create/affaire">
                                                <i className="tim-icons icon-simple-add padding-icon-text"/>
                                                {label.common.create}
                                            </Link>
                                        </h4>
                                    </Col>
                                </Row>
                                <p className="card-category" style={{ marginBottom: 0 }}>
                                    {label.dashboard.label4}
                                </p>
                            </CardHeader>

                            <CardBody>
                                <TabContent
                                    className="tab-space no-padding"
                                    activeTab={horizontalTabs}
                                >
                                    {dataDossiers && !isNil( dataDossiers ) ? (
                                        <TabPane tabId="affaire">
                                            <ReactTableLocal columns={columnsDossier} data={dataDossiers}/>
                                        </TabPane>
                                    ) : (
                                        <ReactLoading className="loading" height={'20%'} width={'20%'}/>
                                    )}
                                    <TabPane tabId="sharedAffaire">
                                        {dataSharedAffaires && !isEmpty( dataSharedAffaires ) ? (
                                            <ReactTableLocal columns={columnsSharedAffaire} data={dataSharedAffaires}/>
                                        ) : (
                                            <ReactLoading className="loading" height={'20%'} width={'20%'}/>
                                        )}
                                    </TabPane>
                                </TabContent>


                            </CardBody>
                        </Card>
                    </Col>

                    {/* RECENT mail bpost */}
                    <Col lg="4" sm={6}>
                        <Card style={{ height: '400px', overflow: 'auto' }}>
                            <CardHeader>
                                <Row>
                                    <Col md={10}>
                                        <CardTitle>
                                            <h4>{label.dashboard.label2}
                                            </h4>
                                        </CardTitle>
                                    </Col>
                                    <Col md={2}>
                                        <Button
                                            onClick={() => _toggleMail()}
                                            className="float-right"
                                            color="primary"
                                            data-placement="bottom"
                                            type="button"
                                            size="sm"
                                        >
                                            <i className="tim-icons icon-send padding-icon-text"/> {' '}
                                            {label.common.send}
                                        </Button>
                                    </Col>
                                </Row>
                                <p className="card-category">
                                    {label.dashboard.label4}
                                </p>
                            </CardHeader>
                            <CardBody>
                                {dataMail && !isNil( dataMail ) ? (
                                    <ReactTableLocal columns={columnsMail} data={dataMail}/>
                                ) : (
                                    <ReactLoading className="loading" height={'20%'} width={'20%'}/>
                                )}
                            </CardBody>
                        </Card>
                    </Col>
                    {/* RECENT usign */}
                    <Col lg="4" sm={6}>
                        <Card style={{ height: '400px', overflow: 'auto' }}>
                            <CardHeader>
                                <Row>
                                    <Col md={10}>
                                        <CardTitle>
                                            <h4>{label.dashboard.label7}
                                            </h4>
                                        </CardTitle>
                                    </Col>
                                    <Col md={2}>
                                        <Button
                                            onClick={() => _openUsign()}
                                            className="float-right"
                                            color="primary"
                                            data-placement="bottom"
                                            type="button"
                                            size="sm"
                                        >
                                            <i className="tim-icons icon-send padding-icon-text"/> {' '}
                                            {label.common.send}
                                        </Button>
                                    </Col>
                                </Row>
                                <p className="card-category">
                                    {label.dashboard.label4}
                                </p>
                            </CardHeader>

                            <CardBody>
                                {dataUsign && !isNil( dataUsign ) ? (
                                    <ReactTableLocal columns={columnsUsign} data={dataUsign}/>
                                ) : (
                                    <ReactLoading className="loading" height={'20%'} width={'20%'}/>
                                )}
                            </CardBody>
                        </Card>
                    </Col>
                    {/* RECENT  email registered */}
                    <Col lg="4" sm={6}>
                        <Card style={{ height: '450px', overflow: 'auto' }}>
                            <CardHeader>
                                <Row>
                                    <Col md={10}>
                                        <CardTitle>
                                            <h4>{label.dashboard.label1}
                                            </h4>
                                        </CardTitle>
                                    </Col>
                                    <Col md={2}>
                                        <Button
                                            onClick={() => _openEmail()}
                                            className="float-right"
                                            color="primary"
                                            data-placement="bottom"
                                            id="tooltip811118932"
                                            type="button"
                                            size="sm"
                                        >
                                            <i className="tim-icons icon-send padding-icon-text"/> {' '}
                                            {label.common.send}                                        </Button>
                                    </Col>
                                </Row>
                                <p className="card-category">
                                    {label.dashboard.label4}
                                </p>
                            </CardHeader>

                            <CardBody>
                                {dataEmailRegistered && !isNil( dataEmailRegistered ) ? (
                                    <ReactTableLocal columns={columnsEmailRegistered} data={dataEmailRegistered}/>
                                ) : (
                                    <ReactLoading className="loading" height={'20%'} width={'20%'}/>
                                )}

                            </CardBody>
                        </Card>
                    </Col>

                    {/* RECENT correspondence */}
                    <Col lg="8" sm={6}>
                        <Card style={{ height: '450px', overflow: 'auto' }}>
                            <CardHeader>
                                <CardTitle>
                                    <h4>{label.dashboard.label8}
                                    </h4>
                                </CardTitle>
                                <p className="card-category">
                                    {label.dashboard.label4}
                                </p>
                            </CardHeader>
                            <CardBody>
                                {dataCorresp && !isNil( dataCorresp ) ? (
                                    <Row>
                                        <Col md="12">
                                            <ReactTableLocal columns={columnsCorresp} data={dataCorresp}/>

                                        </Col>
                                    </Row>
                                ) : (
                                    <ReactLoading className="loading" height={'20%'} width={'20%'}/>
                                )}
                            </CardBody>
                        </Card>
                    </Col>
                    <Col className="ml-auto mr-auto margin-bottom-15" md="12" sm={12}>
                        <Agenda
                            onlyDossier={false}
                            auth0={auth0}
                            userId={userId}
                            currency={currency}
                            fullName={fullName}
                            history={history}
                            email={email}
                            enumRights={enumRights}
                            vckeySelected={vckeySelected}
                            language={language}
                            label={label}/>
                    </Col>
                </Row>
            </div>

            <ModalReportInvoice openDialog={openDialogInvoice} toggle={toggleModalLargeInvoice}/>

            {checkTokenDrive ?
                (
                    <ModalCheckSessionDrive
                        label={label}
                        toggle={_togglePopupCheckSession}
                        checkTokenDrive={checkTokenDrive}/>
                ) : null}
            {/* POPUP SHOW PDF MAIL BPOST */}
            {showMail ? (
                <Modal size="lg" style={{ width: 'fit-content' }} isOpen={showMail} toggle={showMailFun}>
                    <ModalHeader>
                        <button type="button" className="close" data-dismiss="modal" aria-label="Close"
                                onClick={showMailFun}>
                            <i className="tim-icons icon-simple-remove"></i>
                        </button>
                        <h4 className="modal-title">{label.invoice.label106}</h4>
                    </ModalHeader>
                    <ModalBody>
                        <MailPostBirdGenerator
                            showMessage={_showMessage}
                            documentId={mailSelected.current}
                            label={label}
                        />
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary"
                                onClick={showMailFun}>
                            {label.common.close}
                        </Button>
                    </ModalFooter>
                </Modal>) : null}
            {showEMail ? (
                <ModalEMailRegistered
                    id={emailRef.current}
                    showMessage={_showMessage}
                    label={label}
                    isOpen={showEMail}
                    toggle={openEMailRegistered}
                />
            ) : null}

            {showEMailStatus ? (
                <ModalEMailRegisteredStatus
                    id={emailRef.current}
                    showMessage={_showMessage}
                    label={label}
                    isOpen={showEMailStatus}
                    toggle={openEMailRegisteredStatus}
                />
            ) : null}

            {/* POPUP CREATE MAIL BPOST */}
            {modalDetectMail ? (
                <ModalDetectMail
                    vckeySelected={vckeySelected}
                    dossierId={null}
                    documentId={documentIdRef.current}
                    countryCode={countryCodeRef.current}
                    label={label}
                    openPostMail={_toggleMail}
                    showMessage={_showMessage}
                    updateList={_updateMailList}
                />
            ) : null}
            {/* POPUP CREATE EMAIL REGISTERED */}
            {modalEmailDisplay ? (
                <ModalEMailSign
                    attachedFile={[]}
                    dossierId={null}
                    label={label}
                    userId={userId}
                    email={email}
                    vckeySelected={vckeySelected}
                    showMessage={_showMessage}
                    updateList={_updateEmailList}
                    showMessagePopup={_showMessage}
                    toggleModalDetails={_openEmail}
                    modalDisplay={modalEmailDisplay}/>
            ) : null}
            {/* POPUP USIGN */}
            {modalUsignlDisplay ? (
                <ModalUploadSignDocument
                    showMessagePopup={_showMessage}
                    affaireId={null}
                    vckeySelected={vckeySelected}
                    cas={null}
                    label={label}
                    payment={payment.current}
                    toggleModalDetails={_openUsign}
                    attachEsignDocument={_attachEsignDocument}
                    modalDisplay={modalUsignlDisplay}/>
            ) : null}
            {/* POPUP USIGN Read only*/}
            {modalUsignlDisplayReadOnly ? (
                <ModalUploadSignDocumentReadOnly
                    usignId={usignIdRef.current}
                    label={label}
                    showMessagePopup={_showMessage}
                    toggleModalDetails={_openUsignReadOnly}
                    modalDisplay={modalUsignlDisplayReadOnly}/>
            ) : null}
            {/* POPUP PAYMENT NOT REGISTERED */}
            {modalNotPaidSignDocument ? (
                <ModalNoActivePayment
                    label={label}
                    toggleModalDetails={_toggleUnPaid}
                    modalDisplay={modalNotPaidSignDocument}/>
            ) : null}
            {modalDetails ? (
                <ModalUpdateCase caseId={casesModal}
                                 email={email}
                                 enumRights={enumRights}
                                 label={label}
                                 lg={12} md={12}
                                 showMessagePopup={_showMessagePopup}
                                 isLoading={isLoading}
                                 history={history}
                                 downloadFile={_downloadFile}
                                 attachFileCase={_attachFileCase}
                                 attachEsignDocument={_attachEsignDocument}
                                 modalDetails={modalDetails}
                                 toggleModalDetails={toggleUpdateCase}
                                 vckeySelected={vckeySelected}
                                 userId={userId}
                />
            ) : null}
        </>
    );
};
/*************/
/* RECENT */
/*************/

export default Dashboard;
