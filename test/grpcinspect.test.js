import test from 'ava'
import path from 'path'
import grpc from 'grpc'
import protobuf from 'protobufjs'

const gu = require('../')
const expected = require('./route_guide_expected')
const expectedNoPackage = require('./no_package_name_expected').expectedDescriptor

const BASE_PATH = path.resolve(__dirname, './protos')
const PROTO_PATH = BASE_PATH + '/route_guide.proto'
const PROTO_PATH_IMPORT = 'subdir/import.proto'
const PROTO_PATH_RELATIVE_IMPORT = BASE_PATH + '/relative_import.proto'

const loaded = grpc.load(PROTO_PATH)

test('should get full descriptor with loaded proto', t => {
  const d = gu(loaded)
  t.truthy(d)
  t.deepEqual(d, expected.expectedDescriptor)
})

test('should get full descriptor with root path specified', t => {
  const lp = grpc.load({ file: PROTO_PATH_IMPORT, root: BASE_PATH })
  const d = gu(lp)
  t.truthy(d)
  t.deepEqual(d, expected.expectedDescriptor)
})

test('should get service names', t => {
  const d = gu(loaded)
  t.truthy(d)
  t.deepEqual(d.serviceNames(), ['RouteGuide'])
})

test('should get service names given a namespace', t => {
  const d = gu(loaded)
  t.truthy(d)
  t.deepEqual(d.serviceNames('routeguide'), ['RouteGuide'])
})

test('should get empty array for service names given an unknown namespace', t => {
  const d = gu(loaded)
  t.truthy(d)
  t.deepEqual(d.serviceNames('asdf'), [])
})

test('should get namespace names', t => {
  const d = gu(loaded)
  t.truthy(d)
  t.deepEqual(d.namespaceNames(), ['routeguide'])
})

test('should get method names for a service', t => {
  const d = gu(loaded)
  t.truthy(d)
  t.deepEqual(d.methodNames('RouteGuide'), ['GetFeature', 'ListFeatures', 'RecordRoute', 'RouteChat'])
})

test('should get methods for a service', t => {
  const d = gu(loaded)
  t.truthy(d)
  t.deepEqual(d.methods('RouteGuide'), expected.expectedMethods)
})

test('should get the proto using proto()', t => {
  const proto = grpc.load(PROTO_PATH)
  const d = gu(proto)
  t.truthy(d)
  const p = d.proto()
  t.is(p, proto)
})

test('should get the client for service using client()', t => {
  const proto = grpc.load(PROTO_PATH)
  const d = gu(proto)
  t.truthy(d)
  const c = d.client('RouteGuide')
  const expected = proto.routeguide.RouteGuide
  t.is(c, expected)
})

test('should get undefined client for an unknown service using client()', t => {
  const proto = grpc.load(PROTO_PATH)
  const d = gu(proto)
  t.truthy(d)
  const c = d.client('asdf')
  t.falsy(c)
})

test('should get full descriptor with loaded proto version 6', async t => {
  t.plan(2)
  const root = await protobuf.load(PROTO_PATH)
  const loaded = grpc.loadObject(root)
  const d = gu(loaded)
  t.truthy(d)
  t.deepEqual(d, expected.expectedDescriptorPB6)
})

test('should correctly load fields from imports', async t => {
  const root = await protobuf.load(PROTO_PATH_RELATIVE_IMPORT)
  const proto = grpc.loadObject(root)
  const d = gu(proto)
  t.truthy(d)
})

test('should correctly get descriptor for proto file without package', async t => {
  const root = await protobuf.load(BASE_PATH.concat('/no-package-name.proto'))
  const proto = grpc.loadObject(root)
  const d = gu(proto)
  t.truthy(d)
  t.deepEqual(d, expectedNoPackage)
})
