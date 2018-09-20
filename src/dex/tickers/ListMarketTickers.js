import React from 'react'
import {connect} from 'dva'
import {TickersFm,TickerFm,sorterByMarket,sorterByVolume,sorterByPirce,sorterByChange} from 'modules/tickers/formatters'
import storage from '../../modules/storage'
import intl from 'react-intl-universal'
import routeActions from 'common/utils/routeActions'
import { ListView,Button,Tabs } from 'antd-mobile'
import { Spin,Icon } from 'antd'
import { getMarketTickersBySymbol } from './formatters'
import Worth from 'modules/settings/Worth'
import {formatPrice} from 'modules/orders/formatters'
import markets from 'modules/storage/markets'

export const TickerHeader = ({sort,dispatch})=>{
  const sortByType = (type) => {
    dispatch({
      type:'sockets/extraChange',
      payload:{
        id:'tickersOfSource',
        extra:{
          sort: {
            sortBy:type ,
            orderBy:sort.orderBy === 'ASC' ? 'DESC' : 'ASC'
          }
        }
      }
    })
  }
  return (
    <div className="row ml0 mr0 pt5 pb5 pl10 pr10 align-items-center no-gutters">
      <div className="col-4 fs13 color-black-4 text-left">
        <span onClick={sortByType.bind(this, 'market')}>{intl.get('common.market')}{sort.sortBy === 'market' && <Icon type={sort.orderBy === 'ASC' ? 'up' : 'down'} />}</span>
         /
        <span onClick={sortByType.bind(this, 'volume')}>{intl.get('common.volume')}{sort.sortBy === 'volume' && <Icon type={sort.orderBy === 'ASC' ? 'up' : 'down'} />}</span>
      </div>
      <div className="col-auto pr10 fs16">
        <Icon type="star" className="color-black-4" style={{opacity:0}}/>
      </div>
      <div className="col text-left pr10">
        <div className="fs13 color-black-4 " onClick={sortByType.bind(this, 'price')}>
          {intl.get('common.price')}{sort.sortBy === 'price' && <Icon type={sort.orderBy === 'ASC' ? 'up' : 'down'} />}
        </div>
      </div>
      <div className="col-3 text-right">
        <div className="fs13 color-black-4" onClick={sortByType.bind(this, 'change')}>
          {intl.get('ticker.change')}{sort.sortBy === 'change' && <Icon type={sort.orderBy === 'ASC' ? 'up' : 'down'} />}
        </div>
      </div>
    </div>
  )
}

