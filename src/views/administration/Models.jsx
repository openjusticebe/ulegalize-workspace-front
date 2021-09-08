import React, { useState, useRef, useEffect } from "react";
import { Button, FormGroup, Row, Table, Col } from "reactstrap";
import { useAuth0 } from "@auth0/auth0-react";
import { getOptionNotification } from "../../utils/AlertUtils";
import NotificationAlert from "react-notification-alert";
import {
  getAdminModelsList, deleteAdminModel,
} from '../../services/AdminService';
import CircularProgress from "@material-ui/core/CircularProgress";
import ModelDTO from '../../model/admin/model/ModelDTO';
import ModelsModal from './ModelsModal';
import ReactBSAlert from 'react-bootstrap-sweetalert';
import ModalCheckSessionDrive from '../popup/drive/ModalCheckSessionDrive';

const map = require("lodash/map");
const isNil = require("lodash/isNil");

const Models = (props) => {
  const { label, currency, driveType } = props.parentProps;
  const { getAccessTokenSilently } = useAuth0();
  const notificationAlert = useRef(null);
  const [deleteAlert, setDeleteAlert] = useState(null);
  const [data, setData] = useState([]);
  const [isModalShow, setModalShow] = useState(false);
  const selectItem = useRef({});
  const loading = useRef(false);
  const [checkTokenDrive, setCheckTokenDrive] = useState( false );


  useEffect(() => {
    (async () => {
      const accessToken = await getAccessTokenSilently();
      let _data = [];
      const result = await getAdminModelsList(accessToken);
      if (!result.error) {
        _data = map(result.data, (type) => {
          return new ModelDTO(type);
        });
        setData(_data);
        if ( !isNil( driveType ) && driveType === 'dropbox' ) {
          setCheckTokenDrive( true );
        }
      }
    })();
  }, [getAccessTokenSilently, isModalShow]);

  const _togglePopupCheckSession = ( message, type ) => {
    if ( !isNil( message ) && !isNil( type ) ) {
      handleshowAlert( message, type );
    }
    setCheckTokenDrive( !checkTokenDrive );
  };
  const handleAddItem = async () => {
    selectItem.current = new ModelDTO();
    selectItem.current.type = 'U';
    setModalShow(true);
  };

  const handleEditItem = (item, e) => {
    e.preventDefault();
    selectItem.current = item;
    setModalShow(true);
  };

  const handleDeleteItem = async (item, e) => {
    e.preventDefault();
    const accessToken = await getAccessTokenSilently();
    let result = await deleteAdminModel(accessToken, item.id);
    if (!result.error) {
      setData((data) => data.filter((obj) => obj.id !== item.id));
      handleshowAlert(label.common.success2, "primary");
    } else {
      handleshowAlert(label.common.error3, "danger");
    }
  };

  const toggleIn = () => {
    selectItem.current = new ModelDTO();

    setModalShow(!isModalShow);
  };

  const handleUpdateItem = () => {
    setModalShow(!isModalShow);
    handleshowAlert(label.common.success1, "primary");

  };

  const handleError = (message) => {
    handleshowAlert(message, "danger");
  };

  const handleshowAlert = (message, type) => {
    notificationAlert.current.notificationAlert(
      getOptionNotification(message, type)
    );
  };

  return (
    <div className="content">
      <div className="rna-container">
        <NotificationAlert ref={notificationAlert} />
      </div>
      {deleteAlert}
      <Row style={{ marginLeft: 10 }}>
        <FormGroup>
          <Button
              style={{ marginTop: 0, marginLeft: 4 }}
              color="primary"
              disable={loading.current}
              onClick={handleAddItem}
          >
            {label.common.add}
          </Button>
        </FormGroup>
        {loading.current && (
            <CircularProgress color="primary" className="ml-3" size={30} />
        )}
      </Row>

      <Row className="mt-3">
        <Col md={12} lg={12}>
          <div
            style={{
              maxHeight: "350px",
              overflowY: "auto",
            }}
          >
            <Table responsive>
              <thead>
              <th>#</th>
              <th>{label.models.header1}</th>
              <th>{label.models.header2}</th>
              <th>{label.models.header3}</th>
              <th>{label.models.header4}</th>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <>
                      <tr key={index}>
                        <td style={{ width: 150 }}>
                          {item.type === 'U' ? (
                              <Button
                                  className="btn-icon btn-link"
                                  onClick={(e) => {
                                    setDeleteAlert((
                                        <ReactBSAlert
                                            warning
                                            style={{ display: "block", marginTop: "100px" }}
                                            title={label.common.label10}
                                            onConfirm={(e) => { handleDeleteItem(item, e); setDeleteAlert(null); }}
                                            onCancel={() => { setDeleteAlert(null); }}
                                            confirmBtnBsStyle="success"
                                            cancelBtnBsStyle="danger"
                                            confirmBtnText={label.common.label11}
                                            cancelBtnText={label.common.cancel}
                                            showCancel
                                            btnSize=""
                                        >
                                          {label.common.label12}
                                        </ReactBSAlert>
                                    ));
                                  } }
                                  color="primary"
                                  size="sm"
                              >
                                <i className="ml-2 tim-icons icon-trash-simple" />
                              </Button>
                          ): null}
                          {` `}
                          <Button
                            className="btn-icon btn-link"
                            onClick={(e) => handleEditItem(item, e)}
                            color="primary"
                            size="sm"
                          >
                            <i className="ml-2 tim-icons icon-pencil" />
                          </Button>
                          {` `}
                        </td>
                        <td className="text-left">{item.name}</td>
                        <td className="text-left">
                          {item.contextItem.label}
                        </td>
                        <td className="text-left">
                          {item.formatItem.label}
                        </td>
                        <td className="text-left">{item.description}</td>
                      </tr>
                  </>
                ))}
              </tbody>
            </Table>
          </div>
        </Col>
      </Row>

      {isModalShow ? (
          <ModelsModal
              currency={currency}
              label={label}
              modal={isModalShow}
              toggleIn={toggleIn}
              item={selectItem.current}
              handleSucess={handleUpdateItem}
              handleError={handleError}
              handleshowAlert={handleshowAlert}
          />
      ): null}

      {checkTokenDrive ?
          (
              <ModalCheckSessionDrive
                  label={label}
                  toggle={_togglePopupCheckSession}
                  checkTokenDrive={checkTokenDrive}/>
          ) : null}

    </div>
  );
};

export default Models;
