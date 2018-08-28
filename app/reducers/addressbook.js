import * as TYPE from "../actions/actiontypes";

const initialState = {
  addressbook: [],
  modalType: "",
  prototypeName: "",
  prototypeAddress: "",
  prototypeNotes: "",
  prototypeTimezone: 0,
  prototypePhoneNumber: "",
  selected: 0,
  save: false,
  myAccounts: []
};

export default (state = initialState, action) => {
  switch (action.type) {
    // dispatch 1
    case TYPE.ADD_NEW_CONTACT:
      let index = state.addressbook.findIndex(ele => {
        if (ele.name === action.payload.name) {
          return ele;
        }
      });

      if (index === -1) {
        let updatedAddressbook = [
          ...state.addressbook,
          {
            name: action.payload.name,
            mine: action.payload.mine,
            notMine: action.payload.notMine,
            notes: action.payload.notes,
            timezone: action.payload.timezone,
            phoneNumber: action.payload.phoneNumber
          }
        ];
        updatedAddressbook.sort((a, b) => {
          let nameA = a.name.toUpperCase();
          let nameB = b.name.toUpperCase();
          if (nameA < nameB) {
            return -1;
          }
          if (nameA > nameB) {
            return 1;
          }
          return 0;
        });
        return {
          // new contact
          ...state,
          addressbook: updatedAddressbook,
          save: true
        };
      } else if (action.payload.mine[0]) {
        if (
          state.addressbook[index].mine.findIndex(ele => {
            if (ele.address === action.payload.mine[0].address) {
              return ele;
            }
          }) === -1
        ) {
          console.log(action.payload.mine);
          let updatedContact = {
            ...state.addressbook[index],
            mine: [...state.addressbook[index].mine, action.payload.mine[0]],
            notes: action.payload.notes,
            timezone: action.payload.timezone,
            phoneNumber: action.payload.phoneNumber
          };
          let updatedAddressbook = state.addressbook;
          updatedAddressbook.splice(index, 1, updatedContact);
          return {
            // not new adding mine address
            ...state,
            addressbook: updatedAddressbook,
            save: true
          };
        } else {
          let updatedContact = {
            ...state.addressbook[index],
            notes: action.payload.notes,
            timezone: action.payload.timezone,
            phoneNumber: action.payload.phoneNumber
          };
          let updatedAddressbook = state.addressbook;
          updatedAddressbook.splice(index, 1, updatedContact);
          return {
            ...state,
            addressbook: updatedAddressbook,
            save: true
          };
        }
      } else if (
        state.addressbook[index].notMine.findIndex(ele => {
          if (ele.address === action.payload.notMine[0].address) {
            return ele;
          }
        }) === -1
      ) {
        let updatedContact = {
          ...state.addressbook[index],
          notMine: [
            ...state.addressbook[index].notMine,
            action.payload.notMine[0]
          ],
          notes: action.payload.notes,
          timezone: action.payload.timezone,
          phoneNumber: action.payload.phoneNumber
        };
        let updatedAddressbook = state.addressbook;
        updatedAddressbook.splice(index, 1, updatedContact);
        return {
          ...state,
          addressbook: updatedAddressbook,
          save: true
        };
      } else {
        let updatedContact = {
          ...state.addressbook[index],
          notes: action.payload.notes,
          timezone: action.payload.timezone,
          phoneNumber: action.payload.phoneNumber
        };
        let updatedAddressbook = state.addressbook;
        updatedAddressbook.splice(index, 1, updatedContact);
        return {
          ...state,
          addressbook: updatedAddressbook,
          save: true
        };
      }
      break;
    case TYPE.CONTACT_IMAGE:
      let updatedContact = {
        ...state.addressbook[action.payload.contact],
        imgSrc: action.payload.path
      };
      let updatedAddressbook = state.addressbook;
      updatedAddressbook.splice(action.payload.contact, 1, updatedContact);
      return {
        ...state,
        addressbook: updatedAddressbook
      };
    case TYPE.MY_ACCOUNTS_LIST:
      return {
        ...state,
        myAccounts: action.payload
      };
      break;
    case TYPE.SET_MODAL_TYPE:
      return {
        ...state,
        modalType: action.payload
      };
      break;
    case TYPE.CLEAR_PROTOTYPE:
      return {
        ...state,
        prototypeName: "",
        prototypeAddress: "",
        prototypeNotes: "",
        prototypeTimezone: 0,
        prototypePhoneNumber: ""
      };
      break;
    // dispatch 2
    case TYPE.EDIT_ADDRESS:
      return {
        ...state,
        prototypeAddress: action.payload
      };
      break;
    // dispatch 3
    case TYPE.EDIT_PHONE:
      return {
        ...state,
        prototypePhoneNumber: action.payload
      };
      break;
    // dispatch 4
    case TYPE.EDIT_NOTES:
      return {
        ...state,
        prototypeNotes: action.payload
      };
      break;
    // Not MVP
    //   dispatch 5
    case TYPE.EDIT_NAME:
      return {
        ...state,
        prototypeName: action.payload
      };
      break;

    // //   dispatch 6 - like dispatch 2
    // case TYPE.EDIT_ADDRESS_LABEL:
    //     let index = state.addressbook.[action.payload.contact].thaddresses.findIndex((thaddelem)=> { thaddelem.address === action.payload.address})
    //     return {
    //         ...state,
    //         addressbook: { ...state.addressbook,
    //             [action.payload.contact]: {
    //                 ...state[action.payload.contact],
    //                 thaddresses: [...state.addressbook.[action.payload.contact].thaddresses,
    //                 state.addressbook.[action.payload.contact].thaddresses[index]:   {
    //                     ...state.addressbook.[action.payload.contact].thaddresses[index],
    //                         label: action.payload.label
    //                     }
    //                 ]
    //             }
    //         }
    //     };
    //   break;
    //   dispatch 7
    case TYPE.EDIT_TIMEZONE:
      return {
        ...state,
        prototypeTimezone: action.payload
      };
      break;
    case TYPE.SET_SAVE_FLAG_FALSE:
      return {
        ...state,
        save: false
      };
      break;
    // //   dispatch 8
    // case TYPE.DELETE_CONTACT:
    //     let temp = state.addressbook;
    //     delete temp[action.payload.contact]
    //     return {
    //         ...state,
    //         addressbook: temp
    //     };
    //   break;
    // //   dispatch 9
    // case TYPE.DELETE_ADDRESS_FROM_CONTACT:
    //     let index = state.addressbook.[action.payload.contact].thaddresses.findIndex((thaddelem)=> { thaddelem.label === action.payload.label})
    //     let temp = state.addressbook;
    //     delete temp.[action.payload.contact].thaddresses[index];
    //     return {
    //         ...state,
    //         addressbook: temp
    //     };
    //     break;
    // //   dispatch 10
    case TYPE.LOAD_ADDRESS_BOOK:
      // Could wire up the json reducer
      return {
        ...state,
        addressbook: [...action.payload]
      };
      break;
    case TYPE.SELECTED_CONTACT:
      return {
        ...state,
        selected: action.payload
      };
    default:
      return state;
      break;
  }
};
