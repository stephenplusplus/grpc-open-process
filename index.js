'use strict'

const googleAuth = require('google-auto-auth')
const googleProtos = require('google-proto-files')
const grpc = require('grpc')
const path = require('path')

var service

googleAuth({
  scopes: ['https://www.googleapis.com/auth/datastore'],

  // $ gcloud beta auth application-default login
  //      OR
  // uncomment with path to service account JSON key file
  // keyFile: '/path/to/service/account/keyfile.json'
}).getAuthClient((err, authClient) => {
  if (err) throw err

  const proto = grpc.load({
    root: googleProtos('..'),
    file: path.relative(googleProtos('..'), googleProtos.datastore.v1beta3)
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
    projectId: 'does-not-need-to-be-replaced'
  }

  service.lookup(reqOpts, {
    // process exits :)
    // deadline: Date.now(),

    // process does not exit :(
    // deadline: Date.now() + 10
  }, err => {
    if (err) console.log(err)
  })
}
