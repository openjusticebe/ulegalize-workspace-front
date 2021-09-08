import React, { useEffect, useState } from 'react';
import ReactBSAlert from 'react-bootstrap-sweetalert';

// reactstrap components
import { Button, Table } from 'reactstrap';
import { useTable } from 'react-table';
import { useAuth0 } from '@auth0/auth0-react';
import ShareAffaireDTO from '../../model/affaire/ShareAffaireDTO';
import { deleteShareUser, getSharedUserByAffaireId } from '../../services/DossierService';
import { getDate } from '../../utils/DateUtils';

const map = require( 'lodash/map' );
const isNil = require( 'lodash/isNil' );

export default function ShareUsersAffaire( { label, showMessagePopup, affaireId, updateList, toggleModal } ) {
    const [data, setData] = useState( [] );
    const [deleteAlert, setDeleteAlert] = useState( null );

    const { getAccessTokenSilently } = useAuth0();
    // Data table prestation
    const columns = React.useMemo(
        () => [
            {
                Header: 'Cabinet',
                accessor: 'vcKey',
            },
            {
                Header: 'Email',
                accessor: 'userEmail'
            },
            {
                Header: 'Full name',
                accessor: 'fullname'
            },
            {
                Header: 'Shared date',
                accessor: 'sharedDate',
                Cell: row => {
                    return (
                        <>{getDate( row.value )}</>
                    );
                }
            },
            {
                Header: '#',
                accessor: 'id',
                Cell: row => {
                    return (
                        <div>
                            {row.row.original.enumVCOwner !== 'OWNER_VC' ? (
                                <Button
                                    className="btn-icon btn-link"
                                    onClick={() => {
                                        setDeleteAlert( <ReactBSAlert
                                            warning
                                            style={{ display: 'block', marginTop: '30px' }}
                                            title={label.common.label10}
                                            onConfirm={() => {
                                                delShare( row.row.original );
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
                            ): null}
                           {` `}

                        </div>
                    );
                }
            },

        ],
        [] );

    useEffect( () => {
        (async () => {
            const accessToken = await getAccessTokenSilently();

            let result = await getSharedUserByAffaireId( accessToken, affaireId );
            if ( !result.error ) {
                const dataList = map( result.data, share => {
                    return new ShareAffaireDTO( share );
                } );
                setData( dataList );
            }
        })();
    }, [getAccessTokenSilently, updateList] );

    const delShare = async ( data ) => {

        const accessToken = await getAccessTokenSilently();
        if ( !isNil( data ) ) {
            data.affaireId = affaireId;
            const result = await deleteShareUser( accessToken, data );
            if ( !result.error ) {
                showMessagePopup( label.shareAffaire.success201, 'primary' );
            } else {
                showMessagePopup( label.common.error3, 'danger' );
                toggleModal();
            }
        }

    };

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
    } = useTable( { columns, data } );
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
                {rows.map( ( row, i ) => {
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
            {deleteAlert}

        </>
    );

}
