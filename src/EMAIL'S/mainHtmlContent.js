export default (title, href) => `
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RZ Auth Service</title>
</head>

<body>
  <div style="
  width: 80%; 
  margin: 0 auto;
  ">
  <h3 style="text-align: center;">
    ${title}
  </h3>
  <p>Para continuar, por favor haz click en el siguiente enlace</p>
  <a href=${href}>Click aquí para continuar con tu registro</a>
</div>
</body>

</html>
`
