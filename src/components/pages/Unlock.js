import React from 'react'
import Account from '../account';
import Layout from '../../layout';
import {Link, Redirect, Route, Switch} from 'dva/router'
import routeActions from 'common/utils/routeActions'
import { Containers } from 'modules'
import {connect} from 'dva'
import {getXPubKey as getTrezorPublicKey} from "LoopringJS/ethereum/trezor";
import {getXPubKey as getLedgerPublicKey,connect as connectLedger} from "LoopringJS/ethereum/ledger";
import {wallets} from "../../common/config/data";
import {trimAll} from "LoopringJS/common/utils";
import intl from 'react-intl-universal'


class Unlock extends React.Component {

  changeTab = (path) => {
    const {match} = this.props;
    const {url} = match;
    routeActions.gotoPath(`${url}/${path}`);
  };

  unlock =  (path,walletType) => {
    const {match,dispatch} = this.props;
    const {url} = match;
    dispatch({type:"hardwareWallet/setWalletType",payload:{walletType}});
    const wallet = wallets.find(wallet => trimAll(wallet.name).toLowerCase() === walletType.toLowerCase().concat('(eth)'));
    switch (walletType) {
      case 'trezor':
        getTrezorPublicKey(wallet.dpath).then(res => {
          if (!res.error) {
            const {chainCode, publicKey} = res.result;
            dispatch({type: "hardwareWallet/setKeyAndCode", payload: {chainCode, publicKey}});
          }
        });
        break;
      case 'ledger':
      connectLedger().then(res =>{
          if(!res.error){
            console.log(res.result);
            const ledger = res.result;
            getLedgerPublicKey(wallet.dpath,ledger).then(resp => {
              if(!resp.error){
                const {chainCode, publicKey} = resp.result;
                dispatch({type: "hardwareWallet/setKeyAndCode", payload: {chainCode, publicKey}});
              }
            });
          }
        });
        break;
    }
    routeActions.gotoPath(`${url}/${path}`);
  };

  render() {
    const {match} = this.props;
    const pathname = this.props.location && this.props.location.pathname
    const {url} = match;
    return (
      <Layout.LayoutHome className="h-full">
        <div className="body home">
          <div className="home-content d-flex align-items-center justify-content-center open">
            <div>
              <h1>Generate Wallet & Unlock Wallet</h1>
              <ul className="tab tab-card d-flex justify-content-center inup">
                <li className={`item ${pathname==='/unlock/generateWallet' ? 'active':''}`}>
                  <a data-toggle="tab" onClick={() => this.changeTab('generateWallet')}><i className="icon-plus"/>
                    <h4>{intl.get('wallet_type.generate')}</h4></a>
                </li>
                <li className={`item ${pathname==='/unlock/address' ? 'active':''}`}>
                  <a data-toggle="tab" onClick={() => this.changeTab('address')}><i className="icon-view"/><h4>{intl.get('wallet_type.address')}</h4>
                  </a>
                </li>
                <li className={`item ${pathname==='/unlock/metamask' ? 'active':''}`}>
                  <a data-toggle="tab"  onClick={() => this.changeTab('metamask')}><i className="icon-metamaskwallet"/><h4>{intl.get('wallet_type.metamask')}</h4></a>
                </li>
                <li className={`item ${pathname==='/unlock/trezor' ? 'active':''}`}>
                  <a onClick={() => this.unlock('trezor','trezor')}><i className="icon-trezorwallet"/><h4>{intl.get('wallet_type.trezor')}</h4></a>
                </li>
                <li className={`item ${pathname==='/unlock/ledger' ? 'active':''}`}>
                  <a  data-toggle="tab" onClick={() => this.unlock('ledger','ledger')}><i className="icon-ledgerwallet"/><h4>{intl.get('wallet_type.ledger')}</h4></a>
                </li>
                <li className={`item ${pathname==='/unlock/json' ? 'active':''}`}>
                  <a data-toggle="tab" onClick={() => this.changeTab('json')}><i className="icon-json"/><h4>{intl.get('wallet_type.json')}</h4>
                  </a>
                </li>
                <li className={`item ${pathname==='/unlock/mnemonic' ? 'active':''}`}>
                  <a data-toggle="tab" onClick={() => this.changeTab('mnemonic')}><i className="icon-mnemonic"/><h4>{intl.get('wallet_type.mnemonic')}</h4>
                  </a>
                </li>
                <li className={`item ${pathname==='/unlock/privateKey' ? 'active':''}`}>
                  <a data-toggle="tab" onClick={() => this.changeTab('privateKey')}><i className="icon-key"/><h4>{intl.get('wallet_type.private_key')}</h4>
                  </a>
                </li>
                <li className="item remove" id="inupRemove">
                  <a href="#"><i className="icon-remove"/></a>
                </li>
              </ul>
            </div>

            <Switch>
              <Route path={`${url}/generateWallet`} exact render={() =>
                <div className="tab-content">
                  <Containers.Wallet>
                  <Account.GenerateWallet/>
                  </Containers.Wallet>
                </div>}
              />
              <Route path={`${url}/json`} exact render={() =>
                <div className="tab-content">
                  <Containers.Keystore>
                   <Account.UnlockByKeystore/>
                  </Containers.Keystore>
                </div>}
              />
              <Route path={`${url}/mnemonic`} exact render={() =>
                <div className="tab-content">
                  <Containers.Mnemonic>
                  <Account.UnlockByMnemonic/>
                  </Containers.Mnemonic>
                </div>}
              />
              <Route path={`${url}/privateKey`} exact render={() =>
                <div className="tab-content">
                  <Account.UnlockByPrivateKey/>
                </div>}
              />
              <Route path={`${url}/trezor`} exact render={() =>
                <div className="tab-content">
                  <Containers.HardwareWallet>
                    <Account.UnlockByTrezor/>
                  </Containers.HardwareWallet>
                </div>}
              />
              <Route path={`${url}/ledger`} exact render={() =>
                <div className="tab-content">
                  <Containers.HardwareWallet>
                    <Account.UnlockByLedger/>
                  </Containers.HardwareWallet>
                </div>}
              />
              <Route path={`${url}/metamask`} exact render={() =>
                <div className="tab-content">
                  <Containers.MetaMask>
                    <Account.UnlockByMetaMask/>
                  </Containers.MetaMask>
                </div>}
              />
              <Route path={`${url}/backup`} exact render={() =>
                <div className="tab-content">
                  <Containers.Backup>
                  <Account.BackupWallet/>
                  </Containers.Backup>
                </div>}
              />
              <Route path={`${url}/determineWallet`} exact render={() =>
              <div className="tab-content">
                <Containers.DetermineWallet>
                  <Account.DetermineWallet/>
                </Containers.DetermineWallet>
              </div>}
              />
              <Route path={`${url}/address`} exact render={() =>
                <div className="tab-content">
                  <Account.UnlockByAddress/>
                </div>}
              />
              <Redirect path={`${match.url}/`} to={`${match.url}/generateWallet`}/>
            </Switch>
          </div>
        </div>
        <div className="overlay" data-overlay="54"></div>
      </Layout.LayoutHome>
    )
  }
}

export default connect()(Unlock)
