import React, { useEffect, useRef, useState } from 'react';
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    CardTitle,
    Col,
    Pagination,
    PaginationItem,
    PaginationLink, PopoverBody, PopoverHeader,
    Row,
    Table, UncontrolledPopover
} from 'reactstrap';
import { useAuth0 } from '@auth0/auth0-react';
import { usePagination, useTable } from 'react-table';
import ReactLoading from 'react-loading';
import NotificationAlert from 'react-notification-alert';
import { getDateDetails } from '../../utils/DateUtils';
import { checkPaymentActivated } from '../../services/PaymentServices';
import ErrorOutlineOutlinedIcon from '@material-ui/icons/ErrorOutlineOutlined';
import { CustomPopover } from '../affaire/StatusQuestionPopup';
import CreateIcon from '@material-ui/icons/Create';
import GetApp from '@material-ui/icons/GetApp';
import ModalUploadSignDocument from '../affaire/popup/ModalUploadSignDocument';
import { downloadFileAttachedUsign } from '../../services/transparency/CaseService';
import { getOptionNotification } from '../../utils/AlertUtils';
import { downloadWithName } from '../../utils/TableUtils';
import { attachEsignDocumentByVcKey, getUsignByVcKey } from '../../services/transparency/UsignService';
import SignatureDTO from '../../model/usign/SignatureDTO';

const ceil = require( 'lodash/ceil' );
const range = require( 'lodash/range' );
const size = require( 'lodash/size' );
const isNil = require( 'lodash/isNil' );
const PAGE_SIZE = 10;

