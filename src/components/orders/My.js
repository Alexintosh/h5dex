import React from 'react';
import { List, InputItem,Button,WingBlank,Slider, Tabs, WhiteSpace, Badge,SegmentedControl, NavBar, Icon,Modal,Switch,Grid } from 'antd-mobile';
import { Icon as WebIcon,Switch as WebSwitch } from 'antd';
import { createForm } from 'rc-form';
import { connect } from 'dva';
import PlaceOrderPreview from './PlaceOrderPreview';
import PlaceOrderAdvance from './PlaceOrderAdvance';
import PlaceOrderPriceHelper from './PlaceOrderPriceHelper';
import PlaceOrderAmountHelper from './PlaceOrderAmountHelper';
import {FillList} from './PlaceOrderAmountHelper';
import Containers from 'modules/containers';
import UiContainers from 'LoopringUI/containers'
const Item = List.Item;
const Brief = Item.Brief;

class PlaceOrder extends React.Component {
  state = {
    type: 'money',
    side: 'buy',
  }
  render() {
    const dispatch = this.props.dispatch
    const showLayer = (payload={})=>{
      dispatch({
        type:'layers/showLayer',
        payload:{
          ...payload
        }
      })
    }
    const hideLayer = (payload={})=>{
      dispatch({
        type:'layers/hideLayer',
        payload:{
          ...payload
        }
      })
    }
    const gotoConfirm= ()=>{

    }
    const showPriceHelper= ()=>{
      showLayer({id:'placeOrderPriceHelper'})
    }
    const { getFieldProps } = this.props.form;
    const { type } = this.state;


    const {side} = this.state
    const tabChange = (side)=>{
      this.setState({
        side
      })
    }
    const gotoTrade = ()=>{

    }
    const data = [
      {
        icon: <i className="fs24 color-black-1 loopring-icon loopring-icon-transfer"></i>,
        text: `Send`,
      },
      {
        icon: <i className="fs24 color-black-1 loopring-icon loopring-icon-receive"></i>,
        text: `Receive`,
      },
      {
        icon: <i className="fs24 color-black-1 loopring-icon loopring-icon-convert"></i>,
        text: `Convert`,
      },
      {
        icon: <i className="fs24 color-black-1 loopring-icon loopring-icon-trade"></i>,
        text: `Trade`,
      },
      {
        icon: <i className="fs24 color-black-1 loopring-icon loopring-icon-success"></i>,
        text: `Enable`,
      },
    ]

    return (
      <div className="bg-grey-100">
        <NavBar
          className=""
          mode="light"
          onLeftClick={() => console.log('onLeftClick')}
          leftContent={[
            <span className="color-black-1"><WebIcon key="1" type="bars" /></span>,
          ]}
          rightContent={[
            <span className="color-black-1 " onClick={gotoTrade}><WebIcon key="1" type="setting" /></span>
          ]}
        >
        My Dex
        </NavBar>
        <div className="d-flex align-items-center bg-grey-900" style={{height:'125px'}}>
          <div className="pl15">
            <div className="text-left color-white-1 fs18" style={{width:'240px',wordBreak:'break-all'}}>0xeba7136a36da0f5e16c6bdbc739c716bb5b65a00</div>
            <div className="text-left fs16 color-white-2">Current Address</div>
          </div>
        </div>
        <Grid className="my-dex-grid" data={data} square={true} activeStyle={false} columnNum={5} />
        <div className="no-underline">
          <Tabs
            tabs={
              [
                { title: <Badge className="text-center d-block w-100 pl10">Open Orders</Badge> },
                { title: <Badge className="text-center d-block w-100  pr10">Filled Orders</Badge> },
                { title: <Badge count={2} className="text-center d-block w-100 pl10">History Orders</Badge> },
              ]
            }
            tabBarBackgroundColor="#fff"
            tabBarActiveTextColor={"#000"}
            tabBarInactiveTextColor={"#999"}
            initialPage={0}
            swipeable={false}
            onChange={(tab, index) => { console.log('onChange', index, tab); }}
            onTabClick={(tab, index) => { console.log('onTabClick', index, tab); }}
          >
            <div>
              <OrderList />
            </div>
            <div>
              <FillList />
            </div>
            <div className="bg-grey-100">
              <TokenList />
            </div>
          </Tabs>
        </div>
        <Containers.Layers id="placeOrderPreview">
          <UiContainers.Popups id="placeOrderPreview">
            <PlaceOrderPreview />
          </UiContainers.Popups>
        </Containers.Layers>
        <Containers.Layers id="placeOrderAdvance">
          <UiContainers.Popups id="placeOrderAdvance">
            <PlaceOrderAdvance />
          </UiContainers.Popups>
        </Containers.Layers>
        <Containers.Layers id="placeOrderPriceHelper">
          <UiContainers.Popups id="placeOrderPriceHelper">
            <PlaceOrderPriceHelper />
          </UiContainers.Popups>
        </Containers.Layers>
        <Containers.Layers id="placeOrderAmountHelper">
          <UiContainers.Popups id="placeOrderAmountHelper">
            <PlaceOrderAmountHelper />
          </UiContainers.Popups>
        </Containers.Layers>
      </div>
    );
  }
}

