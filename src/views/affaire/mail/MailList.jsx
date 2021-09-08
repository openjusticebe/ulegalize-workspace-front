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
import { getDocumentsMail, } from '../../../services/PostBirdServices';
import { usePagination, useTable } from 'react-table';
import ReactLoading from 'react-loading';
import MailPostBirdGenerator from './MailPostBirdGenerator';
import { getOptionNotification } from '../../../utils/AlertUtils';
import NotificationAlert from 'react-notification-alert';
import { getStatusPostBird } from './StatusPostBird';
import { getDateDetails } from '../../../utils/DateUtils';

const ceil = require( 'lodash/ceil' );
const range = require( 'lodash/range' );
const PAGE_SIZE = 5;

export default function MailList( {
                                      dossierId,
                                      label,
                                      updateList,
                                      openPostMail,
                                      deletePostMail
                                  } ) {

    const [data, setData] = useState( [] );
    const [count, setCount] = useState( 0 );
    const { getAccessTokenSilently } = useAuth0();
    const loadRef = useRef( true );
    const skipPageResetRef = useRef();
    const mailSelected = useRef( null );
    const [showMail, setShowMail] = useState( false );
    const notificationAlert = useRef( null );

    const showMailFun = () => {
        setShowMail( !showMail );
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
                                openPostMail(row.value);
                            }}
                            color="primary" size="sm">
                            <i className="fa fa-paper-plane "/>
                        </Button>
                        {` `}
                        {/* payment ok => cannot be deleted */}
                        {parseInt(row.row.original.status) < 8 ? (
                            <Button
                                className="btn-icon btn-link margin-left-10"
                                onClick={() => {
                                    deletePostMail(row.value);
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
                                    <h4>{label.mail.label9}
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
        </>
    );
}

