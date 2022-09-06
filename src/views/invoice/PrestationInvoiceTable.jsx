import React, { useEffect, useRef, useState } from 'react';
import { useFilters, useTable } from 'react-table';
import { Button, Card, CardHeader, Col, Collapse, Form, FormGroup, Input, Label, Row, Table } from 'reactstrap';
import isNil from 'lodash/isNil';
import { getPrestationByDossierId } from '../../services/InvoiceService';
import map from 'lodash/map';
import PrestationSummary from '../../model/prestation/PrestationSummary';
import size from 'lodash/size';
import { getDate } from '../../utils/DateUtils';
import { Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import round from 'lodash/round';

const PRESTATION = 'prestation';

export default function PrestationInvoiceTable( {
                                                    prestations, dossierId, invoiceId, label, currency,
                                                    prestationListFunction,
                                                    handlesubTotalAddDetail,
                                                } ) {
    const [data, setData] = useState( [] );
    const [filterInvoicePrestation, setFilterInvoicePrestation] = useState( null );
    const { getAccessTokenSilently } = useAuth0();
    const prestationListVisible = useRef( false );
    const [subTotalPrestation, setsubTotalPrestation] = useState( { description: label.invoice.label117, amount: 0 } );

    // collapse
    const [openedCollapsePrestation, setopenedCollapsePrestation] = React.useState( true );

    useEffect( () => {
        (async () => {
            const accessToken = await getAccessTokenSilently();
            // get prestation for invoice
            if ( !isNil( dossierId ) ) {
                const result = await getPrestationByDossierId( accessToken, invoiceId, dossierId, filterInvoicePrestation );

                let prestList = map( result.data, prest => {
                    return new PrestationSummary( prest );
                } );
                if ( size( prestList ) > 0 ) {
                    prestationListVisible.current = true;
                }
                setData( prestList );
                prestationListFunction( prestList );
            }

        })();
    }, [getAccessTokenSilently, dossierId, invoiceId, filterInvoicePrestation] );

    const _onChangeInvoicedPrestationFilter = async ( value ) => {
        setFilterInvoicePrestation( value );
    };

    function InvoicedPrestationColumnFilter( {
                                                 column: { filterValue, setFilter, preFilteredRows, id },
                                             } ) {
        return (

            <select
                id={`PrestaFilter`}
                className="form-control"
                    value={filterValue}
                    onChange={e => {
                        _onChangeInvoicedPrestationFilter( e.target.value );
                        setFilter( e.target.value || undefined );
                    }}
            >
                <option value="">{label.common.label19}</option>
                <option value="1">{label.common.label21}</option>
                <option value="0">{label.common.label20}</option>
            </select>
        )
            ;
    }

    const handlesubTotalAddDetailClickLocal = ( subTotal, type ) => {
        const tmp = { description: '', amount: 0 };

        if ( type === PRESTATION ) {
            tmp.description = label.invoice.label117;
            setsubTotalPrestation( tmp );
        }

        handlesubTotalAddDetail(subTotal, type)
    };

    const handlesubTotalRemoveDetailClick = ( type ) => {
        const tmp = { description: '', amount: 0 };

        if ( type === PRESTATION ) {
            tmp.description = label.invoice.label117;
            setsubTotalPrestation( tmp );
        }

    };
    const subTotalPrestationFunction = ( descrition, amount ) => {
        setsubTotalPrestation( {
            ...subTotalPrestation,
            description: descrition,
            amount: amount
        } );
    };

    // Data table prestation
    const columns = React.useMemo(
        () => [
            {
                Header: '#',
                accessor: 'invoiceChecked',
                Cell: row => {
                    return (
                        <FormGroup check>
                            <Label check>
                                <Input
                                    disabled={data.valid}
                                    defaultChecked={row.value}
                                    onChange={() => {
                                        onChangePrestationSelection( row.row.original.id, row.row.original.totalHt );
                                    }}
                                    type="checkbox"
                                />{' '}
                                <span className="form-check-sign">
                                    <span className="check"></span>
                                </span>
                            </Label>
                        </FormGroup>
                    );
                },
                disableFilters: true
            },
            {
                Header: label.prestation.label2,
                accessor: 'tsTypeItem.label',
                disableFilters: true
            },
            {
                Header: label.prestation.label3,
                accessor: 'dateAction',
                Cell: row => {
                    return (
                        <>{getDate( row.value )}</>
                    );
                },
                disableFilters: true
            },
            {
                Header: label.prestation.label4,
                accessor: 'time',
                Cell: row => {
                    return row.row.original.forfait === true ? label.prestation.label1 : (
                        <p>{row.value}</p>
                    );
                },
                disableFilters: true
            },
            {
                Header: label.prestation.label5,
                accessor: 'totalHt',
                Cell: row => {
                    return (
                        <>{row.value} {currency}</>
                    );
                },
                disableFilters: true
            },
            {
                Header: 'Prestataire',
                accessor: 'idGestItem.label',
                disableFilters: true
            },
            {
                Header: label.prestation.label9,
                accessor: 'alreadyInvoiced',
                Cell: row => {
                    return row.value ? (
                        <Link to={`/admin/invoice/${row.row.original.factExtId}`}>{row.row.original.factExtRef} </Link>
                    ) : 'NA';
                },
                Filter: InvoicedPrestationColumnFilter,
                filter: 'fuzzyText',
            },
            {
                Header: 'Note',
                accessor: 'comment',
                disableFilters: true
            },
            {
                Header: '',
                accessor: 'id',
                Cell: row => {
                    return (
                        <div className="float-right">
                            <Button
                                disabled={data.valid}
                                color="primary"
                                type="button"
                                size="sm"
                                onClick={() => {
                                    const tot = row.row.original.totalHt;
                                    const descr = row.row.original.tsTypeItem.label;

                                    subTotalPrestationFunction( descr,parseFloat( (round(subTotalPrestation.amount + tot, 2)).toFixed(2)) );

                                    handlesubTotalAddDetailClickLocal( { description: descr, amount: tot }, PRESTATION );
                                }}
                            >
                                <i className="tim-icons icon-simple-add"/> {label.invoice.label132}
                            </Button>
                        </div>
                    );
                },
                disableFilters: true
            }
        ],
        [label, subTotalPrestation, data] );
    const onChangePrestationSelection = ( id, totalHt ) => {
        let prestationsTemp = data;

        let index = prestationsTemp.findIndex( object => object.id === id );
        let prestation = prestationsTemp[ index ];
        prestation.invoiceChecked = !prestation.invoiceChecked;

        if ( prestation.invoiceChecked === true ) {
            subTotalPrestationFunction( subTotalPrestation.description, parseFloat((round(subTotalPrestation.amount + totalHt, 2)).toFixed(2) ));
        }

        prestationsTemp[ index ] = prestation;
        setData( [...prestationsTemp] );
        prestationListFunction( prestationsTemp );
    };

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
        rows,
        prepareRow,
    } = useTable( {
            columns,
            data,
            defaultColumn
        },
        useFilters,
    );

    return (
        <>

                {prestationListVisible.current === true ? (
                    <Card className="card-plain">
                        <CardHeader role="tab">
                            <a
                                aria-expanded={openedCollapsePrestation}
                                href="#pablo"
                                data-parent="#accordion"
                                data-toggle="collapse"
                                onClick={( e ) => {
                                    e.preventDefault();
                                    setopenedCollapsePrestation( !openedCollapsePrestation );
                                }}
                            >
                                {label.invoice.label117}{' '}


                                <i className="tim-icons icon-minimal-down"/>
                            </a>
                            {/* SUBTOTAL PRESTATION*/}
                            <Form className="form-horizontal">
                                <Col md={6}>
                                    {subTotalPrestation.amount > 0 ? (
                                        <Row>
                                            <Col md="7" sm={7}>
                                                <label>{label.invoice.label118}</label>
                                                <FormGroup>
                                                    <Input type="textarea"
                                                           rows={2}
                                                           onChange={( event ) => {
                                                               subTotalPrestation.description = event.target.value;

                                                               subTotalPrestationFunction( subTotalPrestation.description, subTotalPrestation.amount );

                                                           }}
                                                           value={subTotalPrestation.description}/>
                                                </FormGroup>
                                            </Col>
                                            <Col md="3" sm={3}>
                                                <label>{label.invoice.label104}</label>
                                                <FormGroup>
                                                    {subTotalPrestation.amount} {currency}
                                                </FormGroup>
                                            </Col>
                                            <Col md="2" sm={2}>
                                                <label></label>
                                                <FormGroup>
                                                    <Button className="float-right" size="sm"
                                                            color="primary"
                                                            onClick={() => handlesubTotalAddDetailClickLocal( subTotalPrestation, PRESTATION )}
                                                    >
                                                        <i className="tim-icons  icon-simple-add padding-icon-text"/> {label.invoice.label132}
                                                    </Button>
                                                    <Button className="float-right" size="sm"
                                                            color="danger"
                                                            onClick={() => handlesubTotalRemoveDetailClick( PRESTATION )}
                                                    >
                                                        <i className="tim-icons icon-simple-remove padding-icon-text"/> {label.common.clear}
                                                    </Button>
                                                </FormGroup>
                                            </Col>
                                        </Row>
                                    ) : null}
                                </Col>
                            </Form>
                        </CardHeader>
                        <Collapse role="tabpanel" isOpen={openedCollapsePrestation}>
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
                                    {rows.map( row => {
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

                        </Collapse>
                    </Card>
                ) : null}
        </>
    );
}
