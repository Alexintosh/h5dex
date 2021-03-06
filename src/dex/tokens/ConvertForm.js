import React from 'react'
import { Button, Icon, InputItem, List, NavBar, Toast, Popover } from 'antd-mobile'
import { Icon as WebIcon, Input, InputNumber } from 'antd'
import { connect } from 'dva'
import routeActions from 'common/utils/routeActions'
import { toBig, toHex, toNumber } from '../../common/loopringjs/src/common/formatter'
import Contracts from '../../common/loopringjs/src/ethereum/contracts/Contracts'
import TokenFormatter, { getBalanceBySymbol, isValidNumber } from '../../modules/tokens/TokenFm'
import config from '../../common/config'
import intl from 'react-intl-universal'
import storage from 'modules/storage'
import Worth from 'modules/settings/Worth'
import { signTx } from '../../common/utils/signUtils'
import ConvertHelperOfBalance from './ConvertHelperOfBalance'

const WETH = Contracts.WETH

class Convert extends React.Component {
  state = {
    token: 'ETH'
  }

  componentDidMount () {
    const {match} = this.props
    if (match && match.params && match.params.token) {
      this.setState({token: match.params.token})
    }
  }

  render () {
    const {dispatch, balance, amount, gas} = this.props
    const {token} = this.state
    const address = storage.wallet.getUnlockedAddress()
    const assets = getBalanceBySymbol({balances: balance.items, symbol: token, toUnit: true})
    const gasPrice = gas.tabSelected === 'estimate' ? gas.gasPrice.estimate : gas.gasPrice.current
    const gasLimit = token.toLowerCase() === 'eth' ? config.getGasLimitByType('deposit').gasLimit : config.getGasLimitByType('withdraw').gasLimit
    const tf = new TokenFormatter({symbol: token})
    const gasFee = toBig(gasPrice).times(gasLimit).div(1e9)
    const showLayer = (payload = {}) => {
      dispatch({
        type: 'layers/showLayer',
        payload: {
          ...payload
        }
      })
    }
    const hideLayer = (payload = {}) => {
      dispatch({
        type: 'layers/hideLayer',
        payload: {
          ...payload
        }
      })
    }
    const setGas = () => {
      showLayer({
        id: 'helperOfGas',
        gasLimit
      })
    }

    const setMax = () => {
      let max = assets.balance
      if (token === 'ETH') {
        max = toBig(assets.balance).minus(gasFee).minus(0.1).isPositive() ? toBig(assets.balance).minus(gasFee).minus(0.1) : toBig(0)
      }
      dispatch({type: 'convert/setMax', payload: {amount: max, amount1: max}})
    }
    const gotoConfirm = async () => {
      if (!isValidNumber(amount)) {
        Toast.info(intl.get('notifications.title.invalid_number'), 1, null, false)
        return
      }

      if ((token.toUpperCase() === 'ETH'&& toBig(amount).plus(gasFee).gt(assets.balance)) || (token.toUpperCase() === 'WETH' && toBig(amount).gt(assets.balance))) {
        Toast.info(intl.get('convert.not_enough_tip', {token}), 1, null, false)
        return
      }
      let data = ''
      let value = ''
      if (token.toLowerCase() === 'eth') {
        data = WETH.encodeInputs('deposit')
        value = toHex(tf.getDecimalsAmount(amount))
      } else {
        data = WETH.encodeInputs('withdraw', {wad: toHex(tf.getDecimalsAmount(amount))})
        value = '0x0'
      }
      const to = config.getTokenBySymbol('WETH').address
      const tx = {
        gasLimit,
        data,
        to,
        gasPrice: toHex(toBig(gasPrice).times(1e9)),
        chainId: config.getChainId(),
        value,
        nonce: toHex((await window.RELAY.account.getNonce(address)).result)
      }

      signTx(tx).then(res => {
        if (res.result) {
          window.ETH.sendRawTransaction(res.result).then(resp => {
            if (resp.result) {
              window.RELAY.account.notifyTransactionSubmitted({
                txHash: resp.result,
                rawTx: tx,
                from: address
              })
              Toast.success(intl.get('notifications.title.convert_suc'), 3, null, false)
              hideLayer({id: 'convertToken'})
              routeActions.gotoPath('/dex/todos');
            } else {
              Toast.fail(intl.get('notifications.title.convert_fail') + ':' + resp.error.message, 3, null, false)
            }
          })
        } else {
          Toast.fail(intl.get('notifications.title.convert_fail') + ':' + res.error.message, 3, null, false)
        }
      })
    }
    const amountChange = (value) => {
      dispatch({type: 'convert/amountChange', payload: {amount:value }})
    }
    const swap = () => {
      const {token} = this.state
      if (token.toLowerCase() === 'eth') {
        this.setState({token: 'WETH'})
      } else {
        this.setState({token: 'ETH'})
      }
    }
    const _this = this
    const fromToken = token
    const toToken = token.toLowerCase() === 'eth' ? 'WETH' : 'ETH'
    return (
      <div className="bg-white">
        <NavBar
          className="zb-b-b"
          mode="light"
          onLeftClick={() => routeActions.goBack()}
          leftContent={[
            <span key='1' className=""><Icon type="left"/></span>,
          ]}
          rightContent={[
            null && <Popover mask
                     overlayClassName="fortest"
                     overlayStyle={{ color: 'currentColor' }}
                     visible={this.state.visible}
                     overlay={[
                       (<Popover.Item key="4" value="scan" data-seed="logId">Scan</Popover.Item>),
                       (<Popover.Item key="5" value="special" style={{ whiteSpace: 'nowrap' }}>My Qrcode</Popover.Item>),
                       (<Popover.Item key="6" value="button ct">
                         <span style={{ marginRight: 5 }}>Help</span>
                       </Popover.Item>),
                     ]}
                     align={{
                       overflow: { adjustY: 0, adjustX: 0 },
                       offset: [-10, 0],
                     }}
                     onVisibleChange={this.handleVisibleChange}
                     onSelect={this.onSelect}
            >
              <WebIcon key="1" type="question-circle-o"/>
            </Popover>,
          ]}
        >
          {fromToken} → {toToken}
        </NavBar>
        <div className="zb-b-b">
          <div hidden={true} className="">
            <List>
              <InputItem
                type="text"
                onFocus={() => {alert('focused')}}
                ref={el => _this.inputRef = el}
              >
              </InputItem>
            </List>
            <div className="mt15">
              <Input className="d-block w-100"/>
            </div>
          </div>
          <div className="p15">
            <div className="row ml0 mr0 no-gutters align-items-stretch justify-content-center">
              <div className="col text-left">
                <div className="color-black-2 fs14">{fromToken}</div>
              </div>
              <div className="col-auto text-center" onClick={swap} style={{width: '44px'}}>
              </div>
              <div className="col text-right">
                <div className="color-black-2 fs14">{toToken}</div>
              </div>
            </div>
            <div className="zb-b row ml0 mr0 no-gutters align-items-stretch justify-content-center">
              <div className="col text-right no-border am-list-bg-none bg-grey-100">
                <List>
                  <InputItem
                    type="money"
                    onChange={amountChange}
                    value={amount}
                  >
                  </InputItem>
                </List>
              </div>
              <div className="col-auto text-center zb-b d-flex align-items-center justify-content-center" onClick={swap}
                   style={{width: '44px'}}>
                <WebIcon type="swap" className="fs20 text-primary"/>
              </div>
              <div className="col text-left no-border am-list-bg-none bg-grey-100">
                <List>
                  <InputItem
                    type="money"
                    value={amount}
                    disabled={true}
                  />
                </List>
              </div>
            </div>
            <div className="row ml0 mr0 pt20 pb20 no-gutters zb-b-b" onClick={setGas}>
              <div className="col">
                <div className="color-black-2 fs14 text-left">{intl.get('common.gas')}</div>
              </div>
              <div className="col-auto fs14 color-black-2">
                <Worth amount={gasFee} symbol='ETh'/> ≈ {toNumber(gasFee)} ETH
                <WebIcon className="ml5 text-primary" type="right"/>
              </div>
            </div>
            <Button className="mt20 b-block w-100" size="large" onClick={gotoConfirm} type="primary">
              {token.toLowerCase() === 'eth' ? intl.get('convert.convert_eth_title') : intl.get('convert.convert_weth_title')}
            </Button>
          </div>
          <div hidden className='mt20'>w
            <a onClick={setMax}>{intl.get('convert.actions_max')}</a>
          </div>
          <div className="bg-grey-100 mt15">
            <div className="divider zb-b-b 1px"></div>
            <ConvertHelperOfBalance dispatch={dispatch} token={{symbol:token,balance:assets.balance}} gasFee={gasFee}/>
          </div>
        </div>
      </div>
    )
  }
}

function mapStateToProps (state) {
  return {
    balance: state.sockets.balance,
    prices: state.sockets.marketcap.items,
    amount: state.convert.amount,
    gas: state.gas
  }
}

export default connect(mapStateToProps)(Convert)






