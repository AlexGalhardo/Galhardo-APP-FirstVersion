/**
 * GALHARDO APP
 * Created By © Alex Galhardo  | August 2021-Present
 * aleexgvieira@gmail.com
 * https://github.com/AlexGalhardo
 * 
 * 
 * http://localhost:3000/
 */

import { validationResult } from "express-validator"

// HELPERS
import NodeMailer from '../helpers/NodeMailer.js'
import TelegramBOTLogger from '../helpers/TelegramBOTLogger.js'
import Header from '../helpers/Header.js'

// MODELS
import Users from '../models/MYSQL/Users.js'
import Games from '../models/MYSQL/Games.js'
import Books from '../models/MYSQL/Books.js'


// PAGARME
import { PagarME } from '../helpers/PagarME.js'



class AppController {

    static async getViewHome (req, res) {
        const game = await Games.getRandom()
        const totalGames = await Games.getTotal()
        const totalBooks = await Books.getTotal()

        return res.render('pages/home', {
            flash_success: req.flash('success'),
            flash_warning: req.flash('warning'),
            game,
            totalGames,
            totalBooks,
            user: SESSION_USER,
            app_url: process.env.APP_URL,
            header: Header.games()
        });
    }

    static async getViewBooks (req, res){
        const book = await Books.getRandom()
        const totalGames = await Games.getTotal()
        const totalBooks = await Books.getTotal()

        return res.render('pages/books', {
            flash_success: req.flash('success'),
            flash_warning: req.flash('warning'),
            book,
            totalGames,
            totalBooks,
            user: SESSION_USER,
            app_url: process.env.APP_URL,
            header: Header.books()
        });
    }

    static async getAddGameToUserShopCart(req, res){
        const { user_id, game_id } = req.params
        const response = await Users.createGameIntoShopCart(user_id, parseInt(game_id))
        return res.json(response)
    }


    static getViewContact (req, res){
        res.render('pages/contact', {
            flash_success: req.flash('success'),
            flash_warning: req.flash('warning'),
            user: SESSION_USER,
            header: Header.contact(),
            captcha: res.recaptcha,
            csrfToken: req.csrfToken()
        });
    }


    static async postContact (req, res){
        try {

            const errors = validationResult(req);

            if (!req.recaptcha.error) {
                if (!errors.isEmpty()) {
                    req.flash('warning', `${errors.array()[0].msg}`)
                    return res.redirect('/contato')
                }
            } else {
                req.flash('warning', `Invalid Recaptcha!`)
                return res.redirect('/contato')
            }

            const { name,
                    email,
                    subject,
                    message } = req.body;

            const contactObject = {
                name,
                email,
                subject,
                message
            }

            await NodeMailer.sendContact(contactObject)
            await TelegramBOTLogger.logContact(contactObject)

            req.flash('success', 'Message Send!')
            return res.redirect('/contato')
        }
        catch(error){
            throw new Error(error)
        }
    }


    static getViewPrivacy (req, res){
        return res.render('pages/privacidade', {
            user: SESSION_USER,
            header: Header.privacy()
        });
    }


    static async getSearchGameTitle(req, res){
        const searchGameTitle = req.query.title;

        if(!searchGameTitle){
            return res.redirect('/')
        }

        const searchedGames  = await Games.searchTitle(searchGameTitle)

        if(!searchedGames.length){
            req.flash('warning', `Nenhum jogo encontrado pela pesquisa: ${searchGameTitle}! Recomendando um jogo aleatório`)
            return res.redirect('/')
        }

        if(searchedGames.length > 1){
            searchedGames[0].firstGame = true
            return res.render('pages/home', {
                flash_success: `${searchedGames.length} Jogos encontrados na pesquisa: ${searchGameTitle.toUpperCase()}`,
                games: searchedGames,
                user: SESSION_USER,
                header: Header.games()
            });
        }

        return res.render('pages/home', {
            flash_success: `1 Jogo encontrado na pesquisa: ${searchGameTitle.toUpperCase()}`,
            game: searchedGames[0],
            user: SESSION_USER,
            header: Header.games()
        });
    }



    static async getSearchBookTitle(req, res){
        const searchBookTitle = req.query.title;

        if(!searchBookTitle){
            return res.redirect('/books')
        }

        const searchedBooks  = await Books.searchTitle(searchBookTitle)

        if(!searchedBooks.length){
            req.flash('warning', `No books found from search: ${searchBookTitle}! Recommending a Random Book`)
            return res.redirect('/books')
        }

        if(searchedBooks.length > 1){
            searchedBooks[0].firstBook = true
            return res.render('pages/books', {
                flash_success: `${searchedBooks.length} Books Found For Search Title: ${searchBookTitle.toUpperCase()}`,
                books: searchedBooks,
                user: SESSION_USER,
                header: Header.books()
            });
        }

        return res.render('pages/books', {
            flash_success: `1 Book Found From Search Title: ${searchBookTitle.toUpperCase()}`,
            book: searchedBooks[0],
            user: SESSION_USER,
            header: Header.books()
        });
    }


    static async recommendGame(req, res){
        const { game_id, user_id } = req.params
        const response = await Games.userRecommend(user_id, parseInt(game_id))
        return res.json(response)
    }


    static async dontRecommendGame(req, res){
        const { game_id, user_id } = req.params
        const response = await Games.userNotRecommend(user_id, parseInt(game_id))
        return res.json(response)
    }


    static async recommendBook(req, res){
        const { book_id, user_id } = req.params
        const response = await Books.userRecommend(user_id, parseInt(book_id))
        return res.json(response)
    }


    static async dontRecommendBook(req, res){
        const { book_id, user_id } = req.params
        const response = await Books.userNotRecommend(user_id, parseInt(book_id))
        return res.json(response)
    }


    static async getPagarMECheckoutByGameID(req, res){
        try {
            const { game_id } = req.params
            const pagarMECheckoutURL = await PagarME.getCheckoutLinkByGameID(game_id)

            return res.redirect(303, pagarMECheckoutURL)
        } catch(error){
            throw new Error(error)
        }
    }
};

export default AppController;
