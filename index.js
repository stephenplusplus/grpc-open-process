'use strict'

const googleAuth = require('google-auto-auth')
const googleProtos = require('google-proto-files')
const grpc = require('grpc')
const relative = require('path').relative

const BASE_MEMORY = getMemory()

var service
var memoryUsage
var numRequestsMade = 0

googleAuth({
  scopes: ['https://www.googleapis.com/auth/datastore']
}).getAuthClient((err, authClient) => {
  if (err) throw err

  const proto = grpc.load({
    root: googleProtos('..'),
    file: relative(googleProtos('..'), googleProtos.datastore.v1beta3)
  }, 'proto', { binaryAsBase64: true, convertFieldsToCamelCase: true })

  service = new proto.google.datastore.v1beta3.Datastore(
    'datastore.googleapis.com',
    grpc.credentials.combineChannelCredentials(
      grpc.credentials.createSsl(),
      grpc.credentials.createFromGoogleCredential(authClient)
    )
  )

  main()
})

function main() {
  var loop = setInterval(() => {
    makeRequest()

    if (numRequestsMade === 50 * 1000) {
      console.log('Calling gc')
      clearInterval(loop)
      global.gc()
    }
  }, 1)
}

function makeRequest() {
  numRequestsMade++

  const reqOpts = {
    keys: [
      {
        path: [
          {
            kind: 'test',
            name: 'test'
          }
        ]
      }
    ],
    projectId: process.env.GCLOUD_PROJECT
  }

  service.lookup(reqOpts, {}, err => {
    if (err) throw err
  })
}

function getMemory() {
  return Math.round(process.memoryUsage().heapUsed / 1000000)
}

function logMemoryUsage() {
  console.log('Memory usage:', getMemory() - BASE_MEMORY + ' mb')
}

setInterval(() => {
  memoryUsage = getMemory()
  console.log('Num requests:', numRequestsMade)
  logMemoryUsage()
  console.log('...')
}, 1000)
