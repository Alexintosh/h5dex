import React from 'react';
import {Form, Select, Spin,Button,Icon,Tooltip} from 'antd';
import intl from 'react-intl-universal';
import {TxFm, getTypes} from 'modules/transactions/formatters';
import {getShortAddress} from 'modules/formatter/common';
import {connect} from "dva";
import config from '../../common/config'
import {toHex,toNumber,toBig} from "LoopringJS/common/formatter";
import Notification from '../../common/loopringui/components/Notification'


const Option = Select.Option;

 function ListTransaction(props) {
  const {transaction: list,gasPrice} = props
  const statusChange = (value) => {
    list.filtersChange({filters:{status: value}})
  }
  const typeChange = (value) => {
    list.filtersChange({filters: {type: value}})
  }
  const resendTx  = async (item)  => {
    window.RELAY.account.getPendingRawTxByHash(item.txHash).then(async (res) => {
      if (!res.error) {
        const tx = res.result;
        tx.gasPrice = toHex(toBig(gasPrice).times(1e9));
        tx.data = tx.input;
        tx.gasLimit = tx.gas;
        tx.chainId = config.getChainId();
        const account = props.account || window.account;
        const signedTx = await account.signEthereumTx(tx);
        window.ETH.sendRawTransaction(signedTx).then((response) => {
          if (!response.error) {
            Notification.open({message: intl.get("txs.resend_success"), type: "success", description:(<Button className="alert-btn mr5" onClick={() => window.open(`https://etherscan.io/tx/${response.result}`,'_blank')}> {intl.get('token.transfer_result_etherscan')}</Button> )});
            window.RELAY.account.notifyTransactionSubmitted({txHash: response.result, rawTx:tx, from: window.WALLET.address});
          } else {
            Notification.open({message: intl.get("txs.resend_failed"), type: "error", description:response.error.message})
          }
        })
      } else {
        Notification.open({
          type: 'error',
          message: intl.get('txs.can_not_resend'),
          description: intl.get('txs.not_detail')
        });
      }
    })
  };

  const cancelTx = async (item) => {
      const tx = {
        to:window.WALLET.address,
        value:"0x0",
        data:'0x',
        chainId:config.getChainId(),
        gasLimit:'0x5208',
        gasPrice:toHex(toBig(gasPrice).times(1e9)),
        nonce:toHex(toNumber(item.nonce))
      };

    const account = props.account || window.account;
    const signedTx = await account.signEthereumTx(tx);

    window.ETH.sendRawTransaction(signedTx).then((response) => {
      if (!response.error) {
        Notification.open({message: 'Canceling', type: "success", description:(<Button className="alert-btn mr5" onClick={() => window.open(`https://etherscan.io/tx/${response.result}`,'_blank')}> {intl.get('token.transfer_result_etherscan')}</Button> )});
        window.RELAY.account.notifyTransactionSubmitted({txHash: response.result, rawTx:tx, from: window.WALLET.address});
      } else {
        Notification.open({message: 'Failed to canceling', type: "error", description:response.error.message})
      }
    })
  };

  const token = list.filters.token || 'LRC';
  const types = getTypes(token)
  return (
    <div>
      <div className="card-header bordered">
        <h4>{intl.get('tx.title')}</h4>
        <div className="form-inline form-dark">
                <span>
                  <Select
                    defaultValue=""
                    onChange={statusChange}
                    placeholder={intl.get('tx.status')}
                    dropdownMatchSelectWidth={false}
                    className="form-inline form-inverse"
                  >
                    <Select.Option value="">{intl.get('tx_status.all')}</Select.Option>
                    <Select.Option value="pending">{intl.get('tx_status.pending')}</Select.Option>
                    <Select.Option value="success">{intl.get('tx_status.success')}</Select.Option>
                    <Select.Option value="failed">{intl.get('tx_status.failed')}</Select.Option>
                  </Select>
                </span>
          <span>
                  <Select
                    defaultValue=""
                    onChange={typeChange}
                    placeholder={intl.get('txs.type')}
                    dropdownMatchSelectWidth={false}
                    className="form-inline form-inverse"
                  >
                    {
                      types.map((item, index) =>
                        <Select.Option value={item.value} key={index}>{item.label}</Select.Option>
                      )
                    }
                  </Select>
                </span>
        </div>
      </div>
      <div style={{height: "100%", overflow: "hidden", padding: "0 0 60px"}}>
        <div className="content-scroll">
          <Spin spinning={list.loading}>
            <table className="table table-hover table-striped table-dark text-center">
              <thead>
              <tr>
                <th className="text-left">{intl.get('tx.type')}</th>
                <th className="text-left">{intl.get('tx.gas')}</th>
                <th className="text-left">{intl.get('tx.block')}</th>
                <th className="text-left">{intl.get('tx.nonce')}</th>
                <th className="text-left">{intl.get('tx.txHash')}</th>
                <th className="text-left">{intl.get('tx.created')}</th>
                <th className="text-left">{intl.get('tx.status')}</th>
              </tr>
              </thead>
              <tbody>
              {
                list.items.map((item, index) => {
                  const txFm = new TxFm(item);
                  const actions = {
                    gotoDetail: () => props.dispatch({type: 'layers/showLayer', payload: {id: 'txDetail', tx: item}}),
                    toResend:() => resendTx(item),
                    toCancel: () => cancelTx(item)
                  };
                  return (
                    <tr key={index} className="cursor-pointer" onClick={actions.gotoDetail}>
                      <td className="text-left">{renders.type(txFm)}</td>
                      <td className="text-left">{renders.gas(txFm)}</td>
                      <td className="text-left">{item.blockNumber}</td>
                      <td className="text-left">{item.nonce}</td>
                      <td className="text-left">{renders.txHash(txFm, actions)}</td>
                      <td className="text-left">{renders.createTime(txFm)}</td>
                      <td className="text-left">{renders.status(txFm,actions,index)}</td>
                    </tr>
                  )
                })
              }
              {list.items.length === 0 &&
              <tr>
                <td colSpan="100" className="text-center">{intl.get('common.list.no_data')}</td>
              </tr>
              }
              </tbody>
            </table>
          </Spin>
        </div>
      </div>
    </div>
  )
}
export const renders = {
  createTime: (fm) => (
    <div>{fm.getCreateTime()}</div>
  ),
  txHash: (fm, actions) => (
    <span
      onCopy={null}
      onClick={null}
    >
      <span className="" onClick={actions && actions.gotoDetail}>{getShortAddress(fm.tx.txHash)}</span>
    </span>
  ),
  type: (fm) => {
    const side = fm.getSide()
    return (
      <div>
        {fm.getType((side === 'in' || side === 'out') && fm.getValue())}
        {null && side && side.toLowerCase() === 'in' &&
          <span className='text-success ml5 fs12'><Icon type="plus-circle-o"/></span>
        }
        {null && side && side.toLowerCase() === 'out' &&
          <span className='text-error ml5 fs12'><Icon type="minus-circle-o"/></span>
        }
      </div>
    )
  },
  gas: (fm) => {
    const type = fm.tx.type
    return (
      <div>
        {fm.getGas()} ETH
        {(type === 'sell' || type === 'buy' || type === 'lrc_fee' || type === 'lrc_reward') &&
          <span className={`color-white-3 d-inline-block ml5`}>
            (Miner Paid)
          </span>
        }
      </div>
    )
  },
  status: (fm,actions,index) => {
    return (
      <div>
        {fm.tx.status === 'success' && <i className="icon-success"></i>}
        {fm.tx.status === 'failed' && <i className="icon-warning"></i>}
        {fm.tx.status === 'pending' && <i className="icon-clock"></i>}
        {fm.tx.status === 'pending' &&
          <span>
            <span className="text-primary ml10" onClick={(e) => {e.stopPropagation();actions.toResend()}}>{intl.get('actions.resend')}</span>
            <span className="text-primary ml5" onClick={(e) => {e.stopPropagation();actions.toCancel()}}>{intl.get('common.cancel')}</span>
          </span>
        }
      </div>
    )
  },
}

function mapStateToProps(state) {
   return {
     gasPrice:state.gas.gasPrice.estimate,
     account:state.wallet.account
   }
}

export default connect(mapStateToProps)(ListTransaction)

