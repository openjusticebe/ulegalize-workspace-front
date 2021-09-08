import React, { useEffect, useRef, useState } from 'react';
import { Button, Col, Form, FormGroup, Input, Label, Row, Table } from 'reactstrap';
import { useAuth0 } from '@auth0/auth0-react';
import {
    changeAdminDefaultVat, countVirtualCabVatByVcKey,
    createAdminVat,
    deleteAdminVat,
    existVirtualCabVatByVat
} from '../../services/AdminService';
import NotificationAlert from 'react-notification-alert';
import { getOptionNotification } from '../../utils/AlertUtils';
import CircularProgress from '@material-ui/core/CircularProgress';
import { getVats } from '../../services/SearchService';
import ItemDTO from '../../model/ItemDTO';
import { countInvoiceDetailsByVat } from '../../services/InvoiceService';
import ReactBSAlert from 'react-bootstrap-sweetalert';

const map = require( 'lodash/map' );

const Vats = ( props ) => {
    const notificationAlert = useRef( null );
    const { getAccessTokenSilently } = useAuth0();
    const [itemName, setItemName] = useState( '' );
    const [data, setData] = useState( [] );
    const [loading, setLoading] = useState( false );
    const updatedList = useRef( false );
    const itemSelected = useRef( null );
    const [deleteAlert, setDeleteAlert] = useState( null );


    const { label } = props.parentProps;
    useEffect( () => {
        (async () => {
            const accessToken = await getAccessTokenSilently();

            let resultVat = await getVats( accessToken );
            let vats = map( resultVat.data, data => {
                return new ItemDTO( data );
            } );

            setData( vats );
        })();
    }, [getAccessTokenSilently, updatedList.current] );

    const handleAddItem = async () => {
        setLoading( true );
        if ( itemName.trim() !== '' ) {

            const accessToken = await getAccessTokenSilently();
            const resultAlreadyExist = await existVirtualCabVatByVat( accessToken, itemName.trim() );

            if ( resultAlreadyExist.error || resultAlreadyExist.data === true ) {
                handleshowAlert( label.vats.error2, 'danger' );
                setLoading( false );
                return;
            }

            let result = await createAdminVat( accessToken, itemName.trim() );
            if ( !result.error ) {
                setItemName( '' );
                updatedList.current = !updatedList.current;
                handleshowAlert( label.vats.label100, 'success');
                setLoading( false );
            } else {
                setLoading( false );
                handleshowAlert( label.vats.label11, 'danger' );
            }
        } else {
            setLoading( false );
            handleshowAlert( label.vats.label4, 'danger' );
        }
    };

    const handleshowAlert = ( message, type ) => {
        notificationAlert.current.notificationAlert(
            getOptionNotification( message, type )
        );
    };

    const handleDeleteItem = async ( item, e ) => {
        const accessToken = await getAccessTokenSilently();

        // check invoice vat before delete if it's used
        const resultCount = await countInvoiceDetailsByVat( accessToken, item.value );

        if ( resultCount.error || resultCount.data > 0 ) {
            handleshowAlert( label.vats.error1, 'danger' );
            return;
        }

        // check invoice vat before delete if it's used
        const resultNb = await countVirtualCabVatByVcKey( accessToken );

        if ( resultNb.error || resultNb.data === 1 ) {
            handleshowAlert( label.vats.error3, 'danger' );
            return;
        }

        let result = await deleteAdminVat( accessToken, item.value );
        if ( !result.error ) {
            setData( ( data ) => data.filter( ( obj ) => obj.value !== item.value ) );
            handleshowAlert( label.vats.label9, 'info' );
        } else {
            handleshowAlert( label.vats.label10, 'danger' );
        }
        itemSelected.current = null;
    };

    const handleUpdateItem = async ( itemValue, newDefault ) => {
        setLoading( true );

        const accessToken = await getAccessTokenSilently();

        let result = await changeAdminDefaultVat( accessToken, itemValue, newDefault );
        if ( !result.error ) {
            updatedList.current = !updatedList.current;

            handleshowAlert( label.vats.label17, 'info' );
        } else {
            handleshowAlert( label.common.error2, 'danger' );
        }
        setLoading( false );
    };

    return (
        <div className="content">
            <div className="rna-container">
                <NotificationAlert ref={notificationAlert}/>
            </div>
            <Form className="form-horizontal" method="get">
                <Row style={{ marginLeft: 10 }}>
                    <FormGroup>
                        <Input
                            placeholder={label.vats.label1}
                            type="number"
                            value={itemName}
                            onChange={( e ) => setItemName( e.target.value )}
                        />
                    </FormGroup>
                    <FormGroup>
                        <Button
                            style={{ marginTop: 0, marginLeft: 4 }}
                            color="primary"
                            disable={loading}
                            onClick={handleAddItem}
                        >
                            {label.vats.label2}
                        </Button>
                    </FormGroup>
                    {loading && (
                        <CircularProgress color="primary" className="ml-3" size={30}/>
                    )}
                </Row>
            </Form>
            <Row className="mt-3">
                <Col md={12} lg={12}>
                    <div
                        style={{
                            maxHeight: '350px',
                            overflowY: 'auto',
                        }}
                    >
                        <Table responsive>
                            <thead>
                            <tr>
                                <th>#</th>
                                <th>{label.vats.label15}</th>
                                <th>{label.vats.label16}</th>
                            </tr>
                            </thead>
                            <tbody>
                            {data.map( ( item, index ) => (
                                <>
                                    <tr key={index}>
                                        <td style={{ width: '0.5%' }}>
                                            <Button className="btn-icon btn-link" color="primary" size="sm" onClick={()=>{
                                                itemSelected.current = item;
                                                setDeleteAlert( <ReactBSAlert
                                                    warning
                                                    style={{ display: 'block', marginTop: '100px' }}
                                                    title={label.common.label10}
                                                    onConfirm={() => {
                                                        handleDeleteItem( itemSelected.current);
                                                        setDeleteAlert( null );
                                                    }}
                                                    onCancel={() => { setDeleteAlert( null ); }}
                                                    confirmBtnBsStyle="success"
                                                    cancelBtnBsStyle="danger"
                                                    confirmBtnText={label.common.label11}
                                                    cancelBtnText={label.common.cancel}
                                                    showCancel
                                                    btnSize=""
                                                >
                                                    <i className="ml-2 tim-icons icon-trash-simple"/>
                                                </ReactBSAlert> )

                                            }}>
                                                <i className="ml-2 tim-icons icon-trash-simple"/>
                                            </Button>
                                            {` `}
                                        </td>
                                        <td style={{ width: '1%' }} className="text-left">{item.label}</td>
                                        <td style={{ width: '10%', paddingBottom: 30 }} className="text-left">
                                            <FormGroup check className="form-check-radio">
                                                <Label className="form-check-label">
                                                    <Input
                                                        checked={item.isDefault === true}
                                                        defaultValue="option1"
                                                        id={`exampleRadios${item.value}`}
                                                        name={`exampleRadios${item.value}`}
                                                        type="radio"
                                                        onChange={( ) => handleUpdateItem( item.value, true )}
                                                    />
                                                    <span className="form-check-sign"></span>
                                                </Label>
                                            </FormGroup>
                                        </td>
                                    </tr>
                                </>
                            ) )}
                            </tbody>
                        </Table>
                    </div>
                </Col>
            </Row>
            {deleteAlert}
        </div>
    );
};

export default Vats;
