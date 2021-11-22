import React, { forwardRef, useEffect, useRef, useState } from 'react';
// reactstrap components
import { Col, Form, FormGroup, Input, Label, Row } from 'reactstrap';
import NotificationAlert from 'react-notification-alert';
import { getOptionNotification } from '../../../utils/AlertUtils';
import ItemDTO from '../../../model/ItemDTO';
import { getAlpha2CountryList, getCurrencies } from '../../../services/SearchService';
import { useAuth0 } from '@auth0/auth0-react';
import Select from 'react-select';
import LawfirmDTO from '../../../model/admin/generalInfo/LawfirmDTO';
import { getVirtualcabById } from '../../../services/generalInfo/LawfirmService';
import { validateEmail } from '../../../utils/Utils';

const map = require( 'lodash/map' );
const isNil = require( 'lodash/isNil' );
const Step2 = forwardRef( ( { label, originalVcKey, vckeySelected, countryCodeProps, email, changeCountry }, ref ) => {
    const { getAccessTokenSilently } = useAuth0();

    const notificationAlert = useRef( null );
    const [countrySelect, setCountrySelect] = useState( [] );
    const [virtualCab, setVirtualCab] = useState( { ...new LawfirmDTO(), email: email } );
    const [currencyList, setCurrencyList] = useState( [] );

    useEffect( () => {
        (async () => {
            if ( !isNil( originalVcKey ) ) {
                const accessToken = await getAccessTokenSilently( { ignoreCache: true } );
                let virtualCabtResult = await getVirtualcabById( accessToken, originalVcKey );
                let virtualCabData = virtualCab;
                if ( !virtualCabtResult.error ) {
                    virtualCabData = new LawfirmDTO( virtualCabtResult.data, label );
                }
                const resultCurrency = await getCurrencies( accessToken );

                if ( !resultCurrency.error ) {
                    const curr = map( resultCurrency.data, data => {
                        if ( virtualCabData.currency === data.value ) {
                            virtualCabData.currencyItem = data;
                        }
                        return new ItemDTO( data );
                    } );
                    setCurrencyList( curr );
                }
                let resultCountry = await getAlpha2CountryList( accessToken );

                let countr = map( resultCountry.data, data => {
                    if ( virtualCabData.countryCode === data.value ) {
                        virtualCabData.countryItem = new ItemDTO( data );
                    }
                    return new ItemDTO( data );
                } );
                setCountrySelect( countr );
                virtualCabData.vckey = vckeySelected;
                virtualCabData.name = vckeySelected;
                //virtualCabData.email = email;
                setVirtualCab( virtualCabData );
            }
        })();
    }, [getAccessTokenSilently, originalVcKey] );
    useEffect( () => {
        (async () => {
            let virtualCabData = virtualCab;
            virtualCabData.vckey = vckeySelected;
            virtualCabData.name = vckeySelected;
            setVirtualCab( virtualCabData );
        })();
    }, [vckeySelected] );

    const isValidated = () => {
        let result = false;
        // do some validations
        // decide if you will
        if ( !isNil( virtualCab.countryCode ) && virtualCab.countryCode !== '' ) {
            result = true;
        } else {
            handleshowAlert( label.generalInfo.error1, 'danger' );
            return false;
        }

        if ( virtualCab.email && !validateEmail( virtualCab.email ) ) {
            handleshowAlert( label.affaire.error18, 'danger' );
            return false;
        }
        if ( isNil( virtualCab.currencyItem ) ) {
            handleshowAlert( label.generalInfo.error2, 'danger' );
            return false;
        }

        return result;
        // or you will
        // return false;
    };
    React.useImperativeHandle( ref, () => ({
        isValidated: () => {
            return isValidated();
        },
        state: {
            virtualCab,
        },
    }) );

    const handleshowAlert = ( message, type ) => {
        notificationAlert.current.notificationAlert(
            getOptionNotification( message, type )
        );
    };
    return (
        <>
            <h5 className="info-text">
                {label.wizardSignup.label6}

            </h5>
            <div className="content">
                <div className="rna-container">
                    <NotificationAlert ref={notificationAlert}/>
                </div>
                <Form className="form-horizontal">
                    <Row>

                        <Col md="3" sm={2}>
                            <FormGroup>
                                <Label>{label.generalInfo.abbreviation}</Label>
                                <Input
                                    maxLength={9}
                                    value={virtualCab.abbreviation}
                                    placeholder={label.generalInfo.abbreviation}
                                    onChange={e => setVirtualCab( {
                                        ...virtualCab,
                                        abbreviation: e.target.value
                                    } )}
                                    type="text"/>
                            </FormGroup>
                        </Col>

                        <Col md="4" sm={4}>
                            <FormGroup>
                                <Label>{label.generalInfo.socialObject}</Label>
                                <Input
                                    maxLength={40}
                                    value={virtualCab.objetsocial}
                                    onChange={e => setVirtualCab( {
                                        ...virtualCab,
                                        objetsocial: e.target.value
                                    } )}
                                    placeholder={label.generalInfo.socialObject}
                                    type="text"/>
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col md="3" sm={3}>
                            <FormGroup>
                                <Label>{label.generalInfo.numEntreprise}</Label>
                                <Input
                                    maxLength={30}
                                    value={virtualCab.numentreprise}
                                    onChange={e => setVirtualCab( {
                                        ...virtualCab,
                                        numentreprise: e.target.value
                                    } )}
                                    placeholder={label.generalInfo.numEntreprise}
                                    type="text"/>
                            </FormGroup>
                        </Col>

                        <Col md="5" sm={5}>
                            <FormGroup>
                                <Label>{label.generalInfo.email} *</Label>
                                <Input
                                    maxLength={50}
                                    value={virtualCab.email}
                                    type="email"
                                    onChange={e => setVirtualCab( {
                                        ...virtualCab,
                                        email: e.target.value
                                    } )}
                                    placeholder={label.generalInfo.email}
                                />
                            </FormGroup>
                        </Col>
                        <Col md="3" sm={4}>
                            <FormGroup>
                                <Label>{label.generalInfo.currency} *</Label>
                                <Select placeholder={label.generalInfo.currency}
                                        type="text"
                                        value={virtualCab.currencyItem}
                                        options={currencyList}
                                        onChange={value => setVirtualCab( {
                                            ...virtualCab,
                                            currency: value.value,
                                            currencyItem: value
                                        } )}/>
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col md="4" sm={4}>
                            <FormGroup>
                                <Label>{label.generalInfo.country} *</Label>
                                <Select
                                    value={virtualCab.countryItem}
                                    className="react-select info"
                                    classNamePrefix="react-select"
                                    name="singleSelect"
                                    onChange={value => {
                                        setVirtualCab( {
                                            ...virtualCab,
                                            countryItem: value,
                                            countryCode: value.value,
                                        } );
                                        changeCountry( value.value );
                                    }}
                                    options={countrySelect}
                                />
                            </FormGroup>
                        </Col>
                    </Row>
                </Form>

            </div>
        </>
    );
} );
export default Step2;