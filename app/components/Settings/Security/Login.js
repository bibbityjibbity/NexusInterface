// External Dependencies
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router';
import styled from '@emotion/styled';

// Internal Dependencies
import styles from './style.css';
import * as TYPE from 'actions/actiontypes';
import * as RPC from 'scripts/rpc';
import FormField from 'components/common/FormField';
import TextField from 'components/common/TextField';
import Button from 'components/common/Button';
import FieldSet from 'components/common/FieldSet';

const LoginFieldSet = styled(FieldSet)({
  maxWidth: 400,
  margin: '0 auto',
});

const Buttons = styled.div({
  display: 'flex',
  justifyContent: 'flex-end',
  marginTop: '1.5em',
});

// React-Redux mandatory methods
const mapStateToProps = state => {
  return {
    ...state.common,
    ...state.login,
  };
};
const mapDispatchToProps = dispatch => ({
  setDate: date => dispatch({ type: TYPE.SET_DATE, payload: date }),
  setErrorMessage: message =>
    dispatch({ type: TYPE.SET_ERROR_MESSAGE, payload: message }),
  wipe: () => dispatch({ type: TYPE.WIPE_LOGIN_INFO }),
  busy: setting => dispatch({ type: TYPE.TOGGLE_BUSY_FLAG, payload: setting }),
  stake: () => dispatch({ type: TYPE.TOGGLE_STAKING_FLAG }),
  getInfo: payload => dispatch({ type: TYPE.GET_INFO_DUMP, payload: payload }),
  setTime: time => dispatch({ type: TYPE.SET_TIME, payload: time }),
  OpenModal: type => {
    dispatch({ type: TYPE.SHOW_MODAL, payload: type });
  },
  CloseModal: () => dispatch({ type: TYPE.HIDE_MODAL }),
  OpenErrorModal: type => {
    dispatch({ type: TYPE.SHOW_ERROR_MODAL, payload: type });
  },
  CloseErrorModal: type => {
    dispatch({ type: TYPE.HIDE_ERROR_MODAL, payload: type });
  },
});

class Login extends Component {
  getMinDate() {
    const today = new Date();

    let month = today.getMonth() + 1;
    if (month < 10) {
      month = '0' + month;
    }

    return `${today.getFullYear()}-${month}-${today.getDate()}`;
  }

  handleSubmit() {
    let today = new Date();
    let unlockDate = new Date(this.props.unlockUntillDate);
    unlockDate = new Date(unlockDate.setMinutes(today.getTimezoneOffset()));
    unlockDate = new Date(
      unlockDate.setHours(this.props.unlockUntillTime.slice(0, 2))
    );
    unlockDate = new Date(
      unlockDate.setMinutes(this.props.unlockUntillTime.slice(3))
    );
    const pass = document.getElementById('pass');

    let unlockUntill = Math.round(
      (unlockDate.getTime() - today.getTime()) / 1000
    );

    // this.props.busy(true);

    if (this.props.stakingFlag) {
      RPC.PROMISE('walletpassphrase', [pass.value, unlockUntill, true])
        .then(payload => {
          this.props.wipe();
          RPC.PROMISE('getinfo', [])
            .then(payload => {
              delete payload.timestamp;
              return payload;
            })
            .then(payload => {
              this.props.busy(false);
              this.props.getInfo(payload);
            });
        })
        .catch(e => {
          pass.value = '';
          if (e === 'Error: The wallet passphrase entered was incorrect.') {
            this.props.busy(false);
            this.props.OpenErrorModal('Incorrect Passsword');
            pass.focus();
          } else if (e === 'value is type null, expected int') {
            this.props.busy(false);
            this.props.OpenModal('FutureDate');
            pass.focus();
          } else {
            this.props.OpenErrorModal(e);
          }
        });
    } else {
      if (unlockUntill !== NaN && unlockUntill > 3600) {
        RPC.PROMISE('walletpassphrase', [pass.value, unlockUntill, false])
          .then(payload => {
            this.props.wipe();
            RPC.PROMISE('getinfo', [])
              .then(payload => {
                delete payload.timestamp;
                return payload;
              })
              .then(payload => {
                this.props.busy(false);
                this.props.getInfo(payload);
              });
          })
          .catch(e => {
            pass.value = '';
            if (e === 'Error: The wallet passphrase entered was incorrect.') {
              this.props.busy(false);
              this.props.OpenErrorModal('Incorrect Passsword');
              pass.focus();
            } else if (e === 'value is type null, expected int') {
              this.props.busy(false);
              this.props.OpenModal('FutureDate');
              pass.focus();
            } else {
              this.props.OpenErrorModal(e);
            }
          });
      } else {
        this.props.OpenModal('FutureDate');
      }
    }
  }
  setUnlockDate(input) {
    let today = new Date();
    let inputDate = new Date(input);
    inputDate = new Date(inputDate.setMinutes(today.getTimezoneOffset()));
    this.props.setDate(input);
  }

  // Mandatory React method
  render() {
    if (this.props.loggedIn) {
      return (
        <Redirect to={this.props.match.path.replace('/Login', '/Security')} />
      );
    }
    return (
      <div>
        <form>
          <LoginFieldSet legend="Login">
            <FormField connectLabel label="Unlock Until Date">
              <TextField
                type="date"
                min={this.getMinDate()}
                value={this.props.unlockUntillDate}
                onChange={e => this.setUnlockDate(e.target.value)}
                required
                hint="Unlock until date is required."
              />
            </FormField>
            <FormField connectLabel label="Unlock Until Time">
              <TextField
                type="time"
                value={this.props.unlockUntillTime}
                onChange={e => this.props.setTime(e.target.value)}
                required
                hint="Unlock until time is required."
              />
            </FormField>
            <FormField connectLabel label="Password">
              <TextField
                type="password"
                placeholder="Password"
                id="pass"
                required
              />
            </FormField>

            {/* STAKING FLAG STUFF  TURNED OFF UNTILL WE HAVE A FLAG COMING BACK FROM THE DAEMON TELLING US THAT ITS UNLOCKED FOR STAKING ONLY */}
            <FormField inline connectLabel label="Staking Only">
              <input
                type="checkbox"
                className="switch"
                value={this.props.stakingFlag}
                onChange={() => this.props.stake()}
              />
            </FormField>

            <Buttons>
              <Button
                skin="primary"
                type="submit"
                onClick={e => {
                  e.preventDefault();
                  this.handleSubmit();
                }}
              >
                Unlock Wallet
              </Button>
            </Buttons>
          </LoginFieldSet>
        </form>
      </div>
    );
  }
}

// Mandatory React-Redux method
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Login);