export default function UsignList( {
                                        label,
                                        updateList,
                                        showMessage,
                                        vckeySelected
                                    } ) {

    const [data, setData] = useState( [] );
    const [count, setCount] = useState( 0 );
    const [deleteAlert, setDeleteAlert] = useState( null );
    const { getAccessTokenSilently } = useAuth0();
    const loadRef = useRef( true );
    const skipPageResetRef = useRef();
    const notificationAlert = useRef( null );
    const payment = useRef( false );
    const [modalUsignlDisplay, setModalUsignlDisplay] = useState( false );
    const [modalNotPaidSignDocument, setModalNotPaidSignDocument] = useState( false );


    const _handleDownloadFile = async ( usignId, filename ) => {
        const accessToken = await getAccessTokenSilently();

        const result = await downloadFileAttachedUsign( accessToken, usignId );
        //const name = fileContent.name;
        //const arrn = name.split( '/' );
        if ( result.error ) {
            notificationAlert.current.notificationAlert( getOptionNotification( label.affaire.error1, 'danger' ) );
        } else {
            downloadWithName( result.data, filename );
        }
    };


    const columns = React.useMemo(
        () => [
            {
                Header: '#',
                accessor: 'usignId',
                Cell: row => {
                    let statusGlyph = (<Col sm={6} md={6}>
                        <Button
                            color="primary"
                            className="btn-icon btn-link margin-left-10"
                            type="button"
                            id={`PopoverNormal-${row.value}`}>
                            <ErrorOutlineOutlinedIcon/>
                        </Button>
                        <UncontrolledPopover trigger="focus" placement="left" target={`PopoverNormal-${row.value}`}>
                            <PopoverHeader>{label.casJuridiqueForm.status}</PopoverHeader>
                            <PopoverBody>
                                <CustomPopover label={label}/>
                            </PopoverBody>
                        </UncontrolledPopover>
                    </Col>);
                    if ( row.row.original.status === 'SIGN' ) {
                        statusGlyph = (<Col sm={6} md={6}>
                            <Button
                                type="button"
                                color="primary"
                                className="btn-icon btn-link margin-left-10"
                                id={`PopoverSign-${row.value}`}>
                                <CreateIcon className="green"/>
                            </Button>
                            <UncontrolledPopover trigger="focus" placement="left" target={`PopoverSign-${row.value}`}>
                                <PopoverHeader>{label.casJuridiqueForm.status}</PopoverHeader>
                                <PopoverBody>
                                    <CustomPopover label={label}/>
                                </PopoverBody>
                            </UncontrolledPopover>
                        </Col>);
                    } else if ( row.row.original.status === 'WAITING' ) {
                        statusGlyph = (<Col sm={6} md={6}>
                            <Button
                                type="button"
                                id={`PopoverStart-${row.value}`}
                                color="primary"
                                className="btn-icon btn-link margin-left-10">
                                <CreateIcon className="red glyphicon-ring"/>
                            </Button>
                            <UncontrolledPopover trigger="focus" placement="left" target={`PopoverStart-${row.value}`}>
                                <PopoverHeader>{label.casJuridiqueForm.status}</PopoverHeader>
                                <PopoverBody>
                                    <CustomPopover label={label}/>
                                </PopoverBody>
                            </UncontrolledPopover>
                        </Col>);
                    } else if ( row.row.original.status === 'START' ) {
                        statusGlyph = (<Col sm={6} md={6}>
                            <Button
                                type="button"
                                id={`PopoverStart-${row.value}`}
                                color="primary"
                                className="btn-icon btn-link margin-left-10">
                                <CreateIcon className="red glyphicon-ring"/>
                            </Button>
                            <UncontrolledPopover trigger="focus" placement="left" target={`PopoverStart-${row.value}`}>
                                <PopoverHeader>{label.casJuridiqueForm.status}</PopoverHeader>
                                <PopoverBody>
                                    <CustomPopover label={label}/>
                                </PopoverBody>
                            </UncontrolledPopover>
                        </Col>);
                    } else if ( row.row.original.status === 'NORMAL' ) {
                        statusGlyph = (<Col sm={6} md={6}>
                            <Button
                                type="button"
                                id={`PopoverNormal-${row.value}`}
                                size="sm"
                                color="primary"
                                className="btn-icon btn-link margin-left-10">
                                <ErrorOutlineOutlinedIcon/>
                            </Button>
                            <UncontrolledPopover trigger="focus" placement="left" target={`PopoverNormal-${row.value}`}>
                                <PopoverHeader>{label.casJuridiqueForm.status}</PopoverHeader>
                                <PopoverBody>
                                    <CustomPopover label={label}/>
                                </PopoverBody>
                            </UncontrolledPopover>
                        </Col>);
                    }
                    return <Row>
                        {statusGlyph}
                        <Col sm={1} md={1}>
                            <Button
                                size="sm"
                                color="primary"
                                disabled={row.row.original.status === 'WAITING'}
                                className="btn-icon"
                                onClick={() => _handleDownloadFile( row.row.original.usignId, row.row.original.documentName )}>
                                <GetApp/>
                            </Button>
                        </Col>
                        {` `}
                    </Row>;
                }
            },
            {
                Header: label.mail.label10,
                accessor: 'documentName'
            },
            {
                Header: label.mail.label12,
                accessor: 'createDate',
                Cell: row => {
                    return getDateDetails( row.value );
                }
            }
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
                hiddenColumns: []
            },
            manualPagination: true,
            pageCount: ceil( count / PAGE_SIZE ),
        },
        usePagination
    );
    useEffect( () => {
        (async () => {
            const accessToken = await getAccessTokenSilently();

            const offset = pageIndex * pageSize;
            let result;
            loadRef.current = false;

            result = await getUsignByVcKey( accessToken, offset, pageSize );

            if ( !result.error ) {
                skipPageResetRef.current = true;
                setCount( result.data.totalElements );
                setData( result.data.content );
            }
        })();
    }, [pageIndex, pageSize, updateList] );

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


    const _openUsign = async () => {
        const accessToken = await getAccessTokenSilently();

        let resultPayment = await checkPaymentActivated( accessToken );
        if ( !isNil( resultPayment ) ) {
            payment.current = resultPayment.data;
            if ( payment.current === true ) {
                setModalUsignlDisplay( !modalUsignlDisplay );
            } else {
                setModalNotPaidSignDocument( !modalNotPaidSignDocument );
            }
        }
    };

    const _attachEsignDocument = async ( file ) => {
        const accessToken = await getAccessTokenSilently();

        if ( isNil( file ) ) {
            notificationAlert.current.notificationAlert( getOptionNotification( label.affaire.error2, 'danger' ) );
            return;
        }
        notificationAlert.current.notificationAlert( getOptionNotification( label.affaire.label9, 'warning' ) );

        const result = await attachEsignDocumentByVcKey( accessToken, file );

        if ( !result.error ) {
            notificationAlert.current.notificationAlert( getOptionNotification( label.affaire.success1, 'success' ) );
        }

        const offset = pageIndex * pageSize;
        const resultUsign = await getUsignByVcKey( accessToken, offset, pageSize );

        if ( !resultUsign.error && resultUsign.data.content ) {
            const dataUsignTmp = resultUsign.data.content ? resultUsign.data.content.map( ( sign ) => {
                return new SignatureDTO( sign );
            } ) : [];

            setData( dataUsignTmp );
        }
    };


    return (
        <>
            {deleteAlert}

            <div className="content">
                <div className="rna-container">
                    <NotificationAlert ref={notificationAlert}/>
                </div>
                <Row>
                    <Col lg="12" sm={12}>
                        <Card>
                            <CardHeader>
                                <CardHeader>
                                    <Row>
                                        <Col md={10}>
                                            <CardTitle>
                                                <h4>{label.dashboard.label7}
                                                </h4>
                                            </CardTitle>
                                        </Col>
                                        <Col md={2}>
                                            <Button
                                                onClick={() => _openUsign()}
                                                className="float-right"
                                                color="primary"
                                                data-placement="bottom"
                                                type="button"
                                                size="sm"
                                            >
                                                <i className="tim-icons icon-send padding-icon-text"/> {' '}
                                                {label.common.send}
                                            </Button>
                                        </Col>
                                    </Row>
                                </CardHeader>

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

            {/* POPUP USIGN */}
            {modalUsignlDisplay ? (
                <ModalUploadSignDocument
                    showMessagePopup={showMessage}
                    affaireId={null}
                    vckeySelected={vckeySelected}
                    cas={null}
                    label={label}
                    payment={payment.current}
                    toggleModalDetails={_openUsign}
                    attachEsignDocument={_attachEsignDocument}
                    modalDisplay={modalUsignlDisplay}/>
            ) : null}
        </>
    );
}

