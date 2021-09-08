import React, { useState } from 'react';
import { Button, Col, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Row } from 'reactstrap';
import { useAuth0 } from '@auth0/auth0-react';
import CircularProgress from '@material-ui/core/CircularProgress';
import {
    existSecurityGroup,
    saveSecurityGroupToVcKey,
} from '../../../services/AdminService';

const isNil = require( 'lodash/isNil' );

const AddSecurityModal = ( {
                           modal,
                           toggleIn,
                           label,
                           handleshowAlert
                       } ) => {
    const { getAccessTokenSilently } = useAuth0();
    const [data, setData] = useState( '' );
    const [loading, setLoading] = useState( false );


    const handleSave = async () => {
        setLoading(true);
        if(isNil(data)) {
            handleshowAlert(label.securityGroup.error2, 'danger');
            setLoading(false);
            return;
        }
        const accessToken = await getAccessTokenSilently();

        // check if this user email is already in the vc key
        let resultUser = await existSecurityGroup( accessToken, data );

        if(resultUser.data === true) {
            handleshowAlert(label.securityGroup.error3, 'danger');
            setLoading(false);
            return;
        }

        let result = await saveSecurityGroupToVcKey( accessToken, data );
        // save as lawyer to transparency

        if(!result.error) {
            handleshowAlert(label.securityGroup.success1, 'primary');
            toggleIn();
        } else {
            handleshowAlert(label.securityGroup.error1, 'danger');
        }
        setLoading(false);
    };

    return (
        <>
            <Modal size="md" isOpen={modal} toggle={toggleIn}>
                <ModalHeader toggle={toggleIn}>
                    <h4>{label.securityGroup.label1}</h4>
                </ModalHeader>
                <ModalBody>
                    <Row>
                        <Col md="12">
                            <FormGroup>
                                <Label>{label.securityGroup.label9}</Label>
                                <Input
                                    value={data}
                                    onChange={e => setData( e.target.value )}
                                    type="text"
                                />
                            </FormGroup>
                        </Col>
                    </Row>
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={() => toggleIn()}>
                        {label.common.cancel}
                    </Button>
                    {loading && <CircularProgress color="primary" size={35}/>}
                    <Button color="primary" onClick={handleSave} disable={loading}>
                        {label.common.save}
                    </Button>
                </ModalFooter>
            </Modal>
        </>
    );
};

export default AddSecurityModal;
