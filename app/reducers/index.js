import { combineReducers } from 'redux'
import { connectRouter } from 'connected-react-router'

import overview from './overview'
import list from './list'
import market from './market'
import transactions from './transactions'
import common from './common'
import login from './login'
import exchange from './exchange'
import sendRecieve from './sendRecieve'
import addressbook from './addressbook'
import terminal from './terminal'
import settings from './settings'

import intl from './intl'
import { addLocaleData } from 'react-intl'
import ru from 'react-intl/locale-data/ru'
import ja from 'react-intl/locale-data/ja'
import de from 'react-intl/locale-data/de'
import en from 'react-intl/locale-data/en'
import ko from 'react-intl/locale-data/ko'
import fr from 'react-intl/locale-data/fr'
import es from 'react-intl/locale-data/es'
import { FormattedMessage } from 'react-intl'

addLocaleData(ru)
addLocaleData(en)
addLocaleData(ja)
addLocaleData(de)
addLocaleData(ko)
addLocaleData(fr)
addLocaleData(es)

export default function createRootReducer(history) {
  const routerReducer = connectRouter(history)(() => {})

  return connectRouter(history)(
    combineReducers({
      intl,
      overview,
      routerReducer,
      list,
      login,
      market,
      sendRecieve,
      transactions,
      exchange,
      common,
      addressbook,
      terminal,
      settings,
    })
  )
}
