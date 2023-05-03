const DOM = {}
DOM.dataset_obj = {}
DOM.dataset_id = 0

// Select a single element
DOM.el = (query, root = document) => {
  return root.querySelector(query)
}

// Select an array of elements
DOM.els = (query, root = document) => {
  return Array.from(root.querySelectorAll(query))
}

// Clone element
DOM.clone = (el) => {
  return el.cloneNode(true)
}

// Clone element children
DOM.clone_children = (query) => {
  let items = []
  let children = Array.from(DOM.el(query).children)

  for (let c of children) {
    items.push(DOM.clone(c))
  }

  return items
}

// Data set manager
DOM.dataset = (el, value, setvalue) => {
  if (!el) {
    return
  }

  let id = el.dataset.dataset_id

  if (!id) {
    id = DOM.dataset_id
    DOM.dataset_id += 1
    el.dataset.dataset_id = id
    DOM.dataset_obj[id] = {}
  }

  if (setvalue !== undefined) {
    DOM.dataset_obj[id][value] = setvalue
  }
  else {
    return DOM.dataset_obj[id][value]
  }
}

// Create an empty div
DOM.div = (classes = ``) => {
  let new_div = document.createElement(`div`)

  if (classes) {
    let classlist = classes.split(` `).filter(x => x != ``)

    for (let cls of classlist) {
      new_div.classList.add(cls)
    }
  }

  return new_div
}

// Like jQuery's nextAll
DOM.next_all = function* (e, selector) {
  while (e = e.nextElementSibling) {
    if ( e.matches(selector) ) {
      yield e;
    }
  }
}

// Get item index
DOM.index = (el) => {
  return Array.from(el.parentNode.children).indexOf(el)
}

// Add an event listener
DOM.ev = (element, action, callback, extra) => {
  element.addEventListener(action, callback, extra)
}