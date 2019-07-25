const { Client } = require('pg')
const { send } = require('micro')
const { router, get, post } = require('microrouter')
const url = require('url')
const redirect = require('micro-redirect')

const client = new Client({
  user: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: 5432,
  database: 'docker_test',
  password: '123',
})

client.connect()

const form = '<div><form action="/add"><input name=text><input type="submit"></form></div>'

const index = async (req, res) => {
    const result = await client.query('select * from messages')
    const messages = result.rows && result.rows.map(row => `<div>${row.text}</div>`).join('')
    const respPage = `<html><body>${form}${messages}</body></html>`
    return respPage
}

const add = async (req, res) => {
    const parts = url.parse(req.url, true)
    const result = await client.query('insert into messages values ($1)', [parts.query.text])
    redirect(res, 302, '/')
}
 
module.exports = router(
    get('/', index), 
    get('/add', add)
)

client.query("SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE  table_schema = 'public' AND table_name = 'messages')", (err, result) => {
    if (!result.rows[0].exists) {
        client.query('create table messages (text varchar(255));')
    }
})
