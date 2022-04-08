import React, { useEffect, useRef, useState } from 'react';
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
    Pagination,
    PaginationItem,
    PaginationLink,
    Row,
    Table
} from 'reactstrap';
import { useAuth0 } from '@auth0/auth0-react';
import { deleteDocumentById, getDocumentsMail, } from '../../../services/PostBirdServices';
import { usePagination, useTable } from 'react-table';
import ReactLoading from 'react-loading';
import MailPostBirdGenerator from './MailPostBirdGenerator';
import { getOptionNotification } from '../../../utils/AlertUtils';
import NotificationAlert from 'react-notification-alert';
import { getFrenchStatus, getStatusPostBird } from './StatusPostBird';
import { getDateDetails } from '../../../utils/DateUtils';
import ModalDetectMail from './ModalDetectMail';
import ReactBSAlert from 'react-bootstrap-sweetalert';

const ceil = require( 'lodash/ceil' );
const range = require( 'lodash/range' );
const PAGE_SIZE = 5;

export default function MailList( {
                                      dossierId,
                                      label,
                                      vckeySelected
                                  } ) {

    const [data, setData] = useState( [] );
    const [count, setCount] = useState( 0 );
    const { getAccessTokenSilently } = useAuth0();
    const loadRef = useRef( true );
    const skipPageResetRef = useRef();
    const mailSelected = useRef( null );
    const [showMail, setShowMail] = useState( false );
    const notificationAlert = useRef( null );
    const documentIdRef = useRef( true );
    const [modalDetectMail, setModalDetectMail] = useState( false );
    const [updateList, setUpdateList] = useState( false );
    const [deleteAlert, setDeleteAlert] = useState( null );
    const countryCodeRef = useRef( true );

    const _updateList = () => {
        setUpdateList( !updateList );
    };

    const showMailFun = () => {
        setShowMail( !showMail );
    };


    const _deletePostMail = async ( documentId ) => {
        documentIdRef.current = documentId;

        const accessToken = await getAccessTokenSilently();

        const result = await deleteDocumentById( accessToken, documentIdRef.current );

        setDeleteAlert( null );
        if ( result.data ) {
            _updateList();

            showMessage( label.common.success2, 'primary' );
        } else {
            showMessage( label.common.error3, 'danger' );
        }

    };
    const columns = React.useMemo(
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
                                _toggleMail( row.row.original.countryPost, row.value );
                            }}
                            color="primary" size="sm">
                            <i className="fa fa-paper-plane "/>
                        </Button>
                        {` `}
                        {/* payment ok => cannot be deleted */}
                        {(row.row.original.countryPost === 'BE' && parseInt(row.row.original.status) < 8) || (row.row.original.countryPost === 'FR' && row.row.original.status === 'DRAFT') ? (
                            <Button
                                className="btn-icon btn-link margin-left-10"
                                onClick={() => {
                                    setDeleteAlert( <ReactBSAlert
                                        warning
                                        style={{ display: 'block', marginTop: '30px' }}
                                        title={label.common.label10}
                                        onConfirm={() => {
                                            _deletePostMail( row.value );
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
                                }}
                                color="primary" size="sm">
                                <i className="fa fa-trash"/>
                            </Button>
                        ): null}
                        {` `}
                    </div>;
                }
            },
            {
                Header: label.mail.label10,
                accessor: 'documentName'
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

            const offset = pageIndex * pageSize;
            let result;
            loadRef.current = false;

            result = await getDocumentsMail( accessToken, offset, pageSize, dossierId );

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
        pagination = <PaginationItem active>
            <PaginationLink href="#">
                0
            </PaginationLink>
        </PaginationItem>;
    }

    const showMessage = ( message, type ) => {
        if ( message && type ) {
            notificationAlert.current.notificationAlert( getOptionNotification( message, type ) );
        }
    };


    const _toggleMail = async ( country, documentId ) => {
        documentIdRef.current = documentId;
        countryCodeRef.current = country;
        setModalDetectMail( !modalDetectMail );
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
                                <Row>
                                    <Col md={10}>
                                        <CardTitle>
                                            <h4>{label.mail.label9}
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
                            showMessage={showMessage}
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

            {modalDetectMail ? (
                <ModalDetectMail
                    vckeySelected={vckeySelected}
                    dossierId={dossierId}
                    documentId={documentIdRef.current}
                    countryCode={countryCodeRef.current}
                    openPostMail={_toggleMail}
                    label={label}
                    showMessage={showMessage}
                    updateList={_updateList}
                />
            ) : null}
            {deleteAlert}
        </>
    );
}

