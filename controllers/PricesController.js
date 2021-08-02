const bodyParser = require('body-parser');
const DateTime = require('../helpers/DateTime');

const stripe = require('stripe')(process.env.STRIPE_SK_TEST);

const PricesController = {
	getViewCreate: (req, res) => {
		res.render('pages/prices/create');
	},
	postCreatePrice: async (req, res) => {
		const price_amount = req.body.price_amount;
		const price_currency = req.body.price_currency;
		const price_recurring = req.body.price_recurring;
		const product_id = req.body.product_id;

		console.log(product_id)
		
		const price = await stripe.prices.create({
  			unit_amount: price_amount,
  			currency: price_currency,
  			recurring: {interval: price_recurring},
  			product: product_id
		});

		price.created = DateTime.getDateTime(price.created);

		res.render('pages/prices/create', {
			flash: {
				type: 'success',
				message: 'Price Created With Success!'
			},
			price
		});
	},
	getViewRetrieve: (req, res) => {
		res.render('pages/prices/retrieve');
	},
	postRetrievePrice: async (req, res) => {
		const price_id = req.body.price_id;
		
		const price = await stripe.prices.retrieve(
  			price_id
		);

		price.created = DateTime.getDateTime(price.created);

		res.render('pages/prices/retrieve', {
			flash: {
				type: 'success',
				message: 'Price Exists!'
			},
			price
		});
	},
	getViewListAll: async (req, res) => {
		const prices = await stripe.prices.list({
  			limit: 10,
		});

		let lastPricesCreated = prices.data.length;

		prices.data.forEach(function(price){
			price.created = DateTime.getDateTime(price.created);
		})

		res.render('pages/prices/listAll', {
			lastPricesCreated,
			prices: prices.data,
		});
	}
};

module.exports = PricesController;