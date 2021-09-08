import React, { useEffect, useRef, useState } from 'react';
import { Button, Col, Row, Table } from 'reactstrap';
import Select from 'react-select';
import { useAuth0 } from '@auth0/auth0-react';
import LawyerDTO from '../../../model/admin/user/LawyerDTO';
import placeholder from '../../../assets/img/placeholder.jpg';
import {
    deleteSecurityUserGroup,
    getFullUserResponsableList,
} from '../../../services/AdminService';
import AddUserModal from './AddUserModal';
import NotificationAlert from 'react-notification-alert';
import { getOptionNotification } from '../../../utils/AlertUtils';
import ReactBSAlert from 'react-bootstrap-sweetalert';
import ItemDTO from '../../../model/ItemDTO';
import UpdateUserModal from './UpdateUserModal';

const map = require( 'lodash/map' );
const size = require( 'lodash/size' );

const Users = ( props ) => {
    const { label } = props.parentProps;
    const notificationAlert = useRef(null);
    const itemSelected = useRef(false);

    const options = [
        {
            value: '1',
            label: label.users.label7,
        },
        {
            value: '2',
            label: label.users.label8,
        },
    ];
    const selectedOption = useRef( new ItemDTO({value: '0', label: label.users.label15}) );
    const style = { width: '40px', borderRadius: '50px' };
    const { getAccessTokenSilently } = useAuth0();
    const [userData, setUserData] = useState( [] );
    const [addModal, setAddModal] = useState( false );
    const [updateModal, setUpdateModal] = useState( false );
    const [updatedList, setUpdatedList] = useState( false );
    const [hideInactiveUsers, setHideInactiveUsers] = useState( false );
    const [deleteAlert, setDeleteAlert] = useState( null );


    const onChangeOptionSelection = async ( value, item ) => {
       // deklete
        if ( value.value === '2' ) {
            setDeleteAlert( <ReactBSAlert
                warning
                style={{ display: 'block', marginTop: '100px' }}
                title={label.common.label10}
                onConfirm={() => {
                    delSecurityGroup( item.id );
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
        } else {
            // update
            toggleUpdateModal(item);

        }
    };


    const delSecurityGroup = async (userId) => {
        const accessToken = await getAccessTokenSilently();

        if(size(userData) === 1) {
            handleshowAlert(label.securityGroup.error5, 'danger');

            return;
        }

        const result = await deleteSecurityUserGroup( accessToken, userId);
        if(!result.error) {
            setDeleteAlert( null );
            setUpdatedList(!updatedList);
        } else {
            setDeleteAlert( null );
            handleshowAlert(label.common.error3, 'danger');
        }
    };
    const handleshowAlert = (message, type) => {
        notificationAlert.current.notificationAlert(
            getOptionNotification(message, type)
        );
    };

    const toggleUpdateModal = async (item) => {
        itemSelected.current = item;
        setUpdateModal( !updateModal );
        setUpdatedList(!updatedList);
    };
    const toggleAddModal = async () => {
        setAddModal( !addModal );
        setUpdatedList(!updatedList);
    };
    const handleViewValid = async () => {
        setHideInactiveUsers( !hideInactiveUsers );
    };

    useEffect( () => {
        (async () => {
            const accessToken = await getAccessTokenSilently();
            let resultUser = await getFullUserResponsableList( accessToken );
            let arrUsers = map( resultUser.data, ( data ) => {
                return new LawyerDTO( data );
            } );
            if ( arrUsers.length > 0 ) {
                setUserData( arrUsers );
            }
        })();
    }, [getAccessTokenSilently, !updatedList] );

    return (
        <>
            <div className="rna-container">
                <NotificationAlert ref={notificationAlert} />
            </div>
            {deleteAlert}
            <div className=" clearfix" style={{ marginBottom: 20 }}>
                <Button color="danger"
                        onClick={()=>toggleAddModal(false)}
                        type="button" className="float-left">
                    {label.users.label1}
                </Button>
                <Button
                    type="button"
                    className="float-right no-border"
                    color={hideInactiveUsers === true ? 'primary' : 'secondary'}
                    onClick={handleViewValid}
                >
                    {label.users.label2}
                </Button>
            </div>
            <Row className="mt-3">
                <Col md={12} lg={12}>
                    <div
                        style={{
                            minHeight: '100px',
                            maxHeight: '400px',
                            overflow: 'auto',
                        }}
                    >
                        <Table responsive>
                            <thead>
                            <tr>
                                <th style={{width:'25%'}}>{label.users.label3}</th>
                                <th style={{width:'30%'}}>{label.users.label4}</th>
                                <th style={{width:'5%'}}>{label.users.label5}</th>
                                <th style={{width:'15%'}}>{label.users.label6}</th>
                                <th style={{width:'25%'}}></th>
                            </tr>
                            </thead>
                            <tbody>
                            {userData.map( ( item, index ) => (
                                <>
                                    {hideInactiveUsers && item.active===false ? null: (
                                        <tr key={index}>
                                            <td width={320}>
                                                {' '}
                                                {item.picture ? (
                                                    <img
                                                        alt="pictureUser"
                                                        className="img-fluid  shadow"
                                                        style={style}
                                                        src={`data:image/jpeg;base64,${item.picture}`}
                                                    />
                                                ) : (
                                                    <img
                                                        alt="placeholder"
                                                        className="img-fluid  shadow"
                                                        style={style}
                                                        src={placeholder}
                                                    />
                                                )}
                                                {' '} {item.fullName}
                                            </td>
                                            <td>{item.email}</td>
                                            <td>{item.functionIdItem.label}</td>
                                            <td width={210}>
                                                {map( item.securityGroupDTOList, security => {
                                                    return (
                                                        <Button className="btn-link">
                                                            <p className="text-info">{security.label}</p>
                                                        </Button>
                                                    );
                                                } )
                                                }
                                            </td>
                                            <td>
                                                {' '}
                                                <Select
                                                    name="optionGroup"
                                                    className="react-select drop-up"
                                                    classnamePrefix="react-select"
                                                    value={selectedOption.current}
                                                    options={options}
                                                    styles={{
                                                        // Fixes the overlapping problem of the component
                                                        menuPortal: provided => ({ ...provided, zIndex: 9999 })
                                                    }}
                                                    onChange={(value) => onChangeOptionSelection(value, item)}
                                                />
                                            </td>
                                        </tr>
                                    ) }
                                </>
                            ) )}
                            </tbody>
                        </Table>
                    </div>
                </Col>
            </Row>

            {addModal ? (
                <AddUserModal
                    label={label}
                    handleshowAlert={handleshowAlert}
                    modal={addModal}
                    toggleIn={toggleAddModal}
                />
            ):null}
            {updateModal ? (
                <UpdateUserModal
                    item={itemSelected.current}
                    label={label}
                    handleshowAlert={handleshowAlert}
                    modal={updateModal}
                    toggleIn={toggleUpdateModal}
                />
            ):null}

        </>
    );
};

export default Users;
