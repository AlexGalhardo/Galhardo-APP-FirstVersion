const JSON_DATABASE_FILE = "./database.json";
const database = JSON.parse(fs.readFileSync(JSON_DATABASE_FILE));


module.exports = {
	database
}