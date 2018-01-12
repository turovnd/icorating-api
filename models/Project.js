const orm = require('orm');

let Model = {
    id          : Number,
    name        : String,
    ticker      : String,
    wallets     : String,
    priceBTC    : Number,
    priceETH    : Number,
    priceUSD    : Number,
    dt_update   : Date,
    dt_create   : Date
};

let Methods = {
    methods: {
        toJSON : function () {
            return {
                id: this.id,
                name: this.name,
                ticker: this.ticker,
                wallets: this.wallets,
                priceBTC: this.priceBTC,
                priceETH: this.priceETH,
                priceUSD: this.priceUSD,
                dt_update: this.dt_update,
                dt_create: this.dt_create
            }
        }
    },
    validations: {
        name    : orm.validators.notEmptyString("Empty name"),
        ticker  : orm.validators.notEmptyString("Empty ticker"),
        wallets : orm.validators.notEmptyString("Empty wallets"),
    }
};

module.exports = {
    model: Model,
    methods: Methods
};