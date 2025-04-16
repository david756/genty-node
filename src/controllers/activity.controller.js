const jwt = require("jsonwebtoken");
const Query = require('../models/query.models');
const Activity = require('../models/activity.model');
const Util = require('../utils/util');

exports.createPost = async (req, res) => {
    try {
        const { lat, lon, description, user_lat, user_lon, user_id } = req.body;

        if (!lat || !lon || !description || !user_lat || !user_lon) {
            return Util.errorResponse("Faltan campos requeridos", res);
        }

        const query = new Query();
        const location = `POINT(${lon} ${lat})`;
        const user_location = `POINT(${user_lon} ${user_lat})`;
        const code = Util.generateCode();

        const data = {
            location,
            description,
            user_id,
            user_location,
            code
        };
        result = await query.create('posts', data);
        if (!Util.resultValidator(res, result)) return
        return Util.response({ status: "success", data: "Se creo publicacion exitosamente" }, res);
    } catch (error) {
        return Util.errorResponse("Error realizando operacion en el servidor", res, error);
    }
};
exports.getPost = async (req, res) => {
    try {
        const { user_lat, user_lon, code } = req.body;
        if (!user_lat || !user_lon || !code) {
            return Util.errorResponse("Faltan campos requeridos", res);
        }
        const query = new Activity();
        result = await query.getPost(req.body, 'posts');
        if (!Util.resultValidator(res, result)) return
        return Util.response({ status: "success", data: result.content }, res);
    } catch (error) {
        return Util.errorResponse("Error realizando operacion en el servidor", res, error);
    }
};


exports.getPostList = async (req, res) => {
    try {
        const { lat, lon } = req.body;
        if (!lat || !lon) {
            return Util.errorResponse("Faltan campos requeridos", res);
        }
        const query = new Activity();
        data= req.body;
        data.limit = 5;
        result = await query.getPostList(data, 'posts');
        if (!Util.resultValidator(res, result)) return
        return Util.response({ status: "success", data: result.content }, res);
    } catch (error) {
        return Util.errorResponse("Error realizando operacion en el servidor", res, error);
    }
};

exports.createEvent = async (req, res) => {
    try {
        const { lat, lon, description, user_lat, user_lon, user_id, event_category_id } = req.body;

        if (!lat || !lon || !description || !user_lat || !user_lon || !event_category_id) {
            return Util.errorResponse("Faltan campos requeridos", res);
        }

        const query = new Query();
        const location = `POINT(${lon} ${lat})`;
        const user_location = `POINT(${user_lon} ${user_lat})`;
        const code = Util.generateCode();

        const data = {
            location,
            description,
            user_id,
            user_location,
            event_category_id,
            code
        };
        result = await query.create('events', data);
        if (!Util.resultValidator(res, result)) return
        return Util.response({ status: "success", data: "Se creo evento exitosamente" }, res);
    } catch (error) {
        return Util.errorResponse("Error realizando operacion en el servidor", res, error);
    }
};

exports.getEvent = async (req, res) => {
    try {
        const { user_lat, user_lon, code } = req.body;
        if (!user_lat || !user_lon || !code) {
            return Util.errorResponse("Faltan campos requeridos", res);
        }
        const query = new Activity();
        result = await query.getEvent(req.body, 'posts');
        if (!Util.resultValidator(res, result)) return
        return Util.response({ status: "success", data: result.content }, res);
    } catch (error) {
        return Util.errorResponse("Error realizando operacion en el servidor", res, error);
    }
};


exports.getEventList = async (req, res) => {
    try {
        const { lat, lon } = req.body;
        if (!lat || !lon) {
            return Util.errorResponse("Faltan campos requeridos", res);
        }
        const query = new Activity();
        data= req.body;
        data.limit = 5;
        result = await query.getEventList(data, 'posts');
        if (!Util.resultValidator(res, result)) return
        return Util.response({ status: "success", data: result.content }, res);
    } catch (error) {
        return Util.errorResponse("Error realizando operacion en el servidor", res, error);
    }
};

exports.getPostMarkerList = async (req, res) => {
    try {
        const { lat, lon } = req.body;
        if (!lat || !lon) {
            return Util.errorResponse("Faltan campos requeridos", res);
        }
        const query = new Activity();
        data= req.body;
        data.limit = 20;
        result = await query.getPostList(data, 'posts');        
        if (!Util.resultValidator(res, result)) return

        result.content = result.content.map((item) => {
            if (item.count_likes > item.count_dislikes) {
                item.icon = "icon_like";
            } else if (item.count_likes < item.count_dislikes) {
                item.icon = "icon_dislike";
            } else {
                item.icon = "icon_neutral";
            }
            return item;
        });


        return Util.response({ status: "success", data: result.content }, res);
    } catch (error) {
        return Util.errorResponse("Error realizando operacion en el servidor", res, error);
    }
};

