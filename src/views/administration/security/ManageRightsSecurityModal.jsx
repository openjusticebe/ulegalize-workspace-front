import React, { useEffect, useState } from 'react';
import {
    Badge,
    Button,
    Col,
    Label,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Row,
} from 'reactstrap';
import { useAuth0 } from '@auth0/auth0-react';
import CircularProgress from '@material-ui/core/CircularProgress';
import ItemDTO from '../../../model/ItemDTO';
import {
    addRightToSecurityGroup,
    deleteRightToSecurityGroup,
    getOutSecurityRightGroupBySecurityGroupId,
    getSecurityRightGroupBySecurityGroupId,
} from '../../../services/AdminService';
import ReactTableLocal from '../../../components/ReactTableLocal';
const map = require( 'lodash/map' );

const ManageRightsSecurityModal = ( {
    securityGroupId,
                                         securityGroupName,
                           modal,
                           toggleIn,
                           label,
                           handleshowAlert
                       } ) => {
    const { getAccessTokenSilently } = useAuth0();
    const [dataIn, setDataIn] = useState( [] );
    const [dataOut, setDataOut] = useState( [] );
    const [loading, setLoading] = useState( false );
    const [updatedList, setUpdatedList] = useState( 0);

    useEffect( () => {
        (async () => {
                const accessToken = await getAccessTokenSilently();

                // get list of members within security group
                const resultIn = await getSecurityRightGroupBySecurityGroupId(accessToken, securityGroupId );

                if ( !resultIn.error ) {
                    setDataIn(map(resultIn.data, data=>{
                        // security group right id
                        return new ItemDTO(data);
                    }))
                }

                // get list of members OUT of security group
                const resultOut = await getOutSecurityRightGroupBySecurityGroupId(accessToken, securityGroupId );

                if ( !resultOut.error ) {
                    setDataOut(map(resultOut.data, data=>{
                        //  right id
                        return new ItemDTO(data);
                    }))
                }
        })();
    }, [getAccessTokenSilently, updatedList] );

    const columnsIn = React.useMemo(
        () => [
            {
                Header: '',
                accessor: 'value',
                Cell: row => {
                    return (
                        <div>
                                <Button
                                    className="btn-icon btn-link"
                                    onClick={() => {
                                        _deleteUser(row.value)
                                    }}
                                    color="primary" size="sm">
                                    <i className="tim-icons icon-trash-simple "/>
                                </Button>
                            {` `}

                        </div>
                    );
                }
            },
            {
                Header: '#',
                accessor: 'id',
                Cell: row => {
                    return (
                        <p>
                            {row.row.original.value}
                        </p>
                    );
                }
            },
            {
                Header: label.manageRight.label2 ,
                accessor: 'label',
            },

        ],
        [label] );

    const columnsOut = React.useMemo(
        () => [
            {
                Header: '#',
                accessor: 'value',
                Cell: row => {
                    return (
                        <div>
                                <Button
                                    className="btn-icon btn-link"
                                    onClick={() => {
                                        _addRight(row.value)
                                    }}
                                    color="primary" size="sm">
                                    <i className="tim-icons icon-simple-add "/>
                                </Button>
                            {` `}

                        </div>
                    );
                }
            },
            {
                Header: label.manageRight.label2 ,
                accessor: 'label',
            },

        ],
        [label] );

    const _addRight = async (rightId) => {
        setLoading(true)
        const accessToken = await getAccessTokenSilently();

        // check if this user email is already in the vc key
        let resultUser = await addRightToSecurityGroup( accessToken, securityGroupId, rightId );

        if(!resultUser.error) {
            handleshowAlert(label.manageRight.success1, 'primary');
        } else {
            handleshowAlert(label.common.error4, 'danger');
        }

        setUpdatedList(rightId);
        setLoading(false)
    };

    const _deleteUser = async (securityGroupRightId) => {
        setLoading(true)
        const accessToken = await getAccessTokenSilently();

        // check if this user email is already in the vc key
        let resultUser = await deleteRightToSecurityGroup( accessToken, securityGroupRightId );

        if(!resultUser.error) {
            handleshowAlert(label.manageRight.success2, 'primary');
        } else {
            handleshowAlert(label.common.error3, 'danger');
        }

        setUpdatedList(securityGroupRightId);
        setLoading(false)
    };

    return (
        <>
            <Modal size="lg" isOpen={modal} toggle={toggleIn}>
                <ModalHeader toggle={toggleIn}>
                    <h4>{label.manageRight.label4}</h4>
                    <Badge bsStyle="primary">{securityGroupName}</Badge>
                </ModalHeader>
                <ModalBody>
                    <Row>
                        <Col md="7">
                            <Label>
                            </Label>
                            <ReactTableLocal columns={columnsIn} data={dataIn}/>
                        </Col>
                        <Col md="5" className="height500">
                            <Label>
                                {label.manageRight.label3}
                            </Label>
                            <ReactTableLocal columns={columnsOut} data={dataOut}/>

                        </Col>
                    </Row>
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={() => toggleIn()}>
                        {label.common.cancel}
                    </Button>
                    {loading && <CircularProgress color="primary" size={35}/>}
                </ModalFooter>
            </Modal>
        </>
    );
};

export default ManageRightsSecurityModal;
