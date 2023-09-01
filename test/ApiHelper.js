const axios = require("axios");

class ApiHelper {
    static coinGeckoApiEndpoint = "https://api.coingecko.com/api/v3";

    static async getCoinGeckoTokenPrices(tokenNames, vsCurrencies, include24hrChange = true) {
        const tokens = tokenNames.join(",");
        const priceUri = `${ApiHelper.coinGeckoApiEndpoint}/simple/price?ids=${tokens}&vs_currencies=${vsCurrencies}&include_24hr_change=${include24hrChange}`;

        const response = await axios.get(priceUri);
        return response.data;
    }
}

module.exports = ApiHelper;
