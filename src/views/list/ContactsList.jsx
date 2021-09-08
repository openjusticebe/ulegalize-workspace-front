import React, { useEffect, useRef, useState } from 'react';
// reactstrap components
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    CardTitle,
    Col,
    Input,
    Pagination,
    PaginationItem,
    PaginationLink,
    Row,
    Table
} from 'reactstrap';
import ReactLoading from 'react-loading';

import { useFilters, usePagination, useTable } from 'react-table';
// nodejs library that concatenates classes
import { countClientsByName, deleteClientById, getClientsPagination } from '../../services/ClientService';
import { useAuth0 } from '@auth0/auth0-react';
import VisibilityIcon from '@material-ui/icons/Visibility';
import { RegisterClientModal } from '../../components/client/RegisterClientModal';
import { getOptionNotification } from '../../utils/AlertUtils';
import NotificationAlert from 'react-notification-alert';
import ReactBSAlert from 'react-bootstrap-sweetalert';
import { countByClientId } from '../../services/DossierService';

const isEmpty = require( 'lodash/isEmpty' );
const ceil = require( 'lodash/ceil' );
const isNil = require( 'lodash/isNil' );
const range = require( 'lodash/range' );
const size = require( 'lodash/size' );
const PAGE_SIZE = 10;

export default function ContactsList( props ) {
    const { label, userId, vckeySelected, fullName, language, email, enumRights } = props;
    const notificationAlert = useRef( null );
    const [data, setData] = useState( [] );
    const [count, setCount] = useState( 0 );
    const [clientModal, setClientModal] = useState( null );
    const [openclientModal, setOpenclientModal] = useState( false );
    const [updateList, setUpdateList] = useState( false );
    const [deleteAlert, setDeleteAlert] = useState( null );
    const skipPageResetRef = useRef();
    const loadRef = useRef( true );

    const { getAccessTokenSilently } = useAuth0();

    const [filtered, setFiltered] = useState( { client: null } );
    const [filteredClient, setFilteredClient] = useState( '' );

    const columns = React.useMemo(
        () => [
            {
                Header: '#',
                accessor: 'id',
                Cell: row => {
                    return (
                        <div>
                            <Button onClick={() => {
                                // write client
                                const right = [0, 22];

                                let rightsFound;
                                if ( enumRights ) {
                                    rightsFound = enumRights.filter( element => right.includes( element ) );
                                }
                                if ( !isNil( rightsFound ) && isEmpty( rightsFound ) ) {
                                    notificationAlert.current.notificationAlert( getOptionNotification( label.unauthorized.label9, 'danger' ) );
                                    return;
                                }
                                setClientModal( row.value );
                                setOpenclientModal( !openclientModal );
                            }}
                                    size="sm" className="btn-icon btn-link btn-color-link"> <VisibilityIcon/>
                            </Button>
                            <Button
                                className="btn-icon btn-link"
                                onClick={() => {
                                    // write client
                                    const right = [0, 22];

                                    let rightsFound;
                                    if ( enumRights ) {
                                        rightsFound = enumRights.filter( element => right.includes( element ) );
                                    }
                                    if ( !isNil( rightsFound ) && isEmpty( rightsFound ) ) {
                                        notificationAlert.current.notificationAlert( getOptionNotification( label.unauthorized.label9, 'danger' ) );
                                        return;
                                    }
                                    setDeleteAlert( <ReactBSAlert
                                        warning
                                        style={{ display: 'block', marginTop: '100px' }}
                                        title={label.ajout_client.label1}
                                        onConfirm={() => {
                                            delClient( row.value );
                                            setDeleteAlert( null );
                                        }}
                                        onCancel={() => { setDeleteAlert( null ); }}
                                        confirmBtnBsStyle="success"
                                        cancelBtnBsStyle="danger"
                                        confirmBtnText={label.ajout_client.label2}
                                        cancelBtnText={label.common.cancel}
                                        showCancel
                                        btnSize=""
                                    >
                                        {label.ajout_client.label3}
                                    </ReactBSAlert> );

                                }}
                                color="primary" size="sm">
                                <i className="tim-icons icon-trash-simple "/>
                            </Button>{` `}

                        </div>
                    );
                },
                disableFilters: true
            },
            {
                Header: label.ajout_client.label4,
                accessor: 'fullName',
                filter: 'fuzzyText',
                Filter: NameColumnFilter,
            },
            {
                Header: label.ajout_client.lbl_address,
                accessor: 'address',
                disableFilters: true
            },
            {
                Header: label.ajout_client.lbl_tel,
                accessor: 'phone',
                disableFilters: true
            },
            {
                Header: label.ajout_client.lbl_email,
                accessor: 'email',
                disableFilters: true
            },

        ],
        [] );

    const delClient = async ( clientId ) => {

        const accessToken = await getAccessTokenSilently();
        let result = await countByClientId( accessToken, clientId );

        if ( result.data === 0 ) {
            if ( !isNil( clientId ) ) {
                result = await deleteClientById( accessToken, clientId );
                if ( !result.error ) {
                    setUpdateList( !updateList );
                    notificationAlert.current.notificationAlert( getOptionNotification( label.ajout_client.success1, 'primary' ) );
                }
            }
        } else {
            notificationAlert.current.notificationAlert( getOptionNotification( label.ajout_client.error1, 'danger' ) );

        }

    };
    const _onChangeNameFilter = async ( value ) => {
        setFilteredClient( value );
        setFiltered( { ...filtered, fullname: value } );
    };

    function NameColumnFilter( { column: { setFilter }, } ) {
        return (
            <Input
                id="custom-select"
                type="text"
                placeholder={'Recherche client'}
                value={filtered.client}
                onChange={( e ) => {
                    _onChangeNameFilter( e.target.value );
                    setFilter( e.target.value || undefined );
                }}

            >
            </Input>
        );
    }

// Define a default UI for filtering
    function DefaultColumnFilter( {
                                      column: { filterValue, preFilteredRows, setFilter },
                                  } ) {
        const count = preFilteredRows.length;

        return (
            <Input
                value={filterValue || ''}
                onChange={e => {
                    setFilter( e.target.value || undefined ); // Set undefined to remove the filter entirely
                }}
                placeholder={`Search ${count} records...`}
            />
        );
    }

    const defaultColumn = React.useMemo(
        () => ({
            // Let's set up our default Filter UI
            Filter: DefaultColumnFilter,
        }),
        []
    );

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
            defaultColumn,
            initialState: {
                pageSize: PAGE_SIZE,
                pageIndex: 0,
            },
            manualPagination: true,
            pageCount: ceil( count / PAGE_SIZE ),
            autoResetPage: !skipPageResetRef.current,
            autoResetExpanded: !skipPageResetRef.current,
            autoResetGroupBy: !skipPageResetRef.current,
            autoResetSelectedRows: !skipPageResetRef.current,
            autoResetSortBy: !skipPageResetRef.current,
            autoResetFilters: !skipPageResetRef.current,
            autoResetRowState: !skipPageResetRef.current,
        },
        useFilters,
        //useGlobalFilter, // useGlobalFilter!
        usePagination
    );

    useEffect( () => {
        (async () => {
            const accessToken = await getAccessTokenSilently();
            let resultCount;

            resultCount = await countClientsByName( accessToken, vckeySelected, filteredClient );

            if ( !resultCount.error ) {
                setCount( resultCount.data );
            }
        })();
    }, [count, filtered, updateList] );

    useEffect( () => {
        (async () => {
            const accessToken = await getAccessTokenSilently();

            const offset = pageIndex * pageSize;
            let result;

            loadRef.current = false;
            result = await getClientsPagination( accessToken, offset, pageSize, filteredClient );

            if ( !result.error ) {
                skipPageResetRef.current = true;
                setData( result.data );
            }
        })();
    }, [pageIndex, pageSize, filtered, updateList] );

    useEffect( () => {
        skipPageResetRef.current = false;
    } );

    let pagination;
    let reste = count % pageSize !== 0 ? 1 : 0;

    let nums = range( Math.floor( count / pageSize ) + reste );
    if ( count > 1 ) {
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

    const _toggleClient = () => {
        setClientModal( null );
        setOpenclientModal( false );
    };

    const _clientUpdated = async () => {
        setClientModal( null );
        setOpenclientModal( false );
        setUpdateList( !updateList );
        notificationAlert.current.notificationAlert( getOptionNotification( label.ajout_client.toastrSuccessPUpdate, 'primary' ) );
    };
    return (
        <>
            <div className="content">
                <div className="rna-container">
                    <NotificationAlert ref={notificationAlert}/>
                </div>
                {deleteAlert}

                <Row>
                    <Col lg="12" sm={12}>
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    <h4>{label.ajout_client.label5}
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
                {openclientModal ? (
                    <RegisterClientModal
                        history={props.history}
                        isCreate={false}
                        userId={userId}
                        label={label}
                        idClient={clientModal}
                        vckeySelected={vckeySelected}
                        fullName={fullName}
                        language={language}
                        clientUpdated={_clientUpdated}
                        clientCreated={null}
                        toggleClient={_toggleClient}
                        modal={openclientModal}
                        emailUserConnected={email}
                        enumRights={enumRights}
                    />
                ) : null}
            </div>
        </>
    );
}