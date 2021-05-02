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
  const responseArea = document.getElementById('response-textarea')
  responseArea.innerHTML = JSON.stringify(response, undefined, 4)

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
document
  .getElementById('form-recover')
  .addEventListener('submit', (e) => submit(e, '/user/recover', ['email']))
document
  .getElementById('form-confirm-recover')
  .addEventListener('submit', (e) =>
    submit(e, '/user/recover', ['token', 'password'])
  )