exports.getEventMarkerList = async (req, res) => {
    try {
        const { lat, lon } = req.body;
        if (!lat || !lon) {
            return Util.errorResponse("Faltan campos requeridos", res);
        }
        const query = new Activity();
        data= req.body;
        data.limit = 20;
        result = await query.getEventList(data, 'posts');        
        if (!Util.resultValidator(res, result)) return

        result.content = result.content.map((item) => {
            if (item.count_likes > item.count_dislikes) {
                item.icon = "icon_like";
            } else if (item.count_likes < item.count_dislikes) {
                item.icon = "icon_dislike";
            } else {
                item.icon = "icon_neutral";
            }
            return item;
        });


        return Util.response({ status: "success", data: result.content }, res);
    } catch (error) {
        return Util.errorResponse("Error realizando operacion en el servidor", res, error);
    }
};


exports.getComments = async (req, res) => {
    try {
        const { reference_id } = req.body;
        if (!reference_id) {
            return Util.errorResponse("Faltan campos requeridos", res);
        }
        const query = new Activity();
        result = await query.getComments(req.body, 'comments');
        if (!Util.resultValidator(res, result)) return
        return Util.response({ status: "success", data: result.content }, res);
    } catch (error) {
        return Util.errorResponse("Error realizando operacion en el servidor", res, error);
    }
};

exports.saveComment = async (req, res) => {
    try {
        const { reference_id, reference_type, description, user_lat, user_lon, user_id } = req.body;

        if (!reference_id || !reference_type || !description || !user_lat || !user_lon) {
            return Util.errorResponse("Faltan campos requeridos", res);
        }

        const query = new Query();
        const activity = new Activity();
        const user_location = `POINT(${user_lon} ${user_lat})`;
        const date = new Date().toISOString();

        const data = {
            reference_id,
            reference_type,
            description,
            user_id,
            user_location,
            date
        };

        let result = await query.create('comments', data);
        if (!Util.resultValidator(res, result)) return

        result = await activity.updateCountComments(data, 'posts');
        if (!Util.resultValidator(res, result)) return

        return Util.response({ status: "success", data: "Se creo comentario exitosamente" }, res);
    } catch (error) {
        return Util.errorResponse("Error realizando operacion en el servidor", res, error);
    }
}

exports.saveViewed = async (req, res) => {
    try {
        const { ids, reference_type, user_lat, user_lon, user_id } = req.body;
        if (!ids || !reference_type || !user_lat || !user_lon) {
            return Util.errorResponse("Faltan campos requeridos", res);
        }

        const query = new Activity();
        const user_location = `POINT(${user_lon} ${user_lat})`;
        const timestamp = new Date().toISOString();

        const data = {
            reference_type,
            user_id,
            user_location,
            ids,
            timestamp
        };

        result = await query.saveViewed(data, 'posts');
        if (!Util.resultValidator(res, result)) return
        return Util.response({ status: "success", data: result.content }, res);
    } catch (error) {
        return Util.errorResponse("Error realizando operacion en el servidor", res, error);
    }
};

exports.saveLikeDislike = async (req, res) => {
    try {
        const { reference_id, reference_type, user_lat, user_lon, user_id } = req.body;
        let like_type = req.body.like_type;

        if (!reference_id || !reference_type || !user_lat || !user_lon) {
            return Util.errorResponse("Faltan campos requeridos", res);
        }

        const query = new Query();
        const user_location = `POINT(${user_lon} ${user_lat})`;
        const date = new Date().toISOString();

        const conditions = {
            reference_type,
            reference_id,
            user_id
        };
        result = await query.deleteByMultipleKeys('likes', conditions);
        if (!Util.resultValidator(res, result)) return

        if (like_type == 1) {
            like_type = 'like';
        } else if (like_type == 2) {
            like_type = 'dislike';
        }

        if (like_type == 'like' || like_type == 'dislike') {
            const data = {
                reference_type,
                reference_id,
                user_id,
                user_location,
                like_type,
                date
            };
            result = await query.create('likes', data);
            if (!Util.resultValidator(res, result)) return
        }

        const activity = new Activity();
        result = await activity.updateCountLikes(req.body, 'likes');
        if (!Util.resultValidator(res, result)) return
        return Util.response({ status: "success" }, res);
    } catch (error) {
        return Util.errorResponse("Error realizando operacion en el servidor", res, error);
    }
};

exports.getFlagTypes= async (req, res) => {
    try {
        const query = new Query();
        result = await query.getByKey('flag_types', 'is_available', true);
        if (!Util.resultValidator(res, result)) return
        return Util.response({ status: "success", data: result.content }, res);
    } catch (error) {
        return Util.errorResponse("Error realizando operacion en el servidor", res, error);
    }
};

exports.saveFlag = async (req, res) => {
    try {
        const { reference_id, reference_type, description, user_lat, user_lon, user_id ,flag_type_id} = req.body;

        if (!reference_id || !reference_type || !description || !user_lat || !user_lon || !flag_type_id) {
            return Util.errorResponse("Faltan campos requeridos", res);
        }

        const query = new Query();
        const activity = new Activity();
        const user_location = `POINT(${user_lon} ${user_lat})`;
        const date = new Date().toISOString();

        const data = {
            reference_id,
            reference_type,
            description,
            user_id,
            user_location,
            date,
            flag_type_id
        };

        let result = await query.create('flags', data);
        if (!Util.resultValidator(res, result)) return

        return Util.response({ status: "success", data: "Se envío el reporte exitosamente" }, res);
    } catch (error) {
        return Util.errorResponse("Error realizando operacion en el servidor", res, error);
    }
}
