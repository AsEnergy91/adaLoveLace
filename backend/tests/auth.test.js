import { test } from 'node:test'
import assert from 'node:assert'
import jwt from 'jsonwebtoken'

process.env.JWT_SECRET = 'secret_de_test'
const { default: authMiddleware } = await import('../middleware/auth.js')

function fakeRes() {
  return {
    code: null, body: null,
    status(c) { this.code = c; return this },
    json(b) { this.body = b; return this },
  }
}

test('refuse une requete sans header Authorization', () => {
  const req = { headers: {} }
  const res = fakeRes()
  let passed = false
  authMiddleware(req, res, () => { passed = true })
  assert.strictEqual(res.code, 401)
  assert.strictEqual(passed, false)
})

test('refuse un token falsifie', () => {
  const req = { headers: { authorization: 'Bearer token.bidon.falsifie' } }
  const res = fakeRes()
  let passed = false
  authMiddleware(req, res, () => { passed = true })
  assert.strictEqual(res.code, 401)
  assert.strictEqual(passed, false)
})

test('laisse passer un token valide et pose req.user', () => {
  const token = jwt.sign({ id: 'u1', email: 'test@test.com' }, process.env.JWT_SECRET)
  const req = { headers: { authorization: 'Bearer ' + token } }
  const res = fakeRes()
  let passed = false
  authMiddleware(req, res, () => { passed = true })
  assert.strictEqual(passed, true)
  assert.strictEqual(req.user.id, 'u1')
})