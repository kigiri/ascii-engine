import { ev } from '../helper/ev.js'

export const state = ({ reducers }) => {
  const _state = {}
  if (!reducers || typeof reducers !== 'object') {
    console.warn('Missing required property `reducers`, unable to init state')
    return {}
  }

  const globalEvent = ev()
  const store = {
    subscribe: globalEvent.sub,
    getState: () => _state,
    actions: {},
    connect: mappers => {
      const event = ev()
      const partialState = {}
      for (const [type, mapper] of Object.entries(mappers)) {
        if (typeof store.subscribe[type] !== 'function') {
          throw Error(`No reducers for type ${type}`)
        }
        partialState[type] = mapper(_state[type])
        store.subscribe[type](() => {
          const next = mapper(_state[type])
          if (next === partialState[type]) return
          event.exec(partialState)
        })
      }
      return event.sub
    }
  }

  for (const [ type, { _, ...actions } ] of Object.entries(reducers)) {
    _state[type] = _
    const event = ev()
    store.getState[type] = () => _state[type]
    store.subscribe[type] = event.sub
    const actionType = store.actions[type] = {}

    const dispatch = payload => {
      event.exec(payload)
      globalEvent.exec({
        type: payload.type,
        action: payload.action,
        data: payload.data,
        state: _state
      })
    }

    for (const [ name, fn ] of Object.entries(actions)) {
      const action = `${type}_${name}`.replace(/(:?[a-z])([A-Z])/g, '$1_$2')
        .toUpperCase()

      actionType[name] = data => {
        const next = fn(data, _state[type])
        if (next === _state[type]) return actionType
        _state[type] = next
        Promise.resolve({ type, action, data, [type]: next }).then(dispatch)
        return actionType
      }
    }
  }

  return { store }
}
