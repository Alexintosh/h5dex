import React from 'react'
import {connect} from 'dva'
import {TickersFm,TickerFm} from 'modules/tickers/formatters'
import storage from '../../modules/storage'
import intl from 'react-intl-universal'
import routeActions from 'common/utils/routeActions'
import { ListView,Button,Tabs,NavBar,Icon,SegmentedControl  } from 'antd-mobile'
import { Switch,Icon as WebIcon} from 'antd'

const TxItem = ({item={},actions,key,index})=>{
    // if(!item){ return null }
    // const tickerFm = new TickerFm(item)
    console.log('todo item',item)
    const gotoDetail = ()=>{
      routeActions.gotoPath('/trade/detail')
    }
    return (
      <div>
        <div className="row ml0 mr0 p15 align-items-center zb-b-b no-gutters" onClick={()=>{}}>
          <div className="col-auo pr10 color-black text-center">
              <i className={`icon-${item.symbol} fs24 d-block`} style={{width:'36px',height:'36px',lineHeight:'36px',border:'1px solid #000',borderRadius:'50em'}}></i>
          </div>
          <div className="col text-left">
            <div>
              <div className="fs16 color-black-1">
                {item.symbol}
              </div>
              <div className="fs12 color-black-3">
                {item.name}
              </div>
            </div>
          </div>
          <div className="col-auto">
            <div className="color-black-1 fs20">
              0.00000000
            </div>
          </div>
        </div>

      </div>

    )
}

const data = [
  {
    symbol: 'ETH',
    name: 'Ether',
  },
  {
    symbol: 'WETH',
    name: 'Wrapper Ether',
  },
  {
    symbol: 'LRC',
    name: 'Loopring',
  },
];
const NUM_ROWS = 15;
let pageIndex = 0;

function genData(pIndex = 0) {
  const dataBlob = {};
  for (let i = 0; i < NUM_ROWS; i++) {
    const ii = (pIndex * NUM_ROWS) + i;
    dataBlob[`${ii}`] = `row - ${ii}`;
  }
  return dataBlob;
}


class ListTickers extends React.Component {
  constructor(props) {
    super(props);
    const dataSource = new ListView.DataSource({
      rowHasChanged: (row1, row2) => row1 !== row2,
    });

    this.state = {
      dataSource,
      isLoading: true,
    };
  }

  componentDidMount() {
    // you can scroll to the specified position
    // setTimeout(() => this.lv.scrollTo(0, 120), 800);

    // simulate initial Ajax
    setTimeout(() => {
      // this.rData = genData();
      this.rData = data;
      this.setState({
        dataSource: this.state.dataSource.cloneWithRows(this.rData),
        isLoading: false,
      });
    }, 600);
  }
  onEndReached = (event) => {
      // load new data
      // hasMore: from backend data, indicates whether it is the last page, here is false
      if (this.state.isLoading && !this.state.hasMore) {
        return;
      }
      console.log('reach end', event);
      this.setState({ isLoading: true });
      setTimeout(() => {
        this.rData = { ...this.rData, ...genData(++pageIndex) };
        this.setState({
          dataSource: this.state.dataSource.cloneWithRows(this.rData),
          isLoading: false,
        });
      }, 1000);
  }
  render(){
      const goBack = ()=>{
        routeActions.goBack()
      }
      let index = data.length - 1;
      const row = (rowData, sectionID, rowID) => {
        if (index < 0) {
          index = data.length - 1;
        }
        const obj = data[index--];
        return (
          <TxItem key={rowID} index={rowID} item={obj} />
        );
      };
      return (
          <div className="bg-white"  style={{height:'100%'}}>
            <NavBar
              className="w-100 zb-b-b"
              mode="light"
              onLeftClick={() => console.log('onLeftClick')}
              leftContent={ [
                <WebIcon key="1" type="left" className="color-black-1" onClic={goBack}/>,
              ]}
              rightContent={null && [
                <WebIcon key="1" type="plus" className="color-black-1" />,
              ]}
            >
              <div className="fs20">LRC <WebIcon hidden className="ml5 color-black-3" type="down" /></div>
            </NavBar>
            <div className="pt40 pb40 pl15 pr15 text-center zb-b-b">
                <div className="fs24 color-black-1">0.00000 LRC</div>
                <div className="fs16 color-black-3">
                  $ 0.00000
                </div>
            </div>
            <div className="row ml0 mr0">
              <div className="col text-center pt10 pb10 fs16 color-black-1">
                Status <WebIcon className="fs14" type="down" />
              </div>
              <div className="col text-center pt10 pb10 fs16 color-black-1">
                Types <WebIcon className="fs14" type="down" />
              </div>
              <div className="col text-center pt10 pb10 fs16 color-black-1">
                Sides <WebIcon className="fs14" type="down" />
              </div>
            </div>
            <ListView
              ref={el => this.lv = el}
              dataSource={this.state.dataSource}
              renderHeader={() => null}
              renderFooter={() => (<div className="text-center pt10 pb45 mb10">{this.state.isLoading ? 'Loading...' : 'Loaded'}</div>)}
              renderRow={row}
              className="am-list"
              pageSize={5}
              useBodyScroll={true}
              style={{
                 height: "100%",
                 overflow: 'auto',
                 background:'#fff',
              }}
              onScroll={() => { console.log('scroll'); }}
              scrollRenderAheadDistance={300}
              onEndReached={this.onEndReached}
              onEndReachedThreshold={10}
            />
            <div className="position-fixed p5 w-100 bg-white" style={{bottom:'0'}}>
              <div className="row ml0 mr0 no-gutters">
                <div className="col-6">
                  <Button onClick={()=>{}} className="bg-grey-900 color-white m5 fs16">
                    <i className="fs24 loopring-icon loopring-icon-receive mr10"></i>Receive
                  </Button>
                </div>
                <div className="col-6">
                  <Button onClick={()=>{}} className="bg-grey-900 color-white m5 fs18">
                    <i className="fs24 loopring-icon loopring-icon-transfer mr10"></i>Send
                  </Button>
                </div>
              </div>
            </div>
            {
              false &&
              <Tabs
                tabs={
                  [
                    { title: <div className="fs20">Todos</div> },
                    { title: <div className="fs20">Messages</div> },
                  ]
                }
                swipeable={false}
                tabBarBackgroundColor={"#fff"}
                tabBarActiveTextColor={"#000"}
                tabBarInactiveTextColor={"rgba(0,0,0,0.3)"}
                tabBarTextStyle={{}}
                initialPage={0}
                onChange={(tab, index) => {}}
                onTabClick={(tab, index) => { }}
              >

                <div className="p50">
                  Messages TODO
                </div>
              </Tabs>
            }
          </div>

      )
  }
}
export default connect()(ListTickers)

