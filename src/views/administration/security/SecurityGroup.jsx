import React, { useEffect, useRef, useState } from 'react';
import { Button, Col, Row, Table } from 'reactstrap';
import { useAuth0 } from '@auth0/auth0-react';
import { deleteSecurityGroup, getSecurityGroup } from '../../../services/AdminService';
import NotificationAlert from 'react-notification-alert';
import { getOptionNotification } from '../../../utils/AlertUtils';
import ReactBSAlert from 'react-bootstrap-sweetalert';
import SecurityGroupDTO from '../../../model/admin/user/SecurityGroupDTO';
import AddSecurityModal from './AddSecurityModal';
import ManageMembersSecurityModal from './ManageMembersSecurityModal';
import ManageRightsSecurityModal from './ManageRightsSecurityModal';

const map = require( 'lodash/map' );

const SecurityGroup = ( props ) => {
    const { label } = props.parentProps;
    const notificationAlert = useRef( null );
    const securityGroupIdSelected = useRef( null );
    const securityGroupName = useRef( null );
    const appGroupSelected = useRef( null );

    const { getAccessTokenSilently } = useAuth0();
    const [userData, setUserData] = useState( [] );
    const [addModal, setAddModal] = useState( false );
    const [addModalMember, setAddModalMember] = useState( false );
    const [addModalRight, setAddModalRight] = useState( false );
    const [updatedList, setUpdatedList] = useState( false );
    const [deleteAlert, setDeleteAlert] = useState( null );

    const delSecurityGroup = async ( securityGroupId , nbUsers ) => {
        const accessToken = await getAccessTokenSilently();

        if(nbUsers > 0) {
            handleshowAlert( label.securityGroup.error4, 'danger' );
            return;
        }

        const result = await deleteSecurityGroup( accessToken, securityGroupId );

        if ( !result.error ) {
            setDeleteAlert( null );
            handleshowAlert( label.securityGroup.success2, 'danger' );
            setUpdatedList( !updatedList );

        } else {
            setDeleteAlert( null );
            handleshowAlert( label.common.error3, 'danger' );
        }
    };
    const handleshowAlert = ( message, type ) => {
        notificationAlert.current.notificationAlert(
            getOptionNotification( message, type )
        );
    };

    const toggleAddModal = async () => {
        setAddModal( !addModal );
        setUpdatedList( !updatedList );
    };
    const _openMembers = async ( securityGroupId, securityGroupDescription, appGroup ) => {
        securityGroupIdSelected.current = securityGroupId;
        securityGroupName.current = securityGroupDescription;
        appGroupSelected.current = appGroup;
        setAddModalMember( !addModalMember );
        setUpdatedList( !updatedList );
    };
    const _openRight = async (securityGroupId, securityGroupDescription, appGroup) => {
        securityGroupIdSelected.current = securityGroupId;
        securityGroupName.current = securityGroupDescription;
        appGroupSelected.current = appGroup;
        setAddModalRight( !addModalRight );
        setUpdatedList( !updatedList );
    };

    useEffect( () => {
        (async () => {
            const accessToken = await getAccessTokenSilently();
            let resultUser = await getSecurityGroup( accessToken );

            let arrUsers = map( resultUser.data, ( data ) => {
                return new SecurityGroupDTO( data );
            } );
            if ( arrUsers.length > 0 ) {
                setUserData( arrUsers );
            }
        })();
    }, [getAccessTokenSilently, !updatedList] );

    return (
        <>
            <div className="rna-container">
                <NotificationAlert ref={notificationAlert}/>
            </div>
            {deleteAlert}
            <div className=" clearfix" style={{ marginBottom: 20 }}>
                <Button color="danger"
                        onClick={toggleAddModal}
                        type="button" className="float-left">
                    {label.securityGroup.label1}
                </Button>
            </div>
            <Row className="mt-3">
                <Col md={12} lg={12}>
                    <div
                        style={{
                            maxHeight: '400px',
                            overflowY: 'auto',
                        }}
                    >
                        <Table responsive>
                            <thead>
                            <tr>
                                <th>#</th>
                                <th>{label.securityGroup.label6}</th>
                                <th>{label.securityGroup.label4}</th>
                                <th></th>
                                <th></th>
                            </tr>
                            </thead>
                            <tbody>
                            {userData.map( ( item, index ) => (
                                <>
                                    <tr key={index}>
                                        <td width={50}>
                                            {' '}
                                            {item.appGroup !== 'ADMIN' && item.appGroup !== 'USER' ? (
                                                <Button
                                                    className="btn-icon btn-link"
                                                    onClick={() => {
                                                        setDeleteAlert( <ReactBSAlert
                                                            warning
                                                            style={{ display: 'block', marginTop: '100px' }}
                                                            title={label.common.label10}
                                                            onConfirm={() => {
                                                                delSecurityGroup( item.id, item.nbUsers );
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
                                                            {label.common.label12}
                                                        </ReactBSAlert> );

                                                    }}
                                                    color="primary" size="sm">
                                                    <i className="tim-icons icon-trash-simple "/>
                                                </Button>
                                            ) : null}

                                            {' '}
                                        </td>
                                        <td>{item.description}</td>
                                        <td>{item.nbUsers}</td>
                                        <td width={210}>
                                            <Button className="btn-link" onClick={() => _openMembers( item.id, item.description, item.appGroup )}>
                                                <p className="text-info">{label.securityGroup.label2}</p>

                                            </Button>
                                        </td>
                                        <td>
                                            {' '}
                                            <Button className="btn-link" onClick={() => _openRight(item.id, item.description, item.appGroup)}>
                                                <p className="text-info">{label.securityGroup.label3}</p>
                                            </Button>
                                        </td>
                                    </tr>
                                </>
                            ) )}
                            </tbody>
                        </Table>
                    </div>
                </Col>
            </Row>

            {addModal ? (
                <AddSecurityModal
                    label={label}
                    handleshowAlert={handleshowAlert}
                    modal={addModal}
                    toggleIn={toggleAddModal}
                />
            ) : null}

            {addModalMember ? (
                <ManageMembersSecurityModal
                    label={label}
                    handleshowAlert={handleshowAlert}
                    modal={addModalMember}
                    securityGroupId={securityGroupIdSelected.current}
                    securityGroupName={securityGroupName.current}
                    appGroup={appGroupSelected.current}
                    toggleIn={_openMembers}
                />
            ) : null}

            {addModalRight ? (
                <ManageRightsSecurityModal
                    label={label}
                    handleshowAlert={handleshowAlert}
                    modal={addModalRight}
                    securityGroupId={securityGroupIdSelected.current}
                    securityGroupName={securityGroupName.current}
                    appGroup={appGroupSelected.current}
                    toggleIn={_openRight}
                />
            ) : null}

        </>
    );
};

export default SecurityGroup;
