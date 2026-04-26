import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const formSource = readFileSync(new URL('./SupportTeamContactForm.vue', import.meta.url), 'utf8')
const validateFormSourceMatch = formSource.match(/function validateForm\(\) \{[\s\S]*?\n\}/)
const submitFormSourceMatch = formSource.match(/function submitForm\(\) \{[\s\S]*?\n\}/)

assert.ok(validateFormSourceMatch, 'validateForm() should exist in SupportTeamContactForm.vue')
assert.ok(submitFormSourceMatch, 'submitForm() should exist in SupportTeamContactForm.vue')

function runValidateForm({ teamName = '', teamEmail = '' } = {}) {
  const formState = { teamName, teamEmail }
  const fieldErrors = {
    teamName: 'stale',
    teamEmail: 'stale',
    selectedTags: 'stale',
    selectedStaff: 'stale',
  }

  const createValidateForm = new Function(
    'formState',
    'fieldErrors',
    `${validateFormSourceMatch[0]}; return validateForm;`,
  )
  const validateForm = createValidateForm(formState, fieldErrors)

  return {
    isValid: validateForm(),
    fieldErrors,
  }
}

function runSubmitForm({
  teamName = '',
  teamEmail = '',
  eimId = '',
  xMatter = '',
  gsd = '',
  selectedTags = [],
  otherInfo = '',
  staffIdPreview = [],
} = {}) {
  const formState = {
    teamName,
    teamEmail,
    eimId,
    xMatter,
    gsd,
    selectedTags,
    otherInfo,
  }
  const fieldErrors = {
    teamName: 'stale',
    teamEmail: 'stale',
    selectedTags: 'stale',
    selectedStaff: 'stale',
  }
  const emittedEvents = []
  const emit = (...args) => emittedEvents.push(args)

  const createFormHandlers = new Function(
    'formState',
    'fieldErrors',
    'staffIdPreview',
    'emit',
    `${validateFormSourceMatch[0]}; ${submitFormSourceMatch[0]}; return { validateForm, submitForm };`,
  )
  const { submitForm } = createFormHandlers(formState, fieldErrors, { value: staffIdPreview }, emit)

  submitForm()

  return emittedEvents
}

test('create contact form accepts comma-separated staff IDs through one input', () => {
  assert.match(formSource, /staffInput:\s*''/)
  assert.match(formSource, /parseCommaSeparatedTokens\(formState\.staffInput\)/)
  assert.match(formSource, /placeholder="S-10492, S-94281, S-55219"/)
  assert.doesNotMatch(formSource, /Quick add:/)
})

test('create contact form uses tag language instead of role language on the add screen', () => {
  assert.match(formSource, /selectedTags:\s*\[\]/)
  assert.match(formSource, /for="tagInput">Tag</)
  assert.match(formSource, /roles: \[\.\.\.formState\.selectedTags\]/)
  assert.doesNotMatch(formSource, />Role</)
})

test('create contact form keeps other information as a single input', () => {
  assert.match(formSource, /otherInfo:\s*''/)
  assert.match(formSource, /for="otherInfo">Other Information</)
  assert.match(formSource, /id="otherInfo"/)
  assert.doesNotMatch(formSource, /customLinks/)
  assert.doesNotMatch(formSource, /Add Custom Field/)
})

test('create contact form wires validation errors to inputs accessibly', () => {
  assert.match(formSource, /:aria-invalid="Boolean\(fieldErrors\.teamName\)"/)
  assert.match(formSource, /:aria-describedby="fieldErrors\.teamName \? 'teamName-error' : undefined"/)
  assert.match(formSource, /id="teamName-error"[^>]*role="alert"[^>]*aria-live="polite"/)
  assert.match(formSource, /:aria-invalid="Boolean\(fieldErrors\.teamEmail\)"/)
  assert.match(formSource, /:aria-describedby="fieldErrors\.teamEmail \? 'teamEmail-error' : undefined"/)
  assert.match(formSource, /id="teamEmail-error"[^>]*role="alert"[^>]*aria-live="polite"/)
  assert.match(formSource, /:aria-invalid="Boolean\(fieldErrors\.selectedStaff\)"/)
  assert.match(formSource, /:aria-describedby="fieldErrors\.selectedStaff \? 'staffIds-error' : undefined"/)
  assert.match(formSource, /id="staffIds-error"[^>]*role="alert"[^>]*aria-live="polite"/)
})

test('create contact form disables native browser validation on submit', () => {
  assert.match(formSource, /<form[^>]*novalidate[^>]*@submit\.prevent="submitForm"/)
})

test('create contact form validateForm only requires team name', () => {
  assert.deepEqual(runValidateForm({ teamName: 'Payments Core' }), {
    isValid: true,
    fieldErrors: {
      teamName: '',
      teamEmail: '',
      selectedTags: '',
      selectedStaff: '',
    },
  })

  assert.deepEqual(runValidateForm({}), {
    isValid: false,
    fieldErrors: {
      teamName: 'Team name is required.',
      teamEmail: '',
      selectedTags: '',
      selectedStaff: '',
    },
  })
})

test('create contact form validateForm only checks email when a value is present', () => {
  assert.deepEqual(runValidateForm({ teamName: 'Payments Core', teamEmail: 'invalid-email' }), {
    isValid: false,
    fieldErrors: {
      teamName: '',
      teamEmail: 'Enter a valid team email.',
      selectedTags: '',
      selectedStaff: '',
    },
  })

  assert.deepEqual(runValidateForm({ teamName: 'Payments Core', teamEmail: ' team@company.com ' }), {
    isValid: true,
    fieldErrors: {
      teamName: '',
      teamEmail: '',
      selectedTags: '',
      selectedStaff: '',
    },
  })
})

test('create contact form submitForm emits sparse payload when only team name is provided', () => {
  const emittedEvents = runSubmitForm({ teamName: '  Payments Core  ' })

  assert.deepEqual(emittedEvents, [
    ['submit', {
      name: 'Payments Core',
      email: '',
      eim: '',
      xMatter: '',
      gsd: '',
      roles: [],
      staffIds: [],
      links: [],
    }],
  ])
})
