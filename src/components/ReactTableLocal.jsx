import React from 'react';
import { useTable } from 'react-table';
import { Table } from 'reactstrap';

export default function ReactTableLocal( { columns, data } ) {

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
    } = useTable({ columns, data });
    return (
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
    );
}
