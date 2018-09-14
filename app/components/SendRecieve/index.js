import React, { Component } from "react";
import { Link } from "react-router-dom";
import styles from "./style.css";
import { connect } from "react-redux";
import * as RPC from "../../script/rpc";
import Modal from "react-responsive-modal";
import * as TYPE from "../../actions/actiontypes";

import ContextMenuBuilder from "../../contextmenu";
import { remote } from "electron";
import { access } from "fs";

// import images here
import sendimg from "../../images/send.svg";
import plusimg from "../../images/plus.svg";
import addressbookimg from "../../images/addressbook.svg";

const mapStateToProps = state => {
  return {
    ...state.common,
    ...state.transactions,
    ...state.sendRecieve,
    ...state.overview,
    ...state.addressbook
  };
};

const mapDispatchToProps = dispatch => ({
  SetSendAgainData: returnData => {
    dispatch({ type: TYPE.SET_TRANSACTION_SENDAGAIN, payload: returnData });
  },
  updateAddress: returnAddress => {
    dispatch({ type: TYPE.UPDATE_ADDRESS, payload: returnAddress });
  },
  SearchName: returnSearch => {
    dispatch({ type: TYPE.SEARCH, payload: returnSearch });
  },
  clearQueue: () => {
    dispatch({ type: TYPE.CLEAR_QUEUE });
  },
  clearForm: () => {
    dispatch({ type: TYPE.CLEAR_FORM });
  },
  clearSearch: () => {
    dispatch({ type: TYPE.CLEAR_SEARCHBAR });
  },
  addToQueue: returnQueue => {
    dispatch({ type: TYPE.ADD_TO_QUEUE, payload: returnQueue });
  },
  updateAmount: returnAmount => {
    dispatch({ type: TYPE.UPDATE_AMOUNT, payload: returnAmount });
  },
  AccountPicked: returnSelectedAccount => {
    dispatch({ type: TYPE.SELECTED_ACCOUNT, payload: returnSelectedAccount });
  },
  changeAccount: returnAccountChanger => {
    dispatch({ type: TYPE.CHANGE_ACCOUNT, payload: returnAccountChanger });
  },
  updateMessage: returnMessage => {
    dispatch({ type: TYPE.UPDATE_MESSAGE, payload: returnMessage });
  },
  updateAccount: returnAccount => {
    dispatch({ type: TYPE.UPDATE_ACCOUNT_NAME, payload: returnAccount });
  },
  removeQueue: returnQueue => {
    dispatch({ type: TYPE.REMOVE_FROM_QUEUE, payload: returnQueue });
  },
  busy: () => {
    dispatch({ type: TYPE.TOGGLE_BUSY_FLAG });
  },
  OpenModal: type => {
    dispatch({ type: TYPE.SHOW_MODAL, payload: type });
  },
  CloseModal: type => {
    dispatch({ type: TYPE.HIDE_MODAL, payload: type });
  },
  OpenModal2: type => {
    dispatch({ type: TYPE.SHOW_MODAL2, payload: type });
  },
  CloseModal2: type => {
    dispatch({ type: TYPE.HIDE_MODAL2, payload: type });
  },
  OpenModal3: type => {
    dispatch({ type: TYPE.SHOW_MODAL3, payload: type });
  },
  CloseModal3: type => {
    dispatch({ type: TYPE.HIDE_MODAL3, payload: type });
  },
  OpenModal4: type => {
    dispatch({ type: TYPE.SHOW_MODAL4, payload: type });
  },
  CloseModal4: type => {
    dispatch({ type: TYPE.HIDE_MODAL4, payload: type });
  },
  Confirm: Answer => {
    dispatch({ type: TYPE.CONFIRM, payload: Answer });
  }
});

