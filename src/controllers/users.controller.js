const User = require("../models/User");

const jwt = require("jsonwebtoken");
const { sendEmail } = require("../helpers/user.helper");
const InvalidToken = require("../models/InvalidToken");
const { json } = require("express");

//**** host segun envarioment****
const host = process.env.SIGNUP_HOST;

const usersCtrl = {};

usersCtrl.getUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  res.json({
    type: "successUser",
    ok: true,
    user: user,
  });
};

usersCtrl.sigupMail = async (req, res) => {
  const { email } = req.body;
  let newUserId;

  // *** comprobando usuario no exista o email no este confirmado
  const user = await User.findOne(
    { email },
    { _id: 1, credit: 1, email: 1, emailConfirmed: 1, rol: 1 }
  );
  if (!user) {
    const newUser = new User({
      email,
      emailConfirmed: false,
    });
    const userSaved = await newUser.save();
    newUserId = userSaved._id;
  }
  if (user && user.emailConfirmed) {
    return res.json({
      ok: false,
      message: "este mail ya fue confirmado",
      type: "alreadyConfirm",
    });
  }
  if (user && !user.emailConfirmed) {
    newUserId = user._id;
  }

  // *** respondiendo usuario y token

  const payload = {
    email,
    id: newUserId,
  };

  const token = await jwt.sign(payload, process.env.JWT_SECRET_TEXT, {
    expiresIn: 60 * 60 * 24, // expires in 24 hours
  });

  // *** enviar correo  para esperar confirmacion
  //TODO ¿Como modularizar esto?

  const subjet = `Solicitud de registro`;
  const content = `
    ¿Iniciaste un proceso para subscribirte a negociosdelbarrio.com ?
    \n 
    Sigue el siguiente enlace:
    \n ${host}/signup/${token} 
    \n 
    ¿No fuiste tu? Tu cuenta esta segura. Omite este correo.
    \n
    ¿Dudas? Contactanos https://negociosdelbarrio.com/contacto 
    `;
  sendEmail(email, subjet, content);

  res.json({
    ok: true,
    message: "Revisa tu correo para concluir tu registro",
    type: "emailSent",
  });
};

usersCtrl.confirmEmail = async (req, res) => {
  // *** confirma email
  //TODO falta validar que este token solo hay sido usado solo una vez
  const { password, rol } = req.body;
  const token = jwt.verify(req.params.token, process.env.JWT_SECRET_TEXT);
  if (!token)
    return res.json({ ok: false, type: "invalidToken", type2: "tryAgain" });

  const user = await User.findById(token.id);

  if (!user)
    return res.json({ ok: false, type: "signupFail", type2: "tryAgain" });

  if (user.emailConfirmed)
    return res.json({
      message: "Este correo ya fue validado.",
      type: "alreadyConfirmed",
      ok: false,
    });

  const passwordCryp = await user.encryptPassword(password);
  await User.findByIdAndUpdate(token.id, {
    password: passwordCryp,
    emailConfirmed: true,
    rol,
  });

  const payload = {
    email: user.email,
    id: user._id,
    rol: user.rol,
  };
  const newToken = await jwt.sign(payload, process.env.JWT_SECRET_TEXT);

  res.json({
    message: "Su correo electronico ha sido confirmado",
    ok: true,
    type: "alreadyConfirmed",
    type2: "successSignIn",
    token: newToken,
  });
};

usersCtrl.signIn = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne(
    { email },
    {
      email: 1,
      password: 1,
      rol: 1,
      emailConfirmed: 1,
    }
  );
  if (!user || !user.emailConfirmed)
    return res.json({
      ok: false,
      message: "incio de sesion fallo",
      type: "faildSignIn",
      type2: "notEmailConfirmed",
    });

  // *** validando password

  const isPaswordMatch = await user.matchPassword(password || "");
  if (!isPaswordMatch)
    return res.json({
      ok: false,
      message: "inicio de sesion fallo",
      type: "faildSignIn",
    });

  // *** respondiendo usuario y token

  const payload = {
    email,
    id: user._id,
    rol: user.rol,
  };
  const token = await jwt.sign(payload, process.env.JWT_SECRET_TEXT);

  res.json({
    user: payload,
    ok: true,
    message: "bienvendio",
    type: "successSignIn",
    token,
  });
};

usersCtrl.forgotPassword = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (user) {
    // *** Genera token para recuerar contraseña
    const payload = {
      email: user.email,
      recover: true,
      id: user.id,
    };
    const token = await jwt.sign(payload, process.env.JWT_SECRET_TEXT, {
      expiresIn: 60 * 15, // 15 minutos
    });
    // ***Content dependara si completo o no su registro
    let content;
    let subject;
    if (user.emailConfirmed) {
      subject = `Recuperando contraseña`;
      content = `Para recuperar tu contraseña da click en el sigiente enlace o pegalo en la barra de direcciones:
      \n 
      (Este enlace solo sera valido por 15 min)
      \n 
      ${host}/recover-password/${token} `;
    } else {
      subject = `Concluye tu registro`;
      content = `
      Al parecer no habias completado tu registro. 
      \n
      Termina dando click en el siguente enlace, o pegalo en la barra de direcciones
      \n 
      (Este enlace solo sera valido por 15 min)
      \n 
      ${host}/signuo/${token} `;
    }

    // *** Enviando email

    sendEmail(user.email, subject, content);
    res.json({
      message: "Revisa tu correo para recuperar tu contraseña",
      ok: true,
      type: "emailSent",
    });
  } else {
    res.json({
      message: "Revisa tu correo para recuperar tu contraseña",
      ok: true,
      type: "emailSent",
    });
  }
};

usersCtrl.recoverPassword = async (req, res) => {
  const { email, password } = req.body;
  const { token } = req.params;
  const { id } = jwt.verify(token, process.env.JWT_SECRET_TEXT);

  // *** verificar si token esta en la lista negra

  const isInvalidToken = await InvalidToken.findOne({
    token,
  });

  // *** si el token esta en la lista negra , return ok: false}

  if (!!isInvalidToken) {
    return res.json({
      message: "El token ya no es valido",
      ok: false,
      type: "invalidToken",
    });
  } else {
    const user = await User.findById(id);
    if (user.email !== email)
      return res.json({
        message: "Credenciales invalidas",
        type: "invalidForm",
      });
    const newPassword = await user.encryptPassword(password);
    // *** agregar token a lista negra
    const newInvalidToken = new InvalidToken({ token });
    newInvalidToken.save();
    // *** actualiza usuario con nueva contraseña
    await User.findByIdAndUpdate(
      { _id: id },
      { password: newPassword },
      { new: true }
    );
    // ** Prepara token para signIn
    const payload = {
      id: user._id,
      email: user.email,
      rol: user.rol,
    };
    const newToken = await jwt.sign(payload, process.env.JWT_SECRET_TEXT);

    res.json({
      user: payload,
      message: "Contraseña actualizada",
      ok: true,
      type: "userUpdated",
      type2: "successSignIn",
      token: newToken,
    });
  }
};

usersCtrl.deleteUser = async (req, res) => {
  const userDeleted = await User.findByIdAndDelete(req.params.id);
  if (!userDeleted)
    return res.json({
      message: "este usuario no existe",
      type: "userUpdated",
      ok: false,
    });
  if (userDeleted)
    return res.json({
      message: "eliminando a " + userDeleted.email,
      type: "userUpdated",
      ok: true,
    });
};

usersCtrl.updateUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  res.json(user.email);
};

module.exports = usersCtrl;
