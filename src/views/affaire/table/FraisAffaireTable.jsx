import React, { useEffect, useState } from 'react';

// reactstrap components
import {
    Button,
    Modal,
    ModalBody,
    ModalHeader,
    Pagination,
    PaginationItem,
    PaginationLink,
    Table
} from 'reactstrap';
import { usePagination, useTable } from 'react-table';
import { useAuth0 } from '@auth0/auth0-react';
import { countFraisByDossierId, deleteFrais, getFraisByDossierId } from '../../../services/FraisAdminService';
import FraisAdminDTO from '../../../model/fraisadmin/FraisAdminDTO';
import { FraisAdmin } from '../../../components/Affaire/wizard/FraisAdmin';
import ReactBSAlert from 'react-bootstrap-sweetalert';

const map = require( 'lodash/map' );
const range = require( 'lodash/range' );
const ceil = require( 'lodash/ceil' );
const isNil = require( 'lodash/isNil' );
const round = require( 'lodash/round' );
const size = require( 'lodash/size' );

const PAGE_SIZE = 5;

export default function FraisAffaireTable( props ) {
    const { label, currency } = props;
    const [data, setData] = useState( [] );
    const [count, setCount] = useState(0);
    const [deleteAlert, setDeleteAlert] = useState( null );
    const [fraisAdminId, setFraisAdminId] = useState( null );

    const { getAccessTokenSilently } = useAuth0();
    // Data table prestation
    const columns = React.useMemo(
        () => [
            {
                Header: 'Type',
                accessor: 'idDebourTypeItem.label'
            },
            {
                Header: 'Mesure',
                accessor: 'mesureDescription'
            },
            {
                Header: 'Prix',
                accessor: 'price',
                Cell: row => {
                    let cost = parseFloat( row.row.original.pricePerUnit ) * parseFloat( row.row.original.unit );
                    data.costCalculated = round( cost, 2 ).toFixed( 2 );
                    return (
                        <>{data.costCalculated} {currency}</>
                    )
                }
            },
            {
                Header: 'Unite',
                accessor: 'unit'
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
                                            delFrais( row.value );
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
            pageCount: ceil(count / PAGE_SIZE),
        },
        usePagination
    );


    useEffect( () => {
        (async () => {
            const accessToken = await getAccessTokenSilently();

            let resultCount = await countFraisByDossierId( accessToken, props.affaireid );
            if ( !resultCount.error ) {
                setCount( resultCount.data );
            }
        })();
    }, [count, props.updateFrais] );


    useEffect( () => {
        (async () => {
            const accessToken = await getAccessTokenSilently();

            const offset = pageIndex * pageSize;
            let result = await getFraisByDossierId( accessToken, props.affaireid, offset, pageSize );
            if ( !result.error ) {
                const dataList = map(result.data, frais =>{
                    return new FraisAdminDTO(frais);
                })
                setData( dataList );
            }
        })();
    }, [pageIndex, pageSize, props.updateFrais] );



    let pagination ;
    let reste = count % pageSize !== 0 ? 1 : 0;


    let nums = range(Math.floor(count / pageSize) + reste);
    if(count > 1 ) {
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
        pagination =  <PaginationItem active>
            <PaginationLink href="#">
                0
            </PaginationLink>
        </PaginationItem>;
    }
    const _openModal = ( fraisId , message, type ) => {
        if ( !isNil( fraisId ) ) {
            setFraisAdminId( fraisId );
        } else {
            setFraisAdminId( null );
        }

        props.showMessagePopupFrais( message, type );

    };

    const delFrais = async ( fraisId ) => {

        const accessToken = await getAccessTokenSilently();
        let result;
        if ( !isNil( fraisId ) ) {
            result = await deleteFrais( accessToken, fraisId );
        }
        if ( !result.error ) {
            props.showMessagePopupFrais( label.affaire.success3, 'primary' );
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
                    <PaginationLink  onClick={() => previousPage()}>
                        Previous
                    </PaginationLink>
                </PaginationItem>
                {pagination}

                <PaginationItem disabled={!canNextPage}>
                    <PaginationLink onClick={() => nextPage()}  >
                        Next
                    </PaginationLink>
                </PaginationItem>
            </Pagination>

            <Modal size="md" isOpen={!isNil( fraisAdminId )} toggle={() => _openModal()}>
                <ModalHeader tag="h4" toggle={() => _openModal()}>{props.label.affaire.label6}</ModalHeader>
                <ModalBody>
                    <FraisAdmin
                        externalUse={false}
                        isCreated={false}
                        history={props.history}
                        affaireId={props.affaireid}
                        fraisAdminId={fraisAdminId}
                        label={props.label}
                        done={_openModal}
                        showMessagePopupFrais={props.showMessagePopupFrais}
                        language={props.language}/>
                </ModalBody>
            </Modal>
            {deleteAlert}
        </>
    );
}