class SendRecieve extends Component {
  componentDidMount() {
    RPC.PROMISE("listaccounts").then(payload => {
      this.props.changeAccount(
        Object.entries(payload).map(e => {
          return {
            name: e[0],
            val: e[1]
          };
        })
      );
    });
    window.addEventListener("contextmenu", this.setupcontextmenu, false);

    this.props.googleanalytics.SendScreen("Send");
  }

  componentWillUnmount() {
    window.removeEventListener("contextmenu", this.setupcontextmenu);
  }

  setupcontextmenu(e) {
    e.preventDefault();
    const contextmenu = new ContextMenuBuilder().defaultContext;
    //build default
    let defaultcontextmenu = remote.Menu.buildFromTemplate(contextmenu);
    defaultcontextmenu.popup(remote.getCurrentWindow());
  }

  editQueue() {
    if (Object.keys(this.props.Queue).includes(this.props.Address)) {
      return (
        <button
          className="button large"
          onClick={() => {
            this.props.OpenModal2("Edit Entry?");
          }}
        >
          Edit Entry
        </button>
      );
    } else {
      return (
        <button
          name="Add To Queue"
          className="button large"
          onClick={() => this.validateAddToQueue()}
        >
          Add To Queue
        </button>
      );
    }
  }

  nxsAmount(e) {
    if (/^[0-9.]+$/.test(e.target.value) | (e.target.value === "")) {
      this.props.updateAmount(e.target.value);
    } else {
      return null;
    }
  }

  accHud() {
    if (this.props.SelectedAccount === "") {
      return " My Account";
    } else {
      return this.props.SelectedAccount;
    }
  }

  accountChanger() {
    if (this.props.AccountChanger[0]) {
      return this.props.AccountChanger.map(e => {
        if (e.name === "") {
          return (
            <option key={e.name} value={e.name}>
              My Account : {e.val.toFixed(5)}
              NXS
            </option>
          );
        } else {
          return (
            <option key={e.name} value={e.name}>
              {e.name}: {e.val}
              NXS
            </option>
          );
        }
      });
    } else {
      return null;
    }
  }

  sendOne() {
    this.props.busy();
    if (!(this.props.Address === "") && this.props.Amount > 0) {
      RPC.PROMISE("validateaddress", [this.props.Address])
        .then(payload => {
          if (payload.isvalid) {
            if (!payload.ismine) {
              if (this.props.Message) {
                RPC.PROMISE("sendtoaddress", [
                  this.props.Address,
                  parseFloat(this.props.Amount),
                  this.props.Message
                ]);
                this.props.clearForm();
                this.props.busy();
              } else {
                RPC.PROMISE("sendtoaddress", [
                  this.props.Address,
                  parseFloat(this.props.Amount)
                ]).then(payoad => console.log(payload));
                this.props.clearForm();
                this.props.busy();
              }
            } else {
              this.props.busy();
              this.props.OpenModal(
                "This is an address regiestered to this wallet"
              );
            }
          } else {
            this.props.busy();
            this.props.OpenModal("Invalid Address");
          }
        })
        .catch(e => {
          this.props.busy();
          this.props.OpenModal("Invalid Address");
        });
    } else {
      this.props.busy();
    }
  }

  sendMany() {
    this.props.busy();
    let keyCheck = Object.keys(this.props.Queue);
    if (keyCheck.length > 1) {
      console.log("tree");
      RPC.PROMISE("sendmany", [this.props.SelectedAccount, this.props.Queue])
        .then(payoad => {
          this.props.busy();
          this.props.clearForm();
          this.props.clearQueue();
        })
        .catch(e => {
          this.props.busy();
        });
    } else if (Object.values(this.props.Queue)[0] > 0) {
      console.log("pee");
      RPC.PROMISE("sendtoaddress", [
        keyCheck[0],
        Object.values(this.props.Queue)[0]
      ])
        .then(payoad => {
          this.props.busy();
          this.props.clearForm();
          this.props.clearQueue();
        })
        .catch(e => {
          this.props.busy();
          this.props.OpenModal("No Addresses");
        });
    }
  }

