import { createDatabase } from 'db0';
import { createStorage } from 'unstorage';
import dbDriver from 'unstorage/drivers/db0';
import libSql from 'db0/connectors/libsql/node';
import memoryDriver from 'unstorage/drivers/memory';

export const db = createDatabase(libSql({ url: 'file:db/local.db' }));

export const vrcKV = createStorage({
	driver: dbDriver({
		database: db,
		tableName: 'vrc'
	})
});

export const ratelimitKV = createStorage({
	driver: memoryDriver() // this contains IPs so we shouldn't persist it
}); 
