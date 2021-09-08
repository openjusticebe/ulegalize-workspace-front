import React, { useState } from 'react';
import { Button, Col, FormGroup, Input, Label, Row } from 'reactstrap';
import { IbanElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { createPaymentIntent } from '../../services/PaymentServices';
import { useAuth0 } from '@auth0/auth0-react';
import { updateVirtualcab } from '../../services/generalInfo/LawfirmService';
// Custom styling can be passed as options when creating an Element.
const IBAN_STYLE = {
    base: {
        color: '#32325d',
        fontSize: '16px',
        '::placeholder': {
            color: '#aab7c4'
        },
        ':-webkit-autofill': {
            color: '#32325d',
        },
    },
    invalid: {
        color: '#fa755a',
        iconColor: '#fa755a',
        ':-webkit-autofill': {
            color: '#fa755a',
        },
    }
};

const IBAN_ELEMENT_OPTIONS = {
    supportedCountries: ['SEPA'],
    // Elements can use a placeholder as an example IBAN that reflects
    // the IBAN format of your customer's country. If you know your
    // customer's country, we recommend that you pass it to the Element as the
    // placeholderCountry.
    placeholderCountry: 'BE',
    style: IBAN_STYLE,
};

const PaymentMethodSepa = ( {email, label, vckeySelected, lawfirm, showMessage } ) => {
    const stripe = useStripe();
    const elements = useElements();
    const { getAccessTokenSilently } = useAuth0();

    const [name, setName] = useState( null );
    const [emailField, setEmail] = useState( email );
    const handleSubmit = async ( event ) => {
        // We don't want to let default form submission happen here,
        // which would refresh the page.
        event.preventDefault();

        if ( !stripe || !elements ) {
            // Stripe.js has not yet loaded.
            // Make sure to disable form submission until Stripe.js has loaded.
            return;
        }

        const accessToken = await getAccessTokenSilently();

        // update lawfirm in order to receive within payment module
        updateVirtualcab( accessToken, lawfirm );

        const resultPayment = await createPaymentIntent(accessToken, lawfirm);
        if(resultPayment.error) {
            showMessage(label.payment.error1, 'error')

            return;
        }

        const { error } = await stripe.createPaymentMethod({
            type: "sepa_debit",
            sepa_debit: elements.getElement(IbanElement),
            billing_details: {
                name: name,
                email: emailField
            },
            metadata:{
                "vckey": vckeySelected
            }
        });

        if(error) {
            showMessage(label.payment.error2, 'error')
        } else {
            showMessage(label.payment.success1, 'primary')
        }

    };
    return (
        <>
            <Row>
                <Col md="12">
                    <Label>NAME</Label>
                    <FormGroup>
                        <Input
                            onChange={(e)=>setName(e.target.value)}
                            name="accountholder-name"
                            placeholder="Jenny Rosen" required
                            type="text"
                        />
                    </FormGroup>
                </Col>
            </Row>
            <Row>
                <Col md="12">
                    <Label>Email</Label>
                    <FormGroup>
                        <Input
                            value={emailField}
                            onChange={(e)=>setEmail(e.target.value)}
                            name="accountholder-email"
                            placeholder="jenny.rosen@example.com"
                            required
                            type="text"
                        />
                    </FormGroup>
                </Col>
            </Row>
            <Row>
                <Col md="12">
                    <Label>IBAN
                    </Label>
                    <FormGroup>
                        <IbanElement options={IBAN_ELEMENT_OPTIONS}/>
                    </FormGroup>
                </Col>
            </Row>
            <Row>
                <Col md="12" className="padding-top-25 padding-bottom-25">
                    <Button onClick={handleSubmit}>{label.common.save}</Button>
                </Col>
            </Row>
            {/* Display mandate acceptance text. */}
            <div id="mandate-acceptance">
                By providing your payment information and confirming this payment, you
                authorise (A) and Stripe, our payment service provider, to
                send instructions to your bank to debit your account and (B) your bank to
                debit your account in accordance with those instructions. As part of your
                rights, you are entitled to a refund from your bank under the terms and
                conditions of your agreement with your bank. A refund must be claimed
                within 8 weeks starting from the date on which your account was debited.
                Your rights are explained in a statement that you can obtain from your
                bank. You agree to receive notifications for future debits up to 2 days
                before they occur.
            </div>


        </>
    );
};

export default PaymentMethodSepa;