  areYouSure() {
    let values = Object.values(this.props.Queue);
    return values;
  }
  addAmount() {
    let keyCheck = Object.keys(this.props.Queue);
    if (keyCheck.length > 0) {
      let sum = Object.values(this.props.Queue).reduce((acc, val) => {
        return acc + val;
      });
      return (
        <div id="summary">
          TOTAL: {sum.toFixed(5)} NXS
          <p>FEE: {this.props.paytxfee.toFixed(5)} NXS </p>
          FROM: {this.accHud(this.props.SelectedAccount)}
        </div>
      );
    }
  }
  validateAddToQueue() {
    if (!(this.props.Address === "") && this.props.Amount > 0) {
      console.log(this.props.Address);
      RPC.PROMISE("validateaddress", [this.props.Address])
        .then(payload => {
          console.log(payload);
          if (payload.isvalid) {
            if (!payload.ismine) {
              this.props.addToQueue({
                address: this.props.Address,
                amount: parseFloat(this.props.Amount)
              });
            } else {
              this.props.OpenModal(
                "This is an address regiestered to this wallet"
              );
            }
          } else {
            this.props.OpenModal("Invalid Address");
          }
        })
        .catch(e => {
          this.props.OpenModal("Invalid Address");
        });
    }
  }

  addressBookToQueue() {
    let filteredAddress = this.props.addressbook.filter(e => {
      return (
        e.name.toLowerCase().indexOf(this.props.Search.toLowerCase()) !== -1
      );
    });
    return filteredAddress.map((e, i) => {
      return (
        <tr>
          <td className="tdn" key={e.name + i}>
            {" "}
            {e.name}
          </td>
          {e.notMine.map((ele, i) => {
            return (
              <td
                onClick={() => {
                  this.props.updateAddress(ele.address);
                  this.props.OpenModal("Copied");
                  setTimeout(() => {
                    if (this.props.open) {
                      this.props.CloseModal();
                    }
                  }, 3000);
                }}
                className="dt"
                key={ele.address + i}
              >
                {ele.address}
                <span key={ele.address + i} className="tooltip right">
                  {" "}
                  Copy To Field
                </span>
              </td>
            );
          })}
          {/* {e.notMine.map((ele, i) => {
            return (
              <td className="tdPop">
                <img
                  id="InnerPopulate"
                  src={plusimg}
                  onClick={() => this.props.updateAddress(ele.address)}
                />
                <span className="tooltip left">Click To Populate Field</span>
              </td>
            );
          })} */}
        </tr>
      );
    });
  }

  fillQueue() {
    let Keys = Object.keys(this.props.Queue);
    let values = Object.values(this.props.Queue);
    let queueArray = Keys.map((e, i) => {
      let newObj = {
        key: e,
        val: values[i]
      };
      console.log(newObj);
      return newObj;
    });

    console.log(Keys, values, queueArray);
    return queueArray.map((e, i) => {
      return (
        <tr key={i}>
          <td className="td" onClick={() => this.props.updateAddress(e.key)}>
            <span className="tooltip ">Click To Edit</span>
            {e.key}
          </td>
          <td className="td">{e.val.toFixed(5)}</td>
          <td className="td">
            <img
              id="Remove"
              src="images/status-bad.svg"
              onClick={() => {
                this.props.OpenModal3();
              }}
            />
          </td>
          <Modal
            classNames={{ overlay: "custom-overlay2", modal: "custom-modal2" }}
            showCloseIcon={false}
            open={this.props.openThirdModal}
            onClose={this.props.CloseModal3}
            center
          >
            <div>
              {" "}
              <h2>Remove From Queue?</h2>
              <div id="ok-button">
                {" "}
                <input
                  value="Yes"
                  type="button"
                  className="button primary"
                  onClick={() => {
                    this.props.removeQueue(e.key);
                    this.props.CloseModal3();
                  }}
                />
              </div>
              <div id="no-button">
                <input
                  value="No"
                  type="button"
                  className="button"
                  onClick={() => {
                    this.props.CloseModal3();
                  }}
                />
              </div>
            </div>
          </Modal>
        </tr>
      );
    });
  }

