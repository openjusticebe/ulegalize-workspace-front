import React, { useEffect, useRef, useState } from 'react';
import { useFilters, useTable } from 'react-table';
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    Col,
    Collapse,
    Form,
    FormGroup,
    Input,
    Label,
    Row,
    Table
} from 'reactstrap';
import isNil from 'lodash/isNil';
import { getDeboursByDossierId } from '../../services/InvoiceService';
import map from 'lodash/map';
import size from 'lodash/size';
import ComptaDTO from '../../model/compta/ComptaDTO';
import { Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import round from 'lodash/round';

const DEBOURS = 'debours';

export default function DeboursInvoiceTable( {
                                                 debours, dossierId, invoiceId, label,
                                                 currency,
                                                 deboursListFunction,
                                                 handlesubTotalAddDetailClick,
                                             } ) {
    const [data, setData] = useState( [] );
    const [filterInvoiceDebours, setFilterInvoiceDebours] = useState( null );
    const { getAccessTokenSilently } = useAuth0();
    const deboursListVisible = useRef( false );
    const [subTotalDebours, setSubTotalDebours] = useState( { description: label.invoice.label129, amount: 0 } );

    // collapse
    const [openedCollapseDebours, setopenedCollapseDebours] = React.useState( false );

    useEffect( () => {
        (async () => {
            const accessToken = await getAccessTokenSilently();
            // get prestation for invoice
            if ( !isNil( dossierId ) ) {
                const result = await getDeboursByDossierId( accessToken, invoiceId, dossierId, filterInvoiceDebours );

                let fraisTmp = map( result.data, prest => {
                    return new ComptaDTO( prest );
                } );
                if ( size( fraisTmp ) > 0 ) {
                    deboursListVisible.current = true;
                }

                setData( fraisTmp );
                deboursListFunction( fraisTmp );
            }

        })();
    }, [getAccessTokenSilently, dossierId, invoiceId, filterInvoiceDebours] );

    const handlesubTotalAddDetailClickLocal = ( subTotal, type ) => {
        const tmp = { description: '', amount: 0 };

        if ( type === DEBOURS ) {
            tmp.description = label.invoice.label117;
            setSubTotalDebours( tmp );
        }

        handlesubTotalAddDetailClick( subTotal, type );
    };

    const handlesubTotalRemoveDetailClick = ( type ) => {
        const tmp = { description: '', amount: 0 };

        if ( type === DEBOURS ) {
            tmp.description = label.invoice.label117;
            setSubTotalDebours( tmp );
        }

    };
    const subTotalDeboursFunction = ( descrition, amount ) => {
        setSubTotalDebours( {
            ...subTotalDebours,
            description: descrition,
            amount: amount
        } );
    };

    const onChangeDeboursSelection = ( id, totalHt ) => {
        let deboursTmp = data;
        let index = deboursTmp.findIndex( object => object.id === id );
        let debour = deboursTmp[ index ];
        debour.invoiceChecked = !debour.invoiceChecked;

        if ( debour.invoiceChecked === true ) {
            subTotalDeboursFunction( subTotalDebours.description, parseFloat( (round( (subTotalDebours.amount + totalHt), 2 )).toFixed( 2 ) ) );
        }

        deboursTmp[ index ] = debour;
        setData( [...deboursTmp] );
        deboursListFunction( deboursTmp );
    };

    // Data table debours
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
                                    defaultChecked={row.value}
                                    disabled={data.valid}
                                    onChange={() => {
                                        onChangeDeboursSelection( row.row.original.id, row.row.original.montantHt );
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
                Header: 'Poste',
                accessor: 'poste.label',
                disableFilters: true
            },
            {
                Header: 'Tiers',
                accessor: 'tiersFullname',
                disableFilters: true
            },
            {
                Header: 'Montant HT',
                accessor: 'montantHt',
                width: 50,
                disableFilters: true
            },
            {
                Header: 'Montant',
                accessor: 'montant',
                width: 50,
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
                Filter: InvoicedDebourColumnFilter,
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
                                type="button"
                                disabled={data.valid}
                                size="sm"
                                onClick={() => {
                                    const tot = row.row.original.montant;
                                    const descr = row.row.original.poste.label;

                                    subTotalDeboursFunction( descr, parseFloat( (round( subTotalDebours.amount + tot, 2 )).toFixed( 2 ) ) );

                                    handlesubTotalAddDetailClickLocal( { description: descr, amount: tot }, DEBOURS );
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
        [label, subTotalDebours, data] );

    const _onChangeInvoicedDebourFilter = async ( value ) => {
        setFilterInvoiceDebours( value );
    };

    function InvoicedDebourColumnFilter( {
                                             column: { filterValue, setFilter, preFilteredRows, id },
                                         } ) {
        return (

            <select id={`deboursFilter`}
                className="form-control"
                    value={filterValue}
                    onChange={e => {
                        _onChangeInvoicedDebourFilter( e.target.value );
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
            {deboursListVisible.current === true ? (
                <Card className="card-plain">
                    <CardHeader role="tab">
                        <a
                            aria-expanded={openedCollapseDebours}
                            href="#pablo"
                            data-parent="#accordion"
                            data-toggle="collapse"
                            onClick={( e ) => {
                                e.preventDefault();
                                setopenedCollapseDebours( !openedCollapseDebours );
                            }}
                        >
                            {label.invoice.label129}{' '}
                            <i className="tim-icons icon-minimal-down"/>
                        </a>
                        {/* SUBTOTAL DEBOURS */}
                        <Form className="form-horizontal">
                            <Col md={6}>
                                {subTotalDebours.amount > 0 ? (
                                    <Row>
                                        <Col md="7" sm={7}>
                                            <label>{label.invoice.label118}</label>
                                            <FormGroup>
                                                <Input type="textarea"
                                                       rows={2}
                                                       onChange={( event ) => {
                                                           subTotalDebours.description = event.target.value;

                                                           setSubTotalDebours( {
                                                               ...subTotalDebours,
                                                               description: subTotalDebours.description
                                                           } );
                                                       }}
                                                       value={subTotalDebours.description}/>
                                            </FormGroup>
                                        </Col>
                                        <Col md="3" sm={3}>
                                            <label>{label.invoice.label104}</label>
                                            <FormGroup>
                                                {subTotalDebours.amount} {currency}
                                            </FormGroup>
                                        </Col>
                                        <Col md="2" sm={2}>
                                            <label></label>
                                            <FormGroup>
                                                <Button className="float-right" size="sm"
                                                        color="primary"
                                                        onClick={() => handlesubTotalAddDetailClickLocal( subTotalDebours, DEBOURS )}
                                                >
                                                    <i className="tim-icons  icon-simple-add padding-icon-text"/> {label.invoice.label132}
                                                </Button>
                                                <Button className="float-right" size="sm"
                                                        color="danger"
                                                        onClick={() => handlesubTotalRemoveDetailClick( DEBOURS )}
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
                    <Collapse role="tabpanel" isOpen={openedCollapseDebours}>
                        <CardBody>
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
                        </CardBody>
                    </Collapse>
                </Card>
            ) : null}
        </>
    );
}
