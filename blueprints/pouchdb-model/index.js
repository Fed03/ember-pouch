/*jshint node:true*/
var merge = require('merge');

var EmberCliModelBlueprint = merge(true, require('ember-data/blueprints/model'));
EmberCliModelBlueprint.description = 'Generates an ember-pouch model.';

module.exports = EmberCliModelBlueprint;
