const { v4: uuidv4 } = require('uuid');

class Util {
    // use:
    // if (!resultValidator(res, result)) return
    static resultValidator(res, result) {
        if (result.status === 0) {
            this.errorResponse(result.content,res);
            return false;
        }
        return true;
    }
    // use:
    // if (!resultValidatorCount(res, result)) return
    static resultValidatorCount(res, result) {
        if (result.status === 0 || result.count === 0) {
            let error = `No se encontraron resultados`;
            if (result.table !== undefined && result.table !== "") {
                error = `No se encontraron resultados para ${result.table}`;
            }
            this.errorResponse(error,res);
            return false;
        }
        return true;
    }

    static isEmpty(str) {
        return !str || str.trim() === "";
    }


    static response(data,res){
        if(data===undefined|| data==null){
            data='';
        }
        res.status(200).json(data);
        return res;
    }

    static errorResponse(texto,res, error){        
        console.error("Error server 502 APP: "+texto);
        res.status(502).json(texto);
        if (error !== undefined && error !== null) {
            console.error(error);
        }
        return res;
    }

    static generateCode() {
        return uuidv4().replace(/-/g, '').substring(0, 9);
    }
}
module.exports = Util;