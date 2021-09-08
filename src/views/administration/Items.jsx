import React, { useEffect, useState, useRef } from "react";
import {
  Button,
  Form,
  FormGroup,
  Input,
  Row,
  Table,
  Col,
} from "reactstrap";
import ItemsModal from "./ItemsModal";
import { useAuth0 } from "@auth0/auth0-react";
import {
  getAdminAccountingList,
  updateAdminAccountingType,
  deleteAdminAccountingType,
  createAdminAccountingType,
} from "../../services/AdminService";
import NotificationAlert from "react-notification-alert";
import { getOptionNotification } from "../../utils/AlertUtils";
import CircularProgress from "@material-ui/core/CircularProgress";
import AccountingTypeDTO from "../../model/admin/AccountingTypeDTO";

const map = require("lodash/map");

const Items = (props) => {
  const notificationAlert = useRef(null);
  const { getAccessTokenSilently } = useAuth0();
  const [itemName, setItemName] = useState("");
  const [data, setData] = useState([]);
  const [isModalShow, setModalShow] = useState(false);
  const [selectItem, setSelectItem] = useState({});
  const [isArchive, setArchive] = useState(false);
  const [loading, setLoading] = useState(false);

  const { label } = props.parentProps;
  useEffect(() => {
    (async () => {
      const accessToken = await getAccessTokenSilently();

      let _data = [];
      const result = await getAdminAccountingList(accessToken);
      if (!result.error) {
        _data = map(result.data, (type) => {
          return new AccountingTypeDTO(type);
        });
      }
      setData(_data);
    })();
  }, [getAccessTokenSilently]);

  const handleAddItem = async () => {
    setLoading(true);
    if (itemName.trim() !== "") {
      let obj = new AccountingTypeDTO({
        description: itemName.trim(),
        archived: false,
      });
      const accessToken = await getAccessTokenSilently();
      let result = await createAdminAccountingType(accessToken, obj);
      if (!result.error) {
        setItemName("");
        setData([result.data, ...data]);
        setLoading(false);
      } else {
        setLoading(false);
        handleshowAlert(label.items.label11, "danger");
      }
    } else {
      setLoading(false);
      handleshowAlert(label.items.label4, "danger");
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
    e.preventDefault();
    const accessToken = await getAccessTokenSilently();
    let result = await deleteAdminAccountingType(
      accessToken,
      item.accountingId
    );
    if (!result.error) {
      setData((data) =>
        data.filter((obj) => obj.accountingId !== item.accountingId)
      );
      handleshowAlert(label.items.label9, "info");
    } else {
      handleshowAlert(label.items.label10, "danger");
    }
  };

  const handleArchieveItem = async (item, e) => {
    e.preventDefault();
    let _data = data;
    let index = _data.findIndex(
      (obj) => obj.accountingId === item.accountingId
    );
    if (index !== -1) {
      let obj = data[index];
      obj.archived = !obj.archived;
      _data[index] = obj;
      const accessToken = await getAccessTokenSilently();
      let result = await updateAdminAccountingType(
        accessToken,
        item.accountingId,
        obj
      );
      if (!result.error) {
        setData([..._data]);
      } else {
        handleshowAlert(label.items.label12, "danger");
      }
    }
  };

  const handleCheckboxItemClick = async (item, e, value) => {
    let _data = data;
    let index = _data.findIndex(
      (obj) => obj.accountingId === item.accountingId
    );
    if (index !== -1) {
      let obj = data[index];
      obj[value] = e.target.checked;
      _data[index] = obj;
      const accessToken = await getAccessTokenSilently();
      let result = await updateAdminAccountingType(
        accessToken,
        item.accountingId,
        obj
      );
      if (!result.error) {
        setData([..._data]);
      } else {
        handleshowAlert(label.items.label12, "danger");
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
        if (object.accountingId === value.accountingId) {
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
      <ItemsModal
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
              placeholder={label.items.label1}
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
              {label.items.label2}
            </Button>
          </FormGroup>
          <FormGroup>
            <Button
              style={{ marginTop: 0, marginLeft: 4 }}
              color={isArchive ? "primary" : "secondary"}
              onClick={handleViewArchieve}
            >
              {label.items.label3}
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
                        <td>
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
                              onClick={(e) => handleArchieveItem(item, e)}
                              color="primary"
                              size="sm"
                            >
                              <i className="tim-icons icon-paper" />
                            </Button>
                          )}
                          <Button
                            className="btn-icon btn-link"
                            onClick={(e) => handleDeleteItem(item, e)}
                            color="primary"
                            size="sm"
                          >
                            <i className="ml-2 tim-icons icon-trash-simple" />
                          </Button>
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
                        <td className="text-left">{item.description}</td>
                        <td>
                          <FormGroup>
                            <Input
                              defaultChecked={item.honoraires}
                              type="checkbox"
                              onChange={(e) =>
                                handleCheckboxItemClick(item, e, "honoraires")
                              }
                            />{" "}
                            {label.items.label14}
                          </FormGroup>
                        </td>
                        <td>
                          <FormGroup>
                            <Input
                              defaultChecked={item.fraisProcedure}
                              type="checkbox"
                              onChange={(e) =>
                                handleCheckboxItemClick(
                                  item,
                                  e,
                                  "fraisProcedure"
                                )
                              }
                            />{" "}
                            {label.items.label15}
                          </FormGroup>
                        </td>
                        <td>
                          <FormGroup>
                            <Input
                              defaultChecked={item.fraisCollaboration}
                              type="checkbox"
                              onChange={(e) =>
                                handleCheckboxItemClick(
                                  item,
                                  e,
                                  "fraisCollaboration"
                                )
                              }
                            />{" "}
                            {label.items.label16}
                          </FormGroup>
                        </td>
                        <td>
                          <FormGroup>
                            <Input
                              defaultChecked={item.facturable}
                              type="checkbox"
                              onChange={(e) =>
                                handleCheckboxItemClick(item, e, "facturable")
                              }
                            />{" "}
                            {label.items.label17}
                          </FormGroup>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </Table>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default Items;
