import React, { useState, useRef, useEffect } from "react";
import { Button, Form, FormGroup, Input, Row, Table, Col } from "reactstrap";
import { useAuth0 } from "@auth0/auth0-react";
import BankAccountsModal from "./BankAccountsModal";
import Select from "react-select";
import { getOptionNotification } from "../../utils/AlertUtils";
import NotificationAlert from "react-notification-alert";
import { getAccountType } from "../../services/SearchService";
import {
  updateAdminBankAccountType,
  deleteAdminBankAccountType,
  createAdminBankAccountType,
  getAdminBankAccountList,
} from "../../services/AdminService";
import MesureTypeDTO from "../../model/admin/MesureTypeDTO";
import CircularProgress from "@material-ui/core/CircularProgress";
import BankAccountDTO from '../../model/admin/BankAccountDTO';
import ReactBSAlert from 'react-bootstrap-sweetalert';

const map = require("lodash/map");

const BankAccounts = (props) => {
  const { label, currency } = props.parentProps;
  const { getAccessTokenSilently } = useAuth0();
  const notificationAlert = useRef(null);
  const [accountNumber, setAccountNumber] = useState("");
  const [accountDescription, setAccountDescription] = useState("");
  const [data, setData] = useState([]);
  const [isModalShow, setModalShow] = useState(false);
  const [isArchive, setArchive] = useState(false);
  const [selectedOptionAccountType, setSelectedOptionAccountType] = useState(
    {}
  );
  const [selectItem, setSelectItem] = useState({});
  const [selectDataAccountType, setSelectDataAccountType] = useState([]);
  const [loading, setLoading] = useState(false);
  const itemSelected = useRef( null );
  const [deleteAlert, setDeleteAlert] = useState( null );


  const onChangeOptionSelection = async (value) => {
    setSelectedOptionAccountType(value);
  };

  useEffect(() => {
    (async () => {
      const accessToken = await getAccessTokenSilently();
      let _data = [];
      const result = await getAdminBankAccountList(accessToken);
      if (!result.error) {
        _data = map(result.data, (type) => {
          return new BankAccountDTO(type);
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
        const result = await getAccountType(accessToken);
        if (!result.error) {
          _data = map(result.data, (type) => {
            return new MesureTypeDTO(type);
          });
        }
        setSelectedOptionAccountType(_data[0]);
        setSelectDataAccountType(_data);
      } catch (e) {
        // doesn't work
      }
    })();
  }, [getAccessTokenSilently]);

  const handleAddItem = async () => {
    setLoading(true);
    if (accountNumber.trim() !== "") {
      if (accountDescription.trim() !== "") {
        let obj = new BankAccountDTO({
          accountNumber: accountNumber.trim(),
          accountRef: accountDescription.trim(),
          accountTypeId: selectedOptionAccountType.value,
          accountTypeIdItem: selectedOptionAccountType,
          archived: false,
        });
        const accessToken = await getAccessTokenSilently();
        let result = await createAdminBankAccountType(accessToken, obj);
        if (!result.error) {
          setAccountNumber("");
          setAccountDescription("");
          setData([result.data, ...data]);
          handleshowAlert( label.bankaccounts.label102, 'success');
          setLoading(false);
        } else {
          setLoading(false);
          handleshowAlert(label.bankaccounts.label11, "danger");
        }
      } else {
        setLoading(false);
        handleshowAlert(label.bankaccounts.label10, "danger");
      }
    } else {
      setLoading(false);
      handleshowAlert(label.bankaccounts.label9, "danger");
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
    const accessToken = await getAccessTokenSilently();
    let result = await deleteAdminBankAccountType(accessToken, item.compteId);
    if (!result.error) {
      setData((data) => data.filter((obj) => obj.compteId !== item.compteId));
      handleshowAlert(label.bankaccounts.label13, "info");
    } else {
      handleshowAlert(label.bankaccounts.label14, "danger");
    }
  };

  const handleArchieveItem = async (item, e) => {
    e.preventDefault();
    let _data = data;
    let index = _data.findIndex((obj) => obj.compteId === item.compteId);
    if (index !== -1) {
      let obj = data[index];
      obj.archived = !obj.archived;
      _data[index] = obj;
      const accessToken = await getAccessTokenSilently();
      let result = await updateAdminBankAccountType(
        accessToken,
        item.compteId,
        obj
      );
      if (!result.error) {
        setData([..._data]);
        let message = obj.archived === true ? label.bankaccounts.label100 : label.bankaccounts.label101;
        handleshowAlert( message, 'primary' );
      } else {
        handleshowAlert(label.bankaccounts.label15, "danger");
      }
    }
  };

  const toggleIn = () => {
    setSelectItem({});
    setModalShow(!isModalShow);
  };

  const handleUpdateItem = (value) => {
    setData((data) =>
      data.map((object) => {
        if (object.compteId === value.compteId) {
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
      <BankAccountsModal
        currency={currency}
        label={label}
        modal={isModalShow}
        toggleIn={toggleIn}
        item={selectItem}
        dataAccountType={selectDataAccountType}
        handleSucess={handleUpdateItem}
        handleError={handleError}
      />
      <Form className="form-horizontal" method="get">
        <Row style={{ marginLeft: 10 }}>
          <FormGroup>
            <Input
              placeholder={label.bankaccounts.label1}
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
            />
          </FormGroup>
          <FormGroup style={{ width: "200px", marginLeft: 10 }}>
            <Select
              menuPlacement="top"
              name="optionGroup"
              className="react-select drop-up"
              classNamePrefix="react-select"
              value={selectedOptionAccountType}
              onChange={onChangeOptionSelection}
              options={selectDataAccountType}
            />
          </FormGroup>
          <FormGroup style={{ marginLeft: 10 }}>
            <Input
              placeholder={label.bankaccounts.label2}
              type="text"
              value={accountDescription}
              onChange={(e) => setAccountDescription(e.target.value)}
            />
          </FormGroup>
          <FormGroup>
            <Button
              style={{ marginTop: 0, marginLeft: 10 }}
              color="primary"
              disable={loading}
              onClick={handleAddItem}
            >
              {label.bankaccounts.label3}
            </Button>
          </FormGroup>
          <FormGroup>
            <Button
              style={{ marginTop: 0, marginLeft: 10 }}
              color={isArchive ? "primary" : "secondary"}
              onClick={handleViewArchieve}
            >
              {label.bankaccounts.label4}
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
                          <Button className="btn-icon btn-link" color="primary" size="sm" onClick={()=>{
                            itemSelected.current = item;
                            setDeleteAlert( <ReactBSAlert
                                warning
                                style={{ display: 'block', marginTop: '100px' }}
                                title={label.common.label10}
                                onConfirm={() => {
                                  handleDeleteItem( itemSelected.current);
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
                            </ReactBSAlert> )

                          }}>
                            <i className="ml-2 tim-icons icon-trash-simple"/>
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
                        <td className="text-left">{item.accountNumber}</td>
                        <td className="text-left">
                          {item.accountTypeIdItem.label}
                        </td>
                        <td className="text-left">{item.accountRef}</td>
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

export default BankAccounts;
