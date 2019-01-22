// External
import React, { Component } from 'react';
import { connect } from 'react-redux';

// Internal
import Text from 'components/Text';
import TextField from 'components/TextField';
import Icon from 'components/Icon';
import Tooltip from 'components/Tooltip';
import Modal from 'components/Modal';

// Images
import searchIcon from 'images/search.sprite.svg';

@connect(state => ({
  addressBook: state.addressbook.addressbook,
}))
class LookupAddressModal extends Component {
  state = {
    searchQuery: '',
  };

  handleSearchChange = e => {
    this.setState({ searchQuery: e.target.value });
  };

  addressBookToQueue = () => {
    let filteredAddress = this.props.addressBook.filter(
      e =>
        e.name.toLowerCase().indexOf(this.state.searchQuery.toLowerCase()) !==
        -1
    );

    return filteredAddress.map((e, i) => (
      <tr key={i}>
        <td className="contactNames" key={e.name + i}>
          {e.name}
        </td>
        {e.notMine.map((ele, i) => (
          <Tooltip.Trigger
            position="right"
            tooltip="Select recipient address"
            key={ele.address}
          >
            <td
              className="tda"
              onClick={() => {
                this.closeModal();
                this.props.updateRecipient(ele.address);
              }}
            >
              {ele.address}
            </td>
          </Tooltip.Trigger>
        ))}
      </tr>
    ));
  };

  render() {
    return (
      <Modal assignClose={close => (this.closeModal = close)}>
        <Modal.Header>
          <Text id="sendReceive.Lookup" />
        </Modal.Header>
        <Modal.Body style={{ paddingTop: '0px' }}>
          <table id="AddressTable">
            <thead>
              <tr>
                <th className="short-column">
                  <Text id="sendReceive.Name" />
                </th>
                <th className="long-column">
                  <Text id="sendReceive.Address" />
                  <span className="searchBar">
                    <Text id="sendReceive.Lookup">
                      {placeholder => (
                        <TextField
                          style={{
                            marginLeft: '1em',
                            fontSize: '.9375em',
                            width: 200,
                          }}
                          left={<Icon icon={searchIcon} spaceRight />}
                          placeholder={placeholder}
                          value={this.state.searchQuery}
                          onChange={this.handleSearchChange}
                        />
                      )}
                    </Text>
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {this.props.addressBook.length == 0 ? (
                <h1 style={{ alignSelf: 'center' }}>
                  <Text id="AddressBook.NoContacts" />
                </h1>
              ) : (
                this.addressBookToQueue()
              )}
            </tbody>
          </table>
        </Modal.Body>
      </Modal>
    );
  }
}
export default LookupAddressModal;
