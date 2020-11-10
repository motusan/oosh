/**
 * Default model configuration
 * (sails.config.models)
 *
 * Unless you override them, the following properties will be included
 * in each of your models.
 *
 * For more info on Sails models, see:
 * http://sailsjs.org/#!/documentation/concepts/ORM
 */

module.exports.models = {

  /***************************************************************************
  *                                                                          *
  * Your app's default connection. i.e. the name of one of your app's        *
  * connections (see `config/connections.js`)                                *
  *                                                                          *
  ***************************************************************************/
  // connection: 'localDiskDb',
    connection: 'locomongo',
  /***************************************************************************
  *                                                                          *
  * How and whether Sails will attempt to automatically rebuild the          *
  * tables/collections/etc. in your schema.                                  *
  *                                                                          *
  * See http://sailsjs.org/#!/documentation/concepts/ORM/model-settings.html  *
  *                                                                          *
  ***************************************************************************/
  // migrate: 'alter'
  migrate: 'safe',

    // for waterline/sails 1.0 (https://sailsjs.com/documentation/upgrading/to-v-1-0#?changes-to-create-createeach-update-and-destroy-results)
    fetchRecordsOnUpdate: true,
    fetchRecordsOnDestroy: true,
    fetchRecordsOnCreate: true,
    fetchRecordsOnCreateEach: true
};