  modalinternal3() {
    switch (this.props.LookUpModalType) {
      case "Address Lookup":
        return (
          <div className="Addresstable-wraper">
            {" "}
            <h2 className="addressModalHeader">
              Lookup Address <img src={addressbookimg} className="hdr-img" />
            </h2>
            <table id="AddressTable">
              <thead className="AddressThead">
                <th className="short-column">Name</th>
                <th className="long-column">Address</th>
                <th className="short-column">
                  <input
                    className="searchBar"
                    type="text"
                    placeholder="Search Address"
                    value={this.props.Search}
                    onChange={e => this.props.SearchName(e.target.value)}
                    required
                  />
                </th>
              </thead>
              {this.addressBookToQueue()}
            </table>
          </div>
        );
    }
  }

  modalinternal2() {
    switch (this.props.SendReceiveModalType) {
      case "send transaction?":
        return (
          <div>
            <h2>Send Transaction?</h2>
            <div id="ok-button">
              <input
                value="Yes"
                type="button"
                className="button primary"
                onClick={() => {
                  this.sendOne();
                  this.props.CloseModal2();
                }}
              />
            </div>
          </div>
        );
        break;
      case "Clear Queue?":
        return (
          <div>
            <h2>Empty Queue?</h2>
            <div id="ok-button">
              {" "}
              <input
                value="Yes"
                type="button"
                className="button primary"
                onClick={() => {
                  this.props.clearQueue();
                  this.props.CloseModal2();
                }}
              />
            </div>
          </div>
        );
        break;
      case "Send Multiple?":
        return (
          <div>
            <h2>
              Send All Transactions (Total: {this.areYouSure()}) From
              {this.accHud()}
            </h2>
            <div id="ok-button">
              <input
                value="Yes"
                type="button"
                className="button primary"
                onClick={() => {
                  this.sendMany();
                  this.props.CloseModal2();
                }}
              />
            </div>
          </div>
        );
        break;
      case "Edit Entry?":
        return (
          <div>
            <h2>Edit This Entry?</h2>
            <div id="ok-button">
              <input
                value="Yes"
                type="button"
                className="button primary"
                onClick={() => {
                  this.validateAddToQueue();
                  this.props.CloseModal2();
                }}
              />
            </div>
          </div>
        );
        break;
      case "Delete Entry?":
        return (
          <div>
            <h2>Delete Entry?</h2>
            <div id="ok-button">
              <input
                value="Yes"
                type="button"
                className="button primary"
                onClick={() => {
                  this.props.CloseModal2();
                }}
              />
            </div>
          </div>
        );
        break;
      case "Address Lookup":
        return (
          <div className="Addresstable-wraper">
            {" "}
            <h2 className="addressModalHeader">
              Lookup Address <img src={addressbookimg} className="hdr-img" />
            </h2>
            <table id="AddressTable">
              <thead className="AddressThead">
                <th className="short-column">Name</th>
                <th className="long-column">Address</th>
                <th className="short-column">
                  <input
                    className="searchBar"
                    type="text"
                    placeholder="Search Address"
                    value={this.props.Search}
                    onChange={e => this.props.SearchName(e.target.value)}
                    required
                  />
                </th>
              </thead>
              {this.addressBookToQueue()}
            </table>
          </div>
        );
        break;

      default:
        "Error";
        break;
    }
  }

