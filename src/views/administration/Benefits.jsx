import React, { useEffect, useRef, useState } from 'react';
import { Button, Col, Form, FormGroup, Input, Row, Table } from 'reactstrap';
import BenefitsModal from './BenefitsModal';
import { useAuth0 } from '@auth0/auth0-react';
import {
  createAdminPrestationType,
  deleteAdminPrestationType,
  getAdminPrestationList,
  updateAdminPrestationType,
} from '../../services/AdminService';
import PrestationTypeDTO from '../../model/admin/PrestationTypeDTO';
import NotificationAlert from 'react-notification-alert';
import { getOptionNotification } from '../../utils/AlertUtils';
import CircularProgress from '@material-ui/core/CircularProgress';
import ReactBSAlert from 'react-bootstrap-sweetalert';

const map = require( 'lodash/map' );

const Benefits = ( props ) => {
  const notificationAlert = useRef( null );
  const { getAccessTokenSilently } = useAuth0();
  const [itemName, setItemName] = useState( '' );
  const [data, setData] = useState( [] );
  const [isModalShow, setModalShow] = useState( false );
  const [selectItem, setSelectItem] = useState( {} );
  const [isArchive, setArchive] = useState( false );
  const [loading, setLoading] = useState( false );
  const itemSelected = useRef( null );
  const [deleteAlert, setDeleteAlert] = useState( null );

  const { label } = props.parentProps;
  useEffect( () => {
    (async () => {
      try {
        const accessToken = await getAccessTokenSilently();

        let _data = [];
        const result = await getAdminPrestationList( accessToken );

        if (!result.error) {
          _data = map(result.data, (type) => {
            return new PrestationTypeDTO(type);
          });
        }
        setData(_data);
      } catch (e) {
        // doesn't work
      }
    })();
  }, [getAccessTokenSilently]);

  const handleAddItem = async () => {
    setLoading(true);
    if (itemName.trim() !== "") {
      let obj = new PrestationTypeDTO({
        description: itemName.trim(),
        archived: false,
      });
      const accessToken = await getAccessTokenSilently();
      let result = await createAdminPrestationType(accessToken, obj);
      if (!result.error) {
        setItemName("");
        setData( [result.data, ...data] );
        handleshowAlert( label.benefits.label102, 'success' );
        setLoading( false );
      } else {
        setLoading(false);
        handleshowAlert(label.benefits.label11, "danger");
      }
    } else {
      setLoading(false);
      handleshowAlert(label.benefits.label4, "danger");
    }
  };

  const handleshowAlert = (message, type) => {
    notificationAlert.current.notificationAlert(
      getOptionNotification(message, type)
    );
  };

  const handleViewArchieve = () => {
    setArchive(!isArchive);
  };

  const handleEditItem = (item, e) => {
    e.preventDefault();
    setSelectItem(item);
    setModalShow(true);
  };

  const handleDeleteItem = async (item, e) => {
    const accessToken = await getAccessTokenSilently();
    let result = await deleteAdminPrestationType(accessToken, item.idTs);
    if (!result.error) {
      setData((data) => data.filter((obj) => obj.idTs !== item.idTs));
      handleshowAlert(label.benefits.label9, "info");
    } else {
      handleshowAlert(label.benefits.label10, "danger");
    }
  };

  const handleArchieveItem = async (item, e) => {
    e.preventDefault();
    let _data = data;
    let index = _data.findIndex((obj) => obj.idTs === item.idTs);
    if (index !== -1) {
      let obj = data[index];
      obj.archived = !obj.archived;
      _data[index] = obj;
      const accessToken = await getAccessTokenSilently();
      let result = await updateAdminPrestationType(accessToken, item.idTs, obj);
      if (!result.error) {
        setData( [..._data] );
        let message = obj.archived === true ? label.benefits.label100 : label.benefits.label101;
        handleshowAlert( message, 'primary' );
      } else {
        handleshowAlert(label.benefits.label12, "danger");
      }
    }
  };

  const toggleIn = () => {
    setModalShow(!isModalShow);
  };

  const handleError = (message) => {
    handleshowAlert(message, "danger");
  };

  const handleUpdateItem = async (value) => {
    setData((data) =>
      data.map((object) => {
        if (object.idTs === value.idTs) {
          object = value;
        }
        return object;
      })
    );
    setModalShow(!isModalShow);
  };

  return (
    <div className="content">
      <div className="rna-container">
        <NotificationAlert ref={notificationAlert} />
      </div>
      <BenefitsModal
        label={label}
        modal={isModalShow}
        toggleIn={toggleIn}
        item={selectItem}
        handleError={handleError}
        handleSucess={handleUpdateItem}
      />
      <Form className="form-horizontal" method="get">
        <Row style={{ marginLeft: 10 }}>
          <FormGroup>
            <Input
              placeholder={label.benefits.label1}
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
          </FormGroup>
          <FormGroup>
            <Button
              style={{ marginTop: 0, marginLeft: 4 }}
              color="primary"
              disable={loading}
              onClick={handleAddItem}
            >
              {label.benefits.label2}
            </Button>
          </FormGroup>
          <FormGroup>
            <Button
              style={{ marginTop: 0, marginLeft: 4 }}
              color={isArchive ? "primary" : "secondary"}
              onClick={handleViewArchieve}
            >
              {label.benefits.label3}
            </Button>
          </FormGroup>
          {loading && (
            <CircularProgress color="primary" className="ml-3" size={30} />
          )}
        </Row>
      </Form>
      <Row className="mt-3">
        <Col md={12} lg={12}>
          <div
            style={{
              maxHeight: "350px",
              overflowY: "auto",
            }}
          >
            <Table responsive>
              <tbody>
                {data.map((item, index) => (
                  <>
                    {!isArchive && item.archived ? null : (
                      <tr key={index}>
                        <td style={{ width: 150 }}>
                          {isArchive && item.archived ? (
                            <Button
                              className="btn-icon btn-link"
                              onClick={(e) => handleArchieveItem(item, e)}
                              color="secondary"
                              size="sm"
                            >
                              <i className="tim-icons icon-paper" />
                            </Button>
                          ) : (
                              <Button
                                  className="btn-icon btn-link"
                                  onClick={( e ) => handleArchieveItem( item, e )}
                                  color="primary"
                                  size="sm"
                              >
                                <i className="tim-icons icon-paper"/>
                              </Button>
                          )}
                          <Button className="btn-icon btn-link" color="primary" size="sm" onClick={() => {
                            itemSelected.current = item;
                            setDeleteAlert( <ReactBSAlert
                                warning
                                style={{ display: 'block', marginTop: '100px' }}
                                title={label.common.label10}
                                onConfirm={() => {
                                  handleDeleteItem( itemSelected.current );
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
                              <i className="ml-2 tim-icons icon-trash-simple"/>
                            </ReactBSAlert> );

                          }}>
                            <i className="ml-2 tim-icons icon-trash-simple"/>
                          </Button>
                          {` `}
                          <Button
                              className="btn-icon btn-link"
                              onClick={( e ) => handleEditItem( item, e )}
                              color="primary"
                              size="sm"
                          >
                            <i className="ml-2 tim-icons icon-pencil"/>
                          </Button>
                          {` `}
                        </td>
                        <td className="text-left">{item.description}</td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </Table>
          </div>
        </Col>
      </Row>
      {deleteAlert}
    </div>
  );
};

export default Benefits;
