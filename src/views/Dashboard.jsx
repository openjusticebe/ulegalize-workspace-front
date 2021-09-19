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
    UncontrolledTooltip,
} from 'reactstrap';
import ReactLoading from 'react-loading';
// nodejs library that concatenates classes
import { Link } from 'react-router-dom';
import { getDateDetails } from '../utils/DateUtils';
import NotificationAlert from 'react-notification-alert';
import Agenda from '../components/Calendar/Agenda';
import { getAllRecent } from '../services/DashboardService';
import ModalReportAffaire from './popup/reports/ModalReportAffaire';
import ModalReportInvoice from './popup/reports/ModalReportInvoice';
import { useAuth0 } from '@auth0/auth0-react';
import ReactTableLocal from '../components/ReactTableLocal';
import ModalCheckSessionDrive from './popup/drive/ModalCheckSessionDrive';
import { getOptionNotification } from '../utils/AlertUtils';
import { getStatusEmailRegistered } from './affaire/mail/recommande/StatusEmailRegistered';
import ReactBSAlert from 'react-bootstrap-sweetalert';
import EmailDTO from '../model/affaire/email/EmailDTO';
import DocumentDTO from '../model/postbird/DocumentDTO';
import { getStatusPostBird } from './affaire/mail/StatusPostBird';
import MailPostBirdGenerator from './affaire/mail/MailPostBirdGenerator';
import { checkPaymentActivated } from '../services/PaymentServices';
import ModalNoActivePayment from './affaire/popup/ModalNoActivePayment';
import ModalMail from './affaire/mail/ModalMail';
import { getDocumentsMail } from '../services/PostBirdServices';
import ModalEMailSign from './affaire/mail/recommande/ModalEMailSign';
import { getEMailRegisteredList } from '../services/EmailRegisteredService';
import SignatureDTO from '../model/usign/SignatureDTO';
import ModalUploadSignDocument from './affaire/popup/ModalUploadSignDocument';
import { downloadFileAttachedUsign } from '../services/transparency/CaseService';
import { attachEsignDocumentByVcKey, getUsignByVcKey } from '../services/transparency/UsignService';
import ErrorOutlineOutlinedIcon from '@material-ui/icons/ErrorOutlineOutlined';
import { CustomPopover } from './affaire/StatusQuestionPopup';
import CreateIcon from '@material-ui/icons/Create';
import GetApp from '@material-ui/icons/GetApp';
import { downloadWithName } from '../utils/TableUtils';

const isNil = require( 'lodash/isNil' );
const isEmpty = require( 'lodash/isEmpty' );

