const jwt = require('jsonwebtoken');
const hasherObj: {
    hash: string | null,
    _createSession: (s:string) => void,
    expire :string,
    expiry:string,
    _hash : (s:string) => string,
    _verify : (k:string) => Promise<unknown>,
    key:string | undefined
} = {
    hash: null,
    expiry : '4h',
    key : process.env.KEY ? process.env.KEY  : undefined,
    set expire(time : '1h'| '4h' | '10h' | '2d' | '7d'){
        this.expiry = time;
    },
    _createSession : function(userName: string) {
        return jwt.sign({
            data: userName
        }, this.key,{expiresIn:this.expiry})
    },
    _verify: function(key:string) {
        let _p = new Promise((resolve,reject)=>{
            if(!this.key) this.key = process.env.KEY;
            try{
                 resolve(jwt.verify(key, process.env.KEY))
            }catch (e) {
                reject(e)
            }
        })
        return _p
    },
    _hash : function(str:string){
        return jwt.sign({
            data: str
        }, this.key);
    }
}
export const hasher = Object.create(hasherObj);