const PlaceOrderForm = createForm()(connect(({layers})=>({layers}))(PlaceOrder))
export default PlaceOrderForm


export const TokenNotEnough = ()=>{
  return (
    <div className="">
      哈哈哈哈哈
    </div>
  )
}
const TokenListComp = (props)=>{
  const {dispatch} = props
  const showLayer = (payload={})=>{
    dispatch({
      type:'layers/showLayer',
      payload:{
        ...payload
      }
    })
  }
  const tokens = [
    {
      symbol:"LRC",
      balance:12680.0001,
      required:15000.0001,
    },
    {
      symbol:"WETH",
      balance:21.3652,
      required:20.1278,
    },
    {
      symbol:"ETH",
      balance:85.0001,
      required:0.0001,
    },
  ]
  return (
    <div className="fs20">
      <table className="w-100 fs16">
        <thead>
          <tr className="">
            <th className="text-left zb-b-b pl10 pr10 pt5 pb5 font-weight-normal color-black-3">Token</th>
            <th className="text-right zb-b-b pl10 pr10 pt5 pb5 font-weight-normal color-black-3">Balance</th>
            <th className="text-right zb-b-b pl10 pr10 pt5 pb5 font-weight-normal color-black-3">Selling</th>
            <th className="text-right zb-b-b pl10 pr10 pt5 pb5 font-weight-normal color-black-3">Lack</th>
            <th hidden className="text-right zb-b-b pl10 pr10 pt5 pb5 font-weight-normal color-black-3">Enough</th>
          </tr>
        </thead>
        <tbody>
            {
              tokens.map((token,index)=>
                <tr key={index} onClick={showLayer.bind(this,{id:'tokenNotEnough'})}>
                  <td className="pl10 pr10 pt10 pb10 zb-b-b color-black-2 text-left">{token.symbol}</td>
                  <td className="pl10 pr10 pt10 pb10 zb-b-b color-black-2 text-right">{token.balance}</td>
                  <td className="pl10 pr10 pt10 pb10 zb-b-b color-black-2 text-right">{token.required}</td>
                  <td className="pl10 pr10 pt10 pb10 zb-b-b color-black-2 text-right">{
                      Number(token.balance - token.required).toFixed(4)>0 ? '0.0000' :
                      <span className="color-red-500">
                        <WebIcon type="exclamation-circle mr5" />
                        {Number(token.required - token.balance).toFixed(4)}
                      </span>
                    }
                  </td>
                </tr>
              )
            }
        </tbody>
      </table>
      <Containers.Layers id="tokenNotEnough">
        <UiContainers.Popups id="tokenNotEnough">
          <TokenNotEnough />
        </UiContainers.Popups>
      </Containers.Layers>
    </div>
  )
}
export const TokenList = connect()(TokenListComp)

export const OrderList = ()=>{
  return (
    <table className="w-100 fs16">
      <thead>
        <tr>
          <th className="text-center pl10 pr10 pt5 pb5 font-weight-normal color-black-3 zb-b-b">Side</th>
          <th className="text-right pl10 pr10 pt5 pb5 font-weight-normal color-black-3 zb-b-b">Price</th>
          <th className="text-right pl10 pr10 pt5 pb5 font-weight-normal color-black-3 zb-b-b">Amount</th>
          <th className="text-right pl10 pr10 pt5 pb5 font-weight-normal color-black-3 zb-b-b">Filled</th>
          <th className="text-center pl10 pr10 pt5 pb5 font-weight-normal color-black-3 zb-b-b">Status</th>
        </tr>
      </thead>
      <tbody>
        {
          [1,2,3,4,5].map((item,index)=>
            <tr key={index} className="color-black-2">
              { index%2 == 0 && <td className="zb-b-b p10 text-center color-green-500">Buy</td> }
              { index%2 == 1 && <td className="zb-b-b p10 text-center color-red-500">Sell</td> }
              <td className="zb-b-b p10 text-right">0.00095</td>
              <td className="zb-b-b p10 text-right">1000.00</td>
              <td className="zb-b-b p10 text-right">80%</td>
              <td className="zb-b-b p10 text-center">
              { index === 0 && <WebIcon className="zb-b-b color-red-500" type="exclamation-circle" /> }
              { index === 1 && <WebIcon className="zb-b-b color-blue-500" type="clock-circle" /> }
              { index === 2 && <WebIcon className="zb-b-b color-green-500" type="check-circle" /> }
              { index === 3 && <WebIcon className="zb-b-b color-grey-300" type="close-circle" /> }
              { index === 4 && <WebIcon className="zb-b-b color-green-500" type="check-circle" /> }
              </td>
            </tr>
          )
        }
      </tbody>
    </table>
  )
}



