import React, { useEffect, useRef, useState } from 'react';
// reactstrap components
import {
    Badge,
    Button,
    Card,
    CardBody,
    CardHeader,
    CardTitle,
    Col,
    Pagination,
    PaginationItem,
    PaginationLink,
    Row,
    Table,
} from 'reactstrap';
import moment from 'moment';
import 'moment/locale/fr';
import ReactLoading from 'react-loading';
import { useAuth0 } from '@auth0/auth0-react';
import { getOptionNotification } from '../../utils/AlertUtils';
import {
    attachDossier,
    attachEsignDocument,
    attachFileCase,
    countCaseList,
    downloadFileAttached,
    getCaseList,
    saveLawyer
} from '../../services/transparency/CaseService';
import NotificationAlert from 'react-notification-alert';
import { usePagination, useTable } from 'react-table';
import ModalUpdateCase from '../popup/cases/ModalUpdateCase';
import ModalUpdateLawyers from '../popup/cases/ModalUpdateLawyers';
import CasDTO from '../../model/affaire/CasDTO';
import { getDate } from '../../utils/DateUtils';
import { Link } from 'react-router-dom';
import { downloadWithName } from '../../utils/TableUtils';
import CreateDossierField from './CreateDossierField';
import { createDossier, getDossierById, switchDossierDigital } from '../../services/DossierService';
import DossierDTO from '../../model/affaire/DossierDTO';
import { createClient, getClient, getClientByEmail } from '../../services/ClientService';
import ContactSummary from '../../model/client/ContactSummary';
import CaseCreationDTO from '../../model/affaire/CaseCreationDTO';

const ceil = require( 'lodash/ceil' );
const map = require( 'lodash/map' );
const range = require( 'lodash/range' );
const isEmpty = require( 'lodash/isEmpty' );
const isNil = require( 'lodash/isNil' );
const size = require( 'lodash/size' );
const PAGE_SIZE = 10;

