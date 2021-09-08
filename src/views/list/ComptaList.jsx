import React, { useEffect, useRef, useState } from 'react';
// reactstrap components
import {
    Card,
    CardBody,
    CardHeader,
    CardTitle,
    Col, Pagination, PaginationItem, PaginationLink,
    Row, Table,
} from 'reactstrap';
import { usePagination, useTable } from 'react-table';
import ReactLoading from 'react-loading';
import { Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import ComptaDTO from '../../model/compta/ComptaDTO';
import { countComptaByDossierId, getComptaByDossierId } from '../../services/ComptaServices';

const ceil = require( 'lodash/ceil');
const map = require( 'lodash/map' );
const range = require( 'lodash/range' );
const size = require( 'lodash/size' );
const PAGE_SIZE = 10;

export default function ComptaList ({label}) {
    const loadRef = useRef(true);

    const [data, setData] = useState( [] );
    const [count, setCount] = useState(0);

    const { getAccessTokenSilently } = useAuth0();

    const columns = React.useMemo(
        () => [
            {
                Header: '#',
                accessor: 'id',
                Cell: row => {
                    return (
                        <div>
                            <Link to={`/admin/compta/${row ? row.value :0}`}
                                    size="sm">  <i className="tim-icons icon-pencil " /></Link>
                        </div>
                    )}
            },
            {
                Header: label.comptalist.label1,
                accessor: 'poste.label'
            },
            {
                Header: label.comptalist.label3,
                accessor: 'tiersFullname',
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
                    )}
            },
            {
                Header: label.comptalist.label2,
                accessor: 'dateValue'
            },
            {
                Header: label.comptalist.label4,
                //accessor: 'montantHt',
                accessor: row => (row && row.idType === 1 ? row.montantHt : "")

                //Cell: row => {
                //    return (
                //        <div>
                //            {row.idType}
                //        </div>
                //    )}
            },
            {
                Header: label.comptalist.label5,
                accessor: row => (row && row.idType === 2 ? row.montantHt : "")
            },
            //{
            //    Header: 'Invoice',
            //    accessor: 'idFacture'
            //}
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
            data: data,
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

            let resultCount = await countComptaByDossierId( accessToken, null );
            if ( !resultCount.error ) {
                setCount( resultCount.data );
            }
        })();
    }, [count] );


    useEffect( () => {
        (async () => {
            const accessToken = await getAccessTokenSilently();

            const offset = pageIndex * pageSize;
            let result = await getComptaByDossierId( accessToken, null, offset, pageSize );
            loadRef.current = false;
            if ( !result.error ) {
                const dataList = map(result.data, frais =>{
                    return new ComptaDTO(frais);
                })
                setData( dataList );
            }
        })();
    }, [pageIndex, pageSize] );

    let pagination ;
    let reste = count % pageSize !== 0 ? 1 : 0;


    let nums = range(Math.floor(count / pageSize) + reste);
    if(count > 1 ) {
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
        pagination =  <PaginationItem active>
            <PaginationLink href="#">
                0
            </PaginationLink>
        </PaginationItem>;
    }

        return (
            <>
                <div className="content">
                    <Row>
                        <Col lg="12" sm={12}>
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        <h4>{label.comptalist.label7}
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
                                                                {label.common.preview}
                                                            </PaginationLink>
                                                        </PaginationItem>
                                                        {pagination}

                                                        <PaginationItem disabled={!canNextPage}>
                                                            <PaginationLink onClick={() => nextPage()}  >
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
            </>
        );
}
