import React, { useRef, useState } from 'react';
import {
    Button,
    Card,
    CardBody,
    Col,
    FormGroup,
    Input,
    Label,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Row
} from 'reactstrap';
import NotificationAlert from 'react-notification-alert';
import PriceGenerator from './PriceGenerator';
import { getOptionNotification } from '../../utils/AlertUtils';

const PaymentTab = ( { label } ) => {
    const notificationAlert = useRef( null );
    const [data, setData] = useState( [] );
    const [isDisabled, setIsDisabled] = useState( true );
    const [showPrice, setShowPrice] = useState( false );


    const _disabledClick = () =>{
        setIsDisabled(!isDisabled)
    }

    const _showPrice = () => {
        setShowPrice( !showPrice );
    };
    const _saveActivation = () => {
        setShowPrice( !showPrice );
    };

    const _showMessage = ( message, type ) => {
        if ( message && type ) {
            notificationAlert.current.notificationAlert( getOptionNotification( message, type ) );
        }
    };
    return (
        <div className="content">
            <div className="rna-container">
                <NotificationAlert ref={notificationAlert}/>
            </div>

            <Row className="mt-3">
                <Col md={12} lg={12}>
                    <div
                        style={{
                            maxHeight: '350px',
                            overflowY: 'auto',
                        }}
                    >
                        <Col md="12">
                            <FormGroup>
                                {!isDisabled ? (
                                    <Button color="primary" onClick={_disabledClick}>
                                        {label.common.close}
                                    </Button>
                                ): (
                                    <Button color="primary" onClick={_disabledClick}
                                    >{label.common.update}</Button>
                                )}

                            </FormGroup>
                        </Col>
                        <Card className={isDisabled ? 'card-payment' : ''}>
                            <CardBody>
                                <FormGroup check>
                                    <Label check>
                                        <Input
                                            defaultChecked={data.active}
                                            type="checkbox"
                                            disabled={isDisabled}
                                            onChange={( e ) => {
                                                setData( {
                                                    ...data,
                                                    active: e.target.checked
                                                } );
                                            }}
                                        />{' '}
                                        <span className={`form-check-sign`}>
                                    <span
                                        className="check"> {label.payment.label1}</span>
                                </span>
                                    </Label>
                                </FormGroup>
                            </CardBody>
                        </Card>
                        <Col>
                            <Button color="info" type="button" onClick={_showPrice}>
                                {label.invoice.label106}
                            </Button>
                            {!isDisabled ? (
                                <Button color="primary" onClick={_saveActivation}>
                                    {label.common.save}
                                </Button>
                            ): null}
                        </Col>
                    </div>
                </Col>
            </Row>
            <Modal size="lg" style={{ width: 'fit-content' }} isOpen={showPrice} toggle={_showPrice}>
                <ModalHeader>
                    <button type="button" className="close" data-dismiss="modal" aria-label="Close"
                            onClick={showPrice}>
                        <i className="tim-icons icon-simple-remove"></i>
                    </button>
                    <h4 className="modal-title">{label.invoice.label106}</h4>
                </ModalHeader>
                <ModalBody>
                    <PriceGenerator
                        label={label}
                        showMessage={_showMessage}/>
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={_showPrice}>
                        {label.common.close}
                    </Button>
                </ModalFooter>
            </Modal>


        </div>
    );
};

export default PaymentTab;
