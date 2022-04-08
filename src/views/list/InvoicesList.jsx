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
import ReactLoading from 'react-loading';
import { useFilters, usePagination, useTable } from 'react-table';
// nodejs library that concatenates classes
import { Link } from 'react-router-dom';
import { getInvoiceList } from '../../services/InvoiceService';
import { useAuth0 } from '@auth0/auth0-react';
import { getOptionNotification } from '../../utils/AlertUtils';
import NotificationAlert from 'react-notification-alert';
import InvoiceGenerator from '../../components/Invoice/InvoiceGenerator';
import { getDate } from '../../utils/DateUtils';
import ModalCheckSessionDrive from '../popup/drive/ModalCheckSessionDrive';
import DatePicker from 'react-datepicker';
import VisibilityIcon from '@material-ui/icons/Visibility';
import { getFactureEcheances } from '../../services/SearchService';
import ItemDTO from '../../model/ItemDTO';

const ceil = require( 'lodash/ceil' );
const range = require( 'lodash/range' );
const PAGE_SIZE = 10;
const isNil = require( 'lodash/isNil' );
const map = require( 'lodash/map' );
const size = require( 'lodash/size' );

export default function InvoicesList( props ) {
    const skipPageResetRef = useRef();
    const loadRef = useRef( true );
    const [filtered, setFiltered] = useState( { echeance: null, date: null, number: null, year: null } );
    const [filteredNumber, setFilteredNumber] = useState( '' );
    const [filteredYear, setFilteredYear] = useState( null );
    const [filteredClient, setFilteredClient] = useState( '' );

    const [data, setData] = useState( [] );
    const [count, setCount] = useState( 0 );
    const notificationAlert = useRef( null );
    const { label, location, driveType, vckeySelected, currency } = props;
    const { getAccessTokenSilently } = useAuth0();
    const [showInvoice, setShowInvoice] = useState( false );
    const invoiceSelected = useRef( null );
    const filteredDate = useRef( null );
    const filteredEcheanceRef = useRef( null );
    const [checkTokenDrive, setCheckTokenDrive] = useState( false );

    const _togglePopupCheckSession = ( message, type ) => {
        if ( !isNil( message ) && !isNil( type ) ) {
            notificationAlert.current.notificationAlert( getOptionNotification( message, type ) );
        }
        setCheckTokenDrive( !checkTokenDrive );
    };

    const columns = React.useMemo(
        () => [
            {
                Header: '#',
                accessor: 'id',
                width: 120,
                Cell: row => {
                    return row ? (
                        <div>
                            <Link to={`/admin/invoice/${row.value}`}
                                  size="sm"> <i className="tim-icons icon-pencil "/></Link>{` `}
                            <Button
                                className="btn-icon btn-link margin-left-10"
                                onClick={() => {
                                    invoiceSelected.current = row.row.original;
                                    setShowInvoice( !showInvoice );
                                }}
                                color="primary" size="sm">
                                <VisibilityIcon/>
                            </Button>
                            {` `}
                        </div>
                    ) : '';
                },
                disableFilters: true

            },
            {
                Header: label.invoice.label120,
                accessor: 'reference',
                disableFilters: true,
                width: 100
            },
            {
                Header: label.invoice.label112,
                accessor: 'dateValue',
                Cell: row => {
                    return row ? (
                        <>{getDate( row.value )}</>
                    ) : '';
                },
                Filter: DateColumnFilter,
                filter: 'equals',
            },
            {
                Header: label.invoice.label114,
                accessor: 'clientItem.label',
                filter: 'fuzzyText',
                Filter: NameColumnFilter,
            },
            {
                Header: label.invoice.label121,
                accessor: 'echeanceItem.label',
                Filter: SelectColumnFilter,
                filter: 'includes',
            },
            {
                Header: label.invoice.label122,
                accessor: 'valid',
                Cell: row => {
                    return (
                        <div>
                            {row && row.value === true ? (
                                <i className="tim-icons icon-check-2 green"/>
                            ) : (
                                <i className="tim-icons icon-simple-remove red"/>
                            )}
                            {` `}
                        </div>
                    );
                },
                disableFilters: true
            },
            {
                Header: label.invoice.label105,
                accessor: 'montant',
                Cell: row => {
                    return (
                        <>{row.value} {currency}</>
                    )
                },
                disableFilters: true
            },
            {
                Header: label.invoice.label125,
                accessor: 'totalHonoraire',
                Cell: row => {
                    return (
                        <>{row.value} {currency}</>
                    )
                },
                disableFilters: true
            },
            {
                Header: label.invoice.label110,
                accessor: 'dossier',
                filter: 'fuzzyText',
                Filter: DossierColumnFilter,
            },

        ],
        [props.label] );

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

    const _onChangeEcheanceFilter = async ( value ) => {
        filteredEcheanceRef.current = value;
        setFiltered( { ...filtered, archived: value } );
    };
    const _onChangeDateFilter = async ( value ) => {
        loadRef.current = true;
        filteredDate.current = value;
        setFiltered( { ...filtered, date: value } );
    };

    const _onChangeNumberFilter = async ( value ) => {

        setFilteredNumber( value );
        setFiltered( { ...filtered, number: value } );
    };
    const _onChangeYearFilter = async ( value ) => {

        setFilteredYear( value );
        setFiltered( { ...filtered, year: value } );
    };

    /*
    *** FILTERS ***
     */
    function SelectColumnFilter( {
                                     column: { filterValue, setFilter, preFilteredRows, id },
                                 } ) {
        const [facturesEcheances, setFacturesEcheances] = useState( [] );
        useEffect( () => {
            (async () => {
                try {
                    const accessToken = await getAccessTokenSilently();

                    let resultFacturesEcheances = await getFactureEcheances( accessToken );
                    let factureEcheanceData = map( resultFacturesEcheances.data, echeance => {
                        return new ItemDTO( echeance );
                    } );
                    setFacturesEcheances( factureEcheanceData );
                } catch ( e ) {
                    // doesn't work
                }
            })();
        }, [getAccessTokenSilently] );

        // Render a multi-select box
        return (
            <select
                className="form-control"
                value={filterValue}
                onChange={e => {
                    _onChangeEcheanceFilter( e.target.value );
                    setFilter( e.target.value || undefined );
                }}
            >
                <option value="">All</option>
                {facturesEcheances.map( ( option, i ) => (
                    <option key={i} value={option.value}>
                        {option.label}
                    </option>
                ) )}
            </select>
        );
    }

    function DateColumnFilter( {
                                   column: { filterValue, setFilter, preFilteredRows, id },
                               } ) {
        // Render a date
        return (
            <DatePicker
                selected={filteredDate.current ? new Date( filteredDate.current ) : null}
                onChange={date => {
                    _onChangeDateFilter( date );
                    if ( !isNil( date ) ) {
                        setFilter( getDate( date ) || undefined );
                    } else {
                        setFilter( null );
                    }
                }
                }
                locale="fr"
                timeCaption="date"
                dateFormat="yyyy-MM-dd"
                placeholderText="yyyy-mm-dd"
                className="form-control color-primary"
                name="date_facture"
                id="dateFacture"
            />
        );
    }

    function DossierColumnFilter( { column: { filterValue, setFilter, preFilteredRows, id } } ) {
        return (
            <Row>
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
                        id="custom-select33"
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

    useEffect( () => {
        (async () => {
            if ( !isNil( driveType ) && driveType === 'dropbox' ) {
                setCheckTokenDrive( true );
            }
        })();
    }, [driveType] );

    useEffect( () => {
        skipPageResetRef.current = false;

    } );

    useEffect( () => {
        (async () => {
            const accessToken = await getAccessTokenSilently();

            const offset = pageIndex * pageSize;
            let result;
            loadRef.current = false;

            result = await getInvoiceList( accessToken, offset, pageSize, vckeySelected, filteredEcheanceRef.current, filteredDate.current, filteredYear, filteredNumber, filteredClient );

            if ( !result.error ) {
                skipPageResetRef.current = true;
                setCount( result.data.totalElements );
                setData( result.data.content );
            }

            // display from delete
            if ( location && location.state && !isNil( location.state.message ) ) {
                notificationAlert.current.notificationAlert( getOptionNotification( location.state.message, 'primary' ) );
                props.history.replace( { ...props.history, state: {} } );
            }
        })();
    }, [pageIndex, pageSize, filtered] );

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

    const showInvoiceFun = () => {
        setShowInvoice( !showInvoice );
    };
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
                                <Row>
                                    <Col md={10}>
                                        <CardTitle>
                                            <h4>{label.invoice.label10}
                                            </h4>
                                        </CardTitle>
                                    </Col>
                                    <Col md={2}>
                                        <Link to="/admin/create/invoice"
                                            className="btn btn-sm btn-primary float-right"
                                            color="primary"
                                            size="sm"
                                        >
                                            <i className="tim-icons icon-simple-add padding-icon-text"/> {' '}
                                            {label.common.create}
                                        </Link>
                                    </Col>
                                </Row>
                            </CardHeader>
                            <CardBody>
                                {loadRef.current === false ? (
                                    <Row>
                                        <Col md="12">
                                            <Table responsive
                                                   className="-striped -highlight primary-pagination tableWrap"
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
            {showInvoice ? (
                <Modal size="lg" style={{ width: 'fit-content' }} isOpen={showInvoice} toggle={showInvoiceFun}>
                    <ModalHeader>
                        <button type="button" className="close" data-dismiss="modal" aria-label="Close"
                                onClick={showInvoiceFun}>
                            <i className="tim-icons icon-simple-remove"></i>
                        </button>
                        <h4 className="modal-title">{label.invoice.label106}</h4>
                    </ModalHeader>
                    <ModalBody>
                        <InvoiceGenerator
                            isValid={invoiceSelected.current.valid}
                            invoiceId={invoiceSelected.current.id}
                            label={label}
                            showMessage={showMessage}/>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={showInvoiceFun}>
                            {label.common.close}
                        </Button>
                    </ModalFooter>
                </Modal>) : null}

            {checkTokenDrive ?
                (
                    <ModalCheckSessionDrive
                        label={label}
                        toggle={_togglePopupCheckSession}
                        checkTokenDrive={checkTokenDrive}/>
                ) : null}
        </>
    );

}

