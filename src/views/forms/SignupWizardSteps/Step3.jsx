import React, { forwardRef, useEffect, useRef, useState } from 'react';
// reactstrap components
import { Button, Col, Form, FormGroup, Input, Label, Row, Table } from 'reactstrap';
import CircularProgress from '@material-ui/core/CircularProgress';
import NotificationAlert from 'react-notification-alert';
import { getOptionNotification } from '../../../utils/AlertUtils';
import ItemDTO from '../../../model/ItemDTO';
import { getDefaultVats } from '../../../services/SearchService';
import { useAuth0 } from '@auth0/auth0-react';

const size = require( 'lodash/size' );
const map = require( 'lodash/map' );
const forEach = require( 'lodash/forEach' );
const Step3 = forwardRef( ( { label, countryCodeProps }, ref ) => {
    const { getAccessTokenSilently } = useAuth0();

    const notificationAlert = useRef( null );
    const [itemName, setItemName] = useState( '' );
    const [loading, setLoading] = useState( false );
    const [data, setData] = useState( [] );
    const itemSelected = useRef( null );

    useEffect( () => {
        (async () => {
            const accessToken = await getAccessTokenSilently();

            let resultVat = await getDefaultVats( accessToken, countryCodeProps );
            let vats = map( resultVat.data, data => {
                return new ItemDTO( data );
            } );

            setData( vats );
        })();
    }, [getAccessTokenSilently, countryCodeProps] );

    const isValidated = () => {
        let result = false;
        // if the size is equals to 0
        if ( size( data ) === 0 ) {
            handleshowAlert(label.error5, 'danger')
            return result;
        }
        forEach( data, vat => {
            if ( vat.isDefault === true ) {
                result = true;
                return result;
            }
        } );
        // show at least one default
        if(result === false) {
            handleshowAlert(label.error4, 'danger')
        }
        return result;
    };
    React.useImperativeHandle( ref, () => ({
        isValidated: () => {
            return isValidated();
        },
        state: {
            data,
        },
    }) );
    const handleAddItem = async () => {
        setLoading( true );
        if ( itemName.trim() !== '' ) {

            // check already exist

            // by default if it's the first vat added
            setData( [...data, new ItemDTO( {
                value: itemName,
                label: itemName,
                isDefault: size( data ) === 0
            } )] );

            setItemName( '' );
            handleshowAlert( label.label100, 'success' );
            setLoading( false );
        } else {
            setLoading( false );
            handleshowAlert( label.label4, 'danger' );
        }
    };

    const handleDeleteItem = async ( item, e ) => {
        // if the size is equals to 1 , can't be removed
        if ( size( data ) === 1 ) {
            handleshowAlert( label.error3, 'danger' );
            return;
        }
        setData( ( data ) => data.filter( ( obj ) => obj.value !== item.value ) );
        handleshowAlert( label.label9, 'info' );
        itemSelected.current = null;
    };
    const handleUpdateItem = async ( itemValue, newDefault ) => {
        setLoading( true );
        let vatData = data;
        let index = vatData.findIndex( object => object.value === itemValue );
        if ( index !== -1 ) {
            let vatObject = vatData[ index ];
            forEach( vatData, vat => {
                vat.isDefault = false;
            } );
            vatObject.isDefault = newDefault;
            vatData[ index ] = vatObject;
            setData( [...vatData] );
            handleshowAlert( label.label17, 'info' );
        }

        setLoading( false );
    };
    const handleshowAlert = ( message, type ) => {
        notificationAlert.current.notificationAlert(
            getOptionNotification( message, type )
        );
    };
    return (
        <>
            <h5 className="info-text">
                {label.label2}

            </h5>
            <div className="content">
                <div className="rna-container">
                    <NotificationAlert ref={notificationAlert}/>
                </div>
                <Form className="form-horizontal" method="get">
                    <Row style={{ marginLeft: 10 }}>
                        <FormGroup>
                            <Input
                                placeholder={label.label1}
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
                                {label.label2}
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
                                    <th>{label.label15}</th>
                                    <th>{label.label16}</th>
                                </tr>
                                </thead>
                                <tbody>
                                {data.map( ( item, index ) => (
                                    <>
                                        <tr key={index}>
                                            <td style={{ width: '0.5%' }}>
                                                <Button className="btn-icon btn-link" color="primary" size="sm"
                                                        onClick={() => {
                                                            itemSelected.current = item;
                                                            handleDeleteItem( itemSelected.current );
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
                                                            onChange={() => handleUpdateItem( item.value, true )}
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
            </div>
        </>
    );
} );
export default Step3;