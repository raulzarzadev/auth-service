export default (status, type, message = null, error = null) => {
  return { status, type, message, error }
}