export default function CasesList( { label, email, userId, vckeySelected, enumRights, history } ) {
    const notificationAlert = useRef( null );
    const [modalDetails, setModalDetails] = useState( false );
    const [modalCreateDossier, setModalCreateDossier] = useState( false );
    const [modalVckeys, setModalVckeys] = useState( false );
    const [isLoading, setIsLoading] = useState( false );
    const [casesModal, setCasesModal] = useState( [] );
    const updateList = useRef( false );
    const loadRef = useRef( true );

    const [data, setData] = useState( [] );
    const [count, setCount] = useState( 0 );

    const { getAccessTokenSilently } = useAuth0();

    const columns = React.useMemo(
        () => [
            {
                accessor: '_id',
                Header: label.affaire.label22,
                width: 140,
                resizable: true,
                Cell: row => {
                    return isNil( row.row.original.affaireItem ) ? (
                        <div>
                            <Button color="info"
                                    onClick={() => _toggleCreateDossier( row.row.original )}
                                    size="sm">{label.common.new}</Button>
                        </div>
                    ) : (
                        <Link
                            to={`/admin/affaire/${row.row.original.affaireItem.value}`}>{row.row.original.affaireItem.label}</Link>
                    );
                }
            },
            {
                accessor: 'id',
                Header: '#',
                width: 150,
                Cell: row => {
                    return (<div>
                        <Button color="info"
                                onClick={() => toggleUpdateCase( row.row.original )}
                                size="sm">{label.affaire.label27}</Button>
                    </div>);
                }
            },
            {
                accessor: 'vcKeys',
                Header: label.affaire.label6,
                //width: 180,
                //filterable: false,
                Cell: row => {

                    const lawyers = row.value;

                    const nameLawfirms = size( lawyers ) > 1 ? lawyers[ 0 ].label.substring( 0, 6 ) + ',..'
                        : lawyers[ 0 ].label.substring( 0, 8 );

                    return (
                        <div>
                            <Button color="info" size="md"
                                    onClick={() => toggleVcKey( row.row.original )}>
                                <Badge color="secondary"
                                       className="display-inline">{row.value ? size( row.value ) : 0}</Badge> {nameLawfirms}
                            </Button>
                        </div>
                    );
                }
            },
            {
                accessor: 'question',
                Header: label.affaire.label28,
                width: 350,
            },
            {
                accessor: 'complete',
                Header: label.affaire.label29,
                width: 200,
                filterable: false,
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
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        page,
        prepareRow,
        // Instead of using 'rows', we'll use page,
        // which has only the rows for the active page

        // The rest of these things are super handy, too ;)
        canPreviousPage,
        canNextPage,
        gotoPage,
        nextPage,
        previousPage,
        state: { pageIndex, pageSize },

    } = useTable( {
            columns,
            data: data,
            initialState: {
                pageSize: PAGE_SIZE,
                pageIndex: 0,
            },
            manualPagination: true,
            pageCount: ceil( count / PAGE_SIZE ),
        },
        usePagination
    );

    useEffect( () => {
        (async () => {
            const accessToken = await getAccessTokenSilently();

            let resultCount = await countCaseList( accessToken );
            if ( !resultCount.error ) {
                setCount( resultCount.data );
            }
        })();
    }, [count] );

    useEffect( () => {
        (async () => {
            const accessToken = await getAccessTokenSilently();

            const offset = pageIndex * pageSize;
            loadRef.current = false;
            let result = await getCaseList( accessToken, offset, pageSize );
            if ( !result.error ) {
                const dataList = map( result.data, frais => {
                    return new CasDTO( frais );
                } );
                setData( dataList );
            }
        })();
    }, [pageIndex, pageSize, updateList.current] );

    let pagination;
    let reste = count % pageSize !== 0 ? 1 : 0;

    let nums = range( Math.floor( count / pageSize ) + reste );
    if ( count > 1 ) {
        // case 1 : less than 10
        // case 2 more than 10 , start page : current - 5 end page : current + 5 or max
        // total page < = 10
        if ( size(nums) <= 10 ) {

            pagination = nums.map( num => {
                return (
                    <PaginationItem active={num === pageIndex}>
                        <PaginationLink onClick={() => {
                            gotoPage( num );
                        }}>
                            {num}
                        </PaginationLink>
                    </PaginationItem>
                );
            } );
        } else {
            let startPage = 1;
            let endPage = 10;
            // current
            if ( pageIndex <= 6 ) {
                nums = range( endPage );
            } else if ( pageIndex + 4 >= size(nums) ) {

                startPage = size(nums) - 9;

                endPage = size(nums);
                nums = range( startPage, endPage );

            } else {
                startPage = pageIndex - 5;
                endPage = pageIndex + 4;
                nums = range( startPage, endPage );

            }

            pagination = nums.map( num => {
                return (
                    <PaginationItem active={num === pageIndex}>
                        <PaginationLink onClick={() => {
                            gotoPage( num );
                        }}>
                            {num}
                        </PaginationLink>
                    </PaginationItem>
                );
            } );
        }

    } else {
        pagination = <PaginationItem active>
            <PaginationLink href="#">
                0
            </PaginationLink>
        </PaginationItem>;
    }

    const _toggleCreateDossier = async ( cas ) => {
        setCasesModal( cas );
        setModalCreateDossier( !modalCreateDossier );
    };

    const _attachDossier = async ( responsableId, dossierId ) => {
        setIsLoading( true );
        const accessToken = await getAccessTokenSilently();

        const resultDossier = await getDossierById( accessToken, dossierId, vckeySelected );

        if ( resultDossier.error ) {
            notificationAlert.current.notificationAlert( getOptionNotification( label.affaire.error11, 'danger' ) );
        } else {
            // attach the cas transparency with new affaire
            const newDossier = new DossierDTO( resultDossier.data );
            //const caseCreation = new CaseCreationDTO( newDossier, client );

            //let result = await createDossierTransparency( accessToken, caseCreation );


            //const result = await attachDossier( accessToken, caseCreation, casesModal.id );
            switchDossierDigital( accessToken, newDossier.id );
        }
        updateList.current = !updateList.current;
        setIsLoading( false );
        _toggleCreateDossier();
    };
    const _createDossier = async ( responsableId ) => {
        setIsLoading( true );
        const accessToken = await getAccessTokenSilently();

        let dossier = new DossierDTO();
        // client
        const resultClient = await getClientByEmail( accessToken, casesModal.username.email );
        let client;

        if ( resultClient.data && !isEmpty( resultClient.data ) ) {
            client = new ContactSummary(resultClient.data, label);
            dossier.idClient = resultClient.data.id;
        } else {
            // create a new client
            client = new ContactSummary( null, label );
            client.firstname = casesModal.username.given_name;
            client.lastname = casesModal.username.family_name ? casesModal.username.family_name : '';
            client.email = casesModal.username.email ? casesModal.username.email : '';
            client.userId = userId;
            client.vcKey = vckeySelected;

            let resultCreateClient = await createClient( accessToken, client );

            if ( resultCreateClient.data ) {
                dossier.idClient = resultCreateClient.data.id;
            } else {
                _showMessagePopup( label.ajout_client.error7, 'danger' );
                setIsLoading( false );
                return;
            }

        }

        // client adverse
        const resultClientAdv = await getClient( accessToken, 'adverse' , vckeySelected);

        if ( resultClientAdv.data && !isEmpty( resultClientAdv.data ) ) {
            dossier.idAdverseClient = resultClientAdv.data[ 0 ].id;
        } else {
            // create a new client
            let client = new ContactSummary( null, label );
            client.firstname = 'f adverse';
            client.lastname = 'Client adverse';

            client.userId = userId;
            client.vcKey = vckeySelected;

            let resultCreateClient = await createClient( accessToken, client );

            if ( resultCreateClient.data ) {
                dossier.idAdverseClient = resultCreateClient.data.id;
            } else {
                _showMessagePopup( label.ajout_client.error7, 'danger' );
                setIsLoading( false );
                return;
            }

        }
        dossier.openDossier = getDate( moment() );
        dossier.id_matiere_rubrique = 61;
        dossier.idUserResponsible = responsableId;
        dossier.idUserResponsible = responsableId;

        const resultDossier = await createDossier( accessToken, dossier );

        if ( resultDossier.error ) {
            notificationAlert.current.notificationAlert( getOptionNotification( label.affaire.error11, 'danger' ) );
        } else {
            // attach the cas transparency with new affaire
            const newDossier = new DossierDTO( resultDossier.data );
            const caseCreation = new CaseCreationDTO( newDossier, client );

            //let result = await createDossierTransparency( accessToken, caseCreation );


            const result = await attachDossier( accessToken, caseCreation, casesModal.id );
            switchDossierDigital( accessToken, newDossier.id );
            if ( !result.error ) {
                notificationAlert.current.notificationAlert( getOptionNotification( label.affaire.success7, 'prmary' ) );

            } else {
                notificationAlert.current.notificationAlert( getOptionNotification( label.affaire.error11, 'danger' ) );
            }
        }
        updateList.current = !updateList.current;
        setIsLoading( false );
        _toggleCreateDossier();
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

    const _attachEsignDocument = async ( file, affaireId ) => {
        setIsLoading( true );
        const accessToken = await getAccessTokenSilently();

        if ( isNil( file ) ) {
            notificationAlert.current.notificationAlert( getOptionNotification( label.affaire.error2, 'danger' ) );
            return;
        }
        file.delete( 'casId' );
        notificationAlert.current.notificationAlert( getOptionNotification( label.affaire.label9, 'warning' ) );

        const result = await attachEsignDocument( accessToken, affaireId, file );

        if ( !result.error ) {
            notificationAlert.current.notificationAlert( getOptionNotification( label.affaire.success1, 'success' ) );
        }

        setIsLoading( false );

    };

    const toggleUpdateCase = ( cas ) => {
        setCasesModal( cas );
        setModalDetails( !modalDetails );
    };

    const toggleVcKey = ( cas ) => {
        setModalVckeys( !modalVckeys );
        setCasesModal( cas );
    };

    const _saveLawyers = async ( vcKeys, cas ) => {
        setIsLoading( true );
        const accessToken = await getAccessTokenSilently();
        cas.vcKeys = vcKeys;
        const result = await saveLawyer( accessToken, cas );

        if ( !result.error ) {
            notificationAlert.current.notificationAlert( getOptionNotification( label.affaire.success6, 'success' ) );
        }
        toggleVcKey();
        updateList.current = !updateList.current;
        setIsLoading( false );
    };

    const _showMessagePopup = ( message, type ) => {
        notificationAlert.current.notificationAlert(
            getOptionNotification( message, type )
        );
    };


    return (
        <>
            <div className="content">
                <div className="rna-container">
                    <NotificationAlert ref={notificationAlert}/>
                </div>
                <Row>
                    <Col lg="12" sm={12}>
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    <h4>{label.casJuridiqueForm.label105}
                                    </h4>
                                </CardTitle>
                            </CardHeader>
                            <CardBody>
                                {loadRef.current === false ? (
                                    <Row>
                                        <Col md="12">
                                            <>
                                                <Table responsive
                                                       className="-striped -highlight primary-pagination"
                                                       {...getTableProps()}>
                                                    <thead>
                                                    {headerGroups.map( headerGroup => (
                                                        <tr {...headerGroup.getHeaderGroupProps()}>
                                                            {headerGroup.headers.map( column => (
                                                                <th {...column.getHeaderProps()}>{column.render( 'Header' )}</th>
                                                            ) )}
                                                        </tr>
                                                    ) )}
                                                    </thead>
                                                    <tbody {...getTableBodyProps()}>
                                                    {page.map( ( row, i ) => {
                                                        prepareRow( row );
                                                        return (
                                                            <tr {...row.getRowProps()}>
                                                                {row.cells.map( cell => {
                                                                    return <td {...cell.getCellProps()}>{cell.render( 'Cell' )}</td>;
                                                                } )}
                                                            </tr>
                                                        );
                                                    } )}
                                                    </tbody>
                                                </Table>
                                                <Pagination>
                                                    <PaginationItem disabled={!canPreviousPage}>
                                                        <PaginationLink onClick={() => previousPage()}>
                                                            {label.common.preview}
                                                        </PaginationLink>
                                                    </PaginationItem>
                                                    {pagination}

                                                    <PaginationItem disabled={!canNextPage}>
                                                        <PaginationLink onClick={() => nextPage()}>
                                                            {label.common.next}

                                                        </PaginationLink>
                                                    </PaginationItem>
                                                </Pagination>
                                            </>

                                        </Col>
                                    </Row>

                                ) : (
                                    <ReactLoading className="loading" height={'20%'} width={'20%'}/>
                                )}
                                {modalDetails ? (
                                    <ModalUpdateCase id={casesModal.id}
                                                     email={email}
                                                     enumRights={enumRights}
                                                     cas={casesModal}
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
                                {modalVckeys ?
                                    (
                                        <ModalUpdateLawyers lawyersProps={casesModal.vcKeys}
                                                            isLoading={isLoading}
                                                            label={label}
                                                            cas={casesModal}
                                                            save={_saveLawyers}
                                                            modalDetails={modalVckeys}
                                                            toggleModalDetails={toggleVcKey}/>
                                    ) : null}
                                {modalCreateDossier ?
                                    (
                                        <CreateDossierField label={label}
                                                            modalDetails={modalCreateDossier}
                                                            toggle={_toggleCreateDossier}
                                                            isLoading={isLoading}
                                                            cas={casesModal}
                                                            vckeySelected={vckeySelected}
                                                            email={email}
                                                            userId={userId}
                                                            showMessage={_showMessagePopup}
                                                            attachDossier={_attachDossier}
                                                            createDossier={_createDossier}/>
                                    ) : null}
                            </CardBody>
                        </Card>
                    </Col>

                </Row>
            </div>
        </>
    );
}
