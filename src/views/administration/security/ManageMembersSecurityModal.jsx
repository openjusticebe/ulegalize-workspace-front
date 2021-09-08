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
import LawyerDTO from '../../../model/admin/user/LawyerDTO';
import CircularProgress from '@material-ui/core/CircularProgress';
import {
    addUserToSecurityGroup, deleteUserToSecurityGroup,
    getOutSecurityUserGroupBySecurityGroupId,
    getSecurityUserGroupBySecurityGroupId,
} from '../../../services/AdminService';
import SecurityGroupUserDTO from '../../../model/admin/user/SecurityGroupUserDTO';
import ReactTableLocal from '../../../components/ReactTableLocal';

const size = require( 'lodash/size' );
const map = require( 'lodash/map' );

const ManageMembersSecurityModal = ( {
    securityGroupId,
                                         securityGroupName,
                                         appGroup,
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
                const resultIn = await getSecurityUserGroupBySecurityGroupId(accessToken, securityGroupId );

                if ( !resultIn.error ) {
                    setDataIn(map(resultIn.data, data=>{
                        return new SecurityGroupUserDTO(data);
                    }))
                }

                // get list of members OUT of security group
                const resultOut = await getOutSecurityUserGroupBySecurityGroupId(accessToken, securityGroupId );

                if ( !resultOut.error ) {
                    setDataOut(map(resultOut.data, data=>{
                        return new LawyerDTO(data);
                    }))
                }
        })();
    }, [getAccessTokenSilently, updatedList] );

    const columnsIn = React.useMemo(
        () => [
            {
                Header: '#',
                accessor: 'id',
                Cell: row => {
                    return (
                        <div>
                            {appGroup === 'ADMIN' && size(dataIn) === 1 ? null : (
                                <Button
                                    className="btn-icon btn-link"
                                    onClick={() => {
                                        _deleteUser(row.value)
                                    }}
                                    color="primary" size="sm">
                                    <i className="tim-icons icon-trash-simple "/>
                                </Button>
                            ) }

                            {` `}

                        </div>
                    );
                }
            },
            {
                Header: label.manageMember.label1 ,
                accessor: 'fullName',
            },
            {
                Header: label.manageMember.label2 ,
                accessor: 'email',
            },

        ],
        [label, dataIn] );

    const columnsOut = React.useMemo(
        () => [
            {
                Header: '#',
                accessor: 'id',
                Cell: row => {
                    return (
                        <div>
                                <Button
                                    className="btn-icon btn-link"
                                    onClick={() => {
                                        _addUser(row.value)
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
                Header: label.manageMember.label2 ,
                accessor: 'email',
            },

        ],
        [label] );

    const _addUser = async (userId) => {
        setLoading(true)
        const accessToken = await getAccessTokenSilently();

        // check if this user email is already in the vc key
        let resultUser = await addUserToSecurityGroup( accessToken, securityGroupId, userId );

        if(!resultUser.error) {
            handleshowAlert(label.manageMember.success1, 'primary');
        } else {
            handleshowAlert(label.common.error4, 'danger');
        }

        setUpdatedList(userId);
        setLoading(false)
    };

    const _deleteUser = async (securityGroupUserId) => {
        setLoading(true)
        const accessToken = await getAccessTokenSilently();

        // check if this user email is already in the vc key
        let resultUser = await deleteUserToSecurityGroup( accessToken, securityGroupUserId );

        if(!resultUser.error) {
            handleshowAlert(label.manageMember.success2, 'primary');
        } else {
            handleshowAlert(label.common.error3, 'danger');
        }

        setUpdatedList(securityGroupUserId);
        setLoading(false)
    };

    return (
        <>
            <Modal size="lg" isOpen={modal} toggle={toggleIn}>
                <ModalHeader toggle={toggleIn}>
                    <h4>{label.manageMember.label4}</h4>
                    <Badge bsStyle="primary">{securityGroupName}</Badge>
                </ModalHeader>
                <ModalBody>
                    <Row>
                        <Col md="7">
                            <Label>
                            </Label>
                            <ReactTableLocal columns={columnsIn} data={dataIn}/>
                        </Col>
                        <Col md="5">
                            <Label>
                                {label.manageMember.label3}
                            </Label>
                            <ReactTableLocal columns={columnsOut} data={dataOut}/>

                        </Col>
                    </Row>
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={() => toggleIn()}>
                        {label.common.close}
                    </Button>
                    {loading && <CircularProgress color="primary" size={35}/>}
                </ModalFooter>
            </Modal>
        </>
    );
};

export default ManageMembersSecurityModal;
