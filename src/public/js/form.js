const submit = async (e, url, inputs) => {
  e.preventDefault()
  const data = {}

  inputs.forEach((input) => {
    data[input] = e.target[input].value
  })

  const response = await fetch(`${url}${data.token ? `/${data.token}` : ''}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
    .then(async (response) => {
      if (response.ok) {
        return await response.json() // then consume it again, the error happens
      }
    })
    .catch((err) => console.log('err', err))
  console.log('response', response)

  return response
}
document
  .getElementById('form-signup')
  .addEventListener('submit', (e) => submit(e, '/user/signup', ['email']))

document
  .getElementById('form-session')
  .addEventListener('submit', (e) => submit(e, '/user/session', ['authtoken']))
document
  .getElementById('form-confirm')
  .addEventListener('submit', (e) =>
    submit(e, '/user/signup', ['password', 'token'])
  )
document
  .getElementById('form-signin')
  .addEventListener('submit', (e) =>
    submit(e, '/user/signin', ['email', 'password'])
  )

/*
const sessionToken = document.getElementById('session-token')
const sessionButton = document.getElementById('session-button')

const signupForm = document.getElementById('form-signup')

const signinForm = document.getElementById('form-signin')
const signinEmail = document.getElementById('signin-email')
const signinPass = document.getElementById('signin-pass')
const signinButton = document.getElementById('signin-button')

const basicFunction = e => {
  e.preventDefault()
  console.log('e', e)
}

signupForm.addEventListener('submit', basicFunction)

signinForm.addEventListener('submit', basicFunction)

sessionToken.addEventListener('keyup', function (e) {
  console.log('e', e.target.value)
  const { value } = e.target
  if (value?.length > 2) {
    console.log('set button')
    sessionButton.disabled = false
  } else {
    sessionButton.disabled = true
  }
})
 */
