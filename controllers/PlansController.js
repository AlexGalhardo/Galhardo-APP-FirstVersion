/**
 * GALHARDO APP
 * Created By © Alex Galhardo  | August 2021-Present
 * aleexgvieira@gmail.com
 * https://github.com/AlexGalhardo
 * 
 * 
 * http://localhost:3000/plans
 */

const bodyParser = require('body-parser');

// helpers
const DateTime = require('../helpers/DateTime');
const NodeMailer = require('../helpers/NodeMailer');

// models
const Users = require('../models/JSON/Users');

const stripe = require('stripe')(`${process.env.STRIPE_SK_TEST}`);

const plan_premium = 'plan_JxJMW54dmkHkfF';



class PlansController {

	static getViewPlans (req, res) {
		res.render('pages/plans/plans', {
			user: SESSION_USER,
			navbar_plans_active: true
		});
	}

	static async createStripeSubscription(customer_id, plan_id) {
		const subscription = await stripe.subscriptions.create({
			customer: customer_id,
		  	items: [
		    	{price: plan_id},
		  	],
		});

		subscription.created = DateTime.getDateTime(subscription.created);
		subscription.current_period_end = DateTime.getDateTime(subscription.current_period_end);
		subscription.current_period_start = DateTime.getDateTime(subscription.current_period_start);

		// save transaction into JSON database
		const subsSaved = await Users.createStripeSubscription(SESSION_USER.id, subscription)
	
		return subscription
	}

	static async createStripeCard(customer_id, 
									card_number, 
									card_exp_month, 
									card_exp_year, 
									card_cvc) {
		const cardToken = await stripe.tokens.create({
		 	card: {
		    	number: card_number,
		   		exp_month: card_exp_month,
		    	exp_year: card_exp_year,
		    	cvc: card_cvc,
		  	},
		});

		const card = await stripe.customers.createSource(
		  	customer_id,
		  	{source: cardToken.id}
		);

		// save transaction into JSON database
		const cardSaved = await Users.createStripeCard(SESSION_USER.id, cardToken.id, card.id)

		return card
	}

	static async verifySubscription(req){
		const { customer_stripe_card_id,
				customer_email, 
				card_number, 
				card_exp_year,
				card_exp_month,
				card_cvc } = req.body

		
		// IF CUSTOMER IS ALREADY REGISTRED IN STRIPE AND HAVE A CREDIT CARD
		if(customer_stripe_card_id){
			const subscription = await PlansController.createStripeSubscription(SESSION_USER.stripe.customer_id, 'plan_JxJMW54dmkHkfF')

			return subscription
		} 
		
		// CUSTOMER IS REGISTRED IN STRIPE, BUT NOT HAVE A CREDIT CARD REGISTRED YET
		else if(SESSION_USER.stripe.customer_id){

			const cardCreated = await PlansController.createStripeCard(
					SESSION_USER.stripe.customer_id, 
					card_number, 
					card_exp_month, 
					card_exp_year, 
					card_cvc
				)

			const subscription = 
				await PlansController.createStripeSubscription(
					SESSION_USER.stripe.customer_id, 
					'plan_JxJMW54dmkHkfF'
				)

			return subscription
		}

		// NEED TO REGISTER CUSTOMER AND CREDIT CARD IN STRIPE
		else {
			const customer = await stripe.customers.create({
	  			description: 'Customer created in Subscription checkout!',
	  			email: customer_email
			});

			// save customer into json database
			const customerSaved = await Users.createStripeCustomer(SESSION_USER.id, customer.id)

			const cardCreated = await PlansController.createStripeCard(
					customer.id, 
					card_number, 
					card_exp_month, 
					card_exp_year, 
					card_cvc
				)

			const subscription = 
				await PlansController.createStripeSubscription(
					customer.id, 
					'plan_JxJMW54dmkHkfF'
				)

			return subscription
		}
	}

	static async getViewPlanStarterCheckout (req, res) {
		if(!req.session.userID){
	      	return res.render('pages/plans', {
	      		flash: {
	      			type: "warning",
	      			message: "You Must Be Logued To Make A Subscription Transaction!"
	      		}
	      	})
	  	}

		res.render('pages/plans/plan_checkout', {
			user: SESSION_USER,
			navbar_plans_active: true
		});
	}

	static async getViewPlanProCheckout (req, res) {
		if(!req.session.userID){
	      	return res.render('pages/plans', {
	      		flash: {
	      			type: "warning",
	      			message: "You Must Be Logued To Make A Subscription Transaction!"
	      		}
	      	})
	  	}

		res.render('pages/plans/plan_checkout', {
			user: SESSION_USER,
			navbar_plans_active: true
		});
	}

	static async getViewPlanPremiumCheckout (req, res) {
		if(!req.session.userID){
	      	return res.render('pages/plans', {
	      		flash: {
	      			type: "warning",
	      			message: "You Must Be Logued To Make A Subscription Transaction!"
	      		}
	      	})
	  	}

	  	// user is already stripe customer and have a stripe card registred also
	  	let customer_stripe_card_id = null
	  	if(SESSION_USER.stripe.customer_id && SESSION_USER.stripe.card_id){
	  		customer_stripe_card_id = SESSION_USER.stripe.card_id
	  	}

		res.render('pages/plans/premium_checkout', {
			user: SESSION_USER,
			navbar_plans_active: true,
			customer_stripe_card_id
		});
	}

	static async postPlanPremiumPayLog (req, res) {

		if(!req.session.userID){
        	return res.render('pages/plans/plans', {
        		flash: {
        			type: "danger",
        			message: "You Must Be Logued To Make A Subscription Transaction!"
        		}
        	})
    	}

    	const divPlanBanner = `
		<div class="card mb-4 rounded-3 shadow-sm text-center">
            <div class="card-header py-3 bg-info">
                <h4 class="my-0 fw-normal">Plan PREMIUM</h4>
            </div>
            
            <div class="card-body">
                <h1 class="card-title pricing-card-title">$ 4.99<small class="text-muted fw-light">/month</small></h1>
                <ul class="list-unstyled mt-3 mb-4">
                    <li>✔️ Support via Telegram/WhatsApp</li>
                    <li>✔️ Ilimited Recomendations</li>
                    <li>✔️ Get news in email</li>
                </ul>
            </div>

        </div>
        `

    	if(SESSION_USER.stripe.currently_subscription_name !== "FREE"){
    		return res.render('pages/plans/premium_checkout', {
        		flash: {
        			type: "warning",
        			message: `You already have a currently plan ${SESSION_USER.stripe.currently_subscription_name} active! Wait until it ends to make a new subscription transaction!`
        		},
        		user: SESSION_USER,
				navbar_plans_active: true,
				divPlanBanner
        	})
    	}

    	const subscription = await PlansController.verifySubscription(req)

		res.render('pages/plans/planPayLog', {
			flash: {
				type: 'success',
				message: 'Subscription Created with Success!'
			},
			subscription,
			user: SESSION_USER,
			navbar_plans_active: true,
			divPlanBanner
		});
	}
};

module.exports = PlansController;