export const Dashboard = ( props ) => {
    const {
        label, userId, language, email, history,
        enumRights, auth0, vckeySelected, driveType
    } = props;
    const notificationAlert = useRef( null );

    const [openDialog, setOpenDialog] = useState( false );
    const [openDialogInvoice, setOpenDialogInvoice] = useState( false );
    const [checkTokenDrive, setCheckTokenDrive] = useState( false );
    const [dataDossiers, setDataDossiers] = useState( null );
    const [dataEmailRegistered, setDataEmailRegistered] = useState( null );
    const [dataMail, setDataMail] = useState( null );
    const [dataUsign, setDataUsign] = useState( null );
    const [dataSharedAffaires, setDataSharedAffaires] = useState( null );
    const [horizontalTabs, setHorizontalTabs] = useState( 'affaire' );
    const [horizontalEmailTabs, setHorizontalEmailTabs] = useState( 'emailRegistered' );
    const { getAccessTokenSilently } = useAuth0();
    const [deleteAlert, setDeleteAlert] = useState( null );
    const mailSelected = useRef( null );
    const [showMail, setShowMail] = useState( false );
    const documentIdRef = useRef( true );
    const payment = useRef( false );
    const [modalEmailDisplay, setModalEmailDisplay] = useState( false );
    const [modalPostMailDisplay, setModalPostMailDisplay] = useState( false );
    const [modalUsignlDisplay, setModalUsignlDisplay] = useState( false );
    const [modalNotPaidSignDocument, setModalNotPaidSignDocument] = useState( false );

    const toggleModalLarge = () => {
        setOpenDialog( !openDialog );
    };

    const toggleModalLargeInvoice = () => {
        setOpenDialogInvoice( !setOpenDialogInvoice );
    };

    const _togglePopupCheckSession = ( message, type ) => {
        if ( !isNil( message ) && !isNil( type ) ) {
            _showMessage( message, type );
        }
        setCheckTokenDrive( !checkTokenDrive );
    };
    const _handleDownloadFile = async ( usignId, filename ) => {
        const accessToken = await getAccessTokenSilently();

        const result = await downloadFileAttachedUsign( accessToken, usignId );
        //const name = fileContent.name;
        //const arrn = name.split( '/' );
        if ( result.error ) {
            notificationAlert.current.notificationAlert( getOptionNotification( label.affaire.error1, 'danger' ) );
        } else {
            downloadWithName( result.data, filename );
        }
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
                    return getStatusEmailRegistered( row.value, label );
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
                    return <div>
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
                                _openPostMail( row.value );
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
                accessor: 'documentName'
            },
            {
                Header: label.mail.label11,
                accessor: 'status',
                Cell: row => {
                    return getStatusPostBird( row.value, label );
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
                        <Col sm={1} md={1}>
                            <Button
                                size="sm"
                                color="primary"
                                disabled={row.row.original.status === 'WAITING'}
                                className="btn-icon"
                                onClick={() => _handleDownloadFile( row.row.original.usignId, row.row.original.documentName )}>
                                <GetApp/>
                            </Button>
                        </Col>
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
    const _openPostMail = async ( documentId ) => {
        documentIdRef.current = documentId;
        const accessToken = await getAccessTokenSilently();

        let resultPayment = await checkPaymentActivated( accessToken );
        if ( !isNil( resultPayment ) ) {
            payment.current = resultPayment.data;
            if ( payment.current === true ) {
                setModalPostMailDisplay( !modalPostMailDisplay );
            } else {
                setModalNotPaidSignDocument( !modalNotPaidSignDocument );
            }
        }
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
        if ( tabState === 'horizontalEmailTabs' ) {
            setHorizontalEmailTabs( tadName );
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
                                            <Link className="btn btn-icon btn-primary float-right btn-sm"
                                                          to="/admin/create/affaire">
                                                <i className="tim-icons icon-simple-add"/>
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

                    {/* RECENT usign */}
                    <Col lg="4" sm={6}>
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    <h4>{label.dashboard.label7}
                                        <Button
                                            onClick={() => _openUsign()}
                                            className="btn-icon float-right"
                                            color="primary"
                                            data-placement="bottom"
                                            id="tooltip811118932"
                                            type="button"
                                            size="sm"
                                        >
                                            <i className="tim-icons icon-simple-add"/>
                                        </Button>
                                        <UncontrolledTooltip
                                            delay={0}
                                            placement="bottom"
                                            target="tooltip811118932"
                                        >
                                            {label.dashboard.label7}
                                        </UncontrolledTooltip>
                                    </h4>
                                </CardTitle>
                                <p className="card-category">
                                    {label.dashboard.label4}
                                </p>
                            </CardHeader>
                            <CardBody>
                                {dataUsign && !isNil( dataUsign ) ? (
                                    <Row>
                                        <Col md="12">
                                            <ReactTableLocal columns={columnsUsign} data={dataUsign}/>

                                        </Col>
                                    </Row>
                                ) : (
                                    <ReactLoading className="loading" height={'20%'} width={'20%'}/>
                                )}
                            </CardBody>
                        </Card>
                    </Col>

                    {/* RECENT email registered, mail */}
                    {/* RECENT mail bpost */}
                    <Col lg="4" sm={6}>
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
                                                        horizontalEmailTabs === 'emailRegistered'
                                                            ? 'active'
                                                            : ''
                                                    }
                                                    onClick={e =>
                                                        changeActiveTab( e, 'horizontalEmailTabs', 'emailRegistered' )
                                                    }
                                                >
                                                    {label.dashboard.label1}
                                                </NavLink>
                                            </NavItem>
                                            <NavItem>
                                                <NavLink
                                                    data-toggle="tab"
                                                    href="#"
                                                    className={
                                                        horizontalEmailTabs === 'mailPost'
                                                            ? 'active'
                                                            : ''
                                                    }
                                                    onClick={e =>
                                                        changeActiveTab( e, 'horizontalEmailTabs', 'mailPost' )
                                                    }
                                                >
                                                    {label.dashboard.label2}
                                                </NavLink>
                                            </NavItem>
                                        </Nav>
                                    </Col>
                                    <Col md={2}>
                                        {horizontalEmailTabs === 'emailRegistered' ? (
                                            <Button
                                                onClick={() => _openEmail()}
                                                className="btn-icon float-right"
                                                color="primary"
                                                data-placement="bottom"
                                                type="button"
                                                size="sm"
                                            >
                                                <i className="tim-icons icon-simple-add"/>
                                            </Button>
                                        ): null}
                                        {horizontalEmailTabs === 'mailPost' ? (
                                            <Button
                                                onClick={() => _openPostMail()}
                                                className="btn-icon float-right"
                                                color="primary"
                                                data-placement="bottom"
                                                type="button"
                                                size="sm"
                                            >
                                                <i className="tim-icons icon-simple-add"/>
                                            </Button>
                                        ): null}
                                    </Col>
                                </Row>
                                <p className="card-category" style={{ marginBottom: 0 }}>
                                    {label.dashboard.label4}
                                </p>
                            </CardHeader>

                            <CardBody>
                                <TabContent
                                    className="tab-space no-padding"
                                    activeTab={horizontalEmailTabs}
                                >
                                    {dataEmailRegistered && !isNil( dataEmailRegistered ) ? (
                                            <TabPane tabId="emailRegistered">
                                                <ReactTableLocal columns={columnsEmailRegistered} data={dataEmailRegistered}/>
                                            </TabPane>
                                    ) : (
                                        <ReactLoading className="loading" height={'20%'} width={'20%'}/>
                                    )}
                                    <TabPane tabId="mailPost">
                                        {dataMail && !isNil( dataMail ) ? (
                                            <Row>
                                                <Col md="12">
                                                    <ReactTableLocal columns={columnsMail} data={dataMail}/>

                                                </Col>
                                            </Row>
                                        ) : (
                                            <ReactLoading className="loading" height={'20%'} width={'20%'}/>
                                        )}
                                    </TabPane>
                                </TabContent>


                            </CardBody>
                        </Card>
                    </Col>

                    <Col className="ml-auto mr-auto margin-bottom-15" md="12" sm={12}>
                        <Agenda
                            onlyDossier={false}
                            auth0={auth0}
                            userId={userId}
                            history={history}
                            email={email}
                            enumRights={enumRights}
                            vckeySelected={vckeySelected}
                            language={language}
                            label={label}/>
                    </Col>
                </Row>
            </div>

            <ModalReportAffaire openDialog={openDialog} toggle={toggleModalLarge}/>
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
            {/* POPUP CREATE MAIL BPOST */}
            {modalPostMailDisplay ? (
                <ModalMail
                    dossierId={null}
                    label={label}
                    documentId={documentIdRef.current}
                    modalPostMailDisplay={modalPostMailDisplay}
                    openPostMail={_openPostMail}
                    showMessage={_showMessage}
                    updateList={_updateMailList}
                />
            ) : null}
            {/* POPUP CREATE EMAIL REGISTERED */}
            {modalEmailDisplay ? (
                <ModalEMailSign
                    attachedFile={[]}
                    affaireId={null}
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
            {/* POPUP PAYMENT NOT REGISTERED */}
            {modalNotPaidSignDocument ? (
                <ModalNoActivePayment
                    label={label}
                    toggleModalDetails={_toggleUnPaid}
                    modalDisplay={modalNotPaidSignDocument}/>
            ) : null}
        </>
    );
};
/*************/
/* RECENT */
/*************/

export default Dashboard;