export const TickerItem = ({item,actions,key,tickersList,dispatch})=>{
    if(!item){ return null }
    const {extra:{favored={}, sort={}, keywords}} = tickersList
    const tickerFm = new TickerFm(item)
    const tokens = tickerFm.getTokens()
    const direction = tickerFm.getChangeDirection()
    const gotoDetail = ()=>{
      routeActions.gotoPath(`/dex/markets/${item.market}`)
    }
    const toggleTickerFavored = (item, e)=>{
      e.stopPropagation();
      dispatch({
        type:'sockets/extraChange',
        payload:{
          id:'tickersOfSource',
          extra:{
            favored:{...favored,[item]:!favored[item]},
          }
        }
      })
      markets.toggleFavor(item)
    }
    return (
      <div className="row ml0 mr0 p10 align-items-center no-gutters hover-default zb-b-b" onClick={gotoDetail}>
        <div className="col-auto pr10 fs16" onClick={toggleTickerFavored.bind(this, item.market)}>
          {
            favored[item.market] &&
            <Icon type="star" className="text-primary"/>
          }
          {
            !favored[item.market] &&
            <Icon type="star-o" className="color-black-4"/>
          }
        </div>
        <div className="col-4 text-left">
          <div className="fs16 lh15">
            <span className="fs16 color-black-1">{tokens.left}</span>
            <span className="fs14 color-black-4"> / {tokens.right}</span>
          </div>
          <div className="fs12" style={{marginTop:'2px'}}>
              <span className="fs12 color-black-4">Vol {tickerFm.getVol()}</span>
          </div>
        </div>
        <div className="col text-left pr10">
          <div className="fs16 color-black-1 lh15">{formatPrice(tokens.left, tokens.right, tickerFm.getLast())}</div>
          <div className="fs12 color-black-4" style={{marginTop:'2px'}}><Worth amount={formatPrice(tokens.left, tokens.right, tickerFm.getLast())} symbol={tokens.right}/></div>
        </div>
        <div className="col-3 text-right">
          {
            direction === 'up' &&
            <Button style={{height:'36px',lineHeight:'36px'}} className="border-none radius-4 pl10 pr10 fs16 bg-success color-white">
             +{tickerFm.getChange()}
            </Button>
          }
          {
            direction === 'down' &&
            <Button style={{height:'36px',lineHeight:'36px'}} className="border-none radius-4 pl10 pr10 fs16 bg-error color-white">
             {tickerFm.getChange()}
            </Button>
          }
          {
            direction === 'none' &&
            <Button style={{height:'36px',lineHeight:'36px'}} className="border-none radius-4 pl10 pr10 fs16 bg-grey-500 color-white">
             {tickerFm.getChange()}
            </Button>
          }
        </div>
      </div>
    )
}
export const TickerList = ({items,loading,dispatch, tickersList})=>{
  const {extra:{sort={}, keywords}} = tickersList
  const sortedItems = [...items]
  if(sort.sortBy) {
    switch(sort.sortBy) {
      case 'market':
        sortedItems.sort(sorterByMarket)
        if(sort.orderBy === 'DESC') {
          sortedItems.reverse()
        }
        break;
      case 'volume':
        sortedItems.sort(sorterByVolume)
        if(sort.orderBy === 'DESC') {
          sortedItems.reverse()
        }
        break;
      case 'price':
        sortedItems.sort(sorterByPirce)
        if(sort.orderBy === 'DESC') {
          sortedItems.reverse()
        }
        break;
      case 'change':
        sortedItems.sort(sorterByChange)
        if(sort.orderBy === 'DESC') {
          sortedItems.reverse()
        }
        break;
    }
  }

  return (
    <div className="">
      <Spin spinning={loading}>
        {!loading && items.length > 0 &&
          <div>
            <TickerHeader sort={sort} dispatch={dispatch}/>
            <div className="divider 1px zb-b-t"></div>
            {sortedItems.map((item, index) => <TickerItem key={index} item={item} dispatch={dispatch} tickersList={tickersList}/>)}
          </div>
        }
        {!loading && items.length === 0 &&
          <div className="p10 text-center color-black-4">
            {intl.get('common.list.no_data')}
          </div>
        }
      </Spin>
    </div>
  )
}

class ListMarketTickers extends React.Component {
  constructor(props) {
    super(props);
  }
  render(){
      const {tickersOfSource:list,dispatch} = this.props
      const tickersFm = new TickersFm(list)
      const allTickers = tickersFm.getAllTickers().filter(item=>item.label === 'whitelist')
      const favoredTickers = tickersFm.getFavoredTickers().filter(item=> {
        return allTickers.find((n)=>n.market === item.market)
      })
      const recentTickers = tickersFm.getRecentTickers()
      const sorter = (a,b)=>{
        if(a.vol === b.vol ){
          if(a.last === b.last){
            return b.market > a.market ? -1 : 1
          }else{
            return Number(b.last) - Number(a.last)
          }
        }else{
          return Number(b.vol) - Number(a.vol)
        }
      }
      allTickers.sort(sorter)
      const marketGroups = {}
      allTickers.forEach(item=>{
        const market = item.market.split('-')
        let group = marketGroups[market[1]]
        if(group){
          group.push(item)
        } else {
          group = [item]
        }
        marketGroups[market[1]] = group
      })
      favoredTickers.sort(sorter)
      const tabs = []
      const tickerItems = []
      if(marketGroups && Object.keys(marketGroups)) {
        tabs.push({ title: <div className="fs16">{intl.get('ticker_list.title_favorites')}</div> })
        tickerItems.push(<TickerList key={'fav'} items={favoredTickers} loading={list.loading} dispatch={dispatch} tickersList={list}/>)
        for (let key of Object.keys(marketGroups)) {
          tabs.push({title: <div className="fs16">{key}</div>})
          tickerItems.push(<TickerList key={key} items={getMarketTickersBySymbol(key,allTickers)} loading={list.loading} dispatch={dispatch} tickersList={list}/>)
        }
      }
      return (
          <Tabs
            tabs={tabs}
            tabBarTextStyle={{}}
            initialPage={1}
            swipeable={false}
            onChange={(tab, index) => {}}
            onTabClick={(tab, index) => { }}
          >
            {tickerItems}
          </Tabs>
      )
  }
}
export default connect(
  ({sockets:{tickersOfSource}})=>({tickersOfSource})
)(ListMarketTickers)

