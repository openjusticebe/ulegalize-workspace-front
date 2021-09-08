import React, { useEffect, useState } from 'react';

// reactstrap components
import { Button, Pagination, PaginationItem, PaginationLink, Table } from 'reactstrap';
import { usePagination, useTable } from 'react-table';
import { useAuth0 } from '@auth0/auth0-react';
import {
    deleteInvoiceById,
    getInvoicesByDossierId
} from '../../../services/InvoiceService';
import InvoiceSummary from '../../../model/invoice/InvoiceSummary';
import { Link } from 'react-router-dom';
import ReactBSAlert from 'react-bootstrap-sweetalert';

const ceil = require( 'lodash/ceil' );
const isNil = require( 'lodash/isNil' );
const range = require( 'lodash/range' );
const map = require( 'lodash/map' );
const size = require( 'lodash/size' );
const PAGE_SIZE = 5;

export default function InvoiceAffaireTable( props ) {
    const { label, vckeySelected } = props;
    const [data, setData] = useState( [] );
    const [count, setCount] = useState( 0 );
    const [deleteAlert, setDeleteAlert] = useState( null );

    const { getAccessTokenSilently } = useAuth0();
    // Data table prestation
    const columns = React.useMemo(
        () => [
            {
                Header: 'Reference',
                accessor: 'reference'
            },
            {
                Header: 'Numéro',
                accessor: 'numFacture'
            },
            {
                Header: 'Montant',
                accessor: 'montant'
            },
            {
                Header: '#',
                accessor: 'id',
                Cell: row => {
                    return (
                        <div>
                            <Link to={`/admin/invoice/${row.value}`}
                                  size="sm"> <i className="tim-icons icon-pencil "/></Link>{` `}
                            {row.row.original.valid === false ? (
                                <Button
                                    className="btn-icon btn-link margin-left-10"
                                    onClick={() => {
                                        setDeleteAlert( <ReactBSAlert
                                            warning
                                            style={{ display: 'block', marginTop: '100px' }}
                                            title={label.common.label10}
                                            onConfirm={() => {
                                                delInvoice( row.value );
                                                setDeleteAlert( null );
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
                                    <i className="tim-icons icon-trash-simple "/>
                                </Button>
                            ) : null}
                            {` `}

                        </div>
                    );
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
            data,
            initialState: {
                pageSize: PAGE_SIZE,
                pageIndex: 0,
            },
            manualPagination: true,
            pageCount: ceil(count / PAGE_SIZE),
        },
        usePagination
    );


    useEffect( () => {
        (async () => {
            const accessToken = await getAccessTokenSilently();

            const offset = pageIndex * pageSize;
            let result;

            result = await getInvoicesByDossierId( accessToken, vckeySelected, props.affaireid, offset, pageSize  );

            if ( !result.error ) {
                setCount( result.data.totalElements );
                const dataList = map( result.data.content, invoice => {
                    return new InvoiceSummary( invoice );
                } );
                setData( dataList );
            }

        })();
    }, [pageIndex, pageSize] );

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

    const delInvoice = async ( invoiceId ) => {

        const accessToken = await getAccessTokenSilently();
        let result;
        if ( !isNil( invoiceId ) ) {
            result = await deleteInvoiceById( accessToken, invoiceId );
        }
        if ( !result.error ) {
            props.showMessagePopupFrais( label.invoice.success1, 'primary' );
        }

    };
    return (
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
            {deleteAlert}

        </>
    );
}
