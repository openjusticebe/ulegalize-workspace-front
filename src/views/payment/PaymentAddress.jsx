import React, { useEffect, useState } from 'react';
// reactstrap components
import { Button, Card, CardBody, CardFooter, Col, FormGroup, FormText, Input, Label, Row, Spinner, } from 'reactstrap';
// nodejs library that concatenates classes
import { useAuth0 } from '@auth0/auth0-react';
import { getAlpha2CountryList } from '../../services/SearchService';
import ItemDTO from '../../model/ItemDTO';
import ReactLoading from 'react-loading';
import Select from 'react-select';
import { getInvoiceAddress } from '../../services/PaymentLawfirmServices';
import LawfirmDTO from '../../model/admin/generalInfo/LawfirmDTO';

const map = require( 'lodash/map' );
const isNil = require( 'lodash/isNil' );

export default function PaymentAddress( {
                                            label,
                                            isPopup, togglePopupLawfirmEmail,
                                            paymentLoading,
                                            handleUpdateLawfirmAddress,
                                            checkResult
                                        } ) {
    const [lawfirmInvoice, setLawfirmInvoice] = useState( new LawfirmDTO() );
    const { getAccessTokenSilently } = useAuth0();
    const [countrySelect, setCountrySelect] = useState( [] );

    useEffect( () => {
        (async () => {
            const accessToken = await getAccessTokenSilently();
            let lawFirmTmp = new LawfirmDTO();

            // if is not validated , get invoice address from virtual cab
            const resultLawfirm = await getInvoiceAddress( accessToken );

            if ( !resultLawfirm.error && !isNil( resultLawfirm.data ) ) {
                lawFirmTmp = resultLawfirm.data;
            }
            let resultCountry = await getAlpha2CountryList( accessToken );
            let countr = map( resultCountry.data, data => {

                //hardcoded must be fill in related to the countryCode cab
                if ( lawFirmTmp.countryCode === data.value ) {
                    lawFirmTmp.countryItem = new ItemDTO( data );
                }
                return new ItemDTO( data );
            } );

            setLawfirmInvoice( lawFirmTmp );

            setCountrySelect( countr );
        })();
    }, [getAccessTokenSilently] );

    return (
        <>
            <div className="content">
                <Row>
                    <Col lg="12" sm={12}>
                        <Card>
                            <CardBody>
                                {isNil( lawfirmInvoice ) ? (
                                    <ReactLoading className="loading" height={'20%'} width={'20%'}/>

                                ) : (
                                    <>
                                        {/* email */}
                                        <Row>
                                            <Col md={6} lg={6}>
                                                <FormGroup>
                                                    <Label>{label.generalInfo.email}</Label>
                                                    <Input
                                                        maxLength={50}
                                                        value={lawfirmInvoice.email}
                                                        type="email"
                                                        onChange={( e ) => setLawfirmInvoice( {
                                                            ...lawfirmInvoice,
                                                            email: e.target.value
                                                        } )}
                                                        placeholder={label.generalInfo.email}
                                                    />
                                                </FormGroup>

                                            </Col>
                                        </Row>
                                        {/* address */}
                                        <Row>

                                            <Col md="6" sm={6}>
                                                <FormGroup>
                                                    <Label>{label.generalInfo.address}</Label>
                                                    <Input placeholder={label.generalInfo.address} type="text"
                                                           maxLength={60}
                                                           value={lawfirmInvoice.street}
                                                           onChange={e => setLawfirmInvoice( {
                                                               ...lawfirmInvoice,
                                                               street: e.target.value
                                                           } )}
                                                    />
                                                </FormGroup>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col md="6" sm={6}>
                                                <FormGroup>
                                                    <Label>{label.generalInfo.city}</Label>
                                                    <Input maxLength={60}
                                                           placeholder={label.generalInfo.city} type="text"
                                                           value={lawfirmInvoice.city}
                                                           onChange={e => setLawfirmInvoice( {
                                                               ...lawfirmInvoice,
                                                               city: e.target.value
                                                           } )}
                                                    />
                                                </FormGroup>
                                            </Col>
                                            <Col md="4" sm={6}>
                                                <FormGroup>
                                                    <Label>{label.generalInfo.postalCode}</Label>
                                                    <Input placeholder={label.generalInfo.postalCode}
                                                           maxLength={20}
                                                           type="text"
                                                           value={lawfirmInvoice.postalCode}
                                                           onChange={e => setLawfirmInvoice( {
                                                               ...lawfirmInvoice,
                                                               postalCode: e.target.value
                                                           } )}
                                                    />
                                                </FormGroup>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col md="6" sm={6}>
                                                <FormGroup>
                                                    <Label>{label.generalInfo.numEntreprise}</Label>
                                                    <Input placeholder={label.generalInfo.numEntreprise}
                                                           type="text"
                                                           maxLength={30}
                                                           value={lawfirmInvoice.numentreprise}
                                                           onChange={e => setLawfirmInvoice( {
                                                               ...lawfirmInvoice,
                                                               numentreprise: e.target.value
                                                           } )}
                                                    />
                                                    <FormText>{label.payment.format}: BE1234567890</FormText>
                                                </FormGroup>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col md="6" sm={6}>
                                                <FormGroup>
                                                    <Label>{label.generalInfo.country}</Label>
                                                    <Select
                                                        value={lawfirmInvoice.countryItem}
                                                        className="react-select info"
                                                        classNamePrefix="react-select"
                                                        name="singleSelect"
                                                        onChange={value => setLawfirmInvoice( {
                                                            ...lawfirmInvoice,
                                                            countryItem: value,
                                                            countryCode: value.value,
                                                        } )}
                                                        options={countrySelect}
                                                    />
                                                </FormGroup>
                                            </Col>
                                        </Row>
                                    </>
                                )
                                }

                            </CardBody>
                            <CardFooter>
                                {isPopup ? (
                                    <Button color="secondary" onClick={togglePopupLawfirmEmail}>
                                        {label.common.close}
                                    </Button>
                                ) : null}

                                <Button
                                    color="primary"
                                    disabled={paymentLoading}
                                    onClick={() => handleUpdateLawfirmAddress( lawfirmInvoice )}>
                                    {paymentLoading ? (
                                        <Spinner
                                            size="sm"
                                            color="secondary"
                                        />
                                    ) : null}
                                    {' '}{label.common.save}
                                </Button>
                            </CardFooter>
                        </Card>
                    </Col>
                </Row>
            </div>
        </>
    );
}

