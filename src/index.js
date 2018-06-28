import '@babel/polyfill'
import dva from 'dva'
import { models } from './modules'
import { message } from 'antd'
import './assets/css/index.less'
import {setLocale} from "./common/utils/localeSetting";
import storage from './modules/storage';
import Eth from 'LoopringJS/ethereum/eth';
import Relay from 'LoopringJS/relay/relay';
import {init} from './init'
import Notification from 'LoopringUI/components/Notification'
import intl from 'react-intl-universal'


const host = storage.settings.get().relay.selected;

window.ETH = new Eth(`${host}/eth`);
window.RELAY = new Relay(`${host}/rpc/v2`);
setLocale(storage.settings.get().preference.language);


// 1. Initialize
const app = dva({
  onError:(err, dispatch) => {message.error(err.message,3)}
})
window.onError= (msg,url,line)=>{message.error(`window.onError ${msg} ${url} ${line}`,null)}
window.config = {}
window.config.address = "0xeba7136a36da0f5e16c6bdbc739c716bb5b65a00";
window.config.host = host
window.config.rpc_host = `${host}/rpc/v2`
// 2. Plugins
// app.use({})

// 3. Model
models.map(model=>{
  app.model(model)
})

// 4. Router
app.router(require('./router').default)


// 5. Start
app.start('#root')

// STORE is available when current route has rendered
// Becarefull to use STORE in render funtion
// window.STORE = app._store

export const store = app._store

init().then(res=>{
  console.log('res',JSON.stringify(res))
  const tokens = new Array()
  tokens.push({
    "symbol": "ETH",
    "digits": 18,
    "address": "",
    "precision": 6,
  })
  res.result.forEach(item=>{
    if(!item.deny) {
      const digit = Math.log10(item.decimals)
      tokens.push({
        "symbol": item.symbol,
        "digits": digit,
        "address": item.protocol,
        "precision": Math.min(digit, 6),
      })
    }
  })
  storage.settings.setTokensConfig(tokens)
  store.dispatch({type:'tokens/itemsChange', payload:{items:tokens}})
}).catch(error=> {
  console.log(error)
  Notification.open({
    message:intl.get('notifications.title.init_failed'),
    description:intl.get('notifications.message.failed_fetch_data_from_server'),
    type:'error'
  })
})

export default app
