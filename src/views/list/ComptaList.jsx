import React, { useEffect, useRef, useState } from 'react';
// reactstrap components
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    CardTitle,
    Col, Input, Pagination, PaginationItem, PaginationLink,
    Row, Table,
} from 'reactstrap';
import { useFilters, usePagination, useTable } from 'react-table';
import ReactLoading from 'react-loading';
import { Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import ComptaDTO from '../../model/compta/ComptaDTO';
import { getComptaByDossierList } from '../../services/ComptaServices';
import { getOptionNotification } from '../../utils/AlertUtils';
import NotificationAlert from 'react-notification-alert';
import { getComptaTypes, getPostes, getTiers } from '../../services/SearchService';
import ItemDTO from '../../model/ItemDTO';
import ModalReportCompta from '../popup/reports/ModalReportCompta';
import ModalReportCompteTiers from '../popup/reports/ModalReportCompteTiers';

const ceil = require( 'lodash/ceil' );
const map = require( 'lodash/map' );
const range = require( 'lodash/range' );
const size = require( 'lodash/size' );
const PAGE_SIZE = 10;

export default function ComptaList( { label, vckeySelected } ) {
    const loadRef = useRef( true );
    const skipPageResetRef = useRef();
    const notificationAlert = useRef( null );

    const [openDialogCompta, setOpenDialogCompta] = useState( false );
    const [openDialogCompteTiers, setOpenDialogCompteTiers] = useState( false );
    const filteredRef = useRef( { client: null, number: null, year: null, poste: '', typeCompta: '', compte: '' } );

    const [filteredClient, setFilteredClient] = useState( '' );
    const [filteredNumber, setFilteredNumber] = useState( null );
    const [filteredYear, setFilteredYear] = useState( null );
    const [filteredPoste, setFilteredPoste] = useState( null );
    const [filteredCompte, setFilteredCompte] = useState( null );
    const [filteredType, setFilteredType] = useState( null );

    const [data, setData] = useState( [] );
    const [count, setCount] = useState( 0 );

    const { getAccessTokenSilently } = useAuth0();

    const columns = React.useMemo(
        () => [
            {
                Header: '#',
                accessor: 'id',
                Cell: row => {
                    return (
                        <div>
                            <Link to={`/admin/compta/${row ? row.value : 0}`}
                                  size="sm"> <i className="tim-icons icon-pencil "/></Link>
                        </div>
                    );
                },
                disableFilters: true
            },
            {
                Header: label.comptalist.label6,
                accessor: 'idDossierItem.label',
                Cell: row => {
                    return (
                        <div>
                            {row && row.row.original.idDossierItem ? (
                                <Link to={`/admin/affaire/${row.row.original.idDossierItem.value}`}
                                      size="sm">{row.row.original.idDossierItem.label}</Link>
                            ) : null}
                        </div>
                    );
                },
                filter: 'fuzzyText',
                Filter: DossierColumnFilter,
                width: 150
            },
            {
                Header: label.comptalist.label1,
                accessor: 'poste.label',
                filter: 'fuzzyText',
                Filter: PosteColumnFilter,
            },
            {
                Header: label.comptalist.label10,
                accessor: 'compte.label',
                filter: 'fuzzyText',
                Filter: CompteColumnFilter,
            },
            {
                Header: label.comptalist.label3,
                accessor: 'tiersFullname',
                filter: 'fuzzyText',
                Filter: ClientColumnFilter,
                minWidth: 400
            },
            {
                Header: label.comptalist.label2,
                accessor: 'dateValue',
                disableFilters: true
            },
            {
                Header: 'type',
                accessor: row => (row && row.idType === 1 ? label.comptalist.label8 : label.comptalist.label9),
                Filter: TypeColumnFilter,
            },
            {
                Header: label.comptalist.label4,
                accessor: row => (row && row.idType === 1 ? row.montantHt : ''),
                disableFilters: true

            },
            {
                Header: label.comptalist.label5,
                accessor: row => (row && row.idType === 2 ? row.montantHt : ''),
                disableFilters: true
            },
            //{
            //    Header: 'Invoice',
            //    accessor: 'idFacture'
            //}
        ],

        [label] );

    const _onChangeClientFilter = async ( value ) => {
        filteredRef.current = { ...filteredRef.current, client: value } ;
        setFilteredClient( value );
    };
    const _onChangeYearFilter = async ( value ) => {
        filteredRef.current = { ...filteredRef.current, year: value } ;
        setFilteredYear( value );
    };
    const _onChangeNumberFilter = async ( value ) => {
        filteredRef.current = { ...filteredRef.current, number: value } ;
        setFilteredNumber( value );
    };

    const _onChangePosteFilter = async ( value ) => {
        filteredRef.current = { ...filteredRef.current, poste: value } ;
        setFilteredPoste( value );
    };
    const _onChangeCompteFilter = async ( value ) => {
        filteredRef.current = { ...filteredRef.current, compte: value } ;
        setFilteredCompte( value );
    };

    const _onChangeTypeFilter = async ( value ) => {
        filteredRef.current = { ...filteredRef.current, typeCompta: value } ;
        setFilteredType( value );
    };

    function PosteColumnFilter( {
                                    column: { filterValue, setFilter, preFilteredRows, id },
                                } ) {
        const [postes, setPostes] = useState( [] );

        useEffect( () => {
            (async () => {
                try {
                    const accessToken = await getAccessTokenSilently();

                    let resltPoste = await getPostes( accessToken, null, null, null );
                    let posteData = map( resltPoste.data, poste => {
                        return new ItemDTO( poste );
                    } );
                    setPostes( posteData );
                } catch ( e ) {
                    // doesn't work
                }
            })();
        }, [getAccessTokenSilently] );

        return (
            <select className="form-control"
                    value={filterValue}
                    onChange={e => {
                        _onChangePosteFilter( e.target.value );
                        setFilter( e.target.value || undefined );
                    }}
            >
                <option value="">{label.common.label19}</option>
                {postes.map( ( option, i ) => (
                    <option key={i} value={option.value}>
                        {option.label}
                    </option>
                ) )}
            </select>
        );
    }

    function CompteColumnFilter( {
                                    column: { filterValue, setFilter, preFilteredRows, id },
                                } ) {
        const [tiers, setTiers] = useState( [] );

        useEffect( () => {
            (async () => {
                try {
                    const accessToken = await getAccessTokenSilently();
                    let resultCompte = await getTiers( accessToken);

                    let tiersData = map( resultCompte.data, tier => {
                        return new ItemDTO( tier );
                    } );
                    setTiers( tiersData );
                } catch ( e ) {
                    // doesn't work
                }
            })();
        }, [getAccessTokenSilently] );

        return (
            <select className="form-control"
                    value={filterValue}
                    onChange={e => {
                        _onChangeCompteFilter( e.target.value );
                        setFilter( e.target.value || undefined );
                    }}
            >
                <option value="">{label.common.label19}</option>
                {tiers.map( ( option, i ) => (
                    <option key={i} value={option.value}>
                        {option.label}
                    </option>
                ) )}
            </select>
        );
    }

    function TypeColumnFilter( {
                                   column: { filterValue, setFilter, preFilteredRows, id },
                               } ) {
        const [typeCompta, setTypeCompta] = useState( [] );

        useEffect( () => {
            (async () => {
                try {
                    const accessToken = await getAccessTokenSilently();

                    let resultType = await getComptaTypes( accessToken );
                    let typeData = map( resultType.data, typeCompt => {
                        return new ItemDTO( typeCompt );
                    } );
                    setTypeCompta( typeData );
                } catch ( e ) {
                    // doesn't work
                }
            })();
        }, [getAccessTokenSilently] );

        return (
            <select className="form-control"
                    value={filterValue}
                    onChange={e => {
                        _onChangeTypeFilter( e.target.value );
                        setFilter( e.target.value || undefined );
                    }}
            >
                <option value="">{label.common.label19}</option>
                {typeCompta.map( ( option, i ) => (
                    <option key={i} value={option.value}>
                        {option.label}
                    </option>
                ) )}
            </select>
        );
    }

    function ClientColumnFilter( { column: { filterValue, setFilter, preFilteredRows, id }, } ) {
        return (
            <Input
                id="custom-select"
                type="text"
                placeholder={label.affaire.filterClient}
                value={filteredRef.current.client}
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
        state,
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

            let result = await getComptaByDossierList( accessToken, offset, pageSize, filteredClient, filteredNumber, filteredYear, filteredPoste, filteredType, filteredCompte );
            loadRef.current = false;

            if ( !result.error ) {
                skipPageResetRef.current = true;
                const dataList = map( result.data.content, frais => {
                    return new ComptaDTO( frais );
                } );
                setCount( result.data.totalElements );
                setData( result.data.content ? dataList : []);
            }
        })();
    }, [pageIndex, pageSize, filteredRef.current] );

    useEffect( () => {
        skipPageResetRef.current = false;
    } );
    let pagination;
    let reste = count % pageSize !== 0 ? 1 : 0;

    let nums = range( Math.floor( count / pageSize ) + reste );
    if ( count > 1 ) {
        // case 1 : less than 10
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

    const toggleModalCompta = () => {
        state.filters
        setOpenDialogCompta( !openDialogCompta );
    };
    const toggleModalCompteTiers = () => {
        state.filters
        setOpenDialogCompteTiers( !openDialogCompteTiers );
    };

    const showMessagePopup = ( message, type ) => {
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
                                    <h4>{label.comptalist.label7}
                                        <Button
                                            onClick={toggleModalCompteTiers}
                                            className="float-right"
                                            color="info"
                                            data-placement="bottom"
                                            id="tooltip811118933"
                                            type="button"
                                            size="sm"
                                        >
                                            <i className="tim-icons icon-paper"/> {` compte tiers`}
                                        </Button>
                                        <Button
                                            onClick={toggleModalCompta}
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
            </div>
            {openDialogCompta ? (
                <ModalReportCompta
                    filtered={filteredRef.current}
                    vckeySelected={vckeySelected}
                    showMessage={showMessagePopup}
                    label={label}
                    openDialog={openDialogCompta}
                    toggle={toggleModalCompta}/>
            ) : null}
            {openDialogCompteTiers ? (
                <ModalReportCompteTiers
                    vckeySelected={vckeySelected}
                    showMessage={showMessagePopup}
                    label={label}
                    openDialog={openDialogCompteTiers}
                    toggle={toggleModalCompteTiers}/>
            ) : null}
        </>
    );
}
