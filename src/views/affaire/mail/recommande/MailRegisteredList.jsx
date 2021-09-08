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
import { getDateDetails } from '../../../../utils/DateUtils';
import { getEMailRegisteredList } from '../../../../services/EmailRegisteredService';
import { getStatusEmailRegistered } from './StatusEmailRegistered';
import ReactBSAlert from 'react-bootstrap-sweetalert';

const ceil = require( 'lodash/ceil' );
const range = require( 'lodash/range' );
const PAGE_SIZE = 5;

export default function MailRegisteredList( {
                                                dossierId,
                                                label,
                                                updateList,
                                                showMessage
                                            } ) {

    const [data, setData] = useState( [] );
    const [count, setCount] = useState( 0 );
    const [deleteAlert, setDeleteAlert] = useState( null );
    const { getAccessTokenSilently } = useAuth0();
    const loadRef = useRef( true );
    const skipPageResetRef = useRef();
    const notificationAlert = useRef( null );

    const columns = React.useMemo(
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
        showMessage( label.common.success2, 'primary' );

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
                                <CardTitle>
                                    <h4>{label.mail.label2}
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
        </>
    );
}

