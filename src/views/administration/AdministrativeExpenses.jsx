import React, { useState, useRef, useEffect } from "react";
import {
  Button,
  Form,
  FormGroup,
  Input,
  Row,
  Table,
  InputGroup,
  InputGroupAddon,
  Col,
  InputGroupText,
} from "reactstrap";
import { useAuth0 } from "@auth0/auth0-react";
import AdministrativeExpensesModal from "./AdministrativeExpensesModal";
import Select from "react-select";
import { getOptionNotification } from "../../utils/AlertUtils";
import NotificationAlert from "react-notification-alert";
import { getMesureType } from "../../services/SearchService";
import {
  getAdminFraisList,
  updateAdminFraisType,
  deleteAdminFraisType,
  createAdminFraisType,
} from "../../services/AdminService";
import MesureTypeDTO from "../../model/admin/MesureTypeDTO";
import FraisAdminDTO from "../../model/fraisadmin/FraisAdminDTO";
import CircularProgress from "@material-ui/core/CircularProgress";

const map = require("lodash/map");

const AdministrativeExpenses = (props) => {
  const { label, currency } = props.parentProps;
  const { getAccessTokenSilently } = useAuth0();
  const notificationAlert = useRef(null);
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [data, setData] = useState([]);
  const [isModalShow, setModalShow] = useState(false);
  const [isArchive, setArchive] = useState(false);
  const [selectedOptionMesure, setSelectedOptionMesure] = useState({});
  const [selectItem, setSelectItem] = useState({});
  const [selectDataMesure, setSelectDataMesure] = useState([]);
  const [loading, setLoading] = useState(false);

  const onChangeOptionSelection = async (value) => {
    setSelectedOptionMesure(value);
  };

  useEffect(() => {
    (async () => {
      const accessToken = await getAccessTokenSilently();
      let _data = [];
      const result = await getAdminFraisList(accessToken);
      if (!result.error) {
        _data = map(result.data, (type) => {
          return new FraisAdminDTO(type);
        });
        setData(_data);
      }
    })();
  }, [getAccessTokenSilently]);

  useEffect(() => {
    (async () => {
      try {
        const accessToken = await getAccessTokenSilently();
        let _data = [];
        const result = await getMesureType(accessToken);
        if (!result.error) {
          _data = map(result.data, (type) => {
            return new MesureTypeDTO(type);
          });
        }
        setSelectedOptionMesure(_data[0]);
        setSelectDataMesure(_data);
      } catch (e) {
        // doesn't work
      }
    })();
  }, [getAccessTokenSilently]);

  const handleAddItem = async () => {
    setLoading(true);
    if (itemName.trim() !== "") {
      if (itemPrice.trim() !== "") {
        let obj = new FraisAdminDTO({
          debourDescription: itemName.trim(),
          pricePerUnit: itemPrice.trim(),
          idMesureType: selectedOptionMesure.value,
          idMesureTypeItem: selectedOptionMesure,
          archived: false,
        });
        const accessToken = await getAccessTokenSilently();
        let result = await createAdminFraisType(accessToken, obj);
        if (!result.error) {
          setItemName("");
          setItemPrice("");
          setData([result.data, ...data]);

          setLoading(false);
        } else {
          setLoading(false);
          handleshowAlert(label.benefits.label11, "danger");
        }
      } else {
        setLoading(false);
        handleshowAlert(label.administrativeexpenses.label12, "danger");
      }
    } else {
      setLoading(false);
      handleshowAlert(label.administrativeexpenses.label4, "danger");
    }
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
    let result = await deleteAdminFraisType(accessToken, item.idDebourType);
    if (!result.error) {
      setData((data) =>
        data.filter((obj) => obj.idDebourType !== item.idDebourType)
      );
      handleshowAlert(label.administrativeexpenses.label9, "info");
    } else {
      handleshowAlert(label.administrativeexpenses.label10, "danger");
    }
  };

  const handleArchieveItem = async (item, e) => {
    e.preventDefault();
    let _data = data;
    let index = _data.findIndex(
      (obj) => obj.idDebourType === item.idDebourType
    );
    if (index !== -1) {
      let obj = data[index];
      obj.archived = !obj.archived;
      _data[index] = obj;
      const accessToken = await getAccessTokenSilently();
      let result = await updateAdminFraisType(
        accessToken,
        item.idDebourType,
        obj
      );
      if (!result.error) {
        setData([..._data]);
      } else {
        handleshowAlert(label.benefits.label12, "danger");
      }
    }
  };

  const toggleIn = () => {
    setModalShow(!isModalShow);
  };

  const handleUpdateItem = (value) => {
    setData((data) =>
      data.map((object) => {
        if (object.idDebourType === value.idDebourType) {
          object = value;
        }
        return object;
      })
    );
    setModalShow(!isModalShow);
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
      <AdministrativeExpensesModal
        currency={currency}
        label={label}
        modal={isModalShow}
        toggleIn={toggleIn}
        item={selectItem}
        selectDataMesure={selectDataMesure}
        handleSucess={handleUpdateItem}
        handleError={handleError}
      />
      <Form className="form-horizontal" method="get">
        <Row style={{ marginLeft: 10 }}>
          <FormGroup>
            <Input
              placeholder={label.administrativeexpenses.label1}
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
          </FormGroup>

          <FormGroup style={{ marginLeft: 10 }}>
            <InputGroup>
              <InputGroupAddon addonType="prepend">
                <InputGroupText>
                  <span className="currency-input-text">{currency}</span>
                </InputGroupText>
              </InputGroupAddon>
              <Input
                type="number"
                value={itemPrice}
                onChange={(e) => setItemPrice(e.target.value)}
                placeholder={label.administrativeexpenses.label2}
              />
            </InputGroup>
          </FormGroup>
          <FormGroup style={{ width: "100px", marginLeft: 10 }}>
            <Select
              menuPlacement="top"
              name="optionGroup"
              className="react-select drop-up"
              classNamePrefix="react-select"
              value={selectedOptionMesure}
              onChange={onChangeOptionSelection}
              options={selectDataMesure}
            />
          </FormGroup>
          <FormGroup>
            <Button
              style={{ marginTop: 0, marginLeft: 10 }}
              color="primary"
              disable={loading}
              onClick={handleAddItem}
            >
              {label.administrativeexpenses.label11}
            </Button>
          </FormGroup>
          <FormGroup>
            <Button
              style={{ marginTop: 0, marginLeft: 10 }}
              color={isArchive ? "primary" : "secondary"}
              onClick={handleViewArchieve}
            >
              {label.administrativeexpenses.label3}
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
                        <td className="text-left">{item.debourDescription}</td>
                        <td className="text-left">{item.pricePerUnit}</td>
                        <td className="text-left">
                          {item.idMesureTypeItem.label}
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

export default AdministrativeExpenses;
