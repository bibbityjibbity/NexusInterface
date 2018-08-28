import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { remote } from "electron";
import { Link } from "react-router-dom";
import Modal from "react-responsive-modal";

import config from "../../api/configuration";
import * as RPC from "../../script/rpc";
import * as TYPE from "../../actions/actiontypes";
import * as actionsCreators from "../../actions/addressbookActionCreators";
import TimeZoneSelector from "./timeZoneSelector";

import ContactView from "./ContactView";
import ContextMenuBuilder from "../../contextmenu";
import styles from "./style.css";
import profilePlaceholder from "images/Profile_Placeholder.png";

const mapStateToProps = state => {
  return { ...state.common, ...state.addressbook };
};

const mapDispatchToProps = dispatch =>
  bindActionCreators(actionsCreators, dispatch);

class Addressbook extends Component {
  // componentDidMount: get addressbook data
  // Anything that you are relying on being available for rendering the page from startup
  componentDidMount() {
    this.loadMyAccounts();
    this.props.googleanalytics.SendScreen("AddressBook");
  }

  loadMyAccounts() {
    RPC.PROMISE("listaccounts", [0]).then(payload => {
      Promise.all(
        Object.keys(payload).map(account =>
          RPC.PROMISE("getaddressesbyaccount", [account])
        )
      ).then(payload => {
        let validateAddressPromises = [];

        payload.map(element => {
          element.addresses.map(address => {
            validateAddressPromises.push(
              RPC.PROMISE("validateaddress", [address])
            );
          });
        });

        Promise.all(validateAddressPromises).then(payload => {
          let accountsList = [];
          let myaccts = payload.map(e => {
            if (e.ismine && e.isvalid) {
              let index = accountsList.findIndex(ele => {
                if (ele.account === e.account) {
                  return ele;
                }
              });

              if (index === -1) {
                accountsList.push({
                  account: e.account,
                  addresses: [e.address]
                });
              } else {
                accountsList[index].addresses.push(e.address);
              }
            }
          });
          this.props.MyAccountsList(accountsList);
        });
      });
    });
  }

  componentDidUpdate(previousprops) {
    if (this.props.save) {
      console.log("SAVE");
      config.WriteJson("addressbook.json", {
        addressbook: this.props.addressbook
      });
      this.props.ToggleSaveFlag();
    }
  }

  getinitial(name) {
    if (name && name.length >= 1) return name.charAt(0);
    return "M"; // My Addresses
  }

  copyaddress(event) {
    event.preventDefault();
    console.log(event.target.innerText);
    let target = event.currentTarget;
    let address = event.target.innerText;

    // create a temporary input element and add it to the list item (no one will see it)
    let input = document.createElement("input");
    input.type = "text";
    target.appendChild(input);

    // set the value of the input to the selected address, then focus and select it
    input.value = address;
    input.focus();
    input.select();

    // copy it to clipboard
    document.execCommand("Copy", false, null);

    // remove the temporary element from the DOM
    input.remove();

    alert("copyed");
  }