  render() {
    ///THIS IS NOT THE RIGHT AREA, this is for auto completing when you press a transaction
    if (this.props.sendagain != undefined && this.props.sendagain != null) {
      console.log(this.props.sendagain);

      this.props.SetSendAgainData(null);
    }
    return (
      <div id="sendrecieve" className="animated fadeIn">
        <h2>
          <img src={sendimg} className="hdr-img" />
          Send Nexus
        </h2>
        {/* ADDRESS MODAL */}
        <Modal
          center
          classNames={{ overlay: "custom-overlay3", modal: "custom-modal3" }}
          showCloseIcon={true}
          open={this.props.openFourthModal}
          onClose={this.props.CloseModal4}
        >
          {this.modalinternal3()}
        </Modal>

        {/* CONFIRMATION MODAL */}
        <Modal
          center
          classNames={{ overlay: "custom-overlay2", modal: "custom-modal2" }}
          showCloseIcon={false}
          open={this.props.openSecondModal}
          onClose={this.props.CloseModal2}
        >
          {this.modalinternal2()}
          <div id="no-button">
            <input
              value="Cancel"
              className="button"
              type="button"
              onClick={() => {
                this.props.CloseModal2();
              }}
            />
          </div>
        </Modal>
        <div className="panel">
          <div id="container">
            <div className="box1">
              <div className="field">
                <select
                  id="select"
                  onChange={e => this.props.AccountPicked(e.target.value)}
                >
                  {this.accountChanger()}
                </select>{" "}
                <p>
                  <label>Nexus Address</label>{" "}
                  <div className="Addresslookup">
                    <span className="tooltip top">Lookup Address</span>
                    <img
                      src={plusimg}
                      className="lookupButton"
                      onClick={() => {
                        this.props.clearSearch();
                        this.props.OpenModal4("Address Lookup");
                      }}
                    />
                  </div>
                  <input
                    size="35"
                    type="text"
                    placeholder="Enter NXS Address"
                    value={this.props.Address}
                    onChange={e => this.props.updateAddress(e.target.value)}
                    required
                  />
                </p>
                <p>
                  <span className="hint">Amount Of Nexus</span>
                  <label>Nexus Amount</label>
                  <input
                    className="input"
                    type="text"
                    placeholder="Nexus Amount"
                    value={this.props.Amount}
                    onChange={e => this.nxsAmount(e)}
                    required
                  />
                </p>
                <p>
                  <label>Message</label>

                  <textarea
                    value={this.props.Message}
                    onChange={e => this.props.updateMessage(e.target.value)}
                    name="message"
                    rows="5"
                    cols="36"
                    placeholder="Enter Your Message"
                  />
                </p>
                <div id="left-buttons">
                  {this.editQueue()}
                  <input
                    type="reset"
                    value="Send Now"
                    className="button"
                    onClick={() => {
                      if (
                        this.props.encrypted === false ||
                        this.props.loggedIn === true
                      ) {
                        this.props.OpenModal2("send transaction?");
                      } else {
                        this.props.OpenModal("Wallet Locked");
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="box2">
              <div id="table-wraper">
                <p className="label">
                  <label>Queue</label>
                </p>
                <table className="table">
                  <thead className="thead">
                    <th>Address</th>
                    <th>Amount</th>
                    <th>Remove</th>
                  </thead>
                  {this.fillQueue()}
                </table>
                <foot className="foot">
                  <input
                    type="reset"
                    value="Send All"
                    className="button primary"
                    onClick={() => {
                      if (
                        this.props.encrypted === false ||
                        this.props.loggedIn === false
                      ) {
                        this.props.OpenModal2("Send Multiple?");
                      } else {
                        this.props.OpenModal("Wallet Locked");
                      }
                    }}
                  />
                  <input
                    type="button"
                    value="Clear Queue"
                    className="button primary"
                    onClick={() => {
                      this.props.OpenModal2("Clear Queue?");
                    }}
                  />
                  <p>
                    <div className="counter">{this.addAmount()} </div>
                  </p>
                </foot>{" "}
              </div>{" "}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SendRecieve);
