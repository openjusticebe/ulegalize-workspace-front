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
import { Link } from 'react-router-dom';
import { getDossierList } from '../../services/DossierService';
import { useAuth0 } from '@auth0/auth0-react';
import VisibilityIcon from '@material-ui/icons/Visibility';
import NotificationAlert from 'react-notification-alert';
import { getOptionNotification } from '../../utils/AlertUtils';
import { getDate } from '../../utils/DateUtils';
import ModalReportPrestation from '../popup/reports/ModalReportPrestation';
import ModalReportDossier from '../popup/reports/ModalReportDossier';

const ceil = require( 'lodash/ceil' );
const range = require( 'lodash/range' );
const padStart = require( 'lodash/padStart' );
const size = require( 'lodash/size' );
const PAGE_SIZE = 10;

export default function DossiersList( props ) {
    const { label, vckeySelected } = props;
    const [data, setData] = useState( [] );
    const [count, setCount] = useState( 0 );
    const skipPageResetRef = useRef();

    const { getAccessTokenSilently } = useAuth0();

    const [filtered, setFiltered] = useState( { client: null, number: null, year: null, balance: '', initiales: '' } );
    const [filteredArchived, setFilteredArchived] = useState( '0' );
    const [filteredBalance, setFilteredBalance] = useState( '' );
    const [filteredClient, setFilteredClient] = useState( '' );
    const [filteredNumber, setFilteredNumber] = useState( null );
    const [filteredYear, setFilteredYear] = useState( null );
    const [filteredInitiale, setFilteredInitiale] = useState( '' );
    const [openDialogPrestation, setOpenDialogPrestation] = useState( false );
    const [openDialogDossier, setOpenDialogDossier] = useState( false );
    const notificationAlert = useRef( null );
    const loadRef = useRef( true );

    const columns = React.useMemo(
        () => [
            {
                Header: '#',
                accessor: 'id',
                Cell: row => {
                    return (
                        <div>
                            <Link to={`/admin/affaire/${row.value}`}
                                  size="sm"> <VisibilityIcon/></Link>
                            <Link className="padding-left-25" to={`/admin/update/affaire/${row.value}`}
                                  size="sm"> <i className="tim-icons icon-pencil "/></Link>
                        </div>
                    );
                },
                disableFilters: true
            },
            {
                Header: label.affaireList.label2,
                accessor: row => (row.year + '/' + padStart( row.num, 4, '0' )),
                filter: 'fuzzyText',
                Filter: DossierColumnFilter,
                width: 150
            },
            {
                Header: label.affaireList.label7,
                accessor: 'typeItem.label',
                disableFilters: true,
                minWidth: 200
            },
            {
                Header: label.affaireList.label3,
                //accessor: row => (row.initiales ),
                accessor: row => (`(${row.initiales})`),
                filter: 'fuzzyText',
                Filter: InitialeColumnFilter,
                width: 100

            },
            {
                Header: label.affaireList.label4,
                accessor: row => {
                    if ( row.type !== 'MD' ) {
                        return ((row.client ? row.client.label : '') + ' / ' + (row.adverseClient ? row.adverseClient.label : ''));

                    } else {
                        return 'NA';
                    }
                },
                // Use our custom `fuzzyText` filter on this column
                filter: 'fuzzyText',
                Filter: ClientColumnFilter,
                minWidth: 600
            },
            {
                Header: label.affaireList.label5,
                accessor: 'balance',
                filter: 'fuzzyText',
                Filter: BalanceColumnFilter,
            },
            {
                Header: label.affaireList.label6,
                accessor: row => (row.closeDossier ? getDate( row.closeDossier ) : 'NA'),
                filter: 'fuzzyText',
                Filter: ArchivedColumnFilter,
            },

        ],
        [] );
    const _onChangeArchivedFilter = async ( value ) => {
        setFilteredArchived( value );
        setFiltered( { ...filtered, archived: value } );
    };
    const _onChangeBalanceFilter = async ( value ) => {
        setFilteredBalance( value );
        setFiltered( { ...filtered, balance: value } );
    };
    const _onChangeClientFilter = async ( value ) => {
        setFilteredClient( value );
        setFiltered( { ...filtered, client: value } );
    };
    const _onChangeYearFilter = async ( value ) => {

        setFilteredYear( value );
        setFiltered( { ...filtered, year: value } );
    };
    const _onChangeNumberFilter = async ( value ) => {

        setFilteredNumber( value );
        setFiltered( { ...filtered, number: value } );
    };
    const _onChangeInitFilter = async ( value ) => {
        setFilteredInitiale( value );
        setFiltered( { ...filtered, initiales: value } );
    };

    function ClientColumnFilter( { column: { filterValue, setFilter, preFilteredRows, id }, } ) {
        return (
            <Input
                id="custom-select"
                type="text"
                placeholder={label.affaire.filterClient}
                value={filtered.client}
                onChange={( e ) => {
                    _onChangeClientFilter( e.target.value );
                    setFilter( e.target.value || undefined );
                }}
            >
            </Input>
        );
    }

    function DossierColumnFilter( { column: { filterValue, setFilter, preFilteredRows, id } } ) {
        return (
            <Row style={{ width: '160px' }}>
                <Col style={{ padding: '0 4px 0 0' }}>
                    <Input
                        placeholder={label.affaire.filterYearDossier}
                        id="custom-select22"
                        type="text"
                        maxLength={4}
                        onChange={( e ) => {
                            var reg = new RegExp( '^[0-9]+$' );

                            if ( !reg.test( e.target.value ) && e.target.value !== '' ) {
                                notificationAlert.current.notificationAlert( getOptionNotification( label.common.error6, 'danger' ) );
                                return;
                            }
                            _onChangeYearFilter( e.target.value );
                            setFilter( e.target.value || undefined );
                        }}
                    >
                    </Input>
                </Col>
                <Col style={{ padding: '0 8px 0 0' }}>
                    <Input
                        placeholder={label.affaire.filterNumberDossier}
                        id="custom-select1"
                        type="text"
                        onChange={( e ) => {
                            var reg = new RegExp( '^[0-9]+$' );

                            if ( !reg.test( e.target.value ) && e.target.value !== '' ) {
                                notificationAlert.current.notificationAlert( getOptionNotification( label.common.error6, 'danger' ) );
                                return;
                            }
                            _onChangeNumberFilter( e.target.value );
                            setFilter( e.target.value || undefined );
                        }}
                    >
                    </Input>
                </Col>

            </Row>
        );
    }

    const showMessagePopup = ( message, type ) => {
        if ( message && type ) {
            notificationAlert.current.notificationAlert( getOptionNotification( message, type ) );
        }
    };

    function InitialeColumnFilter( { column: { filterValue, setFilter, preFilteredRows, id } } ) {
        return (
            <Input
                placeholder={label.affaire.filterInit}
                id="custom-select2"
                type="text"
                value={filterValue}
                onChange={( e ) => {
                    _onChangeInitFilter( e.target.value );
                    setFilter( e.target.value || undefined );
                }}
            >
            </Input>
        );
    }

    function BalanceColumnFilter( {
                                      column: { filterValue, setFilter, preFilteredRows, id },
                                  } ) {
        return (
            <select className="form-control"
                    value={filterValue}
                    onChange={e => {
                        _onChangeBalanceFilter( e.target.value );
                        setFilter( e.target.value || undefined );
                    }}
            >
                <option value="">{label.affaire.label24}</option>
                <option value="1">{label.affaire.label25}</option>
                <option value="0">{label.affaire.label26}</option>
            </select>
        );
    }

    function ArchivedColumnFilter( {
                                       column: { filterValue, setFilter, preFilteredRows, id },
                                   } ) {
        return (
            <select className="form-control"
                    value={filterValue}
                    onChange={e => {
                        _onChangeArchivedFilter( e.target.value );
                        setFilter( e.target.value || undefined );
                    }}
            >
                <option value="0">{label.affaire.label40}</option>
                <option value="1">{label.affaire.label41}</option>
                <option value="">{label.affaire.label42}</option>
            </select>
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

    const toggleModalLargePrestation = () => {
        setOpenDialogPrestation( !openDialogPrestation );
    };
    const toggleModalDossier = () => {
        setOpenDialogDossier( !openDialogDossier );
    };

    const defaultColumn = React.useMemo(
        () => ({
            //width: 100,
            maxWidth: 800,
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
        usePagination
    );

    useEffect( () => {
        (async () => {
            const accessToken = await getAccessTokenSilently();

            const offset = pageIndex * pageSize;
            let result;
            loadRef.current = false;

            result = await getDossierList( accessToken, offset, pageSize, vckeySelected, filteredClient, filteredYear, filteredNumber, filteredBalance, filteredInitiale, filteredArchived );

            if ( !result.error ) {
                skipPageResetRef.current = true;
                setCount( result.data.totalElements );
                setData( result.data.content ? result.data.content : [] );
            }
        })();
    }, [pageIndex, pageSize, filtered] );

    useEffect( () => {
        skipPageResetRef.current = false;
    } );

    let pagination;
    let reste = count % pageSize !== 0 ? 1 : 0;

    let nums = range( Math.floor( count / pageSize ) + reste );
    if ( count > 1 ) {
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
                                    <h4>{label.affaire.label22}
                                        <Button
                                            onClick={toggleModalLargePrestation}
                                            className="btn-icon float-right"
                                            color="primary"
                                            data-placement="bottom"
                                            id="tooltip811118932"
                                            type="button"
                                            size="sm"
                                        >
                                            <i className="tim-icons icon-paper"/>
                                        </Button>
                                        <Button
                                            onClick={toggleModalDossier}
                                            className="btn-icon float-right"
                                            color="info"
                                            data-placement="bottom"
                                            id="tooltip811118933"
                                            type="button"
                                            size="sm"
                                        >
                                            <i className="tim-icons icon-paper"/>
                                        </Button>
                                    </h4>
                                </CardTitle>
                                <p className="card-category">
                                    {label.affaire.label23}
                                </p>
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
                {openDialogPrestation ? (
                    <ModalReportPrestation
                        vckeySelected={vckeySelected}
                        dossierId={null}
                        showMessage={showMessagePopup}
                        label={label}
                        openDialog={openDialogPrestation}
                        toggle={toggleModalLargePrestation}/>
                ) : null}
                {openDialogDossier ? (
                    <ModalReportDossier
                        filtered={filtered}
                        vckeySelected={vckeySelected}
                        showMessage={showMessagePopup}
                        label={label}
                        openDialog={openDialogDossier}
                        toggle={toggleModalDossier}/>
                ) : null}
            </div>
        </>
    );
}