import _ from 'lodash'
import { push } from 'react-router-redux'
import { encodeQueryString } from '../utils/queryUtils'
import { triggerSearch } from './SearchRequestActions'
import { fetchGranules } from './SearchRequestActions'
import { fetchConfig } from './ConfigActions'

export const initialize = () => {
  return (dispatch, getState) => {
    const state = getState()

    dispatch(fetchConfig())
    dispatch(triggerSearch())

    const collectionsSelected = !_.isEmpty(state.behavior.search.selectedIds)
    const granulesLoaded = !_.isEmpty(state.domain.results.granules)
    if (collectionsSelected && !granulesLoaded) {
      dispatch(fetchGranules())
    }
  }
}

export const showCollections = () => {
  return (dispatch, getState) => {
    dispatch(push(`collections?${encodeQueryString(getState())}`))
  }
}

export const showGranules = () => {
  return (dispatch, getState) => {
    dispatch(push(`collections/files?${encodeQueryString(getState())}`))
  }
}
