import React, { useState } from 'react';

// reactstrap components
import { Button, Pagination, PaginationItem, PaginationLink, Table } from 'reactstrap';
import { usePagination, useTable } from 'react-table';
import { useDrop, useDrag } from 'react-dnd';
import { ItemTypes } from '../../../components/Mail/ItemTypes';

const ceil = require( 'lodash/ceil' );
const size = require( 'lodash/size' );
const range = require( 'lodash/range' );
const PAGE_SIZE = 10;

export default function TableUsignSequence( { removeRecipient,
                                                modifyIndexRecepient,
                                                label, sequenceMethod, data, count } ) {

    // Data table prestation
    const columns = React.useMemo(
        () => [
            {
                Header: sequenceMethod === 'sequence' ? 'sequence' : '',
                accessor: 'sequence',
                Cell: row => {
                    // sequentially === 2
                    return sequenceMethod === 'sequence' ? row.value : '';
                }
            },
            {
                Header: 'email',
                accessor: 'email'
            },
            {
                Header: 'firstname',
                accessor: 'firstname',
            },
            {
                Header: 'lastname',
                accessor: 'lastname'
            },
            {
                Header: 'birthdate',
                accessor: 'birthdate',
            },
            {
                Header: '#',
                Cell: row => {
                    return <div>
                        <Button
                            color="primary"
                            className="btn-icon btn-link"
                            onClick={() => removeRecipient( row.row.original.sequence )}>
                            <i className="tim-icons icon-trash-simple "/>
                        </Button>
                    </div>;
                }
            }

        ],
        [sequenceMethod] );
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
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
            data,
            initialState: {
                pageSize: PAGE_SIZE,
                pageIndex: 0,
            },
            manualPagination: true,
            pageCount: ceil( count / PAGE_SIZE ),
        },
        usePagination
    );
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
    const moveRow = (dragIndex, hoverIndex) => {
        modifyIndexRecepient(dragIndex, hoverIndex);
    }
    return (
        <>
                <Table responsive
                       className="-striped -highlight primary-pagination"
                       {...getTableProps()}>
                    <thead>
                    {headerGroups.map( headerGroup => (
                        <tr {...headerGroup.getHeaderGroupProps()}>
                            <th></th>
                            {headerGroup.headers.map( column => (
                                <th {...column.getHeaderProps()}>{column.render( 'Header' )}</th>
                            ) )}
                        </tr>
                    ) )}
                    </thead>
                    <tbody {...getTableBodyProps()}>
                    {rows.map(
                        (row, index) =>
                            prepareRow(row) || (
                                <RowIndex
                                    sequenceMethod={sequenceMethod}
                                    index={index}
                                    row={row}
                                    moveRow={moveRow}
                                    {...row.getRowProps()}
                                />
                            )
                    )}
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
    );
}
const DND_ITEM_TYPE = 'row'

const RowIndex = ({ row, index, moveRow, sequenceMethod }) => {
    const dropRef = React.useRef(null)
    const dragRef = React.useRef(null)

    const [, drop] = useDrop({
        accept: DND_ITEM_TYPE,
        hover(item, monitor) {
            if (!dropRef.current) {
                return
            }
            const dragIndex = item.index
            const hoverIndex = index
            // Don't replace items with themselves
            if (dragIndex === hoverIndex) {
                return
            }
            // Determine rectangle on screen
            const hoverBoundingRect = dropRef.current.getBoundingClientRect()
            // Get vertical middle
            const hoverMiddleY =
                (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
            // Determine mouse position
            const clientOffset = monitor.getClientOffset()
            // Get pixels to the top
            const hoverClientY = clientOffset.y - hoverBoundingRect.top
            // Only perform the move when the mouse has crossed half of the items height
            // When dragging downwards, only move when the cursor is below 50%
            // When dragging upwards, only move when the cursor is above 50%
            // Dragging downwards
            if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
                return
            }
            // Dragging upwards
            if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
                return
            }
            // Time to actually perform the action
            moveRow(dragIndex, hoverIndex)
            // Note: we're mutating the monitor item here!
            // Generally it's better to avoid mutations,
            // but it's good here for the sake of performance
            // to avoid expensive index searches.
            item.index = hoverIndex
        },
    })

    const [{ isDragging }, drag, preview] = useDrag({
        type: ItemTypes.ROW,
        item: { type: DND_ITEM_TYPE, index },
        collect: monitor => ({
            isDragging: monitor.isDragging(),
        }),
    })

    const opacity = isDragging ? 0 : 1

    preview(drop(dropRef))
    drag(dragRef)

    return (
        <tr ref={dropRef} style={{ opacity }}>
            {sequenceMethod === 'sequence' ? (
                <td ref={dragRef}><i className="fas fa-arrows-alt"/></td>
            ): null}
            {row.cells.map(cell => {
                return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
            })}
        </tr>
    )
}