export function clearFieldErrors(fieldErrors) {
  Object.keys(fieldErrors).forEach((key) => {
    delete fieldErrors[key]
  })
}

export function setFieldError(fieldErrors, fieldName, message) {
  if (!fieldName || !message || fieldErrors[fieldName]) {
    return
  }

  fieldErrors[fieldName] = message
}

export function getApiErrorMessage(error, fallbackMessage) {
  return error?.message || fallbackMessage
}

function matchesRule(matchers, context) {
  const list = Array.isArray(matchers) ? matchers : [matchers]
  
  return list.every((matcher) => {
    if (matcher instanceof RegExp) {
      return matcher.test(context.message)
    }

    if (typeof matcher === 'function') {
      return matcher(context)
    }

    return context.lowerMessage.includes(String(matcher).toLowerCase())
  })
}

export function applyApiFieldErrors(error, fieldErrors, rules = []) {
  const message = getApiErrorMessage(error, '').trim()

  if (!message) {
    return false
  }

  const context = {
    error,
    message,
    lowerMessage: message.toLowerCase(),
  }

  let matched = false

  rules.forEach((rule) => {
    if (!matchesRule(rule.match, context)) {
      return
    }

    const fields = Array.isArray(rule.field) ? rule.field : [rule.field]
    fields.forEach((field) => {
      setFieldError(fieldErrors, field, rule.message || message)
      matched = true
    })
  })

  return matched
}