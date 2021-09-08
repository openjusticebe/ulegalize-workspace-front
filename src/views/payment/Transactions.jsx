import React, { useEffect, useRef, useState } from 'react';
// reactstrap components
import { Card, CardBody, Col, Pagination, PaginationItem, PaginationLink, Row, Table } from 'reactstrap';
import ReactLoading from 'react-loading';
import { usePagination, useTable } from 'react-table';
// nodejs library that concatenates classes
import { useAuth0 } from '@auth0/auth0-react';
import { getDate } from '../../utils/DateUtils';
import { getPaymentTransactions } from '../../services/PaymentServices';
import { getWorkflowNameLabel } from '../affaire/mail/WorkflowNameLabel';
import { getStatusTransaction } from '../affaire/mail/StatusTransactionLabel';

let moment = require( 'moment-timezone' );

const ceil = require( 'lodash/ceil' );
const range = require( 'lodash/range' );
const PAGE_SIZE = 10;

export default function Transactions( props ) {
    const skipPageResetRef = useRef();
    const loadRef = useRef( true );

    const [data, setData] = useState( [] );
    const [count, setCount] = useState( 0 );
    const { label } = props;
    const { getAccessTokenSilently } = useAuth0();

    const columns = React.useMemo(
        () => [
            {
                Header: '#',
                accessor: 'id',
                width: 120,
                Cell: row => {
                    return row ? (
                        <div>
                            <p>{row.id}</p>
                            {` `}
                        </div>
                    ) : '';
                }
            },
            {
                Header: label.payment.amount,
                accessor: 'amount',
                Cell: row => {
                    return row ? (
                        <div>
                            <p>{row.value.toFixed( 2 )} €</p>
                            {` `}
                        </div>
                    ) : '';
                }
            },
            {
                Header: label.payment.workflow,
                accessor: 'workflowNameCode',
                Cell: row => {
                    return row ? (
                        <div>
                            {/* if dua date we should show the 5th of next month*/}
                            <p>{getWorkflowNameLabel( row.value, label )}</p>
                            {` `}
                        </div>
                    ) : '';
                }
            },
            {
                Header: label.payment.status,
                accessor: 'status',
                Cell: row => {
                    let dueDate = '';
                    if ( row.value === 'DUE_DATE' ) {
                        const month = moment().date( 5 ).add( 1, 'months' );
                        dueDate = '(' + getDate( month ) + ')';
                    }

                    return row ? (
                        <div>
                            <p>{getStatusTransaction( row.value, label )} {dueDate}</p>
                            {` `}
                        </div>
                    ) : '';
                }
            },
            {
                Header: label.payment.updDate,
                accessor: 'creDate',
                Cell: row => {
                    return row ? (
                        <>{getDate( row.value )}</>
                    ) : '';
                }
            },

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
            loadRef.current = false;

            let result = await getPaymentTransactions( accessToken, pageSize, offset );

            if ( !result.error ) {
                skipPageResetRef.current = true;
                setCount( result.data.totalElements );
                setData( result.data.content );
            }
        })();
    }, [pageIndex, pageSize] );

    useEffect( () => {
        skipPageResetRef.current = false;
    } );

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

    return (
        <>
            <div className="content">
                <Row>
                    <Col lg="12" sm={12}>
                        <Card>
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
                                                                <th {...column.getHeaderProps()}>{column.render( 'Header' )}
                                                                    {/* Render the columns filter UI */}
                                                                    <div>{column.canFilter ? column.render( 'Filter' ) : null}</div>

                                                                </th>
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