  modalInternalBuilder() {
    let index = this.props.addressbook.findIndex(ele => {
      if (ele.name === this.props.prototypeName) {
        return ele;
      }
    });

    switch (this.props.modalType) {
      case "ADD_CONTACT":
        return (
          <div id="modalInternal">
            {index === -1 ? <h2>Add Contact</h2> : <h2>Edit Contact</h2>}

            <div className="field">
              <label htmlFor="new-account-name">Name</label>
              <input
                ref="addContactName"
                id="new-account-name"
                type="text"
                value={this.props.prototypeName}
                onChange={e => this.props.EditProtoName(e.target.value)}
                placeholder="Name"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="new-account-name">Phone #</label>
              <input
                id="new-account-phone"
                type="tel"
                onChange={e => this.props.EditProtoPhone(e.target.value)}
                value={this.props.prototypePhoneNumber}
                placeholder="Phone #"
              />
            </div>
            <div className="contact-detail">
              <label>Local Time</label>
              <TimeZoneSelector />
            </div>

            <div className="field">
              <label htmlFor="new-account-notes">Notes</label>
              <textarea
                id="new-account-notes"
                onChange={e => this.props.EditProtoNotes(e.target.value)}
                value={this.props.prototypeNotes}
                rows="3"
              />
            </div>

            <div className="field">
              <label htmlFor="nxsaddress">Nexus Address</label>
              <input
                ref="addContactAddress"
                id="nxsaddress"
                type="text"
                onChange={e => this.props.EditProtoAddress(e.target.value)}
                value={this.props.prototypeAddress}
                placeholder="Nexus Address"
              />
            </div>

            <button
              className="button primary"
              onClick={() =>
                this.props.AddContact(
                  this.props.prototypeName,
                  this.props.prototypeAddress,
                  this.props.prototypePhoneNumber,
                  this.props.prototypeNotes,
                  this.props.prototypeTimezone
                )
              }
            >
              {index === -1 ? "Add Contact" : "Edit Contact"}
            </button>
            <button className="button" onClick={() => this.props.ToggleModal()}>
              Cancel
            </button>
          </div>
        );
        break;
      case "MY_ADDRESSES":
        return (
          <div>
            {this.props.myAccounts.map((acct, i) => {
              return (
                <div key={acct + i}>
                  <div>{acct.account === "" ? "My Account" : acct.account}</div>
                  {acct.addresses.map(address => {
                    return (
                      <div
                        key={address}
                        onClick={event => this.copyaddress(event)}
                        className="myAddress"
                      >
                        {address}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        );
        break;
      case "SET_CONTACT_PIC":
        return (
          <div>
            <h3>Set a Profile Picture</h3>
            <input type="file" />
          </div>
        );
        break;

      default:
        break;
    }
  }

  contactLister() {
    if (this.props.addressbook[0]) {
      return (
        <div id="contactList">
          {this.props.addressbook.map((contact, i) => {
            let addTotal = contact.mine.length + contact.notMine.length;
            return (
              <div
                key={i}
                onClick={() => this.props.SelectedContact(i)}
                className="contact"
              >
                <span className="contact-avatar">
                  <svg viewBox="0 0 100 100">
                    <text x="50" y="50" dy=".35em">
                      {this.getinitial(contact.name)}
                    </text>
                  </svg>
                </span>
                <span className="contact-name">{contact.name}</span>
                <span className="contactAddresses">
                  {addTotal} {addTotal > 1 ? " addresses" : " address"}
                </span>
              </div>
            );
          })}
        </div>
      );
    }
  }

  phoneFormatter() {
    return this.props.addressbook[this.props.selected].phoneNumber;
  }

  localTimeFormater() {
    let d = new Date();
    let utc = new Date().getTimezoneOffset();
    d.setMinutes(d.getMinutes() + utc);
    d.setMinutes(
      d.getMinutes() + this.props.addressbook[this.props.selected].timezone
    );

    let h = d.getHours();
    let m = d.getMinutes();
    let i = "AM";
    if (h >= 12) {
      i = "PM";
      h = h - 12;
    }
    if (h === 0) {
      h = "12";
    }
    if (m <= 9) {
      m = `0${m}`;
    }

    return (
      <div>
        Local Time: {h}:{m} {i}
      </div>
    );
  }

  theirAddressLister() {
    return (
      <div>
        <h3>Their addresses</h3>
        <div>
          {this.props.addressbook[this.props.selected].notMine.map((add, i) => {
            return (
              <div key={i + add.address}>
                <div> {add.label}:</div>
                <div onClick={event => this.copyaddress(event)}>
                  {add.address}
                </div>
                <div className="tooltip">Click to copy</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  myAddressLister() {
    return (
      <div>
        <h3>My addresses</h3>
        <div>
          {this.props.addressbook[this.props.selected].mine.map((add, i) => {
            console.log(add, i);
            return (
              <div key={i + add.address}>
                <div>{add.label}: </div>{" "}
                <div onClick={event => this.copyaddress(event)}>
                  {add.address}{" "}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  showAddContactModal() {
    this.props.SetModalType("ADD_CONTACT");
    this.props.ToggleModal();
  }

  showMyAddresses() {
    this.props.SetModalType("MY_ADDRESSES");
    this.props.ToggleModal();
  }

  contactPicHandler() {
    this.props.SetModalType("SET_CONTACT_PIC");
    this.props.ToggleModal();
  }

  render() {
    console.log(this.props);
    return (
      <div id="addressbook">
        <Modal
          open={this.props.modalVisable}
          center
          onClose={this.props.ToggleModal}
          classNames={{ modal: "modal" }}
        >
          {this.modalInternalBuilder()}
        </Modal>
        <h2>Address Book</h2>
        <a className="refresh" onClick={() => this.exportAddressBook()}>
          Export Contacts
        </a>
        <div className="panel">
          <div id="addressbook-controls">
            <div id="addressbook-search">
              {/* {this.props.addressbook.length > 0 && (
                <div>
                  <input type="text" />
                  <button id="searchContacts" />
                </div>
              )} */}
            </div>

            <button
              className="button ghost"
              onClick={() => this.showMyAddresses()}
            >
              My Addresses
            </button>
            <button
              className="button primary"
              onClick={() => this.showAddContactModal()}
            >
              Add Contact
            </button>
          </div>
          {this.props.addressbook.length > 0 ? (
            <div id="addressbookContent">
              <div id="contactListContainer">{this.contactLister()}</div>
              {this.props.addressbook[this.props.selected].mine && (
                <div id="contactDetailContainer">
                  <fieldset id="contactDetails">
                    <legend>
                      {this.props.addressbook[this.props.selected].name}
                    </legend>
                    <div id="contactInformation">
                      <div>
                        <div> Phone number: {this.phoneFormatter()} </div>
                        {this.localTimeFormater()}
                        <div
                          onClick={() => this.props.notesToggle()}
                          id="notesContainer"
                        >
                          Notes:
                          <div id="notes">
                            {this.props.addressbook[this.props.selected].notes}
                          </div>
                        </div>
                      </div>
                      {this.props.addressbook[this.props.selected].imgSrc !==
                      undefined ? (
                        <label htmlFor="picUploader">
                          <img
                            // onDoubleClick={() => this.contactPicHandler()}
                            src={
                              this.props.addressbook[this.props.selected].imgSrc
                            }
                          />
                        </label>
                      ) : (
                        <label htmlFor="picUploader">
                          <img
                            // onDoubleClick={() => this.contactPicHandler()}
                            src={profilePlaceholder}
                          />
                        </label>
                      )}

                      <input
                        type="file"
                        accept="image/*"
                        name="picUploader"
                        onChange={e =>
                          this.props.ChangeContactImage(
                            e.target.files[0].path,
                            this.props.selected
                          )
                        }
                        id="picUploader"
                        data-tooltip="The profile image for this contact"
                      />
                    </div>
                  </fieldset>
                  <div id="addressDisplay">
                    {this.props.addressbook[this.props.selected].mine.length > 0
                      ? this.myAddressLister()
                      : null}

                    {this.props.addressbook[this.props.selected].notMine
                      .length > 0
                      ? this.theirAddressLister()
                      : null}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <h1 style={{ alignSelf: "center" }}>Your addressbook is empty</h1>
          )}
        </div>
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Addressbook);
