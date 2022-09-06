import React, { useEffect, useRef, useState } from 'react';
import { useFilters, useTable } from 'react-table';
import { Button, Card, CardHeader, Col, Collapse, Form, FormGroup, Input, Label, Row, Table } from 'reactstrap';
import isNil from 'lodash/isNil';
import { getFraisAdminByDossierId } from '../../services/InvoiceService';
import map from 'lodash/map';
import size from 'lodash/size';
import FraisAdminDTO from '../../model/fraisadmin/FraisAdminDTO';
import { Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import round from 'lodash/round';

const FRAIS_ADMIN = 'fraisAdmin';

export default function FraisAdminInvoiceTable( {
                                                    fraisAdmin, dossierId, invoiceId, label, currency,
                                                    fraisAdminListFunction,
                                                    handlesubTotalAddDetailClick,
                                                } ) {
    const [data, setData] = useState( [] );
    const [filterInvoiceFraisAdmin, setFilterInvoiceFraisAdmin] = useState( null );
    const { getAccessTokenSilently } = useAuth0();
    const fraisAdminListVisible = useRef( false );
    const [subTotalFraisAdmin, setSubTotalFraisAdmin] = useState( { description: label.invoice.label128, amount: 0 } );

    // collapse
    const [openedCollapseFraisAdm, setopenedCollapseFraisAdm] = React.useState( false );

    useEffect( () => {
        (async () => {
            const accessToken = await getAccessTokenSilently();
            // get prestation for invoice
            if ( !isNil( dossierId ) ) {
                const result = await getFraisAdminByDossierId( accessToken, invoiceId, dossierId, filterInvoiceFraisAdmin );
                let fraisTmp = map( result.data, prest => {
                    return new FraisAdminDTO( prest );
                } );
                if ( size( fraisTmp ) > 0 ) {
                    fraisAdminListVisible.current = true;
                }

                setData( fraisTmp );
                fraisAdminListFunction( fraisTmp );
            }

        })();
    }, [getAccessTokenSilently, dossierId, invoiceId, filterInvoiceFraisAdmin] );

    const _onChangeInvoicedFraisAdminFilter = async ( value ) => {
        setFilterInvoiceFraisAdmin( value );
    };

    function InvoicedFraisAdminColumnFilter( {
                                                 column: { filterValue, setFilter, preFilteredRows, id },
                                             } ) {
        return (

            <select
                id={`FraisAdminFilter`}
                className="form-control"
                    value={filterValue}
                    onChange={e => {
                        _onChangeInvoicedFraisAdminFilter( e.target.value );
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

        if ( type === FRAIS_ADMIN ) {
            tmp.description = label.invoice.label117;
            setSubTotalFraisAdmin( tmp );
        }

        handlesubTotalAddDetailClick( subTotal, type );
    };

    const handlesubTotalRemoveDetailClick = ( type ) => {
        const tmp = { description: '', amount: 0 };

        if ( type === FRAIS_ADMIN ) {
            tmp.description = label.invoice.label117;
            setSubTotalFraisAdmin( tmp );
        }

    };
    const subTotaFraisAdminFunction = ( descrition, amount ) => {
        setSubTotalFraisAdmin( {
            ...subTotalFraisAdmin,
            description: descrition,
            amount: amount
        } );
    };

    // Data table frais admin
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
                                        let cost = parseFloat( row.row.original.pricePerUnit ) * parseFloat( row.row.original.unit );
                                        const tot = parseFloat( round( cost, 2 ).toFixed( 2 ) );
                                        onChangeFraisAdminSelection( row.row.original.id, tot );
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
                Header: 'Type',
                accessor: 'idDebourTypeItem.label',
                disableFilters: true
            },
            {
                Header: 'Mesure',
                accessor: 'mesureDescription',
                disableFilters: true
            },
            {
                Header: 'Prix',
                accessor: 'price',
                Cell: row => {
                    let cost = parseFloat( row.row.original.pricePerUnit ) * parseFloat( row.row.original.unit );
                    data.costCalculated = round( cost, 2 ).toFixed( 2 );
                    return (
                        <>{data.costCalculated} {currency}</>
                    );
                },
                disableFilters: true
            },
            {
                Header: 'Unite',
                accessor: 'unit',
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
                Filter: InvoicedFraisAdminColumnFilter,
                filter: 'fuzzyText',
            },
            {
                Header: '',
                accessor: 'id',
                Cell: row => {
                    return (
                        <div className="float-right">
                            <Button
                                color="primary"
                                disabled={data.valid}
                                type="button"
                                size="sm"
                                onClick={() => {
                                    let cost = parseFloat( row.row.original.pricePerUnit ) * parseFloat( row.row.original.unit );
                                    const tot = parseFloat( round( cost, 2 ).toFixed( 2 ) );
                                    const descr = row.row.original.idDebourTypeItem.label;

                                    subTotaFraisAdminFunction( descr, parseFloat( (round( subTotalFraisAdmin.amount + tot, 2 )).toFixed( 2 ) ) );

                                    handlesubTotalAddDetailClickLocal( {
                                        description: descr,
                                        amount: tot
                                    }, FRAIS_ADMIN );
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
        [label, subTotalFraisAdmin, data] );

    const onChangeFraisAdminSelection = ( id, totalHt ) => {
        let fraisAdminTmp = data;
        let index = fraisAdminTmp.findIndex( object => object.id === id );
        let fraisAdm = fraisAdminTmp[ index ];
        fraisAdm.invoiceChecked = !fraisAdm.invoiceChecked;

        if ( fraisAdm.invoiceChecked === true ) {
            subTotaFraisAdminFunction( subTotalFraisAdmin.description, parseFloat( (round( subTotalFraisAdmin.amount + totalHt, 2 )).toFixed( 2 ) ) );
        }
        fraisAdminTmp[ index ] = fraisAdm;
        setData( [...fraisAdminTmp] );
        fraisAdminListFunction( fraisAdminTmp );

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

            {fraisAdminListVisible.current === true ? (
                <Card className="card-plain">
                    <CardHeader role="tab">
                        <a
                            aria-expanded={openedCollapseFraisAdm}
                            href="#pablo"
                            data-parent="#accordion"
                            data-toggle="collapse"
                            onClick={( e ) => {
                                e.preventDefault();
                                setopenedCollapseFraisAdm( !openedCollapseFraisAdm );
                            }}
                        >
                            {label.invoice.label128}{' '}


                            <i className="tim-icons icon-minimal-down"/>
                        </a>
                        {/* SUBTOTAL FRAIS_ADMIN*/}
                        <Form className="form-horizontal">
                            <Col md={6}>
                                {subTotalFraisAdmin.amount > 0 ? (
                                    <Row>
                                        <Col md="7" sm={7}>
                                            <label>{label.invoice.label118}</label>
                                            <FormGroup>
                                                <Input type="textarea"
                                                       rows={2}
                                                       onChange={( event ) => {
                                                           subTotalFraisAdmin.description = event.target.value;

                                                           subTotaFraisAdminFunction( subTotalFraisAdmin.description, subTotalFraisAdmin.amount );

                                                       }}
                                                       value={subTotalFraisAdmin.description}/>
                                            </FormGroup>
                                        </Col>
                                        <Col md="3" sm={3}>
                                            <label>{label.invoice.label104}</label>
                                            <FormGroup>
                                                {subTotalFraisAdmin.amount} {currency}
                                            </FormGroup>
                                        </Col>
                                        <Col md="2" sm={2}>
                                            <label></label>
                                            <FormGroup>
                                                <Button className="float-right" size="sm"
                                                        color="primary"
                                                        onClick={() => handlesubTotalAddDetailClickLocal( subTotalFraisAdmin, FRAIS_ADMIN )}
                                                >
                                                    <i className="tim-icons  icon-simple-add padding-icon-text"/> {label.invoice.label132}
                                                </Button>
                                                <Button className="float-right" size="sm"
                                                        color="danger"
                                                        onClick={() => handlesubTotalRemoveDetailClick( FRAIS_ADMIN )}
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
                    <Collapse role="tabpanel" isOpen={openedCollapseFraisAdm}>
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
