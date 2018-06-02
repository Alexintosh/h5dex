import io from 'socket.io-client'
import {store} from '../../index.js'
import config from 'common/config'

const updateItems = (items,id)=>{
  const dispatch = require('../../index.js').default._store.dispatch
  dispatch({
    type:'sockets/itemsChange',
    payload:{id,items,loading:false}
  })
}
const updateItem = (item,id)=>{
  const dispatch = require('../../index.js').default._store.dispatch
  dispatch({
    type:'sockets/itemChange',
    payload:{id,item,loading:false}
  })
}

const isArray = (obj)=>{
  return Object.prototype.toString.call(obj) === '[object Array]'
}

const transfromers = {
  transaction:{
    queryTransformer:(payload)=>{
      const {filters,page} = payload
      return JSON.stringify({
        owner:window.WALLET.address,
        symbol:filters.token,
        status:filters.status,
        txType:filters.type,
        pageIndex:page.current,
        pageSize:page.size || 10,
      })
    },
    resTransformer:(id,res)=>{
      res = JSON.parse(res)
      // console.log(id,'res',res)
      let items = []
      if (!res.error && res.data && isArray(res.data.data)) {
        items =[ ...res.data.data ]
      }
      updateItems(items,id)
    },
  },
  balance:{
    queryTransformer:(payload)=>{
      return JSON.stringify({
         delegateAddress: config.getDelegateAddress(),
         owner:window.WALLET.address
      })
    },
    resTransformer:(id,res)=>{
      res = JSON.parse(res)
     // console.log(id,'res',res)
      let items = []
      if (!res.error && res.data && isArray(res.data.tokens)) {
        items =[ ...res.data.tokens ]
      }
      updateItems(items,id)
    },
  },
  marketcap:{
    queryTransformer:(payload)=>{
      const {filters} = payload
      return JSON.stringify({
         "currency": filters.currency,
      })
    },
    resTransformer:(id,res)=>{
      res = JSON.parse(res)
    //  console.log(id,'res',res)
      let items =[]
      if (!res.error && res.data && isArray(res.data.tokens)) {
        items =[ ...res.data.tokens ]
      }
      updateItems(items,id)
    },
  },
  depth:{
    queryTransformer:(payload)=>{
      const {filters} = payload
      return JSON.stringify({
         "delegateAddress" :config.getDelegateAddress(),
         "market":filters.market,// TODO
      })
    },
    resTransformer:(id,res)=>{
      res = JSON.parse(res)
   // console.log(id,'res',res)
      let item ={}
      if(!res.error && res.data && res.data.depth){
        item ={ ...res.data.depth }
      }
      updateItem(item,id)
    },
  },
  trades:{
    queryTransformer:(payload)=>{
      const {filters} = payload
      return JSON.stringify({
         "delegateAddress" :config.getDelegateAddress(),
         "market":filters.market, //TODO
      })
    },
    resTransformer:(id,res)=>{
      res = JSON.parse(res)
      //console.log(id,'res',res)
      let items =[]
      if(!res.error && isArray(res.data)){
        items =[ ...res.data ]
      }
      updateItems(items,id)
    },
  },
  tickers:{
    queryTransformer:(payload)=>{
      const {filters} = payload
      return JSON.stringify({
         "delegateAddress" :config.getDelegateAddress(),
         "market":filters.market, //TODO
      })
    },
    resTransformer:(id,res)=>{
      res = JSON.parse(res)
      //console.log(id,'res',res)
      let item = {}
      if(!res.error && res.data){
        item ={...res.data}
      }
      updateItem(item,id)
    },
  },
  loopringTickers:{
    queryTransformer:(payload)=>{
      const {filters} = payload
      return JSON.stringify({
         "delegateAddress" :config.getDelegateAddress(),
         "market":filters.market, //TODO
      })
    },
    resTransformer:(id,res)=>{
      res = JSON.parse(res)
      //console.log(id,'res',res)
      let items =[]
      if(!res.error && isArray(res.data)){
        const supportMarket = res.data.filter(item=>config.isSupportedMarket(item.market)) // filter support market
        items =[ ...supportMarket ]
      }
      updateItems(items,id)
    },
  },
  pendingTx:{
    queryTransformer:(payload)=>{
      return JSON.stringify({
         owner:window.WALLET.address
      })
    },
    resTransformer:(id,res)=>{
      res = JSON.parse(res)
      //console.log(id,'res',res)
      let items =[]
      if(!res.error && isArray(res.data)){
        items =[ ...res.data ]
      }
      updateItems(items,id)
    },
  },
}
const getQueryTransformer = (id)=>{
  if(transfromers[id] && transfromers[id].queryTransformer){
    return transfromers[id].queryTransformer
  }else{
    return ()=>{console.log(id,'no queryTransformer')}
  }
}
const getResTransformer = (id)=>{
  if(transfromers[id] && transfromers[id].resTransformer){
    return transfromers[id].resTransformer
  }else{
    return ()=>{console.log(id,'no resTransformer')}
  }
}

const emitEvent = (payload)=>{
  let {id,socket} = payload
  const transfromer = getQueryTransformer(id)
  socket.emit(`${id}_req`,transfromer(payload))
}
const onEvent = (payload)=>{
  let {id,socket} = payload
  const transfromer = getResTransformer(id)
  socket.on(`${id}_res`,transfromer.bind(this,id))
}

const connect = (payload)=>{
  const {url}= payload
  let options = {
    transports: ['websocket']
  }
  const socket = io(url,options)
  socket.on('disconnect', (data) => {
    console.log('socket disconnect')
  })
  socket.on('error', (err) => {
    console.log('socket error',err)
  })
  return new Promise((resolve,reject)=>{
    socket.on('connect',()=>{
      console.log('socket connect success!')
      resolve(socket)
    })
  })
}
export default {
  onEvent,
  emitEvent,
  connect,
}




