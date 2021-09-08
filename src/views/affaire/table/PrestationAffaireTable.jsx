import React, { useEffect, useState } from 'react';
import ReactBSAlert from 'react-bootstrap-sweetalert';

// reactstrap components
import { Button, Modal, ModalBody, ModalHeader, Pagination, PaginationItem, PaginationLink, Table } from 'reactstrap';
import { usePagination, useTable } from 'react-table';
import { useAuth0 } from '@auth0/auth0-react';
import {
    countPrestationByDossierId,
    deletePrestation,
    getPrestationByDossierId
} from '../../../services/PresationService';
import PrestationSummary from '../../../model/prestation/PrestationSummary';
import { Prestation } from '../../../components/Affaire/wizard/Prestation';
import { getDate } from '../../../utils/DateUtils';

const map = require( 'lodash/map' );
const range = require( 'lodash/range' );
const ceil = require( 'lodash/ceil' );
const isNil = require( 'lodash/isNil' );
const size = require( 'lodash/size' );

const PAGE_SIZE = 5;

export default function PrestationAffaireTable( props ) {
    const { label, currency, vckeySelected } = props;
    const [data, setData] = useState( [] );
    const [count, setCount] = useState( 0 );
    const [deleteAlert, setDeleteAlert] = useState( null );
    const [prestationId, setPrestationId] = useState( null );

    const { getAccessTokenSilently } = useAuth0();
    // Data table prestation
    const columns = React.useMemo(
        () => [
            {
                Header: label.prestation.label2,
                accessor: 'tsTypeDescription'
            },
            {
                Header: label.prestation.label3,
                accessor: 'dateAction',
                Cell: row => {
                    return (
                        <>{getDate(row.value)}</>
                    )
                }
            },
            {
                Header: label.prestation.label4,
                accessor: 'time',
                Cell: row => {
                    return row.row.original.forfait === true ? label.prestation.label1 :  (
                        <p>{row.value}</p>
                    )
                }
            },
            {
                Header: label.prestation.label5,
                accessor: 'totalHt',
                Cell: row => {
                    return (
                        <>{row.value} {currency}</>
                    )
                }
            },
            {
                Header: '#',
                accessor: 'id',
                Cell: row => {
                    return (
                        <div>
                            <Button
                                className="btn-icon btn-link"
                                onClick={() => {
                                    _openModal( row.value );
                                }}
                                color="primary" size="sm">
                                <i className="tim-icons icon-pencil "/>
                            </Button>{` `}
                            <Button
                                className="btn-icon btn-link"
                                onClick={() => {
                                    setDeleteAlert( <ReactBSAlert
                                        warning
                                        style={{ display: 'block', marginTop: '100px' }}
                                        title={label.common.label10}
                                        onConfirm={() => {
                                            delPrestation( row.value );
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
                            </Button>{` `}

                        </div>
                    );
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
            data,
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

            let resultCount = await countPrestationByDossierId( accessToken, vckeySelected, props.affaireid );
            if ( !resultCount.error ) {
                setCount( resultCount.data );
            }
        })();
    }, [count, props.updatePrestation] );

    useEffect( () => {
        (async () => {
            const accessToken = await getAccessTokenSilently();

            const offset = pageIndex * pageSize;
            let result = await getPrestationByDossierId( accessToken, vckeySelected, props.affaireid, offset, pageSize );
            if ( !result.error ) {
                const dataList = map( result.data, prestation => {
                    return new PrestationSummary( prestation );
                } );
                setData( dataList );
            }
        })();
    }, [pageIndex, pageSize, props.updatePrestation] );

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

    const _openModal = ( presationId, message, type ) => {
        if ( !isNil( presationId ) ) {
            setPrestationId( presationId );
        } else {
            setPrestationId( null );
        }

        props.showMessagePopupFrais( message, type );

    };

    const delPrestation = async ( prestationId ) => {

        const accessToken = await getAccessTokenSilently();
        let result;
        if ( !isNil( prestationId ) ) {
            result = await deletePrestation( accessToken, prestationId );
        }
        if ( !result.error ) {
            props.showMessagePopupFrais( label.affaire.success2, 'primary' );
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

            <Modal size="md" isOpen={!isNil( prestationId )} toggle={() => _openModal()}>
                <ModalHeader tag="h4" toggle={() => _openModal()}>{props.label.affaire.label5}</ModalHeader>
                <ModalBody>
                        <Prestation
                            history={props.history}
                            isCreated={false}
                            affaireId={props.affaireid}
                            prestationId={prestationId}
                            currency={props.currency}
                            label={props.label}
                            vckeySelected={props.vckeySelected}
                            showMessagePopupFrais={props.showMessagePopupFrais}
                            done={_openModal}
                            language={props.language}/>
                </ModalBody>
            </Modal>
            {deleteAlert}

        </>
    );
}
