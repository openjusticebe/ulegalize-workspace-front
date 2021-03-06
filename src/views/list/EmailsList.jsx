import React, { useEffect, useRef, useState } from 'react';
import {
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
    Table
} from 'reactstrap';
import { useAuth0 } from '@auth0/auth0-react';
import { usePagination, useTable } from 'react-table';
import ReactLoading from 'react-loading';
import NotificationAlert from 'react-notification-alert';
import { getDateDetails } from '../../utils/DateUtils';
import { getEMailRegisteredList } from '../../services/EmailRegisteredService';
import { getStatusEmailRegistered } from '../affaire/mail/recommande/StatusEmailRegistered';
import ReactBSAlert from 'react-bootstrap-sweetalert';
import { Link } from 'react-router-dom';
import ModalEMailRegistered from '../affaire/mail/recommande/ModalEMailRegistered';
import { checkPaymentActivated } from '../../services/PaymentServices';
import ModalEMailSign from '../affaire/mail/recommande/ModalEMailSign';
import ModalEMailRegisteredStatus from '../affaire/mail/recommande/ModalEMailRegisteredStatus';

const ceil = require( 'lodash/ceil' );
const range = require( 'lodash/range' );
const size = require( 'lodash/size' );
const isNil = require( 'lodash/isNil' );
const PAGE_SIZE = 5;

export default function EmailsList( {
                                        label,
                                        showMessage,
                                        email,
                                        userId,
                                        vckeySelected,
                                        dossierId,
                                        showDossier
                                    } ) {

    const [data, setData] = useState( [] );
    const [count, setCount] = useState( 0 );
    const [deleteAlert, setDeleteAlert] = useState( null );
    const [showEMail, setShowEMail] = useState( false );
    const [updateList, setUpdateList] = useState( false );
    const [showEMailStatus, setShowEMailStatus] = useState( false );
    const { getAccessTokenSilently } = useAuth0();
    const loadRef = useRef( true );
    const skipPageResetRef = useRef();
    const notificationAlert = useRef( null );
    const emailRef = useRef( true );
    const payment = useRef( false );
    const [modalEmailDisplay, setModalEmailDisplay] = useState( false );
    const [modalNotPaidSignDocument, setModalNotPaidSignDocument] = useState( false );

    const openEMailRegistered = (id) => {
        emailRef.current = id;
        setShowEMail( !showEMail );
    };

    const openEMailRegisteredStatus = (id) => {
        emailRef.current = id;
        setShowEMailStatus( !showEMailStatus );
    };

    const _updateList = () => {
        setUpdateList( !updateList );
    };

    const columns = React.useMemo(
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
                                    _updateList();
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
                Header: showDossier ? label.mail.dossier : '',
                accessor: 'dossierId',
                Cell: row => {
                    if(showDossier){
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
                    } else {
                        return '';
                    }

                }
            } ,
            {
                Header: label.mail.label11,
                accessor: 'statusCode',
                Cell: row => {
                    return (
                        <Button
                            className="btn-link margin-left-10"
                            onClick={() => {
                                openEMailRegisteredStatus( row.row.original.id );
                            }}
                            color="primary" >
                            {getStatusEmailRegistered( row.value, label )}
                        </Button>
                    )
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

        [label] );

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
                hiddenColumns: []
            },
            manualPagination: true,
            pageCount: ceil( count / PAGE_SIZE ),
        },
        usePagination
    );
    useEffect( () => {
        (async () => {
            const accessToken = await getAccessTokenSilently();

            const offset = pageIndex * pageSize;
            let result;
            loadRef.current = false;

            result = await getEMailRegisteredList( accessToken, offset, pageSize, dossierId );

            if ( !result.error ) {
                skipPageResetRef.current = true;
                setCount( result.data.totalElements );
                setData( result.data.content );
            }
        })();
    }, [pageIndex, pageSize, updateList] );

    let pagination;
    let reste = count % pageSize !== 0 ? 1 : 0;

    let nums = range( Math.floor( count / pageSize ) + reste );
    if ( count > 1 ) {
        // case 1 : less than 10
        // case 2 more than 10 , start page : current - 5 end page : current + 5 or max
        // total page < = 10
        if ( size( nums ) <= 10 ) {

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
            } else if ( pageIndex + 4 >= size( nums ) ) {

                startPage = size( nums ) - 9;

                endPage = size( nums );
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

    const _deleteEMailRegistered = async ( ) => {
        showMessage( label.common.success2, 'primary' );
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

    return (
        <>
            {deleteAlert}

            <div className="content">
                <div className="rna-container">
                    <NotificationAlert ref={notificationAlert}/>
                </div>
                <Row>
                    <Col lg="12" sm={12}>
                        <Card>
                            <CardHeader>
                                    <Row>
                                        <Col md={10}>
                                            <CardTitle>
                                                <h4>{label.mail.label2}
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

                            </CardBody>
                        </Card>
                    </Col>

                </Row>
            </div>
            {showEMail ? (
                <ModalEMailRegistered
                    id={emailRef.current}
                    showMessage={showMessage}
                    label={label}
                    isOpen={showEMail}
                    toggle={openEMailRegistered}
                />
            ) : null}
            {showEMailStatus ? (
                <ModalEMailRegisteredStatus
                    id={emailRef.current}
                    showMessage={showMessage}
                    label={label}
                    isOpen={showEMailStatus}
                    toggle={openEMailRegisteredStatus}
                />
            ) : null}

            {/* POPUP CREATE EMAIL REGISTERED */}
            {modalEmailDisplay ? (
                <ModalEMailSign
                    attachedFile={[]}
                    dossierId={dossierId}
                    label={label}
                    userId={userId}
                    email={email}
                    vckeySelected={vckeySelected}
                    showMessage={showMessage}
                    updateList={updateList}
                    showMessagePopup={showMessage}
                    toggleModalDetails={_openEmail}
                    modalDisplay={modalEmailDisplay}/>
            ) : null}
        </>
    );
}

