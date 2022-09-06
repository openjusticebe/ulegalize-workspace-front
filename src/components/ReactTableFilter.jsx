import React from 'react';
import { useFilters, useTable } from 'react-table';
import { Input, Table } from 'reactstrap';

export default function ReactTableFilter( { columns, data } ) {

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
        </>
    );
}
