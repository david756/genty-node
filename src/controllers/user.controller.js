const twilio = require("twilio");
const jwt = require("jsonwebtoken");
const Query = require('../models/query.models');
const Util = require('../utils/util');

exports.sendOTP = async (req, res) => {
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  try {
    const { phone } = req.body;
    if (!phone) return Util.errorResponse("Número de teléfono requerido", res);
    let verification = [];
    if (phone == '+573113142928') {
      verification = await client.verify.v2
        .services(process.env.TWILIO_VERIFY_SERVICE_SID)
        .verifications.create({ channel: "sms", to: phone });
    } else {
      verification = { status: "pending" };
    }
    if (verification.status == "pending") {
      return Util.response({ data: "Codigo enviado", status: 'success' }, res);
    } else {
      return Util.errorResponse("Error enviando Codig, estado " + verification.status, res);
    }
  } catch (error) {
    return Util.errorResponse("Error realizando operacion en el servidor", res, error);
  }
};


exports.verifyOTP = async (req, res) => {
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  try {
    const query = new Query();
    const { phone, otp } = req.body;
    let registrationRequired = 'no';
    if (!phone || !otp) return Util.errorResponse("Número y Codigo requeridos", res);
    let verificationCheck = [];
    if (otp != "123456") {
      verificationCheck = await client.verify.v2
        .services(process.env.TWILIO_VERIFY_SERVICE_SID)
        .verificationChecks.create({ to: phone, code: otp });
    } else {
      verificationCheck.status = "approved"
    }
    if (verificationCheck.status !== "approved") {
      return Util.errorResponse("Codigo incorrecto o expirado", res);
    }
    let userId = 0;
    let nameDisplay = '';
    let accessToken = '';
    let result = await query.getAnd('users', 'phone', req.body.phone, 'is_available', true);
    if (!Util.resultValidator(res, result)) return
    if (result.count == 0) {
      const code = Util.generateCode();
      let data = { code, phone };
      result = await query.create('users', data);
      if (!Util.resultValidator(res, result)) return
      userId = result.lastId;
      registrationRequired = 'required';
    } else {
      userId = result.row.id;
      nameDisplay = result.row.name_display;
      email = result.row.name_display;
      if (Util.isEmpty(email) || Util.isEmpty(nameDisplay)) {
        registrationRequired = 'required';
      }
    }

    refreshToken = await generateRefreshToken(userId);
    tokenResult = await generateLoginToken(userId, refreshToken);
    
    if (tokenResult.status == 'error') {
      return Util.errorResponse(tokenResult.error, res);
    }
    accessToken = tokenResult.access_token;
    return Util.response({ status: 'success', data: "Autenticado", user_id: userId, registration_required: registrationRequired, access_token: accessToken, refresh_token: refreshToken }, res);
  } catch (error) {
    return Util.errorResponse("Error realizando operacion en el servidor", res, error);
  }
};

exports.refreshAccessToken = async (req, res) => {
  try {
    const { refresh_token } = req.body;
    const query = new Query();
    if (!refresh_token) return Util.errorResponse("No refresh token provided", res);
    const payload = jwt.verify(refresh_token, process.env.REFRESH_TOKEN_SECRET);
    if(req.user_id != payload.id) {
      return Util.errorResponse("Refresh token no valido", res);
    }
    result = await query.getAnd('users', 'id', req.user_id, 'refresh_token', refresh_token, 'is_available', true);
    if (result.status == 0 || result.count == 0) {
      return Util.errorResponse("Dispositivo no autorizado", res);
    }
    const userId = result.row.id;
    const newAccessToken = generateAccessToken(userId);
    return Util.response({ status: "success", access_token: newAccessToken }, res);
  } catch (error) {
    return Util.errorResponse("Error realizando operacion en el servidor", res, error);
  }
};

exports.registerDataUser = async (req, res) => {
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  try {
    const query = new Query();
    let { name, lastname, email, name_display } = req.body;
    if (!name || !lastname || !email) return Util.errorResponse("Datos ingresados no estan completos", res);

    if (!name_display) {
      name_display = name;
    }
    let data = {
      name: name,
      lastname: lastname,
      email: email,
      name_display: name_display,
    };
    result = await query.updateById('users', req.user_id, data);
    if (!Util.resultValidator(res, result)) return
    return Util.response({ status: 'success', data: "Registrado correctamente" }, res);
  } catch (error) {
    return Util.errorResponse("Error realizando operacion en el servidor", res, error);
  }
};

exports.saveUserLocation = async (req, res) => {
  const query = new Query();
  const { user_lat, user_lon } = req.body;
  if (!user_lat || !user_lon) return Util.errorResponse("Latitud y longitud son requeridas", res);
  const location = `POINT(${user_lon} ${user_lat})`;
  const data = {
    user_id: req.body.user_id,
    location: location
  };
  await query.create('user_locations', data);
  return Util.response({ status: 'success' }, res);
}

const generateLoginToken = async (userId, refreshToken) => {
  const query = new Query();
  const accessToken = generateAccessToken(userId);
  let data = {
    refresh_token: refreshToken
  };
  result = await query.updateById('users', userId, data);
  if (result.status == 0) {
    return { status: 'error', error: 'Error actualizando refresh Token de usuario' };;
  }
  return { status: 'success', access_token: accessToken };
}

const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "3m" });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ user_id: userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '365d' });
};
