import React from 'react';
import { List, InputItem,Button,WingBlank,Slider, Tabs, WhiteSpace, Badge,SegmentedControl, NavBar, Icon,Modal,Switch } from 'antd-mobile';
import { Icon as WebIcon,Switch as WebSwitch } from 'antd';
import { createForm } from 'rc-form';
import PlaceOrerConfirm from './PlaceOrderConfirm';
const Item = List.Item;
const Brief = Item.Brief;

const tabs = [
  { title: <Badge >My Tokens</Badge> },
  { title: <Badge >My Orders</Badge> },
  { title: <Badge >My Fills</Badge> },
];

// 通过自定义 moneyKeyboardWrapProps 修复虚拟键盘滚动穿透问题
// https://github.com/ant-design/ant-design-mobile/issues/307
// https://github.com/ant-design/ant-design-mobile/issues/163
const isIPhone = new RegExp('\\biPhone\\b|\\biPod\\b', 'i').test(window.navigator.userAgent);
let moneyKeyboardWrapProps;
if (isIPhone) {
  moneyKeyboardWrapProps = {
    onTouchStart: e => e.preventDefault(),
  };
}

class PlaceOrder extends React.Component {
  state = {
    type: 'money',
  }
  render() {
    const { getFieldProps } = this.props.form;
    const { type } = this.state;
    return (
      <div className="">
        <NavBar
          mode="light"
          icon={null && <Icon type="left" />}
          onLeftClick={() => console.log('onLeftClick')}
          rightContent={null && [
            <Icon key="1" type="ellipsis" />,
          ]}
          leftContent={[
            <Icon key="1" type="left" />,
            <span key="2" >LRC-WETH</span>

          ]}
        >
        </NavBar>
        <List className="">
          <InputItem
            {...getFieldProps('money3')}
            type={type}
            defaultValue={0.00085}
            placeholder="0.00085"
            clear
            moneyKeyboardAlign="left"
            moneyKeyboardWrapProps={moneyKeyboardWrapProps}
            extra={<div className=""><WebIcon type="right" /></div>}
            editable={false}
            className=""
          >LRC</InputItem>
          <InputItem
            {...getFieldProps('money3')}
            type={type}
            defaultValue={0.00085}
            placeholder="0.00085"
            clear
            moneyKeyboardAlign="left"
            moneyKeyboardWrapProps={moneyKeyboardWrapProps}
            extra={<div className=""><WebIcon type="right" /></div>}
            editable={false}
            className=""
          >WETH</InputItem>
        </List>
        <List className="mt15 bg-none">
          { false &&
            <Item className="text-center">
              <SegmentedControl values={['Buy LRC', 'Sell LRC']} style={{ height: '40px',width:'180px'}} />
            </Item>
          }
          <InputItem
            {...getFieldProps('money3')}
            type={type}
            placeholder="0.00"
            clear
            moneyKeyboardAlign="left"
            moneyKeyboardWrapProps={moneyKeyboardWrapProps}
            extra={<WebIcon type="profile" />}
          >Price</InputItem>
          <InputItem
            type={type}
            placeholder="0.00"
            clear
            moneyKeyboardAlign="left"
            onChange={(v) => { console.log('onChange', v); }}
            onBlur={(v) => { console.log('onBlur', v); }}
            moneyKeyboardWrapProps={moneyKeyboardWrapProps}
            extra={<WebIcon type="profile" />}
          >Amount</InputItem>
          <InputItem
            type={type}
            defaultValue="0.00"
            clear
            moneyKeyboardAlign="left"
            onChange={(v) => { console.log('onChange', v); }}
            onBlur={(v) => { console.log('onBlur', v); }}
            moneyKeyboardWrapProps={moneyKeyboardWrapProps}
            editable={false}
          >Total</InputItem>
          <Item>
            <Button className="w-100 d-block" type="primary">Place Buy Order</Button>
          </Item>
        </List>
        <div className="row align-items-center mt10">
          <div className="col color-black-3 fs16 pl25"></div>
          <div className="col-auto color-black-3 pr25">Advanced <WebSwitch size="small" /></div>
        </div>
        <div className="mt15"></div>
        <Tabs tabs={tabs}
          initialPage={0}
          onChange={(tab, index) => { console.log('onChange', index, tab); }}
          onTabClick={(tab, index) => { console.log('onTabClick', index, tab); }}
        >
          <div style={{backgroundColor: '#fff' }}>
            <table className="w-100">
              <thead>
                <tr>
                  <th className="text-left bg-grey-50 pl10 font-weight-normal color-black-3">Token</th>
                  <th className="text-right bg-grey-50 p5 font-weight-normal color-black-3">Balance</th>
                  <th className="text-right bg-grey-50 pr10 font-weight-normal color-black-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                  <tr >
                    <td className="pl10 color-black-2 text-left">LRC</td>
                    <td className="p5 color-black-2 text-right">100.15</td>
                    <td className="pr10 color-black-2 text-right">
                      <a className="m5"href="">转入</a>
                      <a className="m5"href="">买入</a>
                    </td>
                  </tr>
                  <tr >
                    <td className="pl10 color-black-2 text-left">ETH</td>
                    <td className="p5 color-black-2 text-right">100.15</td>
                    <td className="pr10 color-black-2 text-right">
                      <a className="m5"href="">转入</a>
                      <a className="m5"href="">买入</a>
                    </td>
                  </tr>
                  <tr >
                    <td className="pl10 color-black-2 text-left">WETH</td>
                    <td className="p5 color-black-2 text-right">0.000</td>
                    <td className="pr10 color-black-2 text-right">
                      <a className="m5"href="">ETH转换为WETH</a>
                    </td>
                  </tr>
              </tbody>
            </table>
          </div>
          <div style={{height: '150px', backgroundColor: '#fff' }}>
            <table className="w-100">
              <thead>
                <tr>
                  <th className="text-left bg-grey-50 p5 font-weight-normal color-black-3">Side</th>
                  <th className="text-right bg-grey-50 p5 font-weight-normal color-black-3">Price</th>
                  <th className="text-right bg-grey-50 p5 font-weight-normal color-black-3">Amount</th>
                  <th className="text-right bg-grey-50 p5 font-weight-normal color-black-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {
                  [1,2,3].map((item,index)=>
                    <tr key={index}>
                      <td className="p5 text-left text-down">Sell</td>
                      <td className="p5 color-black-2 text-right">0.00095</td>
                      <td className="p5 color-black-2 text-right">1000</td>
                      <td className="p5 color-black-2 text-right">Open</td>
                    </tr>
                  )
                }
              </tbody>
            </table>
          </div>
          <div style={{height: '150px', backgroundColor: '#fff' }}>

          </div>
        </Tabs>
        {
          false &&
          <div className="p10 bg-white" style={{position:'absolute',bottom:'0',left:'0',right:'0'}}>
            <Button className="w-100 d-block" type="primary">Place Buy Order</Button>
          </div>
        }
        <PlaceOrderConfirmPopup />
      </div>
    );
  }
}

const PlaceOrderConfirmPopup = ()=>{
  return (
    <Modal
      popup
      visible={false}
      onClose={()=>{}}
      animationType="slide-up"
    >
      <PlaceOrerConfirm />
    </Modal>
  )
}

const PlaceOrderForm = createForm()(PlaceOrder);
export default PlaceOrderForm

